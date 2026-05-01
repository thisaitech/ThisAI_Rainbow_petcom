"use client";

import { useEffect } from "react";

export default function ServiceWorkerRegistration() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) {
      return;
    }

    let updateInterval: ReturnType<typeof setInterval> | undefined;
    let hasReloadedForUpdate = false;
    const isStaticExportBuild = process.env.NEXT_PUBLIC_STATIC_EXPORT === "true";
    const clearServiceWorkersAndCaches = async () => {
      const registrations = await navigator.serviceWorker.getRegistrations();
      await Promise.all(registrations.map((registration) => registration.unregister()));

      if ("caches" in window) {
        const cacheNames = await window.caches.keys();
        await Promise.all(cacheNames.map((cacheName) => window.caches.delete(cacheName)));
      }
    };

    const activateWaitingWorker = (registration: ServiceWorkerRegistration) => {
      if (registration.waiting) {
        registration.waiting.postMessage({ type: "SKIP_WAITING" });
      }
    };

    const attachUpdateHandlers = (registration: ServiceWorkerRegistration) => {
      registration.addEventListener("updatefound", () => {
        const installingWorker = registration.installing;
        if (!installingWorker) {
          return;
        }

        installingWorker.addEventListener("statechange", () => {
          if (installingWorker.state === "installed" && navigator.serviceWorker.controller) {
            activateWaitingWorker(registration);
          }
        });
      });

      activateWaitingWorker(registration);
    };

    const syncServiceWorker = async () => {
      const isLocalhost =
        window.location.hostname === "localhost" ||
        window.location.hostname === "127.0.0.1" ||
        window.location.hostname === "[::1]";

      if (process.env.NODE_ENV !== "production" || isLocalhost || isStaticExportBuild) {
        await clearServiceWorkersAndCaches();

        console.log(
          isStaticExportBuild
            ? "Service workers disabled for static export hosting."
            : "Service workers disabled on local development hosts."
        );
        return;
      }

      const registration = await navigator.serviceWorker.register("/sw.js");
      attachUpdateHandlers(registration);

      navigator.serviceWorker.addEventListener("controllerchange", () => {
        if (hasReloadedForUpdate) {
          return;
        }

        hasReloadedForUpdate = true;
        window.location.reload();
      });

      console.log("Rinbow Aqua SW registered:", registration.scope);

      updateInterval = setInterval(() => {
        registration
          .update()
          .then(() => activateWaitingWorker(registration))
          .catch(() => {});
      }, 60 * 60 * 1000);
    };

    syncServiceWorker().catch((error) => {
      console.log("Service worker setup failed:", error);
    });

    return () => {
      if (updateInterval) {
        clearInterval(updateInterval);
      }
    };
  }, []);

  return null;
}

