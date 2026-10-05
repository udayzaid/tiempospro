'use client';

import { useCallback, useEffect, useState, type CSSProperties, type ReactNode } from 'react';
import {
  IoAdd,
  IoLayersOutline,
  IoNewspaperOutline,
  IoOpenOutline,
  IoPlayCircleOutline,
  IoRefreshOutline,
  IoTrashOutline,
} from 'react-icons/io5';
import { api, type NoticiaItem, type PagedResponse, type ReelGetDto } from '@/services/api';
import { LiveTheme } from '@/constants/live-theme';
import s from './ContentManagementPanel.module.css';

type ContentTab = 'news' | 'reels';
type Pagination = Pick<PagedResponse<unknown>, 'pageIndex' | 'totalPages' | 'totalCount' | 'hasPreviousPage' | 'hasNextPage'>;
const PAGE_SIZE = 10;
const EMPTY_PAGINATION: Pagination = {
  pageIndex: 1,
  totalPages: 1,
  totalCount: 0,
  hasPreviousPage: false,
  hasNextPage: false,
};

const clamp1 = { '--lines': 1 } as CSSProperties;
const clamp2 = { '--lines': 2 } as CSSProperties;

function formatDate(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value || '—' : date.toLocaleDateString('es-BO');
}

/* Fila común de noticia / reel (misma estructura en ambos listados). */
type ItemRowProps = {
  id?: number;
  imageUrl?: string;
  placeholderIcon: ReactNode;
  title: string;
  description: string;
  meta: string;
  metaSingleLine?: boolean;
  openLabel: string;
  deleteLabel: string;
  confirmLabel: string;
  linkUrl: string;
  confirming: boolean;
  deleting: boolean;
  onOpen: () => void;
  onToggleConfirm: () => void;
  onCancel: () => void;
  onDelete: () => void;
};

