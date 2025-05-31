import { AuthService } from '@/features/auth/infrastructure/auth.service';
import { ServiceProvider } from '@/shared/infrastructure/di/service.context';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode } from 'react';

const queryClient = new QueryClient();

const services = {
  authService: new AuthService(),
};

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <ServiceProvider value={services}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </ServiceProvider>
  );
}
