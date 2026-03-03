/**
 * ExternalLink - Link externo con seguridad y estilos
 * @module components/common/ExternalLink
 */

import type { ReactNode } from 'react';

interface ExternalLinkProps {
  href: string;
  className?: string;
  children: ReactNode;
}

/**
 * Link seguro para URLs externas.
 * Siempre abre en nueva pestaña con rel="noopener noreferrer".
 */
export function ExternalLink({ href, className, children }: ExternalLinkProps) {
  return (
    <a 
      href={href.trim()} 
      className={className}
      target="_blank" 
      rel="noopener noreferrer"
    >
      {children}
    </a>
  );
}