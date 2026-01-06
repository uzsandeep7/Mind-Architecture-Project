import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X, Calendar, BookOpen, FileText, MapPin } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface SearchResult {
  id: string;
  type: "event" | "book" | "blog" | "page";
  title: string;
  description: string;
  url: string;
  icon: React.ReactNode;
}

// Static content for searching
const staticContent: SearchResult[] = [
  // Pages
  { id: "page-home", type: "page", title: "Home", description: "Welcome to MIND Architecture", url: "/", icon: <MapPin className="w-4 h-4" /> },
  { id: "page-about", type: "page", title: "About", description: "Learn about our mission and speaker", url: "/about", icon: <MapPin className="w-4 h-4" /> },
  { id: "page-contact", type: "page", title: "Contact", description: "Get in touch with us", url: "/contact", icon: <MapPin className="w-4 h-4" /> },
  { id: "page-testimonials", type: "page", title: "Testimonials", description: "What our clients say", url: "/testimonials", icon: <MapPin className="w-4 h-4" /> },
  
  // Events
  { id: "event-1", type: "event", title: "Mindset Mastery Summit 2026", description: "Sydney Convention Centre • Feb 15, 2026", url: "/events", icon: <Calendar className="w-4 h-4" /> },
  { id: "event-2", type: "event", title: "Leadership Excellence Workshop", description: "Melbourne Business Hub • Mar 22, 2026", url: "/events", icon: <Calendar className="w-4 h-4" /> },
  { id: "event-3", type: "event", title: "Peak Performance Retreat", description: "Gold Coast Resort • Apr 10-12, 2026", url: "/events", icon: <Calendar className="w-4 h-4" /> },
  
  // Books
  { id: "book-1", type: "book", title: "The Architecture of Success", description: "Building mental frameworks for achievement", url: "/books", icon: <BookOpen className="w-4 h-4" /> },
  { id: "book-2", type: "book", title: "Mindful Leadership", description: "Leading with purpose and clarity", url: "/books", icon: <BookOpen className="w-4 h-4" /> },
  { id: "book-3", type: "book", title: "Resilience Blueprint", description: "Bouncing back stronger than ever", url: "/books", icon: <BookOpen className="w-4 h-4" /> },
  
  // Blog posts
  { id: "blog-1", type: "blog", title: "Unlocking Your Mental Potential", description: "Discover key strategies for mental growth", url: "/blog", icon: <FileText className="w-4 h-4" /> },
  { id: "blog-2", type: "blog", title: "The Art of Resilient Leadership", description: "Lead with purpose and navigate challenges", url: "/blog", icon: <FileText className="w-4 h-4" /> },
  { id: "blog-3", type: "blog", title: "Building Habits That Last", description: "Transform routines into powerful habits", url: "/blog", icon: <FileText className="w-4 h-4" /> },
];

interface GlobalSearchProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GlobalSearch = ({ isOpen, onClose }: GlobalSearchProps) => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const lowerQuery = query.toLowerCase();
    const filtered = staticContent.filter(
      (item) =>
        item.title.toLowerCase().includes(lowerQuery) ||
        item.description.toLowerCase().includes(lowerQuery)
    );
    setResults(filtered);
    setSelectedIndex(0);
  }, [query]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => Math.min(prev + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => Math.max(prev - 1, 0));
    } else if (e.key === "Enter" && results[selectedIndex]) {
      navigate(results[selectedIndex].url);
      onClose();
      setQuery("");
    } else if (e.key === "Escape") {
      onClose();
      setQuery("");
    }
  };

  const handleResultClick = (url: string) => {
    navigate(url);
    onClose();
    setQuery("");
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "event": return "Event";
      case "book": return "Book";
      case "blog": return "Blog";
      case "page": return "Page";
      default: return type;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "event": return "text-blue-500";
      case "book": return "text-green-500";
      case "blog": return "text-purple-500";
      case "page": return "text-primary";
      default: return "text-muted-foreground";
    }
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
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            transition={{ duration: 0.2 }}
            className="fixed top-20 left-1/2 -translate-x-1/2 z-50 w-full max-w-2xl px-4"
          >
            <div className="bg-card border border-border rounded-2xl shadow-2xl overflow-hidden">
              <div className="flex items-center gap-3 p-4 border-b border-border">
                <Search className="w-5 h-5 text-muted-foreground" />
                <Input
                  ref={inputRef}
                  type="text"
                  placeholder="Search events, books, articles, pages..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="flex-1 border-0 focus-visible:ring-0 text-lg bg-transparent"
                />
                <Button variant="ghost" size="icon" onClick={onClose}>
                  <X className="w-5 h-5" />
                </Button>
              </div>

              {results.length > 0 && (
                <div className="max-h-96 overflow-y-auto p-2">
                  {results.map((result, index) => (
                    <button
                      key={result.id}
                      onClick={() => handleResultClick(result.url)}
                      className={`w-full flex items-center gap-4 p-3 rounded-lg text-left transition-colors ${
                        index === selectedIndex
                          ? "bg-primary/10"
                          : "hover:bg-muted"
                      }`}
                    >
                      <div className={`p-2 rounded-lg bg-muted ${getTypeColor(result.type)}`}>
                        {result.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-medium truncate">{result.title}</span>
                          <span className={`text-xs ${getTypeColor(result.type)}`}>
                            {getTypeLabel(result.type)}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground truncate">
                          {result.description}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {query && results.length === 0 && (
                <div className="p-8 text-center text-muted-foreground">
                  <p>No results found for "{query}"</p>
                </div>
              )}

              {!query && (
                <div className="p-4 text-center text-muted-foreground text-sm">
                  <p>Type to search across events, books, articles, and pages</p>
                  <div className="flex items-center justify-center gap-4 mt-2">
                    <span className="flex items-center gap-1">
                      <kbd className="px-2 py-1 bg-muted rounded text-xs">↑↓</kbd> navigate
                    </span>
                    <span className="flex items-center gap-1">
                      <kbd className="px-2 py-1 bg-muted rounded text-xs">↵</kbd> select
                    </span>
                    <span className="flex items-center gap-1">
                      <kbd className="px-2 py-1 bg-muted rounded text-xs">esc</kbd> close
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
