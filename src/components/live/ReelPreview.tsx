'use client';

import { useEffect, useRef, useState } from 'react';
import s from './ReelPreview.module.css';

interface ReelPreviewProps {
  playerUrl: string;
  title: string;
  active: boolean;
  duration?: number;
}

export function ReelPreview({ playerUrl, title, active, duration = 5000 }: ReelPreviewProps) {
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [ready, setReady] = useState(false);

  const sendMessage = (type: string) => {
    iframeRef.current?.contentWindow?.postMessage(
      {
        'x-tiktok-player': true,
        type,
      },
      'https://www.tiktok.com'
    );
  };

  useEffect(() => {
    if (!active) {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
      if (ready) sendMessage('pause');
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
    // sendMessage utiliza la referencia estable del iframe.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, ready, duration]);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const previewUrl = (() => {
    const url = new URL(playerUrl);
    url.searchParams.set('autoplay', '0');
    url.searchParams.set('muted', '1');
    url.searchParams.set('controls', '0');
    url.searchParams.set('description', '0');
    url.searchParams.set('music_info', '0');
    url.searchParams.set('fullscreen_button', '0');
    return url.toString();
  })();

  return (
    <div className={`rn-view ${s.container}`}>
      <iframe
        ref={iframeRef}
        src={previewUrl}
        title={title}
        className={s.iframe}
        allow="autoplay; fullscreen; encrypted-media; picture-in-picture"
        loading="eager"
        onLoad={() => setReady(true)}
      />
    </div>
  );
}
