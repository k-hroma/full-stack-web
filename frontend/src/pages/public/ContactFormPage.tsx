import { useState } from 'react';
import { useForm } from '../../hooks/useForm';
import ContactPage from './ContactPage';
import '../../styles/pages/public/contact-form.css'
import emailjs from '@emailjs/browser';

const EMAILJS_SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID || '';
const EMAILJS_TEMPLATE_ID_CONTACT = import.meta.env.VITE_EMAILJS_TEMPLATE_ID_CONTACT || '';
const EMAILJS_PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY || '';
const EMAIL_DESTINO = import.meta.env.VITE_EMAIL_DESTINO || 'lapalaciolibros@gmail.com';

const INITIAL_FORM_DATA = {
  nombre: '',
  email: '',
  instagram: '',
  telefono: '',
  consulta: ''
}

export default function ContactFormPage() {

  const { formData, handleChange, resetForm } = useForm(INITIAL_FORM_DATA);

  const { nombre, email, instagram, telefono, consulta } = formData;

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');


  const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();

    setIsSubmitting(true);
    setSubmitStatus('idle');


    try {
      await emailjs.send(
        EMAILJS_SERVICE_ID,
        EMAILJS_TEMPLATE_ID_CONTACT,
        {
          to_email: EMAIL_DESTINO,
          from_name: formData.nombre,
          from_email: formData.email,
          reply_to: formData.email,
          instagram: formData.instagram || 'No especificado',
          telefono: formData.telefono || 'No especificado',
          message: formData.consulta,
        },
        EMAILJS_PUBLIC_KEY
      );

      setSubmitStatus('success');
      resetForm();

    } catch (error) {
      console.error('Error al enviar el formulario de contacto:', error);
      setSubmitStatus('error');

    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <section className="contact-section">
        <div className="contact-container">
          {/* Columna izquierda - Título */}
          <div className="contact-header">
            <h2 className="contact-title">
              Dejanos<br />tu consulta
            </h2>
            <p className="contact-subtitle">
              y te responderemos a la brevedad.
            </p>
            <p className="contact-note">
              Por mail, tel o red social
            </p>
          </div>

          {/* Columna derecha - Formulario */}
          <form className="contact-form" onSubmit={handleSubmit}>
            {/* Fila 1: nombre + email */}
            <div className="form-row">
              <div className="form-field">
                <input
                  type="text"
                  id="nombre"
                  name="nombre"
                  placeholder="nombre"
                  required
                  value={nombre}
                  onChange={handleChange}
                  disabled={isSubmitting}
                />
              </div>
              <div className="form-field">
                <input
                  type="email"
                  id="email"
                  name="email"
                  placeholder="tu@mail.com"
                  required
                  value={email}
                  onChange={handleChange}
                  disabled={isSubmitting}

                />
              </div>
            </div>

            {/* Fila 2: ig + tel */}
            <div className="form-row">
              <div className="form-field">
                <input
                  type="text"
                  id="instagram"
                  name="instagram"
                  placeholder="ig o red social (opcional)"
                  value={instagram}
                  onChange={handleChange}
                  disabled={isSubmitting}

                />
              </div>
              <div className="form-field">
                <input
                  type="tel"
                  id="telefono"
                  name="telefono"
                  placeholder="tel (opcional)"
                  value={telefono}
                  onChange={handleChange}
                  disabled={isSubmitting}
                />
              </div>
            </div>

            {/* Fila 3: consulta */}
            <div className="form-field form-field--full">
              <label htmlFor="consulta" className="field-label">consulta</label>
              <textarea
                id="consulta"
                name="consulta"
                rows={5}
                required
                value={consulta}
                onChange={handleChange}
                disabled={isSubmitting}
              />
            </div>

            {/* Mensajes de estado */}
            {submitStatus === 'success' && (
              <div className="form-alert form-alert--success">
                ✅ Consulta enviada. Te responderemos pronto.
              </div>
            )}

            {submitStatus === 'error' && (
              <div className="form-alert form-alert--error">
                ❌ Error al enviar. Intentá de nuevo.
              </div>
            )}

            {/* Botón */}
            <div className="form-actions">
              <button
                type="submit"
                className="submit-btn"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Enviando...' : 'Enviar'}
              </button>
            </div>
          </form>
        </div>
      </section>
      <ContactPage />
    </div>
  );
};