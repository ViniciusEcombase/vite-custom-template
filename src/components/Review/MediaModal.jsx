import React from 'react';
import { X } from 'lucide-react';

const MediaModal = ({
  show,
  type, // 'image' or 'video'
  src,
  onClose,
}) => {
  if (!show || !src) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className={`modal ${
          type === 'image' ? 'image-modal' : 'review-video-modal'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className={`${
            type === 'image'
              ? 'image-modal__container'
              : 'review-video-modal__container'
          }`}
        >
          <button
            onClick={onClose}
            className={`${
              type === 'image'
                ? 'image-modal__close'
                : 'review-video-modal__close'
            }`}
          >
            <X />
          </button>
          {type === 'image' ? (
            <img src={src} alt="Review" className="image-modal__image" />
          ) : (
            <video
              src={src}
              controls
              autoPlay
              className="review-video-modal__video"
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default MediaModal;
