import { Routes, Route } from 'react-router-dom';
import PrivateRoute from './PrivateRoute';
import DashboardPage from './pages/DashboardPage';
import ProfilePage from './pages/ProfilePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import GoogleCallbackPage from './pages/GoogleCallbackPage';
import VerifySuccessPage from './pages/VerifySuccessPage';
import VerifyEmailPage from './pages/VerifyEmailPage';
import Layout from './components/Layout';

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/auth/google/callback" element={<GoogleCallbackPage />} />
        <Route path="/verify/email" element={<VerifyEmailPage />} />
        <Route path="/verify/success" element={<VerifySuccessPage />} />
        <Route
          path="/"
          element={<PrivateRoute><DashboardPage /></PrivateRoute>}
        />
        <Route
          path="/profile"
          element={<PrivateRoute><ProfilePage /></PrivateRoute>}
        />
      </Route>
    </Routes>
  );
}
