import { Layout } from "@/components/layout/Layout";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Mail,
  Phone,
  MapPin,
  Clock,
  Send,
  MessageSquare,
  Calendar,
  Video,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

const contactInfo = [
  {
    icon: Mail,
    title: "Email Us",
    details: "info@mindarchitecture.com.au",
    action: "mailto:info@mindarchitecture.com.au",
  },
  {
    icon: Phone,
    title: "Call Us",
    details: "+61 404 158 030",
    action: "tel:+61404158030",
  },
  {
    icon: MapPin,
    title: "Visit Us",
    details: "19 Railway Street Banksia NSW 2216",
    action: "#",
  },
  {
    icon: Clock,
    title: "Office Hours",
    details: "9:00 am to 9:00 pm",
    action: "#",
  },
];

type ConsultationService = Database["public"]["Tables"]["consultation_services"]["Row"];

const fallbackConsultationTypes: ConsultationService[] = [
  {
    id: "discovery",
    slug: "discovery",
    title: "Discovery Call",
    duration_minutes: 30,
    price: 0,
    description:
      "A free introductory call to discuss your goals and how we can help.",
    display_order: 1,
    is_published: true,
    created_at: "",
    updated_at: "",
  },
  {
    id: "coaching",
    slug: "coaching",
    title: "1-on-1 Coaching",
    duration_minutes: 60,
    price: 99,
    description:
      "Personalized coaching session tailored to your specific challenges.",
    display_order: 2,
    is_published: true,
    created_at: "",
    updated_at: "",
  },
  {
    id: "strategic",
    slug: "strategic",
    title: "Strategic Planning",
    duration_minutes: 90,
    price: 249,
    description:
      "Comprehensive session to map out your transformation journey.",
    display_order: 3,
    is_published: true,
    created_at: "",
    updated_at: "",
  },
];

const getConsultationIcon = (slug: string) => {
  if (slug.includes("coaching")) return Video;
  if (slug.includes("strategic")) return Calendar;
  return MessageSquare;
};

const ContactPage = () => {
  const navigate = useNavigate();
  const [consultationTypes, setConsultationTypes] = useState<ConsultationService[]>(fallbackConsultationTypes);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const loadConsultationTypes = async () => {
      const { data, error } = await supabase
        .from("consultation_services")
        .select("*")
        .eq("is_published", true)
        .order("display_order", { ascending: true });

      if (!error && data?.length) {
        setConsultationTypes(data);
      }
    };

    void loadConsultationTypes();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const { error } = await supabase.from("contact_messages").insert({
        name: formData.name.trim(),
        email: formData.email.trim(),
        message: `Subject: ${formData.subject.trim()}\n\n${formData.message.trim()}`,
      });

      if (error) throw error;

      toast.success("Message sent successfully! We'll get back to you soon.");
      setFormData({ name: "", email: "", subject: "", message: "" });
    } catch (error) {
      console.error("Error sending contact message:", error);
      toast.error("Failed to send message. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const openConsultationBooking = (type?: string) => {
    const query = type ? `?type=${encodeURIComponent(type)}` : "";
    navigate(`/consultation${query}`);
  };

  return (
    <Layout>
      <section className="pt-32 pb-16 bg-gradient-hero text-cream">
        <div className="container-wide">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-3xl"
          >
            <span className="text-primary font-medium tracking-widest uppercase text-sm">
              Get In Touch
            </span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-heading font-bold mt-4 mb-6">
              Let&apos;s Start The
              <span className="text-gradient-gold"> Conversation</span>
            </h1>
            <p className="text-cream/70 text-lg">
              Whether you&apos;re looking for a keynote speaker, workshop
              facilitator, corporate program, advisory support, or a meaningful
              conversation around resilience, leadership, and intentional
              thinking, we&apos;d love to hear from you. Reach out below and
              we&apos;ll be in touch soon.
            </p>
          </motion.div>
        </div>
      </section>

      <section className="py-12 bg-background border-b border-border">
        <div className="container-wide">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {contactInfo.map((item, index) => (
              <motion.a
                key={item.title}
                href={item.action}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-card p-6 rounded-xl border border-border text-center hover-lift group"
              >
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4 group-hover:bg-primary/20 transition-colors">
                  <item.icon className="text-primary" size={22} />
                </div>
                <h3 className="font-semibold mb-1">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.details}</p>
              </motion.a>
            ))}
          </div>
        </div>
      </section>

      <section className="section-padding bg-background">
        <div className="container-wide">
          <div className="grid lg:grid-cols-2 gap-12">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-2xl md:text-3xl font-heading font-bold mb-6">
                Send Us a Message
              </h2>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      name="name"
                      placeholder="John Doe"
                      value={formData.name}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="john@example.com"
                      value={formData.email}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="subject">Subject</Label>
                  <Input
                    id="subject"
                    name="subject"
                    placeholder="How can we help you?"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="message">Message</Label>
                  <Textarea
                    id="message"
                    name="message"
                    placeholder="Tell us about your goals and how we can help..."
                    rows={6}
                    value={formData.message}
                    onChange={handleChange}
                    required
                  />
                </div>
                <Button
                  type="submit"
                  variant="gold"
                  size="lg"
                  className="w-full sm:w-auto"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    "Sending..."
                  ) : (
                    <>
                      <Send size={18} />
                      Send Message
                    </>
                  )}
                </Button>
              </form>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-2xl md:text-3xl font-heading font-bold mb-6">
                Book a Consultation
              </h2>
              <p className="text-muted-foreground mb-8">
                Ready to take the next step? Choose a consultation option that
                best fits your needs and schedule a session with Dima and Mind
                Architecture.
              </p>
              <div className="space-y-4">
                {consultationTypes.map((type, index) => {
                  const Icon = getConsultationIcon(type.slug);
                  return (
                    <motion.div
                      key={type.id}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.1 }}
                      className="bg-card p-6 rounded-xl border border-border hover-lift group cursor-pointer"
                      onClick={() => openConsultationBooking(type.slug)}
                    >
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors">
                          <Icon className="text-primary" size={22} />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="font-heading font-bold text-lg">
                              {type.title}
                            </h3>
                            <span className="text-primary font-semibold uppercase tracking-wide text-sm">
                              {Number(type.price) > 0 ? `$${Number(type.price).toFixed(0)}` : "Free"}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">
                            {type.description}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Duration: {type.duration_minutes} min
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
              <div className="mt-8">
                <Button
                  variant="goldOutline"
                  size="lg"
                  className="w-full"
                  onClick={() => openConsultationBooking()}
                >
                  <Calendar size={18} />
                  View Available Times
                </Button>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-secondary/40">
        <div className="container-wide">
          <div className="rounded-2xl border border-border bg-card p-8 text-center shadow-soft">
            <MapPin size={42} className="text-primary mx-auto mb-4" />
            <h2 className="font-heading text-2xl font-bold">Banksia, NSW</h2>
            <p className="mt-2 text-muted-foreground">
              Mind Architecture supports clients through online consultations,
              workshops, and arranged in-person sessions.
            </p>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default ContactPage;
