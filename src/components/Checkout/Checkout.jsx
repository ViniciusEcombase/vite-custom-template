import React, {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useState,
} from 'react';
import CheckoutHeader from './CheckoutHeader';

// ========================= MOCK DATA =========================
const MOCK_SHIPPING_QUOTES = [
  {
    id: 'standard',
    name: 'Standard Shipping',
    price: 9.99,
    deliveryTime: '5-7 business days',
    description: 'Standard delivery to your door',
    isFree: false,
  },
  {
    id: 'express',
    name: 'Express Shipping',
    price: 19.99,
    deliveryTime: '2-3 business days',
    description: 'Faster delivery with tracking',
    isFree: false,
  },
  {
    id: 'overnight',
    name: 'Overnight Express',
    price: 39.99,
    deliveryTime: 'Next business day',
    description: 'Next day delivery by 12PM',
    isFree: false,
  },
  {
    id: 'free',
    name: 'Free Standard Shipping',
    price: 0,
    deliveryTime: '7-10 business days',
    description: 'Free shipping on orders over $75',
    isFree: true,
  },
];

const MOCK_ORDER_ITEMS = [
  {
    id: 1,
    name: 'Premium Wireless Headphones',
    price: 129.99,
    quantity: 1,
    image: '/api/placeholder/60/60',
  },
  {
    id: 2,
    name: 'Bluetooth Speaker',
    price: 79.99,
    quantity: 2,
    image: '/api/placeholder/60/60',
  },
];

const MOCK_PROMO_CODES = {
  SAVE10: {
    discount: 10,
    type: 'percentage',
    description: '10% off your order',
  },
  WELCOME20: {
    discount: 20,
    type: 'fixed',
    description: '$20 off your first order',
  },
  FREESHIP: {
    discount: 0,
    type: 'free_shipping',
    description: 'Free shipping',
  },
};

const COUNTRIES = [
  { code: 'US', name: 'United States' },
  { code: 'CA', name: 'Canada' },
  { code: 'UK', name: 'United Kingdom' },
  { code: 'AU', name: 'Australia' },
];

// ========================= CHECKOUT CONTEXT =========================
const CheckoutContext = createContext();

const checkoutReducer = (state, action) => {
  switch (action.type) {
    case 'SET_STEP':
      return { ...state, currentStep: action.payload };
    case 'UPDATE_CONTACT_INFO':
      return {
        ...state,
        contactInfo: { ...state.contactInfo, ...action.payload },
      };
    case 'UPDATE_SHIPPING_ADDRESS':
      return {
        ...state,
        shippingAddress: { ...state.shippingAddress, ...action.payload },
      };
    case 'UPDATE_BILLING_ADDRESS':
      return {
        ...state,
        billingAddress: { ...state.billingAddress, ...action.payload },
      };
    case 'SET_SHIPPING_METHOD':
      return { ...state, selectedShippingMethod: action.payload };
    case 'UPDATE_PAYMENT_INFO':
      return {
        ...state,
        paymentInfo: { ...state.paymentInfo, ...action.payload },
      };
    case 'SET_PROMO_CODE':
      return { ...state, promoCode: action.payload };
    case 'SET_ORDER_NOTES':
      return { ...state, orderNotes: action.payload };
    case 'SET_SAME_AS_SHIPPING':
      return { ...state, sameAsShipping: action.payload };
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    case 'CLEAR_ERROR':
      return { ...state, error: null };
    default:
      return state;
  }
};

const initialState = {
  currentStep: 1,
  contactInfo: {
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
  },
  shippingAddress: {
    address1: '',
    address2: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'US',
  },
  billingAddress: {
    address1: '',
    address2: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'US',
  },
  selectedShippingMethod: null,
  paymentInfo: {
    cardNumber: '',
    expiryMonth: '',
    expiryYear: '',
    cvv: '',
    nameOnCard: '',
  },
  promoCode: null,
  orderNotes: '',
  sameAsShipping: true,
  loading: false,
  error: null,
};

export const CheckoutProvider = ({ children }) => {
  const [state, dispatch] = useReducer(checkoutReducer, initialState);

  return (
    <CheckoutContext.Provider value={{ state, dispatch }}>
      {children}
    </CheckoutContext.Provider>
  );
};

