import React from 'react';
import { Upload, Camera, Video } from 'lucide-react';

const FileUploadSection = ({
  type, // 'image' or 'video'
  files,
  previews,
  onFileUpload,
  onFileRemove,
  label,
  accept,
  helpText,
}) => {
  const inputId = `${type}-upload`;
  const Icon = type === 'image' ? Upload : Video;
  const PreviewIcon = type === 'image' ? Camera : Video;

  return (
    <div className="new-upload-section">
      <label className="form-field__label">{label}</label>
      <div className="new-upload-area">
        <input
          type="file"
          multiple
          accept={accept}
          onChange={onFileUpload}
          className="new-upload-area__input"
          id={inputId}
        />
        <label htmlFor={inputId} className="new-upload-area__content">
          <Icon className="new-upload-area__icon" />
          <p className="new-upload-area__text">Click to upload {type}s</p>
          <p className="new-upload-area__subtext">{helpText}</p>
        </label>
      </div>

      {/* File Previews */}
      {previews.length > 0 && (
        <div className="new-file-previews">
          {previews.map((preview, index) => (
            <div key={index} className="new-file-preview-item">
              {type === 'image' ? (
                <img
                  src={preview.url}
                  alt={preview.name}
                  className="new-file-preview-item__media"
                />
              ) : (
                <video
                  src={preview.url}
                  className="new-file-preview-item__media"
                  muted
                />
              )}
              <div className="new-file-preview-item__overlay">
                <PreviewIcon className="new-file-preview-item__type-icon" />
              </div>
              <button
                onClick={() => onFileRemove(index)}
                className="new-file-preview-item__remove"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FileUploadSection;
