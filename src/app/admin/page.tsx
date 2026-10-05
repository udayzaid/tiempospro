'use client';

import * as signalR from '@microsoft/signalr';
import { useCallback, useEffect, useState, type CSSProperties } from 'react';
import {
  IoAdd,
  IoChatbubblesOutline,
  IoGridOutline,
  IoNewspaperOutline,
  IoPeopleOutline,
  IoRadioOutline,
  IoStatsChartOutline,
  IoTimeOutline,
} from 'react-icons/io5';
import { ContentManagementPanel } from '@/components/admin/ContentManagementPanel';
import { StreamChatHistoryModal } from '@/components/admin/StreamChatHistoryModal';
import { StreamCredentialsModal } from '@/components/admin/StreamCredentialsModal';
import { UserModerationPanel } from '@/components/admin/UserModerationPanel';
import { LiveHeader } from '@/components/live/LiveHeader';
import { LiveTheme } from '@/constants/live-theme';
import { useAuth } from '@/context/AuthContext';
import { useLiveHub } from '@/context/LiveHubContext';
import { api, type StreamHistoryItem } from '@/services/api';
import type { StreamCredentials } from '@/types/stream';
import s from './page.module.css';

/* =========================================================
   TIPOS
========================================================= */

type Feedback = {
  type: 'success' | 'error' | 'info' | null;
  message: string;
};

type AdminSection = 'live' | 'content' | 'users';

type ActiveStream = {
  titulo?: string;
  descripcion?: string;
};

type LiveConnectionSample = {
  timestampUtc: string;
  connectedCount: number;
};

type LiveStatistics = {
  connectedCount: number;
  peakConnectedCount: number;
  history: LiveConnectionSample[];
};

const LIVE_HUB_URL = `${
  process.env.NEXT_PUBLIC_API_URL ||
  'https://lostiemposapi20260817104248-avbkfhcfcucgf9e0.centralus-01.azurewebsites.net'
}/hubs/live`;

const clamp1 = { '--lines': 1 } as CSSProperties;

function getYouTubeVideoId(watchUrl: string): string | null {
  try {
    const url = new URL(watchUrl);
    const host = url.hostname.toLowerCase();
    let videoId = '';

    if (host === 'youtu.be' || host.endsWith('.youtu.be')) {
      videoId = url.pathname.split('/').filter(Boolean)[0] || '';
    } else if (host.includes('youtube.com')) {
      videoId =
        url.searchParams.get('v') || url.pathname.match(/\/(?:embed|live|shorts)\/([^/?]+)/)?.[1] || '';
    }

    return /^[A-Za-z0-9_-]{6,20}$/.test(videoId) ? videoId : null;
  } catch {
    return null;
  }
}

/* =========================================================
   COMPONENTE PRINCIPAL
========================================================= */

