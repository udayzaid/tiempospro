import s from './ReelPlayer.module.css';

interface ReelPlayerProps {
  playerUrl: string;
  title: string;
}

export function ReelPlayer({ playerUrl, title }: ReelPlayerProps) {
  const fullPlayerUrl = (() => {
    const url = new URL(playerUrl);
    url.searchParams.set('controls', '1');
    url.searchParams.set('description', '1');
    url.searchParams.set('music_info', '1');
    url.searchParams.set('autoplay', '1');
    url.searchParams.set('muted', '0');
    url.searchParams.set('fullscreen_button', '1');
    return url.toString();
  })();

  return (
    <div className={`rn-view ${s.container}`}>
      <div className={`rn-view ${s.playerContainer}`}>
        <iframe
          src={fullPlayerUrl}
          title={title}
          className={s.iframe}
          allow="autoplay; fullscreen; encrypted-media; picture-in-picture"
          allowFullScreen
        />
      </div>
    </div>
  );
}
