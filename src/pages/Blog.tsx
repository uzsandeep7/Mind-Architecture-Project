import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Layout } from "@/components/layout/Layout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Clock, Search, Crown, Lock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

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
  is_members_only: boolean;
}

const Blog = () => {
  const { isMember } = useAuth();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTag, setSelectedTag] = useState("All");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPosts = async () => {
      const { data } = await supabase
        .from("blog_posts")
        .select("*")
        .eq("is_published", true)
        .order("published_at", { ascending: false });

      setPosts(data ?? []);
      setLoading(false);
    };

    void fetchPosts();
  }, []);

  const allTags = useMemo(
    () => ["All", ...Array.from(new Set(posts.flatMap((post) => post.tags ?? []))).sort()],
    [posts],
  );

  const filteredPosts = posts.filter((post) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      post.title.toLowerCase().includes(q) ||
      (post.excerpt ?? "").toLowerCase().includes(q);
    const matchesTag = selectedTag === "All" || post.tags?.includes(selectedTag);
    return matchesSearch && matchesTag;
  });

  return (
    <Layout>
      <section className="bg-gradient-to-b from-dark to-background pb-16 pt-32">
        <div className="container-wide">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mx-auto max-w-3xl text-center"
          >
            <Badge variant="outline" className="mb-4 border-primary/50 text-primary">
              Insights & Inspiration
            </Badge>
            <h1 className="mb-6 text-4xl font-heading font-bold md:text-6xl">Insights</h1>
            <p className="text-lg text-muted-foreground">
              Explore fresh insights and articles from the Mind Architecture library.
            </p>
          </motion.div>
        </div>
      </section>

      <section className="sticky top-16 z-30 border-b border-border bg-background/95 py-8 backdrop-blur-md">
        <div className="container-wide">
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            <div className="relative w-full md:w-96">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
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
                <Button key={tag} variant={selectedTag === tag ? "gold" : "outline"} size="sm" onClick={() => setSelectedTag(tag)}>
                  {tag}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="container-wide">
          {loading ? (
            <div className="py-16 text-center text-lg text-muted-foreground">Loading articles...</div>
          ) : filteredPosts.length === 0 ? (
            <div className="py-16 text-center">
              <p className="text-lg text-muted-foreground">No articles found matching your criteria.</p>
              <Button variant="goldOutline" className="mt-4" onClick={() => { setSearchQuery(""); setSelectedTag("All"); }}>
                Clear Filters
              </Button>
            </div>
          ) : (
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {filteredPosts.map((post, index) => (
                <motion.article
                  key={post.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.05 }}
                  viewport={{ once: true }}
                  className="group relative overflow-hidden rounded-2xl border border-border bg-card transition-all duration-300 hover:border-primary/50 hover:shadow-xl"
                >
                      <Link to={post.is_members_only && !isMember ? "/membership" : `/insights/${post.slug}`}>
                        <div className="relative aspect-video overflow-hidden bg-muted">
                          <img
                            src={post.cover_image_url || "/placeholder.svg"}
                            alt={post.title}
                            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                      {post.is_members_only ? (
                        <div className="absolute top-4 right-4">
                          <Badge className="bg-amber-500 text-black">
                            <Crown className="mr-1 h-3 w-3" />
                            Premium
                          </Badge>
                        </div>
                      ) : null}
                    </div>
                  </Link>
                  <div className="p-6">
                    <div className="mb-3 flex flex-wrap gap-2">
                      {post.tags?.map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                    <Link to={post.is_members_only && !isMember ? "/membership" : `/insights/${post.slug}`}>
                      <h3 className="mb-2 line-clamp-2 text-xl font-heading font-semibold transition-colors group-hover:text-primary">
                        {post.title}
                      </h3>
                    </Link>
                    <p className="mb-4 line-clamp-2 text-sm text-muted-foreground">{post.excerpt}</p>
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {post.read_time_minutes || 5} min read
                      </span>
                      {post.is_members_only ? (
                        <span className="flex items-center gap-1 text-primary">
                          <Lock className="h-4 w-4" />
                          {isMember ? "Premium" : "Members Only"}
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
