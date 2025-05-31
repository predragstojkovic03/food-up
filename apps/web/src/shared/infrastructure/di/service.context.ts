import { createContext, useContext } from 'react';
import { ServiceContainer } from './service-container';

const ServiceContext = createContext<ServiceContainer | null>(null);

export const useServices = (): ServiceContainer => {
  const context = useContext(ServiceContext);
  if (!context)
    throw new Error('useServices must be used inside a ServiceProvider');
  return context;
};

export const ServiceProvider = ServiceContext.Provider;
