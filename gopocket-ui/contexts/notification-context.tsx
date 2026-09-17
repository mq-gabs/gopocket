"use client";

import { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { getApiBaseUrl } from "@/services/http-client";
import { useI18n } from "./i18n-context";

export type ImportNotification = {
  id: string;
  status: "processing" | "completed";
  processed: number;
  total: number;
  success: number;
  failed: number;
};

interface ImportProgressData {
  job_id: string;
  processed: number;
  total: number;
}

interface ImportCompletedData {
  job_id: string;
  total: number;
  success: number;
  failed: number;
}

interface NotificationContextValue {
  notifications: ImportNotification[];
  activeCount: number;
}

const NotificationContext = createContext<NotificationContextValue | undefined>(
  undefined,
);

const WS_RECONNECT_DELAY_MS = 3000;

const resolveWsUrl = (): string =>
  `${getApiBaseUrl().replace(/^http/, "ws")}/api/ws`;

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const { t } = useI18n();
  const [notifications, setNotifications] = useState<ImportNotification[]>([]);

  // Read inside the socket handler without retriggering the connect effect
  // whenever the locale (and therefore t) changes.
  const translateRef = useRef(t);
  useEffect(() => {
    translateRef.current = t;
  }, [t]);

  useEffect(() => {
    let cancelled = false;
    let socket: WebSocket | null = null;
    let reconnectTimer: ReturnType<typeof setTimeout>;

    const notifyCompletion = (data: ImportCompletedData) => {
      const translate = translateRef.current;
      const message = `${data.success} ${translate("notifications.import.succeededSuffix")}, ${data.failed} ${translate("notifications.import.failedSuffix")}`;

      if (data.failed === 0) {
        toast.success(message);
      } else if (data.success === 0) {
        toast.error(message);
      } else {
        toast(message);
      }
    };

    const handleMessage = (event: MessageEvent<string>) => {
      let parsed: { type: string; data: unknown };
      try {
        parsed = JSON.parse(event.data);
      } catch {
        return;
      }

      if (parsed.type === "transactions.import.progress") {
        const data = parsed.data as ImportProgressData;
        setNotifications((prev) => {
          const existing = prev.find((n) => n.id === data.job_id);
          const entry: ImportNotification = {
            id: data.job_id,
            status: "processing",
            processed: data.processed,
            total: data.total,
            success: existing?.success ?? 0,
            failed: existing?.failed ?? 0,
          };
          return upsert(prev, entry);
        });
      } else if (parsed.type === "transactions.import.completed") {
        const data = parsed.data as ImportCompletedData;
        setNotifications((prev) =>
          upsert(prev, {
            id: data.job_id,
            status: "completed",
            processed: data.total,
            total: data.total,
            success: data.success,
            failed: data.failed,
          }),
        );
        notifyCompletion(data);
      }
    };

    const connect = () => {
      if (cancelled) return;
      socket = new WebSocket(resolveWsUrl());
      socket.onmessage = handleMessage;
      socket.onclose = () => {
        if (!cancelled) {
          reconnectTimer = setTimeout(connect, WS_RECONNECT_DELAY_MS);
        }
      };
    };

    connect();

    return () => {
      cancelled = true;
      clearTimeout(reconnectTimer);
      socket?.close();
    };
  }, []);

  const activeCount = useMemo(
    () => notifications.filter((n) => n.status === "processing").length,
    [notifications],
  );

  const value = useMemo<NotificationContextValue>(
    () => ({ notifications, activeCount }),
    [notifications, activeCount],
  );

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}

function upsert(
  notifications: ImportNotification[],
  entry: ImportNotification,
): ImportNotification[] {
  const index = notifications.findIndex((n) => n.id === entry.id);
  if (index === -1) {
    return [entry, ...notifications];
  }
  const next = [...notifications];
  next[index] = entry;
  return next;
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error("useNotifications must be used within NotificationProvider");
  }
  return context;
}
