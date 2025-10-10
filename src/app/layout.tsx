import type { Metadata } from "next";
import { Geist, Geist_Mono, Noto_Sans_Lao } from "next/font/google";
import "./globals.css";
import CookieConsent from "./components/CookieConsent";
import LanguageProvider from "./components/LanguageProvider";
import LayoutWrapper from "./components/LayoutWrapper";
import { AuthProvider } from "@/contexts/AuthContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const notoSansLao = Noto_Sans_Lao({
  variable: "--font-noto-sans-lao",
  subsets: ["lao"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "UniJobs - Where Students Earn & Learn",
  description: "Join the largest academic freelancing community where students earn money while gaining real-world experience. Connect with opportunities, build skills, and grow your career.",
  keywords: ["freelance", "students", "teachers", "university", "work", "projects"],
  authors: [{ name: "UniJobs Team" }],
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: "#06A764",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth light">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${notoSansLao.variable} antialiased bg-background text-text-primary min-h-screen flex flex-col`}
      >
        <AuthProvider>
          <LanguageProvider>
            <LayoutWrapper>
              {children}
            </LayoutWrapper>
            <CookieConsent />
          </LanguageProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
