'use client';

import { useEffect, type ReactNode } from 'react';
import s from './Overlay.module.css';

type OverlayProps = {
  visible: boolean;
  onRequestClose?: () => void;
  /** Clase del fondo (color, alineación, padding). */
  className?: string;
  /** Si se define, se llama al hacer clic sobre el fondo (no sobre el contenido). */
  onBackdropClick?: () => void;
  children: ReactNode;
};

export function Overlay({ visible, onRequestClose, className = '', onBackdropClick, children }: OverlayProps) {
  useEffect(() => {
    if (!visible || !onRequestClose) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onRequestClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [visible, onRequestClose]);

  if (!visible) return null;

  return (
    <div
      className={`rn-view ${s.overlay} ${className}`}
      role="dialog"
      aria-modal="true"
      onClick={(event) => {
        if (onBackdropClick && event.target === event.currentTarget) onBackdropClick();
      }}
    >
      {children}
    </div>
  );
}
