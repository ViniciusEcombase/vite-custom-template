import React, { useState, useEffect, useRef, useMemo } from 'react';
import ProductCard from '../../ProductCard/ProductCard'; // Adjust path as needed

const ProductGrid = ({
  products,
  loading,
  hasMore,
  onLoadMore,
  searchTerm,
  onAddToCart,
}) => {
  const loadingRef = useRef(null);
  const observerRef = useRef(null);

  // Memoized filtered products to prevent unnecessary recalculations
  const filteredProducts = useMemo(() => {
    if (!searchTerm) {
      return products;
    }

    const lowerTerm = searchTerm.toLowerCase();
    return products.filter(
      (product) =>
        product.product_name?.toLowerCase().includes(lowerTerm) ||
        product.variant_name?.toLowerCase().includes(lowerTerm)
    );
  }, [products, searchTerm]);

  // Memoized grouped products to prevent unnecessary recalculations
  const productGroups = useMemo(() => {
    const grouped = filteredProducts.reduce((acc, product) => {
      const id = product.product_id;
      if (!acc[id]) acc[id] = [];
      acc[id].push(product);
      return acc;
    }, {});

    return Object.values(grouped);
  }, [filteredProducts]);

  // Setup IntersectionObserver for infinite scroll
  useEffect(() => {
    const currentRef = loadingRef.current;

    // Clean up previous observer
    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    if (!currentRef || !hasMore) return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry.isIntersecting && hasMore && !loading) {
          onLoadMore();
        }
      },
      { threshold: 0.1 }
    );

    observerRef.current.observe(currentRef);

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [hasMore, loading, onLoadMore]);

  return (
    <div className="product-grid-container">
      <div className="products-grid">
        {productGroups.map((variants, index) => {
          return (
            <ProductCard
              key={`${variants[0].product_id}-${index}`}
              variants={variants}
              onAddToCart={onAddToCart}
            />
          );
        })}
      </div>

      {/* Infinite scroll trigger + fallback button */}
      {hasMore && (
        <div ref={loadingRef} className="load-more-container">
          {loading ? (
            <div className="loading-spinner">
              <div className="spinner"></div>
              <p>Loading more products...</p>
            </div>
          ) : (
            <button
              className="load-more-btn"
              onClick={onLoadMore}
              type="button"
              disabled={loading}
            >
              Load More Products
            </button>
          )}
        </div>
      )}

      {!hasMore && productGroups.length > 0 && (
        <div className="end-of-results">
          <p>You've reached the end of the products</p>
        </div>
      )}
    </div>
  );
};

export default ProductGrid;
