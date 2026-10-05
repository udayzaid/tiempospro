'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { FaTiktok } from 'react-icons/fa';
import { api, type ReelGetDto } from '@/services/api';
import { ReelCard } from './ReelCard';
import s from './ReelSection.module.css';

export function ReelSection() {
  const listRef = useRef<HTMLDivElement>(null);
  const [reels, setReels] = useState<ReelGetDto[]>([]);
  const [pageIndex, setPageIndex] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(true);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [listOffset, setListOffset] = useState(0);
  const [listWidth, setListWidth] = useState(0);
  const [viewportWidth, setViewportWidth] = useState(0);

  const fetchReels = async (page: number) => {
    if (loading || (page > 1 && !hasNextPage)) return;

    if (page === 1) setLoading(true);
    else setLoadingMore(true);

    try {
      const response = await api.getReels(page, 10);

      setReels((prev) => (page === 1 ? response.items : [...prev, ...response.items]));
      setHasNextPage(response.hasNextPage);
      setPageIndex(response.pageIndex);
    } catch (error) {
      console.error('Error cargando los reels:', error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    fetchReels(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleLoadMore = () => {
    if (hasNextPage && !loadingMore) {
      fetchReels(pageIndex + 1);
    }
  };

  // Lee scrollWidth / clientWidth / scrollLeft del DOM (equivale a onLayout + onContentSizeChange).
  const measure = useCallback(() => {
    const el = listRef.current;
    if (!el) return;
    setListWidth(el.scrollWidth);
    setViewportWidth(el.clientWidth);
    setListOffset(el.scrollLeft);
  }, []);

  useEffect(() => {
    const el = listRef.current;
    if (!el) return;
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    Array.from(el.children).forEach((child) => observer.observe(child));
    return () => observer.disconnect();
  }, [measure, reels, loading, loadingMore]);

  const handleScroll = () => {
    const el = listRef.current;
    if (!el) return;
    setListOffset(el.scrollLeft);
    // onEndReachedThreshold = 0.5 (medio viewport antes del final)
    if (el.scrollLeft + el.clientWidth >= el.scrollWidth - el.clientWidth * 0.5) {
      handleLoadMore();
    }
  };

  const scrollByCard = (direction: -1 | 1) => {
    const maxOffset = Math.max(0, listWidth - viewportWidth);
    const nextOffset = Math.max(0, Math.min(maxOffset, listOffset + direction * 122));

    listRef.current?.scrollTo({ left: nextOffset, behavior: 'smooth' });
    setListOffset(nextOffset);
  };

  const canScrollPrevious = listOffset > 4;
  const canScrollNext = listOffset < listWidth - viewportWidth - 4;

  if (loading) {
    return (
      <div className={`rn-view ${s.centerContainer}`}>
        <span className="rn-spinner" />
      </div>
    );
  }

  if (reels.length === 0) return null;

  return (
    <section className={`rn-view ${s.container}`} aria-label="Videos cortos">
      <div className={`rn-view ${s.sectionHeader}`}>
        <div className={`rn-view ${s.headerTitleGroup}`}>
          <FaTiktok size={18} color="#111111" className={s.tiktokIcon} />

          <h2 className={`rn-text ${s.sectionTitle}`}>VIDEOS CORTOS</h2>

          <div className={`rn-view ${s.headerDivider}`} />

          <span className={`rn-text ${s.sectionSubtitle}`}>Historias que te mantienen informado</span>
        </div>

        <a
          href="https://www.tiktok.com/@lostiemposbol"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Ver todos los videos de Los Tiempos en TikTok"
          className={`rn-view ${s.viewAllButton}`}
          style={{ textDecoration: 'none' }}
        >
          <span className={`rn-text ${s.viewAll}`}>Ver todos →</span>
        </a>
      </div>

      <div className={`rn-view ${s.listViewport}`}>
        <div ref={listRef} className={`rn-hscroll ${s.list}`} onScroll={handleScroll}>
          {reels.map((item, index) => (
            <ReelCard key={item.tiktokVideoId + '-' + index} item={item} />
          ))}

          {loadingMore ? (
            <div className={`rn-view ${s.footerLoader}`}>
              <span className="rn-spinner" />
            </div>
          ) : null}
        </div>

        {canScrollPrevious && (
          <button
            type="button"
            aria-label="Reels anteriores"
            onClick={() => scrollByCard(-1)}
            className={`rn-pressable ${s.overlayArrow} ${s.overlayArrowLeft}`}
          >
            <span className={`rn-text ${s.overlayArrowText}`}>‹</span>
          </button>
        )}

        {canScrollNext && (
          <button
            type="button"
            aria-label="Siguientes reels"
            onClick={() => scrollByCard(1)}
            className={`rn-pressable ${s.overlayArrow} ${s.overlayArrowRight}`}
          >
            <span className={`rn-text ${s.overlayArrowText}`}>›</span>
          </button>
        )}
      </div>
    </section>
  );
}
