import { motion } from "framer-motion";
import { Heart, Shield, Users, Sparkles } from "lucide-react";
import { useState, useEffect } from "react";

interface Pillar {
  id: number;
  title: string;
  description: string;
  icon: React.ElementType;
}

const pillars: Pillar[] = [
  {
    id: 1,
    title: "Resilience Training",
    description: "Helping professionals navigate stress, burnout, and success with resilience and belonging. We equip individuals with tools to thrive under pressure.",
    icon: Shield,
  },
  {
    id: 2,
    title: "Organisational Care",
    description: "Mind Architecture builds ecosystems of care inside organisations, creating cultures where people feel supported and empowered to do their best work.",
    icon: Users,
  },
  {
    id: 3,
    title: "Community Building",
    description: "We foster meaningful connections within families and communities, strengthening the social fabric that supports individual and collective wellbeing.",
    icon: Heart,
  },
  {
    id: 4,
    title: "Transformative Experiences",
    description: "Our programs are designed to create lasting change through intentional design—supporting balance, purpose, and emotional resilience.",
    icon: Sparkles,
  },
];

const PillarCard = ({ pillar, isActive }: { pillar: Pillar; isActive: boolean }) => {
  const IconComponent = pillar.icon;
  
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: isActive ? 1 : 0.7, scale: isActive ? 1 : 0.95 }}
      transition={{ duration: 0.4 }}
      className={`bg-card rounded-xl p-8 shadow-soft border border-border ${
        isActive ? "ring-2 ring-primary/20" : ""
      }`}
    >
      <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mb-4">
        <IconComponent className="text-primary" size={28} />
      </div>
      
      <h3 className="text-xl font-heading font-bold mb-3">{pillar.title}</h3>
      
      <p className="text-foreground/80 leading-relaxed">
        {pillar.description}
      </p>
    </motion.div>
  );
};

export const TestimonialsSection = () => {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % pillars.length);
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
            Our Approach
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-heading font-bold mt-4 mb-6 text-cream">
            Building Ecosystems of Care
          </h2>
          <p className="text-cream/70 max-w-3xl mx-auto text-lg">
            Helping professionals navigate stress, burnout, and success with resilience and belonging. 
            Mind Architecture builds ecosystems of care inside organisations, families, and communities.
          </p>
        </motion.div>

        {/* Desktop Pillars Grid */}
        <div className="hidden lg:grid grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
          {pillars.map((pillar, index) => (
            <PillarCard
              key={pillar.id}
              pillar={pillar}
              isActive={index === activeIndex}
            />
          ))}
        </div>

        {/* Mobile Carousel */}
        <div className="lg:hidden">
          <PillarCard
            pillar={pillars[activeIndex]}
            isActive={true}
          />
        </div>

        {/* Navigation Dots */}
        <div className="flex justify-center gap-2 mt-8">
          {pillars.map((_, index) => (
            <button
              key={index}
              onClick={() => setActiveIndex(index)}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                index === activeIndex
                  ? "bg-primary w-8"
                  : "bg-cream/30 hover:bg-cream/50"
              }`}
              aria-label={`Go to pillar ${index + 1}`}
            />
          ))}
        </div>

        {/* Impact Indicators */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-16 pt-16 border-t border-cream/10"
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { number: "500+", label: "Leaders Empowered" },
              { number: "50+", label: "Organisations Served" },
              { number: "100%", label: "Commitment to Care" },
              { number: "10+", label: "Years of Experience" },
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
