import { Layout } from "@/components/layout/Layout";
import { motion } from "framer-motion";
import { Star, Quote } from "lucide-react";

interface Testimonial {
  id: number;
  name: string;
  role: string;
  company: string;
  content: string;
  rating: number;
  imageUrl: string;
}

const testimonials: Testimonial[] = [
  {
    id: 1,
    name: "Sarah Mitchell",
    role: "CEO",
    company: "TechStart Ventures",
    content:
      "Dima completely transformed my approach to leadership. Her Mind Architecture framework helped me overcome self-doubt and lead my company through our most challenging period.",
    rating: 5,
    imageUrl:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150",
  },
  {
    id: 2,
    name: "Michael Chen",
    role: "Entrepreneur",
    company: "Chen Innovations",
    content:
      "The breakthrough weekend intensive was life-changing. I walked in feeling stuck and left with a clear vision and the mental tools to achieve it.",
    rating: 5,
    imageUrl:
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150",
  },
  {
    id: 3,
    name: "Emma Thompson",
    role: "Executive Coach",
    company: "Thompson Consulting",
    content:
      "As a coach myself, I’m selective about who I learn from. Dima’s methodology is backed by real results.",
    rating: 5,
    imageUrl:
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150",
  },
  {
    id: 4,
    name: "David Roberts",
    role: "Director",
    company: "Global Finance Corp",
    content:
      "Our executive team attended the Corporate Leadership Summit and the impact was immediate. Team cohesion improved significantly.",
    rating: 5,
    imageUrl:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150",
  },
  {
    id: 5,
    name: "Lisa Park",
    role: "Wellness Advocate",
    company: "Mindful Living Co.",
    content:
      "The practical tools in Mind Architecture helped me rebuild my life after burnout. Compassionate and actionable.",
    rating: 5,
    imageUrl:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150",
  },
  {
    id: 6,
    name: "James Wilson",
    role: "Sales Director",
    company: "Enterprise Solutions",
    content:
      "I was skeptical at first, but the results speak for themselves. My team’s performance improved by 40%.",
    rating: 5,
    imageUrl:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150",
  },
  {
    id: 7,
    name: "Rachel Green",
    role: "Startup Founder",
    company: "GreenTech Solutions",
    content:
      "The consultation sessions were exactly what I needed. Game-changing insights.",
    rating: 5,
    imageUrl:
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150",
  },
  {
    id: 8,
    name: "Thomas Anderson",
    role: "Corporate Trainer",
    company: "Leadership Academy",
    content:
      "Nothing compares to the depth and practicality of Mind Architecture. It’s now the foundation of my training curriculum.",
    rating: 5,
    imageUrl:
      "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150",
  },
  {
    id: 9,
    name: "Amanda Foster",
    role: "HR Director",
    company: "Global Enterprises",
    content:
      "Employee engagement scores increased by 25% in the following quarter after our session.",
    rating: 5,
    imageUrl:
      "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=150",
  },
];

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
        <Star
          key={i}
          size={16}
          className="fill-primary text-primary"
        />
      ))}
    </div>

    <p className="text-foreground/90 text-sm leading-relaxed mb-5 italic">
      “{testimonial.content}”
    </p>

    <div className="mt-auto flex items-center gap-3">
      <img
        src={testimonial.imageUrl}
        alt={testimonial.name}
        className="w-11 h-11 rounded-full object-cover"
      />
      <div>
        <p className="font-semibold text-sm">{testimonial.name}</p>
        <p className="text-xs text-muted-foreground">
          {testimonial.role}, {testimonial.company}
        </p>
      </div>
    </div>
  </motion.div>
);

const TestimonialsPage = () => {
  return (
    <Layout>
      {/* Hero */}
      <section className="pt-32 pb-16 bg-gradient-hero text-cream">
        <div className="container-wide text-center max-w-3xl mx-auto">
          <span className="text-primary uppercase tracking-widest text-sm">
            Testimonials
          </span>
          <h1 className="text-4xl md:text-5xl font-heading font-bold mt-4 mb-6">
            Stories of <span className="text-gradient-gold">Transformation</span>
          </h1>
          <p className="text-cream/70 text-lg">
            Real experiences from people who transformed their mindset and results.
          </p>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 border-b border-border">
        <div className="container-wide grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {[
            { number: "4.9/5", label: "Average Rating" },
            { number: "2,500+", label: "5-Star Reviews" },
            { number: "98%", label: "Would Recommend" },
            { number: "50K+", label: "Lives Changed" },
          ].map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <p className="text-3xl font-bold text-primary">{stat.number}</p>
              <p className="text-sm text-muted-foreground">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Grid */}
      <section className="section-padding">
        <div className="container-wide">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-auto">
            {testimonials.map((t, i) => (
              <TestimonialCard key={t.id} testimonial={t} index={i} />
            ))}
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default TestimonialsPage;
