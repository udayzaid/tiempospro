'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import s from './ReelPlayer.module.css';

interface ReelPlayerProps {
  playerUrl: string;
  title: string;
}

export function ReelPlayer({ playerUrl, title }: ReelPlayerProps) {
  const [attempt, setAttempt] = useState(0);
  const [loading, setLoading] = useState(true);
  const retryTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const fullPlayerUrl = useMemo(() => {
    const url = new URL(playerUrl);
    url.searchParams.set('controls', '1');
    url.searchParams.set('description', '1');
    url.searchParams.set('music_info', '1');
    url.searchParams.set('autoplay', '1');
    url.searchParams.set('muted', '0');
    url.searchParams.set('fullscreen_button', '1');
    return url.toString();
  }, [playerUrl]);

  useEffect(() => () => {
    if (retryTimer.current) clearTimeout(retryTimer.current);
  }, []);

  const handleLoad = () => {
    setLoading(false);

    // TikTok sometimes renders its own "Server error" screen on the first
    // embed request. The iframe is cross-origin, so its internal error state
    // cannot be inspected; perform one bounded automatic retry.
    if (attempt === 0 && !retryTimer.current) {
      retryTimer.current = setTimeout(() => {
        retryTimer.current = null;
        setLoading(true);
        setAttempt(1);
      }, 1800);
    }
  };

  return (
    <div className={`rn-view ${s.container}`}>
      <div className={`rn-view ${s.playerContainer}`}>
        {loading && <div className={`rn-view ${s.loading}`}><span className="rn-spinner" /></div>}
        <iframe
          key={attempt}
          src={fullPlayerUrl}
          title={title}
          className={s.iframe}
          allow="autoplay; fullscreen; encrypted-media; picture-in-picture"
          allowFullScreen
          onLoad={handleLoad}
        />
      </div>
    </div>
  );
}
