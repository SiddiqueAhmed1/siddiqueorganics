"use client";

import { createContext, useContext, useState, type ReactNode } from "react";

interface CartDrawerContextValue {
  isOpen: boolean;
  openDrawer: () => void;
  closeDrawer: () => void;
}

const CartDrawerContext = createContext<CartDrawerContextValue | null>(null);

export function CartDrawerProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <CartDrawerContext.Provider
      value={{
        isOpen,
        openDrawer: () => setIsOpen(true),
        closeDrawer: () => setIsOpen(false),
      }}
    >
      {children}
    </CartDrawerContext.Provider>
  );
}

export function useCartDrawer() {
  const ctx = useContext(CartDrawerContext);
  if (!ctx) {
    throw new Error("useCartDrawer must be used within a CartDrawerProvider");
  }
  return ctx;
}
