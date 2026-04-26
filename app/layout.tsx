import type { Metadata, Viewport } from "next";
import { Inter, Playfair_Display, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";
import { Toaster } from "@/components/ui/toaster";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space",
});

export const metadata: Metadata = {
  title: "Rinbow Aqua | Premium Aquarium Fish & Pets",
  description: "India's #1 destination for premium aquarium fish, pets, and accessories. Live arrival guarantee. Free shipping on orders over ₹2000. Use code AQUAFIRST50 for 25% off!",
  keywords: "aquarium fish, pets, betta fish, arowana, discus, goldfish, dogs, cats, birds, reptiles, pet accessories, pet store India",
  authors: [{ name: "ThisAI Technologies" }],
  creator: "ThisAI Technologies",
  publisher: "Rinbow Aqua",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL("https://rinbowaqua.in"),
  openGraph: {
    title: "Rinbow Aqua | Premium Aquarium Fish & Pets",
    description: "India's #1 destination for premium aquarium fish, pets, and accessories.",
    url: "https://rinbowaqua.in",
    siteName: "Rinbow Aqua",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Rinbow Aqua - Premium Aquarium Fish & Pets",
      },
    ],
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Rinbow Aqua | Premium Aquarium Fish & Pets",
    description: "India's #1 destination for premium aquarium fish and pets.",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  manifest: "/manifest.json",
  icons: {
    icon: "/icons/icon-192x192.png",
    shortcut: "/favicon-16x16.png",
    apple: "/apple-touch-icon.png",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#0c0c1e" },
    { media: "(prefers-color-scheme: dark)", color: "#0c0c1e" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className={`${inter.variable} ${playfair.variable} ${spaceGrotesk.variable} font-sans antialiased`}>
        <Providers>
          {children}
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
