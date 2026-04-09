import { useEffect, useState } from "react";
import { MessageCircle } from "lucide-react";

declare global {
  interface Window {
    Tawk_API?: any;
    Tawk_LoadStart?: Date;
  }
}

export default function ChatWidget() {
  const [shouldLoadChat, setShouldLoadChat] = useState(false);

  useEffect(() => {
    if (!shouldLoadChat) return;

    if (document.getElementById("tawk-script")) {
      window.Tawk_API?.showWidget?.();
      window.Tawk_API?.maximize?.();
      return;
    }

    window.Tawk_API = window.Tawk_API || {};
    window.Tawk_LoadStart = new Date();
    window.Tawk_API.onLoad = () => {
      window.Tawk_API?.showWidget?.();
      window.Tawk_API?.maximize?.();
    };

    const s1 = document.createElement("script");
    const s0 = document.getElementsByTagName("script")[0];

    s1.id = "tawk-script";
    s1.type = "text/javascript";
    s1.async = true;
    s1.src = "https://embed.tawk.to/6968d6b754ac551981db7bbc/1jf0odffr";
    s1.charset = "UTF-8";
    s1.setAttribute("crossorigin", "*");

    if (s0 && s0.parentNode) {
      s0.parentNode.insertBefore(s1, s0);
    } else {
      document.body.appendChild(s1);
    }
  }, [shouldLoadChat]);

  if (shouldLoadChat) {
    return null;
  }

  return (
    <button
      type="button"
      onClick={() => setShouldLoadChat(true)}
      className="fixed bottom-6 right-6 z-40 inline-flex items-center gap-2 rounded-full border border-primary/40 bg-black/85 px-4 py-3 text-sm font-semibold text-primary shadow-lg shadow-black/40 transition hover:border-primary hover:bg-black"
      aria-label="Open chat support"
    >
      <MessageCircle className="h-5 w-5" />
      Chat
    </button>
  );
}
