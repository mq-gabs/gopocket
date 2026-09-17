"use client";

import { Fragment } from "react";
import { BellIcon } from "@heroicons/react/24/outline";
import { useI18n } from "@/contexts/i18n-context";
import { useNotifications } from "@/contexts/notification-context";

export function NotificationBell() {
  const { t } = useI18n();
  const { notifications, activeCount } = useNotifications();

  return (
    <div className="dropdown dropdown-end dropdown-hover">
      <button
        type="button"
        tabIndex={0}
        aria-label={t("notifications.title")}
        className="relative flex items-center justify-center rounded-lg p-1.5 text-foreground hover:bg-light-gray/50"
      >
        <BellIcon className="h-5 w-5" />
        {activeCount > 0 && (
          <span className="badge bg-primary badge-xs absolute -top-1 -right-1">
            {activeCount}
          </span>
        )}
      </button>

      <ul
        tabIndex={-1}
        className="menu dropdown-content z-10 mt-1 w-72 rounded-xl border border-foreground/10 bg-background p-2 text-sm shadow-md"
      >
        <li className="px-2 py-1 text-xs font-semibold text-foreground/60">
          {t("notifications.title")}
        </li>

        {notifications.length === 0 ? (
          <li className="px-2 py-3 text-foreground/60">
            {t("notifications.empty")}
          </li>
        ) : (
          notifications.map((notification) => (
            <Fragment key={notification.id}>
              <li className="px-2 pt-2">
                <p className="font-medium">
                  {t("notifications.import.nubank")}
                </p>
              </li>
              {notification.status === "processing" ? (
                <progress
                  className="progress bg-secondary w-full"
                  value={notification.processed}
                  max={Math.max(notification.total, 1)}
                ></progress>
              ) : (
                <li className="px-2 pb-2">
                  <p className="text-xs text-foreground/60">
                    {notification.success}{" "}
                    {t("notifications.import.succeededSuffix")},{" "}
                    {notification.failed}{" "}
                    {t("notifications.import.failedSuffix")}
                  </p>
                </li>
              )}
            </Fragment>
          ))
        )}
      </ul>
    </div>
  );
}
