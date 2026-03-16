import { useRestoreSession } from '@/features/auth/application/use-restore-session.hook';
import { AuthService } from '@/features/auth/infrastructure/auth.service';
import { BusinessService } from '@/features/businesses/infrastructure/business.service';
import { ServiceProvider } from '@/shared/infrastructure/di/service.context';
import { HttpClient } from '@/shared/infrastructure/http/http-client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode } from 'react';

const queryClient = new QueryClient();

const httpClient = new HttpClient(() => localStorage.getItem('access_token'));

const services = {
  authService: new AuthService(httpClient),
  businessService: new BusinessService(httpClient),
};

function SessionGate({ children }: { children: ReactNode }) {
  const ready = useRestoreSession();
  if (!ready) return null;
  return <>{children}</>;
}

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <ServiceProvider value={services}>
      <QueryClientProvider client={queryClient}>
        <SessionGate>{children}</SessionGate>
      </QueryClientProvider>
    </ServiceProvider>
  );
}
