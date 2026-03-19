import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  Sidebar,
  SidebarContent,
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
import { useLatestBusinessWindow } from '@/features/meal-selection-windows/application/use-latest-business-window.hook';
import { useAuthStore } from '@/features/auth/presentation/state/auth.store';
import { useServices } from '@/shared/infrastructure/di/service.context';
import {
  CalendarRange,
  ChevronRight,
  ClipboardList,
  LayoutDashboard,
  LogOut,
  Store,
  Users,
} from 'lucide-react';
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

  function handleLogout() {
    authService.logout();
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
                    <span>Dashboard</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>

                <SidebarMenuItem>
                  <SidebarMenuButton
                    render={<NavLink to='/employee/manager/employees' />}
                    isActive={pathname.startsWith('/employee/manager/employees')}
                  >
                    <Users />
                    <span>Employees</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>

                <Collapsible defaultOpen={suppliersOpen} className='group/collapsible'>
                  <SidebarMenuItem>
                    <CollapsibleTrigger asChild>
                      <SidebarMenuButton isActive={suppliersOpen}>
                        <Store />
                        <span>Suppliers</span>
                        <ChevronRight className='ml-auto transition-transform group-data-[state=open]/collapsible:rotate-90' />
                      </SidebarMenuButton>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <SidebarMenuSub>
                        <SidebarMenuSubItem>
                          <SidebarMenuSubButton
                            render={<NavLink to='/employee/manager/suppliers/in-house' />}
                            isActive={pathname.startsWith('/employee/manager/suppliers/in-house')}
                          >
                            In-House Suppliers
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                        <SidebarMenuSubItem>
                          <SidebarMenuSubButton
                            render={<NavLink to='/employee/manager/suppliers/partners' />}
                            isActive={pathname.startsWith('/employee/manager/suppliers/partners')}
                          >
                            Partner Suppliers
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
                    <span>Meal Selection Windows</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>

                <SidebarMenuItem>
                  <SidebarMenuButton
                    render={<NavLink to='/employee/manager/change-requests' />}
                    isActive={pathname.startsWith('/employee/manager/change-requests')}
                  >
                    <ClipboardList />
                    <span>Change Requests</span>
                    {pendingCount > 0 && (
                      <Badge className='ml-auto text-xs px-1.5 py-0'>{pendingCount}</Badge>
                    )}
                  </SidebarMenuButton>
                </SidebarMenuItem>

              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>

      <main className='flex flex-col flex-1 overflow-auto'>
        <header className='flex items-center justify-between h-12 px-4 border-b shrink-0'>
          <SidebarTrigger />
          <AlertDialog>
            <AlertDialogTrigger className='flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors'>
              <LogOut size={15} />
              Logout
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Logout</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to log out?
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleLogout}>Logout</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </header>
        <div className='flex-1 p-4'>
          <Outlet />
        </div>
      </main>
    </SidebarProvider>
  );
}
