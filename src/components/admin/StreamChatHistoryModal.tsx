'use client';

import { useEffect, useState, type CSSProperties } from 'react';
import { IoChatbubblesOutline, IoClose } from 'react-icons/io5';
import { LiveTheme } from '@/constants/live-theme';
import { Overlay } from '@/components/ui/Overlay';
import { api, type StreamChatHistoryMessage } from '@/services/api';
import s from './StreamChatHistoryModal.module.css';

type Props = {
  visible: boolean;
  broadcastId: string;
  streamName: string;
  onClose: () => void;
};

const PAGE_SIZE = 50;
const clamp1 = { '--lines': 1 } as CSSProperties;

export function StreamChatHistoryModal({ visible, broadcastId, streamName, onClose }: Props) {
  const [messages, setMessages] = useState<StreamChatHistoryMessage[]>([]);
  const [pageIndex, setPageIndex] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [hasPreviousPage, setHasPreviousPage] = useState(false);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [retryKey, setRetryKey] = useState(0);

  useEffect(() => {
    if (!visible || !broadcastId) return;

    let active = true;
    setLoading(true);
    setError('');

    api
      .getStreamChatHistory(broadcastId, pageIndex, PAGE_SIZE)
      .then((result) => {
        if (!active) return;
        setMessages(result.items ?? []);
        setPageIndex(result.pageIndex ?? pageIndex);
        setTotalPages(result.totalPages ?? 1);
        setTotalCount(result.totalCount ?? 0);
        setHasPreviousPage(result.hasPreviousPage ?? pageIndex > 1);
        setHasNextPage(result.hasNextPage ?? false);
      })
      .catch((requestError: any) => {
        if (!active) return;
        setMessages([]);
        setError(requestError?.message || 'No se pudo cargar el historial del chat.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [visible, broadcastId, pageIndex, retryKey]);

  const changePage = (nextPage: number) => {
    setPageIndex(nextPage);
  };

  return (
    <Overlay visible={visible} onRequestClose={onClose} className={s.backdrop}>
      <div className={`rn-view ${s.modal}`}>
        <div className={`rn-view ${s.header}`}>
          <div className={`rn-view ${s.heading}`}>
            <div className={`rn-view ${s.icon}`}>
              <IoChatbubblesOutline size={17} color={LiveTheme.goldDark} />
            </div>
            <div className={`rn-view ${s.headingCopy}`}>
              <span className={`rn-text ${s.title}`}>Historial del chat</span>
              <span className={`rn-text rn-clamp ${s.subtitle}`} style={clamp1}>
                {streamName}
              </span>
            </div>
          </div>
          <button type="button" onClick={onClose} className={`rn-pressable ${s.closeButton}`} aria-label="Cerrar historial">
            <IoClose size={20} color={LiveTheme.textSecondary} />
          </button>
        </div>

        <div className={`rn-view ${s.body}`}>
          {loading ? (
            <div className={`rn-view ${s.stateBox}`}>
              <span className="rn-spinner" />
              <span className={`rn-text ${s.stateText}`}>Cargando mensajes...</span>
            </div>
          ) : error ? (
            <div className={`rn-view ${s.stateBox}`}>
              <span className={`rn-text ${s.errorText}`}>{error}</span>
              <button
                type="button"
                className={`rn-pressable ${s.pageButton}`}
                onClick={() => setRetryKey((key) => key + 1)}
              >
                <span className={`rn-text ${s.pageButtonText}`}>Reintentar</span>
              </button>
            </div>
          ) : messages.length === 0 ? (
            <div className={`rn-view ${s.stateBox}`}>
              <span className={`rn-text ${s.stateText}`}>Esta transmisión aún no tiene mensajes.</span>
            </div>
          ) : (
            <div className={`rn-view ${s.messageList}`}>
              {messages.map((message, index) => {
                const date = message.fecha ? new Date(message.fecha) : null;
                const dateLabel =
                  date && !Number.isNaN(date.getTime()) ? date.toLocaleString('es-BO') : message.fecha;

                return (
                  <div key={`${message.fecha}-${message.userName}-${index}`} className={`rn-view ${s.messageRow}`}>
                    <div
                      className={`rn-view ${s.avatar}`}
                      style={message.avatarColor ? { backgroundColor: message.avatarColor } : undefined}
                    >
                      <span className={`rn-text ${s.avatarText}`}>
                        {message.userName?.trim()?.charAt(0)?.toUpperCase() || 'U'}
                      </span>
                    </div>
                    <div className={`rn-view ${s.messageContent}`}>
                      <div className={`rn-view ${s.messageMeta}`}>
                        <span className={`rn-text rn-clamp ${s.userName}`} style={clamp1}>
                          {message.userName || 'Usuario'}
                        </span>
                        <span className={`rn-text rn-clamp ${s.date}`} style={clamp1}>
                          {dateLabel || ''}
                        </span>
                      </div>
                      <span className={`rn-text ${s.messageText}`}>{message.message || ''}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className={`rn-view ${s.footer}`}>
          <span className={`rn-text ${s.pageInfo}`}>
            {totalCount ? `Página ${pageIndex} de ${totalPages} · ${totalCount} mensajes` : '0 mensajes'}
          </span>
          <div className={`rn-view ${s.pageActions}`}>
            <button
              type="button"
              className={`rn-pressable ${s.pageButton} ${!hasPreviousPage ? s.disabledButton : ''}`}
              onClick={() => changePage(pageIndex - 1)}
              disabled={!hasPreviousPage || loading}
            >
              <span className={`rn-text ${s.pageButtonText}`}>Anterior</span>
            </button>
            <button
              type="button"
              className={`rn-pressable ${s.pageButton} ${!hasNextPage ? s.disabledButton : ''}`}
              onClick={() => changePage(pageIndex + 1)}
              disabled={!hasNextPage || loading}
            >
              <span className={`rn-text ${s.pageButtonText}`}>Siguiente</span>
            </button>
          </div>
        </div>
      </div>
    </Overlay>
  );
}
