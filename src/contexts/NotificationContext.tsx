import { createContext, useContext, ReactNode } from "react";
import { useCircuitNotifications } from "@/hooks/useCircuitNotifications";

interface NotificationContextType {
  refreshCircuits: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: ReactNode }) {
  const { refreshCircuits } = useCircuitNotifications();

  return (
    <NotificationContext.Provider value={{ refreshCircuits }}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error("useNotifications must be used within a NotificationProvider");
  }
  return context;
}
