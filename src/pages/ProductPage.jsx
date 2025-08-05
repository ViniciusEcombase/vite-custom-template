import React, { useState, useEffect } from 'react';
import Header from '../components/Header/Header';
import Button from '../components/Button/Button';
import useFetch from '../customHooks/useFetch';
import { href, useParams } from 'react-router-dom';
import { useCart } from '../contextProviders/CartProvider';
import { useAuth } from '../contextProviders/AuthProvider';
import { useModalActions } from '../contextProviders/ModalProvider';

const ProductPage = ({ productId }) => {
  const { showAlert } = useModalActions();
  const { user } = useAuth();
  const { addCartItem, setShowCart } = useCart();
  const [productTeste, setProductTeste] = useState();
  const { productSlug } = useParams();
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedVariant, setSelectedVariant] = useState('default');
  const [selectedButton, setSelectedButton] = useState({});
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('description');
  const [availableOptions, setAvailableOptions] = useState({});

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
  const firstFile = selectedVariant.files || '';
  let isSaving =
    selectedVariant?.original_price - selectedVariant.current_price;

  useEffect(() => {
    const getProductData = async () => {
      const res = await api.get(`/product_display_view?slug=eq.${productSlug}`);
      setProductTeste(res);

      // Initialize with the first variant and auto-select all attributes
      if (res && res.data && res.data.length > 0) {
        const attributeOptions = res.data[0].attribute_options || [];
        const initialSelection = {};

        // Auto-select the first available option for each attribute
        for (let i = 0; i < attributeOptions.length; i++) {
          const attribute = attributeOptions[i];

          if (i === 0) {
            // For first attribute, just pick the first value that has any variant
            const firstAvailableValue = attribute.values.find((value) => {
              return res.data.some((variant) => {
                const attributes = variant.attributes || {};
                return attributes[attribute.name] === value;
              });
            });

            if (firstAvailableValue) {
              initialSelection[attribute.name] = firstAvailableValue;
            }
          } else {
            // For subsequent attributes, find first value that works with previous selections
            const firstAvailableValue = attribute.values.find((value) => {
              const testSelection = {
                ...initialSelection,
                [attribute.name]: value,
              };

              return res.data.some((variant) => {
                const attributes = variant.attributes || {};
                return Object.entries(testSelection).every(
                  ([key, val]) => attributes[key] === val
                );
              });
            });

            if (firstAvailableValue) {
              initialSelection[attribute.name] = firstAvailableValue;
            }
          }
        }

        setSelectedButton(initialSelection);

        // Find the variant that matches the complete initial selection
        const initialVariant = res.data.find((item) => {
          const attributes = item.attributes || {};
          return Object.entries(initialSelection).every(
            ([key, val]) => attributes[key] === val
          );
        });

        if (initialVariant) {
          setSelectedVariant(initialVariant);
        } else {
          // Fallback to first variant if no complete match
          setSelectedVariant(res.data[0]);
        }
      }

      // Calculate available options for each attribute
      calculateAvailableOptions(res.data);
    };
    getProductData();
  }, []);

  // Calculate which attribute values are available based on current selection
  const calculateAvailableOptions = (variants) => {
    if (!variants || variants.length === 0) return;

    const options = {};
    const attributeOptions = variants[0].attribute_options;

    attributeOptions.forEach((option) => {
      options[option.name] = {};

      option.values.forEach((value) => {
        // Check if this value is available with current selection
        const isAvailable = checkIfCombinationExists(
          option.name,
          value,
          variants
        );
        options[option.name][value] = {
          available: isAvailable,
          variant: variants.find(
            (variant) =>
              variant.attributes && variant.attributes[option.name] === value
          ),
        };
      });
    });

    setAvailableOptions(options);
  };

  // Check if a specific attribute value can be selected with current selection
  const checkIfCombinationExists = (
    attributeName,
    attributeValue,
    variants
  ) => {
    // Create a test selection with the new value
    const testSelection = {
      ...selectedButton,
      [attributeName]: attributeValue,
    };

    // Check if any variant matches this combination
    return variants.some((variant) => {
      const attributes = variant.attributes || {};
      return Object.entries(testSelection).every(
        ([key, val]) => attributes[key] === val
      );
    });
  };

  // Get available options for a specific attribute based on current selection
  const getAvailableOptionsForAttribute = (attributeName) => {
    if (!productTeste || !productTeste.data) return {};

    const variants = productTeste.data;
    const availableForAttribute = {};
    const attributeOptions = variants[0]?.attribute_options || [];

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
      // For the FIRST attribute (index 0), always allow selection
      if (currentAttributeIndex === 0) {
        // Check if this first attribute value exists in any variant
        const hasVariant = variants.some((variant) => {
          const attributes = variant.attributes || {};
          return attributes[attributeName] === value;
        });

        const matchingVariants = variants.filter((variant) => {
          const attributes = variant.attributes || {};
          return attributes[attributeName] === value;
        });

        const hasStock = matchingVariants.some((variant) => variant.stock > 0);

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

        // Only check combinations that include all previous attribute selections
        const hasVariant = variants.some((variant) => {
          const attributes = variant.attributes || {};

          // Check if this variant matches all currently selected attributes
          return Object.entries(testSelection).every(
            ([key, val]) => attributes[key] === val
          );
        });

        const matchingVariant = variants.find((variant) => {
          const attributes = variant.attributes || {};
          return Object.entries(testSelection).every(
            ([key, val]) => attributes[key] === val
          );
        });

        availableForAttribute[value] = {
          exists: hasVariant,
          inStock: matchingVariant ? matchingVariant.stock > 0 : false,
          variant: matchingVariant,
        };
      }
    });

    return availableForAttribute;
  };

  const product = {
    id: productId || 1,
    name: 'Premium Wireless Noise-Canceling Headphones',
    brand: 'AudioTech Pro',
    price: 299.99,
    originalPrice: 399.99,
    rating: 4.7,
    reviewCount: 2847,
    inStock: true,
    stockCount: 15,
    images: [
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&h=600&fit=crop',
      'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=600&h=600&fit=crop',
      'https://images.unsplash.com/photo-1484704849700-f032a568e944?w=600&h=600&fit=crop',
      'https://images.unsplash.com/photo-1487215078519-e21cc028cb29?w=600&h=600&fit=crop',
    ],
    variants: [
      { id: 'black', name: 'Matte Black', color: '#1a1a1a', price: 299.99 },
      { id: 'white', name: 'Pearl White', color: '#f8f8f8', price: 299.99 },
      { id: 'blue', name: 'Ocean Blue', color: '#2563eb', price: 319.99 },
    ],
    features: [
      'Active Noise Cancellation (ANC)',
      '30-hour battery life',
      'Quick charge: 3 hours in 15 minutes',
      'Premium leather ear cushions',
      'Multi-device connectivity',
      'Voice assistant compatible',
    ],
    description:
      'Experience audio like never before with our flagship wireless headphones. Engineered with precision and crafted for comfort, these headphones deliver studio-quality sound with industry-leading noise cancellation technology.',
    specifications: {
      'Driver Size': '40mm',
      'Frequency Response': '20Hz - 20kHz',
      Impedance: '32 Ohm',
      'Battery Life': '30 hours (ANC off), 20 hours (ANC on)',
      'Charging Time': '3 hours',
      Weight: '250g',
      Connectivity: 'Bluetooth 5.0, 3.5mm jack',
      Warranty: '2 years',
    },
  };

  const handleSelectVariant = (optionName, value) => {
    setSelectedImage(0);
    setQuantity(1);
    const attributeOptions = productTeste.data[0]?.attribute_options || [];
    const currentAttributeIndex = attributeOptions.findIndex(
      (option) => option.name === optionName
    );

    // For the first attribute, always allow selection
    if (currentAttributeIndex === 0) {
      const newSelected = {
        [optionName]: value, // Reset selection to only this first attribute
      };

      // Auto-select the first available option in subsequent attributes
      for (let i = 1; i < attributeOptions.length; i++) {
        const nextAttribute = attributeOptions[i];

        // Find the first available value for this next attribute
        const firstAvailableValue = nextAttribute.values.find((nextValue) => {
          const testSelection = {
            ...newSelected,
            [nextAttribute.name]: nextValue,
          };

          // Check if this combination exists in variants
          return productTeste.data.some((variant) => {
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

      setSelectedButton(newSelected);

      // Find the variant that matches the complete selection
      const matchedVariant = productTeste.data.find((item) => {
        const attributes = item.attributes || {};
        return Object.entries(newSelected).every(
          ([key, val]) => attributes[key] === val
        );
      });

      if (matchedVariant) {
        setSelectedVariant(matchedVariant);
      }
      return;
    }

    // For subsequent attributes, check if combination exists
    const availableForAttribute = getAvailableOptionsForAttribute(optionName);
    const optionInfo = availableForAttribute[value];

    if (!optionInfo || !optionInfo.exists) {
      // Don't allow selection of non-existent combinations
      return;
    }

    const newSelected = {
      ...selectedButton,
      [optionName]: value,
    };

    setSelectedButton(newSelected);

    const matchedVariant = productTeste.data.find((item) => {
      const attributes = item.attributes || {};
      return Object.entries(newSelected).every(
        ([key, val]) => attributes[key] === val
      );
    });

    if (matchedVariant) {
      setSelectedVariant(matchedVariant);
    }
  };

  function handleClose() {
    window.location.href = `/login`;
  }

  const handleAddToCart = async () => {
    if (!user) {
      showAlert({
        title: 'Not allowed',
        message: 'You must be logged in before adding a cart item',
        confirmText: 'Login',
        onClose: () => {
          handleClose();
        },
      });
    }
    await addCartItem(selectedVariant, quantity);
    setShowCart(true);
  };

  const handleBuyNow = () => {};

  const handleQuantityChange = (change) => {
    const newQuantity = quantity + change;
    if (newQuantity >= 1 && newQuantity <= product.stockCount) {
      setQuantity(newQuantity);
    }
  };

  // Custom button component for variant selection
  const VariantButton = ({ optionName, value, isSelected, attributeIndex }) => {
    const availableForAttribute = getAvailableOptionsForAttribute(optionName);
    const optionInfo = availableForAttribute[value] || {
      exists: false,
      inStock: false,
    };

    // First attribute is always selectable, subsequent ones are filtered
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

  return (
    <>
      <Header />
      {selectedVariant && productTeste && (
        <div className="product-page">
          {/* Breadcrumb */}
          <nav className="breadcrumb">
            <a href="/">Home</a>
            <span className="separator">›</span>
            <a href="/electronics">Electronics</a>
            <span className="separator">›</span>
            <a href="/headphones">Headphones</a>
            <span className="separator">›</span>
            <span className="current">{productTeste.data[0].product_name}</span>
          </nav>

          <div className="product-container">
            {/* Image Gallery */}
            <div className="product-gallery">
              <div className="main-image-container">
                <img
                  // src={product.images[selectedImage]}
                  src={firstFile[selectedImage]?.file_url || ''}
                  alt={product.name}
                  className="main-image"
                />
                <div className="image-badges">
                  <span className="discount-badge">-25%</span>
                  <span className="free-shipping-badge">Free Shipping</span>
                </div>
              </div>

              <div className="thumbnail-container">
                {selectedVariant.files?.map((item, index) => {
                  return (
                    <button
                      key={index}
                      className={`thumbnail ${
                        selectedImage === index ? 'active' : ''
                      }`}
                      onClick={() => setSelectedImage(index)}
                    >
                      <img
                        src={item.file_url}
                        alt={`${product.name} view ${index + 1}`}
                      />
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Product Info */}
            <div className="product-info">
              <div className="product-header">
                <span className="brand">
                  {selectedVariant?.collections?.[0]}
                </span>
                <h1 className="product-title">
                  {productTeste.data[0].product_name}
                </h1>

                <div className="rating-section">
                  <div className="stars">
                    {[...Array(5)].map((_, i) => (
                      <span
                        key={i}
                        className={`star ${
                          i < Math.floor(product.rating) ? 'filled' : ''
                        }`}
                      >
                        ★
                      </span>
                    ))}
                    <span className="rating-value">({product.rating})</span>
                  </div>
                  <a href="#reviews" className="review-link">
                    {product.reviewCount} reviews
                  </a>
                </div>
              </div>

              <div className="pricing-section">
                <div className="price-container">
                  <span className="current-price">
                    ${selectedVariant.current_price}
                  </span>
                  {isSaving !== 0 && (
                    <span className="original-price">
                      ${selectedVariant.original_price}
                    </span>
                  )}
                  {isSaving !== 0 && (
                    <span className="savings">
                      Save $
                      {(
                        selectedVariant.original_price -
                        selectedVariant.current_price
                      ).toFixed(2)}
                    </span>
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
                {productTeste.data[0].attribute_options.map((option, index) => (
                  <div key={option.name} className="variant-group">
                    <h3>
                      {option.name}
                      {index === 0 && (
                        <span className="primary-attribute-label"></span>
                      )}
                    </h3>
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
                      disabled={quantity >= product.stockCount}
                    >
                      +
                    </button>
                  </div>
                </div>

                <div className="action-buttons">
                  <Button
                    onClick={handleAddToCart}
                    size="md"
                    text={`Add to Cart - R$${(
                      selectedVariant.current_price * quantity
                    ).toFixed(2)}`}
                    disabled={!selectedVariant || selectedVariant.stock <= 0}
                  />

                  <button className="wishlist-btn" aria-label="Add to wishlist">
                    ♡
                  </button>
                </div>
              </div>

              {/* Features */}
              <div className="features-section">
                <h3>Key Features</h3>
                <ul className="features-list">
                  {product.features.map((feature, index) => (
                    <li key={index} className="feature-item">
                      <span className="feature-icon">✓</span>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Product Details Tabs */}
          <div className="product-details">
            <div className="tab-navigation">
              <button
                className={`tab-btn ${
                  activeTab === 'description' ? 'active' : ''
                }`}
                onClick={() => setActiveTab('description')}
              >
                Description
              </button>
              <button
                className={`tab-btn ${
                  activeTab === 'specifications' ? 'active' : ''
                }`}
                onClick={() => setActiveTab('specifications')}
              >
                Specifications
              </button>
              <button
                className={`tab-btn ${activeTab === 'reviews' ? 'active' : ''}`}
                onClick={() => setActiveTab('reviews')}
              >
                Reviews
              </button>
            </div>

            <div className="tab-content">
              {activeTab === 'description' && (
                <div className="description-content">
                  <p>{product.description}</p>
                  <p>
                    Crafted with premium materials and cutting-edge technology,
                    these headphones represent the perfect fusion of style and
                    performance. Whether you're commuting, working, or relaxing
                    at home, experience your music the way it was meant to be
                    heard.
                  </p>
                </div>
              )}

              {activeTab === 'specifications' && (
                <div className="specifications-content">
                  <div className="spec-grid">
                    {Object.entries(product.specifications).map(
                      ([key, value]) => (
                        <div key={key} className="spec-item">
                          <span className="spec-label">{key}</span>
                          <span className="spec-value">{value}</span>
                        </div>
                      )
                    )}
                  </div>
                </div>
              )}

              {activeTab === 'reviews' && (
                <div className="reviews-content">
                  <div className="reviews-summary">
                    <div className="rating-breakdown">
                      <span className="avg-rating">{product.rating}</span>
                      <div className="stars">
                        {[...Array(5)].map((_, i) => (
                          <span
                            key={i}
                            className={`star ${
                              i < Math.floor(product.rating) ? 'filled' : ''
                            }`}
                          >
                            ★
                          </span>
                        ))}
                      </div>
                      <span className="total-reviews">
                        Based on {product.reviewCount} reviews
                      </span>
                    </div>
                  </div>

                  <div className="review-list">
                    <div className="review-item">
                      <div className="review-header">
                        <span className="reviewer-name">Sarah M.</span>
                        <div className="review-rating">
                          {[...Array(5)].map((_, i) => (
                            <span key={i} className="star filled">
                              ★
                            </span>
                          ))}
                        </div>
                        <span className="review-date">2 weeks ago</span>
                      </div>
                      <p className="review-text">
                        Amazing sound quality and the noise cancellation is
                        incredible. Perfect for long flights and daily commutes.
                      </p>
                    </div>

                    <div className="review-item">
                      <div className="review-header">
                        <span className="reviewer-name">Mike R.</span>
                        <div className="review-rating">
                          {[...Array(4)].map((_, i) => (
                            <span key={i} className="star filled">
                              ★
                            </span>
                          ))}
                          <span className="star">★</span>
                        </div>
                        <span className="review-date">1 month ago</span>
                      </div>
                      <p className="review-text">
                        Great headphones overall. Battery life is excellent and
                        they're very comfortable for extended use.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ProductPage;
