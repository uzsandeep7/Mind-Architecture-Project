import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight, Heart, Lightbulb, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const coreInsights = [
  {
    id: "1",
    title: "Navigating Stress with Resilience",
    slug: "navigating-stress-resilience",
    excerpt: "Learn practical strategies to transform workplace stress into opportunities for growth and connection.",
    icon: Shield,
    tags: ["Resilience", "Wellbeing"],
  },
  {
    id: "2",
    title: "Building Belonging in Teams",
    slug: "building-belonging-teams",
    excerpt: "Discover how to create cultures of care where every team member feels valued, heard, and empowered.",
    icon: Heart,
    tags: ["Leadership", "Community"],
  },
  {
    id: "3",
    title: "From Burnout to Balance",
    slug: "burnout-to-balance",
    excerpt: "Practical pathways to reset, reconnect, and rise after experiencing professional burnout.",
    icon: Lightbulb,
    tags: ["Balance", "Recovery"],
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
            Core Insights
          </Badge>
          <h2 className="text-4xl md:text-5xl font-heading font-bold mb-4">
            Resilience Resources
          </h2>
          <p className="text-muted-foreground max-w-3xl mx-auto text-lg">
            Empowering leaders to reset, reconnect, and rise. Explore transformative 
            ideas and practical strategies for building resilience and belonging.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {coreInsights.map((insight, index) => (
            <motion.article
              key={insight.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="group bg-card rounded-2xl overflow-hidden border border-border hover:border-primary/50 transition-all duration-300 hover:shadow-xl"
            >
              <div className="p-8">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-6 group-hover:bg-primary/20 transition-colors">
                  <insight.icon className="text-primary" size={28} />
                </div>
                
                <div className="flex flex-wrap gap-2 mb-4">
                  {insight.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
                
                <Link to={`/blog/${insight.slug}`}>
                  <h3 className="text-xl font-heading font-semibold mb-3 group-hover:text-primary transition-colors">
                    {insight.title}
                  </h3>
                </Link>
                
                <p className="text-muted-foreground mb-4">
                  {insight.excerpt}
                </p>
                
                <Link 
                  to={`/blog/${insight.slug}`}
                  className="text-primary font-medium inline-flex items-center gap-2 hover:gap-3 transition-all"
                >
                  Read More
                  <ArrowRight size={16} />
                </Link>
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
              Explore All Resources
              <ArrowRight className="ml-2 w-4 h-4" />
            </Link>
          </Button>
        </motion.div>
      </div>
    </section>
  );
};
