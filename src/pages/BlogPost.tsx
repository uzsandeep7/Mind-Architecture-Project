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
  MessageCircle,
  ArrowLeft,
  Share2,
  Trash2,
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
  const { user: authUser, isMember, isAdmin, isOwner } = useAuth();
  const { slug } = useParams<{ slug: string }>();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isPostingComment, setIsPostingComment] = useState(false);
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
      } else {
        setPost(null);
        setComments([]);
      }
      setLoading(false);
    };

    fetchPost();
  }, [slug]);

  const fetchComments = async (postId: string) => {
    const { data, error } = await supabase
      .from("blog_comments")
      .select("id, content, created_at, user_id")
      .eq("post_id", postId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Failed to load blog comments:", error);
      setComments([]);
      return;
    }

    const userIds = [...new Set((data ?? []).map((comment) => comment.user_id))];
    const { data: profilesData, error: profilesError } =
      userIds.length > 0
        ? await supabase
            .from("profiles")
            .select("id, full_name")
            .in("id", userIds)
        : { data: [], error: null };

    if (profilesError) {
      console.warn("Failed to load comment profile names:", profilesError);
    }

    const profilesByUserId = new Map(
      (profilesData ?? []).map((profile) => [profile.id, profile.full_name]),
    );

    setComments(
      (data ?? []).map((comment) => ({
        ...comment,
        profile: {
          full_name: profilesByUserId.get(comment.user_id) ?? null,
        },
      })),
    );
  };

  const handleComment = async () => {
    const currentUser = user ?? authUser;

    if (!currentUser) {
      toast({
        title: "Please sign in",
        description: "You need to be signed in to comment.",
        variant: "destructive",
      });
      return;
    }

    if (!post || !newComment.trim()) return;

    setIsPostingComment(true);

    const commentText = newComment.trim();

    const { error } = await supabase
      .from("blog_comments")
      .insert({
        post_id: post.id,
        user_id: currentUser.id,
        content: commentText,
      });

    setIsPostingComment(false);

    if (error) {
      toast({
        title: "Could not post comment",
        description: error.message,
        variant: "destructive",
      });
      return;
    }

    setNewComment("");
    await fetchComments(post.id);

    toast({
      title: "Comment added",
      description: "Your comment has been posted successfully.",
    });
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!user) return;

    const confirmed = window.confirm("Delete this comment?");
    if (!confirmed) return;

    const { error } = await supabase.from("blog_comments").delete().eq("id", commentId);

    if (error) {
      toast({
        title: "Could not delete comment",
        description: error.message,
        variant: "destructive",
      });
      return;
    }

    setComments((current) => current.filter((comment) => comment.id !== commentId));
    toast({
      title: "Comment deleted",
      description: "The comment has been removed.",
    });
  };

  const handleShare = async () => {
    if (!post) return;

    const shareUrl = window.location.href;
    const shareData = {
      title: post.title,
      text: post.excerpt || "Read this Mind Architecture insight.",
      url: shareUrl,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
        return;
      }

      await navigator.clipboard.writeText(shareUrl);
      toast({
        title: "Link copied",
        description: "Article link copied to clipboard.",
      });
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return;

      toast({
        title: "Could not share article",
        description: "Please copy the page URL from your browser.",
        variant: "destructive",
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
              <span className="flex items-center gap-2 text-muted-foreground">
                <MessageCircle className="w-5 h-5" />
                {comments.length} comments
              </span>
            </div>
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={() => void handleShare()} aria-label="Share article">
                <Share2 className="w-5 h-5" />
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
            {user || authUser ? (
              <div className="space-y-4">
                <Textarea
                  placeholder="Share your thoughts..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  rows={4}
                />
                <Button
                  variant="gold"
                  onClick={() => void handleComment()}
                  disabled={!newComment.trim() || isPostingComment}
                >
                  {isPostingComment ? "Posting..." : "Post Comment"}
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
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">
                          {new Date(comment.created_at).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </span>
                        {user && (comment.user_id === user.id || isAdmin || isOwner) ? (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive hover:text-destructive"
                            onClick={() => void handleDeleteComment(comment.id)}
                            aria-label="Delete comment"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        ) : null}
                      </div>
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
