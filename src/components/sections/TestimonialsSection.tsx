import { motion } from "framer-motion";
import { Star, Quote } from "lucide-react";
import { useState, useEffect } from "react";

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
    content: "Dr. Williams completely transformed my approach to leadership. His Mind Architecture framework helped me overcome self-doubt and lead my company through our most challenging period. We've since grown 300%.",
    rating: 5,
    imageUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150",
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
];

const TestimonialCard = ({ testimonial, isActive }: { testimonial: Testimonial; isActive: boolean }) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: isActive ? 1 : 0.5, scale: isActive ? 1 : 0.95 }}
      transition={{ duration: 0.4 }}
      className={`bg-card rounded-xl p-8 shadow-soft border border-border ${
        isActive ? "ring-2 ring-primary/20" : ""
      }`}
    >
      <Quote className="text-primary mb-4" size={32} />
      
      <div className="flex gap-1 mb-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            size={16}
            className={i < testimonial.rating ? "fill-primary text-primary" : "text-muted"}
          />
        ))}
      </div>
      
      <p className="text-foreground/90 leading-relaxed mb-6 text-lg italic">
        "{testimonial.content}"
      </p>
      
      <div className="flex items-center gap-4">
        <img
          src={testimonial.imageUrl}
          alt={testimonial.name}
          className="w-12 h-12 rounded-full object-cover"
        />
        <div>
          <p className="font-semibold">{testimonial.name}</p>
          <p className="text-sm text-muted-foreground">
            {testimonial.role}, {testimonial.company}
          </p>
        </div>
      </div>
    </motion.div>
  );
};

export const TestimonialsSection = () => {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="section-padding bg-gradient-hero text-cream">
      <div className="container-wide">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <span className="text-primary font-medium tracking-widest uppercase text-sm">
            Testimonials
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-heading font-bold mt-4 mb-6 text-cream">
            Stories of Transformation
          </h2>
          <p className="text-cream/70 max-w-2xl mx-auto">
            Hear from those who have experienced the power of mindset transformation 
            and achieved extraordinary results.
          </p>
        </motion.div>

        {/* Desktop Testimonials Grid */}
        <div className="hidden lg:grid grid-cols-3 gap-6 mb-8">
          {testimonials.slice(0, 3).map((testimonial, index) => (
            <TestimonialCard
              key={testimonial.id}
              testimonial={testimonial}
              isActive={index === activeIndex % 3}
            />
          ))}
        </div>

        {/* Mobile Carousel */}
        <div className="lg:hidden">
          <TestimonialCard
            testimonial={testimonials[activeIndex]}
            isActive={true}
          />
        </div>

        {/* Navigation Dots */}
        <div className="flex justify-center gap-2 mt-8">
          {testimonials.map((_, index) => (
            <button
              key={index}
              onClick={() => setActiveIndex(index)}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                index === activeIndex
                  ? "bg-primary w-8"
                  : "bg-cream/30 hover:bg-cream/50"
              }`}
              aria-label={`Go to testimonial ${index + 1}`}
            />
          ))}
        </div>

        {/* Trust Indicators */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-16 pt-16 border-t border-cream/10"
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { number: "4.9/5", label: "Average Rating" },
              { number: "2,500+", label: "5-Star Reviews" },
              { number: "98%", label: "Would Recommend" },
              { number: "50K+", label: "Transformed Lives" },
            ].map((stat, index) => (
              <div key={index}>
                <p className="text-3xl md:text-4xl font-heading font-bold text-primary">
                  {stat.number}
                </p>
                <p className="text-cream/60 text-sm mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};
