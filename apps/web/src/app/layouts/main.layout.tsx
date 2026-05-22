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
import { useTranslation } from 'react-i18next';
import { Outlet, useNavigate } from 'react-router-dom';

export default function MainLayout() {
  const { t } = useTranslation('common');
  const { authService } = useServices();
  const clearUser = useAuthStore((s) => s.clearUser);
  const navigate = useNavigate();

  async function handleLogout() {
    await authService.logout();
    clearUser();
    navigate('/login');
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className="sticky top-0 z-10 border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex h-14 items-center justify-between px-4 max-w-lg mx-auto w-full">
          <div className="flex items-center gap-2">
            <UtensilsCrossed className="size-5 text-primary" />
            <span className="font-semibold text-base">{t('brand.name')}</span>
          </div>
          <AlertDialog>
            <AlertDialogTrigger className="rounded-md p-2 hover:bg-muted transition-colors text-muted-foreground hover:text-foreground">
              <LogOut className="size-4" />
            </AlertDialogTrigger>
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
        </div>
      </header>

      <main className="flex-1 px-4 py-6">
        <Outlet />
      </main>
    </div>
  );
}
