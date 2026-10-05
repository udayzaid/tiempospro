'use client';

import { useEffect, useRef, useState } from 'react';
import s from './ReelPreview.module.css';

interface ReelPreviewProps {
  videoId: string;
  active: boolean;
  duration?: number;
}

export function ReelPreview({ videoId, active, duration = 5000 }: ReelPreviewProps) {
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [ready, setReady] = useState(false);

  const sendMessage = (type: string, value?: number) => {
    iframeRef.current?.contentWindow?.postMessage(
      {
        'x-tiktok-player': true,
        type,
        ...(value !== undefined ? { value } : {}),
      },
      '*'
    );
  };

  useEffect(() => {
    if (!active) {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
      if (ready) {
        sendMessage('pause');
        setReady(false);
      }
      return;
    }

    if (!ready) return;

    sendMessage('mute');
    sendMessage('play');

    timerRef.current = setTimeout(() => {
      sendMessage('pause');
    }, duration);

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
      sendMessage('pause');
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, ready, duration]);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const playerUrl = `https://www.tiktok.com/player/v1/${videoId}?autoplay=1&muted=1&controls=0&description=0&music_info=0&rel=0&fullscreen_button=0&loop=0&play_button=0&volume_control=0`;

  if (!active) return null;

  return (
    <div className={`rn-view ${s.container}`}>
      <iframe
        ref={iframeRef}
        src={playerUrl}
        title="TikTok Reel preview"
        className={s.iframe}
        allow="autoplay; fullscreen"
        loading="lazy"
        onLoad={() => setReady(true)}
      />
    </div>
  );
}
