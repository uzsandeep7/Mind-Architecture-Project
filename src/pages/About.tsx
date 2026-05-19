import { Layout } from "@/components/layout/Layout";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  Award,
  Heart,
  Users,
  Shield,
  Target,
  ArrowRight,
  Calendar,
  Sparkles,
} from "lucide-react";
import { Link } from "react-router-dom";
import speakerImage from "@/assets/dima-istambouli.webp";

const credentials = [
  {
    icon: Award,
    title: "Founder of MIND Architecture",
    description:
      "Creator of practical frameworks focused on resilience, intentional thinking, and self-leadership.",
  },
  {
    icon: Heart,
    title: "Speaker & Lecturer",
    description:
      "Featured across podcasts, radio, television, and invited tertiary education settings.",
  },
  {
    icon: Users,
    title: "Human Behaviour Practitioner",
    description:
      "Certified DISC Personality Trainer with studies across psychology, mental health, and social work.",
  },
  {
    icon: Shield,
    title: "Leadership Trainer",
    description:
      "Certified by The John Maxwell Team in coaching, speaking, training, and teaching.",
  },
];

const values = [
  {
    icon: Heart,
    title: "Awareness Before Action",
    description:
      "Lasting change begins with understanding how we think, feel, and respond.",
  },
  {
    icon: Target,
    title: "Clarity Creates Better Decisions",
    description:
      "Clear thinking helps people navigate pressure, uncertainty, and leadership more intentionally.",
  },
  {
    icon: Users,
    title: "Practicality Over Perfection",
    description:
      "Growth should be sustainable, realistic, and applicable to everyday life.",
  },
  {
    icon: Shield,
    title: "Resilience Can Be Developed",
    description:
      "Emotional resilience is strengthened through awareness, reflection, and practice.",
  },
  {
    icon: Award,
    title: "Self-Leadership Matters",
    description:
      "People create stronger outcomes when they learn to lead themselves intentionally.",
  },
];

const highlights = [
  {
    label: "Founder",
    title: "MIND Architecture",
    description:
      "Creator of practical frameworks centred on resilience, intentional thinking, and self-leadership.",
  },
  {
    label: "Education",
    title: "Academic Background",
    description:
      "Holder of a Master’s Degree in Architecture and completed two years of Psychology studies at Western Sydney University.",
  },
  {
    label: "Certifications",
    title: "Professional Development",
    description:
      "Certified in Mental Health and Social Work (Certificate IV), DISC Personality Training, and Motivational Speaking.",
  },
  {
    label: "Leadership",
    title: "John Maxwell Team",
    description:
      "Certified in coaching, speaking, training, and teaching through The John Maxwell Team.",
  },
  {
    label: "Current",
    title: "Public Service & Speaking",
    description:
      "Program Officer at the NSW Department of Education and a speaker across podcasts, radio, television, and tertiary settings.",
  },
];

