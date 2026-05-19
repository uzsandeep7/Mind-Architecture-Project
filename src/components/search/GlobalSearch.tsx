import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
  type ReactNode,
} from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  X,
  Calendar,
  BookOpen,
  FileText,
  MapPin,
  type LucideIcon,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

type SearchResultType = "event" | "book" | "blog" | "page";

interface SearchResult {
  id: string;
  type: SearchResultType;
  title: string;
  description: string;
  url: string;
  icon: LucideIcon;
  keywords: string[];
}

const pageResults: SearchResult[] = [
  {
    id: "page-home",
    type: "page",
    title: "Home",
    description: "Website overview and featured programs",
    url: "/",
    icon: MapPin,
    keywords: ["home", "landing", "mind architecture", "overview"],
  },
  {
    id: "page-about",
    type: "page",
    title: "About",
    description: "Learn about MIND Architecture and its mission",
    url: "/about",
    icon: MapPin,
    keywords: ["about", "mission", "speaker", "story"],
  },
  {
    id: "page-programs",
    type: "page",
    title: "Programs",
    description: "Browse live programs and in-person experiences",
    url: "/programs",
    icon: Calendar,
    keywords: ["programs", "events", "workshops", "bookings"],
  },
  {
    id: "page-books",
    type: "page",
    title: "Books",
    description: "Explore books and learning materials",
    url: "/books",
    icon: BookOpen,
    keywords: ["resources", "books", "publications", "reading"],
  },
  {
    id: "page-insights",
    type: "page",
    title: "Insights",
    description: "Read articles, ideas, and member insights",
    url: "/insights",
    icon: FileText,
    keywords: ["insights", "blog", "articles", "posts"],
  },
  {
    id: "page-gallery",
    type: "page",
    title: "Gallery",
    description: "View images and highlights from the brand",
    url: "/gallery",
    icon: MapPin,
    keywords: ["gallery", "photos", "images", "highlights"],
  },
  {
    id: "page-testimonials",
    type: "page",
    title: "Testimonials",
    description: "Read feedback from clients and members",
    url: "/testimonials",
    icon: FileText,
    keywords: ["testimonials", "reviews", "feedback", "stories"],
  },
  {
    id: "page-membership",
    type: "page",
    title: "Membership",
    description: "View premium membership benefits and access",
    url: "/membership",
    icon: MapPin,
    keywords: ["membership", "premium", "member", "upgrade"],
  },
  {
    id: "page-consultation",
    type: "page",
    title: "Book Consultation",
    description: "Request a consultation with date and time selection",
    url: "/consultation",
    icon: Calendar,
    keywords: ["consultation", "book consultation", "coaching", "appointment"],
  },
  {
    id: "page-contact",
    type: "page",
    title: "Contact",
    description: "Send a message or contact the business directly",
    url: "/contact",
    icon: MapPin,
    keywords: ["contact", "message", "email", "support"],
  },
];

interface GlobalSearchProps {
  isOpen: boolean;
  onClose: () => void;
}

const getSearchScore = (item: SearchResult, rawQuery: string) => {
  const query = rawQuery.trim().toLowerCase();

  if (!query) {
    return 0;
  }

  const title = item.title.toLowerCase();
  const description = item.description.toLowerCase();
  const keywords = item.keywords.map((keyword) => keyword.toLowerCase());

  let score = 0;

  if (title === query) score += 400;
  if (title.startsWith(query)) score += 240;
  if (title.includes(query)) score += 160;
  if (description.includes(query)) score += 90;

  keywords.forEach((keyword) => {
    if (keyword === query) score += 130;
    else if (keyword.startsWith(query)) score += 85;
    else if (keyword.includes(query)) score += 55;
  });

  return score;
};

const getTypeLabel = (type: SearchResultType) => {
  switch (type) {
    case "event":
      return "Program";
    case "book":
      return "Book";
    case "blog":
      return "Article";
    case "page":
      return "Page";
    default:
      return type;
  }
};

const getTypeColor = (type: SearchResultType) => {
  switch (type) {
    case "event":
      return "text-blue-500";
    case "book":
      return "text-green-500";
    case "blog":
      return "text-amber-500";
    case "page":
      return "text-primary";
    default:
      return "text-muted-foreground";
  }
};

const renderResultIcon = (Icon: LucideIcon, type: SearchResultType): ReactNode => (
  <div className={`p-2 rounded-lg bg-muted ${getTypeColor(type)}`}>
    <Icon className="w-4 h-4" />
  </div>
);