// ========================= CUSTOM HOOKS =========================
const useCheckout = () => {
  const context = useContext(CheckoutContext);
  if (!context) {
    throw new Error('useCheckout must be used within CheckoutProvider');
  }
  return context;
};

const useFormValidation = () => {
  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const validatePhone = (phone) => {
    const re = /^\+?[\d\s\-\(\)]{10,}$/;
    return re.test(phone);
  };

  const validateRequired = (value) => {
    return value && value.trim().length > 0;
  };

  const validateCardNumber = (cardNumber) => {
    const re = /^\d{13,19}$/;
    return re.test(cardNumber.replace(/\s/g, ''));
  };

  const validateCVV = (cvv) => {
    const re = /^\d{3,4}$/;
    return re.test(cvv);
  };

  return {
    validateEmail,
    validatePhone,
    validateRequired,
    validateCardNumber,
    validateCVV,
  };
};

const useOrderCalculation = () => {
  const { state } = useCheckout();

  const [calculations, setCalculations] = useState({
    subtotal: 0,
    shipping: 0,
    tax: 0,
    discount: 0,
    total: 0,
  });

  useEffect(() => {
    const subtotal = MOCK_ORDER_ITEMS.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
    let shipping = state.selectedShippingMethod?.price || 0;
    let discount = 0;

    // Apply promo code discount
    if (state.promoCode) {
      const promo = MOCK_PROMO_CODES[state.promoCode];
      if (promo) {
        if (promo.type === 'percentage') {
          discount = subtotal * (promo.discount / 100);
        } else if (promo.type === 'fixed') {
          discount = promo.discount;
        } else if (promo.type === 'free_shipping') {
          shipping = 0;
        }
      }
    }

    // Free shipping threshold
    if (subtotal >= 75 && !state.promoCode?.type === 'free_shipping') {
      shipping = 0;
    }

    const taxableAmount = subtotal - discount;
    const tax = taxableAmount * 0.08; // 8% tax rate
    const total = Math.max(0, subtotal + shipping + tax - discount);

    setCalculations({
      subtotal: Math.round(subtotal * 100) / 100,
      shipping: Math.round(shipping * 100) / 100,
      tax: Math.round(tax * 100) / 100,
      discount: Math.round(discount * 100) / 100,
      total: Math.round(total * 100) / 100,
    });
  }, [state.selectedShippingMethod, state.promoCode]);

  return calculations;
};

const usePromoCode = () => {
  const { dispatch } = useCheckout();

  const validatePromoCode = (code) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const promo = MOCK_PROMO_CODES[code.toUpperCase()];
        if (promo) {
          dispatch({ type: 'SET_PROMO_CODE', payload: code.toUpperCase() });
          resolve({ success: true, message: promo.description });
        } else {
          resolve({ success: false, message: 'Invalid promo code' });
        }
      }, 500);
    });
  };

  const removePromoCode = () => {
    dispatch({ type: 'SET_PROMO_CODE', payload: null });
  };

  return { validatePromoCode, removePromoCode };
};

// ========================= BASE UI COMPONENTS =========================
const FormField = ({
  label,
  children,
  error,
  required = false,
  className = '',
}) => (
  <div className={`form-field ${className}`}>
    {label && (
      <label className="form-label">
        {label} {required && <span className="form-label-required">*</span>}
      </label>
    )}
    {children}
    {error && <div className="form-error">{error}</div>}
  </div>
);

const Input = ({ error, className = '', ...props }) => (
  <input
    {...props}
    className={`form-input ${error ? 'error' : ''} ${className}`}
  />
);

const Select = ({ error, children, className = '', ...props }) => (
  <select
    {...props}
    className={`form-select ${error ? 'error' : ''} ${className}`}
  >
    {children}
  </select>
);

const TextArea = ({ className = '', ...props }) => (
  <textarea {...props} className={`form-textarea ${className}`} />
);

const Button = ({
  variant = 'primary',
  disabled = false,
  loading = false,
  children,
  className = '',
  ...props
}) => {
  const variantClass =
    variant === 'primary'
      ? 'btn-primary'
      : variant === 'secondary'
      ? 'btn-secondary'
      : 'btn-ghost';

  return (
    <button
      {...props}
      disabled={disabled || loading}
      className={`btn ${variantClass} ${className}`}
    >
      {loading && <div className="loading-spinner loading-spinner-small" />}
      {children}
    </button>
  );
};

