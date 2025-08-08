import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useLocation } from 'react-router-dom';

import Header from '../components/Header/Header';
import CategorySidebar from '../components/StorePage/Categories/CategorySidebar';
import BreadcrumbNav from '../components/StorePage/Categories/BreadcrumbNav';
import ProductGrid from '../components/StorePage/Categories/ProductGrid';
import useFetch from '../customHooks/useFetch';

const PRODUCTS_PER_PAGE = 20;

const StorePage = ({ storeId = 1 }) => {
  const location = useLocation();

  const extractPathFromLocation = (pathname) => {
    if (!pathname.startsWith('/store')) return null;
    const p = pathname.slice('/store'.length);
    return p.startsWith('/') ? p.slice(1) : p;
  };

  const [currentPath, setCurrentPath] = useState(
    () => extractPathFromLocation(location.pathname) || ''
  );
  const [currentCategory, setCurrentCategory] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [breadcrumbs, setBreadcrumbs] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalProducts, setTotalProducts] = useState(0);
  const [hasMoreProducts, setHasMoreProducts] = useState(true);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [parentCategoryName, setParentCategoryName] = useState('');
  const [isLoadingProducts, setIsLoadingProducts] = useState(false); // ✅ track loading manually

  const apiCrud = useFetch({
    baseURL: `${import.meta.env.VITE_SUPABASE_URL}/rest/v1`,
    timeout: 10000,
    retries: 0,
    cache: true,
    defaultHeaders: {
      Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_SERVICE_KEY}`,
      'Content-Type': 'application/json',
      apikey: import.meta.env.VITE_SUPABASE_SERVICE_KEY,
    },
  });

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
        Prefer: 'return=representation',
      },
    })
  );
  const api = apiRef.current;

  const fetchCategories = useCallback(
    async (parentId = null, currentPath = '') => {
      if (currentPath === '') {
        const { data, error } = await apiCrud.get(`/categories?level=eq.1`);
        if (error) {
          setCategories([]);
          return;
        }
        setCategories(data || []);
      } else {
        const { data, error } = await api.post(
          'get_category_children_with_counts',
          {
            parent_category_id: parentId || null,
            store_id: storeId,
          }
        );
        if (error) {
          return;
        }
        if (data && data.length > 0) {
          setCategories(data);
        }
      }
    },
    [api, apiCrud, storeId]
  );

  const fetchProducts = useCallback(
    async (path = '', offset = 0, append = false) => {
      setIsLoadingProducts(true); // ✅ loading begins

      const categoryPath = path === '' ? null : path;
      const { data, error } = await api.post('get_products_by_category_path', {
        category_path_input: categoryPath,
        store_id: storeId,
        page_offset: offset,
        page_limit: PRODUCTS_PER_PAGE,
      });

      if (error) {
        if (!append) setProducts([]);
        setIsLoadingProducts(false); // ✅ end
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
      setIsLoadingProducts(false); // ✅ end
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
        { path_input: path, store_id: storeId }
      );

      if (categoryError) {
        setCurrentCategory(null);
        setBreadcrumbs([]);
        return;
      }

      const category = categoryData?.[0] || null;
      setCurrentCategory(category);

      if (category) {
        const { data: breadcrumbData, error: breadcrumbError } = await api.post(
          'get_category_breadcrumbs',
          { category_id_input: category.id }
        );

        if (breadcrumbError) {
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
        return null;
      }

      return data;
    },
    [api]
  );

  const fetchParentCategoryName = useCallback(
    async (currentPath) => {
      if (!currentPath) {
        setParentCategoryName('');
        return;
      }

      const parentPath = await fetchParentPath(currentPath);
      if (!parentPath) {
        setParentCategoryName('');
        return;
      }

      const { data, error } = await api.post('get_category_by_path', {
        path_input: parentPath,
        store_id: storeId,
      });

      if (error || !data || data.length === 0) {
        setParentCategoryName('');
        return;
      }

      setParentCategoryName(data[0].name || '');
    },
    [api, fetchParentPath, storeId]
  );

  const handleBackClick = useCallback(async () => {
    if (currentPath === '') return;

    const parentPath = await fetchParentPath(currentPath);
    const newPath = parentPath || '';

    setCurrentPath(newPath);
    setCurrentPage(0);

    await fetchCategoryInfo(newPath);
    await fetchCategories(null, newPath);
    await fetchParentCategoryName(newPath);

    const url = newPath ? `/store/${newPath}` : '/store';
    window.history.pushState({}, '', url);
  }, [
    currentPath,
    fetchParentPath,
    fetchCategoryInfo,
    fetchCategories,
    fetchParentCategoryName,
  ]);

  const handleCategorySelect = useCallback((category) => {
    const newPath = category.path || '';
    setCurrentPath(newPath);
    setCurrentPage(0);
    window.history.pushState({}, '', newPath ? `/store/${newPath}` : '/store');
  }, []);

  const handleBreadcrumbClick = useCallback((breadcrumb) => {
    const newPath = breadcrumb.path || '';
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
    // Add to cart logic
  }, []);

  // Sync currentPath with URL
  useEffect(() => {
    const path = extractPathFromLocation(location.pathname) || '';
    if (path !== currentPath) {
      setCurrentPath(path);
    }
  }, [location.pathname]);

  // Fetch all necessary data when currentPath changes
  useEffect(() => {
    setCurrentPage(0);
    fetchCategoryInfo(currentPath);
    fetchProducts(currentPath, 0, false);
    fetchCategories(currentCategory?.id || null, currentPath);
    fetchParentCategoryName(currentPath);
  }, [
    currentPath,
    currentCategory?.id,
    fetchCategoryInfo,
    fetchProducts,
    fetchCategories,
    fetchParentCategoryName,
  ]);

  const pathSegments = currentPath ? currentPath.split('/') : [];
  const isRoot = currentPath === '';
  const isFirstLevel = pathSegments.length === 1 && !isRoot;
  const isDeeperLevel = pathSegments.length > 1;
  const canGoBack = !isRoot;

  let backLabel = '';
  if (canGoBack) {
    backLabel = isFirstLevel
      ? 'See all categories'
      : parentCategoryName || 'Back';
  }

  const getPageTitle = () => currentCategory?.name || 'All Products';
  const getPageSubtitle = () =>
    currentCategory
      ? `Showing ${totalProducts} products in ${currentCategory.name}`
      : `Showing ${totalProducts} products from all categories`;

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
          backLabel={backLabel}
          loading={false}
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
            loading={isLoadingProducts} // ✅ Use stable loading
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
