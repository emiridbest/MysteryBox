'use client'

import { ThemeProvider } from "../../components/ThemeProvider";

export function ThemeProviderClient({ 
  children 
}: { 
  children: React.ReactNode 
}) {
  return (
    <ThemeProvider>
      {children}
    </ThemeProvider>
  );
}
