import RequiredRoles from '@/features/auth/presentation/components/required-role';
import ManagerPage from '@/features/employees/presentation/pages/manager.page';
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
            path='employee/manager'
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
          </Route>

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
