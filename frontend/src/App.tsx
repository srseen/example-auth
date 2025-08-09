import { Routes, Route } from 'react-router-dom';
import PrivateRoute from './PrivateRoute';
import DashboardPage from './pages/DashboardPage';
import ProfilePage from './pages/ProfilePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import GoogleCallbackPage from './pages/GoogleCallbackPage';

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/auth/google/callback" element={<GoogleCallbackPage />} />
      <Route path="/" element={<PrivateRoute><DashboardPage /></PrivateRoute>} />
      <Route path="/profile" element={<PrivateRoute><ProfilePage /></PrivateRoute>} />
    </Routes>
  );
}
