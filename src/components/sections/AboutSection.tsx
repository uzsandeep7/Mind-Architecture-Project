import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, Award, BookOpen, Mic } from "lucide-react";
import { Link } from "react-router-dom";
import speakerImage from "@/assets/speaker-portrait.jpg";

const credentials = [
  { icon: Award, text: "Certified Life Coach" },
  { icon: BookOpen, text: "Best-Selling Author" },
  { icon: Mic, text: "International Speaker" },
];

export const AboutSection = () => {
  return (
    <section className="section-padding bg-background">
      <div className="container-wide">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Image Column */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative"
          >
            <div className="relative aspect-[3/4] max-w-md mx-auto lg:mx-0">
              {/* Decorative Frame */}
              <div className="absolute -inset-4 border-2 border-primary/30 rounded-lg" />
              <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-primary/10 rounded-lg" />
              
              {/* Main Image */}
              <div className="relative h-full rounded-lg overflow-hidden shadow-elevated">
                <img
                  src={speakerImage}
                  alt="Dr. Marcus Williams - Motivational Speaker"
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Floating Card */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="absolute -bottom-8 -right-8 bg-card p-6 rounded-lg shadow-elevated border border-border"
              >
                <p className="text-4xl font-heading font-bold text-primary">15+</p>
                <p className="text-muted-foreground text-sm">Years of Experience</p>
              </motion.div>
            </div>
          </motion.div>

          {/* Content Column */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <span className="text-primary font-medium tracking-widest uppercase text-sm">
              About The Speaker
            </span>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-heading font-bold mt-4 mb-6">
              Dr. Marcus Williams
            </h2>
            <p className="text-muted-foreground text-lg leading-relaxed mb-6">
              With over 15 years of experience transforming lives, Dr. Marcus Williams 
              has become one of the most sought-after motivational speakers and mindset 
              coaches in the world.
            </p>
            <p className="text-muted-foreground leading-relaxed mb-8">
              His unique approach to "Mind Architecture" has helped over 50,000 individuals 
              break through limiting beliefs, develop resilience, and achieve extraordinary 
              success in their personal and professional lives. From Fortune 500 companies 
              to intimate workshops, his message resonates across all walks of life.
            </p>

            {/* Credentials */}
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
