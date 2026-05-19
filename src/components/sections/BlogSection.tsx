import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight, Clock, Crown, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

type BlogPost = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  cover_image_url: string | null;
  tags: string[] | null;
  read_time_minutes: number | null;
  is_members_only: boolean;
};

export const BlogSection = () => {
  const { isMember } = useAuth();
  const [posts, setPosts] = useState<BlogPost[]>([]);

  useEffect(() => {
    const loadPosts = async () => {
      const { data } = await supabase
        .from("blog_posts")
        .select("*")
        .eq("is_published", true)
        .order("created_at", { ascending: false })
        .limit(3);

      setPosts(data ?? []);
    };

    void loadPosts();
  }, []);

  if (posts.length === 0) return null;

  return (
    <section className="bg-secondary/30 py-24">
      <div className="container-wide">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="mb-16 text-center"
        >
          <Badge variant="outline" className="mb-4">
            Core Insights
          </Badge>
          <h2 className="mb-4 text-4xl font-heading font-bold md:text-5xl">
            Resilience Insights
          </h2>
          <p className="mx-auto max-w-3xl text-lg text-muted-foreground">
            This homepage section only appears when live insights have been added from the admin dashboard.
          </p>
        </motion.div>

        <div className="mb-12 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {posts.map((post, index) => (
            <motion.article
              key={post.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="group overflow-hidden rounded-2xl border border-border bg-card transition-all duration-300 hover:border-primary/50 hover:shadow-xl"
            >
              <Link to={post.is_members_only && !isMember ? "/membership" : `/insights/${post.slug}`}>
                <div className="relative aspect-video overflow-hidden bg-muted">
                  <img
                    src={post.cover_image_url || "/placeholder.svg"}
                    alt={post.title}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  {post.is_members_only ? (
                    <div className="absolute right-4 top-4">
                      <Badge className="bg-amber-500 text-black">
                        <Crown className="mr-1 h-3 w-3" />
                        Members Only
                      </Badge>
                    </div>
                  ) : null}
                </div>
              </Link>

              <div className="p-8">
                <div className="mb-4 flex flex-wrap gap-2">
                  {post.tags?.map((tag) => (
                    <Badge key={tag} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>

                <Link to={post.is_members_only && !isMember ? "/membership" : `/insights/${post.slug}`}>
                  <h3 className="mb-3 text-xl font-heading font-semibold transition-colors group-hover:text-primary">
                    {post.title}
                  </h3>
                </Link>

                <p className="mb-4 text-muted-foreground">
                  {post.excerpt || "Live backend-managed article content."}
                </p>

                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {post.read_time_minutes || 5} min read
                  </span>
                  <Link to={post.is_members_only && !isMember ? "/membership" : `/insights/${post.slug}`} className="inline-flex items-center gap-2 font-medium text-primary transition-all hover:gap-3">
                    {post.is_members_only && !isMember ? (
                      <>
                        <Lock className="h-4 w-4" />
                        Unlock
                      </>
                    ) : (
                      "Read More"
                    )}
                    <ArrowRight size={16} />
                  </Link>
                </div>
              </div>
            </motion.article>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <Button variant="goldOutline" size="lg" asChild>
            <Link to="/insights">
              Explore All Insights
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </motion.div>
      </div>
    </section>
  );
};
