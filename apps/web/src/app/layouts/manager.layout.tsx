import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
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
  useSidebar,
} from '@/components/ui/sidebar';
import { useWindowPendingCount } from '@/features/change-requests/application/use-window-change-requests.hook';
import { useLatestBusinessWindow } from '@/features/meal-selection-windows/application/use-latest-business-window.hook';
import { UserMenuDropdown } from '@/features/employees/presentation/components/user-menu-dropdown';
import {
  Building2,
  CalendarRange,
  ChevronRight,
  ClipboardList,
  LayoutDashboard,
  Store,
  Users,
  Utensils,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { useEffect } from 'react';

const SUPPLIERS_PATHS = [
  '/employee/manager/suppliers/in-house',
  '/employee/manager/suppliers/partners',
];

export default function ManagerLayout() {
  const { pathname } = useLocation();
  const suppliersOpen = SUPPLIERS_PATHS.some((p) => pathname.startsWith(p));
  const { data: latestWindow } = useLatestBusinessWindow();
  const { data: pendingCount = 0 } = useWindowPendingCount(latestWindow?.id);
  const { t } = useTranslation('common');

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

          <SidebarGroup className='mt-auto'>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    render={<NavLink to='/employee' />}
                    isActive={pathname === '/employee'}
                  >
                    <Utensils />
                    <span>{t('nav.orderMeals')}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        <SidebarFooter>
          <SidebarMenu>
            <SidebarMenuItem>
              <UserMenuDropdown
                accountPath='/employee/manager/account'
                contentSide='top'
                contentAlign='start'
                renderTrigger={({ name, initials }) => (
                  <SidebarMenuButton size='lg' tooltip={name ?? t('nav.account')}>
                    <Avatar className='size-7 shrink-0'>
                      <AvatarFallback className='text-xs font-semibold'>{initials}</AvatarFallback>
                    </Avatar>
                    <span className='truncate font-semibold'>{name ?? '…'}</span>
                  </SidebarMenuButton>
                )}
              />
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>

      <MobileNavCloser />
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

function MobileNavCloser() {
  const { setOpenMobile } = useSidebar();
  const { pathname } = useLocation();
  useEffect(() => {
    setOpenMobile(false);
  }, [pathname, setOpenMobile]);
  return null;
}
