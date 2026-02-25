import { Outlet } from 'react-router-dom';

export default function MainLayout() {
  return (
    <div className='flex flex-col h-screen'>
      <header className='bg-gray-800 text-white p-4'>
        <h1 className='text-xl font-bold'>Main Layout</h1>
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