const AboutPage = () => {
  return (
    <Layout>
      <section className="pt-32 pb-16 bg-gradient-hero text-cream">
        <div className="container-wide">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <span className="text-primary font-medium tracking-widest uppercase text-sm">
                About The Founder
              </span>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-heading font-bold mt-4 mb-6">
                The Mind Architect
                <span className="text-gradient-gold"> Dima Istambouli</span>
              </h1>
              <p className="text-cream/70 text-lg mb-4">
                Dima Istambouli is a Human Resilience Strategist, speaker,
                author, and founder of MIND Architecture. She helps
                individuals, leaders, and organisations develop the clarity,
                emotional resilience, and intentional thinking required to
                navigate pressure, uncertainty, and change.
              </p>
              <p className="text-cream/70 mb-8">
                Drawing from both lived experience and years of work across
                human behaviour, leadership, and mindset development, she
                delivers practical frameworks that help people regulate their
                responses, strengthen self-leadership, and perform with greater
                clarity and purpose.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link to="/contact">
                  <Button variant="hero">
                    <Calendar size={18} />
                    Book Consultation
                  </Button>
                </Link>
                <Link to="/programs">
                  <Button variant="heroDark">
                    View Programs
                    <ArrowRight size={18} />
                  </Button>
                </Link>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative"
            >
              <div className="relative aspect-[3/4] max-w-md mx-auto">
                <div className="absolute -inset-4 border-2 border-primary/30 rounded-lg" />
                <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-primary/20 rounded-lg" />
                <div className="relative h-full rounded-lg overflow-hidden shadow-elevated">
                  <img
                    src={speakerImage}
                    alt="Dima Istambouli"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <section className="section-padding bg-background">
        <div className="container-wide">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <span className="text-primary font-medium tracking-widest uppercase text-sm">
              Expertise
            </span>
            <h2 className="text-3xl md:text-4xl font-heading font-bold mt-4">
              Credentials & Experience
            </h2>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {credentials.map((item, index) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-card p-6 rounded-xl border border-border text-center hover-lift"
              >
                <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <item.icon className="text-primary" size={24} />
                </div>
                <h3 className="font-heading font-bold mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="section-padding bg-secondary/30">
        <div className="container-wide">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <span className="text-primary font-medium tracking-widest uppercase text-sm">
                Professional Background
              </span>
              <h2 className="text-3xl md:text-4xl font-heading font-bold mt-4 mb-6">
                Experience Shaped By Practice And Perspective
              </h2>
              <div className="space-y-4 text-muted-foreground">
                <p>
                  Dima’s work spans keynote speaking, corporate training,
                  advisory, and transformational learning experiences designed
                  to create lasting behavioural change in both personal and
                  professional environments.
                </p>
                <p>
                  Her mission is to help individuals and organisations develop
                  the clarity, resilience, and self-awareness needed to
                  navigate life and leadership intentionally.
                </p>
                <p>
                  Her vision is to help build generations equipped with
                  self-awareness, emotional resilience, and intentional
                  thinking, making these essential life skills accessible rather
                  than privileges.
                </p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="space-y-4"
            >
              {highlights.map((item, index) => (
                <div key={item.label} className="flex gap-4 items-start">
                  <div className="w-24 shrink-0 text-right">
                    <span className="text-primary font-heading font-bold">
                      {item.label}
                    </span>
                  </div>
                  <div className="relative pb-4">
                    <div className="absolute left-0 top-2 w-3 h-3 rounded-full bg-primary" />
                    <div
                      className={`absolute left-1.5 top-5 w-0.5 bg-border ${
                        index === highlights.length - 1 ? "h-0" : "h-full"
                      }`}
                    />
                    <div className="pl-6">
                      <h4 className="font-semibold mb-1">{item.title}</h4>
                      <p className="text-sm text-muted-foreground">
                        {item.description}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      <section className="section-padding bg-primary/5">
        <div className="container-wide">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center max-w-4xl mx-auto"
          >
            <Sparkles className="text-primary mx-auto mb-6" size={40} />
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-heading font-bold mb-6">
              Our Mission
            </h2>
            <p className="text-xl md:text-2xl text-muted-foreground leading-relaxed">
              "To help individuals and organisations develop the clarity,
              resilience, and self-awareness needed to navigate life and
              leadership intentionally."
            </p>
            <p className="text-base md:text-lg text-muted-foreground/80 leading-relaxed mt-6">
              Vision: To help build generations equipped with self-awareness,
              emotional resilience, and intentional thinking.
            </p>
          </motion.div>
        </div>
      </section>

      <section className="section-padding bg-background">
        <div className="container-wide">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <span className="text-primary font-medium tracking-widest uppercase text-sm">
              Core Values
            </span>
            <h2 className="text-3xl md:text-4xl font-heading font-bold mt-4">
              What We Stand For
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-2 xl:grid-cols-5 gap-8">
            {values.map((value, index) => (
              <motion.div
                key={value.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="text-center"
              >
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <value.icon className="text-primary" size={28} />
                </div>
                <h3 className="text-xl font-heading font-bold mb-3">
                  {value.title}
                </h3>
                <p className="text-muted-foreground">{value.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="section-padding bg-gradient-hero text-cream">
        <div className="container-wide text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-2xl mx-auto"
          >
            <h2 className="text-3xl md:text-4xl font-heading font-bold mb-6">
              Ready to Reset, Reconnect & Rise?
            </h2>
            <p className="text-cream/70 mb-8">
              Whether you’re looking for a keynote speaker, workshop
              facilitator, corporate program, advisory support, or a meaningful
              conversation around resilience, leadership, and intentional
              thinking, we’d love to hear from you.
            </p>
            <Link to="/contact">
              <Button variant="hero" size="xl">
                Start Your Journey
                <ArrowRight size={20} />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>
    </Layout>
  );
};

export default AboutPage;
