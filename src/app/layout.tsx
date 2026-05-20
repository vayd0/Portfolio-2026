import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import LoadingScreen from "@/components/LoadingScreen";
import Navbar from "@/components/Navbar";
import ContactDrawer from "@/components/ContactDrawer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Théo Heck",
  description: "Portfolio de Théo Heck",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body>
        <Script id="scroll-restoration" strategy="beforeInteractive">{`history.scrollRestoration='manual';window.scrollTo(0,0);`}</Script>
        <LoadingScreen />
        <Navbar />
        <ContactDrawer />
        <main>{children}</main>
      </body>
    </html>
  );
}
