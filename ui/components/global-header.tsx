import { LanguageSwitcher } from "./language-switcher";
import { ThemeToggle } from "./theme-toggle";

export function GlobalHeader() {
    return (
        <header className="flex items-center justify-end gap-3 border-b border-base-300 bg-base-100/80 px-3 py-2 backdrop-blur">
            <ThemeToggle />
            <LanguageSwitcher />
        </header>
    )
}