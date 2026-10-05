'use client';

import { useEffect, useState } from 'react';
import s from './AdSlot.module.css';

type AdItem = {
  imageUrl: string;
  alt?: string;
};

type AdSlotProps = {
  placement: 'left' | 'right';
};

const DEFAULT_AD_IMAGE =
  'https://www.honda.mx/web/img/motorcycles/home/slides/MASTER-998x1500-TORNADO.jpg';

// Publicidad de prueba. Posteriormente estas piezas pueden reemplazarse
// por creatividades reales proporcionadas/autorizadas por el anunciante.
const ADS: AdItem[] = [
  { imageUrl: DEFAULT_AD_IMAGE, alt: 'Publicidad' },
  { imageUrl: DEFAULT_AD_IMAGE, alt: 'Publicidad' },
  { imageUrl: DEFAULT_AD_IMAGE, alt: 'Publicidad' },
];

const ROTATION_MS = 10000;

export function AdSlot({ placement }: AdSlotProps) {
  const [currentIndex, setCurrentIndex] = useState(placement === 'right' ? 1 : 0);

  const currentAd = ADS[currentIndex];

  useEffect(() => {
    if (ADS.length < 2) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % ADS.length);
    }, ROTATION_MS);

    return () => clearInterval(interval);
  }, []);

  const goPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + ADS.length) % ADS.length);
  };

  const goNext = () => {
    setCurrentIndex((prev) => (prev + 1) % ADS.length);
  };

  return (
    <div className={`rn-view ${s.slot}`} aria-label={'Publicidad ' + placement}>
      <div className={`rn-view ${s.mediaFrame}`}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={currentAd.imageUrl} alt={currentAd.alt || 'Publicidad'} className={s.image} />
      </div>

      <div className={`rn-view ${s.labelContainer}`}>
        <span className={`rn-text ${s.label}`}>PUBLICIDAD</span>
      </div>

      {ADS.length > 1 && (
        <>
          <button
            type="button"
            aria-label="Publicidad anterior"
            onClick={goPrevious}
            className={`rn-pressable ${s.arrowButton} ${s.leftArrow}`}
          >
            <span className={`rn-text ${s.arrowText}`}>‹</span>
          </button>

          <button
            type="button"
            aria-label="Publicidad siguiente"
            onClick={goNext}
            className={`rn-pressable ${s.arrowButton} ${s.rightArrow}`}
          >
            <span className={`rn-text ${s.arrowText}`}>›</span>
          </button>

          <div className={`rn-view ${s.indicator}`}>
            <span className={`rn-text ${s.indicatorText}`}>
              {currentIndex + 1}/{ADS.length}
            </span>
          </div>
        </>
      )}
    </div>
  );
}
