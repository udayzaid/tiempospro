import s from './VideoPlayer.module.css';

type VideoPlayerProps = {
  videoUrl?: string;
};

export function VideoPlayer({ videoUrl = '' }: VideoPlayerProps) {
  return (
    <div className={`rn-view ${s.container}`}>
      {videoUrl ? (
        <iframe
          src={videoUrl}
          title="Transmisión de Los Tiempos"
          className={s.iframe}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      ) : null}
    </div>
  );
}
