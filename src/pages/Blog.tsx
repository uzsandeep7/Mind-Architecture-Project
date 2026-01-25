import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Layout } from "@/components/layout/Layout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Clock, Heart, MessageCircle, Search, Filter, Crown, Lock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  cover_image_url: string | null;
  read_time_minutes: number | null;
  tags: string[] | null;
  published_at: string | null;
  created_at: string;
  isPremiumOnly?: boolean;
}

// Mock data for initial display
const mockPosts: BlogPost[] = [
  {
    id: "1",
    title: "From Tragedy to Transformation: The Power of Forgiveness",
    slug: "unlocking-mental-potential",
    excerpt: "Discover the key strategies to harness the full power of your mind and achieve extraordinary results in every area of life.",
    cover_image_url: "/Blog1.jpg",
    read_time_minutes: 8,
    tags: ["Mindset", "Growth"],
    published_at: "2026-01-05",
    created_at: "2026-01-05",
    isPremiumOnly: false,
  },
  {
    id: "2",
    title: "Why Your Success at Work Means Nothing if You're Failing at Home!",
    slug: "art-of-resilient-leadership",
    excerpt: "Learn how to lead with purpose and navigate challenges with grace while inspiring those around you.",
    cover_image_url: "/Blog2.jpg",
    read_time_minutes: 6,
    tags: ["Leadership", "Business"],
    published_at: "2026-01-02",
    created_at: "2026-01-02",
    isPremiumOnly: true,
  },
  {
    id: "3",
    title: "Why Resilience is the Real Solution to Bullying!",
    slug: "building-habits-that-last",
    excerpt: "Transform your daily routines into powerful habits that compound over time and create lasting change.",
    cover_image_url: "/Blog3.jpg",
    read_time_minutes: 5,
    tags: ["Habits", "Productivity"],
    published_at: "2025-12-28",
    created_at: "2025-12-28",
    isPremiumOnly: false,
  },
  {
    id: "4",
    title: "Practical Tips to Avoid Emotional Outbursts",
    slug: "science-of-motivation",
    excerpt: "Understanding the psychological drivers behind motivation and how to sustain it long-term.",
    cover_image_url: "/Blog4.jpg",
    read_time_minutes: 7,
    tags: ["Psychology", "Motivation"],
    published_at: "2025-12-20",
    created_at: "2025-12-20",
    isPremiumOnly: true,
  },
  {
    id: "5",
    title: "The Beauty and Brutality of Transition",
    slug: "mindfulness-modern-world",
    excerpt: "Practical strategies for incorporating mindfulness into your busy life and reaping its benefits.",
    cover_image_url: "/Blog5.jpg",
    read_time_minutes: 6,
    tags: ["Mindfulness", "Wellness"],
    published_at: "2025-12-15",
    created_at: "2025-12-15",
    isPremiumOnly: false,
  },
  {
    id: "6",
    title: "'If I Only Knew...'' – A Letter to Every Version of Me",
    slug: "overcoming-limiting-beliefs",
    excerpt: "Identify and break free from the mental barriers holding you back from your true potential.",
    cover_image_url: "/Blog6.jpg",
    read_time_minutes: 9,
    tags: ["Mindset", "Personal Growth"],
    published_at: "2025-12-10",
    created_at: "2025-12-10",
    isPremiumOnly: true,
  },
];

const allTags = ["All", "Mindset", "Leadership", "Habits", "Productivity", "Psychology", "Wellness", "Growth", "Business"];

