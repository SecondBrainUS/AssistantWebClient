import { useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import apiClient from '../services/apiClient';

const LoginCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { login } = useAuth();

  useEffect(() => {
    const tempToken = searchParams.get('temp_token');

    const validateToken = async () => {
      if (!tempToken) {
        navigate('/');
        return;
      }

      try {
		    const validateResponse = await apiClient.get(`/auth/validate-token?temp_token=${tempToken}`);

        if (validateResponse.status != 200) {
          throw new Error('Token validation failed');
        }

        const { data: user } = await apiClient.get('/auth/me');

        login(user);
        navigate('/workspace');
      } catch (error) {
        console.error('Login callback error:', error);
        navigate('/');
      }
    };

    validateToken();
  }, [searchParams, login, navigate]);

  return <p>Logging in...</p>;
};

export default LoginCallback;