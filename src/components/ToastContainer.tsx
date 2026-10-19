import React, { useEffect, useRef, useState } from "react";
import { AlertCircle, AlertTriangle, CheckCircle2, Info, X } from "lucide-react";
import { ToastItem, useToast } from "../context/ToastContext";

interface SingleToastProps {
  key?: React.Key;
  toast: ToastItem;
  onDismiss: (id: string) => void;
}

function SingleToast({ toast, onDismiss }: SingleToastProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [progress, setProgress] = useState(100);
  const remainingTimeRef = useRef(toast.duration);
  const lastTickRef = useRef<number>(Date.now());
  const dismissTimerRef = useRef<number | null>(null);

  useEffect(() => {
    if (toast.duration <= 0) return;

    lastTickRef.current = Date.now();
    const intervalTime = 25;

    const interval = window.setInterval(() => {
      if (isHovered) {
        lastTickRef.current = Date.now();
        return;
      }

      const now = Date.now();
      const elapsed = now - lastTickRef.current;
      lastTickRef.current = now;

      remainingTimeRef.current = Math.max(0, remainingTimeRef.current - elapsed);
      setProgress((remainingTimeRef.current / toast.duration) * 100);

      if (remainingTimeRef.current <= 0) {
        window.clearInterval(interval);
        onDismiss(toast.id);
      }
    }, intervalTime);

    return () => {
      window.clearInterval(interval);
      if (dismissTimerRef.current) window.clearTimeout(dismissTimerRef.current);
    };
  }, [toast.id, toast.duration, isHovered, onDismiss]);

  const typeConfig = {
    success: {
      icon: CheckCircle2,
      borderColor: "border-emerald-500/30",
      accentBg: "bg-emerald-50 dark:bg-emerald-950/60",
      iconColor: "text-[#0B5D3B] dark:text-emerald-400",
      progressBg: "bg-gradient-to-r from-emerald-500 to-[#0B5D3B]",
      tagText: "Success",
      tagColor: "text-emerald-700 dark:text-emerald-300",
    },
    error: {
      icon: AlertCircle,
      borderColor: "border-rose-500/30",
      accentBg: "bg-rose-50 dark:bg-rose-950/60",
      iconColor: "text-rose-600 dark:text-rose-400",
      progressBg: "bg-rose-500",
      tagText: "Notice",
      tagColor: "text-rose-700 dark:text-rose-300",
    },
    warning: {
      icon: AlertTriangle,
      borderColor: "border-amber-500/30",
      accentBg: "bg-amber-50 dark:bg-amber-950/60",
      iconColor: "text-amber-600 dark:text-amber-400",
      progressBg: "bg-amber-500",
      tagText: "Attention",
      tagColor: "text-amber-700 dark:text-amber-300",
    },
    info: {
      icon: Info,
      borderColor: "border-sky-500/30",
      accentBg: "bg-sky-50 dark:bg-sky-950/60",
      iconColor: "text-sky-600 dark:text-sky-400",
      progressBg: "bg-sky-500",
      tagText: "Information",
      tagColor: "text-sky-700 dark:text-sky-300",
    },
  }[toast.type];

  const Icon = typeConfig.icon;

  return (
    <div
      role={toast.type === "error" ? "alert" : "status"}
      aria-live={toast.type === "error" ? "assertive" : "polite"}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`pointer-events-auto relative w-full overflow-hidden rounded-2xl border ${typeConfig.borderColor} bg-white/95 dark:bg-slate-900/95 text-slate-800 dark:text-slate-100 shadow-xl shadow-slate-950/10 backdrop-blur-md transition-all duration-300 hover:shadow-2xl focus-within:ring-2 focus-within:ring-[#0B5D3B]`}
      style={{
        animation: "toastSlideIn 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards",
      }}
    >
      <div className="flex items-start gap-3.5 p-4 sm:p-4.5">
        <div
          className={`shrink-0 rounded-xl p-2 ${typeConfig.accentBg} ${typeConfig.iconColor} transition-transform duration-200`}
        >
          <Icon className="h-5 w-5" aria-hidden="true" />
        </div>

        <div className="min-w-0 flex-1 pt-0.5">
          <div className="flex items-baseline gap-2">
            <span className={`text-[10px] font-black uppercase tracking-wider ${typeConfig.tagColor}`}>
              {typeConfig.tagText}
            </span>
            {toast.title && (
              <h4 className="truncate text-xs sm:text-sm font-black text-slate-900 dark:text-white">
                {toast.title}
              </h4>
            )}
          </div>

          <p className="mt-1 text-xs leading-relaxed text-slate-600 dark:text-slate-300">
            {toast.message}
          </p>

          {toast.action && (
            <div className="mt-2.5 pt-1">
              <button
                type="button"
                onClick={() => {
                  toast.action?.onClick();
                  onDismiss(toast.id);
                }}
                className="inline-flex items-center gap-1.5 rounded-lg bg-[#0B5D3B] px-3 py-1.5 text-[11px] font-bold text-white transition hover:bg-[#07472c] focus:outline-none focus:ring-2 focus:ring-[#0B5D3B]/40 cursor-pointer"
              >
                {toast.action.label}
              </button>
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={() => onDismiss(toast.id)}
          aria-label="Dismiss notification"
          className="shrink-0 -mr-1 -mt-1 grid h-7 w-7 place-items-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0B5D3B] cursor-pointer"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {toast.duration > 0 && (
        <div className="h-1 w-full bg-slate-100 dark:bg-slate-800/80">
          <div
            className={`h-full ${typeConfig.progressBg} transition-[width] duration-75 ease-linear`}
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
    </div>
  );
}

export function ToastContainer() {
  const { toasts, dismissToast } = useToast();

  if (toasts.length === 0) return null;

  return (
    <>
      <style>{`
        @keyframes toastSlideIn {
          from {
            opacity: 0;
            transform: translate3d(0, -14px, 0) scale(0.96);
          }
          to {
            opacity: 1;
            transform: translate3d(0, 0, 0) scale(1);
          }
        }
        @media (prefers-reduced-motion: reduce) {
          @keyframes toastSlideIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
        }
      `}</style>
      <aside
        aria-label="Notifications"
        className="fixed top-4 right-4 sm:top-6 sm:right-6 z-[9999] pointer-events-none flex flex-col gap-2.5 w-[calc(100%-2rem)] max-w-sm sm:max-w-md"
      >
        {toasts.map((item) => (
          <SingleToast key={item.id} toast={item} onDismiss={dismissToast} />
        ))}
      </aside>
    </>
  );
}
