import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";

export type ToastType = "success" | "error" | "info" | "warning";

export interface ToastAction {
  label: string;
  onClick: () => void;
}

export interface ToastOptions {
  id?: string;
  title?: string;
  message?: string;
  type?: ToastType;
  duration?: number; // Milliseconds to auto dismiss, 0 for sticky. Default: 5000ms
  action?: ToastAction;
}

export interface ToastItem {
  id: string;
  type: ToastType;
  title?: string;
  message: string;
  duration: number;
  action?: ToastAction;
  createdAt: number;
}

export interface ToastContextValue {
  toasts: ToastItem[];
  showToast: (options: ToastOptions) => string;
  dismissToast: (id: string) => void;
  clearToasts: () => void;
  success: (titleOrMessage: string, messageOrOptions?: string | Omit<ToastOptions, "type">, options?: Omit<ToastOptions, "type">) => string;
  error: (titleOrMessage: string, messageOrOptions?: string | Omit<ToastOptions, "type">, options?: Omit<ToastOptions, "type">) => string;
  info: (titleOrMessage: string, messageOrOptions?: string | Omit<ToastOptions, "type">, options?: Omit<ToastOptions, "type">) => string;
  warning: (titleOrMessage: string, messageOrOptions?: string | Omit<ToastOptions, "type">, options?: Omit<ToastOptions, "type">) => string;
}

const ToastContext = createContext<ToastContextValue | null>(null);

// Static emitter for calling toast functions anywhere (even outside react hook tree)
type ToastListener = (action: { type: "add"; toast: ToastItem } | { type: "dismiss"; id: string } | { type: "clear" }) => void;
const listeners = new Set<ToastListener>();

function emitToastEvent(event: { type: "add"; toast: ToastItem } | { type: "dismiss"; id: string } | { type: "clear" }) {
  listeners.forEach((listener) => {
    try {
      listener(event);
    } catch (err) {
      console.error("[Toast] Listener error:", err);
    }
  });
}

function parseToastArgs(
  type: ToastType,
  titleOrMessage: string,
  messageOrOptions?: string | Omit<ToastOptions, "type">,
  options?: Omit<ToastOptions, "type">
): ToastOptions {
  if (typeof messageOrOptions === "string") {
    return {
      type,
      title: titleOrMessage,
      message: messageOrOptions,
      ...(options || {}),
    };
  }

  if (typeof messageOrOptions === "object" && messageOrOptions !== null) {
    return {
      type,
      message: titleOrMessage,
      ...messageOrOptions,
    };
  }

  return {
    type,
    message: titleOrMessage,
    ...(options || {}),
  };
}

let toastCounter = 0;

export const toast = {
  show: (options: ToastOptions): string => {
    const id = options.id || `toast-${Date.now()}-${++toastCounter}`;
    const item: ToastItem = {
      id,
      type: options.type || "info",
      title: options.title,
      message: options.message || "",
      duration: typeof options.duration === "number" ? options.duration : 5000,
      action: options.action,
      createdAt: Date.now(),
    };
    emitToastEvent({ type: "add", toast: item });
    return id;
  },
  success: (titleOrMessage: string, messageOrOptions?: string | Omit<ToastOptions, "type">, options?: Omit<ToastOptions, "type">): string => {
    return toast.show(parseToastArgs("success", titleOrMessage, messageOrOptions, options));
  },
  error: (titleOrMessage: string, messageOrOptions?: string | Omit<ToastOptions, "type">, options?: Omit<ToastOptions, "type">): string => {
    return toast.show(parseToastArgs("error", titleOrMessage, messageOrOptions, options));
  },
  info: (titleOrMessage: string, messageOrOptions?: string | Omit<ToastOptions, "type">, options?: Omit<ToastOptions, "type">): string => {
    return toast.show(parseToastArgs("info", titleOrMessage, messageOrOptions, options));
  },
  warning: (titleOrMessage: string, messageOrOptions?: string | Omit<ToastOptions, "type">, options?: Omit<ToastOptions, "type">): string => {
    return toast.show(parseToastArgs("warning", titleOrMessage, messageOrOptions, options));
  },
  dismiss: (id: string) => {
    emitToastEvent({ type: "dismiss", id });
  },
  clear: () => {
    emitToastEvent({ type: "clear" });
  },
};

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const toastsRef = useRef<ToastItem[]>([]);
  toastsRef.current = toasts;

  useEffect(() => {
    const handleEvent: ToastListener = (event) => {
      if (event.type === "add") {
        setToasts((prev) => {
          // If an item with the same ID exists, replace it, otherwise append (cap at 6 toasts)
          const filtered = prev.filter((t) => t.id !== event.toast.id);
          const updated = [...filtered, event.toast];
          return updated.slice(-6);
        });
      } else if (event.type === "dismiss") {
        setToasts((prev) => prev.filter((t) => t.id !== event.id));
      } else if (event.type === "clear") {
        setToasts([]);
      }
    };

    listeners.add(handleEvent);
    return () => {
      listeners.delete(handleEvent);
    };
  }, []);

  const dismissToast = useCallback((id: string) => {
    toast.dismiss(id);
  }, []);

  const clearToasts = useCallback(() => {
    toast.clear();
  }, []);

  const showToast = useCallback((options: ToastOptions) => {
    return toast.show(options);
  }, []);

  const contextValue = useMemo<ToastContextValue>(() => ({
    toasts,
    showToast,
    dismissToast,
    clearToasts,
    success: (titleOrMessage, messageOrOptions, options) =>
      toast.success(titleOrMessage, messageOrOptions, options),
    error: (titleOrMessage, messageOrOptions, options) =>
      toast.error(titleOrMessage, messageOrOptions, options),
    info: (titleOrMessage, messageOrOptions, options) =>
      toast.info(titleOrMessage, messageOrOptions, options),
    warning: (titleOrMessage, messageOrOptions, options) =>
      toast.warning(titleOrMessage, messageOrOptions, options),
  }), [toasts, showToast, dismissToast, clearToasts]);

  return (
    <ToastContext.Provider value={contextValue}>
      {children}
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const context = useContext(ToastContext);
  if (!context) {
    // If used outside provider, return static fallback methods safely
    return {
      toasts: [],
      showToast: toast.show,
      dismissToast: toast.dismiss,
      clearToasts: toast.clear,
      success: toast.success,
      error: toast.error,
      info: toast.info,
      warning: toast.warning,
    };
  }
  return context;
}
