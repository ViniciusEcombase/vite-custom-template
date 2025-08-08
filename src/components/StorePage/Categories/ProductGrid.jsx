import React, { useState, useEffect, useRef } from 'react';
import ProductCard from '../../ProductCard/ProductCard'; // Assuming this is imported from your existing component

const ProductGrid = ({
  products,
  loading,
  hasMore,
  onLoadMore,
  searchTerm,
  onAddToCart,
}) => {
  const [filteredProducts, setFilteredProducts] = useState([]);
  const observerRef = useRef();
  const loadingRef = useRef();

  // Filter products based on search term
  useEffect(() => {
    if (!searchTerm) {
      setFilteredProducts(products);
    } else {
      const filtered = products.filter(
        (product) =>
          product.product_name
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          product.variant_name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredProducts(filtered);
    }
  }, [products, searchTerm]);

  // Infinite scroll observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          onLoadMore();
        }
      },
      { threshold: 0.1 }
    );

    if (loadingRef.current) {
      observer.observe(loadingRef.current);
    }

    return () => {
      if (loadingRef.current) {
        observer.unobserve(loadingRef.current);
      }
    };
  }, [hasMore, loading, onLoadMore]);

  // Group products by product_id to pass variants to ProductCard
  const groupedProducts = filteredProducts.reduce((acc, product) => {
    const productId = product.product_id;

    if (!acc[productId]) {
      acc[productId] = [];
    }

    acc[productId].push(product);
    return acc;
  }, {});

  const productGroups = Object.values(groupedProducts);

  if (loading && filteredProducts.length === 0) {
    return (
      <div className="loading-spinner">
        <div className="spinner"></div>
      </div>
    );
  }

  if (filteredProducts.length === 0 && !loading) {
    return (
      <div className="empty-state">
        <div className="empty-state-icon">🛍️</div>
        <h3 className="empty-state-title">
          {searchTerm ? 'No products found' : 'No products available'}
        </h3>
        <p className="empty-state-message">
          {searchTerm
            ? `No products match "${searchTerm}". Try adjusting your search.`
            : 'There are no products in this category yet.'}
        </p>
        {searchTerm && (
          <button
            className="empty-state-action"
            onClick={() => window.location.reload()}
          >
            Clear Search
          </button>
        )}
      </div>
    );
  }

  return (
    <>
      <div className="products-grid">
        {productGroups.map((variants, index) => (
          <ProductCard
            key={`${variants[0].product_id}-${index}`}
            variants={variants}
            onAddToCart={onAddToCart}
            onViewDetails={(variant) => {
              // Handle view details if needed
              console.log('View details:', variant);
            }}
          />
        ))}
      </div>

      {/* Infinite scroll trigger and loading indicator */}
      {hasMore && (
        <div ref={loadingRef} className="load-more-container">
          {loading ? (
            <div className="loading-spinner">
              <div className="spinner"></div>
            </div>
          ) : (
            <button
              className="load-more-btn"
              onClick={onLoadMore}
              type="button"
            >
              Load More Products
            </button>
          )}
        </div>
      )}
    </>
  );
};

export default ProductGrid;
