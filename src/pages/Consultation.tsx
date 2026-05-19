import { Layout } from "@/components/layout/Layout";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Calendar, Clock, MessageSquare, Video, User, CheckCircle } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate, useSearchParams } from "react-router-dom";
import type { User as SupabaseUser } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

type ConsultationService = Database["public"]["Tables"]["consultation_services"]["Row"];
type ConsultationDateBlock = Database["public"]["Tables"]["consultation_date_blocks"]["Row"];
type ConsultationTimeBlock = Database["public"]["Tables"]["consultation_time_blocks"]["Row"];

const fallbackServices: ConsultationService[] = [
  {
    id: "discovery",
    slug: "discovery",
    title: "Discovery Call",
    duration_minutes: 30,
    price: 0,
    description: "A free introductory call to discuss your goals and how Mind Architecture can help.",
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
    description: "A personalised coaching session tailored to your specific challenges.",
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
    description: "A focused strategy session to map out your transformation journey.",
    display_order: 3,
    is_published: true,
    created_at: "",
    updated_at: "",
  },
];

const fallbackTimeBlocks: ConsultationTimeBlock[] = [
  { id: "09:00", label: "9:00 AM", time_value: "09:00", display_order: 1, is_published: true, created_at: "", updated_at: "" },
  { id: "10:00", label: "10:00 AM", time_value: "10:00", display_order: 2, is_published: true, created_at: "", updated_at: "" },
  { id: "11:00", label: "11:00 AM", time_value: "11:00", display_order: 3, is_published: true, created_at: "", updated_at: "" },
  { id: "13:30", label: "1:30 PM", time_value: "13:30", display_order: 4, is_published: true, created_at: "", updated_at: "" },
  { id: "15:00", label: "3:00 PM", time_value: "15:00", display_order: 5, is_published: true, created_at: "", updated_at: "" },
  { id: "16:30", label: "4:30 PM", time_value: "16:30", display_order: 6, is_published: true, created_at: "", updated_at: "" },
];

const createFallbackDateBlocks = (): ConsultationDateBlock[] => {
  const dates: ConsultationDateBlock[] = [];
  const today = new Date();
  for (let i = 1; i <= 14 && dates.length < 5; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    if (date.getDay() === 0 || date.getDay() === 6) continue;

    const dateValue = date.toISOString().split("T")[0];
    dates.push({
      id: dateValue,
      label: date.toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
      }),
      date_value: dateValue,
      display_order: dates.length + 1,
      is_published: true,
      created_at: "",
      updated_at: "",
    });
  }
  return dates;
};

const getServiceIcon = (slug: string) => {
  if (slug.includes("coaching")) return Video;
  if (slug.includes("strategic")) return Calendar;
  return MessageSquare;
};

