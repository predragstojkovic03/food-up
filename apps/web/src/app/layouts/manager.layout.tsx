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
import { Badge } from '@/components/ui/badge';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { useWindowPendingCount } from '@/features/change-requests/application/use-window-change-requests.hook';
import { useCurrentEmployee } from '@/features/employees/application/use-current-employee.hook';
import { useLatestBusinessWindow } from '@/features/meal-selection-windows/application/use-latest-business-window.hook';
import { useAuthStore } from '@/features/auth/presentation/state/auth.store';
import { useServices } from '@/shared/infrastructure/di/service.context';
import {
  Building2,
  CalendarRange,
  ChevronRight,
  ClipboardList,
  LayoutDashboard,
  LogOut,
  Settings,
  Store,
  Users,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';

const SUPPLIERS_PATHS = [
  '/employee/manager/suppliers/in-house',
  '/employee/manager/suppliers/partners',
];

export default function ManagerLayout() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { authService } = useServices();
  const clearUser = useAuthStore((s) => s.clearUser);
  const suppliersOpen = SUPPLIERS_PATHS.some((p) => pathname.startsWith(p));
  const { data: latestWindow } = useLatestBusinessWindow();
  const { data: pendingCount = 0 } = useWindowPendingCount(latestWindow?.id);
  const { data: employee } = useCurrentEmployee();
  const { t } = useTranslation('common');
  const [logoutOpen, setLogoutOpen] = useState(false);

  const initials = employee?.name
    ? employee.name.charAt(0).toUpperCase()
    : '?';

  async function handleLogout() {
    await authService.logout();
    clearUser();
    navigate('/login');
  }

  return (
    <SidebarProvider>
      <Sidebar collapsible='icon'>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>

                <SidebarMenuItem>
                  <SidebarMenuButton
                    render={<NavLink to='/employee/manager' end />}
                    isActive={pathname === '/employee/manager'}
                  >
                    <LayoutDashboard />
                    <span>{t('nav.dashboard')}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>

                <SidebarMenuItem>
                  <SidebarMenuButton
                    render={<NavLink to='/employee/manager/employees' />}
                    isActive={pathname.startsWith('/employee/manager/employees')}
                  >
                    <Users />
                    <span>{t('nav.employees')}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>

                <Collapsible defaultOpen={suppliersOpen}>
                  <SidebarMenuItem>
                    <CollapsibleTrigger
                      render={<SidebarMenuButton isActive={suppliersOpen} className='group/collapsible' />}
                    >
                      <Store />
                      <span>{t('nav.suppliers')}</span>
                      <ChevronRight className='ml-auto transition-transform duration-200 ease-in-out group-data-[panel-open]/collapsible:rotate-90' />
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <SidebarMenuSub>
                        <SidebarMenuSubItem>
                          <SidebarMenuSubButton
                            render={<NavLink to='/employee/manager/suppliers/in-house' />}
                            isActive={pathname.startsWith('/employee/manager/suppliers/in-house')}
                          >
                            {t('nav.inHouseSuppliers')}
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                        <SidebarMenuSubItem>
                          <SidebarMenuSubButton
                            render={<NavLink to='/employee/manager/suppliers/partners' />}
                            isActive={pathname.startsWith('/employee/manager/suppliers/partners')}
                          >
                            {t('nav.partnerSuppliers')}
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      </SidebarMenuSub>
                    </CollapsibleContent>
                  </SidebarMenuItem>
                </Collapsible>

                <SidebarMenuItem>
                  <SidebarMenuButton
                    render={<NavLink to='/employee/manager/meal-selection-windows' />}
                    isActive={pathname.startsWith('/employee/manager/meal-selection-windows')}
                  >
                    <CalendarRange />
                    <span>{t('nav.mealSelectionWindows')}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>

                <SidebarMenuItem>
                  <SidebarMenuButton
                    render={<NavLink to='/employee/manager/change-requests' />}
                    isActive={pathname.startsWith('/employee/manager/change-requests')}
                  >
                    <ClipboardList />
                    <span>{t('nav.changeRequests')}</span>
                    {pendingCount > 0 && (
                      <Badge className='ml-auto text-xs px-1.5 py-0'>{pendingCount}</Badge>
                    )}
                  </SidebarMenuButton>
                </SidebarMenuItem>

                <SidebarMenuItem>
                  <SidebarMenuButton
                    render={<NavLink to='/employee/manager/business' />}
                    isActive={pathname.startsWith('/employee/manager/business')}
                  >
                    <Building2 />
                    <span>{t('nav.businessSettings')}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>

              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        <SidebarFooter>
          <SidebarMenu>
            <SidebarMenuItem>
              <DropdownMenu>
                <DropdownMenuTrigger
                  render={<SidebarMenuButton size='lg' tooltip={employee?.name ?? t('nav.account')} />}
                >
                  <Avatar className='size-7 shrink-0'>
                    <AvatarFallback className='text-xs font-semibold'>
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <span className='truncate font-semibold'>{employee?.name ?? '…'}</span>
                </DropdownMenuTrigger>
                <DropdownMenuContent side='top' align='start' className='w-60'>
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
                  <DropdownMenuItem onClick={() => navigate('/employee/manager/account')}>
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
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>

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

      <main className='flex flex-col flex-1 overflow-auto'>
        <header className='flex items-center h-12 px-4 border-b shrink-0'>
          <SidebarTrigger />
        </header>
        <div className='flex-1 p-4'>
          <Outlet />
        </div>
      </main>
    </SidebarProvider>
  );
}
