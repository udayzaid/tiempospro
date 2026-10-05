'use client';

import * as signalR from '@microsoft/signalr';
import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import type { ChatHistoryMessage } from '@/services/api';
import { useAuth } from '@/context/AuthContext';

const CHAT_HUB_URL = `${process.env.NEXT_PUBLIC_API_URL || 'https://lostiemposapi20260817104248-avbkfhcfcucgf9e0.centralus-01.azurewebsites.net'}/hubs/chat`;

export type LiveInfo = {
  urlVideo: string;
  isLive: boolean;
};

export type SignalRChatMessage = ChatHistoryMessage | string;

type LiveHubContextValue = {
  liveInfo: LiveInfo | null;
  connection: signalR.HubConnection | null;
  connected: boolean;
  connecting: boolean;
  subscribeToChatMessages: (listener: (message: SignalRChatMessage) => void) => () => void;
  subscribeToNotices: (listener: (message: string) => void) => () => void;
};

const LiveHubContext = createContext<LiveHubContextValue | undefined>(undefined);

export function LiveHubProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [liveInfo, setLiveInfo] = useState<LiveInfo | null>(null);
  const [connection, setConnection] = useState<signalR.HubConnection | null>(null);
  const [connected, setConnected] = useState(false);
  const [connecting, setConnecting] = useState(true);
  const chatListeners = useRef(new Set<(message: SignalRChatMessage) => void>());
  const noticeListeners = useRef(new Set<(message: string) => void>());

  const subscribeToChatMessages = useCallback((listener: (message: SignalRChatMessage) => void) => {
    chatListeners.current.add(listener);
    return () => chatListeners.current.delete(listener);
  }, []);

  const subscribeToNotices = useCallback((listener: (message: string) => void) => {
    noticeListeners.current.add(listener);
    return () => noticeListeners.current.delete(listener);
  }, []);

  useEffect(() => {
    if (authLoading) return;

    let mounted = true;
    setConnecting(true);
    setConnected(false);

    const hub = new signalR.HubConnectionBuilder()
      .withUrl(CHAT_HUB_URL, { withCredentials: true })
      .withAutomaticReconnect()
      .configureLogging(signalR.LogLevel.Information)
      .build();

    hub.on('LiveInfo', (payload: LiveInfo) => {
      if (!mounted || !payload) return;
      const raw = payload as LiveInfo & { UrlVideo?: string; IsLive?: boolean | string };
      const isLive = raw.isLive ?? raw.IsLive;
      const info: LiveInfo = {
        urlVideo: raw.urlVideo ?? raw.UrlVideo ?? '',
        isLive: isLive === true || String(isLive).toLowerCase() === 'true',
      };
      setLiveInfo(info);
      console.info('[Hub] LiveInfo recibido:', info);
    });
    hub.on('RecibeMessage', (message: SignalRChatMessage) => {
      chatListeners.current.forEach((listener) => listener(message));
    });
    hub.on('Message', (message: string) => {
      noticeListeners.current.forEach((listener) => listener(message));
    });

    hub.onreconnecting(() => {
      if (!mounted) return;
      setConnected(false);
      setConnecting(true);
    });
    hub.onreconnected(() => {
      if (!mounted) return;
      setConnected(true);
      setConnecting(false);
    });
    hub.onclose(() => {
      if (!mounted) return;
      setConnected(false);
      setConnecting(false);
    });

    // LiveInfo y los eventos del chat se registran antes de abrir la conexión.
    setConnection(hub);
    const startPromise = (async () => {
      let attempt = 0;
      while (mounted) {
        try {
          await hub.start();
          if (!mounted) return;
          setConnected(true);
          setConnecting(false);
          console.info('[Hub] Conectado a /hubs/chat.');
          return;
        } catch (error) {
          if (!mounted) return;
          setConnected(false);
          setConnecting(true);
          const delay = Math.min(1000 * 2 ** attempt, 15000);
          console.warn(`[Hub] Falló el inicio de /hubs/chat; nuevo intento en ${delay / 1000}s.`, error);
          attempt += 1;
          await new Promise((resolve) => setTimeout(resolve, delay));
        }
      }
    })();

    return () => {
      mounted = false;
      setConnection(null);
      // Esperar a que start termine evita pedir stop durante el arranque de SignalR.
      void startPromise.then(async () => {
        try {
          await hub.stop();
        } catch (error) {
          console.error('[Hub] Error cerrando conexión:', error);
        }
      }).catch(() => {
        // Si start falla, no hay una conexión activa que cerrar.
      });
    };
  }, [authLoading, isAuthenticated]);

  const value = useMemo(
    () => ({ liveInfo, connection, connected, connecting, subscribeToChatMessages, subscribeToNotices }),
    [liveInfo, connection, connected, connecting, subscribeToChatMessages, subscribeToNotices]
  );

  return <LiveHubContext.Provider value={value}>{children}</LiveHubContext.Provider>;
}

export function useLiveHub() {
  const context = useContext(LiveHubContext);
  if (!context) throw new Error('useLiveHub debe utilizarse dentro de LiveHubProvider');
  return context;
}
