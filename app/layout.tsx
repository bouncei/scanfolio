import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/lib/context/auth-context";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "ScanFolio - QR Code Portfolio Generator",
  description:
    "Create custom QR codes and short URLs for your business portfolio. Track analytics and engage with your audience.",
  keywords: ["QR code", "portfolio", "business", "analytics", "short URL"],
  authors: [{ name: "ScanFolio Team" }],
  viewport: {
    width: "device-width",
    initialScale: 1,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
