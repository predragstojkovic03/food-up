import { IAuthService } from '@/features/auth/domain/auth-service.interface';
import { IBusinessService } from '@/features/businesses/domain/business-service.interface';
import { IEmployeeService } from '@/features/employees/domain/employee-service.interface';
import { IMealSelectionService } from '@/features/meal-selections/domain/meal-selection-service.interface';
import { IMealSelectionWindowService } from '@/features/meal-selection-windows/domain/meal-selection-window-service.interface';
import { IMealService } from '@/features/meals/domain/meal-service.interface';
import { IMenuItemService } from '@/features/menu-items/domain/menu-item-service.interface';
import { IMenuPeriodService } from '@/features/menu-periods/domain/menu-period-service.interface';
import { ISupplierService } from '@/features/suppliers/domain/supplier-service.interface';

export interface ServiceContainer {
  authService: IAuthService;
  businessService: IBusinessService;
  employeeService: IEmployeeService;
  supplierService: ISupplierService;
  mealService: IMealService;
  menuPeriodService: IMenuPeriodService;
  menuItemService: IMenuItemService;
  mealSelectionWindowService: IMealSelectionWindowService;
  mealSelectionService: IMealSelectionService;
}
