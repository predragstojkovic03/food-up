import { useRestoreSession } from '@/features/auth/application/use-restore-session.hook';
import { AuthService } from '@/features/auth/infrastructure/auth.service';
import { useAuthStore } from '@/features/auth/presentation/state/auth.store';
import { UserPreferencesService } from '@/features/user-preferences/infrastructure/user-preferences.service';
import { useTheme } from '@/features/user-preferences/presentation/hooks/use-theme.hook';
import { BusinessService } from '@/features/businesses/infrastructure/business.service';
import { EmployeeService } from '@/features/employees/infrastructure/employee.service';
import { ChangeRequestService } from '@/features/change-requests/infrastructure/change-request.service';
import { ReportService } from '@/features/reports/infrastructure/report.service';
import { MealSelectionService } from '@/features/meal-selections/infrastructure/meal-selection.service';
import { MealSelectionWindowService } from '@/features/meal-selection-windows/infrastructure/meal-selection-window.service';
import { MealService } from '@/features/meals/infrastructure/meal.service';
import { MenuItemService } from '@/features/menu-items/infrastructure/menu-item.service';
import { MenuPeriodService } from '@/features/menu-periods/infrastructure/menu-period.service';
import { SupplierService } from '@/features/suppliers/infrastructure/supplier.service';
import { ServiceProvider } from '@/shared/infrastructure/di/service.context';
import { tokenStore } from '@/shared/infrastructure/auth/token-store';
import { HttpClient } from '@/shared/infrastructure/http/http-client';
import { TooltipProvider } from '@/components/ui/tooltip';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { ReactNode } from 'react';

const queryClient = new QueryClient();

/**
 * Called by HttpClient when a token refresh fails mid-flight (session truly expired/revoked).
 *
 * WHY useAuthStore.getState() outside React: Zustand stores are plain JS objects — getState()
 * works anywhere, not just in components. This avoids passing clearUser through prop drilling
 * or a separate context.
 *
 * WHY the user guard: during initial session restore, req.user is null (not logged in yet).
 * If restore calls /auth/me → 401 → refresh fails, we don't want to redirect to /login
 * before the app has even rendered. RequiredRoles handles the redirect once rendering starts.
 */
function onUnauthorized(): void {
  const { user, clearUser } = useAuthStore.getState();
  if (!user) return;
  clearUser();
  window.location.href = '/login';
}

const httpClient = new HttpClient(tokenStore, onUnauthorized);

const services = {
  authService: new AuthService(httpClient),
  businessService: new BusinessService(httpClient),
  employeeService: new EmployeeService(httpClient),
  supplierService: new SupplierService(httpClient),
  mealService: new MealService(httpClient),
  menuPeriodService: new MenuPeriodService(httpClient),
  menuItemService: new MenuItemService(httpClient),
  mealSelectionWindowService: new MealSelectionWindowService(httpClient),
  mealSelectionService: new MealSelectionService(httpClient),
  changeRequestService: new ChangeRequestService(httpClient),
  reportService: new ReportService(httpClient),
  preferencesService: new UserPreferencesService(httpClient),
};

function SessionGate({ children }: { children: ReactNode }) {
  const ready = useRestoreSession();
  if (!ready) return null;
  return <>{children}</>;
}

export function AppProviders({ children }: { children: ReactNode }) {
  useTheme();
  return (
    <ServiceProvider value={services}>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <SessionGate>{children}</SessionGate>
        </TooltipProvider>
        {import.meta.env.DEV && <ReactQueryDevtools />}
      </QueryClientProvider>
    </ServiceProvider>
  );
}
