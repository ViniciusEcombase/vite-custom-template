import React, { useState, useEffect, createContext, useContext } from 'react';
import * as Lucide from 'lucide-react';

// ========================= //
// ➕ CREATE WISHLIST MODAL  //
// ========================= //

const CreateWishlistModal = ({ onClose }) => {
  const { createWishlist } = useWishlist();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isPublic, setIsPublic] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    setLoading(true);
    const result = await createWishlist(
      name.trim(),
      description.trim(),
      isPublic
    );
    setLoading(false);

    if (result.success) {
      onClose();
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
          <button className="wishlist-selector-close" onClick={onClose}>
            <Lucide.X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
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
            <button
              type="button"
              className="wishlist-selector-cancel"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="wishlist-selector-confirm"
              disabled={!name.trim() || loading}
            >
              {loading ? 'Creating...' : 'Create Wishlist'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