const Blog = () => {
  const [posts, setPosts] = useState<BlogPost[]>(mockPosts);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTag, setSelectedTag] = useState("All");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPosts = async () => {
      const { data, error } = await supabase
        .from("blog_posts")
        .select("*")
        .eq("is_published", true)
        .order("published_at", { ascending: false });

      if (!error && data && data.length > 0) {
        setPosts(data);
      }
      setLoading(false);
    };

    fetchPosts();
  }, []);

  const filteredPosts = posts.filter((post) => {
    const matchesSearch =
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.excerpt?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTag =
      selectedTag === "All" || post.tags?.includes(selectedTag);
    return matchesSearch && matchesTag;
  });

  return (
    <Layout>
      {/* Hero */}
      <section className="pt-32 pb-16 bg-gradient-to-b from-dark to-background">
        <div className="container-wide">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-3xl mx-auto"
          >
            <Badge variant="outline" className="mb-4 border-primary/50 text-primary">
              Insights & Inspiration
            </Badge>
            <h1 className="text-4xl md:text-6xl font-heading font-bold mb-6">
              The Blog
            </h1>
            <p className="text-lg text-muted-foreground">
              Explore transformative ideas, practical strategies, and inspiring stories
              to fuel your personal and professional growth journey.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Premium Content Banner */}
      <section className="py-4 bg-primary/10 border-b border-primary/20">
        <div className="container-wide">
          <div className="flex items-center justify-center gap-2 text-sm">
            <Crown className="w-4 h-4 text-primary" />
            <span>
              <strong className="text-primary">Premium Members</strong> get exclusive access to in-depth articles
            </span>
            <Link to="/membership" className="text-primary underline hover:no-underline ml-2">
              Become a member →
            </Link>
          </div>
        </div>
      </section>

      {/* Filters */}
      <section className="py-8 border-b border-border sticky top-20 z-30 bg-background/95 backdrop-blur-md">
        <div className="container-wide">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="relative w-full md:w-96">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search articles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              {allTags.map((tag) => (
                <Button
                  key={tag}
                  variant={selectedTag === tag ? "gold" : "outline"}
                  size="sm"
                  onClick={() => setSelectedTag(tag)}
                >
                  {tag}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Posts Grid */}
      <section className="py-16">
        <div className="container-wide">
          {filteredPosts.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-muted-foreground text-lg">No articles found matching your criteria.</p>
              <Button
                variant="goldOutline"
                className="mt-4"
                onClick={() => {
                  setSearchQuery("");
                  setSelectedTag("All");
                }}
              >
                Clear Filters
              </Button>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredPosts.map((post, index) => (
                <motion.article
                  key={post.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.05 }}
                  viewport={{ once: true }}
                  className="group bg-card rounded-2xl overflow-hidden border border-border hover:border-primary/50 transition-all duration-300 hover:shadow-xl relative"
                >
                  <Link to={`/blog/${post.slug}`}>
                    <div className="aspect-video overflow-hidden bg-muted relative">
                      <img
                        src={post.cover_image_url || "/placeholder.svg"}
                        alt={post.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      {post.isPremiumOnly && (
                        <div className="absolute top-4 right-4">
                          <Badge className="bg-amber-500 text-black">
                            <Crown className="w-3 h-3 mr-1" />
                            Premium
                          </Badge>
                        </div>
                      )}
                    </div>
                  </Link>
                  <div className="p-6">
                    <div className="flex flex-wrap gap-2 mb-3">
                      {post.tags?.map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                    <Link to={`/blog/${post.slug}`}>
                      <h3 className="text-xl font-heading font-semibold mb-2 group-hover:text-primary transition-colors line-clamp-2">
                        {post.title}
                      </h3>
                    </Link>
                    <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
                      {post.excerpt}
                    </p>
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {post.read_time_minutes || 5} min read
                      </span>
                      {post.isPremiumOnly ? (
                        <span className="flex items-center gap-1 text-primary">
                          <Lock className="w-4 h-4" />
                          Members Only
                        </span>
                      ) : (
                        <span>
                          {post.published_at
                            ? new Date(post.published_at).toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              })
                            : ""}
                        </span>
                      )}
                    </div>
                  </div>
                </motion.article>
              ))}
            </div>
          )}
        </div>
      </section>
    </Layout>
  );
};

export default Blog;
