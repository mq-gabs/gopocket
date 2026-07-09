import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Sidebar } from "@/components/sidebar";
import { ThemeToggle } from "@/components/theme-toggle";
import { LanguageSwitcher } from "@/components/language-switcher";
import { I18nProvider } from "@/contexts/i18n-context";
import { ThemeProvider } from "@/contexts/theme-context";
import "./globals.css";
import { GlobalHeader } from "@/components/global-header";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "GoPocket",
  description: "Personal finance dashboard",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${inter} h-full antialiased`}>
      <body className="min-h-full bg-base-100 text-base-content">
        <ThemeProvider>
          <I18nProvider>
            <div className="flex min-h-screen">
              <Sidebar />
              <div className="flex min-h-screen flex-1 flex-col">
                <GlobalHeader />
                <main className="flex-1 p-6">{children}</main>
              </div>
            </div>
          </I18nProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
