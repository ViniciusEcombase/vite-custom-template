import { ModalProvider } from './contextProviders/ModalProvider';
import { AuthProvider } from './contextProviders/AuthProvider';
import { CartProvider } from './contextProviders/CartProvider';
import { WishlistProvider } from './contextProviders/WishlistProvider';
import Home from './pages/Home';
import SignUp from './pages/SignUp';
import UserAccount from './pages/UserAccount';
import Login from './pages/Login';
import ProductPage from './pages/ProductPage';
import StorePage from './pages/StorePage';
import PublicRoute from './routes/PublicRoute';
import PrivateRoute from './routes/PrivateRoute';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

const App = () => {
  return (
    <ModalProvider>
      <AuthProvider>
        <CartProvider>
          <WishlistProvider>
            <BrowserRouter>
              <Routes>
                <Route
                  path="/signup"
                  element={
                    <PublicRoute>
                      <SignUp />
                    </PublicRoute>
                  }
                />
                <Route
                  path="/login"
                  element={
                    <PublicRoute>
                      <Login />
                    </PublicRoute>
                  }
                />
                <Route path="/" element={<Home />} />

                <Route path="/product/:variantSlug" element={<ProductPage />} />
                <Route path="/store/" element={<StorePage />} />
                <Route
                  path="/UserAccount"
                  element={
                    <PrivateRoute>
                      <UserAccount />
                    </PrivateRoute>
                  }
                />
              </Routes>
            </BrowserRouter>
          </WishlistProvider>
        </CartProvider>
      </AuthProvider>
    </ModalProvider>
  );
};

export default App;