const LoadingSpinner = ({ size = 'medium' }) => (
  <div className={`loading-spinner loading-spinner-${size}`} />
);

const ErrorMessage = ({ message }) => (
  <div className="error-message">{message}</div>
);

// ========================= PROGRESS COMPONENT =========================
const CheckoutProgress = ({ currentStep }) => {
  const steps = [
    { number: 1, title: 'Contact & Shipping' },
    { number: 2, title: 'Shipping Method' },
    { number: 3, title: 'Payment & Review' },
  ];

  return (
    <div className="checkout-progress">
      {steps.map((step, index) => (
        <React.Fragment key={step.number}>
          <div className="progress-step">
            <div
              className={`progress-step-number ${
                step.number < currentStep
                  ? 'completed'
                  : step.number === currentStep
                  ? 'active'
                  : 'inactive'
              }`}
            >
              {step.number < currentStep ? '✓' : step.number}
            </div>
            <span
              className={`progress-step-title ${
                step.number <= currentStep
                  ? step.number < currentStep
                    ? 'completed'
                    : 'active'
                  : 'inactive'
              }`}
            >
              {step.title}
            </span>
          </div>
          {index < steps.length - 1 && (
            <div
              className={`progress-connector ${
                step.number < currentStep ? 'completed' : 'inactive'
              }`}
            />
          )}
        </React.Fragment>
      ))}
    </div>
  );
};

// ========================= ADDRESS FORM COMPONENT =========================
const AddressForm = ({ address, onChange, prefix = '' }) => {
  const { validateRequired } = useFormValidation();
  const [errors, setErrors] = useState({});

  const handleChange = (field, value) => {
    onChange({ [field]: value });
    if (errors[field]) {
      setErrors({ ...errors, [field]: null });
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!validateRequired(address.address1))
      newErrors.address1 = 'Address is required';
    if (!validateRequired(address.city)) newErrors.city = 'City is required';
    if (!validateRequired(address.state)) newErrors.state = 'State is required';
    if (!validateRequired(address.postalCode))
      newErrors.postalCode = 'Postal code is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  return (
    <div>
      <FormField label="Address Line 1" error={errors.address1} required>
        <Input
          value={address.address1}
          onChange={(e) => handleChange('address1', e.target.value)}
          placeholder="123 Main Street"
          error={errors.address1}
        />
      </FormField>

      <FormField label="Address Line 2">
        <Input
          value={address.address2}
          onChange={(e) => handleChange('address2', e.target.value)}
          placeholder="Apartment, suite, etc. (optional)"
        />
      </FormField>

      <div className="grid-2">
        <FormField label="City" error={errors.city} required>
          <Input
            value={address.city}
            onChange={(e) => handleChange('city', e.target.value)}
            placeholder="New York"
            error={errors.city}
          />
        </FormField>

        <FormField label="State/Province" error={errors.state} required>
          <Input
            value={address.state}
            onChange={(e) => handleChange('state', e.target.value)}
            placeholder="NY"
            error={errors.state}
          />
        </FormField>
      </div>

      <div className="grid-2">
        <FormField label="Postal Code" error={errors.postalCode} required>
          <Input
            value={address.postalCode}
            onChange={(e) => handleChange('postalCode', e.target.value)}
            placeholder="10001"
            error={errors.postalCode}
          />
        </FormField>

        <FormField label="Country" required>
          <Select
            value={address.country}
            onChange={(e) => handleChange('country', e.target.value)}
          >
            {COUNTRIES.map((country) => (
              <option key={country.code} value={country.code}>
                {country.name}
              </option>
            ))}
          </Select>
        </FormField>
      </div>
    </div>
  );
};

