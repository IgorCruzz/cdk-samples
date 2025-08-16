import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/use-auth';

export default function Redirect() {
  const navigate = useNavigate();
  const setTokens = useAuthStore((state) => state.setTokens);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const accessToken = params.get('access_token');
    const refreshToken = params.get('refresh_token');
    const idToken = params.get('id_token');

    if (accessToken && refreshToken && idToken) {
      setTokens({ accessToken, refreshToken, idToken });
    } else {
      navigate('/');
    }
  }, [navigate, setTokens]);

  return <p>Redirecionando...</p>;
}
