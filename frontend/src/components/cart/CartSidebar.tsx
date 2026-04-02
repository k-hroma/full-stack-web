/**
 * CartSidebar - Drawer lateral del carrito de compras
 * Usa CSS visibility en lugar de mount/unmount para preservar el estado del formulario.
 * @module components/cart/CartSidebar
 */

import { useState, useEffect, useCallback } from 'react';
import { useCart } from '../../hooks/useCart';
import type { Book } from '../../types';
import emailjs from '@emailjs/browser';
import '../../styles/components/cart-sidebar.css';

interface CartSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const WHATSAPP_NUMBER = import.meta.env.VITE_WHATSAPP_NUMBER || '';
const EMAILJS_SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID || '';
const EMAILJS_TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID || '';
const EMAILJS_PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY || '';

export function CartSidebar({ isOpen, onClose }: CartSidebarProps) {
  const {
    items,
    itemCount,
    totalPrice,
    removeFromCart,
    updateQuantity,
    clearCart,
  } = useCart();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [showEmailForm, setShowEmailForm] = useState(false);

  // Tecla Escape cierra el sidebar
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Bloquear scroll del body cuando el sidebar está abierto
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  const generateOrderText = useCallback((): string => {
    const lines = items.map(
      item => `- ${item.book.title} (${item.quantity}x) - $${item.book.price * item.quantity}`
    );
    return `Hola! Quiero comprar:\n\n${lines.join('\n')}\n\nTotal: $${totalPrice}`;
  }, [items, totalPrice]);

  const generateWhatsAppMessage = useCallback(
    () => encodeURIComponent(generateOrderText()),
    [generateOrderText]
  );

  const sendEmail = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!customerName || !customerEmail) return;

    setIsSubmitting(true);
    setSubmitStatus('idle');

    try {
      await emailjs.send(
        EMAILJS_SERVICE_ID,
        EMAILJS_TEMPLATE_ID,
        {
          from_name: customerName,
          from_email: customerEmail,
          message: generateOrderText(),
          total: `$${totalPrice}`,
          item_count: itemCount,
        },
        EMAILJS_PUBLIC_KEY
      );

      setSubmitStatus('success');
      setTimeout(() => {
        clearCart();
        onClose();
        setShowEmailForm(false);
        setCustomerName('');
        setCustomerEmail('');
        setSubmitStatus('idle');
      }, 2000);
    } catch (error) {
      console.error('Error al enviar:', error);
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const whatsappUrl = WHATSAPP_NUMBER
    ? `https://wa.me/${WHATSAPP_NUMBER}?text=${generateWhatsAppMessage()}`
    : '#';

  // ── CSS-based visibility: NO hay early return por isOpen ──────────────────
  // El componente siempre está montado → el estado del formulario persiste.
  return (
    <>
      {/* Overlay: visible solo cuando isOpen */}
      <div
        className={`cart-sidebar__overlay ${isOpen ? 'cart-sidebar__overlay--open' : ''}`}
        onClick={onClose}
        aria-hidden={!isOpen}
      />

      <aside
        className={`cart-sidebar ${isOpen ? 'cart-sidebar--open' : 'cart-sidebar--closed'}`}
        role="dialog"
        aria-modal="true"
        aria-label="Carrito de compras"
        aria-hidden={!isOpen}
      >
        {/* Header */}
        <div className="cart-sidebar__header">
          <h2 className="cart-sidebar__title">
            Carrito de compras ({itemCount})
          </h2>
          <button
            onClick={onClose}
            className="cart-sidebar__close"
            aria-label="Cerrar carrito"
          >
            ×
          </button>
        </div>

        {/* Contenido */}
        {items.length === 0 ? (
          <div className="cart-sidebar__empty">
            <p>Tu carrito está vacío</p>
            <button onClick={onClose} className="cart-sidebar__continue">
              Seguir comprando
            </button>
          </div>
        ) : showEmailForm ? (
          /* FORMULARIO EMAIL — estado persiste al cerrar/abrir */
          <div className="cart-sidebar__form-container">
            <h3 className='cart-sidebar__form-subtitle'>Detalle de la compra</h3>

            <form onSubmit={sendEmail} className="cart-sidebar__form">
              <div className="form-group">
                <label htmlFor="name">Nombre completo *</label>
                <input
                  id="name"
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  required
                  placeholder="Tu nombre"
                  disabled={isSubmitting}
                  autoComplete="name"
                />
              </div>

              <div className="form-group">
                <label htmlFor="email">Email *</label>
                <input
                  id="email"
                  type="email"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  required
                  placeholder="tu@email.com"
                  disabled={isSubmitting}
                />
              </div>

              <div className="cart-sidebar__order-summary">
                <h4>Tu pedido:</h4>
                <ul>
                  {items.map(item => (
                    <li key={item.book._id}>
                      {item.book.title} (x{item.quantity})
                      <span> - ${item.book.price * item.quantity}</span>
                    </li>
                  ))}
                </ul>
                <div className='cart-sidebar__order-summary-total'>
                  <span>Total: </span>
                  <span>${totalPrice}</span>
                </div>
              </div>

              {submitStatus === 'success' && (
                <div className="alert alert--success">
                  ✅ ¡Pedido enviado! Te contactaremos pronto.
                </div>
              )}
              {submitStatus === 'error' && (
                <div className="alert alert--error">
                  ❌ Error al enviar. Intentá de nuevo o usá WhatsApp.
                </div>
              )}

              <div className="form-actions">
                <button
                  type="button"
                  onClick={() => setShowEmailForm(false)}
                  className="btn btn--secondary"
                  disabled={isSubmitting}
                >
                  Volver
                </button>
                <button
                  type="submit"
                  className="btn btn--primary"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Enviando...' : 'Enviar pedido'}
                </button>
              </div>
            </form>
          </div>
        ) : (
          <>
            <div className="cart-sidebar__items">
              {items.map(({ book, quantity }) => (
                <CartItem
                  key={book._id}
                  book={book}
                  quantity={quantity}
                  onUpdateQuantity={(q) => updateQuantity(book._id, q)}
                  onRemove={() => removeFromCart(book._id)}
                />
              ))}
            </div>

            <div className="cart-sidebar__footer">
              <div className="cart-sidebar__total">
                <span>Total</span>
                <span>${totalPrice}</span>
              </div>

              <div className="cart-sidebar__checkout">
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="cart-sidebar__button cart-sidebar__button--whatsapp"
                  style={!WHATSAPP_NUMBER ? { opacity: 0.5, pointerEvents: 'none' } : undefined}
                >
                  WhatsApp
                </a>
                <button
                  onClick={() => setShowEmailForm(true)}
                  className="cart-sidebar__button cart-sidebar__button--email"
                  disabled={!EMAILJS_SERVICE_ID}
                  style={!EMAILJS_SERVICE_ID ? { opacity: 0.5 } : undefined}
                >
                  Email
                </button>
              </div>

              <button onClick={clearCart} className="cart-sidebar__clear">
                Vaciar carrito
              </button>
            </div>
          </>
        )}
      </aside>
    </>
  );
}