// ========================= SHIPPING METHOD CARD COMPONENT =========================
const ShippingMethodCard = ({ method, isSelected, onSelect }) => (
  <div
    className={`shipping-method-card ${isSelected ? 'selected' : ''}`}
    onClick={() => onSelect(method)}
  >
    <div className="shipping-method-header">
      <div className="shipping-method-info">
        <div className="shipping-method-name">
          <div
            className={`shipping-method-radio ${isSelected ? 'selected' : ''}`}
          >
            {isSelected && <div className="shipping-method-radio-dot" />}
          </div>
          <h4 className="shipping-method-title">{method.name}</h4>
          {method.isFree && <span className="shipping-method-badge">FREE</span>}
        </div>
        <p className="shipping-method-description">{method.description}</p>
        <p className="shipping-method-delivery">
          Delivery: {method.deliveryTime}
        </p>
      </div>
      <div className="shipping-method-price">
        <span
          className={`shipping-method-amount ${
            method.price === 0 ? 'free' : 'paid'
          }`}
        >
          {method.price === 0 ? 'FREE' : `${method.price.toFixed(2)}`}
        </span>
      </div>
    </div>
  </div>
);

// ========================= PROMO CODE COMPONENT =========================
const PromoCodeInput = () => {
  const { state } = useCheckout();
  const { validatePromoCode, removePromoCode } = usePromoCode();
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleApply = async () => {
    if (!code.trim()) return;

    setLoading(true);
    setMessage('');

    const result = await validatePromoCode(code);

    setLoading(false);
    setMessage(result.message);

    if (result.success) {
      setCode('');
    }
  };

  const handleRemove = () => {
    removePromoCode();
    setMessage('');
  };

  return (
    <div className="promo-code-container">
      <h4 className="promo-code-title">Promo Code</h4>

      {!state.promoCode ? (
        <div className="promo-code-input-group">
          <Input
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            placeholder="Enter promo code"
            className="promo-code-input"
            onKeyPress={(e) => e.key === 'Enter' && handleApply()}
          />
          <Button
            onClick={handleApply}
            loading={loading}
            disabled={!code.trim()}
          >
            Apply
          </Button>
        </div>
      ) : (
        <div className="promo-code-applied">
          <span className="promo-code-applied-text">
            {MOCK_PROMO_CODES[state.promoCode]?.description}
          </span>
          <Button variant="ghost" onClick={handleRemove}>
            Remove
          </Button>
        </div>
      )}

      {message && (
        <div
          className={`promo-code-message ${
            message.includes('Invalid') ? 'error' : 'success'
          }`}
        >
          {message}
        </div>
      )}
    </div>
  );
};

// ========================= ORDER SUMMARY COMPONENT =========================
const OrderSummary = ({ showPromoCode = false }) => {
  const { state } = useCheckout();
  const calculations = useOrderCalculation();

  return (
    <div className="order-summary">
      <h3 className="order-summary-title">Order Summary</h3>

      <div className="order-items">
        {MOCK_ORDER_ITEMS.map((item) => (
          <div key={item.id} className="order-item">
            <div className="order-item-info">
              <img
                src={item.image}
                alt={item.name}
                className="order-item-image"
              />
              <div>
                <div className="order-item-name">{item.name}</div>
                <div className="order-item-quantity">Qty: {item.quantity}</div>
              </div>
            </div>
            <span className="order-item-price">
              ${(item.price * item.quantity).toFixed(2)}
            </span>
          </div>
        ))}
      </div>

      {showPromoCode && <PromoCodeInput />}

      <div className="order-totals">
        <div className="order-total-row">
          <span className="order-total-label">Subtotal:</span>
          <span className="order-total-value">
            ${calculations.subtotal.toFixed(2)}
          </span>
        </div>

        <div className="order-total-row">
          <span className="order-total-label">Shipping:</span>
          <span
            className={`order-total-value ${
              calculations.shipping === 0 ? 'free' : ''
            }`}
          >
            {calculations.shipping === 0
              ? 'FREE'
              : `${calculations.shipping.toFixed(2)}`}
          </span>
        </div>

        <div className="order-total-row">
          <span className="order-total-label">Tax:</span>
          <span className="order-total-value">
            ${calculations.tax.toFixed(2)}
          </span>
        </div>

        {calculations.discount > 0 && (
          <div className="order-total-row">
            <span className="order-total-label">Discount:</span>
            <span className="order-total-value discount">
              -${calculations.discount.toFixed(2)}
            </span>
          </div>
        )}

        <div className="order-total-final">
          <span className="order-total-label">Total:</span>
          <span className="order-total-value">
            ${calculations.total.toFixed(2)}
          </span>
        </div>
      </div>
    </div>
  );
};

