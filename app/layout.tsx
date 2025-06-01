import type { Metadata } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import "./globals.css";
import TrpcProvider from "@/components/TrpcProvider";
import AuthProvider from "@/components/auth-provider";
import { Toaster } from "react-hot-toast";

// Initialize Inter font
const inter = Inter({
  subsets: ["latin"],
  variable: '--font-inter',
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space",
});

export const metadata: Metadata = {
  title: "SkillExchange",
  description: "Skill exchange platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
      <html lang="en">
      <body className={`${inter.variable} ${spaceGrotesk.variable} font-sans`}>
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