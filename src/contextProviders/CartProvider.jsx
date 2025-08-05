import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import { useAuth } from './AuthProvider';
import useFetch from '../customHooks/useFetch';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const { user } = useAuth();
  const [showCart, setShowCart] = useState(false);
  const [cart, setCart] = useState();
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(false);

  const api = useFetch({
    baseURL: `${import.meta.env.VITE_SUPABASE_URL}/rest/v1`,
    timeout: 10000,
    retries: 0,
    cache: false, // Disable cache for real-time updates
    defaultHeaders: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_SERVICE_KEY}`,
      apikey: import.meta.env.VITE_SUPABASE_SERVICE_KEY,
      Prefer: 'return=representation',
    },
  });

  const apiFunction = useFetch({
    baseURL: `${import.meta.env.VITE_SUPABASE_URL}/rest/v1/rpc`,
    timeout: 10000,
    retries: 0,
    cache: false, // Disable cache for real-time updates
    defaultHeaders: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_SERVICE_KEY}`,
      apikey: import.meta.env.VITE_SUPABASE_SERVICE_KEY,
    },
  });

  const apiEdgeFunction = useFetch({
    baseURL: `${import.meta.env.VITE_SUPABASE_URL}/functions/v1`,
    defaultHeaders: {
      'Content-Type': 'application/json',
    },
  });

  const refreshCart = useCallback(async () => {
    if (!user || !user.customer_id || !user.cart_id) {
      return;
    }

    try {
      // Updated API call to match new data structure
      const cart_items = await api.get(
        `/full_cart_view?select=*&cart_id=eq.${user.cart_id}`
      );

      // Set the entire cart data structure
      setCartItems(cart_items);

      // Also set the cart info if needed
      if (cart_items.data && cart_items.data.length > 0) {
        setCart(cart_items.data[0]);
      }
    } catch (error) {
    }
  }, [user?.customer_id, user?.cart_id]);

  // Optimistic update function for better UX - updated for new structure
  const updateCartItemOptimistically = (variantId, quantityChange) => {
    setCartItems((prevCartItems) => {
      if (
        !prevCartItems.data ||
        !prevCartItems.data[0] ||
        !prevCartItems.data[0].items
      ) {
        return prevCartItems;
      }

      const updatedData = [...prevCartItems.data];
      const cartData = { ...updatedData[0] };

      const updatedItems = cartData.items
        .map((item) => {
          if (item.variant_id === variantId) {
            const newQuantity = item.quantity + quantityChange;
            if (newQuantity <= 0) {
              // Remove item if quantity becomes 0 or negative
              return null;
            }

            const newTotalPrice = (
              item.unit_current_price * newQuantity
            ).toFixed(2);

            return {
              ...item,
              quantity: newQuantity,
              total_price: newTotalPrice,
            };
          }
          return item;
        })
        .filter(Boolean); // Remove null items

      // Recalculate cart totals
      const newSubtotal = updatedItems.reduce(
        (sum, item) => sum + parseFloat(item.total_price),
        0
      );

      cartData.items = updatedItems;
      cartData.subtotal = newSubtotal;
      cartData.total =
        newSubtotal +
        (cartData.shipping_cost || 0) -
        (cartData.coupon_discount || 0);

      updatedData[0] = cartData;

      return {
        ...prevCartItems,
        data: updatedData,
      };
    });
  };

  const addCartItem = async (variant, quantity) => {
    if (loading) return; // Prevent multiple simultaneous requests

    setLoading(true);

    // Optimistic update
    updateCartItemOptimistically(variant.variant_id, quantity);

    try {
      await apiFunction.post('/add_cart_item', {
        p_cart_id: user.cart_id,
        p_quantity: quantity,
        p_product_variant_id: variant.variant_id,
      });

      // Refresh to get accurate data from server
      await refreshCart();
    } catch (error) {
      // Revert optimistic update on error
      updateCartItemOptimistically(variant.variant_id, -quantity);
    }

    setLoading(false);
  };

  const removeCartItem = async (variant) => {
    if (loading) return; // Prevent multiple simultaneous requests

    setLoading(true);

    // Optimistic update
    updateCartItemOptimistically(variant.variant_id, -1);

    try {
      await apiFunction.post('/remove_cart_item', {
        p_cart_id: user.cart_id,
        p_product_variant_id: variant.variant_id,
        p_quantity: 1,
      });

      // Refresh to get accurate data from server
      await refreshCart();
    } catch (error) {
      // Revert optimistic update on error
      updateCartItemOptimistically(variant.variant_id, 1);
    }

    setLoading(false);
  };

  // Complete item removal function - updated for new structure
  const deleteCartItem = async (variant) => {
    if (loading) return;

    setLoading(true);

    // Optimistic update - remove item completely
    setCartItems((prevCartItems) => {
      if (
        !prevCartItems.data ||
        !prevCartItems.data[0] ||
        !prevCartItems.data[0].items
      ) {
        return prevCartItems;
      }

      const updatedData = [...prevCartItems.data];
      const cartData = { ...updatedData[0] };

      cartData.items = cartData.items.filter(
        (item) => item.variant_id !== variant.variant_id
      );

      // Recalculate cart totals
      const newSubtotal = cartData.items.reduce(
        (sum, item) => sum + parseFloat(item.total_price),
        0
      );
      cartData.subtotal = newSubtotal;
      cartData.total =
        newSubtotal +
        (cartData.shipping_cost || 0) -
        (cartData.coupon_discount || 0);

      updatedData[0] = cartData;

      return {
        ...prevCartItems,
        data: updatedData,
      };
    });

    try {
      await apiFunction.post('/delete_cart_item', {
        p_cart_id: user.cart_id,
        p_product_variant_id: variant.variant_id,
      });

      await refreshCart();
    } catch (error) {
      // Revert optimistic update on error
      await refreshCart();
    }

    setLoading(false);
  };

  useEffect(() => {
    const setupCart = async () => {
      if (!user || !user.customer_id) return;

      // If user doesn't have cart_id, create a cart
      if (!user.cart_id) {
        try {
          const { data } = await api.post('/carts', {
            customer_id: user.customer_id,
          });
        } catch (error) {
        }
      }

      // Only fetch cart data if we have a cart_id
      if (user.cart_id) {
        await refreshCart();
      }
    };

    setupCart();
  }, [user?.cart_id]); // Removed refreshCart from dependencies

  return (
    <CartContext.Provider
      value={{
        showCart,
        setShowCart,
        cartItems,
        setCartItems,
        cart,
        loading,
        setLoading,
        addCartItem,
        removeCartItem,
        deleteCartItem,
        refreshCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within a CartProvider');
  return context;
};