function ItemRow(p: ItemRowProps) {
  return (
    <div className="rn-view">
      <div className={`rn-view ${s.itemRow}`}>
        {p.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={p.imageUrl} alt="" className={s.thumbnail} loading="lazy" />
        ) : (
          <div className={`rn-view ${s.thumbnailPlaceholder}`}>{p.placeholderIcon}</div>
        )}
        <div className={`rn-view ${s.itemCopy}`}>
          <span className={`rn-text rn-clamp ${s.itemTitle}`} style={clamp2}>
            {p.title}
          </span>
          <span className={`rn-text rn-clamp ${s.itemDescription}`} style={clamp1}>
            {p.description}
          </span>
          <span
            className={`rn-text ${p.metaSingleLine ? 'rn-clamp' : ''} ${s.itemMeta}`}
            style={p.metaSingleLine ? clamp1 : undefined}
          >
            {p.meta}
          </span>
        </div>
        <div className={`rn-view ${s.itemActions}`}>
          <button
            type="button"
            className={`rn-pressable ${s.openButton}`}
            onClick={p.onOpen}
            disabled={!p.linkUrl}
            aria-label={p.openLabel}
          >
            <IoOpenOutline size={16} color={LiveTheme.textSecondary} />
          </button>
          <button
            type="button"
            className={`rn-pressable ${s.deleteButton} ${p.id == null || p.deleting ? s.disabled : ''}`}
            onClick={p.onToggleConfirm}
            disabled={p.id == null || p.deleting}
            aria-label={p.deleteLabel}
          >
            {p.deleting ? (
              <span className={`rn-spinner ${s.spinnerSmall}`} />
            ) : (
              <IoTrashOutline size={16} color={LiveTheme.error} />
            )}
          </button>
        </div>
      </div>
      {p.confirming && p.id != null && (
        <div className={`rn-view ${s.deleteConfirmation}`}>
          <span className={`rn-text ${s.confirmationText}`}>{p.confirmLabel}</span>
          <div className={`rn-view ${s.confirmationActions}`}>
            <button
              type="button"
              className={`rn-pressable ${s.cancelDeleteButton}`}
              onClick={p.onCancel}
              disabled={p.deleting}
            >
              <span className={`rn-text ${s.cancelDeleteText}`}>Cancelar</span>
            </button>
            <button
              type="button"
              className={`rn-pressable ${s.confirmDeleteButton}`}
              onClick={p.onDelete}
              disabled={p.deleting}
            >
              <span className={`rn-text ${s.confirmDeleteText}`}>{p.deleting ? 'Eliminando...' : 'Eliminar'}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export function ContentManagementPanel() {
  const [tab, setTab] = useState<ContentTab>('news');
  const [news, setNews] = useState<NoticiaItem[]>([]);
  const [reels, setReels] = useState<ReelGetDto[]>([]);
  const [newsPage, setNewsPage] = useState(1);
  const [reelsPage, setReelsPage] = useState(1);
  const [newsPagination, setNewsPagination] = useState(EMPTY_PAGINATION);
  const [reelsPagination, setReelsPagination] = useState(EMPTY_PAGINATION);
  const [newsLoading, setNewsLoading] = useState(true);
  const [reelsLoading, setReelsLoading] = useState(false);
  const [newsError, setNewsError] = useState('');
  const [reelsError, setReelsError] = useState('');
  const [newsUrl, setNewsUrl] = useState('');
  const [reelUrl, setReelUrl] = useState('');
  const [creatingNews, setCreatingNews] = useState(false);
  const [creatingReel, setCreatingReel] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [confirmDeleteReelId, setConfirmDeleteReelId] = useState<number | null>(null);
  const [deletingReelId, setDeletingReelId] = useState<number | null>(null);
  const [notice, setNotice] = useState<{ kind: 'success' | 'error'; text: string } | null>(null);

  const loadNews = useCallback(async (page: number) => {
    setNewsLoading(true);
    setNewsError('');
    try {
      const result = await api.getAllNoticias(page, PAGE_SIZE);
      setNews(result.items ?? []);
      setNewsPage(result.pageIndex ?? page);
      setNewsPagination({
        pageIndex: result.pageIndex ?? page,
        totalPages: result.totalPages ?? 1,
        totalCount: result.totalCount ?? 0,
        hasPreviousPage: result.hasPreviousPage ?? page > 1,
        hasNextPage: result.hasNextPage ?? false,
      });
    } catch (error: any) {
      setNews([]);
      setNewsError(error?.message || 'No se pudieron cargar las noticias.');
    } finally {
      setNewsLoading(false);
    }
  }, []);

  const loadReels = useCallback(async (page: number) => {
    setReelsLoading(true);
    setReelsError('');
    try {
      const result = await api.getAllReels(page, PAGE_SIZE);
      setReels(result.items ?? []);
      setReelsPage(result.pageIndex ?? page);
      setReelsPagination({
        pageIndex: result.pageIndex ?? page,
        totalPages: result.totalPages ?? 1,
        totalCount: result.totalCount ?? 0,
        hasPreviousPage: result.hasPreviousPage ?? page > 1,
        hasNextPage: result.hasNextPage ?? false,
      });
    } catch (error: any) {
      setReels([]);
      setReelsError(error?.message || 'No se pudieron cargar los reels.');
    } finally {
      setReelsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadNews(newsPage);
  }, [loadNews, newsPage]);
  useEffect(() => {
    void loadReels(reelsPage);
  }, [loadReels, reelsPage]);

  const handleCreateNews = async () => {
    const url = newsUrl.trim();
    if (!url) {
      setNotice({ kind: 'error', text: 'Ingresa la URL de la noticia.' });
      return;
    }

    try {
      new URL(url);
    } catch {
      setNotice({ kind: 'error', text: 'Ingresa una URL válida, incluyendo https://.' });
      return;
    }

    setCreatingNews(true);
    setNotice(null);
    try {
      await api.createNoticia(url);
      setNewsUrl('');
      setNotice({ kind: 'success', text: 'La noticia se agregó correctamente.' });
      if (newsPage === 1) void loadNews(1);
      else setNewsPage(1);
    } catch (error: any) {
      setNotice({ kind: 'error', text: error?.message || 'No se pudo agregar la noticia.' });
    } finally {
      setCreatingNews(false);
    }
  };

  const handleDeleteNews = async (item: NoticiaItem) => {
    if (item.id == null) return;

    setDeletingId(item.id);
    setNotice(null);
    try {
      await api.deleteNoticia(item.id);
      setConfirmDeleteId(null);
      setNotice({ kind: 'success', text: 'La noticia se eliminó correctamente.' });
      if (news.length === 1 && newsPage > 1) setNewsPage(newsPage - 1);
      else void loadNews(newsPage);
    } catch (error: any) {
      setNotice({ kind: 'error', text: error?.message || 'No se pudo eliminar la noticia.' });
    } finally {
      setDeletingId(null);
    }
  };

  const handleCreateReel = async () => {
    const url = reelUrl.trim();
    if (!url) {
      setNotice({ kind: 'error', text: 'Ingresa la URL del reel.' });
      return;
    }

    try {
      new URL(url);
    } catch {
      setNotice({ kind: 'error', text: 'Ingresa una URL válida, incluyendo https://.' });
      return;
    }

    setCreatingReel(true);
    setNotice(null);
    try {
      await api.createReel(url);
      setReelUrl('');
      setNotice({ kind: 'success', text: 'El reel se agregó correctamente.' });
      if (reelsPage === 1) void loadReels(1);
      else setReelsPage(1);
    } catch (error: any) {
      setNotice({ kind: 'error', text: error?.message || 'No se pudo agregar el reel.' });
    } finally {
      setCreatingReel(false);
    }
  };

  const handleDeleteReel = async (item: ReelGetDto) => {
    if (item.id == null) return;

    setDeletingReelId(item.id);
    setNotice(null);
    try {
      await api.deleteReel(item.id);
      setConfirmDeleteReelId(null);
      setNotice({ kind: 'success', text: 'El reel se eliminó correctamente.' });
      if (reels.length === 1 && reelsPage > 1) setReelsPage(reelsPage - 1);
      else void loadReels(reelsPage);
    } catch (error: any) {
      setNotice({ kind: 'error', text: error?.message || 'No se pudo eliminar el reel.' });
    } finally {
      setDeletingReelId(null);
    }
  };

  const openLink = (url: string) => {
    if (!url) return;
    try {
      window.open(url, '_blank', 'noopener,noreferrer');
    } catch (error) {
      console.error('No se pudo abrir el contenido:', error);
    }
  };

  const currentLoading = tab === 'news' ? newsLoading : reelsLoading;
  const currentError = tab === 'news' ? newsError : reelsError;
  const currentPagination = tab === 'news' ? newsPagination : reelsPagination;
  const currentPage = tab === 'news' ? newsPage : reelsPage;
  const setCurrentPage = tab === 'news' ? setNewsPage : setReelsPage;

  const noticeBox = notice && (
    <span className={`rn-text ${s.notice} ${notice.kind === 'success' ? s.successNotice : s.errorNotice}`}>
      {notice.text}
    </span>
  );

  return (
    <div className={`rn-view ${s.container}`}>
      <div className={`rn-view ${s.heading}`}>
        <div className={`rn-view ${s.headingIcon}`}>
          <IoLayersOutline size={18} color={LiveTheme.goldDark} />
        </div>
        <div className={`rn-view ${s.headingCopy}`}>
          <span className={`rn-text ${s.title}`}>Gestión de contenido</span>
          <span className={`rn-text ${s.subtitle}`}>Administra las noticias y consulta los reels publicados.</span>
        </div>
      </div>

      <div className={`rn-view ${s.tabs}`}>
        <button type="button" className={`rn-pressable ${s.tab} ${tab === 'news' ? s.tabActive : ''}`} onClick={() => setTab('news')}>
          <IoNewspaperOutline size={16} color={tab === 'news' ? LiveTheme.goldDark : LiveTheme.textMuted} />
          <span className={`rn-text ${s.tabText} ${tab === 'news' ? s.tabTextActive : ''}`}>Noticias</span>
          <span className={`rn-text ${s.tabCount}`}>{newsPagination.totalCount}</span>
        </button>
        <button type="button" className={`rn-pressable ${s.tab} ${tab === 'reels' ? s.tabActive : ''}`} onClick={() => setTab('reels')}>
          <IoPlayCircleOutline size={17} color={tab === 'reels' ? LiveTheme.goldDark : LiveTheme.textMuted} />
          <span className={`rn-text ${s.tabText} ${tab === 'reels' ? s.tabTextActive : ''}`}>Reels</span>
          <span className={`rn-text ${s.tabCount}`}>{reelsPagination.totalCount}</span>
        </button>
      </div>

      {tab === 'news' && (
        <div className={`rn-view ${s.createCard}`}>
          <div className={`rn-view ${s.createHeading}`}>
            <div className={`rn-view ${s.createIcon}`}>
              <IoAdd size={17} color={LiveTheme.goldDark} />
            </div>
            <div className="rn-view">
              <span className={`rn-text ${s.createTitle}`}>Agregar noticia</span>
              <span className={`rn-text ${s.createHelp}`}>Pega el enlace de la publicación para registrarla.</span>
            </div>
          </div>
          <div className={`rn-view ${s.formRow}`}>
            <input
              value={newsUrl}
              onChange={(e) => setNewsUrl(e.target.value)}
              placeholder="https://www.lostiempos.com/..."
              autoCapitalize="none"
              autoCorrect="off"
              inputMode="url"
              className={`rn-input ${s.input}`}
              aria-label="URL de la noticia"
              onKeyDown={(e) => {
                if (e.key === 'Enter') void handleCreateNews();
              }}
            />
            <button
              type="button"
              className={`rn-pressable ${s.submitButton} ${creatingNews ? `${s.submitLoading} ${s.disabled}` : ''}`}
              onClick={handleCreateNews}
              disabled={creatingNews}
            >
              {creatingNews ? (
                <span className={`rn-spinner ${s.spinnerSmall}`} style={{ color: LiveTheme.black }} />
              ) : (
                <IoAdd size={16} color={LiveTheme.black} />
              )}
              <span className={`rn-text ${s.submitText}`}>{creatingNews ? 'Agregando' : 'Agregar'}</span>
            </button>
          </div>
          {noticeBox}
        </div>
      )}
      {tab === 'reels' && (
        <div className={`rn-view ${s.createCard}`}>
          <div className={`rn-view ${s.createHeading}`}>
            <div className={`rn-view ${s.createIcon}`}>
              <IoAdd size={17} color={LiveTheme.goldDark} />
            </div>
            <div className="rn-view">
              <span className={`rn-text ${s.createTitle}`}>Agregar reel</span>
              <span className={`rn-text ${s.createHelp}`}>Pega el enlace del video para registrarlo.</span>
            </div>
          </div>
          <div className={`rn-view ${s.formRow}`}>
            <input
              value={reelUrl}
              onChange={(e) => setReelUrl(e.target.value)}
              placeholder="https://www.tiktok.com/@.../video/..."
              autoCapitalize="none"
              autoCorrect="off"
              inputMode="url"
              className={`rn-input ${s.input}`}
              aria-label="URL del reel"
              onKeyDown={(e) => {
                if (e.key === 'Enter') void handleCreateReel();
              }}
            />
            <button
              type="button"
              className={`rn-pressable ${s.submitButton} ${creatingReel ? `${s.submitLoading} ${s.disabled}` : ''}`}
              onClick={handleCreateReel}
              disabled={creatingReel}
            >
              {creatingReel ? (
                <span className={`rn-spinner ${s.spinnerSmall}`} style={{ color: LiveTheme.black }} />
              ) : (
                <IoAdd size={16} color={LiveTheme.black} />
              )}
              <span className={`rn-text ${s.submitText}`}>{creatingReel ? 'Agregando' : 'Agregar'}</span>
            </button>
          </div>
          {noticeBox}
        </div>
      )}

      <div className={`rn-view ${s.listHeader}`}>
        <div className="rn-view">
          <span className={`rn-text ${s.listTitle}`}>{tab === 'news' ? 'Noticias registradas' : 'Reels publicados'}</span>
          <span className={`rn-text ${s.listSubtitle}`}>{currentPagination.totalCount} elementos en el catálogo</span>
        </div>
        <button
          type="button"
          className={`rn-pressable ${s.refreshButton}`}
          onClick={() => (tab === 'news' ? void loadNews(newsPage) : void loadReels(reelsPage))}
          disabled={currentLoading}
          aria-label="Actualizar lista"
        >
          {currentLoading ? (
            <span className={`rn-spinner ${s.spinnerSmall}`} style={{ color: LiveTheme.textSecondary }} />
          ) : (
            <IoRefreshOutline size={16} color={LiveTheme.textSecondary} />
          )}
        </button>
      </div>

      {currentLoading ? (
        <div className={`rn-view ${s.stateBox}`}>
          <span className="rn-spinner" />
          <span className={`rn-text ${s.stateText}`}>Cargando {tab === 'news' ? 'noticias' : 'reels'}...</span>
        </div>
      ) : currentError ? (
        <div className={`rn-view ${s.stateBox}`}>
          <span className={`rn-text ${s.stateError}`}>{currentError}</span>
          <button
            type="button"
            className={`rn-pressable ${s.retryButton}`}
            onClick={() => (tab === 'news' ? void loadNews(newsPage) : void loadReels(reelsPage))}
          >
            <span className={`rn-text ${s.retryText}`}>Reintentar</span>
          </button>
        </div>
      ) : tab === 'news' ? (
        news.length ? (
          news.map((item) => (
            <ItemRow
              key={item.id ?? item.url}
              id={item.id}
              imageUrl={item.urlImagen}
              placeholderIcon={<IoNewspaperOutline size={19} color={LiveTheme.textMuted} />}
              title={item.titulo || 'Noticia sin título'}
              description={item.categoria || item.descripcion || 'Sin categoría'}
              meta={formatDate(item.fecha)}
              openLabel="Abrir noticia"
              deleteLabel={`Eliminar ${item.titulo || 'noticia'}`}
              confirmLabel={`¿Eliminar “${item.titulo || 'esta noticia'}”?`}
              linkUrl={item.url}
              confirming={confirmDeleteId === item.id}
              deleting={deletingId === item.id}
              onOpen={() => openLink(item.url)}
              onToggleConfirm={() => setConfirmDeleteId(confirmDeleteId === item.id ? null : (item.id ?? null))}
              onCancel={() => setConfirmDeleteId(null)}
              onDelete={() => void handleDeleteNews(item)}
            />
          ))
        ) : (
          <span className={`rn-text ${s.emptyText}`}>Todavía no hay noticias registradas.</span>
        )
      ) : reels.length ? (
        reels.map((item, index) => (
          <ItemRow
            key={item.id ?? `${item.tiktokVideoId || item.link}-${index}`}
            id={item.id}
            imageUrl={item.portadaUrl}
            placeholderIcon={<IoPlayCircleOutline size={19} color={LiveTheme.textMuted} />}
            title={item.titulo || 'Reel sin título'}
            description="Video corto publicado"
            meta={item.link || 'Enlace no disponible'}
            metaSingleLine
            openLabel="Abrir reel"
            deleteLabel={`Eliminar ${item.titulo || 'reel'}`}
            confirmLabel={`¿Eliminar “${item.titulo || 'este reel'}”?`}
            linkUrl={item.link}
            confirming={confirmDeleteReelId === item.id}
            deleting={deletingReelId === item.id}
            onOpen={() => openLink(item.link)}
            onToggleConfirm={() => setConfirmDeleteReelId(confirmDeleteReelId === item.id ? null : (item.id ?? null))}
            onCancel={() => setConfirmDeleteReelId(null)}
            onDelete={() => void handleDeleteReel(item)}
          />
        ))
      ) : (
        <span className={`rn-text ${s.emptyText}`}>Todavía no hay reels registrados.</span>
      )}

      {!currentLoading && !currentError && currentPagination.totalCount > 0 && (
        <div className={`rn-view ${s.pagination}`}>
          <span className={`rn-text ${s.paginationInfo}`}>
            Página {currentPage} de {currentPagination.totalPages}
          </span>
          <div className={`rn-view ${s.paginationActions}`}>
            <button
              type="button"
              className={`rn-pressable ${s.pageButton} ${!currentPagination.hasPreviousPage ? s.disabled : ''}`}
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={!currentPagination.hasPreviousPage}
            >
              <span className={`rn-text ${s.pageButtonText}`}>Anterior</span>
            </button>
            <button
              type="button"
              className={`rn-pressable ${s.pageButton} ${!currentPagination.hasNextPage ? s.disabled : ''}`}
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={!currentPagination.hasNextPage}
            >
              <span className={`rn-text ${s.pageButtonText}`}>Siguiente</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
