import React, { useEffect, useState, useMemo } from 'react';
import useFetch from '../../customHooks/useFetch';
import { useAuth } from '../../contextProviders/AuthProvider';

// Import all modular components
import ReviewsSummary from './ReviewsSummary';
import ReviewsHeader from './ReviewsHeader';
import ReviewsFilters from './ReviewsFilters';
import ReviewsList from './ReviewsList';
import CreateReviewModal from './CreateReviewModal';
import MediaModal from './MediaModal';

const BUCKET_NAME = 'loja-do-vini';
const SUPABASE_URL = 'https://niihlyofonxtmzgzanpv.supabase.co';
const SERVICE_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5paWhseW9mb254dG16Z3phbnB2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NjcyMzg2MCwiZXhwIjoyMDYyMjk5ODYwfQ.4Cy3yD5bJcDoI5xf1hYCdswiNHpRy1C9zETJH6czBpk';

const ProductReviews = ({ slug }) => {
  // State management
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

  const { user } = useAuth();

  // API setup
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

  // Constants
  const reviewsPerPage = 5;

  // Computed values
  const filteredReviews = useMemo(() => {
    if (!selectedRatingFilter) return payload?.data[0].reviews;
    return payload.data[0].reviews.filter(
      (review) => review.rating === selectedRatingFilter
    );
  }, [payload, selectedRatingFilter]);

  const paginatedReviews = useMemo(() => {
    const startIndex = (currentPage - 1) * reviewsPerPage;
    return filteredReviews?.slice(startIndex, startIndex + reviewsPerPage);
  }, [filteredReviews, currentPage]);

  const totalPages = useMemo(() => {
    return filteredReviews
      ? Math.ceil(filteredReviews.length / reviewsPerPage)
      : 0;
  }, [filteredReviews, reviewsPerPage]);

  // Utility functions
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

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

  // Event handlers
  const handleFilterChange = (rating) => {
    setSelectedRatingFilter(selectedRatingFilter === rating ? null : rating);
    setCurrentPage(1);
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

    e.target.value = '';
  };

  const handleRemoveImage = (index) => {
    URL.revokeObjectURL(newReview.imagePreviews[index].url);
    setNewReview((prev) => ({
      ...prev,
      imageFiles: prev.imageFiles.filter((_, i) => i !== index),
      imagePreviews: prev.imagePreviews.filter((_, i) => i !== index),
    }));
  };

  const handleRemoveVideo = (index) => {
    URL.revokeObjectURL(newReview.videoPreviews[index].url);
    setNewReview((prev) => ({
      ...prev,
      videoFiles: prev.videoFiles.filter((_, i) => i !== index),
      videoPreviews: prev.videoPreviews.filter((_, i) => i !== index),
    }));
  };
  const handleCreateReview = async () => {
    if (!newReview.rating || !newReview.content) {
      alert('Please provide a rating and review content.');
      return;
    }

    setUploading(true);
    setUploadError(null);

    try {
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
      const reviewId = createdReview.data[0].id;

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
        const filePath = `variant_1/${fileName}`;

        const uploadPromise = uploadFile(BUCKET_NAME, filePath, file)
          .then((url) => createReviewMedia(reviewId, url, 'video'))
          .catch((error) => {
            console.error(`Failed to upload video ${file.name}:`, error);
            throw error;
          });

        allMediaPromises.push(uploadPromise);
      }

      await Promise.all(allMediaPromises);

      alert('Review submitted successfully!');
      setShowCreateModal(false);
      resetForm();
      // Refresh the reviews list
      const res = await api.get(
        `/product_variant_reviews_view?variant_slug=eq.${slug}`
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

  const resetForm = () => {
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
  };

  const handleImageClick = (image) => {
    setSelectedImage(image);
    setShowImageModal(true);
  };

  const handleVideoClick = (video) => {
    setSelectedVideo(video);
    setShowVideoModal(true);
  };

  const handleCloseCreateModal = () => {
    setShowCreateModal(false);
    resetForm();
  };

  // Initialize data
  useEffect(() => {
    const init = async () => {
      const res = await api.get(
        `/product_variant_reviews_view?variant_slug=eq.${slug}`
      );
      setPayload(res);
    };
    init();
  }, []);

  // Render logic
  console.log(payload);
  

  return (
    <>
      {payload && (
        <>
          {showSummary ? (
            <ReviewsSummary
              payload={payload}
              onShowAllReviews={() => setShowSummary(false)}
              onWriteReview={() => setShowCreateModal(true)}
              formatDate={formatDate}
            />
          ) : (
            <div className="reviews-container">
              <ReviewsHeader
                payload={payload}
                onShowSummary={() => setShowSummary(true)}
                onWriteReview={() => setShowCreateModal(true)}
              />

              <div className="reviews-grid">
                <div>
                  <ReviewsFilters
                    payload={payload}
                    selectedRatingFilter={selectedRatingFilter}
                    onFilterChange={handleFilterChange}
                  />
                </div>

                <div>
                  <ReviewsList
                    reviews={paginatedReviews}
                    formatDate={formatDate}
                    onImageClick={handleImageClick}
                    onVideoClick={handleVideoClick}
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Create Review Modal */}
          <CreateReviewModal
            show={showCreateModal}
            onClose={handleCloseCreateModal}
            newReview={newReview}
            onReviewChange={setNewReview}
            onImageUpload={handleImageUpload}
            onVideoUpload={handleVideoUpload}
            onRemoveImage={handleRemoveImage}
            onRemoveVideo={handleRemoveVideo}
            onSubmit={handleCreateReview}
            uploading={uploading}
            uploadError={uploadError}
          />

          {/* Image Modal */}
          <MediaModal
            show={showImageModal}
            type="image"
            src={selectedImage}
            onClose={() => setShowImageModal(false)}
          />

          {/* Video Modal */}
          <MediaModal
            show={showVideoModal}
            type="video"
            src={selectedVideo}
            onClose={() => setShowVideoModal(false)}
          />
        </>
      )}
    </>
  );
};

export default ProductReviews;
