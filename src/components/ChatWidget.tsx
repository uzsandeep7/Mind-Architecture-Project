import { useEffect } from "react";

declare global {
  interface Window {
    Tawk_API?: any;
    Tawk_LoadStart?: Date;
  }
}

export default function ChatWidget() {
  useEffect(() => {
    const existingScript = document.getElementById("tawk-script");
    if (existingScript) {
      existingScript.remove();
    }

    window.Tawk_API = window.Tawk_API || {};
    window.Tawk_LoadStart = new Date();
    window.Tawk_API.onLoad = () => {
      window.Tawk_API?.showWidget?.();
      window.Tawk_API?.minimize?.();
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

    return () => {
      window.Tawk_API = undefined;
    };
  }, []);

  return null;
}
