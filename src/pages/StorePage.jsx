import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Search } from 'lucide-react';
import Header from '../components/Header/Header';
import CategorySidebar from '../components/StorePage/Categories/CategorySidebar';
import BreadcrumbNav from '../components/StorePage/Categories/BreadcrumbNav';
import ProductGrid from '../components/StorePage/Categories/ProductGrid';
import useFetch from '../customHooks/useFetch';

const PRODUCTS_PER_PAGE = 20;

const StorePage = ({ initialPath = null, storeId = 1 }) => {
  const [currentPath, setCurrentPath] = useState(initialPath);
  const [currentCategory, setCurrentCategory] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [breadcrumbs, setBreadcrumbs] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalProducts, setTotalProducts] = useState(0);
  const [hasMoreProducts, setHasMoreProducts] = useState(true);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);

  // Stable instance of useFetch — only call once
  const apiRef = useRef(
    useFetch({
      baseURL: `${import.meta.env.VITE_SUPABASE_URL}/rest/v1/rpc/`,
      timeout: 10000,
      retries: 0,
      cache: false,
      defaultHeaders: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_SERVICE_KEY}`,
        apikey: import.meta.env.VITE_SUPABASE_SERVICE_KEY,
      },
    })
  );
  const api = apiRef.current;

  // ============ FETCHING ============

  const fetchCategories = useCallback(
    async (parentId = null) => {
      const { data, error } = await api.post(
        'get_category_children_with_counts',
        {
          parent_category_id: parentId,
          store_id: storeId,
        }
      );

      if (error) {
        console.error('Error loading categories:', error);
        setCategories([]);
        return;
      }

      setCategories(data || []);
    },
    [api, storeId]
  );

  const fetchProducts = useCallback(
    async (path = null, offset = 0, append = false) => {
      const { data, error } = await api.post('get_products_by_category_path', {
        category_path_input: path,
        store_id: storeId,
        page_offset: offset,
        page_limit: PRODUCTS_PER_PAGE,
      });

      if (error) {
        console.error('Error loading products:', error);
        if (!append) setProducts([]);
        return;
      }

      const newProducts = data || [];

      if (append) {
        setProducts((prev) => [...prev, ...newProducts]);
        setTotalProducts((prev) => prev + newProducts.length);
      } else {
        setProducts(newProducts);
        setTotalProducts(newProducts.length);
      }

      setHasMoreProducts(newProducts.length === PRODUCTS_PER_PAGE);
    },
    [api, storeId]
  );

  const fetchCategoryInfo = useCallback(
    async (path) => {
      if (!path) {
        setCurrentCategory(null);
        setBreadcrumbs([]);
        return;
      }

      const { data: categoryData, error: categoryError } = await api.post(
        'get_category_by_path',
        {
          path_input: path,
          store_id: storeId,
        }
      );

      if (categoryError) {
        console.error('Error fetching category info:', categoryError);
        setCurrentCategory(null);
        setBreadcrumbs([]);
        return;
      }

      const category = categoryData?.[0] || null;
      setCurrentCategory(category);

      if (category) {
        const { data: breadcrumbData, error: breadcrumbError } = await api.post(
          'get_category_breadcrumbs',
          {
            category_id_input: category.id,
          }
        );

        if (breadcrumbError) {
          console.error('Error fetching breadcrumbs:', breadcrumbError);
          setBreadcrumbs([]);
        } else {
          setBreadcrumbs(breadcrumbData || []);
        }
      } else {
        setBreadcrumbs([]);
      }
    },
    [api, storeId]
  );

  const fetchParentPath = useCallback(
    async (currentPath) => {
      const { data, error } = await api.post('get_parent_category_path', {
        current_path: currentPath,
      });

      if (error) {
        console.error('Error getting parent category path:', error);
        return null;
      }

      return data;
    },
    [api]
  );

  // ============ EVENT HANDLERS ============

  const handleBackClick = useCallback(async () => {
    if (!currentPath) return;

    const parentPath = await fetchParentPath(currentPath);
    setCurrentPath(parentPath);
    setCurrentPage(0);

    const url = parentPath ? `/store/${parentPath}` : '/store';
    window.history.pushState({}, '', url);
  }, [currentPath, fetchParentPath]);

  const handleCategorySelect = useCallback((category) => {
    const newPath = category.path;
    setCurrentPath(newPath);
    setCurrentPage(0);
    window.history.pushState({}, '', `/store/${newPath}`);
  }, []);

  const handleBreadcrumbClick = useCallback((breadcrumb) => {
    const newPath = breadcrumb.path || null;
    setCurrentPath(newPath);
    setCurrentPage(0);
    window.history.pushState({}, '', newPath ? `/store/${newPath}` : '/store');
  }, []);

  const handleLoadMore = useCallback(() => {
    if (hasMoreProducts) {
      const nextPage = currentPage + 1;
      setCurrentPage(nextPage);
      fetchProducts(currentPath, nextPage * PRODUCTS_PER_PAGE, true);
    }
  }, [hasMoreProducts, currentPage, currentPath, fetchProducts]);

  const handleAddToCart = useCallback((variant) => {
    console.log('Adding to cart:', variant);
  }, []);

  // ============ INIT FETCH ============

  useEffect(() => {
    fetchCategoryInfo(currentPath);
    fetchProducts(currentPath, 0, false);
    setCurrentPage(0);
  }, [currentPath, fetchCategoryInfo, fetchProducts]);

  useEffect(() => {
    fetchCategories(currentCategory?.id || null);
  }, [currentCategory?.id, fetchCategories]);

  // ============ DISPLAY ============

  const getPageTitle = () => currentCategory?.name || 'All Products';
  const getPageSubtitle = () =>
    currentCategory
      ? `Showing ${totalProducts} products in ${currentCategory.name}`
      : `Showing ${totalProducts} products from all categories`;

  const canGoBack = currentPath && currentPath.includes('/');

  return (
    <>
      <Header />
      <div className="store-page">
        <CategorySidebar
          categories={categories}
          currentCategory={currentCategory}
          onCategorySelect={handleCategorySelect}
          onBackClick={handleBackClick}
          canGoBack={canGoBack}
          loading={api.loading}
        />

        <main className="store-main">
          <header className="store-header">
            <BreadcrumbNav
              breadcrumbs={breadcrumbs}
              onBreadcrumbClick={handleBreadcrumbClick}
              currentCategory={currentCategory}
            />

            <h1 className="store-title">{getPageTitle()}</h1>
            <p className="store-subtitle">{getPageSubtitle()}</p>
          </header>

          <ProductGrid
            products={products}
            loading={api.loading}
            hasMore={hasMoreProducts}
            onLoadMore={handleLoadMore}
            searchTerm={searchTerm}
            onAddToCart={handleAddToCart}
          />
        </main>
      </div>
    </>
  );
};

export default StorePage;
