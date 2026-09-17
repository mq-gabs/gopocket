"use client";

import { Toaster } from "sonner";
import { useTheme } from "@/contexts/theme-context";

export function AppToaster() {
  const { theme } = useTheme();

  return (
    <Toaster
      position="bottom-right"
      theme={theme}
      richColors
      closeButton
    />
  );
}
