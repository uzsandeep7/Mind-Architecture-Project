import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, Award, Heart, Users } from "lucide-react";
import { Link } from "react-router-dom";
import speakerImage from "@/assets/dima-istambouli.webp";

const credentials = [
  { icon: Award, text: "Human Resilience Strategist" },
  { icon: Heart, text: "The Mind Architect" },
  { icon: Users, text: "Speaker & Founder" },
];

export const AboutSection = () => {
  return (
    <section className="section-padding bg-background">
      <div className="container-wide">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative"
          >
            <div className="relative aspect-[3/4] max-w-md mx-auto lg:mx-0">
              <div className="absolute -inset-4 border-2 border-primary/30 rounded-lg" />
              <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-primary/10 rounded-lg" />

              <div className="relative h-full rounded-lg overflow-hidden shadow-elevated">
                <img
                  src={speakerImage}
                  alt="Dima Istambouli - The Mind Architect"
                  className="w-full h-full object-cover"
                />
              </div>

              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="absolute -bottom-8 -right-8 bg-card p-6 rounded-lg shadow-elevated border border-border"
              >
                <p className="text-lg font-heading font-bold text-primary">Clarity</p>
                <p className="text-muted-foreground text-sm">
                  Resilience & Intentional Thinking
                </p>
              </motion.div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <span className="text-primary font-medium tracking-widest uppercase text-sm">
              About The Founder
            </span>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-heading font-bold mt-4 mb-6">
              Dima Istambouli
            </h2>
            <p className="text-muted-foreground text-lg leading-relaxed mb-6">
              Dima Istambouli is a Human Resilience Strategist, speaker, author,
              and founder of MIND Architecture. Known as The Mind Architect,
              Dima helps individuals, leaders, and organisations develop the
              clarity, emotional resilience, and intentional thinking needed to
              navigate pressure, uncertainty, and change.
            </p>
            <p className="text-muted-foreground leading-relaxed mb-8">
              Drawing from lived experience and years of work across human
              behaviour, leadership, and mindset development, she delivers
              practical frameworks that help people regulate their responses,
              strengthen self-leadership, and perform with greater clarity and
              purpose.
            </p>

            <div className="flex flex-wrap gap-4 mb-8">
              {credentials.map((item, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 px-4 py-2 bg-secondary rounded-full"
                >
                  <item.icon size={16} className="text-primary" />
                  <span className="text-sm font-medium">{item.text}</span>
                </div>
              ))}
            </div>

            <Link to="/about">
              <Button variant="gold" size="lg">
                Learn More
                <ArrowRight size={18} />
              </Button>
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
