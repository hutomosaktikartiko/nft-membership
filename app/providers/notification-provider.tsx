import React, { createContext, useContext } from "react";
import { TOAST_DURATION } from "~/lib/utils/constants";
import { Toaster, toast } from "sonner";
import { getExplorerUrl } from "~/lib/solana/utils";

interface NotificationContextType {
  showSuccess: (
    message: React.ReactNode,
    description?: React.ReactNode
  ) => void;
  showTransactionSuccess: (signature: string, message?: string) => void;
  showError: (message: React.ReactNode, description?: React.ReactNode) => void;
  showInfo: (message: React.ReactNode, description?: React.ReactNode) => void;
  showWarning: (
    message: React.ReactNode,
    description?: React.ReactNode
  ) => void;
  showLoading: (message: string) => string | number;
  dismissLoading: (id: string | number) => void;
}

const NotificationContext = createContext<NotificationContextType | null>(null);

interface NotificationProviderProps {
  children: React.ReactNode;
}

export function NotificationProvider({ children }: NotificationProviderProps) {
  const showSuccess = (
    message: React.ReactNode,
    description?: React.ReactNode
  ) => {
    toast.success(message, {
      description,
      duration: TOAST_DURATION,
    });
  };

  const showTransactionSuccess = (
    signature: string,
    message: string = "Transaction successful"
  ) => {
    toast.success(
      <div>
        <div>{message}</div>
        <a
          href={`${getExplorerUrl(signature)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-500 hover:underline"
        >
          View on Explorer
        </a>
      </div>
    );
  };

  const showError = (
    message: React.ReactNode,
    description?: React.ReactNode
  ) => {
    toast.error(message, {
      description,
      duration: TOAST_DURATION,
    });
  };

  const showInfo = (
    message: React.ReactNode,
    description?: React.ReactNode
  ) => {
    toast.info(message, {
      description,
      duration: TOAST_DURATION,
    });
  };

  const showWarning = (
    message: React.ReactNode,
    description?: React.ReactNode
  ) => {
    toast.warning(message, {
      description,
      duration: TOAST_DURATION,
    });
  };

  const showLoading = (message: string) => {
    return toast.loading(message, {
      duration: Infinity,
    });
  };

  const dismissLoading = (id: string | number) => {
    toast.dismiss(id);
  };

  const value = {
    showSuccess,
    showTransactionSuccess,
    showError,
    showInfo,
    showWarning,
    showLoading,
    dismissLoading,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
      <Toaster
        position="bottom-right"
        expand={true}
        richColors={true}
        closeButton={true}
        toastOptions={{
          style: {
            background: "var(--background)",
            color: "var(--foreground)",
            border: "1px solid var(--border)",
          },
        }}
      />
    </NotificationContext.Provider>
  );
}

export function useNotification() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error(
      "useNotification must be used within a NotificationProvider"
    );
  }

  return context;
}
