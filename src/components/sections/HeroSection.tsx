import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, Play } from "lucide-react";
import { Link } from "react-router-dom";
import heroImage from "@/assets/hero.jpg";

export const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden bg-[hsl(0,0%,8%)] pb-24">
      
      {/* Background Image */}
      <div className="absolute inset-0">
        <img
          src={heroImage}
          alt="Mind Architecture - Resilience Training"
          className="w-full h-full object-cover"
        />
        {/* Overlay */}
        <div className="absolute inset-0 bg-black/55" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-black/50" />
      </div>

      {/* Content */}
      <div className="relative z-10 w-full px-6 lg:px-20 pt-32">
        <div className="max-w-5xl">

          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-yellow-500/10 border border-yellow-500/30 text-yellow-500 text-sm font-medium mb-6">
              <span className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse" />
              Clarity Under Pressure
            </span>
          </motion.div>

          {/* Heading */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-5xl sm:text-6xl md:text-7xl lg:text-[84px] font-heading font-bold text-white leading-tight mb-6"
          >
            Clarity{" "}
            <span className="text-gradient-gold">Under</span>{" "}
            Pressure
          </motion.h1>

          {/* Description */}
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg md:text-xl text-white/80 leading-relaxed mb-10 max-w-3xl"
          >
            Helping individuals and organisations think clearly, lead
            intentionally, and navigate life without overwhelm. Through lived
            experience and practical frameworks, Mind Architecture helps people
            regulate how they respond and lead themselves with greater clarity,
            direction, and control.
          </motion.p>

          {/* Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-wrap gap-4"
          >
            <Link to="/events">
              <Button variant="hero" className="gap-2">
                Explore Programs
                <ArrowRight size={18} />
              </Button>
            </Link>

            <Button variant="heroDark" className="gap-3">
              <span className="w-10 h-10 rounded-full bg-yellow-500 flex items-center justify-center">
                <Play size={16} className="text-black ml-0.5" />
              </span>
              Watch Introduction
            </Button>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="grid grid-cols-3 gap-10 mt-16"
          >
            {[
              { number: "500+", label: "Leaders Empowered" },
              { number: "50+", label: "Organisations Served" },
              { number: "10+", label: "Years Experience" },
            ].map((stat, index) => (
              <div key={index}>
                <p className="text-3xl md:text-4xl font-heading font-bold text-yellow-500">
                  {stat.number}
                </p>
                <p className="text-white/50 text-sm mt-1">
                  {stat.label}
                </p>
              </div>
            ))}
          </motion.div>

        </div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
      >
        <div className="w-6 h-10 rounded-full border-2 border-white/30 flex items-start justify-center p-2">
          <motion.div
            animate={{ y: [0, 12, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="w-1.5 h-1.5 rounded-full bg-yellow-500"
          />
        </div>
      </motion.div>

    </section>
  );
};
