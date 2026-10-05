import s from './ReelPlayer.module.css';

interface ReelPlayerProps {
  videoId: string;
}

export function ReelPlayer({ videoId }: ReelPlayerProps) {
  const playerUrl = `https://www.tiktok.com/player/v1/${videoId}?controls=1&description=0&music_info=0&rel=0&fullscreen_button=1&loop=0`;

  return (
    <div className={`rn-view ${s.container}`}>
      <div className={`rn-view ${s.playerContainer}`}>
        <iframe src={playerUrl} title="TikTok Reel" className={s.iframe} allow="fullscreen" />
      </div>
    </div>
  );
}
