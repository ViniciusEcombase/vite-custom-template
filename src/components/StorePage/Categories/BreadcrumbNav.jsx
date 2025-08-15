import React from 'react';
import { ChevronRight } from 'lucide-react';

const BreadcrumbNav = ({ breadcrumbs, onBreadcrumbClick, currentCategory }) => {
  // Always include "Store" as the root
  const fullBreadcrumbs = [
    { id: null, name: 'Store', path: null },
    ...(breadcrumbs || []),
  ];

  return (
    <nav className="breadcrumbs" aria-label="Breadcrumb navigation">
      {fullBreadcrumbs.map((breadcrumb, index) => {
        const isLast = index === fullBreadcrumbs.length - 1;
        const isCurrent = currentCategory?.id === breadcrumb.id;

        return (
          <div key={breadcrumb.id || 'store'} className="breadcrumb-item">
            <button
              className={`breadcrumb-link ${isCurrent ? 'current' : ''}`}
              onClick={() => onBreadcrumbClick(breadcrumb)}
              disabled={isCurrent}
              type="button"
            >
              {breadcrumb.name}
            </button>

            {!isLast && (
              <ChevronRight
                size={14}
                className="breadcrumb-separator"
                aria-hidden="true"
              />
            )}
          </div>
        );
      })}
    </nav>
  );
};

export default BreadcrumbNav;
