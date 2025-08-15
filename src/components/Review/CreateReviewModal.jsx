import React from 'react';
import { X, Loader2, AlertCircle } from 'lucide-react';
import StarRating from './StarRating';
import FileUploadSection from './FileUploadSection';

const CreateReviewModal = ({
  show,
  onClose,
  newReview,
  onReviewChange,
  onImageUpload,
  onVideoUpload,
  onRemoveImage,
  onRemoveVideo,
  onSubmit,
  uploading,
  uploadError,
}) => {
  if (!show) return null;

  const handleRatingChange = (rating) => {
    onReviewChange({ ...newReview, rating });
  };

  const handleClose = () => {
    // Clean up object URLs when closing modal
    newReview.imagePreviews.forEach((preview) =>
      URL.revokeObjectURL(preview.url)
    );
    newReview.videoPreviews.forEach((preview) =>
      URL.revokeObjectURL(preview.url)
    );
    onClose();
  };

  return (
    <div className="modal-backdrop">
      <div className="modal modal--large">
        <div className="modal__header">
          <h3 className="modal__title">Write a Review</h3>
          <button onClick={handleClose} className="modal__close">
            <X />
          </button>
        </div>

        <div className="modal__content">
          <div className="create-review-form">
            {/* Rating */}
            <div className="form-field">
              <label className="form-field__label">
                Rating <span className="form-field__required">*</span>
              </label>
              <StarRating
                rating={newReview.rating}
                interactive={true}
                className="star-rating--large"
                onRatingChange={handleRatingChange}
              />
            </div>

            {/* Title */}
            <div className="form-field">
              <label className="form-field__label">Review Title</label>
              <input
                type="text"
                value={newReview.title}
                onChange={(e) =>
                  onReviewChange({ ...newReview, title: e.target.value })
                }
                className="form-field__input"
                placeholder="Summarize your experience"
              />
            </div>

            {/* Content */}
            <div className="form-field">
              <label className="form-field__label">
                Your Review <span className="form-field__required">*</span>
              </label>
              <textarea
                value={newReview.content}
                onChange={(e) =>
                  onReviewChange({ ...newReview, content: e.target.value })
                }
                className="form-field__textarea"
                placeholder="Share details about your experience with this product"
              />
            </div>

            {/* Image Upload */}
            <FileUploadSection
              type="image"
              files={newReview.imageFiles}
              previews={newReview.imagePreviews}
              onFileUpload={onImageUpload}
              onFileRemove={onRemoveImage}
              label="Add Photos (Optional)"
              accept="image/*"
              helpText="PNG, JPG up to 10MB each"
            />

            {/* Video Upload */}
            <FileUploadSection
              type="video"
              files={newReview.videoFiles}
              previews={newReview.videoPreviews}
              onFileUpload={onVideoUpload}
              onFileRemove={onRemoveVideo}
              label="Add Videos (Optional)"
              accept="video/mp4,video/webm,video/mov,video/avi,image/gif"
              helpText="MP4, WebM, MOV, AVI, GIF up to 50MB each"
            />

            {/* Anonymous Option */}
            <div className="form-field">
              <div className="checkbox-field">
                <input
                  type="checkbox"
                  id="anonymous"
                  checked={newReview.is_anonymous}
                  onChange={(e) =>
                    onReviewChange({
                      ...newReview,
                      is_anonymous: e.target.checked,
                    })
                  }
                  className="checkbox-field__input"
                />
                <label htmlFor="anonymous" className="checkbox-field__label">
                  Post this review anonymously
                </label>
              </div>
            </div>

            {/* Upload Progress */}
            {uploading && (
              <div className="new-upload-progress">
                <Loader2 className="new-upload-progress__icon" />
                <span className="new-upload-progress__text">
                  Uploading review and media files...
                </span>
              </div>
            )}

            {/* Error Display */}
            {uploadError && (
              <div className="new-upload-error">
                <AlertCircle className="new-upload-error__icon" />
                {uploadError}
              </div>
            )}
          </div>
        </div>

        <div className="modal__actions">
          <button
            onClick={handleClose}
            className="btn btn--secondary"
            disabled={uploading}
          >
            Cancel
          </button>
          <button
            onClick={onSubmit}
            disabled={!newReview.rating || !newReview.content || uploading}
            className="btn btn--primary"
            style={{
              opacity:
                !newReview.rating || !newReview.content || uploading ? 0.5 : 1,
            }}
          >
            {uploading ? (
              <>
                <Loader2 className="btn__icon animate-spin" />
                Submitting...
              </>
            ) : (
              'Submit Review'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateReviewModal;