// ========================= PAYMENT FORM COMPONENT =========================
const PaymentForm = () => {
  const { state, dispatch } = useCheckout();
  const { validateRequired, validateCardNumber, validateCVV } =
    useFormValidation();
  const [errors, setErrors] = useState({});

  const handleChange = (field, value) => {
    dispatch({ type: 'UPDATE_PAYMENT_INFO', payload: { [field]: value } });
    if (errors[field]) {
      setErrors({ ...errors, [field]: null });
    }
  };

  const formatCardNumber = (value) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || '';
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    if (parts.length) {
      return parts.join(' ');
    } else {
      return v;
    }
  };

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 20 }, (_, i) => currentYear + i);
  const months = Array.from({ length: 12 }, (_, i) => ({
    value: String(i + 1).padStart(2, '0'),
    label: String(i + 1).padStart(2, '0'),
  }));

  return (
    <div>
      <h3 className="section-header">Payment Information</h3>

      <FormField label="Name on Card" error={errors.nameOnCard} required>
        <Input
          value={state.paymentInfo.nameOnCard}
          onChange={(e) => handleChange('nameOnCard', e.target.value)}
          placeholder="John Doe"
          error={errors.nameOnCard}
        />
      </FormField>

      <FormField label="Card Number" error={errors.cardNumber} required>
        <Input
          value={formatCardNumber(state.paymentInfo.cardNumber)}
          onChange={(e) =>
            handleChange('cardNumber', e.target.value.replace(/\s/g, ''))
          }
          placeholder="1234 5678 9012 3456"
          error={errors.cardNumber}
          maxLength={19}
        />
      </FormField>

      <div className="grid-3">
        <FormField label="Expiry Month" error={errors.expiryMonth} required>
          <Select
            value={state.paymentInfo.expiryMonth}
            onChange={(e) => handleChange('expiryMonth', e.target.value)}
            error={errors.expiryMonth}
          >
            <option value="">Month</option>
            {months.map((month) => (
              <option key={month.value} value={month.value}>
                {month.label}
              </option>
            ))}
          </Select>
        </FormField>

        <FormField label="Expiry Year" error={errors.expiryYear} required>
          <Select
            value={state.paymentInfo.expiryYear}
            onChange={(e) => handleChange('expiryYear', e.target.value)}
            error={errors.expiryYear}
          >
            <option value="">Year</option>
            {years.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </Select>
        </FormField>

        <FormField label="CVV" error={errors.cvv} required>
          <Input
            value={state.paymentInfo.cvv}
            onChange={(e) => handleChange('cvv', e.target.value)}
            placeholder="123"
            error={errors.cvv}
            maxLength={4}
          />
        </FormField>
      </div>
    </div>
  );
};

