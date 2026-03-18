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
    <div className='flex flex-col h-screen'>
      <header className='bg-gray-800 text-white p-4 flex items-center justify-between'>
        <h1 className='text-xl font-bold'>Main Layout</h1>
        <AlertDialog>
          <AlertDialogTrigger className='text-sm bg-gray-700 hover:bg-gray-600 px-3 py-1.5 rounded-md transition-colors'>
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
      <main className='flex-1 p-4'>
        <Outlet />
      </main>
      <footer className='bg-gray-800 text-white p-4 text-center'>
        &copy; {new Date().getFullYear()} FoodUp
      </footer>
    </div>
  );
}
