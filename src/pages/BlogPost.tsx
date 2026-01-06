import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Layout } from "@/components/layout/Layout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Clock,
  Heart,
  MessageCircle,
  ArrowLeft,
  Share2,
  Bookmark,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import type { User } from "@supabase/supabase-js";

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  cover_image_url: string | null;
  read_time_minutes: number | null;
  tags: string[] | null;
  published_at: string | null;
  author_id: string | null;
}

interface Comment {
  id: string;
  content: string;
  created_at: string;
  user_id: string;
  profile?: {
    full_name: string | null;
  };
}

// Mock post for initial display
const mockPost: BlogPost = {
  id: "1",
  title: "Unlocking Your Mental Potential",
  slug: "unlocking-mental-potential",
  excerpt:
    "Discover the key strategies to harness the full power of your mind and achieve extraordinary results in every area of life.",
  content: `
## Introduction

The human mind is an incredible instrument capable of extraordinary achievements. Yet most of us use only a fraction of our mental potential. This article explores practical strategies for unlocking the full power of your mind.

## The Power of Neuroplasticity

Our brains are remarkably adaptable. Through consistent practice and the right techniques, we can literally rewire our neural pathways to support greater success, creativity, and well-being.

### Key Principles

1. **Consistency Over Intensity**: Small, daily practices compound over time
2. **Challenge Your Comfort Zone**: Growth happens at the edge of your abilities
3. **Rest and Recovery**: The brain consolidates learning during rest

## Practical Strategies

### Morning Mindset Rituals

Start each day with intention. Spend 10-15 minutes on activities that prime your mind for success:

- Meditation or deep breathing
- Journaling your intentions
- Visualization of your goals

### Continuous Learning

Keep your mind sharp by constantly learning new skills. This builds cognitive reserve and keeps neural pathways strong.

### Physical Exercise

Movement is essential for brain health. Regular exercise increases blood flow to the brain and promotes the growth of new neurons.

## Conclusion

Unlocking your mental potential is not about dramatic transformations overnight. It's about consistent, intentional practices that compound over time. Start small, stay consistent, and watch your potential unfold.

---

*Ready to take the next step? Join us at the upcoming Mindset Mastery Summit to dive deeper into these transformative practices.*
  `,
  cover_image_url: "/placeholder.svg",
  read_time_minutes: 8,
  tags: ["Mindset", "Growth", "Personal Development"],
  published_at: "2026-01-05",
  author_id: null,
};

const BlogPostPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const [post, setPost] = useState<BlogPost | null>(mockPost);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [user, setUser] = useState<User | null>(null);
  const [likes, setLikes] = useState(234);
  const [hasLiked, setHasLiked] = useState(false);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null);
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const fetchPost = async () => {
      if (!slug) return;

      const { data, error } = await supabase
        .from("blog_posts")
        .select("*")
        .eq("slug", slug)
        .eq("is_published", true)
        .maybeSingle();

      if (!error && data) {
        setPost(data);
        fetchComments(data.id);
        fetchLikes(data.id);
      }
      setLoading(false);
    };

    fetchPost();
  }, [slug]);

  const fetchComments = async (postId: string) => {
    const { data } = await supabase
      .from("blog_comments")
      .select(`
        id,
        content,
        created_at,
        user_id,
        profiles:user_id (full_name)
      `)
      .eq("post_id", postId)
      .order("created_at", { ascending: false });

    if (data) {
      setComments(data.map(c => ({
        ...c,
        profile: Array.isArray(c.profiles) ? c.profiles[0] : c.profiles
      })));
    }
  };

  const fetchLikes = async (postId: string) => {
    const { count } = await supabase
      .from("blog_likes")
      .select("*", { count: "exact", head: true })
      .eq("post_id", postId);

    setLikes(count || 0);

    if (user) {
      const { data } = await supabase
        .from("blog_likes")
        .select("id")
        .eq("post_id", postId)
        .eq("user_id", user.id)
        .maybeSingle();

      setHasLiked(!!data);
    }
  };

  const handleLike = async () => {
    if (!user) {
      toast({
        title: "Please sign in",
        description: "You need to be signed in to like posts.",
        variant: "destructive",
      });
      return;
    }

    if (!post) return;

    if (hasLiked) {
      await supabase
        .from("blog_likes")
        .delete()
        .eq("post_id", post.id)
        .eq("user_id", user.id);
      setLikes((prev) => prev - 1);
      setHasLiked(false);
    } else {
      await supabase.from("blog_likes").insert({
        post_id: post.id,
        user_id: user.id,
      });
      setLikes((prev) => prev + 1);
      setHasLiked(true);
    }
  };

  const handleComment = async () => {
    if (!user) {
      toast({
        title: "Please sign in",
        description: "You need to be signed in to comment.",
        variant: "destructive",
      });
      return;
    }

    if (!post || !newComment.trim()) return;

    const { error } = await supabase.from("blog_comments").insert({
      post_id: post.id,
      user_id: user.id,
      content: newComment.trim(),
    });

    if (!error) {
      setNewComment("");
      fetchComments(post.id);
      toast({
        title: "Comment added",
        description: "Your comment has been posted successfully.",
      });
    }
  };

  if (!post) {
    return (
      <Layout>
        <div className="pt-32 pb-16 text-center">
          <h1 className="text-2xl font-heading">Post not found</h1>
          <Button variant="goldOutline" className="mt-4" asChild>
            <Link to="/blog">Back to Blog</Link>
          </Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      {/* Hero */}
      <section className="pt-32 pb-8">
        <div className="container max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Link
              to="/blog"
              className="inline-flex items-center text-muted-foreground hover:text-primary transition-colors mb-8"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Blog
            </Link>

            <div className="flex flex-wrap gap-2 mb-4">
              {post.tags?.map((tag) => (
                <Badge key={tag} variant="secondary">
                  {tag}
                </Badge>
              ))}
            </div>

            <h1 className="text-4xl md:text-5xl font-heading font-bold mb-6">
              {post.title}
            </h1>

            <div className="flex items-center gap-6 text-muted-foreground mb-8">
              <span className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                {post.read_time_minutes || 5} min read
              </span>
              <span>
                {post.published_at
                  ? new Date(post.published_at).toLocaleDateString("en-US", {
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    })
                  : ""}
              </span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Cover Image */}
      <section className="pb-12">
        <div className="container max-w-4xl">
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="aspect-video rounded-2xl overflow-hidden bg-muted"
          >
            <img
              src={post.cover_image_url || "/placeholder.svg"}
              alt={post.title}
              className="w-full h-full object-cover"
            />
          </motion.div>
        </div>
      </section>

      {/* Content */}
      <section className="pb-16">
        <div className="container max-w-3xl">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="prose prose-lg dark:prose-invert max-w-none"
            dangerouslySetInnerHTML={{ __html: post.content.replace(/\n/g, "<br />") }}
          />
        </div>
      </section>

      {/* Engagement Bar */}
      <section className="py-8 border-y border-border">
        <div className="container max-w-3xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <button
                onClick={handleLike}
                className={`flex items-center gap-2 transition-colors ${
                  hasLiked ? "text-red-500" : "text-muted-foreground hover:text-red-500"
                }`}
              >
                <Heart className={`w-5 h-5 ${hasLiked ? "fill-current" : ""}`} />
                <span>{likes} likes</span>
              </button>
              <span className="flex items-center gap-2 text-muted-foreground">
                <MessageCircle className="w-5 h-5" />
                {comments.length} comments
              </span>
            </div>
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon">
                <Share2 className="w-5 h-5" />
              </Button>
              <Button variant="ghost" size="icon">
                <Bookmark className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Comments */}
      <section className="py-16">
        <div className="container max-w-3xl">
          <h2 className="text-2xl font-heading font-bold mb-8">
            Comments ({comments.length})
          </h2>

          {/* Comment Form */}
          <div className="mb-12">
            {user ? (
              <div className="space-y-4">
                <Textarea
                  placeholder="Share your thoughts..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  rows={4}
                />
                <Button variant="gold" onClick={handleComment} disabled={!newComment.trim()}>
                  Post Comment
                </Button>
              </div>
            ) : (
              <div className="bg-muted p-6 rounded-xl text-center">
                <p className="text-muted-foreground mb-4">
                  Sign in to join the conversation
                </p>
                <Button variant="gold" asChild>
                  <Link to="/auth">Sign In</Link>
                </Button>
              </div>
            )}
          </div>

          {/* Comments List */}
          <div className="space-y-6">
            {comments.map((comment) => (
              <motion.div
                key={comment.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-card p-6 rounded-xl border border-border"
              >
                <div className="flex items-start gap-4">
                  <Avatar>
                    <AvatarFallback>
                      {comment.profile?.full_name?.charAt(0) || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">
                        {comment.profile?.full_name || "Anonymous"}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {new Date(comment.created_at).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </span>
                    </div>
                    <p className="text-muted-foreground">{comment.content}</p>
                  </div>
                </div>
              </motion.div>
            ))}

            {comments.length === 0 && (
              <p className="text-center text-muted-foreground py-8">
                No comments yet. Be the first to share your thoughts!
              </p>
            )}
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default BlogPostPage;
