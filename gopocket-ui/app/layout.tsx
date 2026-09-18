import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Sidebar } from "@/components/sidebar";
import { I18nProvider } from "@/contexts/i18n-context";
import { ThemeProvider } from "@/contexts/theme-context";
import { CategoryProvider } from "@/contexts/category-context";
import { NotificationProvider } from "@/contexts/notification-context";
import "./globals.css";
import { GlobalHeader } from "@/components/global-header";
import { AppToaster } from "@/components/app-toaster";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "GoPocket",
  description: "Personal finance dashboard",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${inter.className} h-full antialiased`}>
      <body className="min-h-full bg-background text-foreground">
        <ThemeProvider>
          <I18nProvider>
            <CategoryProvider>
              <NotificationProvider>
                <div className="flex min-h-screen max-h-screen">
                  <Sidebar />
                  <div className="flex min-h-screen max-h-screen flex-1 flex-col overflow-y-auto">
                    <GlobalHeader />
                    <main className="flex-1 p-4">{children}</main>
                  </div>
                </div>
                <AppToaster />
              </NotificationProvider>
            </CategoryProvider>
          </I18nProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
