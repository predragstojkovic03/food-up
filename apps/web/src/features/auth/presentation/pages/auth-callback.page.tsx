import { tokenStore } from '@/shared/infrastructure/auth/token-store';
import { useAuthStore } from '@/features/auth/presentation/state/auth.store';
import { useServices } from '@/shared/infrastructure/di/service.context';
import { useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { getRedirectPath } from './_redirect-path';

export default function AuthCallbackPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { authService } = useServices();
  const setUser = useAuthStore((s) => s.setUser);
  const processed = useRef(false);

  useEffect(() => {
    if (processed.current) return;
    processed.current = true;

    const token = searchParams.get('token');
    const error = searchParams.get('error');

    if (!token || error) {
      navigate('/login', { replace: true, state: { googleError: true } });
      return;
    }

    tokenStore.set(token);
    window.history.replaceState({}, '', window.location.pathname);

    authService.restoreSession().then((user) => {
      if (!user) {
        navigate('/login', { replace: true, state: { googleError: true } });
        return;
      }
      setUser(user);
      navigate(getRedirectPath(user.type, user.role), { replace: true });
    });
  }, []);

  return (
    <div className='min-h-screen flex items-center justify-center'>
      <div className='h-8 w-8 animate-spin rounded-full border-b-2 border-primary' />
    </div>
  );
}
