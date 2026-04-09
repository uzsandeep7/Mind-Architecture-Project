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
import { useAuth } from "@/hooks/useAuth";

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
  is_members_only: boolean;
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

const BlogPostPage = () => {
  const { isMember } = useAuth();
  const { slug } = useParams<{ slug: string }>();
  const [post, setPost] = useState<BlogPost | null>(null);
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
      if (!slug) {
        setLoading(false);
        return;
      }

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
      } else {
        setPost(null);
        setComments([]);
        setLikes(0);
        setHasLiked(false);
      }
      setLoading(false);
    };

    fetchPost();
  }, [slug]);

  useEffect(() => {
    if (post && user && !post.id.startsWith("mock-")) {
      fetchLikes(post.id);
    }
  }, [user, post]);

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

  if (loading) {
    return (
      <Layout>
        <div className="pt-32 pb-16 text-center">
          <h1 className="text-2xl font-heading">Loading article...</h1>
        </div>
      </Layout>
    );
  }

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
              {post.is_members_only ? (
                <Badge className="bg-amber-500 text-black">Members Only</Badge>
              ) : null}
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
          {post.is_members_only && !isMember ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="rounded-2xl border border-amber-500/30 bg-card p-8 text-center"
            >
              <h2 className="mb-3 text-2xl font-heading font-bold">Members-only article</h2>
              <p className="mb-6 text-muted-foreground">
                Upgrade to premium membership to unlock this full article and the rest of the members-only library.
              </p>
              <Button variant="gold" asChild>
                <Link to="/membership">Unlock with Premium</Link>
              </Button>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="prose prose-lg dark:prose-invert max-w-none"
              dangerouslySetInnerHTML={{ __html: post.content.replace(/\n/g, "<br />") }}
            />
          )}
        </div>
      </section>

      {/* Engagement Bar */}
      {!post.is_members_only || isMember ? (
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
      ) : null}

      {/* Comments */}
      {!post.is_members_only || isMember ? (
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
      ) : null}
    </Layout>
  );
};

export default BlogPostPage;
