import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/features/auth/presentation/state/auth.store';
import { useCurrentEmployee } from '@/features/employees/application/use-current-employee.hook';
import { UserMenuDropdown } from '@/features/employees/presentation/components/user-menu-dropdown';
import { EmployeeRole, IdentityType } from '@food-up/shared';
import { UtensilsCrossed } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Link, Outlet } from 'react-router-dom';

const HOME_PATH: Record<IdentityType, string> = {
  [IdentityType.Employee]: '/employee',
  [IdentityType.Supplier]: '/supplier',
  [IdentityType.Business]: '/business',
  [IdentityType.Admin]: '/admin',
};

export default function MainLayout() {
  const { t } = useTranslation('common');
  const user = useAuthStore((s) => s.user);
  const homePath = user ? HOME_PATH[user.type] : '/';

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className="sticky top-0 z-10 border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex h-14 items-center justify-between px-4 max-w-lg mx-auto w-full">
          <Link to={homePath} className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <UtensilsCrossed className="size-5 text-primary" />
            <span className="font-semibold text-base">{t('brand.name')}</span>
          </Link>
          <div className="flex items-center gap-2">
            {user?.type === IdentityType.Employee && <ManagerPanelLink />}
            <UserMenuDropdown
              accountPath='/employee/account'
              renderTrigger={({ initials }) => (
                <Button variant='ghost' size='sm' className='rounded-full p-1'>
                  <Avatar className='size-7'>
                    <AvatarFallback className='text-xs font-semibold'>{initials}</AvatarFallback>
                  </Avatar>
                </Button>
              )}
            />
          </div>
        </div>
      </header>

      <main className="flex-1 px-4 py-6">
        <Outlet />
      </main>
    </div>
  );
}

function ManagerPanelLink() {
  const { t } = useTranslation('common');
  const { data: employee } = useCurrentEmployee();
  if (employee?.role !== EmployeeRole.Manager) return null;
  return (
    <Button variant='outline' size='sm' render={<Link to='/employee/manager' />}>
      {t('nav.managerPanel')}
    </Button>
  );
}
