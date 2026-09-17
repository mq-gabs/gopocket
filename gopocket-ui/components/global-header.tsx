import { LanguageSwitcher } from "./language-switcher";
import { NotificationBell } from "./notification-bell";
import SeparatorVert from "./separators/separator-vert";
import { ThemeToggle } from "./theme-toggle";

export function GlobalHeader() {
  return (
    <header className="flex items-center justify-end gap-1 border-b border-foreground/10 bg-background px-3 py-2 backdrop-blur">
      <NotificationBell />
      <SeparatorVert />
      <ThemeToggle />
      <SeparatorVert />
      <LanguageSwitcher />
    </header>
  );
}
