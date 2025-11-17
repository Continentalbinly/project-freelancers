import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Noto_Sans_Lao } from "next/font/google";
import "./globals.css";
import CookieConsent from "./components/CookieConsent";
import LanguageProvider from "./components/LanguageProvider";
import LayoutWrapper from "./components/LayoutWrapper";
import { AuthProvider } from "@/contexts/AuthContext";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

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

// ✅ Add favicon and manifest info
export const metadata: Metadata = {
  title: "UniJobs - Earn Anywhere Anytimes ",
  description:
    "Join the largest academic freelancing community where everyone can earn anywhere anytimes. Connect with opportunities, build skills, and grow your career.",
  keywords: [
    "freelance",
    "students",
    "teachers",
    "university",
    "work",
    "projects",
  ],
  authors: [{ name: "UniJobs Team" }],
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
  manifest: "/site.webmanifest",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#06A764",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="scroll-smooth light">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${notoSansLao.variable} antialiased bg-background text-text-primary min-h-screen flex flex-col`}
      >
        <AuthProvider>
          <LanguageProvider>
            <LayoutWrapper>{children}</LayoutWrapper>
            <CookieConsent />
            <ToastContainer
              position="top-right"
              autoClose={2500}
              hideProgressBar={false}
              newestOnTop
              closeOnClick
              pauseOnFocusLoss
              draggable
              pauseOnHover
              theme="colored"
            />
          </LanguageProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
