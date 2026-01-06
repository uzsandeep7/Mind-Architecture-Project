import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight, Clock, Heart, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const featuredPosts = [
  {
    id: "1",
    title: "Unlocking Your Mental Potential",
    slug: "unlocking-mental-potential",
    excerpt: "Discover the key strategies to harness the full power of your mind and achieve extraordinary results in every area of life.",
    coverImage: "/placeholder.svg",
    readTime: 8,
    likes: 234,
    comments: 45,
    tags: ["Mindset", "Growth"],
    publishedAt: "2026-01-05",
  },
  {
    id: "2",
    title: "The Art of Resilient Leadership",
    slug: "art-of-resilient-leadership",
    excerpt: "Learn how to lead with purpose and navigate challenges with grace while inspiring those around you.",
    coverImage: "/placeholder.svg",
    readTime: 6,
    likes: 189,
    comments: 32,
    tags: ["Leadership", "Business"],
    publishedAt: "2026-01-02",
  },
  {
    id: "3",
    title: "Building Habits That Last",
    slug: "building-habits-that-last",
    excerpt: "Transform your daily routines into powerful habits that compound over time and create lasting change.",
    coverImage: "/placeholder.svg",
    readTime: 5,
    likes: 312,
    comments: 67,
    tags: ["Habits", "Productivity"],
    publishedAt: "2025-12-28",
  },
];

export const BlogSection = () => {
  return (
    <section className="py-24 bg-secondary/30">
      <div className="container-wide">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <Badge variant="outline" className="mb-4">
            Latest Insights
          </Badge>
          <h2 className="text-4xl md:text-5xl font-heading font-bold mb-4">
            From the Blog
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Explore transformative ideas, practical strategies, and inspiring stories
            to fuel your personal and professional growth journey.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {featuredPosts.map((post, index) => (
            <motion.article
              key={post.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="group bg-card rounded-2xl overflow-hidden border border-border hover:border-primary/50 transition-all duration-300 hover:shadow-xl"
            >
              <Link to={`/blog/${post.slug}`}>
                <div className="aspect-video overflow-hidden bg-muted">
                  <img
                    src={post.coverImage}
                    alt={post.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
              </Link>
              <div className="p-6">
                <div className="flex flex-wrap gap-2 mb-3">
                  {post.tags.map((tag) => (
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
                  <div className="flex items-center gap-4">
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {post.readTime} min
                    </span>
                    <span className="flex items-center gap-1">
                      <Heart className="w-4 h-4" />
                      {post.likes}
                    </span>
                    <span className="flex items-center gap-1">
                      <MessageCircle className="w-4 h-4" />
                      {post.comments}
                    </span>
                  </div>
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
            <Link to="/blog">
              View All Articles
              <ArrowRight className="ml-2 w-4 h-4" />
            </Link>
          </Button>
        </motion.div>
      </div>
    </section>
  );
};
