'use client';

import type { CSSProperties } from 'react';
import s from './PromoCard.module.css';

// Aceptamos las propiedades individuales o un objeto noticia
export interface PromoCardProps {
  id?: string | number;
  category?: string;
  categoria?: string;
  title?: string;
  titulo?: string;
  description?: string;
  descripcion?: string;
  imageUrl?: string;
  urlImagen?: string;
  url?: string;
  onPress?: (urlOrId: string) => void;
  onCategoryPress?: (categoria: string) => void;
  noticia?: {
    id?: number | string;
    titulo?: string;
    categoria?: string;
    urlImagen?: string;
    descripcion?: string;
    fecha?: string;
    url?: string;
  };
}

const clamp4 = { '--lines': 4 } as CSSProperties;

export function PromoCard(props: PromoCardProps) {
  // Normalizamos las propiedades por si vienen dentro de 'noticia' o sueltas
  const cat = props.noticia?.categoria || props.category || props.categoria || '';
  const tit = props.noticia?.titulo || props.title || props.titulo || '';
  const desc = props.noticia?.descripcion || props.description || props.descripcion || '';
  const img = props.noticia?.urlImagen || props.imageUrl || props.urlImagen || '';
  const targetUrl = props.noticia?.url || props.url || '';
  const cardId = String(props.noticia?.id || props.id || '');

  const handlePress = () => {
    if (props.onPress) {
      props.onPress(targetUrl || cardId);
    } else if (targetUrl) {
      // Linking.openURL en web abre una pestaña nueva.
      try {
        window.open(targetUrl, '_blank', 'noopener,noreferrer');
      } catch (err) {
        console.error('Error al abrir la URL:', err);
      }
    }
  };

  const handleVerMas = () => {
    if (props.onCategoryPress && cat) {
      props.onCategoryPress(cat);
    } else {
      handlePress();
    }
  };

  return (
    <div className={`rn-view ${s.card}`}>
      {/* HEADER: CATEGORÍA + "VER MÁS" */}
      <div className={`rn-view ${s.header}`}>
        <span className={`rn-text rn-line-1 ${s.category}`}>{cat}</span>
        <button type="button" className={`rn-pressable ${s.verMasBtn}`} onClick={handleVerMas}>
          <span className={`rn-text ${s.verMas}`}>Ver más →</span>
        </button>
      </div>

      {/* CUERPO: IMAGEN + TEXTO */}
      <button type="button" className={`rn-pressable ${s.body}`} onClick={handlePress}>
        {img ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={img} alt={tit} className={s.image} loading="lazy" decoding="async" />
        ) : (
          <div className={`rn-view ${s.imagePlaceholder}`}>
            <span className={`rn-text ${s.imagePlaceholderText}`}>
              ESPACIO{'\n'}PUBLICITARIO
            </span>
          </div>
        )}

        <div className={`rn-view ${s.textContent}`}>
          <span className={`rn-text rn-clamp ${s.title}`} style={clamp4}>
            {tit}
          </span>
          <span className={`rn-text rn-clamp ${s.description}`} style={clamp4}>
            {desc}
          </span>
        </div>
      </button>
    </div>
  );
}
