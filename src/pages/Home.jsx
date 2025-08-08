import { useEffect, useCallback, useState, useMemo } from 'react';
import Header from '../components/Header/Header';
import useFetch from '../customHooks/useFetch';
import ProductCard from '../components/ProductCard/ProductCard';

const Home = () => {
  const [products, setProducts] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const api = useFetch({
    baseURL: `${import.meta.env.VITE_SUPABASE_URL}/rest/v1`,
    timeout: 10000,
    retries: 0,
    cache: true,
    defaultHeaders: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_SERVICE_KEY}`,
      apikey: import.meta.env.VITE_SUPABASE_SERVICE_KEY,
      Prefer: 'return=representation',
    },
  });

  // Group products by product_id to handle variants
  const groupedProducts = useMemo(() => {
    if (!products?.data) return [];

    const grouped = products.data.reduce((acc, variant) => {
      const productId = variant.product_id;
      if (!acc[productId]) {
        acc[productId] = [];
      }
      acc[productId].push(variant);
      return acc;
    }, {});

    // Convert to array and sort variants within each product
    return Object.values(grouped).map((variants) =>
      variants.sort((a, b) => {
        // Sort by stock (available first), then by price
        if (a.stock !== b.stock) return b.stock - a.stock;
        return a.current_price - b.current_price;
      })
    );
  }, [products]);

  useEffect(() => {
    const getProductData = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await api.get('/product_display_view');
        setProducts(res);
      } catch (err) {
        setError('Failed to load products. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    getProductData();
  }, []);

  const handleAddToCart = (variant) => {
    // You can add cart logic here or navigate to product page
    if (variant.variant_slug) {
      window.location.href = `/product/${variant.variant_slug}`;
    } else {
      window.location.href = `/product/${variant.product_slug}`;
    }
  };

  const handleViewDetails = (variant) => {
    // Navigate to product details page
    if (variant.variant_slug) {
      window.location.href = `/product/${variant.variant_slug}`;
    } else {
      window.location.href = `/product/${variant.product_slug}`;
    }
  };

  if (error) {
    return (
      <>
        <Header />
        <div className="container">
          <div
            style={{
              padding: 'var(--space-8)',
              background: 'var(--color-dark)',
              minHeight: '100vh',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <div
              style={{
                background: 'var(--color-gray-800)',
                border: '1px solid var(--color-error)',
                borderRadius: 'var(--radius-lg)',
                padding: 'var(--space-6)',
                textAlign: 'center',
                maxWidth: '400px',
              }}
            >
              <h2
                style={{
                  color: 'var(--color-error)',
                  marginBottom: 'var(--space-4)',
                }}
              >
                Error Loading Products
              </h2>
              <p
                style={{
                  color: 'var(--color-text-secondary)',
                  marginBottom: 'var(--space-4)',
                }}
              >
                {error}
              </p>
              <button
                onClick={() => window.location.reload()}
                style={{
                  background: 'var(--gradient-primary)',
                  color: 'var(--color-white)',
                  border: 'none',
                  padding: 'var(--space-3) var(--space-5)',
                  borderRadius: 'var(--radius-base)',
                  cursor: 'pointer',
                  fontWeight: '600',
                }}
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="container">
        {/* Hero Section */}
        <section
          style={{
            background:
              'linear-gradient(135deg, var(--color-gray-900), var(--color-gray-800))',
            padding: 'var(--space-16) var(--space-8)',
            textAlign: 'center',
            borderBottom: '1px solid var(--color-gray-700)',
          }}
        >
          <h1
            style={{
              fontSize: 'var(--text-4xl)',
              fontWeight: '700',
              color: 'var(--color-primary)',
              marginBottom: 'var(--space-4)',
              fontFamily: 'var(--font-heading)',
            }}
          >
            Welcome to Our Store
          </h1>
          <p
            style={{
              fontSize: 'var(--text-lg)',
              color: 'var(--color-text-secondary)',
              maxWidth: '600px',
              margin: '0 auto',
            }}
          >
            Discover our amazing collection of products with multiple variants
            and colors
          </p>
        </section>

        {/* Products Section */}
        <section
          style={{
            padding: 'var(--space-8)',
            background: 'var(--color-dark)',
            minHeight: '100vh',
          }}
        >
          <div
            style={{
              textAlign: 'center',
              marginBottom: 'var(--space-8)',
            }}
          >
            <h2
              style={{
                fontSize: 'var(--text-3xl)',
                fontWeight: '600',
                color: 'var(--color-text-primary)',
                marginBottom: 'var(--space-4)',
              }}
            >
              Featured Products
            </h2>
            <p
              style={{
                fontSize: 'var(--text-base)',
                color: 'var(--color-text-secondary)',
              }}
            >
              {loading
                ? 'Loading amazing products...'
                : `Showing ${groupedProducts.length} products`}
            </p>
          </div>

          {loading ? (
            <div
              style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                minHeight: '400px',
              }}
            >
              <div
                style={{
                  width: '40px',
                  height: '40px',
                  border: '4px solid var(--color-gray-600)',
                  borderTop: '4px solid var(--color-primary)',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite',
                }}
              ></div>
              <style>{`
                @keyframes spin {
                  0% { transform: rotate(0deg); }
                  100% { transform: rotate(360deg); }
                }
              `}</style>
            </div>
          ) : (
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: 'var(--space-6)',
                justifyContent: 'center',
                alignItems: 'flex-start',
              }}
            >
              {groupedProducts.length > 0 ? (
                groupedProducts.map((variants) => (
                  <ProductCard
                    key={variants[0].product_id}
                    variants={variants}
                    onAddToCart={handleAddToCart}
                    onViewDetails={handleViewDetails}
                  />
                ))
              ) : (
                <div
                  style={{
                    textAlign: 'center',
                    padding: 'var(--space-16)',
                    color: 'var(--color-text-muted)',
                  }}
                >
                  <h3 style={{ marginBottom: 'var(--space-4)' }}>
                    No products found
                  </h3>
                  <p>Check back later for new arrivals!</p>
                </div>
              )}
            </div>
          )}
        </section>
      </div>
    </>
  );
};

export default Home;
