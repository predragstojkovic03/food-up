import { EmployeeRole, IdentityType } from '@food-up/shared';
import { ReactNode } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../state/auth.store';

type Props = {
  types: IdentityType[];
  employeeRoles?: EmployeeRole[];
  children: ReactNode;
};

const RequiredRoles = ({ types, employeeRoles, children }: Props) => {
  const navigate = useNavigate();
  const { user } = useAuthStore();

  if (!user) {
    return <Navigate to='/login' replace />;
  }

  if (!types.includes(user.type)) {
    navigate(-1);
    return null;
  }

  if (
    user.type === IdentityType.Employee &&
    employeeRoles &&
    (user.role === undefined || !employeeRoles.includes(user.role))
  ) {
    navigate(-1);
    return null;
  }

  return children;
};

export default RequiredRoles;