// ========================= STEP 1: CONTACT & SHIPPING =========================
const Step1ContactShipping = ({ onNext }) => {
  const { state, dispatch } = useCheckout();
  const { validateRequired, validateEmail, validatePhone } =
    useFormValidation();
  const [errors, setErrors] = useState({});

  const handleContactChange = (field, value) => {
    dispatch({ type: 'UPDATE_CONTACT_INFO', payload: { [field]: value } });
    if (errors[field]) {
      setErrors({ ...errors, [field]: null });
    }
  };

  const handleAddressChange = (addressData) => {
    dispatch({ type: 'UPDATE_SHIPPING_ADDRESS', payload: addressData });
  };

  const validate = () => {
    const newErrors = {};

    if (!validateRequired(state.contactInfo.firstName)) {
      newErrors.firstName = 'First name is required';
    }
    if (!validateRequired(state.contactInfo.lastName)) {
      newErrors.lastName = 'Last name is required';
    }
    if (!validateRequired(state.contactInfo.email)) {
      newErrors.email = 'Email is required';
    } else if (!validateEmail(state.contactInfo.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    if (!validateRequired(state.contactInfo.phone)) {
      newErrors.phone = 'Phone number is required';
    } else if (!validatePhone(state.contactInfo.phone)) {
      newErrors.phone = 'Please enter a valid phone number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validate()) {
      onNext();
    }
  };

  return (
    <div className="step-container">
      <h2 className="step-title">Contact & Shipping Information</h2>

      <div className="section-container">
        <h3 className="section-header">Contact Information</h3>

        <div className="grid-2">
          <FormField label="First Name" error={errors.firstName} required>
            <Input
              value={state.contactInfo.firstName}
              onChange={(e) => handleContactChange('firstName', e.target.value)}
              placeholder="John"
              error={errors.firstName}
              autoFocus
            />
          </FormField>

          <FormField label="Last Name" error={errors.lastName} required>
            <Input
              value={state.contactInfo.lastName}
              onChange={(e) => handleContactChange('lastName', e.target.value)}
              placeholder="Doe"
              error={errors.lastName}
            />
          </FormField>
        </div>

        <FormField label="Email Address" error={errors.email} required>
          <Input
            type="email"
            value={state.contactInfo.email}
            onChange={(e) => handleContactChange('email', e.target.value)}
            placeholder="john.doe@example.com"
            error={errors.email}
          />
        </FormField>

        <FormField label="Phone Number" error={errors.phone} required>
          <Input
            type="tel"
            value={state.contactInfo.phone}
            onChange={(e) => handleContactChange('phone', e.target.value)}
            placeholder="+1 (555) 123-4567"
            error={errors.phone}
          />
        </FormField>
      </div>

      <div className="section-container">
        <h3 className="section-header">Shipping Address</h3>
        <AddressForm
          address={state.shippingAddress}
          onChange={handleAddressChange}
        />
      </div>

      <Button onClick={handleSubmit} className="btn-full-width">
        Continue to Shipping Method
      </Button>
    </div>
  );
};

// ========================= STEP 2: SHIPPING METHOD =========================
const Step2ShippingMethod = ({ onNext, onBack }) => {
  const { state, dispatch } = useCheckout();
  const [deliveryInstructions, setDeliveryInstructions] = useState('');

  const handleShippingSelect = (method) => {
    dispatch({ type: 'SET_SHIPPING_METHOD', payload: method });
  };

  const handleSubmit = () => {
    if (state.selectedShippingMethod) {
      onNext();
    }
  };

  return (
    <div className="step-container">
      <div className="step-header">
        <Button variant="ghost" onClick={onBack} className="back-button">
          ← Back
        </Button>
        <h2 className="step-title">Choose Shipping Method</h2>
      </div>

      <div className="section-container">
        {MOCK_SHIPPING_QUOTES.map((method) => (
          <ShippingMethodCard
            key={method.id}
            method={method}
            isSelected={state.selectedShippingMethod?.id === method.id}
            onSelect={handleShippingSelect}
          />
        ))}
      </div>

      <FormField label="Delivery Instructions (Optional)">
        <TextArea
          value={deliveryInstructions}
          onChange={(e) => setDeliveryInstructions(e.target.value)}
          placeholder="Any special delivery instructions..."
          rows={3}
        />
      </FormField>

      <Button
        onClick={handleSubmit}
        disabled={!state.selectedShippingMethod}
        className="btn-full-width"
      >
        Continue to Payment & Review
      </Button>
    </div>
  );
};

// ========================= STEP 3: PAYMENT & REVIEW =========================
const Step3PaymentReview = ({ onBack, onComplete }) => {
  const { state, dispatch } = useCheckout();
  const [loading, setLoading] = useState(false);

  const handleBillingChange = (addressData) => {
    dispatch({ type: 'UPDATE_BILLING_ADDRESS', payload: addressData });
  };

  const handleSameAsShippingChange = (e) => {
    const sameAs = e.target.checked;
    dispatch({ type: 'SET_SAME_AS_SHIPPING', payload: sameAs });

    if (sameAs) {
      dispatch({
        type: 'UPDATE_BILLING_ADDRESS',
        payload: state.shippingAddress,
      });
    }
  };

  const handleOrderNotesChange = (e) => {
    dispatch({ type: 'SET_ORDER_NOTES', payload: e.target.value });
  };

  const handlePlaceOrder = async () => {
    setLoading(true);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 2000));

    setLoading(false);
    onComplete();
  };

  const getEstimatedDelivery = () => {
    if (!state.selectedShippingMethod) return null;

    const today = new Date();
    const deliveryDays = {
      standard: 7,
      express: 3,
      overnight: 1,
      free: 10,
    };

    const days = deliveryDays[state.selectedShippingMethod.id] || 7;
    const deliveryDate = new Date(today.getTime() + days * 24 * 60 * 60 * 1000);

    return deliveryDate.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="step-container-wide">
      <div className="step-header">
        <Button variant="ghost" onClick={onBack} className="back-button">
          ← Back
        </Button>
        <h2 className="step-title">Payment & Review</h2>
      </div>

      <div className="grid-checkout-main">
        <div>
          <PaymentForm />

          <div className="section-container">
            <h3 className="section-header">Billing Address</h3>

            <FormField>
              <label className="form-checkbox-label">
                <input
                  type="checkbox"
                  checked={state.sameAsShipping}
                  onChange={handleSameAsShippingChange}
                  className="form-checkbox"
                />
                Same as shipping address
              </label>
            </FormField>

            {!state.sameAsShipping && (
              <AddressForm
                address={state.billingAddress}
                onChange={handleBillingChange}
              />
            )}
          </div>

          <FormField
            label="Order Notes (Optional)"
            className="section-container"
          >
            <TextArea
              value={state.orderNotes}
              onChange={handleOrderNotesChange}
              placeholder="Any special instructions for your order..."
              rows={3}
            />
          </FormField>
        </div>

        <div>
          <OrderSummary showPromoCode={true} />

          {state.selectedShippingMethod && (
            <div className="delivery-info">
              <h4 className="delivery-info-title">Estimated Delivery</h4>
              <p className="delivery-date">{getEstimatedDelivery()}</p>
              <p className="delivery-method">
                via {state.selectedShippingMethod.name}
              </p>
            </div>
          )}

          <Button
            onClick={handlePlaceOrder}
            loading={loading}
            className="btn-full-width btn-large"
          >
            {loading ? 'Processing Order...' : 'Place Order'}
          </Button>

          <div className="terms-text">
            By placing your order, you agree to our Terms of Service and Privacy
            Policy
          </div>
        </div>
      </div>
    </div>
  );
};