const ConsultationPage = () => {
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [searchParams] = useSearchParams();
  const [services, setServices] = useState<ConsultationService[]>(fallbackServices);
  const [dateBlocks, setDateBlocks] = useState<ConsultationDateBlock[]>(createFallbackDateBlocks);
  const [timeBlocks, setTimeBlocks] = useState<ConsultationTimeBlock[]>(fallbackTimeBlocks);
  const [selectedType, setSelectedType] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [topic, setTopic] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isBooked, setIsBooked] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const success = searchParams.get("success");
    const canceled = searchParams.get("canceled");
    const sessionId = searchParams.get("session_id");
    const consultationId = searchParams.get("consultation_id");

    if (canceled === "1") {
      toast.error("Stripe checkout was cancelled. Your consultation is still pending until payment is completed.");
      return;
    }

    if (success === "1" && sessionId && consultationId && user) {
      const verifyConsultation = async () => {
        const { error } = await supabase.functions.invoke("verify-consultation-checkout", {
          body: { sessionId, consultationId },
        });

        if (error) {
          toast.error("Payment completed, but consultation confirmation could not be verified yet.");
          return;
        }

        setIsBooked(true);
        toast.success("Payment received. Consultation confirmed!");
      };

      void verifyConsultation();
    }
  }, [searchParams, user]);

  useEffect(() => {
    const loadSetup = async () => {
      const [servicesResult, dateBlocksResult, timeBlocksResult] = await Promise.all([
        supabase
          .from("consultation_services")
          .select("*")
          .eq("is_published", true)
          .order("display_order", { ascending: true }),
        supabase
          .from("consultation_date_blocks")
          .select("*")
          .eq("is_published", true)
          .order("display_order", { ascending: true })
          .order("date_value", { ascending: true }),
        supabase
          .from("consultation_time_blocks")
          .select("*")
          .eq("is_published", true)
          .order("display_order", { ascending: true }),
      ]);

      if (!servicesResult.error && servicesResult.data?.length) {
        setServices(servicesResult.data);
      }

      if (!dateBlocksResult.error && dateBlocksResult.data?.length) {
        setDateBlocks(dateBlocksResult.data);
      }

      if (!timeBlocksResult.error && timeBlocksResult.data?.length) {
        setTimeBlocks(timeBlocksResult.data);
      }
    };

    void loadSetup();
  }, []);

  useEffect(() => {
    const requestedType = searchParams.get("type")?.trim().toLowerCase();
    if (!requestedType || services.length === 0) return;

    const matchedType = services.find((type) => {
      const title = type.title.trim().toLowerCase();
      const slug = type.slug.trim().toLowerCase();
      return title === requestedType || slug === requestedType;
    });

    if (matchedType) {
      setSelectedType(matchedType.id);
    }
  }, [searchParams, services]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      supabase.auth.getSession().then(({ data: { session } }) => {
        setUser(session?.user ?? null);
      });
    });

    return () => subscription.unsubscribe();
  }, []);

  const selectedService = services.find((service) => service.id === selectedType);
  const selectedDateBlock = dateBlocks.find((block) => block.id === selectedDate || block.date_value === selectedDate);
  const selectedTimeBlock = timeBlocks.find((block) => block.id === selectedTime || block.time_value === selectedTime);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      toast.error("Please sign in to book a consultation");
      navigate("/auth");
      return;
    }

    if (!selectedService) {
      toast.error("Please choose a consultation type");
      return;
    }

    if (!selectedDateBlock || !selectedTimeBlock) {
      toast.error("Please select date and time");
      return;
    }

    setIsSubmitting(true);

    try {
      const dateTime = new Date(`${selectedDateBlock.date_value}T${selectedTimeBlock.time_value}:00`);
      const servicePrice = Number(selectedService.price);
      const messageBody = `${message ? `${message}\n\n` : ""}Requested slot: ${selectedDateBlock.label} ${selectedTimeBlock.label}\nService price: ${servicePrice > 0 ? `$${servicePrice.toFixed(2)}` : "Free"}`;

      if (servicePrice > 0) {
        const { data, error } = await supabase.functions.invoke("create-consultation-checkout", {
          body: {
            consultation: {
              date: dateTime.toISOString(),
              topic: `${selectedService.title}${topic ? ` - ${topic}` : ""}`,
              message: messageBody,
              serviceTitle: selectedService.title,
              price: servicePrice,
            },
            successUrl: `${window.location.origin}/consultation?success=1&session_id={CHECKOUT_SESSION_ID}`,
            cancelUrl: `${window.location.origin}/consultation?canceled=1`,
          },
        });

        if (error || !data?.url) {
          throw error ?? new Error("Failed to open Stripe checkout");
        }

        window.location.href = data.url;
        return;
      }

      const { error } = await supabase.from("consultations").insert({
          user_id: user.id,
          date: dateTime.toISOString(),
          topic: `${selectedService.title}${topic ? ` - ${topic}` : ""}`,
          message: messageBody,
          status: "pending",
      });

      if (error) throw error;

      setIsBooked(true);
      toast.success("Consultation request submitted successfully!");
    } catch (error) {
      console.error("Error booking consultation:", error);
      toast.error(error instanceof Error ? error.message : "Failed to book consultation. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isBooked) {
    return (
      <Layout>
        <section className="pt-32 pb-16 min-h-screen bg-background">
          <div className="container-wide">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mx-auto max-w-lg text-center"
            >
              <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
                <CheckCircle className="h-10 w-10 text-primary" />
              </div>
              <h1 className="mb-4 text-3xl font-heading font-bold">
                Consultation Request Received
              </h1>
              <p className="mb-8 text-muted-foreground">
                Your request has been saved. You can view its pending or confirmed status in your dashboard.
              </p>
              <div className="flex justify-center gap-4">
                <Button variant="gold" onClick={() => navigate("/dashboard?tab=consultations")}>
                  View My Consultations
                </Button>
                <Button variant="outline" onClick={() => navigate("/")}>
                  Back to Home
                </Button>
              </div>
            </motion.div>
          </div>
        </section>
      </Layout>
    );
  }

  return (
    <Layout>
      <section className="pt-32 pb-16 bg-gradient-hero text-cream">
        <div className="container-wide">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-3xl"
          >
            <span className="text-sm font-medium uppercase tracking-widest text-primary">
              Book a Consultation
            </span>
            <h1 className="mb-6 mt-4 text-4xl font-heading font-bold md:text-5xl lg:text-6xl">
              Start Your
              <span className="text-gradient-gold"> Journey Today</span>
            </h1>
            <p className="text-lg text-cream/70">
              Choose a consultation type, select an available time block, and save your request.
            </p>
          </motion.div>
        </div>
      </section>

      <section className="section-padding bg-background">
        <div className="container-wide">
          <div className="mx-auto max-w-5xl">
            <form onSubmit={handleSubmit} className="space-y-8">
              <div>
                <h2 className="mb-4 text-xl font-heading font-bold">
                  1. Choose Consultation Type
                </h2>
                <div className="grid gap-4 md:grid-cols-3">
                  {services.map((service) => {
                    const Icon = getServiceIcon(service.slug);
                    return (
                      <motion.div
                        key={service.id}
                        whileHover={{ scale: 1.02 }}
                        onClick={() => setSelectedType(service.id)}
                        className={`cursor-pointer rounded-xl border-2 p-6 transition-all ${
                          selectedType === service.id
                            ? "border-primary bg-primary/5"
                            : "border-border hover:border-primary/50"
                        }`}
                      >
                        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                          <Icon className="text-primary" size={22} />
                        </div>
                        <h3 className="mb-1 font-heading font-bold">{service.title}</h3>
                        <p className="mb-4 text-sm text-muted-foreground">{service.description}</p>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">{service.duration_minutes} min</span>
                          <span className="font-semibold uppercase tracking-wide text-primary">
                            {Number(service.price) > 0 ? `$${Number(service.price).toFixed(0)}` : "Free"}
                          </span>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>

              <div>
                <h2 className="mb-4 text-xl font-heading font-bold">2. Select Date</h2>
                <div className="flex flex-wrap gap-2">
                  {dateBlocks.map((date) => (
                    <button
                      key={date.id}
                      type="button"
                      onClick={() => setSelectedDate(date.id)}
                      className={`rounded-lg px-4 py-2 text-sm font-medium transition-all ${
                        selectedDate === date.id
                          ? "bg-primary text-primary-foreground"
                          : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                      }`}
                    >
                      {date.label}
                    </button>
                  ))}
                </div>
                <p className="mt-3 text-sm text-muted-foreground">
                  Admin can update these date blocks from the dashboard.
                </p>
              </div>

              <div>
                <h2 className="mb-4 text-xl font-heading font-bold">3. Select Time Block</h2>
                <div className="flex flex-wrap gap-2">
                  {timeBlocks.map((block) => (
                    <button
                      key={block.id}
                      type="button"
                      onClick={() => setSelectedTime(block.id)}
                      className={`rounded-lg px-4 py-2 text-sm font-medium transition-all ${
                        selectedTime === block.id
                          ? "bg-primary text-primary-foreground"
                          : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                      }`}
                    >
                      <Clock size={14} className="mr-1 inline" />
                      {block.label}
                    </button>
                  ))}
                </div>
                <p className="mt-3 text-sm text-muted-foreground">
                  Admin can update these time blocks from the dashboard.
                </p>
              </div>

              <div>
                <h2 className="mb-4 text-xl font-heading font-bold">4. Tell Us More (Optional)</h2>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="topic">Topic / Subject</Label>
                    <Input
                      id="topic"
                      placeholder="What would you like to discuss?"
                      value={topic}
                      onChange={(e) => setTopic(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="message">Additional Notes</Label>
                    <Textarea
                      id="message"
                      placeholder="Any specific goals or challenges you'd like to address..."
                      rows={4}
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-4 border-t border-border pt-6 md:flex-row md:items-center md:justify-between">
                <p className="text-sm text-muted-foreground">
                  {selectedService && Number(selectedService.price) > 0
                    ? "Paid consultation requests go through Stripe test checkout before confirmation."
                    : "Free discovery calls can be requested directly."}
                </p>
                {!user ? (
                  <Button type="button" variant="gold" size="lg" onClick={() => navigate("/auth")}>
                    <User size={18} className="mr-2" />
                    Sign In to Book
                  </Button>
                ) : (
                  <Button
                    type="submit"
                    variant="gold"
                    size="lg"
                    disabled={isSubmitting || !selectedType || !selectedDate || !selectedTime}
                  >
                    {isSubmitting ? "Saving Consultation..." : "Confirm and Save Consultation"}
                  </Button>
                )}
              </div>
            </form>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default ConsultationPage;
