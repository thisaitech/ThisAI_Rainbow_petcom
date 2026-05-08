import type { Metadata, Viewport } from "next";
import { Inter, Playfair_Display, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";
import { Toaster } from "@/components/ui/toaster";

const liveServerGuardScript = `
(() => {
  if (typeof window === "undefined") return;
  const isStaticExportBuild = ${process.env.NEXT_PUBLIC_STATIC_EXPORT === "true" ? "true" : "false"};
  const assetRecoveryKey = "rinbow-asset-recovery-attempted";

  const appendOverlay = (title, description, detail) => {
    if (document.getElementById("live-server-fallback")) return;

    const overlay = document.createElement("div");
    overlay.id = "live-server-fallback";
    overlay.setAttribute(
      "style",
      "position:fixed;inset:0;z-index:999999;display:flex;align-items:center;justify-content:center;padding:24px;background:linear-gradient(135deg,#eff6ff 0%,#ffffff 45%,#ecfdf5 100%);font-family:Inter,system-ui,sans-serif;color:#0f172a;text-align:center;"
    );
    overlay.innerHTML =
      '<div style="max-width:460px;width:100%;background:#ffffff;border:1px solid rgba(148,163,184,0.2);border-radius:24px;padding:32px;box-shadow:0 25px 50px rgba(15,23,42,0.12)">' +
      '<div style="font-size:48px;line-height:1;margin-bottom:16px">\\\\u26A0\\\\uFE0F</div>' +
      '<h1 style="margin:0 0 12px;font-size:28px;font-weight:700;color:#0f172a">' + title + '</h1>' +
      '<p style="margin:0 0 12px;font-size:15px;line-height:1.6;color:#475569">' + description + '</p>' +
      '<p style="margin:0 0 24px;font-size:14px;line-height:1.6;color:#64748b">' + detail + '</p>' +
      '<div style="display:flex;gap:12px;justify-content:center;flex-wrap:wrap">' +
      '<button onclick="window.location.reload()" style="border:0;border-radius:12px;padding:12px 18px;background:#0f172a;color:#ffffff;font-size:14px;font-weight:600;cursor:pointer">Retry</button>' +
      '<button onclick="window.__rinbowHardRefresh && window.__rinbowHardRefresh()" style="border:0;border-radius:12px;padding:12px 18px;background:#f97316;color:#ffffff;font-size:14px;font-weight:600;cursor:pointer">Clear Cache And Reload</button>' +
      '</div>' +
      "</div>";

    const mountOverlay = () => {
      if (document.body) {
        document.body.appendChild(overlay);
        return;
      }

      window.requestAnimationFrame(mountOverlay);
    };

    mountOverlay();
  };

  const clearSiteData = () => {
    const cachePromise =
      "caches" in window
        ? caches.keys().then((cacheNames) => Promise.all(cacheNames.map((cacheName) => caches.delete(cacheName))))
        : Promise.resolve();
    const workerPromise =
      "serviceWorker" in navigator
        ? navigator.serviceWorker.getRegistrations().then((registrations) => Promise.all(registrations.map((registration) => registration.unregister())))
        : Promise.resolve();

    return Promise.all([cachePromise, workerPromise]);
  };

  const reloadWithCacheBust = () => {
    const nextUrl = new URL(window.location.href);
    nextUrl.searchParams.set("__rinbow_refresh", Date.now().toString());
    window.location.replace(nextUrl.toString());
  };

  window.__rinbowHardRefresh = () => {
    sessionStorage.removeItem(assetRecoveryKey);
    clearSiteData().finally(reloadWithCacheBust);
  };

  window.addEventListener("error", (event) => {
    const message = String(event.message || "");
    const filename = String(event.filename || "");
    const isChunkParseError =
      message.includes("Invalid or unexpected token") &&
      (filename.includes("/_next/static/") || filename.includes("/_next/"));

    if (isChunkParseError) {
      event.preventDefault();
      clearSiteData().finally(reloadWithCacheBust);
    }
  });

  const attemptAssetRecovery = () => {
    if (sessionStorage.getItem(assetRecoveryKey) === "1") {
      appendOverlay(
        "Static Assets Missing",
        "This page loaded without its latest CSS or JavaScript files.",
        "The server may still be serving an incomplete deployment. Upload the full build, including the _next folder, then reload."
      );
      return;
    }

    sessionStorage.setItem(assetRecoveryKey, "1");
    clearSiteData().finally(reloadWithCacheBust);
  };

  const controller = typeof AbortController !== "undefined" ? new AbortController() : null;
  const timeoutId = window.setTimeout(() => {
    if (controller) {
      controller.abort();
    }
  }, 5000);

  fetch("/connection-check.txt?ts=" + Date.now(), {
    cache: "no-store",
    signal: controller ? controller.signal : undefined,
  })
    .then((response) => {
      window.clearTimeout(timeoutId);
      if (!response.ok) {
        throw new Error("Connection check failed");
      }
    })
    .catch(() => {
      window.clearTimeout(timeoutId);
      appendOverlay(
        "Live Server Not Responding",
        "This page may be an older cached copy. The production server is not responding with the latest files right now.",
        "Try a normal reload first. If that does not help, clear the site cache and reload."
      );
    });

  const stylesheetLinks = Array.from(
    document.querySelectorAll('link[rel="stylesheet"][href*="/_next/static/css/"]')
  );
  const chunkScripts = Array.from(
    document.querySelectorAll('script[src*="/_next/static/chunks/"]')
  );

  const attachAssetErrorHandlers = (elements) => {
    elements.forEach((element) => {
      element.addEventListener(
        "error",
        () => {
          if (isStaticExportBuild) {
            attemptAssetRecovery();
          }
        },
        { once: true }
      );
    });
  };

  attachAssetErrorHandlers(stylesheetLinks);
  attachAssetErrorHandlers(chunkScripts);

  window.addEventListener("load", () => {
    window.setTimeout(() => {
      const loadedStylesheets = Array.from(document.styleSheets).filter(
        (sheet) => sheet.href && sheet.href.includes("/_next/static/css/")
      );

      if (stylesheetLinks.length > 0 && loadedStylesheets.length === 0) {
        if (isStaticExportBuild) {
          attemptAssetRecovery();
        } else {
          appendOverlay(
            "Static Assets Missing",
            "This page loaded without its latest CSS files.",
            "The deployment may be incomplete. Upload the full build, including the _next folder, then reload."
          );
        }
        return;
      }

      sessionStorage.removeItem(assetRecoveryKey);
    }, 1200);
  });
})();
`;

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
  metadataBase: new URL("https://petshop.thisaitech.com"),
  openGraph: {
    title: "Rinbow Aqua | Premium Aquarium Fish & Pets",
    description: "India's #1 destination for premium aquarium fish, pets, and accessories.",
    url: "https://petshop.thisaitech.com",
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
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
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
        <script dangerouslySetInnerHTML={{ __html: liveServerGuardScript }} />
      </head>
      <body suppressHydrationWarning className={`${inter.variable} ${playfair.variable} ${spaceGrotesk.variable} font-sans antialiased`}>
        <Providers>
          {children}
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
