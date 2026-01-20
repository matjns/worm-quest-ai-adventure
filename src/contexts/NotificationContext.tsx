import { createContext, useContext, ReactNode } from "react";

interface NotificationContextType {
  // Context for notification-related global state if needed
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: ReactNode }) {
  // The actual notification logic is now handled by useNotificationsData hook
  // which is used directly in NotificationCenter component
  return (
    <NotificationContext.Provider value={{}}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotificationContext() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error("useNotificationContext must be used within a NotificationProvider");
  }
  return context;
}
