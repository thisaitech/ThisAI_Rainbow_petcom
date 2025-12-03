"use client";

import { ThemeProvider } from "next-themes";
import { ReactNode, Suspense } from "react";
import InitialLoader from "./providers/InitialLoader";
import PageTransitionLoader from "./providers/PageTransitionLoader";
import { MobileBottomNav } from "./mobile-bottom-nav";
import { ChatBot } from "./chatbot/ChatBot";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="light"
      enableSystem
      disableTransitionOnChange
    >
      <InitialLoader>
        <Suspense fallback={null}>
          <PageTransitionLoader />
        </Suspense>
        {children}
        <MobileBottomNav />
        <ChatBot />
      </InitialLoader>
    </ThemeProvider>
  );
}
