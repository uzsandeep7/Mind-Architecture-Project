import { useEffect } from "react";

declare global {
  interface Window {
    Tawk_API?: any;
    Tawk_LoadStart?: Date;
  }
}

export default function ChatWidget() {
  useEffect(() => {
    // Avoid injecting twice
    if (document.getElementById("tawk-script")) return;

    window.Tawk_API = window.Tawk_API || {};
    window.Tawk_LoadStart = new Date();

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
  }, []);

  return null;
}
