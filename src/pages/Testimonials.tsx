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
  featured?: boolean;
}

const testimonials: Testimonial[] = [
  {
    id: 1,
    name: "Sarah Mitchell",
    role: "CEO",
    company: "TechStart Ventures",
    content: "Dr. Williams completely transformed my approach to leadership. His Mind Architecture framework helped me overcome self-doubt and lead my company through our most challenging period. We've since grown 300% and I attribute much of that success to the mindset shifts I experienced.",
    rating: 5,
    imageUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150",
    featured: true,
  },
  {
    id: 2,
    name: "Michael Chen",
    role: "Entrepreneur",
    company: "Chen Innovations",
    content: "The breakthrough weekend intensive was life-changing. I walked in feeling stuck and left with a clear vision and the mental tools to achieve it. Best investment I've ever made in myself.",
    rating: 5,
    imageUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150",
  },
  {
    id: 3,
    name: "Emma Thompson",
    role: "Executive Coach",
    company: "Thompson Consulting",
    content: "As a coach myself, I'm selective about who I learn from. Marcus's methodology is backed by real results. His books are now required reading for all my clients.",
    rating: 5,
    imageUrl: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150",
  },
  {
    id: 4,
    name: "David Roberts",
    role: "Director",
    company: "Global Finance Corp",
    content: "Our executive team attended the Corporate Leadership Summit and the impact was immediate. Team cohesion improved, and we hit our quarterly targets for the first time in two years.",
    rating: 5,
    imageUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150",
  },
  {
    id: 5,
    name: "Lisa Park",
    role: "Wellness Advocate",
    company: "Mindful Living Co.",
    content: "The practical tools in 'Mind Architecture' helped me rebuild my life after burnout. Marcus's compassionate approach combined with actionable strategies is truly unique.",
    rating: 5,
    imageUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150",
  },
  {
    id: 6,
    name: "James Wilson",
    role: "Sales Director",
    company: "Enterprise Solutions",
    content: "I was skeptical at first, but the results speak for themselves. My team's performance improved by 40% after implementing the techniques from the masterclass.",
    rating: 5,
    imageUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150",
  },
  {
    id: 7,
    name: "Rachel Green",
    role: "Startup Founder",
    company: "GreenTech Solutions",
    content: "The consultation sessions were exactly what I needed. Marcus helped me identify blind spots I didn't even know existed. Game-changing insights.",
    rating: 5,
    imageUrl: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150",
  },
  {
    id: 8,
    name: "Thomas Anderson",
    role: "Corporate Trainer",
    company: "Leadership Academy",
    content: "I've attended countless development programs, but nothing compares to the depth and practicality of Mind Architecture. It's now the foundation of my training curriculum.",
    rating: 5,
    imageUrl: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150",
    featured: true,
  },
  {
    id: 9,
    name: "Amanda Foster",
    role: "HR Director",
    company: "Global Enterprises",
    content: "We brought Dr. Williams in for a company-wide session and the feedback was phenomenal. Employee engagement scores increased by 25% in the following quarter.",
    rating: 5,
    imageUrl: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=150",
  },
];

const TestimonialCard = ({ testimonial, index }: { testimonial: Testimonial; index: number }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className={`bg-card rounded-xl p-8 shadow-soft border border-border hover-lift ${
        testimonial.featured ? "lg:col-span-2 lg:row-span-2" : ""
      }`}
    >
      <Quote className="text-primary mb-4" size={testimonial.featured ? 40 : 28} />
      
      <div className="flex gap-1 mb-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            size={testimonial.featured ? 20 : 16}
            className={i < testimonial.rating ? "fill-primary text-primary" : "text-muted"}
          />
        ))}
      </div>
      
      <p className={`text-foreground/90 leading-relaxed mb-6 italic ${
        testimonial.featured ? "text-xl" : "text-base"
      }`}>
        "{testimonial.content}"
      </p>
      
      <div className="flex items-center gap-4">
        <img
          src={testimonial.imageUrl}
          alt={testimonial.name}
          className={`rounded-full object-cover ${testimonial.featured ? "w-16 h-16" : "w-12 h-12"}`}
        />
        <div>
          <p className={`font-semibold ${testimonial.featured ? "text-lg" : ""}`}>
            {testimonial.name}
          </p>
          <p className="text-sm text-muted-foreground">
            {testimonial.role}, {testimonial.company}
          </p>
        </div>
      </div>
    </motion.div>
  );
};

const TestimonialsPage = () => {
  return (
    <Layout>
      {/* Hero */}
      <section className="pt-32 pb-16 bg-gradient-hero text-cream">
        <div className="container-wide">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-3xl text-center mx-auto"
          >
            <span className="text-primary font-medium tracking-widest uppercase text-sm">
              Testimonials
            </span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-heading font-bold mt-4 mb-6">
              Stories of
              <span className="text-gradient-gold"> Transformation</span>
            </h1>
            <p className="text-cream/70 text-lg">
              Hear from those who have experienced the power of mindset transformation 
              and achieved extraordinary results in their personal and professional lives.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 bg-background border-b border-border">
        <div className="container-wide">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { number: "4.9/5", label: "Average Rating" },
              { number: "2,500+", label: "5-Star Reviews" },
              { number: "98%", label: "Would Recommend" },
              { number: "50K+", label: "Lives Changed" },
            ].map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <p className="text-3xl md:text-4xl font-heading font-bold text-primary">
                  {stat.number}
                </p>
                <p className="text-muted-foreground text-sm mt-1">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Grid */}
      <section className="section-padding bg-background">
        <div className="container-wide">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {testimonials.map((testimonial, index) => (
              <TestimonialCard
                key={testimonial.id}
                testimonial={testimonial}
                index={index}
              />
            ))}
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default TestimonialsPage;
