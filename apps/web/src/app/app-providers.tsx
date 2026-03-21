import { useRestoreSession } from '@/features/auth/application/use-restore-session.hook';
import { AuthService } from '@/features/auth/infrastructure/auth.service';
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
import { HttpClient } from '@/shared/infrastructure/http/http-client';
import { TooltipProvider } from '@/components/ui/tooltip';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { ReactNode } from 'react';

const queryClient = new QueryClient();

const httpClient = new HttpClient(() => localStorage.getItem('access_token'));

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
        <TooltipProvider>
          <SessionGate>{children}</SessionGate>
        </TooltipProvider>
        {import.meta.env.DEV && <ReactQueryDevtools />}
      </QueryClientProvider>
    </ServiceProvider>
  );
}
