'use client';

import { useEffect, useRef, useState } from 'react';
import { AdSlot } from '@/components/ads/AdSlot';
import { AuthModal } from '@/components/auth/AuthModal';
import { startLogin } from '@/components/auth/authService';
import { useLiveHub } from '@/context/LiveHubContext';
import { useMediaQuery } from '@/hooks/use-media-query';
import { LiveChat } from './LiveChat';
import { LiveDescription } from './LiveDescription';
import { LiveHeader } from './LiveHeader';
import { PromoCardsRow } from './PromoCardsRow';
import { ReelSection } from './ReelSection';
import { SiteFooter } from './SiteFooter';
import { VideoPlayer } from './VideoPlayer';
import s from './LiveScreen.module.css';

type SectionKey = 'inicio' | 'noticias' | 'videos' | 'enlaces';

export function LiveScreen() {
  const { liveInfo } = useLiveHub();

  // Referencias a cada sección (reemplazan onLayout + scrollTo de ScrollView).
  const sectionRefs = {
    inicio: useRef<HTMLDivElement>(null),
    noticias: useRef<HTMLDivElement>(null),
    videos: useRef<HTMLDivElement>(null),
    enlaces: useRef<HTMLDivElement>(null),
  };

  // Los anuncios laterales solo se montan en pantallas anchas (>= 1180px).
  const showSideAds = useMediaQuery('(min-width: 1180px)');
  const [authVisible, setAuthVisible] = useState<boolean>(false);
  const [initialRegisterMode, setInitialRegisterMode] = useState<boolean>(false);
  const hasActiveStream = Boolean(liveInfo?.isLive);
  const streamUrl = liveInfo?.urlVideo ?? '';

  // La fecha depende de la zona horaria del navegador, por eso se calcula tras hidratar.
  const [formattedDate, setFormattedDate] = useState('');
  useEffect(() => {
    setFormattedDate(
      new Date().toLocaleDateString('es-BO', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      }),
    );
  }, []);

  const scrollToSection = (section: SectionKey) => {
    const el = sectionRefs[section].current;
    if (!el) return;
    const top = el.getBoundingClientRect().top + window.scrollY;
    window.scrollTo({ top: Math.max(0, top - 8), behavior: 'smooth' });
  };

  const handleOpenLogin = async () => {
    try {
      await startLogin();
    } catch (err: any) {
      console.error('Error iniciando sesión:', err?.message || err);
    }
  };

  const handleOpenRegister = () => {
    setInitialRegisterMode(true);
    setAuthVisible(true);
  };

  return (
    <div className={`rn-view ${s.screen}`}>
      <div ref={sectionRefs.inicio} className="rn-view">
        <div className={`rn-view ${s.headerViewport}`}>
          <LiveHeader
            headline="Los Tiempos, señal en vivo - Artemis retorna, Trump y los convenios, Liga boliviana y las ultimas posiciones en las tablas"
            onOpenLogin={handleOpenLogin}
            onOpenRegister={handleOpenRegister}
            onGoInicio={() => scrollToSection('inicio')}
            onGoNoticias={() => scrollToSection('noticias')}
            onGoVideos={() => scrollToSection('videos')}
            onGoEnlaces={() => scrollToSection('enlaces')}
          />
        </div>
      </div>

      <main className={`rn-view ${s.page}`}>
        <div className={`rn-view ${s.layoutRow}`}>
          <div className={`rn-view ${s.adColumn}`}>{showSideAds && <AdSlot placement="left" />}</div>

          <div className={`rn-view ${s.contentColumn}`}>
            <div className={`rn-view ${s.content}`}>
              <div className={`rn-view ${s.videoArea}`}>
                {hasActiveStream && (
                  <div className={`rn-view ${s.liveBadge}`}>
                    <div className={`rn-view ${s.liveDot}`} />
                    <span className={`rn-text ${s.liveBadgeText}`}>EN VIVO</span>
                  </div>
                )}
                <VideoPlayer videoUrl={streamUrl} />
              </div>

              <div className={`rn-view ${s.chatArea}`}>
                <LiveChat />
              </div>
            </div>
            <LiveDescription
              title={`Transmisión en vivo ${formattedDate}`.trim()}
              body="Sigue nuestras transmisiones en directo y mantente informado. Disfruta de la señal en vivo, noticias y contenido de actualidad de Los Tiempos."
            />

            <div ref={sectionRefs.videos} className="rn-view">
              <ReelSection />
            </div>
            <div ref={sectionRefs.noticias} className="rn-view">
              <PromoCardsRow />
            </div>
          </div>

          <div className={`rn-view ${s.adColumn}`}>{showSideAds && <AdSlot placement="right" />}</div>
        </div>
      </main>

      <div ref={sectionRefs.enlaces} className="rn-view">
        <SiteFooter />
      </div>

      <AuthModal
        visible={authVisible}
        onClose={() => setAuthVisible(false)}
        initialRegister={initialRegisterMode}
      />
    </div>
  );
}
