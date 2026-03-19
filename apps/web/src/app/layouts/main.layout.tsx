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
import { useAuthStore } from '@/features/auth/presentation/state/auth.store';
import { useServices } from '@/shared/infrastructure/di/service.context';
import { LogOut, UtensilsCrossed } from 'lucide-react';
import { Outlet, useNavigate } from 'react-router-dom';

export default function MainLayout() {
  const { authService } = useServices();
  const clearUser = useAuthStore((s) => s.clearUser);
  const navigate = useNavigate();

  function handleLogout() {
    authService.logout();
    clearUser();
    navigate('/login');
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className="sticky top-0 z-10 border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex h-14 items-center justify-between px-4 max-w-lg mx-auto w-full">
          <div className="flex items-center gap-2">
            <UtensilsCrossed className="size-5 text-primary" />
            <span className="font-semibold text-base">FoodUp</span>
          </div>
          <AlertDialog>
            <AlertDialogTrigger className="rounded-md p-2 hover:bg-muted transition-colors text-muted-foreground hover:text-foreground">
              <LogOut className="size-4" />
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Log out?</AlertDialogTitle>
                <AlertDialogDescription>
                  You will be returned to the login screen.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleLogout}>Log out</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </header>

      <main className="flex-1 px-4 py-6">
        <Outlet />
      </main>
    </div>
  );
}
