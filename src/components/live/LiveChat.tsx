'use client';

import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { api, type ChatHistoryMessage } from '@/services/api';
import { useAuth } from '@/context/AuthContext';
import { useLiveHub, type SignalRChatMessage } from '@/context/LiveHubContext';
import type { ChatMessageData } from './ChatMessage';
import s from './LiveChat.module.css';

type AuthenticatedProfile = {
  email?: string;
  name?: string;
  userName?: string;
  avatarColor?: string;
  [key: string]: any;
};

const MAX_CHAT_MESSAGES = 100;

const EMOJIS = ['😀', '😂', '😍', '🥰', '😎', '😢', '😮', '😡', '👍', '👏', '❤️', '🔥', '👋', '🙏', '🎉', '💪'];

const AVATAR_COLORS = ['#E53935', '#1E88E5', '#43A047', '#FB8C00', '#8E24AA', '#00897B'];

const clamp1 = { '--lines': 1 } as CSSProperties;

function mapChatMessage(message: ChatHistoryMessage, index: number): ChatMessageData {
  const username = message.userName || message.username || 'Usuario';

  const text = message.message || message.text || '';

  return {
    id: String(message.id ?? `${message.createdAt ?? 'message'}-${index}`),
    username,
    text,
    avatarColor: message.avatarColor,
  };
}

function mapSignalRMessage(
  message: SignalRChatMessage,
  profile: AuthenticatedProfile | null,
  index: number,
): ChatMessageData {
  if (typeof message === 'string') {
    const username = profile?.userName || profile?.name || profile?.email || 'Usuario';

    return {
      id: `signalr-${Date.now()}-${index}`,
      username,
      text: message,
      avatarColor: profile?.avatarColor,
    };
  }

  return mapChatMessage(message, index);
}

function getInitial(username: string) {
  const cleanName = username.trim();

  if (!cleanName) {
    return 'U';
  }

  return cleanName.charAt(0).toUpperCase();
}

function getAvatarColor(username: string, avatarColor?: string) {
  if (avatarColor) {
    return avatarColor;
  }

  let total = 0;

  for (let index = 0; index < username.length; index += 1) {
    total += username.charCodeAt(index);
  }

  return AVATAR_COLORS[total % AVATAR_COLORS.length];
}

function ChatRow({ item }: { item: ChatMessageData }) {
  const avatarColor = getAvatarColor(item.username, item.avatarColor);

  return (
    <div className={`rn-view ${s.messageRow}`}>
      <div className={`rn-view ${s.avatar}`} style={{ backgroundColor: avatarColor }}>
        <span className={`rn-text ${s.avatarText}`}>{getInitial(item.username)}</span>
      </div>

      <div className={`rn-view ${s.messageContent}`}>
        <span className={`rn-text rn-clamp ${s.username}`} style={clamp1}>
          {item.username}
        </span>

        <span className={`rn-text ${s.messageText}`}>{item.text}</span>
      </div>
    </div>
  );
}

