import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

type ReadAloudContextValue = {
  isSupported: boolean;
  isSpeaking: boolean;
  isHoverReadEnabled: boolean;
  toggleHoverRead: () => void;
  stopReading: () => void;
};

const ReadAloudContext = createContext<ReadAloudContextValue | undefined>(undefined);

const HOVER_READABLE_SELECTOR = [
  "button",
  "a",
  "input",
  "textarea",
  "select",
  "label",
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
  "p",
  "li",
  "span",
  "[role='button']",
  "[data-read-aloud]",
].join(", ");

const getPreferredVoice = () => {
  const voices = window.speechSynthesis.getVoices();
  return (
    voices.find((voice) => voice.lang.startsWith("en-AU")) ||
    voices.find((voice) => voice.lang.startsWith("en")) ||
    voices[0]
  );
};

const getReadableElementText = (element: HTMLElement) => {
  const ariaLabel = element.getAttribute("aria-label");
  const title = element.getAttribute("title");
  const placeholder = element.getAttribute("placeholder");
  const inputValue =
    element instanceof HTMLInputElement ||
    element instanceof HTMLTextAreaElement ||
    element instanceof HTMLSelectElement
      ? element.value
      : "";
  const imageAlt =
    element instanceof HTMLImageElement ? element.getAttribute("alt") : "";
  const textContent = element.textContent?.replace(/\s+/g, " ").trim() ?? "";

  return [ariaLabel, title, placeholder, inputValue, imageAlt, textContent]
    .map((value) => value?.trim())
    .find((value) => value && value.length > 1) ?? "";
};

export const ReadAloudProvider = ({ children }: { children: ReactNode }) => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isHoverReadEnabled, setIsHoverReadEnabled] = useState(false);
  const hoverTimerRef = useRef<number | null>(null);
  const lastElementRef = useRef<HTMLElement | null>(null);
  const lastTextRef = useRef("");

  const isSupported =
    typeof window !== "undefined" &&
    "speechSynthesis" in window &&
    typeof SpeechSynthesisUtterance !== "undefined";

  useEffect(() => {
    if (!isSupported) return;

    const handleSpeechEnd = () => setIsSpeaking(false);
    window.speechSynthesis.addEventListener("voiceschanged", handleSpeechEnd);

    return () => {
      window.speechSynthesis.removeEventListener("voiceschanged", handleSpeechEnd);
      window.speechSynthesis.cancel();
    };
  }, [isSupported]);

  const stopReading = () => {
    if (!isSupported) return;
    if (hoverTimerRef.current) {
      window.clearTimeout(hoverTimerRef.current);
      hoverTimerRef.current = null;
    }

    window.speechSynthesis.cancel();
    setIsSpeaking(false);
  };

  useEffect(() => {
    if (!isSupported || !isHoverReadEnabled) {
      lastElementRef.current = null;
      lastTextRef.current = "";
      stopReading();
      return;
    }

    const handlePointerOver = (event: MouseEvent) => {
      const target = event.target;
      if (!(target instanceof HTMLElement)) return;

      const mainContent = target.closest("[data-readable-content]");
      if (!mainContent) return;

      const readableElement = target.closest(HOVER_READABLE_SELECTOR) as HTMLElement | null;
      if (!readableElement || !mainContent.contains(readableElement)) return;

      const text = getReadableElementText(readableElement);
      if (!text) return;

      if (readableElement === lastElementRef.current && text === lastTextRef.current) {
        return;
      }

      if (hoverTimerRef.current) {
        window.clearTimeout(hoverTimerRef.current);
      }

      hoverTimerRef.current = window.setTimeout(() => {
        const utterance = new SpeechSynthesisUtterance(text);
        const preferredVoice = getPreferredVoice();

        if (preferredVoice) {
          utterance.voice = preferredVoice;
          utterance.lang = preferredVoice.lang;
        } else {
          utterance.lang = "en-AU";
        }

        utterance.rate = 1;
        utterance.pitch = 1;
        utterance.onstart = () => setIsSpeaking(true);
        utterance.onend = () => setIsSpeaking(false);
        utterance.onerror = () => setIsSpeaking(false);

        window.speechSynthesis.cancel();
        window.speechSynthesis.speak(utterance);

        lastElementRef.current = readableElement;
        lastTextRef.current = text;
      }, 180);
    };

    const handlePointerLeave = () => {
      lastElementRef.current = null;
    };

    document.addEventListener("mouseover", handlePointerOver);
    document.addEventListener("scroll", stopReading, true);
    document.addEventListener("mouseout", handlePointerLeave);

    return () => {
      document.removeEventListener("mouseover", handlePointerOver);
      document.removeEventListener("scroll", stopReading, true);
      document.removeEventListener("mouseout", handlePointerLeave);
      stopReading();
    };
  }, [isHoverReadEnabled, isSupported]);

  const toggleHoverRead = () => {
    if (!isSupported) return;
    setIsHoverReadEnabled((current) => !current);
  };

  const value = useMemo(
    () => ({
      isSupported,
      isSpeaking,
      isHoverReadEnabled,
      toggleHoverRead,
      stopReading,
    }),
    [isSupported, isSpeaking, isHoverReadEnabled],
  );

  return <ReadAloudContext.Provider value={value}>{children}</ReadAloudContext.Provider>;
};

export const useReadAloud = () => {
  const context = useContext(ReadAloudContext);
  if (!context) {
    throw new Error("useReadAloud must be used within a ReadAloudProvider");
  }

  return context;
};
