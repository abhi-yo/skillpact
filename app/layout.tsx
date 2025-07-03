import type { Metadata } from "next";
import localFont from 'next/font/local';
import "./globals.css";
import TrpcProvider from "@/components/TrpcProvider";
import AuthProvider from "@/components/auth-provider";
import { Toaster } from "react-hot-toast";

const satoshi = localFont({
  src: [
    {
      path: './fonts/Satoshi_Complete/Fonts/WEB/fonts/Satoshi-Variable.woff2',
      style: 'normal',
    },
    {
      path: './fonts/Satoshi_Complete/Fonts/WEB/fonts/Satoshi-VariableItalic.woff2',
      style: 'italic',
    },
  ],
  variable: '--font-satoshi',
  display: 'swap',
});

export const metadata: Metadata = {
  title: "Skillpact",
  description: "Credit-based skill exchange platform where neighbors help neighbors",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
      <html lang="en" className={`${satoshi.variable}`}>
      <body className="font-sans">
        <AuthProvider>
          <TrpcProvider>
            {children}
          </TrpcProvider>
        </AuthProvider>
        <Toaster position="top-right" />
        </body>
      </html>
  );
} 