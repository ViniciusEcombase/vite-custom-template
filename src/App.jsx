import { ModalProvider } from './contextProviders/ModalProvider';
import { AuthProvider } from './contextProviders/AuthProvider';
import Home from './pages/Home';
import SignUp from './pages/SignUp';
import UserAccount from './pages/UserAccount';
import Login from './pages/Login';
import PublicRoute from './routes/PublicRoute';
import PrivateRoute from './routes/PrivateRoute';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

const App = () => {
  return (
    <ModalProvider>
      <AuthProvider>
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
      </AuthProvider>
    </ModalProvider>
  );
};

export default App;
