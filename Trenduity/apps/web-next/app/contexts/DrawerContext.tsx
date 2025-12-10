'use client';

import { useState, createContext, useContext, ReactNode } from 'react';

interface DrawerContextType {
  isOpen: boolean;
  toggleDrawer: () => void;
}

const DrawerContext = createContext<DrawerContextType | undefined>(undefined);

export function DrawerProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);

  const toggleDrawer = () => setIsOpen(prev => !prev);

  return (
    <DrawerContext.Provider value={{ isOpen, toggleDrawer }}>
      {children}
    </DrawerContext.Provider>
  );
}

export function useDrawer() {
  const context = useContext(DrawerContext);
  if (!context) {
    throw new Error('useDrawer must be used within DrawerProvider');
  }
  return context;
}
