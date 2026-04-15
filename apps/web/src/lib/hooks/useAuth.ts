import { useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '@/store';
import { apiClient } from '@/lib/api-client';
import type { User } from '@brokerflow/shared';

export function useAuth() {
  const { user, accessToken, isAuthenticated } = useAppStore((s) => s.auth);
  const { setUser, setTokens, logout } = useAppStore();
  const navigate = useNavigate();

  const login = useCallback(
    async (email: string, password: string) => {
      const { data } = await apiClient.post('/auth/login', { email, password });
      const { tokens, user: userData } = data.data;
      setTokens(tokens.access_token, tokens.refresh_token);
      setUser(userData as User);
      navigate('/');
    },
    [setTokens, setUser, navigate],
  );

  const handleLogout = useCallback(() => {
    logout();
    navigate('/login');
  }, [logout, navigate]);

  const fetchCurrentUser = useCallback(async () => {
    if (!accessToken) return;
    try {
      const { data } = await apiClient.get('/auth/me');
      setUser(data.data as User);
    } catch {
      handleLogout();
    }
  }, [accessToken, setUser, handleLogout]);

  useEffect(() => {
    if (accessToken && !user) {
      fetchCurrentUser();
    }
  }, [accessToken, user, fetchCurrentUser]);

  return {
    user,
    isAuthenticated,
    login,
    logout: handleLogout,
    fetchCurrentUser,
  };
}
