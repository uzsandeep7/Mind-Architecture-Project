import { useState } from "react";
import { MessageCircle } from "lucide-react";

declare global {
  interface Window {
    Tawk_API?: any;
    Tawk_LoadStart?: Date;
  }
}

export default function ChatWidget() {
  const [loading, setLoading] = useState(false);
  const [loaded, setLoaded] = useState(false);

  const loadChat = () => {
    const existingScript = document.getElementById("tawk-script");
    if (existingScript) {
      window.Tawk_API?.showWidget?.();
      window.Tawk_API?.maximize?.();
      return;
    }

    setLoading(true);
    window.Tawk_API = window.Tawk_API || {};
    window.Tawk_LoadStart = new Date();
    window.Tawk_API.onLoad = () => {
      setLoading(false);
      setLoaded(true);
      window.Tawk_API?.showWidget?.();
      window.Tawk_API?.maximize?.();
    };

    const s1 = document.createElement("script");
    const s0 = document.getElementsByTagName("script")[0];

    s1.id = "tawk-script";
    s1.type = "text/javascript";
    s1.async = true;
    s1.src = "https://embed.tawk.to/6968d66405cdea197d14963c/1jf0oauei?v=20260422";
    s1.charset = "UTF-8";
    s1.setAttribute("crossorigin", "*");

    if (s0 && s0.parentNode) {
      s0.parentNode.insertBefore(s1, s0);
    } else {
      document.body.appendChild(s1);
    }
  };

  if (loaded) return null;

  return (
    <button
      type="button"
      onClick={loadChat}
      className="fixed bottom-5 right-5 z-[90] flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-gold transition hover:scale-105 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background"
      aria-label="Open live chat"
    >
      <MessageCircle className="h-7 w-7" />
      {loading && <span className="absolute -top-1 -right-1 h-4 w-4 animate-ping rounded-full bg-primary" />}
    </button>
  );
}
