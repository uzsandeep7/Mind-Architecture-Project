import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, ShoppingCart, Star } from "lucide-react";
import { Link } from "react-router-dom";

interface Book {
  id: number;
  title: string;
  subtitle: string;
  price: number;
  rating: number;
  format: string;
  coverUrl: string;
  featured?: boolean;
}

const books: Book[] = [
  {
    id: 1,
    title: "Mind Architecture",
    subtitle: "Building the Foundation of Success",
    price: 29.99,
    rating: 4.9,
    format: "Hardcover & Digital",
    coverUrl: "/placeholder.svg",
    featured: true,
  },
  {
    id: 2,
    title: "The Breakthrough Blueprint",
    subtitle: "5 Steps to Transform Your Life",
    price: 24.99,
    rating: 4.8,
    format: "Paperback & Digital",
    coverUrl: "/placeholder.svg",
  },
  {
    id: 3,
    title: "Resilient Mindset",
    subtitle: "Thriving Through Adversity",
    price: 27.99,
    rating: 4.7,
    format: "Hardcover & Digital",
    coverUrl: "/placeholder.svg",
  },
  {
    id: 4,
    title: "Leadership From Within",
    subtitle: "The Inner Game of Great Leaders",
    price: 32.99,
    rating: 4.9,
    format: "Premium Hardcover",
    coverUrl: "/placeholder.svg",
  },
];

const BookCard = ({ book, index }: { book: Book; index: number }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className={`group relative ${book.featured ? "lg:col-span-2 lg:row-span-2" : ""}`}
    >
      <div className="h-full bg-card rounded-xl overflow-hidden shadow-soft hover-lift border border-border">
        {book.featured ? (
          // Featured Book Layout
          <div className="h-full grid lg:grid-cols-2">
            <div className="relative h-64 lg:h-full overflow-hidden">
              <img
                src={book.coverUrl}
                alt={book.title}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute top-4 left-4">
                <span className="px-3 py-1 bg-primary text-primary-foreground text-xs font-semibold rounded-full">
                  Bestseller
                </span>
              </div>
            </div>
            <div className="p-8 flex flex-col justify-center">
              <div className="flex items-center gap-1 mb-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    size={16}
                    className={i < Math.floor(book.rating) ? "fill-primary text-primary" : "text-muted"}
                  />
                ))}
                <span className="text-sm text-muted-foreground ml-1">({book.rating})</span>
              </div>
              <h3 className="text-2xl lg:text-3xl font-heading font-bold mb-2">
                {book.title}
              </h3>
              <p className="text-muted-foreground mb-4">{book.subtitle}</p>
              <p className="text-sm text-muted-foreground mb-6">{book.format}</p>
              <div className="flex items-center justify-between">
                <p className="text-3xl font-heading font-bold text-primary">
                  ${book.price}
                </p>
                <Button variant="gold">
                  <ShoppingCart size={16} />
                  Add to Cart
                </Button>
              </div>
            </div>
          </div>
        ) : (
          // Regular Book Layout
          <div className="h-full flex flex-col">
            <div className="relative h-56 overflow-hidden">
              <img
                src={book.coverUrl}
                alt={book.title}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
            </div>
            <div className="p-5 flex-1 flex flex-col">
              <div className="flex items-center gap-1 mb-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    size={12}
                    className={i < Math.floor(book.rating) ? "fill-primary text-primary" : "text-muted"}
                  />
                ))}
                <span className="text-xs text-muted-foreground ml-1">({book.rating})</span>
              </div>
              <h3 className="text-lg font-heading font-bold mb-1 group-hover:text-primary transition-colors">
                {book.title}
              </h3>
              <p className="text-sm text-muted-foreground mb-2 flex-1">{book.subtitle}</p>
              <p className="text-xs text-muted-foreground mb-4">{book.format}</p>
              <div className="flex items-center justify-between pt-4 border-t border-border">
                <p className="text-xl font-heading font-bold">${book.price}</p>
                <Button variant="goldOutline" size="sm">
                  <ShoppingCart size={14} />
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export const BooksSection = () => {
  return (
    <section className="section-padding bg-background">
      <div className="container-wide">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <span className="text-primary font-medium tracking-widest uppercase text-sm">
            Publications
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-heading font-bold mt-4 mb-6">
            Wisdom In Your Hands
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Dive deeper into mindset transformation with our collection of 
            best-selling books and guides.
          </p>
        </motion.div>

        {/* Books Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {books.map((book, index) => (
            <BookCard key={book.id} book={book} index={index} />
          ))}
        </div>

        {/* View All Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center"
        >
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