export function LiveChat() {
  const { isAuthenticated, profile } = useAuth();
  const { liveInfo, connection, connecting, connected, subscribeToChatMessages, subscribeToNotices } = useLiveHub();

  const [messages, setMessages] = useState<ChatMessageData[]>([]);
  const [draft, setDraft] = useState('');
  const [loading, setLoading] = useState(true);
  const [historyError, setHistoryError] = useState(false);
  const [chatNotice, setChatNotice] = useState('');
  const [emojiVisible, setEmojiVisible] = useState(false);
  const chatListRef = useRef<HTMLDivElement>(null);

  const profileRef = useRef(profile);

  profileRef.current = profile;

  useEffect(() => {
    let mounted = true;

    const loadHistory = async () => {
      try {
        setLoading(true);
        setHistoryError(false);

        // Solo consultamos el historial cuando realmente hay una
        // transmisión en vivo activa.
        if (!liveInfo?.isLive) {
          if (mounted) {
            setMessages([]);
            setHistoryError(false);
            setLoading(false);
          }
          return;
        }

        const data = await api.getChatHistory(50);

        if (!mounted) return;

        const historyMessages = data.map(mapChatMessage);

        setMessages((currentMessages) => {
          const currentIds = new Set(currentMessages.map((message) => message.id));

          const unseenHistory = historyMessages.filter((message) => !currentIds.has(message.id));

          return [...unseenHistory, ...currentMessages].slice(-MAX_CHAT_MESSAGES);
        });
      } catch (error) {
        if (!mounted) return;

        console.error('[Chat] No se pudo cargar el historial:', error);
        setHistoryError(true);
        setMessages([]);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    // Mientras todavía no conocemos el estado del Live,
    // esperamos a que LiveHubContext lo determine.
    if (liveInfo === null) {
      setLoading(true);
      return () => {
        mounted = false;
      };
    }

    loadHistory();

    return () => {
      mounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [liveInfo?.isLive]);

  useEffect(() => {
    const unsubscribeMessages = subscribeToChatMessages((message) => {
      setMessages((prev) =>
        [...prev, mapSignalRMessage(message, profileRef.current, prev.length)].slice(-MAX_CHAT_MESSAGES),
      );
    });

    const unsubscribeNotices = subscribeToNotices(setChatNotice);

    return () => {
      unsubscribeMessages();
      unsubscribeNotices();
    };
  }, [subscribeToChatMessages, subscribeToNotices]);

  // onContentSizeChange -> scrollToEnd({ animated: true })
  useEffect(() => {
    const el = chatListRef.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
  }, [messages]);

  const addEmoji = (emoji: string) => {
    setDraft((current) => `${current}${emoji}`);
  };

  async function handleSend() {
    const text = draft.trim();

    if (!text) return;

    if (!liveInfo?.isLive || !isAuthenticated || !connection || !connected) {
      console.warn('[Chat] No hay un Live activo o no existe una sesión/conexión activa.');
      return;
    }

    try {
      await connection.invoke('SendMessage', text);
      setDraft('');
    } catch (error) {
      console.error('[Chat] Error enviando mensaje:', error);
    }
  }

  const inputDisabled = loading || !liveInfo?.isLive || !isAuthenticated || connecting || !connected;

  return (
    <div className={`rn-view ${s.container}`}>
      {/* ENCABEZADO DEL CHAT */}
      <div className={`rn-view ${s.header}`}>
        <div className={`rn-view ${s.headerLeft}`}>
          <div className={`rn-view ${s.headerLiveDot}`} />

          <span className={`rn-text ${s.headerText}`}>CHAT EN VIVO</span>
        </div>

        <div className={`rn-view ${s.headerRight}`}>
          <span className={`rn-text ${s.connectedText}`}></span>
        </div>
      </div>

      {/* MENSAJE DE AVISO */}
      {chatNotice ? (
        <span className={`rn-text rn-clamp ${s.noticeText}`} style={{ '--lines': 2 } as CSSProperties}>
          {chatNotice}
        </span>
      ) : null}

      {/* LISTA DEL CHAT */}
      <div ref={chatListRef} className={`rn-view ${s.list}`}>
        <div className={`rn-view ${messages.length === 0 ? s.emptyList : s.listContent}`}>
          {messages.length === 0 ? (
            loading ? (
              <div className={`rn-view ${s.statusContainer}`}>
                <span className="rn-spinner" />

                <span className={`rn-text ${s.statusText}`}>Cargando mensajes...</span>
              </div>
            ) : historyError ? (
              <div className={`rn-view ${s.statusContainer}`}>
                <span className={`rn-text ${s.statusText}`}>Live no iniciado.</span>
              </div>
            ) : (
              <div className={`rn-view ${s.statusContainer}`}>
                <span className={`rn-text ${s.statusText}`}>Live no inciado </span>
              </div>
            )
          ) : (
            messages.map((item) => <ChatRow key={item.id} item={item} />)
          )}
        </div>
      </div>

      {/* SELECTOR DE EMOJIS */}
      {emojiVisible && isAuthenticated ? (
        <div className={`rn-view ${s.emojiPanel}`}>
          {EMOJIS.map((emoji) => (
            <button
              key={emoji}
              type="button"
              onClick={() => addEmoji(emoji)}
              className={`rn-pressable ${s.emojiButton}`}
              aria-label={`Agregar emoji ${emoji}`}
            >
              <span className={`rn-text ${s.emojiText}`}>{emoji}</span>
            </button>
          ))}
        </div>
      ) : null}

      {/* ZONA PARA ESCRIBIR */}
      <div className={`rn-view ${s.inputRow}`}>
        {isAuthenticated ? (
          <>
            <button
              type="button"
              onClick={() => setEmojiVisible((visible) => !visible)}
              className={`rn-pressable ${s.emojiToggle}`}
              aria-label="Abrir emojis"
            >
              <span className={`rn-text ${s.emojiToggleText}`}>☺</span>
            </button>

            <input
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              placeholder={
                !liveInfo?.isLive
                  ? 'Chat no disponible'
                  : connecting
                    ? 'Conectando al chat...'
                    : connected
                      ? 'Escribe un mensaje...'
                      : 'Chat no disponible'
              }
              className={`rn-input ${s.input} ${inputDisabled ? s.inputDisabled : ''}`}
              onKeyDown={(event) => {
                if (event.key === 'Enter') void handleSend();
              }}
              disabled={inputDisabled}
              enterKeyHint="send"
            />

            <button
              type="button"
              onClick={handleSend}
              className={`rn-pressable ${s.sendButton} ${inputDisabled ? s.sendButtonDisabled : ''}`}
              disabled={inputDisabled}
              aria-label="Enviar mensaje"
            >
              <span className={`rn-text ${s.sendButtonText}`}>➤</span>
            </button>
          </>
        ) : (
          <div className={`rn-view ${s.loginMessage}`}>
            <span className={`rn-text ${s.loginMessageText}`}>Inicia sesión para comentar.</span>
          </div>
        )}
      </div>
    </div>
  );
}
