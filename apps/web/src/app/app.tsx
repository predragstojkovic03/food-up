import RequiredRoles from '@/features/auth/presentation/components/required-role';
import ManagerPage from '@/features/employees/presentation/pages/manager.page';
import EmployeesPage from '@/features/employees/presentation/pages/employees.page';
import MealSelectionWindowsPage from '@/features/meal-selection-windows/presentation/pages/meal-selection-windows.page';
import InHouseSupplierDetailPage from '@/features/suppliers/presentation/pages/in-house-supplier-detail.page';
import InHouseSuppliersPage from '@/features/suppliers/presentation/pages/in-house-suppliers.page';
import PartnerSuppliersPage from '@/features/suppliers/presentation/pages/partner-suppliers.page';
import LoginPage from '@/features/auth/presentation/pages/login.page';
import RegisterPage from '@/features/auth/presentation/pages/register.page';
import { IdentityType, EmployeeRole } from '@food-up/shared';
import { Navigate, Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import AuthLayout from './layouts/auth.layout';
import MainLayout from './layouts/main.layout';
import ManagerLayout from './layouts/manager.layout';

function App() {
  return (
    <Router>
      <Routes>
        {/* Auth routes */}
        <Route element={<AuthLayout />}>
          <Route path='/login' element={<LoginPage />} />
          <Route path='/register' element={<RegisterPage />} />
        </Route>

        {/* Manager routes — self-contained layout with sidebar */}
        <Route
          path='/employee/manager'
          element={
            <RequiredRoles
              types={[IdentityType.Employee]}
              employeeRoles={[EmployeeRole.Manager]}
            >
              <ManagerLayout />
            </RequiredRoles>
          }
        >
          <Route index element={<ManagerPage />} />
          <Route path='employees' element={<EmployeesPage />} />
          <Route path='suppliers/in-house' element={<InHouseSuppliersPage />} />
          <Route path='suppliers/in-house/:id' element={<InHouseSupplierDetailPage />} />
          <Route path='suppliers/partners' element={<PartnerSuppliersPage />} />
          <Route path='meal-selection-windows' element={<MealSelectionWindowsPage />} />
        </Route>

        {/* App routes */}
        <Route path='/' element={<MainLayout />}>
          <Route index element={<Navigate to='/login' replace />} />

          <Route
            path='employee'
            element={
              <RequiredRoles types={[IdentityType.Employee]}>
                <div>Employee Home Page</div>
              </RequiredRoles>
            }
          />

          <Route
            path='supplier'
            element={
              <RequiredRoles types={[IdentityType.Supplier]}>
                <div>Supplier Home Page</div>
              </RequiredRoles>
            }
          />
          <Route
            path='supplier/:id'
            element={
              <RequiredRoles types={[IdentityType.Supplier]}>
                <div>Supplier Details Page</div>
              </RequiredRoles>
            }
          />

          <Route
            path='business'
            element={
              <RequiredRoles types={[IdentityType.Business]}>
                <div>Business Home Page</div>
              </RequiredRoles>
            }
          />

          <Route
            path='admin'
            element={
              <RequiredRoles types={[IdentityType.Admin]}>
                <div>Admin Page</div>
              </RequiredRoles>
            }
          />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
