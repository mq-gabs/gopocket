"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BanknotesIcon, TagIcon } from "@heroicons/react/24/outline";
import { useI18n } from "@/contexts/i18n-context";
import { useTheme } from "@/contexts/theme-context";

interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
}

export function Sidebar() {
  const pathname = usePathname();
  const { t } = useI18n();
  const { theme } = useTheme();

  const items: NavItem[] = [
    { href: "/categories", label: t("navigation.categories"), icon: TagIcon },
    { href: "/transactions", label: t("navigation.transactions"), icon: BanknotesIcon },
  ];

  return (
    <aside className="hidden w-72 shrink-0 border-r border-base-300 bg-base-100/80 p-6 lg:flex lg:flex-col">
      <div className="mb-10">
        <p className="text-sm uppercase tracking-[0.3em] text-primary">{t("app.title")}</p>
        <h2 className="mt-2 text-xl font-semibold text-base-content">{t("app.subtitle")}</h2>
      </div>

      <nav className="space-y-2">
        {items.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 rounded-2xl px-4 py-3 transition ${
                active
                  ? "bg-primary text-primary-content shadow-lg"
                  : theme === "dark"
                    ? "text-base-200 hover:bg-base-200/10"
                    : "text-base-content hover:bg-base-200"
              }`}
            >
              <Icon className="h-5 w-5" />
              <span className="font-medium">{label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
