import { Layout } from "@/components/layout/Layout";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, Star, Filter, Search, BookOpen, Headphones, FileText, Crown, Lock } from "lucide-react";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Link } from "react-router-dom";

interface Book {
  id: number;
  title: string;
  subtitle: string;
  description: string;
  price: number;
  memberPrice: number;
  rating: number;
  reviewCount: number;
  format: string[];
  coverUrl: string;
  category: string;
  bestseller?: boolean;
  isPremiumOnly?: boolean;
}

const allBooks: Book[] = [
  {
    id: 1,
    title: "Mind Architecture",
    subtitle: "Building the Foundation of Success",
    description: "The definitive guide to restructuring your mental frameworks for lasting success. Learn the principles that have transformed over 50,000 lives.",
    price: 29.99,
    memberPrice: 22.49,
    rating: 4.9,
    reviewCount: 1247,
    format: ["Hardcover", "Paperback", "Digital", "Audiobook"],
    coverUrl: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400",
    category: "Personal Development",
    bestseller: true,
  },
  {
    id: 2,
    title: "The Breakthrough Blueprint",
    subtitle: "5 Steps to Transform Your Life",
    description: "A practical, step-by-step framework for breaking through limiting beliefs and achieving extraordinary results.",
    price: 24.99,
    memberPrice: 18.74,
    rating: 4.8,
    reviewCount: 892,
    format: ["Paperback", "Digital", "Audiobook"],
    coverUrl: "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400",
    category: "Self-Help",
  },
  {
    id: 3,
    title: "Resilient Mindset",
    subtitle: "Thriving Through Adversity",
    description: "Discover how to build unshakeable mental resilience and turn life's challenges into opportunities for growth.",
    price: 27.99,
    memberPrice: 20.99,
    rating: 4.7,
    reviewCount: 654,
    format: ["Hardcover", "Digital"],
    coverUrl: "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=400",
    category: "Mental Health",
    isPremiumOnly: true,
  },
  {
    id: 4,
    title: "Leadership From Within",
    subtitle: "The Inner Game of Great Leaders",
    description: "Master the internal dynamics that separate good leaders from truly exceptional ones.",
    price: 32.99,
    memberPrice: 24.74,
    rating: 4.9,
    reviewCount: 423,
    format: ["Hardcover", "Digital", "Audiobook"],
    coverUrl: "https://images.unsplash.com/photo-1589829085413-56de8ae18c73?w=400",
    category: "Leadership",
    bestseller: true,
  },
  {
    id: 5,
    title: "The Focused Mind",
    subtitle: "Mastering Attention in a Distracted World",
    description: "Practical strategies for developing laser-like focus and maximizing your productivity.",
    price: 22.99,
    memberPrice: 17.24,
    rating: 4.6,
    reviewCount: 567,
    format: ["Paperback", "Digital"],
    coverUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400",
    category: "Productivity",
  },
  {
    id: 6,
    title: "Emotional Intelligence Mastery",
    subtitle: "The Key to Personal and Professional Success",
    description: "Unlock the power of emotional intelligence to enhance every relationship and achieve your goals.",
    price: 26.99,
    memberPrice: 20.24,
    rating: 4.8,
    reviewCount: 789,
    format: ["Hardcover", "Paperback", "Digital"],
    coverUrl: "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=400",
    category: "Personal Development",
    isPremiumOnly: true,
  },
];

const categories = ["All", "Personal Development", "Self-Help", "Leadership", "Mental Health", "Productivity"];

const formatIcons: Record<string, React.ElementType> = {
  Hardcover: BookOpen,
  Paperback: BookOpen,
  Digital: FileText,
  Audiobook: Headphones,
};

