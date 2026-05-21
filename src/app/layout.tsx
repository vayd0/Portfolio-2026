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
  metadataBase: new URL("https://www.theoheck.fr"),
  title: {
    default: "Théo Heck — Designer & Développeur",
    template: "%s — Théo Heck",
  },
  description: "Portfolio de Théo Heck, designer & développeur freelance basé en France. Projets interactifs, design et expériences digitales.",
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "fr_FR",
    url: "https://www.theoheck.fr",
    siteName: "Théo Heck",
    title: "Théo Heck — Designer & Développeur",
    description: "Portfolio de Théo Heck, designer & développeur freelance basé en France.",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "Théo Heck" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Théo Heck — Designer & Développeur",
    description: "Portfolio de Théo Heck, designer & développeur freelance basé en France.",
    images: ["/og-image.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="fr"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body>
        <Script id="scroll-restoration" strategy="beforeInteractive">{`history.scrollRestoration='manual';window.scrollTo(0,0);`}</Script>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Person",
              name: "Théo Heck",
              url: "https://www.theoheck.fr",
              jobTitle: "Designer & Développeur",
              sameAs: [],
            }),
          }}
        />
        <LoadingScreen />
        <Navbar />
        <ContactDrawer />
        <main>{children}</main>
      </body>
    </html>
  );
}
