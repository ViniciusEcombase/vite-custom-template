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
  const [isLoadingProducts, setIsLoadingProducts] = useState(false);

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

  const isLeafCategory = (category) => {
    return category && category.children_count === 0;
  };

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
    []
  );

  const fetchProducts = useCallback(
    async (path = '', offset = 0, append = false) => {
      setIsLoadingProducts(true);

      const categoryPath = path === '' ? null : path;
      const { data, error } = await api.post('get_products_by_category_path', {
        category_path_input: categoryPath,
        store_id: storeId,
        page_offset: offset,
        page_limit: PRODUCTS_PER_PAGE,
      });

      if (error) {
        if (!append) setProducts([]);
        setIsLoadingProducts(false);
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
      setIsLoadingProducts(false);
    },
    []
  );

  const fetchCategoryInfo = useCallback(async (path) => {
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
  }, []);

  const fetchParentPath = useCallback(async (path) => {
    if (!path) return null;
    const { data, error } = await api.post('get_parent_category_path', {
      current_path: path,
    });
    if (error || !data) return null;
    return data;
  }, []);

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
    [fetchParentPath]
  );

  const handleBackClick = useCallback(async () => {
    if (currentPath === '') return;

    let newPath = '';

    if (isLeafCategory(currentCategory)) {
      const parentPath = await fetchParentPath(currentPath);
      if (!parentPath) return;
      const grandParentPath = await fetchParentPath(parentPath);
      newPath = grandParentPath || '';
    } else {
      const parentPath = await fetchParentPath(currentPath);
      newPath = parentPath || '';
    }

    setCurrentPath(newPath);
    setCurrentPage(0);

    await fetchCategoryInfo(newPath);
    await fetchCategories(null, newPath);
    await fetchParentCategoryName(newPath);

    const url = newPath ? `/store/${newPath}` : '/store';
    window.history.pushState({}, '', url);
  }, [
    currentPath,
    currentCategory,
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

  const handleAddToCart = (variant) => {
    // You can add cart logic here or navigate to product page
    if (variant.variant_slug) {
      window.location.href = `/product/${variant.variant_slug}`;
    } else {
      window.location.href = `/product/${variant.product_slug}`;
    }
  };

  useEffect(() => {
    const path = extractPathFromLocation(location.pathname) || '';
    if (path !== currentPath) {
      setCurrentPath(path);
    }
  }, [location.pathname]);

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
    if (isLeafCategory(currentCategory)) {
      backLabel = 'Go back two levels';
    } else {
      backLabel = isFirstLevel
        ? 'See all categories'
        : `Go back to: ${parentCategoryName}`;
    }
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
            loading={isLoadingProducts}
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
