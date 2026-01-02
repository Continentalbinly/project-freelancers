import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Noto_Sans_Lao } from "next/font/google";
import "./globals.css";
import CookieConsent from "./components/CookieConsent";
import LanguageProvider from "./components/LanguageProvider";
import LayoutWrapper from "./components/LayoutWrapper";
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
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
    <html lang="en" className="scroll-smooth" suppressHydrationWarning>
      <head>
        {/* Google AdSense verification */}
        <meta name="google-adsense-account" content="ca-pub-4690643109358058" />
        {/* Theme initialization script to prevent flash */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                const savedTheme = localStorage.getItem('theme');
                const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                const theme = savedTheme ? savedTheme : (prefersDark ? 'dark' : 'light');
                
                if (theme === 'dark') {
                  document.documentElement.classList.add('dark');
                  document.documentElement.style.colorScheme = 'dark';
                } else {
                  document.documentElement.classList.remove('dark');
                  document.documentElement.style.colorScheme = 'light';
                }
              })();
            `,
          }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${notoSansLao.variable} antialiased    min-h-screen flex flex-col`}
      >
        <AuthProvider>
          <ThemeProvider>
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
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
