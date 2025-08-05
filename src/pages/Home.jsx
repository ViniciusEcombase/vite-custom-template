import { useEffect, useCallback, useState } from 'react';
import Header from '../components/Header/Header';
import useFetch from '../customHooks/useFetch';
import ProductCard from '../components/ProductCard/ProductCard';

const Home = () => {
  const [products, setProducts] = useState(null);
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
  useEffect(() => {
    const getProductData = async () => {
      const res = await api.get('/product_display_view');
      setProducts(res);
    };
    getProductData();
  }, []);

  const handleAddToCart = (e) => {
    window.location.href = `/product/${e}`;
  };

  const handleViewDetails = () => {};

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
            flexWrap: 'wrap',
            gap: 'var(--space-6)',
            justifyContent: 'center',
            alignItems: 'flex-start',
          }}
        >
          {products &&
            products.data.map((item) => {
              console.log(products);
              console.log(item);
              const firstImage = item.files;
              return (
                <ProductCard
                  key={item.variant_id}
                  image={firstImage?.[0]?.file_url || 'vini'}
                  title={item.product_name}
                  description={item.description}
                  price={item.price}
                  originalPrice="399.99"
                  rating={4.5}
                  reviews={128}
                  badge="Sale"
                  onAddToCart={() => {
                    handleAddToCart(item.slug);
                  }}
                  onViewDetails={handleViewDetails}
                />
              );
            })}
        </div>
        <h1>Essa é a home!!!</h1>
        <h1>Aqui vão ter coisas da home...</h1>
        <h1>Tipo produtos</h1>
        <h1>Banners</h1>
        <h1>Promoções etc</h1>
      </div>
    </>
  );
};

export default Home;