export default function AdminDashboard() {
  const { role, isAuthenticated, loading: authLoading } = useAuth();
  const { liveInfo } = useLiveHub();

  const isAdmin = role?.trim().toLowerCase() === 'admin';

  // La protección de ruta (redirigir a "/" si no es Admin) vive en admin/layout.tsx.

  // -------- ESTADOS --------
  const [activeSection, setActiveSection] = useState<AdminSection>('live');

  const [activeStream, setActiveStream] = useState<ActiveStream | null>(null);

  const [streamTitle, setStreamTitle] = useState('');
  const [streamDescription, setStreamDescription] = useState('');

  const [loadingStream, setLoadingStream] = useState(true);
  const [publishing, setPublishing] = useState(false);
  const [stopping, setStopping] = useState(false);
  const [feedback, setFeedback] = useState<Feedback>({ type: null, message: '' });

  const [credentials, setCredentials] = useState<StreamCredentials | null>(null);
  const [credentialsVisible, setCredentialsVisible] = useState(false);
  const [loadingCredentials, setLoadingCredentials] = useState(false);

  const [recentStreams, setRecentStreams] = useState<StreamHistoryItem[]>([]);
  const [selectedChatStream, setSelectedChatStream] = useState<StreamHistoryItem | null>(null);
  const [recentStreamsLoading, setRecentStreamsLoading] = useState(true);
  const [recentStreamsError, setRecentStreamsError] = useState('');
  const [streamsPageIndex, setStreamsPageIndex] = useState(1);
  const [streamsPagination, setStreamsPagination] = useState({
    totalPages: 1,
    totalCount: 0,
    hasPreviousPage: false,
    hasNextPage: false,
  });
  const [connectedCount, setConnectedCount] = useState(0);
  const [peakConnectedCount, setPeakConnectedCount] = useState(0);
  const [liveHistory, setLiveHistory] = useState<LiveConnectionSample[]>([]);

  // -------- HELPERS --------
  const showFeedback = (type: Feedback['type'], message: string) => {
    setFeedback({ type, message });
  };

  const loadRecentStreams = useCallback(async (pageIndex: number) => {
    setRecentStreamsLoading(true);
    setRecentStreamsError('');

    try {
      const result = await api.getAllStreams(pageIndex, 10);
      setRecentStreams(result.items ?? []);
      setStreamsPageIndex(result.pageIndex ?? pageIndex);
      setStreamsPagination({
        totalPages: result.totalPages ?? 1,
        totalCount: result.totalCount ?? 0,
        hasPreviousPage: result.hasPreviousPage ?? pageIndex > 1,
        hasNextPage: result.hasNextPage ?? false,
      });
    } catch (error: any) {
      setRecentStreams([]);
      setRecentStreamsError(error?.message || 'No se pudieron cargar las transmisiones.');
    } finally {
      setRecentStreamsLoading(false);
    }
  }, []);

  const hasActiveStream = liveInfo ? liveInfo.isLive : Boolean(activeStream);

  const handleFetchCredentials = async () => {
    setLoadingCredentials(true);
    try {
      const data = await api.getStreamCredentials();

      // 🚫 Si NO es 200 o no hay datos → NO abrimos el modal.
      if (!data) {
        showFeedback('info', 'No hay transmisión activa o no autorizada.');
        return;
      }

      setCredentials(data);
      setCredentialsVisible(true);
      showFeedback('success', 'Credenciales obtenidas.');
    } catch (err: any) {
      showFeedback('error', err?.message || 'Error al obtener credenciales.');
    } finally {
      setLoadingCredentials(false);
    }
  };

  // -------- CARGAR STREAM ACTIVO --------
  const loadActiveStream = useCallback(async () => {
    setLoadingStream(true);
    try {
      const data = await api.getStream();

      if (data && data.hasActiveStream) {
        setActiveStream(data.raw);
      } else {
        setActiveStream(null);
      }
    } catch {
      setActiveStream(null);
    } finally {
      setLoadingStream(false);
    }
  }, []);

  useEffect(() => {
    loadActiveStream();
  }, [loadActiveStream]);

  useEffect(() => {
    loadRecentStreams(streamsPageIndex);
  }, [loadRecentStreams, streamsPageIndex]);

  useEffect(() => {
    if (authLoading || !isAuthenticated || !isAdmin) return;

    let mounted = true;
    const metricsConnection = new signalR.HubConnectionBuilder()
      .withUrl(LIVE_HUB_URL, { withCredentials: true })
      .withAutomaticReconnect()
      .build();

    metricsConnection.on('LiveStats', (stats: LiveStatistics) => {
      if (!mounted) return;
      setConnectedCount(stats.connectedCount ?? 0);
      setPeakConnectedCount(stats.peakConnectedCount ?? 0);
      setLiveHistory(Array.isArray(stats.history) ? stats.history : []);
    });
    metricsConnection.onreconnecting((error) => {
      if (mounted) console.warn('[Admin] El Hub de métricas está reconectando:', error);
    });
    metricsConnection.onclose((error) => {
      if (mounted) console.warn('[Admin] El Hub de métricas se desconectó:', error);
    });

    const metricsStart = (async () => {
      let attempt = 0;
      while (mounted) {
        try {
          await metricsConnection.start();
          return;
        } catch (error) {
          if (!mounted) return;
          const delay = Math.min(1000 * 2 ** attempt, 15000);
          console.warn(`[Admin] Falló el inicio del Hub de métricas; nuevo intento en ${delay / 1000}s.`, error);
          attempt += 1;
          await new Promise((resolve) => setTimeout(resolve, delay));
        }
      }
    })();

    return () => {
      mounted = false;
      void metricsStart
        .then(async () => {
          try {
            await metricsConnection.stop();
          } catch (error) {
            console.error('[Admin] Error cerrando el Hub de métricas:', error);
          }
        })
        .catch(() => {
          // Si el arranque falla, no hay una conexión activa que detener.
        });
    };
  }, [authLoading, isAuthenticated, isAdmin]);

  const chartSamples = liveHistory.slice(-30);
  const chartScale = Math.max(peakConnectedCount, ...chartSamples.map((sample) => sample.connectedCount), 1);
  const chartPath = chartSamples
    .map((sample, index) => {
      const x = chartSamples.length === 1 ? 150 : (index / (chartSamples.length - 1)) * 300;
      const y = 72 - (sample.connectedCount / chartScale) * 60;
      return `${index === 0 ? 'M' : 'L'}${x},${y}`;
    })
    .join(' ');

  // -------- PUBLICAR STREAM --------
  const handlePublishStream = async () => {
    const title = streamTitle.trim();
    const description = streamDescription.trim();

    if (!title) {
      showFeedback('error', 'Ingresa un título para la transmisión.');
      return;
    }

    if (hasActiveStream) {
      showFeedback('error', 'Ya existe un stream activo.');
      return;
    }

    setPublishing(true);
    setFeedback({ type: null, message: '' });

    try {
      // createStream devuelve las credenciales tipadas
      const created = await api.createStream({
        titulo: title,
        descripcion: description || title,
      });

      // Reflejamos el nuevo live en el estado local del panel
      setActiveStream({ titulo: title, descripcion: description || title });
      if (streamsPageIndex === 1) void loadRecentStreams(1);
      setStreamsPageIndex(1);

      // Limpiamos el formulario
      setStreamTitle('');
      setStreamDescription('');

      // Si el live se creó OK, mostramos el modal
      if (created.broadcastId || created.streamingKey) {
        setCredentials(created);
        setCredentialsVisible(true);
        showFeedback('success', 'Transmisión creada. Credenciales listas.');
      } else {
        showFeedback('success', 'Transmisión publicada correctamente.');
      }
    } catch (err: any) {
      showFeedback('error', err?.message || 'Error al publicar la transmisión.');
    } finally {
      setPublishing(false);
    }
  };

  // -------- DETENER STREAM --------
  const handleStopStream = async () => {
    setStopping(true);
    try {
      const response = await api.deleteStream();
      setActiveStream(null);
      void loadRecentStreams(streamsPageIndex);
      showFeedback('success', response?.message || 'Transmisión finalizada correctamente.');
    } catch (error: any) {
      const errorMsg = error?.message || '';
      if (errorMsg.includes('No existe live activo') || errorMsg.includes('null')) {
        setActiveStream(null);
        showFeedback('info', 'La transmisión ya no estaba activa en el servidor.');
      } else {
        showFeedback('error', errorMsg || 'Error al detener la transmisión.');
      }
    } finally {
      setStopping(false);
    }
  };

  const getSectionSubtitle = () => {
    if (activeSection === 'live') return 'Resumen general de la plataforma en tiempo real.';
    if (activeSection === 'content') return 'Organiza los contenidos publicados en la página principal.';
    if (activeSection === 'users') return 'Gestión de usuarios registrados.';
    return 'Resumen general de la plataforma en tiempo real.';
  };

  const getSectionTitle = () => {
    if (activeSection === 'content') return 'Gestión de contenido';
    if (activeSection === 'users') return 'Usuarios';
    return 'Gestión de Live';
  };

  // -------- RENDER DE CARGA / BLOQUEO --------
  if (authLoading || !isAuthenticated || !isAdmin) {
    return (
      <div className={`rn-view ${s.authLoading}`}>
        <span className={`rn-spinner ${s.spinnerLarge}`} />
        <span className={`rn-text ${s.authLoadingText}`}>Verificando permisos...</span>
      </div>
    );
  }

  /* =========================================================
     RENDER PRINCIPAL
  ========================================================= */
  return (
    <div className={`rn-view ${s.container}`}>
      <LiveHeader
        headline="Los Tiempos, señal en vivo - Artemis retorna, Trump y los convenios, Liga boliviana y las ultimas posiciones en las tablas"
        onOpenLogin={() => {}}
        onOpenRegister={() => {}}
      />
      <StreamCredentialsModal
        visible={credentialsVisible}
        credentials={credentials}
        onClose={() => setCredentialsVisible(false)}
      />
      <StreamChatHistoryModal
        key={selectedChatStream?.broadcastId ?? 'closed-stream-chat'}
        visible={Boolean(selectedChatStream)}
        broadcastId={selectedChatStream?.broadcastId ?? ''}
        streamName={selectedChatStream?.nombre ?? 'Transmisión'}
        onClose={() => setSelectedChatStream(null)}
      />
      <div className={`rn-view ${s.layout}`}>
        {/* SIDEBAR */}
        <nav className={`rn-view ${s.sidebar}`}>
          <span className={`rn-text ${s.sidebarBrand}`}>ADMINISTRACIÓN</span>

          <button
            type="button"
            className={`rn-pressable ${s.sidebarItem} ${activeSection === 'live' ? s.sidebarItemActive : ''}`}
            onClick={() => setActiveSection('live')}
          >
            <IoGridOutline size={18} color={activeSection === 'live' ? LiveTheme.goldDark : LiveTheme.textMuted} />
            <span className={`rn-text ${activeSection === 'live' ? s.sidebarTextActive : s.sidebarText}`}>
              Gestión de Live
            </span>
          </button>

          <button
            type="button"
            className={`rn-pressable ${s.sidebarItem} ${activeSection === 'content' ? s.sidebarItemActive : ''}`}
            onClick={() => setActiveSection('content')}
          >
            <IoNewspaperOutline
              size={18}
              color={activeSection === 'content' ? LiveTheme.goldDark : LiveTheme.textMuted}
            />
            <span className={`rn-text ${activeSection === 'content' ? s.sidebarTextActive : s.sidebarText}`}>
              Gestión de contenido
            </span>
          </button>

          <button
            type="button"
            className={`rn-pressable ${s.sidebarItem} ${activeSection === 'users' ? s.sidebarItemActive : ''}`}
            onClick={() => setActiveSection('users')}
          >
            <IoPeopleOutline size={18} color={activeSection === 'users' ? LiveTheme.goldDark : LiveTheme.textMuted} />
            <span className={`rn-text ${activeSection === 'users' ? s.sidebarTextActive : s.sidebarText}`}>
              Usuarios
            </span>
          </button>
        </nav>

        {/* COLUMNA CENTRAL */}
        <main className={`rn-view ${s.mainColumn}`}>
          {/* HEADER */}
          <div className={`rn-view ${s.headerRow}`}>
            <div className={`rn-view ${s.headerCopy}`}>
              <h1 className={`rn-text ${s.pageTitle}`}>{getSectionTitle()}</h1>
              <span className={`rn-text ${s.pageSubtitle}`}>{getSectionSubtitle()}</span>
            </div>

            <div className={`rn-view ${s.statusBadge}`}>
              <div className={`rn-view ${s.statusDot}`} />
              <span className={`rn-text ${s.statusText}`}>SISTEMA ACTIVO</span>
            </div>
          </div>

          {/* CREAR NUEVO LIVE */}
          {activeSection === 'live' && (
            <>
              <div className={`rn-view ${s.card}`}>
                <div className={`rn-view ${s.cardHeaderRow}`}>
                  <div className={`rn-view ${s.cardIcon}`}>
                    <IoAdd size={18} color={LiveTheme.goldDark} />
                  </div>
                  <span className={`rn-text ${s.cardTitle}`}>Crear Nuevo Live</span>
                </div>

                <label className={`rn-text ${s.formLabel}`} htmlFor="stream-title">
                  Título de la transmisión
                </label>
                <input
                  id="stream-title"
                  className={`rn-input ${s.formInput}`}
                  placeholder="Ej: Conferencia de Prensa Presidencial"
                  value={streamTitle}
                  onChange={(e) => setStreamTitle(e.target.value)}
                  disabled={publishing || stopping}
                />

                <label className={`rn-text ${s.formLabel}`} htmlFor="stream-description">
                  Descripción breve
                </label>
                <textarea
                  id="stream-description"
                  className={`rn-input ${s.descriptionInput}`}
                  placeholder="Ingrese los detalles principales de la transmisión..."
                  value={streamDescription}
                  onChange={(e) => setStreamDescription(e.target.value.slice(0, 300))}
                  disabled={publishing || stopping}
                  maxLength={300}
                />
                <span className={`rn-text ${s.counterText}`}>{streamDescription.length}/300</span>

                {feedback.type !== null && (
                  <span
                    className={`rn-text ${s.feedbackText} ${
                      feedback.type === 'success'
                        ? s.feedbackSuccess
                        : feedback.type === 'error'
                          ? s.feedbackError
                          : s.feedbackInfo
                    }`}
                  >
                    {feedback.message}
                  </span>
                )}

                <div className={`rn-view ${s.actionRow}`}>
                  <button
                    type="button"
                    className={`rn-pressable ${s.startButton} ${
                      publishing || stopping || hasActiveStream ? s.btnDisabled : ''
                    }`}
                    onClick={handlePublishStream}
                    disabled={publishing || stopping || hasActiveStream}
                  >
                    {publishing ? (
                      <span className="rn-spinner" style={{ color: LiveTheme.gold, width: 16, height: 16 }} />
                    ) : (
                      <>
                        <IoRadioOutline size={14} color={LiveTheme.gold} />
                        <span className={`rn-text ${s.startButtonText}`}>INICIAR TRANSMISIÓN</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* TRANSMISIONES RECIENTES */}
              <div className={`rn-view ${s.card}`}>
                <div className={`rn-view ${s.cardHeaderRow}`}>
                  <div className={`rn-view ${s.cardIcon}`}>
                    <IoTimeOutline size={16} color={LiveTheme.goldDark} />
                  </div>
                  <span className={`rn-text ${s.cardTitle}`}>Transmisiones Recientes</span>
                </div>

                {recentStreamsLoading ? (
                  <div className={`rn-view ${s.recentMessage}`}>
                    <span className="rn-spinner" style={{ width: 16, height: 16 }} />
                    <span className={`rn-text ${s.placeholderText}`}>Cargando transmisiones...</span>
                  </div>
                ) : recentStreamsError ? (
                  <div className={`rn-view ${s.recentMessage}`}>
                    <span className={`rn-text ${s.feedbackError}`}>{recentStreamsError}</span>
                    <button
                      type="button"
                      className={`rn-pressable ${s.detailsButton}`}
                      onClick={() => loadRecentStreams(streamsPageIndex)}
                    >
                      <span className={`rn-text ${s.detailsButtonText}`}>Reintentar</span>
                    </button>
                  </div>
                ) : recentStreams.length === 0 ? (
                  <span className={`rn-text ${s.placeholderText}`}>No hay transmisiones registradas.</span>
                ) : (
                  recentStreams.map((item, index) => {
                    const videoId = getYouTubeVideoId(item.watchUrl);
                    const thumbnailUrl = videoId
                      ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`
                      : 'https://picsum.photos/seed/live/200/120';
                    const isActive = ['activo', 'active', 'estable', 'en vivo'].includes(
                      String(item.estado ?? '').trim().toLowerCase(),
                    );
                    const startDate = item.incio ? new Date(item.incio) : null;
                    const endDate = item.fin ? new Date(item.fin) : null;
                    const startLabel =
                      startDate && !Number.isNaN(startDate.getTime())
                        ? startDate.toLocaleString('es-BO')
                        : item.incio || '—';
                    const endLabel =
                      endDate && !Number.isNaN(endDate.getTime())
                        ? endDate.toLocaleString('es-BO')
                        : item.fin || 'En curso';

                    return (
                      <div
                        key={`${item.broadcastId || item.watchUrl}-${item.incio}-${index}`}
                        className={`rn-view ${s.recentRow}`}
                      >
                        <button
                          type="button"
                          className={`rn-pressable ${s.recentThumbBtn}`}
                          onClick={() => {
                            if (item.watchUrl) {
                              try {
                                window.open(item.watchUrl, '_blank', 'noopener,noreferrer');
                              } catch (error) {
                                console.error('No se pudo abrir el video de YouTube:', error);
                              }
                            }
                          }}
                          disabled={!item.watchUrl}
                          aria-label={`Abrir en YouTube: ${item.nombre || 'transmisión'}`}
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={thumbnailUrl} alt="" className={s.recentThumb} loading="lazy" />
                        </button>

                        <div className={`rn-view ${s.recentDetails}`}>
                          <span className={`rn-text rn-clamp ${s.recentTitle}`} style={clamp1}>
                            {item.nombre || 'Transmisión sin título'}
                          </span>
                          <span className={`rn-text rn-clamp ${s.recentCategory}`} style={clamp1}>
                            {item.descripcion || 'Sin descripción'}
                          </span>
                          <span className={`rn-text rn-clamp ${s.recentTime}`} style={clamp1}>
                            Inicio: {startLabel}
                          </span>
                          <span className={`rn-text rn-clamp ${s.recentAuthor}`} style={clamp1}>
                            Fin: {endLabel}
                          </span>
                        </div>

                        <div className={`rn-view ${s.recentStats}`}>
                          <span className={`rn-text ${s.recentViewers}`}>
                            {(item.espectadores ?? 0).toLocaleString()}
                          </span>
                          <span className={`rn-text ${s.recentViewersLabel}`}>Espectadores</span>
                        </div>

                        <div className={`rn-view ${s.recentStatus} ${isActive ? s.recentStatusOk : ''}`}>
                          <div className={`rn-view ${s.recentStatusDot} ${isActive ? s.recentStatusDotOk : ''}`} />
                          <span className={`rn-text ${s.recentStatusText}`}>{item.estado || 'Desconocido'}</span>
                        </div>

                        <button
                          type="button"
                          className={`rn-pressable ${s.detailsButton} ${!item.broadcastId ? s.btnDisabled : ''}`}
                          onClick={() => setSelectedChatStream(item)}
                          disabled={!item.broadcastId}
                          aria-label={`Ver chat de ${item.nombre || 'transmisión'}`}
                        >
                          <IoChatbubblesOutline size={14} color={LiveTheme.textSecondary} />
                          <span className={`rn-text ${s.detailsButtonText}`}>Ver chat</span>
                        </button>
                      </div>
                    );
                  })
                )}

                {!recentStreamsLoading && !recentStreamsError && streamsPagination.totalCount > 0 && (
                  <div className={`rn-view ${s.paginationRow}`}>
                    <span className={`rn-text ${s.paginationInfo}`}>
                      Página {streamsPageIndex} de {streamsPagination.totalPages} · {streamsPagination.totalCount}{' '}
                      transmisiones
                    </span>
                    <div className={`rn-view ${s.paginationActions}`}>
                      <button
                        type="button"
                        className={`rn-pressable ${s.paginationButton} ${
                          !streamsPagination.hasPreviousPage ? s.btnDisabled : ''
                        }`}
                        onClick={() => setStreamsPageIndex((page) => Math.max(1, page - 1))}
                        disabled={!streamsPagination.hasPreviousPage}
                      >
                        <span className={`rn-text ${s.paginationButtonText}`}>Anterior</span>
                      </button>
                      <button
                        type="button"
                        className={`rn-pressable ${s.paginationButton} ${
                          !streamsPagination.hasNextPage ? s.btnDisabled : ''
                        }`}
                        onClick={() => setStreamsPageIndex((page) => page + 1)}
                        disabled={!streamsPagination.hasNextPage}
                      >
                        <span className={`rn-text ${s.paginationButtonText}`}>Siguiente</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}

          {activeSection === 'content' && <ContentManagementPanel />}

          {activeSection === 'users' && <UserModerationPanel />}
        </main>

        {/* COLUMNA DERECHA */}
        {activeSection === 'live' && (
          <aside className={`rn-view ${s.rightColumn}`}>
            {/* ESTADO ACTUAL */}
            <div className={`rn-view ${s.card}`}>
              <div className={`rn-view ${s.cardHeaderRow}`}>
                <IoRadioOutline size={16} color={LiveTheme.textSecondary} />
                <span className={`rn-text ${s.cardTitle}`}>Estado Actual</span>
              </div>

              <div className={`rn-view ${s.liveStatusBox}`}>
                <div className={`rn-view ${s.liveStatusHeadline}`}>
                  <div className={`rn-view ${s.liveStatusDot} ${hasActiveStream ? s.liveStatusDotActive : ''}`} />
                  <span className={`rn-text ${s.liveStatusTitle} ${!hasActiveStream ? s.liveStatusOffline : ''}`}>
                    {hasActiveStream ? 'EN VIVO AHORA' : 'SIN TRANSMISIÓN'}
                  </span>
                </div>
                <span className={`rn-text ${s.liveStatusInfo}`}>
                  {hasActiveStream ? activeStream?.titulo || 'Sesión activa' : 'No hay sesión activa'}
                </span>
                <span className={`rn-text ${s.liveStatusInfo}`}>
                  {hasActiveStream
                    ? activeStream?.descripcion || 'Transmisión publicada'
                    : 'Esperando publicación'}
                </span>
              </div>

              <button
                type="button"
                className={`rn-pressable ${s.infoButton} ${loadingCredentials ? s.btnDisabled : ''}`}
                onClick={handleFetchCredentials}
                disabled={loadingCredentials}
              >
                {loadingCredentials ? (
                  <span className="rn-spinner" style={{ color: LiveTheme.white, width: 16, height: 16 }} />
                ) : (
                  <span className={`rn-text ${s.infoButtonText}`}>Obtener Información</span>
                )}
              </button>

              <button
                type="button"
                className={`rn-pressable ${s.stopButton} ${
                  !hasActiveStream || stopping || publishing ? s.btnDisabled : ''
                }`}
                onClick={handleStopStream}
                disabled={!hasActiveStream || stopping || publishing}
              >
                {stopping ? (
                  <span className="rn-spinner" style={{ color: LiveTheme.white, width: 16, height: 16 }} />
                ) : (
                  <>
                    <div className={`rn-view ${s.stopIconSquare}`} />
                    <span className={`rn-text ${s.stopButtonText}`}>TERMINAR LIVE</span>
                  </>
                )}
              </button>
            </div>

            {/* ESTADÍSTICAS EN TIEMPO REAL */}
            <div className={`rn-view ${s.card}`}>
              <div className={`rn-view ${s.cardHeaderRow}`}>
                <IoStatsChartOutline size={16} color={LiveTheme.textSecondary} />
                <span className={`rn-text ${s.cardTitle}`}>Estadísticas actuales en tiempo real</span>
              </div>

              {/* HISTORIAL DE CONEXIONES ENVIADO POR EL HUB */}
              <div className={`rn-view ${s.chartContainer}`}>
                <svg className={s.chartSvg} height="80" width="100%" viewBox="0 0 300 80">
                  {chartPath ? <path d={chartPath} stroke={LiveTheme.gold} strokeWidth="2" fill="none" /> : null}
                </svg>
              </div>

              <div className={`rn-view ${s.statsRow}`}>
                <span className={`rn-text ${s.statsLabel}`}>Conectados ahora</span>
                <span className={`rn-text ${s.statsValue}`}>{connectedCount.toLocaleString('es-BO')}</span>
              </div>

              <div className={`rn-view ${s.statsRow}`}>
                <span className={`rn-text ${s.statsLabel}`}>Pico máximo</span>
                <span className={`rn-text ${s.statsValue}`}>{peakConnectedCount.toLocaleString('es-BO')}</span>
              </div>
            </div>
          </aside>
        )}
      </div>
    </div>
  );
}
