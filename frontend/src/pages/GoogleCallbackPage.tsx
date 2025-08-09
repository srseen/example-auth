import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../useAuth';

export default function GoogleCallbackPage() {
  const navigate = useNavigate();
  const { setAuth } = useAuth();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const accessToken = params.get('accessToken');
    const refreshToken = params.get('refreshToken');
    const userParam = params.get('user');
    const user = userParam ? JSON.parse(userParam) : undefined;
    if (accessToken && refreshToken) {
      setAuth({ accessToken, refreshToken, user });
      navigate('/');
    }
  }, [setAuth, navigate]);

  return <p>Loading...</p>;
}
