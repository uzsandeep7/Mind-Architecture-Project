import { Layout } from "@/components/layout/Layout";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Mail, Phone, MapPin, Clock, Send, MessageSquare, Calendar, Video } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const contactInfo = [
  {
    icon: Mail,
    title: "Email Us",
    details: "hello@mindarchitecture.com",
    action: "mailto:hello@mindarchitecture.com",
  },
  {
    icon: Phone,
    title: "Call Us",
    details: "+61 412 345 678",
    action: "tel:+61412345678",
  },
  {
    icon: MapPin,
    title: "Visit Us",
    details: "123 Inspiration Ave, Melbourne VIC 3000",
    action: "#",
  },
  {
    icon: Clock,
    title: "Office Hours",
    details: "Mon-Fri: 9AM - 5PM AEST",
    action: "#",
  },
];

const consultationTypes = [
  {
    icon: MessageSquare,
    title: "Discovery Call",
    duration: "30 min",
    price: "Free",
    description: "A free introductory call to discuss your goals and how we can help.",
  },
  {
    icon: Video,
    title: "1-on-1 Coaching",
    duration: "60 min",
    price: "$299",
    description: "Personalized coaching session tailored to your specific challenges.",
  },
  {
    icon: Calendar,
    title: "Strategic Planning",
    duration: "90 min",
    price: "$449",
    description: "Comprehensive session to map out your transformation journey.",
  },
];

const ContactPage = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate form submission
    await new Promise((resolve) => setTimeout(resolve, 1000));
    
    toast.success("Message sent successfully! We'll get back to you soon.");
    setFormData({ name: "", email: "", subject: "", message: "" });
    setIsSubmitting(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  return (
    <Layout>
      {/* Hero */}
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
              Let's Start Your
              <span className="text-gradient-gold"> Transformation</span>
            </h1>
            <p className="text-cream/70 text-lg">
              Have a question or ready to take the next step? Reach out and let's 
              discuss how we can help you achieve your goals.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Contact Info Cards */}
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

      {/* Main Content */}
      <section className="section-padding bg-background">
        <div className="container-wide">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Contact Form */}
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

            {/* Consultation Types */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-2xl md:text-3xl font-heading font-bold mb-6">
                Book a Consultation
              </h2>
              <p className="text-muted-foreground mb-8">
                Ready to take the next step? Choose a consultation option that best 
                fits your needs and schedule a session with Dr. Williams.
              </p>
              <div className="space-y-4">
                {consultationTypes.map((type, index) => (
                  <motion.div
                    key={type.title}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-card p-6 rounded-xl border border-border hover-lift group cursor-pointer"
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors">
                        <type.icon className="text-primary" size={22} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-heading font-bold text-lg">{type.title}</h3>
                          <span className="text-primary font-bold">{type.price}</span>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          {type.description}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Duration: {type.duration}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
              <div className="mt-8">
                <Button variant="goldOutline" size="lg" className="w-full">
                  <Calendar size={18} />
                  View Available Times
                </Button>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Map Section */}
      <section className="h-96 bg-secondary relative">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <MapPin size={48} className="text-primary mx-auto mb-4" />
            <p className="text-muted-foreground">
              Interactive map would be displayed here
            </p>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default ContactPage;
