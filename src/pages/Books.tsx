import { Layout } from "@/components/layout/Layout";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ShoppingCart, Star, Filter, Search, Crown, Lock, Eye } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

type Book = {
  id: string;
  title: string;
  subtitle?: string;
  description: string;
  price: number;
  memberPrice: number;
  rating: number;
  reviewCount: number;
  coverUrl: string;
  category: string;
  isPremiumOnly?: boolean;
};

const BookCard = ({
  book,
  index,
  onAddToCart,
  onViewDetails,
  isMember,
  isLoggedIn,
}: {
  book: Book;
  index: number;
  onAddToCart: (book: Book) => void;
  onViewDetails: (book: Book) => void;
  isMember: boolean;
  isLoggedIn: boolean;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 30 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay: index * 0.1 }}
    className="group relative flex h-full flex-col overflow-hidden rounded-xl border border-border bg-card shadow-soft hover-lift"
  >
    <div className="relative h-64 overflow-hidden">
      <img src={book.coverUrl} alt={book.title} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
      <div className="absolute top-4 left-4 flex flex-wrap gap-2">
        <span className="rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground">{book.category}</span>
        {book.isPremiumOnly ? (
          <span className="flex items-center gap-1 rounded-full bg-amber-500 px-3 py-1 text-xs font-semibold text-black">
            <Crown className="h-3 w-3" />
            Premium Only
          </span>
        ) : null}
      </div>
    </div>

    <div className="flex flex-1 flex-col p-6">
      <div className="mb-2 flex items-center gap-1">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star key={i} size={14} className={i < Math.floor(book.rating) ? "fill-primary text-primary" : "text-muted"} />
        ))}
        <span className="ml-1 text-xs text-muted-foreground">({book.reviewCount} reviews)</span>
      </div>

      <h3 className="mb-1 text-xl font-heading font-bold transition-colors group-hover:text-primary">{book.title}</h3>
      <p className="mb-3 text-sm text-muted-foreground">{book.subtitle}</p>
      <p className="mb-4 min-h-[3.5rem] line-clamp-2 text-sm text-muted-foreground">{book.description}</p>

      <div className="mt-auto space-y-4 border-t border-border pt-4">
        <div className="flex items-end justify-between gap-4">
        <div className="min-w-0 flex-1">
          {isMember && book.memberPrice < book.price ? (
            <>
              <p className="text-sm font-heading text-muted-foreground line-through">${book.price.toFixed(2)}</p>
              <p className="flex flex-wrap items-baseline gap-1 text-xl font-heading font-bold text-primary leading-none">
                <Crown className="h-4 w-4" />
                ${book.memberPrice.toFixed(2)}
              </p>
            </>
          ) : (
            <>
              <p className="text-xl font-heading font-bold leading-none">${book.price.toFixed(2)}</p>
              {book.memberPrice < book.price ? (
                <p className="mt-2 text-xs font-medium text-amber-500">Members pay ${book.memberPrice.toFixed(2)}</p>
              ) : null}
            </>
          )}
        </div>
        {book.isPremiumOnly && !isMember ? (
          <Button variant="outline" size="sm" className="shrink-0 min-w-[120px]" asChild>
            <Link to="/membership">
              <Lock size={14} className="mr-1" />
              Unlock
            </Link>
          </Button>
        ) : !isLoggedIn ? (
          <Button variant="outline" size="sm" className="shrink-0 min-w-[120px]" asChild>
            <Link to="/auth">
              <Lock size={14} className="mr-1" />
              Sign In
            </Link>
          </Button>
        ) : (
          <Button variant="gold" size="sm" className="shrink-0 min-w-[120px]" onClick={() => onAddToCart(book)}>
            <ShoppingCart size={14} />
            Add to Cart
          </Button>
        )}
        </div>
        <Button variant="outline" size="sm" className="w-full gap-2" onClick={() => onViewDetails(book)}>
          <Eye size={14} />
          View Details
        </Button>
      </div>
    </div>
  </motion.div>
);