// ========================= ORDER CONFIRMATION COMPONENT =========================
const OrderConfirmation = ({ orderNumber }) => (
  <div className="order-confirmation">
    <div className="confirmation-icon">✓</div>

    <h2 className="confirmation-title">Order Confirmed!</h2>

    <p className="confirmation-message">
      Thank you for your order. Your order number is{' '}
      <strong>#{orderNumber}</strong>
    </p>

    <div className="confirmation-info">
      <h4 className="confirmation-info-title">What happens next?</h4>
      <ul className="confirmation-steps">
        <li className="confirmation-step">
          • You'll receive an order confirmation email shortly
        </li>
        <li className="confirmation-step">
          • We'll send you tracking information once your order ships
        </li>
        <li className="confirmation-step">
          • Your order will be delivered within the estimated timeframe
        </li>
      </ul>
    </div>

    <Button onClick={() => window.location.reload()}>Continue Shopping</Button>
  </div>
);

// ========================= MAIN CHECKOUT CONTAINER =========================
const CheckoutContainer = () => {
  const { state, dispatch } = useCheckout();
  const [orderNumber, setOrderNumber] = useState(null);

  const nextStep = () => {
    dispatch({ type: 'SET_STEP', payload: state.currentStep + 1 });
  };

  const previousStep = () => {
    dispatch({ type: 'SET_STEP', payload: state.currentStep - 1 });
  };

  const completeOrder = () => {
    const orderNum = 'ORD' + Date.now().toString().slice(-6);
    setOrderNumber(orderNum);
  };

  if (orderNumber) {
    return <OrderConfirmation orderNumber={orderNumber} />;
  }

  return (
    <div className="checkout-container">
      <div className="checkout-wrapper">
        <CheckoutProgress currentStep={state.currentStep} />

        {state.error && <ErrorMessage message={state.error} />}

        {state.currentStep === 1 && <Step1ContactShipping onNext={nextStep} />}

        {state.currentStep === 2 && (
          <Step2ShippingMethod onNext={nextStep} onBack={previousStep} />
        )}

        {state.currentStep === 3 && (
          <Step3PaymentReview
            onBack={previousStep}
            onComplete={completeOrder}
          />
        )}
      </div>
    </div>
  );
};

// ========================= MAIN APP COMPONENT =========================
const CheckoutApp = () => {
  return (
    <CheckoutProvider>
      <CheckoutHeader />
      <CheckoutContainer />
    </CheckoutProvider>
  );
};

export default CheckoutApp;
