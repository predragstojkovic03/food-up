import { Role } from '@/shared/domain/role.enum';
import { ReactNode } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../state/auth.store';

type Props = {
  roles: Role[];
  children: ReactNode;
};

const RequiredRoles = ({ roles, children }: Props) => {
  const navigate = useNavigate();
  const { user } = useAuthStore();

  if (!user) {
    return <Navigate to='/login' replace />;
  }

  if (!roles.includes(user.role)) {
    navigate(-1);
    return null;
  }

  return children;
};

export default RequiredRoles;
