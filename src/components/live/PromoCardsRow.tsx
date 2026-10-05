'use client';

import { useEffect, useMemo, useState } from 'react';
import { useWindowDimensions } from '@/hooks/use-window-dimensions';
import { api, type NoticiaItem, type PagedResponse } from '@/services/api';
import { PromoCard } from './PromoCard';
import s from './PromoCardsRow.module.css';

function getColumns(width: number) {
  if (width >= 1024) return 4;
  if (width >= 640) return 2;
  return 1;
}

export function PromoCardsRow() {
  const { width } = useWindowDimensions();
  const columns = getColumns(width);

  const gap = width >= 1024 ? 10 : 12;

  const [data, setData] = useState<PagedResponse<NoticiaItem> | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentOffset, setCurrentOffset] = useState(0);

  useEffect(() => {
    const loadNoticias = async () => {
      try {
        setLoading(true);

        const response = await api.getNoticias(1, 4);

        if (response) {
          setData(response);
        }
      } catch (error) {
        console.error('Error cargando noticias:', error);
      } finally {
        setLoading(false);
      }
    };

    void loadNoticias();
  }, []);

  /*
   * Para la prueba del carrusel: si el backend devuelve 1 2 3 4,
   * temporalmente tendremos 1 2 3 4 1 2 3 4, lo que permite comprobar
   * el desplazamiento sin modificar el backend.
   */
  const carouselItems = useMemo(() => {
    if (!data?.items?.length) {
      return [];
    }

    return [...data.items, ...data.items];
  }, [data]);

  // Cuánto ocupa una tarjeta.
  const cardWidth = width >= 1024 ? (width - gap * 4) / 4.25 : (width - gap * 4) / 5;

  // Cada clic desplaza exactamente una tarjeta.
  const slideDistance = cardWidth + gap;

  const moveNext = () => {
    if (currentOffset >= carouselItems.length - 4) return;
    setCurrentOffset(currentOffset + 1);
  };

  const movePrevious = () => {
    if (currentOffset <= 0) return;
    setCurrentOffset(currentOffset - 1);
  };

  const canMoveNext = currentOffset < carouselItems.length - 4;
  const canMovePrevious = currentOffset > 0;

  return (
    <div className={`rn-view ${s.container}`}>
      <div className={`rn-view ${s.contentRow}`}>
        <div className={`rn-view ${s.cardsArea}`}>
          {loading ? (
            <div className={`rn-view ${s.loaderContainer}`}>
              <span className={`rn-spinner ${s.spinnerLarge}`} />
            </div>
          ) : (
            <div className={`rn-view ${s.viewport}`}>
              <div
                className={`rn-view ${s.cardsTrack}`}
                style={{
                  gap,
                  transform: `translateX(${-(currentOffset * slideDistance)}px)`,
                }}
              >
                {carouselItems.map((item, index) => (
                  <div
                    key={`${item.titulo}-${index}`}
                    className="rn-view"
                    style={{
                      width: columns === 4 ? cardWidth : `${100 / columns}%`,
                    }}
                  >
                    <PromoCard noticia={item} />
                  </div>
                ))}
              </div>

              {/* FLECHA IZQUIERDA */}
              {canMovePrevious && (
                <button
                  type="button"
                  aria-label="Noticias anteriores"
                  onClick={movePrevious}
                  className={`rn-pressable ${s.overlayArrow} ${s.overlayArrowLeft}`}
                >
                  <span className={`rn-text ${s.overlayArrowText}`}>‹</span>
                </button>
              )}

              {/* FLECHA DERECHA */}
              {canMoveNext && (
                <button
                  type="button"
                  aria-label="Siguientes noticias"
                  onClick={moveNext}
                  className={`rn-pressable ${s.overlayArrow} ${s.overlayArrowRight}`}
                >
                  <span className={`rn-text ${s.overlayArrowText}`}>›</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
