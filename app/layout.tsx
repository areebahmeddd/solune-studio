import { AuthProvider } from "@/hooks/use-auth";
import { Analytics } from "@vercel/analytics/next";
import type { Metadata } from "next";
import type React from "react";
import { Toaster } from "sonner";
import "./globals.css";

export const metadata: Metadata = {
  title: "Solune Studio",
  description: "Salon management dashboard for solune studio",
  icons: {
    icon: "/icons/logo.svg",
    shortcut: "/icons/logo.svg",
    apple: "/icons/logo.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`font-sans antialiased`}>
        <AuthProvider>
          {children}
          <Toaster position="top-center" richColors />
        </AuthProvider>
        <Analytics />
      </body>
    </html>
  );
}
