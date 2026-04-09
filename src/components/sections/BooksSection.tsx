import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, ShoppingCart, Star, Crown, Lock } from "lucide-react";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

type Book = {
  id: string;
  title: string;
  category: string | null;
  price: number;
  member_price: number | null;
  cover_image_url: string | null;
  description: string | null;
  is_members_only: boolean;
};

const BookCard = ({ book, index, isMember }: { book: Book; index: number; isMember: boolean }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="group"
    >
      <div className="h-full overflow-hidden rounded-xl border border-border bg-card shadow-soft hover-lift">
        <div className="relative h-56 overflow-hidden">
          <img
            src={book.cover_image_url || "/placeholder.svg"}
            alt={book.title}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute top-4 left-4">
            <div className="flex flex-wrap gap-2">
              <span className="rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground">
                {book.category || "Book"}
              </span>
              {book.is_members_only ? (
                <span className="flex items-center gap-1 rounded-full bg-amber-500 px-3 py-1 text-xs font-semibold text-black">
                  <Crown className="h-3 w-3" />
                  Members Only
                </span>
              ) : null}
            </div>
          </div>
        </div>
        <div className="flex h-full flex-col p-5">
          <div className="mb-2 flex items-center gap-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} size={12} className={i < 4 ? "fill-primary text-primary" : "text-muted"} />
            ))}
            <span className="ml-1 text-xs text-muted-foreground">(4.8)</span>
          </div>
          <h3 className="mb-1 text-lg font-heading font-bold transition-colors group-hover:text-primary">
            {book.title}
          </h3>
          <p className="mb-4 flex-1 text-sm text-muted-foreground line-clamp-2">
            {book.description || "A live backend-managed book ready for the storefront."}
          </p>
          <div className="flex items-center justify-between border-t border-border pt-4">
            <div>
              {isMember && book.member_price !== null && Number(book.member_price) < Number(book.price) ? (
                <>
                  <p className="text-xs text-muted-foreground line-through">${Number(book.price).toFixed(2)}</p>
                  <p className="text-xl font-heading font-bold text-primary">${Number(book.member_price).toFixed(2)}</p>
                </>
              ) : (
                <>
                  <p className="text-xl font-heading font-bold">${Number(book.price).toFixed(2)}</p>
                  {!book.is_members_only && book.member_price !== null && Number(book.member_price) < Number(book.price) ? (
                    <p className="text-xs text-amber-500">Members pay ${Number(book.member_price).toFixed(2)}</p>
                  ) : null}
                </>
              )}
            </div>
            <Button variant="goldOutline" size="sm" asChild>
              <Link to={book.is_members_only && !isMember ? "/membership" : "/books"}>
                {book.is_members_only && !isMember ? <Lock size={14} /> : <ShoppingCart size={14} />}
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export const BooksSection = () => {
  const { isMember } = useAuth();
  const [books, setBooks] = useState<Book[]>([]);

  useEffect(() => {
    const loadBooks = async () => {
      const { data } = await supabase
        .from("books")
        .select("*")
        .eq("is_published", true)
        .order("created_at", { ascending: false })
        .limit(4);

      setBooks(data ?? []);
    };

    void loadBooks();
  }, []);

  if (books.length === 0) return null;

  return (
    <section className="section-padding bg-background">
      <div className="container-wide">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-12 text-center"
        >
          <span className="text-sm font-medium uppercase tracking-widest text-primary">Publications</span>
          <h2 className="mb-6 mt-4 text-3xl font-heading font-bold md:text-4xl lg:text-5xl">
            Wisdom In Your Hands
          </h2>
          <p className="mx-auto max-w-2xl text-muted-foreground">
            Only live books added from the backend are shown here.
          </p>
        </motion.div>

        <div className="mb-12 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {books.map((book, index) => (
            <BookCard key={book.id} book={book} index={index} isMember={isMember} />
          ))}
        </div>

        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center">
          <Link to="/books">
            <Button variant="goldOutline" size="lg">
              Browse All Books
              <ArrowRight size={18} />
            </Button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
};
