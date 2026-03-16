import { Outlet } from 'react-router-dom';

export default function AuthLayout() {
  return (
    <div className='bg-muted min-h-screen flex items-center justify-center p-4'>
      <div className='w-full max-w-md'>
        <div className='mb-8 text-center'>
          <h1 className='text-3xl font-bold tracking-tight'>FoodUp</h1>
          <p className='text-muted-foreground mt-1 text-sm'>
            Meal management platform
          </p>
        </div>
        <Outlet />
      </div>
    </div>
  );
}
