/**
 * CartSidebar - Drawer lateral del carrito de compras
 * @module components/cart/CartSidebar
 */

import { useCart } from '../../hooks/useCart';
import type { Book } from '../../types';
import '../../styles/components/cart-sidebar.css'

interface CartSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CartSidebar({ isOpen, onClose }: CartSidebarProps) {
  const { 
    items, 
    itemCount, 
    totalPrice, 
    removeFromCart, 
    updateQuantity, 
    clearCart 
  } = useCart();

  // Cerrar con Escape
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') onClose();
  };

  // Generar mensaje para WhatsApp
  const generateWhatsAppMessage = (): string => {
    const lines = items.map(item => 
      `- ${item.book.title} (${item.quantity}x) - $${item.book.price * item.quantity}`
    );
    const message = `Hola! Quiero comprar:\n\n${lines.join('\n')}\n\nTotal: $${totalPrice}`;
    return encodeURIComponent(message);
  };

  // Generar mensaje para Email
  const generateEmailBody = (): string => {
    const lines = items.map(item => 
      `- ${item.book.title} (${item.quantity}x) - $${item.book.price * item.quantity}`
    );
    return `Hola,%0D%0A%0D%0AQuiero comprar:%0D%0A%0D%0A${lines.join('%0D%0A')}%0D%0A%0D%0ATotal: $${totalPrice}`;
  };

  if (!isOpen) return null;

  return (
    <div 
      className="cart-sidebar__overlay"
      onClick={onClose}
      onKeyDown={handleKeyDown}
      role="dialog"
      aria-modal="true"
      aria-label="Carrito de compras"
    >
      <aside 
        className="cart-sidebar"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="cart-sidebar__header">
          <h2 className="cart-sidebar__title">
            Carrito ({itemCount})
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
        ) : (
          <>
            {/* Items */}
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

            {/* Footer */}
            <div className="cart-sidebar__footer">
              <div className="cart-sidebar__total">
                <span>Total</span>
                <span>${totalPrice}</span>
              </div>

              {/* Opciones de checkout */}
              <div className="cart-sidebar__checkout">
                <a 
                  href={`https://wa.me/?text=${generateWhatsAppMessage()}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="cart-sidebar__button cart-sidebar__button--whatsapp"
                >
                  💬 WhatsApp
                </a>
                
                <a 
                  href={`mailto:?subject=Pedido de libros&body=${generateEmailBody()}`}
                  className="cart-sidebar__button cart-sidebar__button--email"
                >
                  📧 Email
                </a>
              </div>

              <button 
                onClick={clearCart}
                className="cart-sidebar__clear"
              >
                Vaciar carrito
              </button>
            </div>
          </>
        )}
      </aside>
    </div>
  );
}

// Componente interno: Item del carrito
interface CartItemProps {
  book: Book;
  quantity: number;
  onUpdateQuantity: (quantity: number) => void;
  onRemove: () => void;
}

function CartItem({ book, quantity, onUpdateQuantity, onRemove }: CartItemProps) {
  return (
    <div className="cart-item">
      <img 
        src={book.img} 
        alt={book.title} 
        className="cart-item__image"
      />
      
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