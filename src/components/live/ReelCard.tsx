'use client';

import { useState, type CSSProperties } from 'react';
import { IoClose, IoPlay } from 'react-icons/io5';
import { parseTikTokReel, type ReelEmbedDto } from '@/services/api';
import { Overlay } from '@/components/ui/Overlay';
import { ReelPlayer } from './ReelPlayer';
import { ReelPreview } from './ReelPreview';
import s from './ReelCard.module.css';

interface ReelCardProps {
  item: ReelEmbedDto;
}

const clamp2 = { '--lines': 2 } as CSSProperties;

export function ReelCard({ item }: ReelCardProps) {
  const [modalVisible, setModalVisible] = useState(false);
  const [previewActive, setPreviewActive] = useState(false);
  const reel = parseTikTokReel(item);

  if (!reel) return null;

  const closeModal = () => {
    setModalVisible(false);
    setPreviewActive(false);
  };

  return (
    <>
      <div
        role="button"
        tabIndex={0}
        className={`rn-view ${s.cardContainer}`}
        onClick={() => setModalVisible(true)}
        onKeyDown={(event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            setModalVisible(true);
          }
        }}
        onMouseEnter={() => setPreviewActive(true)}
        onMouseLeave={() => setPreviewActive(false)}
      >
        <ReelPreview playerUrl={reel.playerUrl} title={reel.title} active={previewActive} duration={5000} />

        <div className={`rn-view ${s.overlay}`}>
          <div className={`rn-view ${s.playIconContainer}`}>
            <IoPlay size={20} color="#FFF" />
          </div>

          <span className={`rn-text rn-clamp ${s.title}`} style={clamp2}>
            {reel.title}
          </span>
        </div>
      </div>

      <Overlay visible={modalVisible} onRequestClose={closeModal} className={s.modalOverlay}>
        <button
          type="button"
          className={`rn-pressable ${s.closeButton}`}
          onClick={closeModal}
          aria-label="Cerrar video"
        >
          <div className={`rn-view ${s.closeButtonBackground}`}>
            <IoClose size={24} color="#FFF" />
          </div>
        </button>

        <div className={`rn-view ${s.playerWrapper}`}>
          <ReelPlayer playerUrl={reel.playerUrl} title={reel.title} />
        </div>
      </Overlay>
    </>
  );
}