const BooksPage = () => {
  const { addToCart } = useCart();
  const { user, isAdmin, isMember } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [books, setBooks] = useState<Book[]>([]);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [isLoadingBooks, setIsLoadingBooks] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const loadBooks = async () => {
      setIsLoadingBooks(true);
      const { data } = await supabase
        .from("books")
        .select("*")
        .eq("is_published", true)
        .order("created_at", { ascending: false });

      setBooks(
        (data ?? []).map((book) => ({
          id: book.id,
          title: book.title,
          subtitle: book.category || "Mind Architecture Resource",
          description: book.description || "Transformative reading to support your personal and professional growth.",
          price: Number(book.price),
          memberPrice: Number(book.member_price ?? book.price),
          rating: 4.8,
          reviewCount: 120,
          coverUrl: book.cover_image_url || "/placeholder.svg",
          category: book.category || "General",
          isPremiumOnly: Boolean(book.is_members_only),
        })),
      );
      setIsLoadingBooks(false);
    };

    void loadBooks();
  }, []);

  const categories = useMemo(
    () => ["All", ...Array.from(new Set(books.map((book) => book.category).filter(Boolean))).sort()],
    [books],
  );

  const filteredBooks = books.filter((book) => {
    const matchesCategory = selectedCategory === "All" || book.category === selectedCategory;
    const q = searchQuery.toLowerCase();
    const matchesSearch = book.title.toLowerCase().includes(q) || book.description.toLowerCase().includes(q);
    return matchesCategory && matchesSearch;
  });

  const handleAddToCart = async (book: Book) => {
    if (!user) {
      toast.error("Please sign in to add books to your cart");
      navigate("/auth");
      return;
    }

    if (isAdmin) {
      toast.error("Admin and owner accounts cannot place customer book orders");
      return;
    }

    if (book.isPremiumOnly && !isMember) {
      toast.error("This book is available to premium members only");
      navigate("/membership");
      return;
    }

    try {
      await addToCart(book.id);
      toast.success(`${book.title} added to cart!`);
      navigate("/cart");
    } catch (error) {
      console.error("Error adding book to cart:", error);
      const message = error instanceof Error ? error.message : "Failed to add this book to cart";
      toast.error(message);
    }
  };

  return (
    <Layout>
      <section className="bg-gradient-hero pb-16 pt-32 text-cream">
        <div className="container-wide">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-3xl">
            <span className="text-sm font-medium uppercase tracking-widest text-primary">Publications</span>
            <h1 className="mb-6 mt-4 text-4xl font-heading font-bold md:text-5xl lg:text-6xl">
              Wisdom In
              <span className="text-gradient-gold"> Your Hands</span>
            </h1>
            <p className="text-lg text-cream/70">
              Explore books and resources curated for Mind Architecture readers.
            </p>
          </motion.div>
        </div>
      </section>

      <section className="sticky top-16 z-30 border-b border-border bg-background/95 py-8 backdrop-blur-md">
        <div className="container-wide">
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            <div className="flex w-full items-center gap-2 overflow-x-auto pb-2 md:w-auto md:pb-0">
              <Filter size={18} className="shrink-0 text-muted-foreground" />
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition-all ${
                    selectedCategory === category
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
            <div className="relative w-full md:w-64">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search books..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="section-padding bg-background">
        <div className="container-wide">
          {isLoadingBooks ? (
            <div className="py-16 text-center text-lg text-muted-foreground">Loading books...</div>
          ) : filteredBooks.length > 0 ? (
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {filteredBooks.map((book, index) => (
                <BookCard
                  key={book.id}
                  book={book}
                  index={index}
                  onAddToCart={handleAddToCart}
                  onViewDetails={setSelectedBook}
                  isMember={isMember}
                  isLoggedIn={Boolean(user)}
                />
              ))}
            </div>
          ) : (
            <div className="py-16 text-center">
              <p className="text-lg text-muted-foreground">No books available right now.</p>
            </div>
          )}
        </div>
      </section>

      <Dialog open={Boolean(selectedBook)} onOpenChange={() => setSelectedBook(null)}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-3xl">
          {selectedBook ? (
            <>
              <DialogHeader>
                <DialogTitle className="font-heading text-2xl">{selectedBook.title}</DialogTitle>
              </DialogHeader>
              <div className="grid gap-6 md:grid-cols-[220px,1fr]">
                <img
                  src={selectedBook.coverUrl}
                  alt={selectedBook.title}
                  className="h-72 w-full rounded-xl object-cover"
                />
                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-medium uppercase tracking-widest text-primary">
                      {selectedBook.category}
                    </p>
                    <p className="mt-2 text-muted-foreground">{selectedBook.subtitle}</p>
                  </div>
                  <p className="whitespace-pre-wrap leading-relaxed text-foreground/85">
                    {selectedBook.description}
                  </p>
                  <div className="flex flex-wrap items-center gap-3">
                    <p className="text-2xl font-heading font-bold text-primary">
                      ${(isMember ? selectedBook.memberPrice : selectedBook.price).toFixed(2)}
                    </p>
                    {selectedBook.memberPrice < selectedBook.price ? (
                      <p className="text-sm text-muted-foreground">
                        Standard price ${selectedBook.price.toFixed(2)}
                      </p>
                    ) : null}
                  </div>
                  <Button
                    variant="gold"
                    className="w-full"
                    onClick={() => {
                      void handleAddToCart(selectedBook);
                      setSelectedBook(null);
                    }}
                  >
                    <ShoppingCart size={16} />
                    Add to Cart
                  </Button>
                </div>
              </div>
            </>
          ) : null}
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

export default BooksPage;
