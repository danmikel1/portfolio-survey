"use client";

import { useEffect, useRef } from "react";
import { TURNSTILE_EXPECTED_ACTION } from "@/lib/turnstile";

declare global {
  interface Window {
    turnstile?: {
      render: (
        container: HTMLElement,
        options: {
          sitekey: string;
          action?: string;
          theme?: "light" | "dark" | "auto";
          callback?: (token: string) => void;
          "expired-callback"?: () => void;
          "error-callback"?: () => void;
        }
      ) => string;
      remove?: (widgetId: string) => void;
    };
  }
}

interface TurnstileWidgetProps {
  onTokenChange: (token: string) => void;
}

const SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? "";

export function TurnstileWidget({ onTokenChange }: TurnstileWidgetProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const widgetIdRef = useRef<string | null>(null);
  const callbackRef = useRef(onTokenChange);

  useEffect(() => {
    callbackRef.current = onTokenChange;
  }, [onTokenChange]);

  useEffect(() => {
    if (!SITE_KEY || !containerRef.current) return;

    let cancelled = false;

    const renderWidget = () => {
      if (cancelled || !containerRef.current || !window.turnstile) return;
      if (widgetIdRef.current) return;

      widgetIdRef.current = window.turnstile.render(containerRef.current, {
        sitekey: SITE_KEY,
        action: TURNSTILE_EXPECTED_ACTION,
        theme: "light",
        callback: (token) => callbackRef.current(token),
        "expired-callback": () => callbackRef.current(""),
        "error-callback": () => callbackRef.current(""),
      });
    };

    if (window.turnstile) {
      renderWidget();
    } else {
      const existingScript = document.querySelector<HTMLScriptElement>(
        'script[src*="challenges.cloudflare.com/turnstile/v0/api.js"]'
      );
      if (existingScript) {
        existingScript.addEventListener("load", renderWidget, { once: true });
      } else {
        const script = document.createElement("script");
        script.src =
          "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
        script.async = true;
        script.defer = true;
        script.addEventListener("load", renderWidget, { once: true });
        document.head.appendChild(script);
      }
    }

    return () => {
      cancelled = true;
      if (widgetIdRef.current && window.turnstile?.remove) {
        window.turnstile.remove(widgetIdRef.current);
        widgetIdRef.current = null;
      }
    };
  }, []);

  if (!SITE_KEY) {
    return (
      <div className="rounded-md border border-[#D4D1C7] bg-[#ECEBE6] px-3.5 py-2.5 text-xs text-[#595D68]">
        Cloudflare Turnstile is not configured in this local environment. Set{" "}
        <code className="font-mono">NEXT_PUBLIC_TURNSTILE_SITE_KEY</code> for production
        bot protection.
      </div>
    );
  }

  return <div ref={containerRef} className="min-h-[65px]" />;
}