// ─── CartItem ─────────────────────────────────────────────────────────────────
interface CartItemProps {
  book: Book;
  quantity: number;
  onUpdateQuantity: (quantity: number) => void;
  onRemove: () => void;
}

function CartItem({ book, quantity, onUpdateQuantity, onRemove }: CartItemProps) {
  return (
    <div className="cart-item">
      <img src={book.img} alt={book.title} className="cart-item__image" />
      <div className="cart-item__details">
        <h3 className="cart-item__title">{book.title}</h3>
        <p className="cart-item__author">{book.firstName} {book.lastName}</p>
        <p className="cart-item__price">${book.price}</p>

        <div className="cart-item__actions">
          <div className="cart-item__quantity">
            <button
              onClick={() => onUpdateQuantity(quantity - 1)}
              disabled={quantity <= 1}
              aria-label="Disminuir cantidad"
            >
              −
            </button>
            <span>{quantity}</span>
            <button
              onClick={() => onUpdateQuantity(quantity + 1)}
              disabled={book.stock ? quantity >= book.stock : false}
              aria-label="Aumentar cantidad"
            >
              +
            </button>
          </div>

          <button
            onClick={onRemove}
            className="cart-item__remove"
            aria-label="Eliminar del carrito"
          >
            🗑️
          </button>
        </div>
      </div>
    </div>
  );
}