const BookCard = ({ book, index }: { book: Book; index: number }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="group bg-card rounded-xl overflow-hidden shadow-soft hover-lift border border-border relative"
    >
      <div className="relative h-64 overflow-hidden">
        <img
          src={book.coverUrl}
          alt={book.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute top-4 left-4 flex flex-wrap gap-2">
          {book.bestseller && (
            <span className="px-3 py-1 bg-primary text-primary-foreground text-xs font-semibold rounded-full">
              Bestseller
            </span>
          )}
          {book.isPremiumOnly && (
            <span className="px-3 py-1 bg-amber-500 text-black text-xs font-semibold rounded-full flex items-center gap-1">
              <Crown className="w-3 h-3" />
              Premium Only
            </span>
          )}
        </div>
      </div>

      <div className="p-6">
        <div className="flex items-center gap-1 mb-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star
              key={i}
              size={14}
              className={i < Math.floor(book.rating) ? "fill-primary text-primary" : "text-muted"}
            />
          ))}
          <span className="text-xs text-muted-foreground ml-1">
            ({book.reviewCount} reviews)
          </span>
        </div>

        <h3 className="text-xl font-heading font-bold mb-1 group-hover:text-primary transition-colors">
          {book.title}
        </h3>
        <p className="text-sm text-muted-foreground mb-3">{book.subtitle}</p>
        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{book.description}</p>

        <div className="flex items-center gap-2 mb-4">
          {book.format.map((fmt) => {
            const Icon = formatIcons[fmt] || BookOpen;
            return (
              <div
                key={fmt}
                className="flex items-center gap-1 px-2 py-1 bg-secondary rounded text-xs"
                title={fmt}
              >
                <Icon size={12} />
              </div>
            );
          })}
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-border">
          <div>
            <p className="text-sm font-heading line-through text-muted-foreground">
              ${book.price}
            </p>
            <p className="text-xl font-heading font-bold text-primary flex items-center gap-1">
              <Crown className="w-4 h-4" />
              ${book.memberPrice}
            </p>
          </div>
          {book.isPremiumOnly ? (
            <Button variant="outline" size="sm" asChild>
              <Link to="/membership">
                <Lock size={14} className="mr-1" />
                Unlock
              </Link>
            </Button>
          ) : (
            <Button variant="gold" size="sm">
              <ShoppingCart size={14} />
              Add to Cart
            </Button>
          )}
        </div>
      </div>
    </motion.div>
  );
};

const BooksPage = () => {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredBooks = allBooks.filter((book) => {
    const matchesCategory = selectedCategory === "All" || book.category === selectedCategory;
    const matchesSearch = book.title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <Layout>
      {/* Hero */}
      <section className="pt-32 pb-16 bg-gradient-hero text-cream">
        <div className="container-wide">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-3xl"
          >
            <span className="text-primary font-medium tracking-widest uppercase text-sm">
              Publications
            </span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-heading font-bold mt-4 mb-6">
              Wisdom In
              <span className="text-gradient-gold"> Your Hands</span>
            </h1>
            <p className="text-cream/70 text-lg">
              Explore our collection of transformative books and guides designed to help 
              you build the mindset for success.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Member Pricing Banner */}
      <section className="py-4 bg-primary/10 border-b border-primary/20">
        <div className="container-wide">
          <div className="flex items-center justify-center gap-2 text-sm">
            <Crown className="w-4 h-4 text-primary" />
            <span>
              <strong className="text-primary">Premium Members</strong> save up to 25% on all books
            </span>
            <Link to="/membership" className="text-primary underline hover:no-underline ml-2">
              Learn more →
            </Link>
          </div>
        </div>
      </section>

      {/* Filters */}
      <section className="py-8 bg-background border-b border-border sticky top-20 z-30 backdrop-blur-md bg-background/95">
        <div className="container-wide">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0">
              <Filter size={18} className="text-muted-foreground shrink-0" />
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
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

      {/* Books Grid */}
      <section className="section-padding bg-background">
        <div className="container-wide">
          {filteredBooks.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredBooks.map((book, index) => (
                <BookCard key={book.id} book={book} index={index} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <p className="text-muted-foreground text-lg">No books found matching your criteria.</p>
            </div>
          )}
        </div>
      </section>
    </Layout>
  );
};

export default BooksPage;
