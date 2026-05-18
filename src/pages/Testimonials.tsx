import { Layout } from "@/components/layout/Layout";
import { motion } from "framer-motion";
import { Star, Quote } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

type Testimonial = Database["public"]["Tables"]["testimonials"]["Row"];

const TestimonialCard = ({
  testimonial,
  index,
}: {
  testimonial: Testimonial;
  index: number;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.4, delay: index * 0.05 }}
    className="bg-card border border-border rounded-xl p-6 shadow-soft flex flex-col"
  >
    <Quote className="text-primary mb-3" size={26} />

    <div className="flex gap-1 mb-3">
      {Array.from({ length: testimonial.rating }).map((_, i) => (
        <Star key={i} size={16} className="fill-primary text-primary" />
      ))}
    </div>

    <p className="text-foreground/90 text-sm leading-relaxed mb-5 italic">
      "{testimonial.content}"
    </p>

    <div className="mt-auto flex items-center gap-3">
      {testimonial.image_url ? (
        <img
          src={testimonial.image_url}
          alt={testimonial.name}
          className="w-11 h-11 rounded-full object-cover"
        />
      ) : (
        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-primary/15 text-sm font-bold text-primary">
          {testimonial.name.slice(0, 1).toUpperCase()}
        </div>
      )}
      <div>
        <p className="font-semibold text-sm">{testimonial.name}</p>
        <p className="text-xs text-muted-foreground">
          {[testimonial.role, testimonial.company].filter(Boolean).join(", ")}
        </p>
      </div>
    </div>
  </motion.div>
);

const TestimonialsPage = () => {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadTestimonials = async () => {
      const { data, error } = await supabase
        .from("testimonials")
        .select("*")
        .eq("is_published", true)
        .order("display_order", { ascending: true })
        .order("created_at", { ascending: false });

      if (!error) {
        setTestimonials(data ?? []);
      }
      setIsLoading(false);
    };

    void loadTestimonials();
  }, []);

  const averageRating =
    testimonials.length > 0
      ? testimonials.reduce((total, testimonial) => total + testimonial.rating, 0) / testimonials.length
      : 0;

  return (
    <Layout>
      <section className="pt-32 pb-16 bg-gradient-hero text-cream">
        <div className="container-wide text-center max-w-3xl mx-auto">
          <span className="text-primary uppercase tracking-widest text-sm">
            Testimonials
          </span>
          <h1 className="text-4xl md:text-5xl font-heading font-bold mt-4 mb-6">
            Stories of <span className="text-gradient-gold">Transformation</span>
          </h1>
          <p className="text-cream/70 text-lg">
            Real client feedback and experiences can be added from the admin dashboard.
          </p>
        </div>
      </section>

      <section className="py-12 border-b border-border">
        <div className="container-wide grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          {[
            { number: testimonials.length.toString(), label: "Published Testimonials" },
            { number: averageRating ? `${averageRating.toFixed(1)}/5` : "Not yet rated", label: "Average Rating" },
            { number: "Admin Managed", label: "Content Source" },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
            >
              <p className="text-3xl font-bold text-primary">{stat.number}</p>
              <p className="text-sm text-muted-foreground">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="section-padding">
        <div className="container-wide">
          {isLoading ? (
            <div className="rounded-xl border border-dashed border-border p-8 text-center text-muted-foreground">
              Loading testimonials...
            </div>
          ) : testimonials.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-auto">
              {testimonials.map((testimonial, i) => (
                <TestimonialCard key={testimonial.id} testimonial={testimonial} index={i} />
              ))}
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-border p-8 text-center text-muted-foreground">
              No testimonials have been published yet. Add testimonials from the admin dashboard to show them here.
            </div>
          )}
        </div>
      </section>
    </Layout>
  );
};

export default TestimonialsPage;
