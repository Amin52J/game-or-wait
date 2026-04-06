import type { Metadata } from "next";
import StyledComponentsRegistry from "@/app/providers/StyledComponentsRegistry";
import QueryProvider from "@/app/providers/QueryProvider";
import { AppProvider } from "@/app/providers/AppProvider";
import { AppShell } from "@/widgets/app-shell";

export const metadata: Metadata = {
  title: "GameFit — Personalized Game Analysis",
  description: "AI-powered game recommendation engine based on your personal taste",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <StyledComponentsRegistry>
          <QueryProvider>
            <AppProvider>
              <AppShell>{children}</AppShell>
            </AppProvider>
          </QueryProvider>
        </StyledComponentsRegistry>
      </body>
    </html>
  );
}
