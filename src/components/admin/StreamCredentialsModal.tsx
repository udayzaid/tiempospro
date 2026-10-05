'use client';

import { useState, type CSSProperties } from 'react';
import { IoCheckmark, IoClose, IoCopyOutline, IoEyeOffOutline, IoEyeOutline, IoKeyOutline } from 'react-icons/io5';
import { Overlay } from '@/components/ui/Overlay';
import type { StreamCredentials } from '@/types/stream';
import s from './StreamCredentialsModal.module.css';

type Props = {
  visible: boolean;
  credentials: StreamCredentials | null;
  onClose: () => void;
};

const FIELDS: { key: keyof StreamCredentials; label: string; isSecret?: boolean }[] = [
  { key: 'nombre', label: 'Nombre' },
  { key: 'descripcion', label: 'Descripción' },
  { key: 'incio', label: 'Inicio' },
  { key: 'broadcastId', label: 'Broadcast ID' },
  { key: 'watchUrl', label: 'Watch URL' },
  { key: 'embeUrl', label: 'Embed URL' },
  { key: 'rtmpServerUrl', label: 'RTMP Server URL' },
  { key: 'streamingKey', label: 'Streaming Key', isSecret: true },
  { key: 'estado', label: 'Estado' },
];

export function StreamCredentialsModal({ visible, credentials, onClose }: Props) {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [showSecret, setShowSecret] = useState(false);

  if (!credentials) return null;

  const handleCopy = async (key: string, value: string) => {
    try {
      await navigator.clipboard.writeText(value);
    } catch (error) {
      console.error('No se pudo copiar al portapapeles:', error);
      return;
    }
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 1500);
  };

  const formatValue = (key: keyof StreamCredentials, value: string) => {
    if (key !== 'incio' || !value) return value || '—';

    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? value : date.toLocaleString('es-BO');
  };

  return (
    <Overlay visible={visible} onRequestClose={onClose} className={s.backdrop}>
      <div className={`rn-view ${s.modalBox}`}>
        {/* HEADER */}
        <div className={`rn-view ${s.header}`}>
          <div className={`rn-view ${s.headerLeft}`}>
            <div className={`rn-view ${s.headerIcon}`}>
              <IoKeyOutline size={16} color="#C99200" />
            </div>
            <div className="rn-view">
              <span className={`rn-text ${s.headerTitle}`}>Credenciales del Stream</span>
              <span className={`rn-text ${s.headerSubtitle}`}>Datos de conexión para emitir</span>
            </div>
          </div>

          <button type="button" onClick={onClose} className={`rn-pressable ${s.closeBtn}`} aria-label="Cerrar">
            <IoClose size={18} color="#666" />
          </button>
        </div>

        {/* ESTADO BADGE */}
        <div className={`rn-view ${s.statusRow}`}>
          <div
            className={`rn-view ${s.statusDot} ${credentials.estado.toLowerCase() === 'activo' ? s.statusDotActive : ''}`}
          />
          <span className={`rn-text ${s.statusText}`}>{credentials.estado || 'Desconocido'}</span>
        </div>

        {/* CAMPOS */}
        <div className={`rn-view ${s.fieldsContainer}`}>
          {FIELDS.map(({ key, label, isSecret }) => {
            const value = credentials[key] || '';
            const isHidden = isSecret && !showSecret;
            const displayValue = isHidden ? '•'.repeat(Math.min(value.length, 24)) : formatValue(key, value);
            const isCopied = copiedKey === key;

            return (
              <div key={key} className={`rn-view ${s.fieldRow}`}>
                <div className={`rn-view ${s.fieldInfo}`}>
                  <span className={`rn-text ${s.fieldLabel}`}>{label}</span>
                  <span
                    className={`rn-text rn-clamp ${s.fieldValue}`}
                    style={{ '--lines': key === 'descripcion' ? 3 : 1 } as CSSProperties}
                  >
                    {displayValue}
                  </span>
                </div>

                {isSecret && (
                  <button
                    type="button"
                    className={`rn-pressable ${s.iconBtn}`}
                    onClick={() => setShowSecret((v) => !v)}
                    aria-label={showSecret ? 'Ocultar' : 'Mostrar'}
                  >
                    {showSecret ? <IoEyeOffOutline size={14} color="#666" /> : <IoEyeOutline size={14} color="#666" />}
                  </button>
                )}

                <button
                  type="button"
                  className={`rn-pressable ${s.copyBtn} ${isCopied ? s.copyBtnSuccess : ''}`}
                  onClick={() => handleCopy(key, credentials[key])}
                  disabled={!credentials[key]}
                >
                  {isCopied ? <IoCheckmark size={12} color="#2E7D32" /> : <IoCopyOutline size={12} color="#FFF" />}
                  <span className={`rn-text ${s.copyText} ${isCopied ? s.copyTextSuccess : ''}`}>
                    {isCopied ? 'Copiado' : 'Copiar'}
                  </span>
                </button>
              </div>
            );
          })}
        </div>

        {/* FOOTER */}
        <div className={`rn-view ${s.footer}`}>
          <span className={`rn-text ${s.footerHint}`}>
            Pega estos datos en OBS / Streamlabs para iniciar el broadcast.
          </span>
        </div>
      </div>
    </Overlay>
  );
}
