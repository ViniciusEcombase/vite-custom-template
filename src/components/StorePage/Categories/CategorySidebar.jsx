import React from 'react';
import { ChevronLeft } from 'lucide-react';

const CategorySidebar = ({
  categories,
  currentCategory,
  onCategorySelect,
  onBackClick,
  canGoBack,
  loading,
}) => {
  if (loading) {
    return (
      <div className="store-sidebar">
        <div className="sidebar-header">
          <h2 className="sidebar-title">Categories</h2>
        </div>
        <div className="loading-spinner">
          <div className="spinner"></div>
        </div>
      </div>
    );
  }

  const getSidebarTitle = () => {
    if (!currentCategory) return 'All Categories';
    return `${currentCategory.name} Categories`;
  };

  return (
    <div className="store-sidebar">
      <div className="sidebar-header">
        <h2 className="sidebar-title">{getSidebarTitle()}</h2>
      </div>

      {canGoBack && (
        <button
          className="sidebar-back-btn"
          onClick={onBackClick}
          type="button"
        >
          <ChevronLeft size={16} />
          Back to Parent
        </button>
      )}

      <nav>
        <ul className="category-list">
          {categories.map((category) => (
            <li key={category.id} className="category-item">
              <button
                className={`category-link ${
                  currentCategory?.id === category.id ? 'active' : ''
                }`}
                onClick={() => onCategorySelect(category)}
                type="button"
              >
                <span className="category-name">{category.name}</span>
                <span className="category-count">
                  {category.product_count || 0}
                </span>
              </button>
            </li>
          ))}
        </ul>
      </nav>

      {categories.length === 0 && !loading && (
        <div className="empty-state">
          <div className="empty-state-icon">📂</div>
          <h3 className="empty-state-title">No Categories</h3>
          <p className="empty-state-message">
            No subcategories found in this section.
          </p>
        </div>
      )}
    </div>
  );
};

export default CategorySidebar;
