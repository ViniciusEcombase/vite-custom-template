import React, { useEffect, useState, useMemo } from 'react';
import {
  Star,
  Plus,
  X,
  Upload,
  Eye,
  ChevronLeft,
  ChevronRight,
  Calendar,
  TrendingUp,
  TrendingDown,
  Minus,
  Camera,
  Shield,
  Filter,
  Video,
  Play,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import useFetch from '../../customHooks/useFetch';
import { useAuth } from '../../contextProviders/AuthProvider';

const BUCKET_NAME = 'loja-do-vini';
const SUPABASE_URL = 'https://niihlyofonxtmzgzanpv.supabase.co';
const SERVICE_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5paWhseW9mb254dG16Z3phbnB2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NjcyMzg2MCwiZXhwIjoyMDYyMjk5ODYwfQ.4Cy3yD5bJcDoI5xf1hYCdswiNHpRy1C9zETJH6czBpk';

const ProductReviews = () => {
  const [showSummary, setShowSummary] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedRatingFilter, setSelectedRatingFilter] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [showImageModal, setShowImageModal] = useState(false);
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [payload, setPayload] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  const [newReview, setNewReview] = useState({
    rating: 0,
    title: '',
    content: '',
    is_anonymous: false,
    imageFiles: [],
    videoFiles: [],
    imagePreviews: [],
    videoPreviews: [],
  });
  const { isLoggedIn, user, login, logout } = useAuth();

  const api = useFetch({
    baseURL: `${SUPABASE_URL}/rest/v1`,
    timeout: 10000,
    retries: 0,
    cache: true,
    defaultHeaders: {
      Authorization: `Bearer ${SERVICE_KEY}`,
      'Content-Type': 'application/json',
      apikey: SERVICE_KEY,
      Prefer: 'return=representation',
    },
  });

  // Enhanced upload function that uses direct API calls
  const uploadFile = async (bucketName, filePath, file) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('cacheControl', '3600');
    formData.append('upsert', 'true');

    try {
      const res = await fetch(
        `${SUPABASE_URL}/storage/v1/object/${bucketName}/${filePath}`,
        {
          method: 'POST',
          headers: {
            apikey: SERVICE_KEY,
            Authorization: `Bearer ${SERVICE_KEY}`,
          },
          body: formData,
        }
      );

      const data = await res.json();
      if (!res.ok) {
        console.error('Upload error:', data);
        alert(`Upload failed for ${file.name}: ${data.message}`);
        return null;
      }

      return `${SUPABASE_URL}/storage/v1/object/public/${bucketName}/${filePath}`;
    } catch (err) {
      console.error('Upload exception:', err);
      alert(`Upload failed for ${file.name}. See console.`);
      return null;
    }
  };

  useEffect(() => {
    const Init = async () => {
      const res = await api.get(
        '/product_variant_reviews_view?variant_id=eq.1'
      );
      setPayload(res);
    };
    Init();
  }, []);

  const reviewsPerPage = 5;

  const filteredReviews = useMemo(() => {
    if (!selectedRatingFilter) return payload?.data[0].reviews;
    return payload.data[0].reviews.filter(
      (review) => review.rating === selectedRatingFilter
    );
  }, [payload, selectedRatingFilter]);

  const paginatedReviews = useMemo(() => {
    const startIndex = (currentPage - 1) * reviewsPerPage;
    return filteredReviews?.slice(startIndex, startIndex + reviewsPerPage);
  }, [payload, filteredReviews, currentPage]);

  const totalPages = useMemo(() => {
    return filteredReviews
      ? Math.ceil(filteredReviews.length / reviewsPerPage)
      : 0;
  }, [filteredReviews, reviewsPerPage]);

  const renderStars = (rating, interactive = false, className = '') => {
    const starClasses = `star-rating ${
      interactive ? 'star-rating--interactive' : ''
    } ${className}`;

    return (
      <div className={starClasses}>
        {Array.from({ length: 5 }, (_, i) => (
          <Star
            key={i}
            className={`star-rating__star ${
              i < rating ? 'star-rating__star--filled' : ''
            }`}
            onClick={
              interactive
                ? () => setNewReview((prev) => ({ ...prev, rating: i + 1 }))
                : undefined
            }
          />
        ))}
      </div>
    );
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    const newImageFiles = [...newReview.imageFiles, ...files];
    const newPreviews = files.map((file) => ({
      url: URL.createObjectURL(file),
      type: file.type,
      name: file.name,
    }));

    setNewReview((prev) => ({
      ...prev,
      imageFiles: newImageFiles,
      imagePreviews: [...prev.imagePreviews, ...newPreviews],
    }));

    // Clear the input
    e.target.value = '';
  };

  const handleVideoUpload = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    const newVideoFiles = [...newReview.videoFiles, ...files];
    const newPreviews = files.map((file) => ({
      url: URL.createObjectURL(file),
      type: file.type,
      name: file.name,
    }));

    setNewReview((prev) => ({
      ...prev,
      videoFiles: newVideoFiles,
      videoPreviews: [...prev.videoPreviews, ...newPreviews],
    }));

    // Clear the input
    e.target.value = '';
  };

  const handleRemoveImage = (index) => {
    // Revoke object URL to prevent memory leaks
    URL.revokeObjectURL(newReview.imagePreviews[index].url);

    setNewReview((prev) => ({
      ...prev,
      imageFiles: prev.imageFiles.filter((_, i) => i !== index),
      imagePreviews: prev.imagePreviews.filter((_, i) => i !== index),
    }));
  };

  const handleRemoveVideo = (index) => {
    // Revoke object URL to prevent memory leaks
    URL.revokeObjectURL(newReview.videoPreviews[index].url);

    setNewReview((prev) => ({
      ...prev,
      videoFiles: prev.videoFiles.filter((_, i) => i !== index),
      videoPreviews: prev.videoPreviews.filter((_, i) => i !== index),
    }));
  };

  const createProductReview = async (reviewData) => {
    const response = await api.post('/product_reviews', reviewData);
    return response;
  };

  const createReviewMedia = async (reviewId, mediaUrl, type) => {
    const mediaData = {
      review_id: reviewId,
      url: mediaUrl,
      type: type,
    };
    const response = await api.post('/product_review_media', mediaData);
    return response;
  };

  const handleCreateReview = async () => {
    if (!newReview.rating || !newReview.content) {
      alert('Please provide a rating and review content.');
      return;
    }

    setUploading(true);
    setUploadError(null);

    try {
      // Step 1: Create the product review
      const reviewData = {
        variant_id: payload.data[0].variant_id,
        customer_id: user.customer_id,
        rating: newReview.rating,
        title: newReview.title || null,
        content: newReview.content,
        is_anonymous: newReview.is_anonymous,
        is_analyzed: false,
        is_verified: false,
        is_approved: false,
      };

      const createdReview = await createProductReview(reviewData);
      console.log(createdReview, 'CREATED REVIEWWWWW');
      const reviewId = createdReview.data[0].id;
      console.log(reviewId, 'Review IDDDDD');
      // Step 2: Upload files and create media entries
      const allMediaPromises = [];

      // Upload images
      for (let i = 0; i < newReview.imageFiles.length; i++) {
        const file = newReview.imageFiles[i];
        const timestamp = Date.now();
        const fileName = `${timestamp}_${i}_${file.name}`;
        const filePath = `review_media/variantId:${payload.data[0].variant_id}/${fileName}`;

        const uploadPromise = uploadFile(BUCKET_NAME, filePath, file)
          .then((url) => createReviewMedia(reviewId, url, 'image'))
          .catch((error) => {
            console.error(`Failed to upload image ${file.name}:`, error);
            throw error;
          });

        allMediaPromises.push(uploadPromise);
      }

      // Upload videos
      for (let i = 0; i < newReview.videoFiles.length; i++) {
        const file = newReview.videoFiles[i];
        const timestamp = Date.now();
        const fileName = `${timestamp}_${i}_${file.name}`;
        const filePath = `variant_1/${fileName}`; // Using variant_id in path

        const uploadPromise = uploadFile(BUCKET_NAME, filePath, file)
          .then((url) => createReviewMedia(reviewId, url, 'video'))
          .catch((error) => {
            console.error(`Failed to upload video ${file.name}:`, error);
            throw error;
          });

        allMediaPromises.push(uploadPromise);
      }

      // Wait for all uploads to complete
      await Promise.all(allMediaPromises);

      // Success! Close modal and reset form
      alert('Review submitted successfully!');
      setShowCreateModal(false);

      // Clean up object URLs
      newReview.imagePreviews.forEach((preview) =>
        URL.revokeObjectURL(preview.url)
      );
      newReview.videoPreviews.forEach((preview) =>
        URL.revokeObjectURL(preview.url)
      );

      setNewReview({
        rating: 0,
        title: '',
        content: '',
        is_anonymous: false,
        imageFiles: [],
        videoFiles: [],
        imagePreviews: [],
        videoPreviews: [],
      });

      // Refresh the reviews list
      const res = await api.get(
        '/product_variant_reviews_view?variant_id=eq.1'
      );
      setPayload(res);
    } catch (error) {
      console.error('Error creating review:', error);
      setUploadError(
        error.message || 'Failed to create review. Please try again.'
      );
    } finally {
      setUploading(false);
    }
  };

  const RatingBar = ({ rating, count, percentage, isSelected, onClick }) => (
    <div
      className={`reviews-filter-item ${
        isSelected ? 'reviews-filter-item--active' : ''
      }`}
      onClick={onClick}
    >
      <div className="reviews-filter-item__rating">
        <span>{rating}</span>
        <Star className="star-rating__star star-rating__star--filled" />
      </div>
      <div className="reviews-filter-item__bar">
        <div
          className="reviews-filter-item__progress"
          style={{ width: `${percentage}%` }}
        />
      </div>
      <span className="reviews-filter-item__count">{count}</span>
    </div>
  );

  const SentimentIndicator = ({ sentiment }) => {
    const config = {
      positive: { icon: TrendingUp, modifier: 'positive' },
      negative: { icon: TrendingDown, modifier: 'negative' },
      neutral: { icon: Minus, modifier: 'neutral' },
    };

    const { icon: Icon, modifier } = config[sentiment] || config.neutral;

    return (
      <div className={`sentiment-indicator sentiment-indicator--${modifier}`}>
        <Icon className="sentiment-indicator__icon" />
        <span className="capitalize">{sentiment}</span>
      </div>
    );
  };

  if (showSummary) {
    return (
      <>
        {payload && (
          <div className="reviews-container reviews-container--summary">
            <div className="reviews-summary">
              {/* Header */}
              <div className="reviews-summary__header">
                <h2 className="reviews-summary__title">Reviews summary</h2>
                <SentimentIndicator
                  sentiment={
                    payload.data[0].ai_summary.positive_themes.length -
                      payload.data[0].ai_summary.negative_themes.length ===
                    0
                      ? 'neutral'
                      : payload.data[0].ai_summary.positive_themes.length -
                          payload.data[0].ai_summary.negative_themes.length >
                        0
                      ? 'positive'
                      : 'negative'
                  }
                />
              </div>

              {/* Summary Stats */}
              <div className="reviews-summary__stats">
                <div className="reviews-summary__stat">
                  <div className="reviews-summary__stat-value reviews-summary__stat-value--primary">
                    {payload.data[0].average_rating.toFixed(1)}
                  </div>
                  {renderStars(Math.round(payload.data[0].average_rating))}
                  <p className="reviews-summary__stat-label">
                    {payload.data[0].total_reviews} reviews
                  </p>
                </div>

                <div className="reviews-summary__stat">
                  <div className="reviews-summary__stat-value reviews-summary__stat-value--positive">
                    {payload.data[0].ai_summary.positive_themes.length}
                  </div>
                  <p className="reviews-summary__stat-label">Positive Themes</p>
                </div>

                <div className="reviews-summary__stat">
                  <div className="reviews-summary__stat-value reviews-summary__stat-value--negative">
                    {payload.data[0].ai_summary.negative_themes.length}
                  </div>
                  <p className="reviews-summary__stat-label">
                    Areas for Improvement
                  </p>
                </div>
              </div>

              {/* AI Summary Text */}
              <div className="reviews-summary__content">
                <h3 className="reviews-summary__content-title">Summary</h3>
                <p className="reviews-summary__text">
                  {payload.data[0].ai_summary.summary_text}
                </p>
              </div>

              {/* Themes */}
              <div className="reviews-summary__themes">
                <div className="reviews-summary__theme-section">
                  <h3 className="reviews-summary__theme-title reviews-summary__theme-title--positive">
                    <TrendingUp />
                    What Customers Love
                  </h3>
                  <div className="reviews-summary__tags">
                    {payload.data[0].ai_summary.positive_themes.map(
                      (theme, index) => (
                        <span
                          key={index}
                          className="reviews-summary__tag reviews-summary__tag--positive"
                        >
                          {theme}
                        </span>
                      )
                    )}
                  </div>
                </div>

                <div className="reviews-summary__theme-section">
                  <h3 className="reviews-summary__theme-title reviews-summary__theme-title--negative">
                    <TrendingDown />
                    Common Concerns
                  </h3>
                  <div className="reviews-summary__tags">
                    {payload.data[0].ai_summary.negative_themes.map(
                      (theme, index) => (
                        <span
                          key={index}
                          className="reviews-summary__tag reviews-summary__tag--negative"
                        >
                          {theme}
                        </span>
                      )
                    )}
                  </div>
                </div>
              </div>

              {/* Last Analyzed */}
              <div className="reviews-summary__meta">
                <Calendar />
                <span>
                  Last analyzed{' '}
                  {formatDate(payload.data[0].ai_summary.last_analyzed_at)}
                </span>
              </div>

              {/* Action Buttons */}
              <div className="reviews-summary__actions">
                <button
                  onClick={() => setShowSummary(false)}
                  className="btn btn--primary"
                >
                  See All Reviews
                </button>
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="btn btn--secondary"
                >
                  <Plus className="btn__icon" />
                  Write Review
                </button>
              </div>
            </div>
          </div>
        )}
      </>
    );
  }

  return (
    <>
      {payload && (
        <div className="reviews-container">
          {/* Header */}
          <div className="reviews-header">
            <div className="reviews-header__content">
              <h2 className="reviews-header__title">Customer Reviews</h2>
              <div className="reviews-header__stats">
                <div className="reviews-header__rating">
                  <span className="reviews-header__rating-value">
                    {payload.data[0].average_rating.toFixed(1)}
                  </span>
                  {renderStars(Math.round(payload.data[0].average_rating))}
                  <span className="reviews-header__rating-count">
                    ({payload.data[0].total_reviews} reviews)
                  </span>
                </div>
              </div>
            </div>

            <div className="reviews-header__actions">
              <button
                onClick={() => setShowSummary(true)}
                className="btn btn--secondary"
              >
                <Eye className="btn__icon" />
                AI Summary
              </button>
              <button
                onClick={() => setShowCreateModal(true)}
                className="btn btn--primary"
              >
                <Plus className="btn__icon" />
                Write Review
              </button>
            </div>
          </div>

          <div className="reviews-grid">
            {/* Filters Sidebar */}
            <div>
              <div className="reviews-filters">
                <div className="reviews-filters__header">
                  <Filter />
                  <h3 className="reviews-filters__title">Filter by Rating</h3>
                </div>

                <div className="reviews-filters__list">
                  <div
                    className={`reviews-filter-item ${
                      !selectedRatingFilter ? 'reviews-filter-item--active' : ''
                    }`}
                    onClick={() => {
                      setSelectedRatingFilter(null);
                      setCurrentPage(1);
                    }}
                  >
                    <span className="reviews-filter-item__rating">All</span>
                  </div>

                  {[5, 4, 3, 2, 1].map((rating) => (
                    <RatingBar
                      key={rating}
                      rating={rating}
                      count={payload.data[0].ratings_count[rating.toString()]}
                      percentage={
                        payload.data[0].ratings_percentage[rating.toString()]
                      }
                      isSelected={selectedRatingFilter === rating}
                      onClick={() => {
                        setSelectedRatingFilter(
                          selectedRatingFilter === rating ? null : rating
                        );
                        setCurrentPage(1);
                      }}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Reviews List */}
            <div>
              {filteredReviews?.length === 0 ? (
                <div className="reviews-list--empty">
                  <p>No reviews found for the selected filter.</p>
                </div>
              ) : (
                <>
                  <div className="reviews-list">
                    {paginatedReviews?.map((review) => (
                      <div key={review.id} className="review-card">
                        {/* Review Header */}
                        <div className="review-card__header">
                          <div className="review-card__author">
                            <div className="review-card__avatar">
                              {review.customer_name[0]}
                            </div>
                            <div className="review-card__author-info">
                              <div className="review-card__author-name">
                                <span className="review-card__name">
                                  {review.customer_name}
                                </span>
                                {review.is_verified && (
                                  <div className="review-card__verified">
                                    <Shield />
                                    Verified
                                  </div>
                                )}
                              </div>
                              <p className="review-card__date">
                                {formatDate(review.created_at)}
                              </p>
                            </div>
                          </div>
                          <div className="review-card__rating">
                            {renderStars(review.rating)}
                          </div>
                        </div>

                        {/* Review Content */}
                        <div className="review-card__content">
                          {review.title && (
                            <h4 className="review-card__title">
                              {review.title}
                            </h4>
                          )}
                          <p className="review-card__text">{review.content}</p>
                        </div>

                        {/* Review Media */}
                        {(review.images.length > 0 ||
                          review.videos.length > 0) && (
                          <div className="review-card__media">
                            {/* Images */}
                            {review.images.map((image, index) => (
                              <div
                                key={`image-${index}`}
                                className="review-media-item"
                                onClick={() => {
                                  setSelectedImage(image);
                                  setShowImageModal(true);
                                }}
                              >
                                <img
                                  src={image}
                                  alt="Review"
                                  className="review-media-item__image"
                                />
                                <div className="review-media-item__overlay">
                                  <Camera className="review-media-item__icon" />
                                </div>
                              </div>
                            ))}

                            {/* Videos */}
                            {review.videos.map((video, index) => (
                              <div
                                key={`video-${index}`}
                                className="review-video-item"
                                onClick={() => {
                                  setSelectedVideo(video);
                                  setShowVideoModal(true);
                                }}
                              >
                                <video
                                  className="review-video-item__thumbnail"
                                  muted
                                >
                                  <source src={video} />
                                </video>
                                <div className="review-video-item__overlay">
                                  <Play className="review-video-item__icon" />
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="reviews-pagination">
                      <button
                        onClick={() =>
                          setCurrentPage((prev) => Math.max(prev - 1, 1))
                        }
                        disabled={currentPage === 1}
                        className="reviews-pagination__button"
                      >
                        <ChevronLeft />
                      </button>

                      <div className="reviews-pagination__pages">
                        {Array.from(
                          { length: totalPages },
                          (_, i) => i + 1
                        ).map((page) => (
                          <button
                            key={page}
                            onClick={() => setCurrentPage(page)}
                            className={`reviews-pagination__page ${
                              currentPage === page
                                ? 'reviews-pagination__page--active'
                                : ''
                            }`}
                          >
                            {page}
                          </button>
                        ))}
                      </div>

                      <button
                        onClick={() =>
                          setCurrentPage((prev) =>
                            Math.min(prev + 1, totalPages)
                          )
                        }
                        disabled={currentPage === totalPages}
                        className="reviews-pagination__button"
                      >
                        <ChevronRight />
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Create Review Modal */}
          {showCreateModal && (
            <div className="modal-backdrop">
              <div className="modal modal--large">
                <div className="modal__header">
                  <h3 className="modal__title">Write a Review</h3>
                  <button
                    onClick={() => setShowCreateModal(false)}
                    className="modal__close"
                  >
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
                      {renderStars(
                        newReview.rating,
                        true,
                        'star-rating--large'
                      )}
                    </div>

                    {/* Title */}
                    <div className="form-field">
                      <label className="form-field__label">Review Title</label>
                      <input
                        type="text"
                        value={newReview.title}
                        onChange={(e) =>
                          setNewReview((prev) => ({
                            ...prev,
                            title: e.target.value,
                          }))
                        }
                        className="form-field__input"
                        placeholder="Summarize your experience"
                      />
                    </div>

                    {/* Content */}
                    <div className="form-field">
                      <label className="form-field__label">
                        Your Review{' '}
                        <span className="form-field__required">*</span>
                      </label>
                      <textarea
                        value={newReview.content}
                        onChange={(e) =>
                          setNewReview((prev) => ({
                            ...prev,
                            content: e.target.value,
                          }))
                        }
                        className="form-field__textarea"
                        placeholder="Share details about your experience with this product"
                      />
                    </div>

                    {/* Image Upload */}
                    <div className="new-upload-section">
                      <label className="form-field__label">
                        Add Photos (Optional)
                      </label>
                      <div className="new-upload-area">
                        <input
                          type="file"
                          multiple
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="new-upload-area__input"
                          id="image-upload"
                        />
                        <label
                          htmlFor="image-upload"
                          className="new-upload-area__content"
                        >
                          <Upload className="new-upload-area__icon" />
                          <p className="new-upload-area__text">
                            Click to upload images
                          </p>
                          <p className="new-upload-area__subtext">
                            PNG, JPG up to 10MB each
                          </p>
                        </label>
                      </div>

                      {/* Image Previews */}
                      {newReview.imagePreviews.length > 0 && (
                        <div className="new-file-previews">
                          {newReview.imagePreviews.map((preview, index) => (
                            <div key={index} className="new-file-preview-item">
                              <img
                                src={preview.url}
                                alt={preview.name}
                                className="new-file-preview-item__media"
                              />
                              <div className="new-file-preview-item__overlay">
                                <Camera className="new-file-preview-item__type-icon" />
                              </div>
                              <button
                                onClick={() => handleRemoveImage(index)}
                                className="new-file-preview-item__remove"
                              >
                                ×
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Video Upload */}
                    <div className="new-upload-section">
                      <label className="form-field__label">
                        Add Videos (Optional)
                      </label>
                      <div className="new-upload-area">
                        <input
                          type="file"
                          multiple
                          accept="video/mp4,video/webm,video/mov,video/avi,image/gif"
                          onChange={handleVideoUpload}
                          className="new-upload-area__input"
                          id="video-upload"
                        />
                        <label
                          htmlFor="video-upload"
                          className="new-upload-area__content"
                        >
                          <Video className="new-upload-area__icon" />
                          <p className="new-upload-area__text">
                            Click to upload videos
                          </p>
                          <p className="new-upload-area__subtext">
                            MP4, WebM, MOV, AVI, GIF up to 50MB each
                          </p>
                        </label>
                      </div>

                      {/* Video Previews */}
                      {newReview.videoPreviews.length > 0 && (
                        <div className="new-file-previews">
                          {newReview.videoPreviews.map((preview, index) => (
                            <div key={index} className="new-file-preview-item">
                              <video
                                src={preview.url}
                                className="new-file-preview-item__media"
                                muted
                              />
                              <div className="new-file-preview-item__overlay">
                                <Video className="new-file-preview-item__type-icon" />
                              </div>
                              <button
                                onClick={() => handleRemoveVideo(index)}
                                className="new-file-preview-item__remove"
                              >
                                ×
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Anonymous Option */}
                    <div className="form-field">
                      <div className="checkbox-field">
                        <input
                          type="checkbox"
                          id="anonymous"
                          checked={newReview.is_anonymous}
                          onChange={(e) =>
                            setNewReview((prev) => ({
                              ...prev,
                              is_anonymous: e.target.checked,
                            }))
                          }
                          className="checkbox-field__input"
                        />
                        <label
                          htmlFor="anonymous"
                          className="checkbox-field__label"
                        >
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
                    onClick={() => {
                      setShowCreateModal(false);
                      // Clean up object URLs when closing modal
                      newReview.imagePreviews.forEach((preview) =>
                        URL.revokeObjectURL(preview.url)
                      );
                      newReview.videoPreviews.forEach((preview) =>
                        URL.revokeObjectURL(preview.url)
                      );
                      setNewReview({
                        rating: 0,
                        title: '',
                        content: '',
                        is_anonymous: false,
                        imageFiles: [],
                        videoFiles: [],
                        imagePreviews: [],
                        videoPreviews: [],
                      });
                    }}
                    className="btn btn--secondary"
                    disabled={uploading}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCreateReview}
                    disabled={
                      !newReview.rating || !newReview.content || uploading
                    }
                    className="btn btn--primary"
                    style={{
                      opacity:
                        !newReview.rating || !newReview.content || uploading
                          ? 0.5
                          : 1,
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
          )}

          {/* Image Modal */}
          {showImageModal && selectedImage && (
            <div
              className="modal-backdrop"
              onClick={() => setShowImageModal(false)}
            >
              <div
                className="modal image-modal"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="image-modal__container">
                  <button
                    onClick={() => setShowImageModal(false)}
                    className="image-modal__close"
                  >
                    <X />
                  </button>
                  <img
                    src={selectedImage}
                    alt="Review"
                    className="image-modal__image"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Video Modal */}
          {showVideoModal && selectedVideo && (
            <div
              className="modal-backdrop"
              onClick={() => setShowVideoModal(false)}
            >
              <div
                className="modal review-video-modal"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="review-video-modal__container">
                  <button
                    onClick={() => setShowVideoModal(false)}
                    className="review-video-modal__close"
                  >
                    <X />
                  </button>
                  <video
                    src={selectedVideo}
                    controls
                    autoPlay
                    className="review-video-modal__video"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
};

export default ProductReviews;
