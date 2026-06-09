import { useState } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useCurrentEmployee } from '@/features/employees/application/use-current-employee.hook';
import { useAuthStore } from '@/features/auth/presentation/state/auth.store';
import { useServices } from '@/shared/infrastructure/di/service.context';
import { LogOut, Settings } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

interface UserMenuDropdownProps {
  accountPath: string;
  renderTrigger: (data: { name: string | undefined; initials: string }) => React.ReactElement;
  contentSide?: 'top' | 'bottom' | 'left' | 'right';
  contentAlign?: 'start' | 'center' | 'end';
}

export function UserMenuDropdown({
  accountPath,
  renderTrigger,
  contentSide = 'bottom',
  contentAlign = 'end',
}: UserMenuDropdownProps) {
  const navigate = useNavigate();
  const { authService } = useServices();
  const clearUser = useAuthStore((s) => s.clearUser);
  const { data: employee } = useCurrentEmployee();
  const { t } = useTranslation('common');
  const [logoutOpen, setLogoutOpen] = useState(false);

  const initials = employee?.name ? employee.name.charAt(0).toUpperCase() : '?';

  async function handleLogout() {
    await authService.logout();
    clearUser();
    navigate('/login');
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger render={renderTrigger({ name: employee?.name, initials })} />
        <DropdownMenuContent side={contentSide} align={contentAlign} className='w-60'>
          <div className='flex items-center gap-3 px-3 py-2'>
            <Avatar className='size-10 shrink-0'>
              <AvatarFallback className='font-semibold'>{initials}</AvatarFallback>
            </Avatar>
            <div className='flex min-w-0 flex-col'>
              <span className='truncate text-sm font-semibold'>{employee?.name}</span>
              <span className='truncate text-xs text-muted-foreground'>{employee?.email}</span>
            </div>
          </div>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => navigate(accountPath)}>
            <Settings size={15} className='mr-2' />
            {t('nav.account')}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem variant='destructive' onClick={() => setLogoutOpen(true)}>
            <LogOut size={15} className='mr-2' />
            {t('nav.logout')}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog open={logoutOpen} onOpenChange={setLogoutOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('dialog.logout.title')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('dialog.logout.description')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('dialog.cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={handleLogout}>{t('dialog.logout.confirm')}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