export const GlobalSearch = ({ isOpen, onClose }: GlobalSearchProps) => {
  const [query, setQuery] = useState("");
  const [catalog, setCatalog] = useState<SearchResult[]>(pageResults);
  const [isLoadingCatalog, setIsLoadingCatalog] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    let isCancelled = false;

    const loadSearchCatalog = async () => {
      setIsLoadingCatalog(true);

      const [eventsResponse, booksResponse, postsResponse] = await Promise.all([
        supabase
          .from("events")
          .select("id, title, description, venue, date")
          .eq("is_published", true)
          .order("date", { ascending: true }),
        supabase
          .from("books")
          .select("id, title, description, category")
          .eq("is_published", true)
          .order("created_at", { ascending: false }),
        supabase
          .from("blog_posts")
          .select("id, title, slug, excerpt, tags, published_at")
          .eq("is_published", true)
          .order("published_at", { ascending: false }),
      ]);

      if (isCancelled) {
        return;
      }

      const eventResults: SearchResult[] = (eventsResponse.data ?? []).map((event) => {
        const formattedDate = new Date(event.date).toLocaleDateString("en-AU", {
          weekday: "short",
          day: "numeric",
          month: "short",
          year: "numeric",
        });

        return {
          id: `event-${event.id}`,
          type: "event",
          title: event.title,
          description: `${event.venue} - ${formattedDate}`,
          url: `/programs/${event.id}`,
          icon: Calendar,
          keywords: [event.venue, event.description ?? "", "event", "program"].filter(Boolean),
        };
      });

      const bookResults: SearchResult[] = (booksResponse.data ?? []).map((book) => ({
        id: `book-${book.id}`,
        type: "book",
        title: book.title,
        description: book.description || `${book.category || "Book"} available on the books page`,
        url: "/books",
        icon: BookOpen,
        keywords: [book.category ?? "", book.description ?? "", "book", "resource"].filter(Boolean),
      }));

      const blogResults: SearchResult[] = (postsResponse.data ?? []).map((post) => ({
        id: `blog-${post.id}`,
        type: "blog",
        title: post.title,
        description: post.excerpt || "Open the article to read more",
        url: `/insights/${post.slug}`,
        icon: FileText,
        keywords: [...(post.tags ?? []), post.excerpt ?? "", "blog", "insight", "article"].filter(Boolean),
      }));

      setCatalog([...pageResults, ...eventResults, ...bookResults, ...blogResults]);
      setIsLoadingCatalog(false);
    };

    void loadSearchCatalog();

    return () => {
      isCancelled = true;
    };
  }, [isOpen]);

  const results = useMemo(() => {
    if (!query.trim()) {
      return [];
    }

    return catalog
      .map((item) => ({
        item,
        score: getSearchScore(item, query),
      }))
      .filter(({ score }) => score > 0)
      .sort((a, b) => b.score - a.score || a.item.title.localeCompare(b.item.title))
      .slice(0, 10)
      .map(({ item }) => item);
  }, [catalog, query]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  const closeSearch = () => {
    onClose();
    setQuery("");
    setSelectedIndex(0);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => Math.min(prev + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => Math.max(prev - 1, 0));
    } else if (e.key === "Enter" && results[selectedIndex]) {
      navigate(results[selectedIndex].url);
      closeSearch();
    } else if (e.key === "Escape") {
      closeSearch();
    }
  };

  const handleResultClick = (url: string) => {
    navigate(url);
    closeSearch();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm"
            onClick={closeSearch}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            transition={{ duration: 0.2 }}
            className="fixed top-20 left-1/2 z-50 w-full max-w-2xl -translate-x-1/2 px-4"
          >
            <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-2xl">
              <div className="flex items-center gap-3 border-b border-border p-4">
                <Search className="w-5 h-5 text-muted-foreground" />
                <Input
                  ref={inputRef}
                  type="text"
                  placeholder="Type to search pages, programs, books, and insights..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="flex-1 border-0 bg-transparent text-lg focus-visible:ring-0"
                />
                <Button variant="ghost" size="icon" onClick={closeSearch}>
                  <X className="w-5 h-5" />
                </Button>
              </div>

              {results.length > 0 && (
                <div className="max-h-96 overflow-y-auto p-2">
                  {results.map((result, index) => (
                    <button
                      key={result.id}
                      onClick={() => handleResultClick(result.url)}
                      className={`w-full rounded-lg p-3 text-left transition-colors ${
                        index === selectedIndex ? "bg-primary/10" : "hover:bg-muted"
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        {renderResultIcon(result.icon, result.type)}
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="truncate font-medium">{result.title}</span>
                            <span className={`text-xs ${getTypeColor(result.type)}`}>
                              {getTypeLabel(result.type)}
                            </span>
                          </div>
                          <p className="truncate text-sm text-muted-foreground">{result.description}</p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {query && results.length === 0 && !isLoadingCatalog && (
                <div className="p-8 text-center text-muted-foreground">
                  <p>No results found for "{query}"</p>
                </div>
              )}

              {query && results.length === 0 && isLoadingCatalog && (
                <div className="p-8 text-center text-muted-foreground">
                  <p>Loading searchable content...</p>
                </div>
              )}

              {!query && (
                <div className="p-4 text-center text-sm text-muted-foreground">
                  <p>Start typing to search across the whole website.</p>
                  <div className="mt-2 flex items-center justify-center gap-4">
                    <span className="flex items-center gap-1">
                      <kbd className="rounded bg-muted px-2 py-1 text-xs">up/down</kbd>
                      navigate
                    </span>
                    <span className="flex items-center gap-1">
                      <kbd className="rounded bg-muted px-2 py-1 text-xs">enter</kbd>
                      open
                    </span>
                    <span className="flex items-center gap-1">
                      <kbd className="rounded bg-muted px-2 py-1 text-xs">esc</kbd>
                      close
                    </span>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
