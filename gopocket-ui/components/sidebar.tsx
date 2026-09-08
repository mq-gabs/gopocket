"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BanknotesIcon, ChartBarIcon, TagIcon } from "@heroicons/react/24/outline";
import { useI18n } from "@/contexts/i18n-context";
import { Logo } from "./logo";

interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
}

export function Sidebar() {
  const pathname = usePathname();
  const { t } = useI18n();

  const items: NavItem[] = [
    { href: "/", label: t("navigation.dashboard"), icon: ChartBarIcon },
    { href: "/categories", label: t("navigation.categories"), icon: TagIcon },
    {
      href: "/transactions",
      label: t("navigation.transactions"),
      icon: BanknotesIcon,
    },
  ];

  return (
    <aside className="hidden w-60 shrink-0 border-r border-light-gray bg-background p-4 lg:flex lg:flex-col">
      <div className="mb-10">
        <Logo />
      </div>

      <nav className="space-y-2">
        {items.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={`flex text-sm items-center gap-3 rounded-lg px-2 py-2 transition ${
                active
                  ? "bg-primary text-primary-foreground hover:brightness-110"
                  : "hover:bg-light-gray"
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
