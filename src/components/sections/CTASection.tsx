import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, Calendar } from "lucide-react";
import { Link } from "react-router-dom";

export const CTASection = () => {
  return (
    <section className="section-padding bg-background relative overflow-hidden">
      {/* Decorative Elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-primary/10 rounded-full blur-2xl" />

      <div className="container-wide relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto text-center"
        >
          <span className="text-primary font-medium tracking-widest uppercase text-sm">
            Ready to Transform?
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-heading font-bold mt-4 mb-6">
            Start Your Journey to an
            <span className="text-gradient-gold"> Extraordinary Life</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto mb-10">
            Whether you're looking to break through limiting beliefs, achieve peak 
            performance, or simply live a more fulfilled life, we're here to guide 
            you every step of the way.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/contact">
              <Button variant="hero" size="xl" className="w-full sm:w-auto">
                <Calendar size={20} />
                Book Free Consultation
              </Button>
            </Link>
            <Link to="/events">
              <Button variant="heroOutline" size="xl" className="w-full sm:w-auto">
                Browse Events
                <ArrowRight size={20} />
              </Button>
            </Link>
          </div>

          {/* Trust Badge */}
          <p className="text-muted-foreground text-sm mt-8">
            Join over 50,000+ individuals who have transformed their lives
          </p>
        </motion.div>
      </div>
    </section>
  );
};
