import React, { useState, useMemo } from 'react';

const ProductCard = ({
  variants = [], // Array of variant objects from your API
  onAddToCart,
  onViewDetails,
}) => {
  // Group variants by product_id and get the first variant as default
  const productData = useMemo(() => {
    if (!variants || variants.length === 0) return null;

    // All variants belong to the same product, so we can use the first one for product info
    const firstVariant = variants[0];

    return {
      productId: firstVariant.product_id,
      productName: firstVariant.product_name,
      productSlug: firstVariant.product_slug,
      description: firstVariant.description,
      categories: firstVariant.categories,
      collections: firstVariant.collections,
    };
  }, [variants]);

  const [selectedVariant, setSelectedVariant] = useState(() => {
    // Always ensure we have a selected variant - prioritize variants with stock
    if (!variants || variants.length === 0) return null;

    // Find first variant with stock, or fallback to first variant
    const availableVariant = variants.find((v) => v.stock > 0);
    return availableVariant || variants[0];
  });

  // Update selected variant when variants prop changes
  React.useEffect(() => {
    if (variants && variants.length > 0 && !selectedVariant) {
      const availableVariant = variants.find((v) => v.stock > 0);
      setSelectedVariant(availableVariant || variants[0]);
    }
  }, [variants, selectedVariant]);

  // Get unique colors for variant selector
  const colorVariants = useMemo(() => {
    if (!variants) return [];

    const colors = variants.reduce((acc, variant) => {
      const color = variant.attributes?.Color;
      if (color && !acc.find((c) => c.color === color)) {
        acc.push({
          color: color,
          variant: variant,
          available: variant.stock > 0,
        });
      }
      return acc;
    }, []);

    return colors;
  }, [variants]);

  // Get color hex values for display (you might want to store these in your DB)
  const getColorHex = (colorName) => {
    const colorMap = {
      Black: '#1a1a1a',
      White: '#ffffff',
      Blue: '#3b82f6',
      Grey: '#6b7280',
      Gray: '#6b7280',
      Red: '#ef4444',
      Green: '#10b981',
      Yellow: '#f59e0b',
      Purple: '#8b5cf6',
      Pink: '#ec4899',
      Orange: '#f97316',
    };
    return colorMap[colorName] || '#6b7280';
  };

  const handleVariantSelect = (variant) => {
    setSelectedVariant(variant);
  };

  const handleAddToCart = () => {
    if (selectedVariant && onAddToCart) {
      onAddToCart(selectedVariant);
    }
  };

  if (!productData || !selectedVariant) {
    return null;
  }

  // Calculate discount percentage
  const discountPercentage =
    selectedVariant.original_price > selectedVariant.current_price
      ? Math.round(
          ((selectedVariant.original_price - selectedVariant.current_price) /
            selectedVariant.original_price) *
            100
        )
      : 0;

  return (
    <div className="product-card">
      {/* Image Container */}
      <div className="product-image-container">
        <img
          src={
            selectedVariant.files?.[0]?.file_url ||
            'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=300&fit=crop'
          }
          alt={`${productData.productName} - ${selectedVariant.variant_name}`}
          className="product-image"
        />

        {/* Discount Badge */}
        {discountPercentage > 0 && (
          <span className="product-badge">-{discountPercentage}%</span>
        )}
      </div>

      {/* Content Container */}
      <div className="product-content">
        {/* Title */}
        <h3 className="product-title">{selectedVariant.variant_name}</h3>

        {/* Price Section */}
        <div className="product-pricing">
          <span className="current-price">
            ${selectedVariant.current_price}
          </span>
          {selectedVariant.original_price > selectedVariant.current_price && (
            <span className="original-price">
              ${selectedVariant.original_price}
            </span>
          )}
        </div>

        {/* Variant Selector */}
        {colorVariants.length > 1 && (
          <div className="variant-selector">
            <span className="variant-label">Colors:</span>
            <div className="variant-options">
              {colorVariants.map((colorOption, index) => (
                <button
                  key={index}
                  className={`variant-option ${
                    selectedVariant.variant_id ===
                    colorOption.variant.variant_id
                      ? 'selected'
                      : ''
                  } ${!colorOption.available ? 'unavailable' : ''}`}
                  onClick={() => handleVariantSelect(colorOption.variant)}
                  disabled={!colorOption.available}
                  title={`${colorOption.color} ${
                    !colorOption.available ? '(Out of Stock)' : ''
                  }`}
                  style={{
                    backgroundColor: getColorHex(colorOption.color),
                    border:
                      colorOption.color === 'White'
                        ? '2px solid var(--color-gray-600)'
                        : 'none',
                  }}
                  aria-label={`Select ${colorOption.color} variant`}
                >
                  {!colorOption.available && (
                    <span className="unavailable-cross">×</span>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="product-actions">
          <button
            className={`add-to-cart-btn ${
              selectedVariant.stock === 0 ? 'disabled' : ''
            }`}
            onClick={handleAddToCart}
            disabled={selectedVariant.stock === 0}
          >
            {selectedVariant.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
