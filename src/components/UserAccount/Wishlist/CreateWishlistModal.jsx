import React, { useState } from 'react';
import * as Lucide from 'lucide-react';
import { useWishlist } from '../../../contextProviders/WishlistProvider';
import Button from '../../Button/Button';

// ========================= //
// ➕ CREATE WISHLIST MODAL  //
// ========================= //

export const CreateWishlistModal = ({ onClose }) => {
  const { createWishlist } = useWishlist();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isPublic, setIsPublic] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!name.trim()) return;

    setLoading(true);
    try {
      const result = await createWishlist(
        name.trim(),
        description.trim(),
        isPublic
      );
      if (result.success) {
        onClose();
      }
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="wishlist-selector-overlay" onClick={onClose}>
      <div
        className="wishlist-selector-modal"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="wishlist-selector-header">
          <h3 className="wishlist-selector-title">Create New Wishlist</h3>
          <Button
            variant="secondary"
            onClick={onClose}
            startIcon={<Lucide.X size={16} />}
          />
        </div>

        <form>
          <div style={{ marginBottom: 'var(--space-4)' }}>
            <label
              style={{
                display: 'block',
                marginBottom: 'var(--space-2)',
                color: 'var(--color-text-primary)',
              }}
            >
              Wishlist Name *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Holiday Gifts"
              style={{
                width: '100%',
                padding: 'var(--space-3)',
                background: 'var(--color-gray-800)',
                border: '1px solid var(--color-gray-600)',
                borderRadius: 'var(--radius-base)',
                color: 'var(--color-text-primary)',
              }}
              autoFocus
            />
          </div>

          <div style={{ marginBottom: 'var(--space-4)' }}>
            <label
              style={{
                display: 'block',
                marginBottom: 'var(--space-2)',
                color: 'var(--color-text-primary)',
              }}
            >
              Description (Optional)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add a description..."
              rows={3}
              style={{
                width: '100%',
                padding: 'var(--space-3)',
                background: 'var(--color-gray-800)',
                border: '1px solid var(--color-gray-600)',
                borderRadius: 'var(--radius-base)',
                color: 'var(--color-text-primary)',
                resize: 'vertical',
              }}
            />
          </div>

          <div style={{ marginBottom: 'var(--space-6)' }}>
            <label
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--space-2)',
                cursor: 'pointer',
              }}
            >
              <input
                type="checkbox"
                checked={isPublic}
                onChange={(e) => setIsPublic(e.target.checked)}
              />
              <span style={{ color: 'var(--color-text-primary)' }}>
                Make this wishlist public
              </span>
            </label>
          </div>

          <div className="wishlist-selector-actions">
            <Button text={'Cancel'} onClick={onClose} variant="secondary" />
            <Button
              disabled={!name.trim() || loading}
              text={loading ? 'Creating...' : 'Create Wishlist'}
              variant="primary"
              onClick={handleSubmit}
            />
          </div>
        </form>
      </div>
    </div>
  );
};
