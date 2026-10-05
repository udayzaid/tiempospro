import type { ComponentType } from 'react';
import { FaFacebookF, FaInstagram, FaLinkedinIn, FaTiktok, FaTwitter, FaYoutube } from 'react-icons/fa';
import s from './SiteFooter.module.css';

type FooterLink = {
  label: string;
  url: string;
};

type LinkColumn = {
  heading: string;
  links: FooterLink[];
};

// =========================================================
// CONTENIDO DEL FOOTER
// =========================================================

const COLUMNS: LinkColumn[] = [
  {
    heading: 'Los Tiempos',
    links: [
      { label: 'Staff', url: 'https://www.lostiempos.com/staff' },
      { label: 'Contactos', url: 'https://www.lostiempos.com/contacto' },
    ],
  },
  {
    heading: 'Click - Tu Mirada',
    links: [
      { label: 'Farándula', url: 'https://www.lostiempos.com/doble-click/farandula' },
      { label: 'Servicios', url: 'https://www.lostiempos.com/doble-click/' },
      { label: 'Hemeroteca', url: 'https://www.lostiempos.com/hemeroteca' },
    ],
  },
  {
    heading: 'Deportes',
    links: [
      { label: 'Entretiempo', url: 'https://www.lostiempos.com/deportes/entretiempo' },
      { label: 'Fútbol', url: 'https://www.lostiempos.com/deportes/futbol' },
      { label: 'Fútbol Int.', url: 'https://www.lostiempos.com/deportes/futbol-int' },
    ],
  },
  {
    heading: 'Doble Click',
    links: [
      { label: 'Cultura', url: 'https://www.lostiempos.com/doble-click/cultura' },
      { label: 'Cine', url: 'https://www.lostiempos.com/doble-click/cine' },
      { label: 'Conectados', url: 'https://www.lostiempos.com/doble-click/conectados' },
    ],
  },
  {
    heading: 'Oh!',
    links: [
      { label: 'Paparazzi', url: 'https://www.lostiempos.com/oh/paparazzi' },
      { label: 'Tendencias', url: 'https://www.lostiempos.com/oh/tendencias' },
    ],
  },
  {
    heading: 'Décimos Oh!',
    links: [
      { label: 'Tendencias', url: 'https://www.lostiempos.com/oh/tendencias' },
      { label: 'Interesante', url: 'https://www.lostiempos.com/tendencias/interesante' },
      { label: 'Ciencia', url: 'https://www.lostiempos.com/tendencias/ciencia' },
      { label: 'Cocina', url: 'https://www.lostiempos.com/tendencias/cocina' },
    ],
  },
  {
    heading: 'Actualidad',
    links: [
      { label: 'Mundo', url: 'https://www.lostiempos.com/actualidad/mundo' },
      { label: 'Editorial', url: 'https://www.lostiempos.com/actualidad/opinion' },
      { label: 'Puntos de Vista', url: 'https://www.lostiempos.com/actualidad/opinion' },
    ],
  },
];

// =========================================================
// REDES SOCIALES
// =========================================================

const SOCIAL_LINKS: {
  name: string;
  Icon: ComponentType<{ size?: number; color?: string }>;
  url: string;
}[] = [
  { name: 'Facebook', Icon: FaFacebookF, url: 'https://www.facebook.com/lostiemposbol1/?locale=es_LA' },
  { name: 'X (Twitter)', Icon: FaTwitter, url: 'https://x.com/LosTiemposBol' },
  { name: 'Instagram', Icon: FaInstagram, url: 'https://www.instagram.com/lostiemposbol/?hl=es' },
  { name: 'YouTube', Icon: FaYoutube, url: 'https://www.youtube.com/@lostiemposbol' },
  { name: 'TikTok', Icon: FaTiktok, url: 'https://www.tiktok.com/@lostiemposbol?lang=es' },
  { name: 'LinkedIn', Icon: FaLinkedinIn, url: 'https://bo.linkedin.com/company/lostiemposbol' },
];

// =========================================================
// COMPONENTE (Server Component: no necesita estado; el layout responsive es CSS)
// =========================================================

export function SiteFooter() {
  return (
    <footer className={`rn-view ${s.footer}`}>
      {/* COLUMNAS PRINCIPALES */}
      <div className={`rn-view ${s.columnsRow}`}>
        {/* COLUMNAS DE ENLACES */}
        <div className={`rn-view ${s.linksColumns}`}>
          {COLUMNS.map((col) => (
            <div key={col.heading} className={`rn-view ${s.column}`}>
              <span className={`rn-text ${s.columnHeading}`}>{col.heading}</span>

              {col.links.map((link) => (
                <a
                  key={link.label}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`rn-text ${s.columnLink}`}
                >
                  {link.label}
                </a>
              ))}
            </div>
          ))}
        </div>

        {/* REDES SOCIALES */}
        <div className={`rn-view ${s.socialColumn}`}>
          <div className={`rn-view ${s.socialRow}`}>
            {SOCIAL_LINKS.map(({ name, Icon, url }) => (
              <a
                key={name}
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={name}
                className={`rn-view ${s.socialIcon}`}
              >
                <Icon size={14} color="#FFFFFF" />
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* PARTE INFERIOR */}
      <div className={`rn-view ${s.bottomRow}`}>
        <span className={`rn-text ${s.copyright}`}>Copyright © 2026 Editorial Canelas</span>
        <span className={`rn-text ${s.terms}`}>Condiciones de uso</span>
      </div>
    </footer>
  );
}
