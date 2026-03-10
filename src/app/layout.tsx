import type { Metadata } from "next";
import { Geist, Geist_Mono, Inter, Outfit } from "next/font/google";
import { cookies } from "next/headers";
import Script from "next/script";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import ApolloWrapper from "@/app/ApolloWrapper";
import ScrollToTop from "@/components/ScrollToTop";
import BottomBar from "@/components/BottomBar";
import "./globals.css";

const outfit = Outfit({ subsets: ["latin"], variable: "--font-sans" });

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Harshit Pandit",
  description: "Software Engineer with a passion for building scalable and efficient applications. Experienced in full-stack development, cloud computing, and DevOps practices. Always eager to learn new technologies and improve my skills.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const cookieTheme = cookieStore.get("theme")?.value;
  const initialTheme =
    cookieTheme === "light" || cookieTheme === "dark" ? cookieTheme : undefined;

  return (
    <html
      lang="en"
      className={`${outfit.variable}${initialTheme ? ` ${initialTheme}` : ""}`}
      suppressHydrationWarning
    >
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${inter.variable} antialiased`}
      >
        <Script id="theme-init" strategy="beforeInteractive">{`
          (function() {
            try {
              var stored = localStorage.getItem("theme");
              var cookieTheme = document.cookie
                .split("; ")
                .find(function(row) { return row.startsWith("theme="); });
              var cookieValue = cookieTheme ? cookieTheme.split("=")[1] : null;
              var prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
              var theme = stored === "light" || stored === "dark"
                ? stored
                : (cookieValue === "light" || cookieValue === "dark"
                  ? cookieValue
                  : (prefersDark ? "dark" : "light"));
              document.documentElement.classList.remove("light", "dark");
              document.documentElement.classList.add(theme);
            } catch (e) {}
          })();
        `}</Script>
        <ApolloWrapper>
          {children}    
        </ApolloWrapper>
        <BottomBar initialTheme={initialTheme} />
        <ScrollToTop />
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
