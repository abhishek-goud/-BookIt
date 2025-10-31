"use client";
import { createContext, useContext, useState, ReactNode } from "react";

export type OrderSummary = {
  Experience: string;
  Date: string;
  Time: string;
  Qty: number;
  basePrice: number,
  Total: string; // include currency formatting as provided
  experienceId?: string; // MongoDB ObjectId for booking
  date?: string; // ISO date format (YYYY-MM-DD) for booking
};

type OrderContextValue = {
  orderSummary: OrderSummary | null;
  setOrderSummary: (o: OrderSummary) => void;
};

const OrderContext = createContext<OrderContextValue | undefined>(undefined);

export function OrderProvider({ children }: { children: ReactNode }) {
  const [orderSummary, setOrderSummary] = useState<OrderSummary | null>(null);

  return (
    <OrderContext.Provider value={{ orderSummary, setOrderSummary }}>
      {children}
    </OrderContext.Provider>
  );
}

export function useOrder() {
  const ctx = useContext(OrderContext);
  if (!ctx) throw new Error("useOrder must be used within OrderProvider");
  return ctx;
}


