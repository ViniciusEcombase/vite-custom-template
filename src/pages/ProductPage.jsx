import React, { useState, useEffect } from 'react';
import Header from '../components/Header/Header';
import Button from '../components/Button/Button';
import useFetch from '../customHooks/useFetch';
import { useParams, useNavigate } from 'react-router-dom';
import { useCart } from '../contextProviders/CartProvider';
import { useAuth } from '../contextProviders/AuthProvider.tsx';
import { useModalActions } from '../contextProviders/ModalProvider';
import { WishlistButton } from '../components/UserAccount/Wishlist/WishlistButton'; // Import WishlistButton
import ProductReviews from '../components/Review/ProductReviews.jsx';

const ProductPage = ({ productId }) => {
  const { showAlert } = useModalActions();
  const { addCartItem, setShowCart } = useCart();
  const { user } = useAuth();
  const { variantSlug } = useParams();
  const [product, setProduct] = useState([]);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedButton, setSelectedButton] = useState({});
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('description');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

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
      try {
        setLoading(true);

        if (!variantSlug) {
          setLoading(false);
          return;
        }

        // Load the specific variant
        const currentVariantRes = await api.get(
          `/product_display_view?variant_slug=eq.${variantSlug}`
        );

        if (currentVariantRes?.data?.length > 0) {
          const currentVariant = currentVariantRes.data[0];

          // Load all variants for this product using the product_slug from current variant
          const allVariantsRes = await api.get(
            `/product_display_view?product_slug=eq.${currentVariant.product_slug}`
          );

          if (allVariantsRes?.data?.length > 0) {
            setProduct(allVariantsRes.data);
            setSelectedVariant(currentVariant);

            // Set the selected attributes based on current variant
            const currentAttributes = currentVariant.attributes || {};
            setSelectedButton(currentAttributes);
          }
        } else {
          // Variant not found
          // You might want to redirect to 404 or home page here
        }
      } catch (error) {
      } finally {
        setLoading(false);
      }
    };

    getProductData();
  }, [variantSlug]);

  // Get available options for a specific attribute based on current selection
  const getAvailableOptionsForAttribute = (attributeName) => {
    if (!product || product.length === 0) return {};

    const availableForAttribute = {};
    const attributeOptions = product[0]?.attribute_options || [];

    // Get all possible values for this attribute
    const attributeOption = attributeOptions.find(
      (option) => option.name === attributeName
    );

    if (!attributeOption) return {};

    // Find the index of current attribute in the options array
    const currentAttributeIndex = attributeOptions.findIndex(
      (option) => option.name === attributeName
    );

    attributeOption.values.forEach((value) => {
      // For the FIRST attribute (index 0), check all variants
      if (currentAttributeIndex === 0) {
        const matchingVariants = product.filter((variant) => {
          const attributes = variant.attributes || {};
          return attributes[attributeName] === value;
        });

        const hasStock = matchingVariants.some((variant) => variant.stock > 0);
        const hasVariant = matchingVariants.length > 0;

        availableForAttribute[value] = {
          exists: hasVariant,
          inStock: hasStock,
          variant: matchingVariants[0], // Get first matching variant
        };
      } else {
        // For SUBSEQUENT attributes, filter based on previous selections
        const testSelection = {
          ...selectedButton,
          [attributeName]: value,
        };

        // Find variant that matches all selected attributes
        const matchingVariant = product.find((variant) => {
          const attributes = variant.attributes || {};
          return Object.entries(testSelection).every(
            ([key, val]) => attributes[key] === val
          );
        });

        availableForAttribute[value] = {
          exists: !!matchingVariant,
          inStock: matchingVariant ? matchingVariant.stock > 0 : false,
          variant: matchingVariant,
        };
      }
    });

    return availableForAttribute;
  };

  const handleSelectVariant = (optionName, value) => {
    if (!product || product.length === 0) return;

    const attributeOptions = product[0]?.attribute_options || [];
    const currentAttributeIndex = attributeOptions.findIndex(
      (option) => option.name === optionName
    );

    let newSelected = {};

    // For the first attribute, reset all selections and start fresh
    if (currentAttributeIndex === 0) {
      newSelected = {
        [optionName]: value,
      };

      // Auto-select subsequent attributes
      for (let i = 1; i < attributeOptions.length; i++) {
        const nextAttribute = attributeOptions[i];
        const firstAvailableValue = nextAttribute.values.find((nextValue) => {
          const testSelection = {
            ...newSelected,
            [nextAttribute.name]: nextValue,
          };
          return product.some((variant) => {
            const attributes = variant.attributes || {};
            return Object.entries(testSelection).every(
              ([key, val]) => attributes[key] === val
            );
          });
        });

        if (firstAvailableValue) {
          newSelected[nextAttribute.name] = firstAvailableValue;
        }
      }
    } else {
      // For subsequent attributes, keep existing selections
      newSelected = {
        ...selectedButton,
        [optionName]: value,
      };
    }

    // Find the matching variant
    const matchedVariant = product.find((variant) => {
      const attributes = variant.attributes || {};
      return Object.entries(newSelected).every(
        ([key, val]) => attributes[key] === val
      );
    });

    if (matchedVariant) {
      // Navigate to the new variant URL (just variant slug)
      navigate(`/product/${matchedVariant.variant_slug}`, { replace: false });

      // Reset some states for the new variant
      setSelectedImage(0);
      setQuantity(1);
    }
  };

  const handleAddToCart = async () => {
    if (!user) {
      showAlert({
        title: 'Not allowed',
        message: 'You must be logged in before adding a cart item',
        confirmText: 'Login',
        onClose: () => {
          window.location.href = `/login`;
        },
      });
      return;
    } else if (selectedVariant) {
      await addCartItem(selectedVariant, quantity);
      setShowCart(true);
    }
  };

  const handleQuantityChange = (change) => {
    const newQuantity = quantity + change;
    const maxStock = selectedVariant?.stock || 0;
    if (newQuantity >= 1 && newQuantity <= maxStock) {
      setQuantity(newQuantity);
    }
  };

  // Handle auth requirement for wishlist button
  const handleAuthRequired = () => {
    if (!user) {
      showAlert({
        title: 'Login Required',
        message: 'You must be logged in to add items to your wishlist',
        confirmText: 'Login',
        onClose: () => {
          window.location.href = `/login`;
        },
      });
      return true; // Return true to indicate auth is required and action should be prevented
    }
    return false; // User is authenticated, proceed with action
  };

  // Custom button component for variant selection
  const VariantButton = ({ optionName, value, isSelected, attributeIndex }) => {
    const availableForAttribute = getAvailableOptionsForAttribute(optionName);
    const optionInfo = availableForAttribute[value] || {
      exists: false,
      inStock: false,
    };

    // First attribute is always selectable if it exists, subsequent ones are filtered
    const isFirstAttribute = attributeIndex === 0;
    const shouldDisable = !isFirstAttribute && !optionInfo.exists;

    const buttonClass = `btn btn-outline ${isSelected ? 'btn-selected' : ''} ${
      shouldDisable ? 'btn-unavailable' : ''
    } ${optionInfo.exists && !optionInfo.inStock ? 'btn-out-of-stock' : ''}`;

    return (
      <div className="variant-button-container">
        <Button
          className={buttonClass}
          onClick={() => handleSelectVariant(optionName, value)}
          key={`${optionName}-${value}`}
          variant="outline"
          text={value}
          disabled={shouldDisable}
        />
        {shouldDisable && <span className="unavailable-indicator">✕</span>}
        {optionInfo.exists && !optionInfo.inStock && (
          <span className="out-of-stock-indicator">!</span>
        )}
      </div>
    );
  };

  // Show loading state
  if (loading || !selectedVariant) {
    return (
      <>
        <Header />
        <div className="product-page">
          <div className="loading">Loading...</div>
        </div>
      </>
    );
  }

  const isSaving =
    selectedVariant.original_price - selectedVariant.current_price;

  return (
    <>
      <Header />
      <div className="product-page">
        {/* Breadcrumb */}
        <nav className="breadcrumb">
          <a href="/">Home</a>
          <span className="separator">›</span>
          <a
            href={`/category/${selectedVariant.categories?.[0]?.toLowerCase()}`}
          >
            {selectedVariant.categories?.[0]}
          </a>
          <span className="separator">›</span>
          <span className="current">{selectedVariant.product_name}</span>
        </nav>

        <div className="product-container">
          {/* Image Gallery */}
          <div className="product-gallery">
            <div className="main-image-container">
              <img
                src={
                  selectedVariant.files?.[selectedImage]?.file_url ||
                  selectedVariant.file_url
                }
                alt={selectedVariant.variant_name}
                className="main-image"
              />
              <div className="image-badges">
                {isSaving > 0 && (
                  <span className="discount-badge">
                    -
                    {Math.round(
                      (isSaving / selectedVariant.original_price) * 100
                    )}
                    %
                  </span>
                )}
                <span className="free-shipping-badge">Free Shipping</span>
              </div>
              {/* Add wishlist button to product image */}
              <WishlistButton
                productVariant={{
                  variant_id: selectedVariant.variant_id,
                  ...selectedVariant,
                }}
                className="product-page-wishlist"
                showTooltip={true}
                onAuthRequired={handleAuthRequired}
              />
            </div>

            <div className="thumbnail-container">
              {selectedVariant.files?.map((file, index) => (
                <button
                  key={index}
                  className={`thumbnail ${
                    selectedImage === index ? 'active' : ''
                  }`}
                  onClick={() => setSelectedImage(index)}
                >
                  <img
                    src={file.file_url}
                    alt={`${selectedVariant.variant_name} view ${index + 1}`}
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Product Info */}
          <div className="product-info">
            <div className="product-header">
              <span className="brand">{selectedVariant.collections?.[0]}</span>
              <div className="product-title-row">
                <h1 className="product-title">
                  {selectedVariant.variant_name}
                </h1>
                {/* Additional wishlist button in header for easy access */}
                <WishlistButton
                  productVariant={{
                    variant_id: selectedVariant.variant_id,
                    ...selectedVariant,
                  }}
                  className="product-header-wishlist"
                  showTooltip={true}
                  onAuthRequired={handleAuthRequired}
                />
              </div>

              <div className="rating-section">
                <div className="stars">
                  {[...Array(5)].map((_, i) => (
                    <span
                      key={i}
                      className={`star ${i < Math.floor(4.5) ? 'filled' : ''}`}
                    >
                      ★
                    </span>
                  ))}
                  <span className="rating-value">(4.5)</span>
                </div>
                <a href="#reviews" className="review-link">
                  1,234 reviews
                </a>
              </div>
            </div>

            <div className="pricing-section">
              <div className="price-container">
                <span className="current-price">
                  ${selectedVariant.current_price}
                </span>
                {isSaving > 0 && (
                  <>
                    <span className="original-price">
                      ${selectedVariant.original_price}
                    </span>
                    <span className="savings">Save ${isSaving.toFixed(2)}</span>
                  </>
                )}
              </div>

              <div className="stock-info">
                {selectedVariant.stock > 0 ? (
                  <span className="in-stock">
                    ✓ In Stock ({selectedVariant.stock} available)
                  </span>
                ) : (
                  <span className="out-of-stock">Out of Stock</span>
                )}
              </div>
            </div>

            <div className="variants-section">
              {selectedVariant.attribute_options?.map((option, index) => (
                <div key={option.name} className="variant-group">
                  <h3>{option.name}</h3>
                  <div className="variant-options">
                    {option.values.map((value) => {
                      const availableForAttribute =
                        getAvailableOptionsForAttribute(option.name);
                      const optionInfo = availableForAttribute[value];

                      // Skip rendering if this option does not exist
                      if (!optionInfo?.exists) return null;

                      return (
                        <VariantButton
                          key={`${option.name}-${value}`}
                          optionName={option.name}
                          value={value}
                          isSelected={selectedButton[option.name] === value}
                          attributeIndex={index}
                        />
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            {/* Quantity & Actions */}
            <div className="purchase-section">
              <div className="quantity-selector">
                <label>Quantity:</label>
                <div className="quantity-controls">
                  <button
                    className="quantity-btn"
                    onClick={() => handleQuantityChange(-1)}
                    disabled={quantity <= 1}
                  >
                    −
                  </button>
                  <span className="quantity-value">{quantity}</span>
                  <button
                    className="quantity-btn"
                    onClick={() => handleQuantityChange(1)}
                    disabled={quantity >= selectedVariant.stock}
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="action-buttons">
                <Button
                  onClick={handleAddToCart}
                  size="md"
                  text={`Add to Cart - ${(
                    selectedVariant.current_price * quantity
                  ).toFixed(2)}`}
                  disabled={!selectedVariant || selectedVariant.stock <= 0}
                />
              </div>
            </div>

            {/* Features */}
            <div className="features-section">
              <h3>Key Features</h3>
              <ul className="features-list">
                <li className="feature-item">
                  <span className="feature-icon">✓</span>
                  Premium quality materials
                </li>
                <li className="feature-item">
                  <span className="feature-icon">✓</span>
                  Comfortable fit
                </li>
                <li className="feature-item">
                  <span className="feature-icon">✓</span>
                  Durable construction
                </li>
                <li className="feature-item">
                  <span className="feature-icon">✓</span>
                  Easy care instructions
                </li>
                <li className="feature-item">
                  <span className="feature-icon">✓</span>
                  Versatile styling
                </li>
                <li className="feature-item">
                  <span className="feature-icon">✓</span>
                  Great value for money
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div style={{ marginTop: '15rem' }}>
          <ProductReviews />
        </div>
      </div>
    </>
  );
};

export default ProductPage;
