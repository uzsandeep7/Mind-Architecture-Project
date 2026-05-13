import { Layout } from "@/components/layout/Layout";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Calendar, Clock, MessageSquare, Video, User, CheckCircle } from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate, useSearchParams } from "react-router-dom";
import type { User as SupabaseUser } from "@supabase/supabase-js";

const consultationTypes = [
  {
    id: "discovery",
    icon: MessageSquare,
    title: "Discovery Call",
    duration: "30 min",
    description: "A free introductory call to discuss your goals and how we can help.",
  },
  {
    id: "coaching",
    icon: Video,
    title: "1-on-1 Coaching",
    duration: "60 min",
    description: "A personalised coaching session tailored to your specific challenges.",
  },
  {
    id: "strategic",
    icon: Calendar,
    title: "Strategic Planning",
    duration: "90 min",
    description: "Comprehensive session to map out your transformation journey.",
  },
];

const timeSlots = [
  "09:00 AM", "10:00 AM", "11:00 AM", "12:00 PM",
  "02:00 PM", "03:00 PM", "04:00 PM", "05:00 PM"
];

const ConsultationPage = () => {
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [searchParams] = useSearchParams();

  const [selectedType, setSelectedType] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");

  const [topic, setTopic] = useState("");
  const [message, setMessage] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isBooked, setIsBooked] = useState(false);

  const navigate = useNavigate();

  const getErrorMessage = (error: unknown) => {
    if (error instanceof Error) return error.message;
    if (typeof error === "object" && error !== null && "message" in error) {
      const message = (error as { message?: unknown }).message;
      if (typeof message === "string" && message.trim()) return message;
    }
    return "Failed to book consultation. Please try again.";
  };

  useEffect(() => {
    const requestedType = searchParams.get("type")?.trim().toLowerCase();
    if (!requestedType) return;

    const matchedType = consultationTypes.find((type) => {
      const title = type.title.trim().toLowerCase();
      const id = type.id.trim().toLowerCase();
      return title === requestedType || id === requestedType;
    });

    if (matchedType) {
      setSelectedType(matchedType.id);
    }
  }, [searchParams]);

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

  const convertTo24Hour = (time: string) => {
    const [hourMin, period] = time.split(" ");
    let [hour, min] = hourMin.split(":").map(Number);
    if (period === "PM" && hour !== 12) hour += 12;
    if (period === "AM" && hour === 12) hour = 0;
    return `${hour.toString().padStart(2, "0")}:${min.toString().padStart(2, "0")}:00`;
  };

  // Next 14 available weekdays
  const availableDates = useMemo(() => {
    const dates: string[] = [];
    const today = new Date();
    for (let i = 1; i <= 14; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      if (date.getDay() !== 0 && date.getDay() !== 6) {
        dates.push(date.toISOString().split("T")[0]);
      }
    }
    return dates;
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      toast.error("Please sign in to book a consultation");
      navigate("/auth");
      return;
    }

    if (!selectedType) {
      toast.error("Please choose a consultation type");
      return;
    }

    if (!selectedDate || !selectedTime) {
      toast.error("Please select date and time");
      return;
    }

    setIsSubmitting(true);

    try {
      const dateTime = new Date(`${selectedDate}T${convertTo24Hour(selectedTime)}`);

      const typeTitle = consultationTypes.find((t) => t.id === selectedType)?.title ?? selectedType;

      const { error } = await supabase
        .from("consultations")
        .insert({
          user_id: user.id,
          date: dateTime.toISOString(),
          topic: `${typeTitle}${topic ? ` - ${topic}` : ""}`,
          message: `${message ? message + "\n\n" : ""}Requested slot: ${selectedDate} ${selectedTime}`,
          status: "pending",
        });

      if (error) throw error;

      setIsBooked(true);
      toast.success("Consultation request submitted successfully!");
    } catch (error) {
      console.error("Error booking consultation:", error);
      toast.error(getErrorMessage(error));
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
              className="max-w-lg mx-auto text-center"
            >
              <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-10 h-10 text-primary" />
              </div>
              <h1 className="text-3xl font-heading font-bold mb-4">
                Consultation Request Received
              </h1>
              <p className="text-muted-foreground mb-8">
                Your consultation request has been submitted successfully. If you used the embedded calendar, your preferred slot has been noted for confirmation.
                We’ll send confirmation details shortly.
              </p>
              <div className="flex gap-4 justify-center">
                <Button
                  variant="gold"
                  onClick={() => navigate("/dashboard?tab=consultations")}
                >
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
      {/* Hero */}
      <section className="pt-32 pb-16 bg-gradient-hero text-cream">
        <div className="container-wide">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-3xl"
          >
            <span className="text-primary font-medium tracking-widest uppercase text-sm">
              Book a Consultation
            </span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-heading font-bold mt-4 mb-6">
              Start Your
              <span className="text-gradient-gold"> Journey Today</span>
            </h1>
            <p className="text-cream/70 text-lg">
              Schedule a personalised session to discuss your goals and choose a time that works best for you.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Booking Form */}
      <section className="section-padding bg-background">
        <div className="container-wide">
          <div className="max-w-4xl mx-auto">
            <form onSubmit={handleSubmit} className="space-y-8">

              {/* Step 1: Select Type */}
              <div>
                <h2 className="text-xl font-heading font-bold mb-4">
                  1. Choose Consultation Type
                </h2>
                {selectedType && (
                  <p className="text-sm text-muted-foreground mb-4">
                    Your consultation option has been preselected. You can keep it or choose another option below.
                  </p>
                )}
                <div className="grid md:grid-cols-3 gap-4">
                  {consultationTypes.map((type) => (
                    <motion.div
                      key={type.id}
                      whileHover={{ scale: 1.02 }}
                      onClick={() => setSelectedType(type.id)}
                      className={`p-6 rounded-xl border-2 cursor-pointer transition-all ${
                        selectedType === type.id
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/50"
                      }`}
                    >
                      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                        <type.icon className="text-primary" size={22} />
                      </div>
                      <h3 className="font-heading font-bold mb-1">{type.title}</h3>
                      <p className="text-sm text-muted-foreground mb-2">{type.description}</p>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">{type.duration}</span>
                        <span className="font-semibold uppercase tracking-wide text-primary">
                          Free
                        </span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Step 2: Select Date */}
              <div>
                <h2 className="text-xl font-heading font-bold mb-4">
                  2. Select Date
                </h2>
                <div className="flex flex-wrap gap-2">
                  {availableDates.map((date) => (
                    <button
                      key={date}
                      type="button"
                      onClick={() => setSelectedDate(date)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                        selectedDate === date
                          ? "bg-primary text-primary-foreground"
                          : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                      }`}
                    >
                      {new Date(date).toLocaleDateString("en-US", {
                        weekday: "short",
                        month: "short",
                        day: "numeric"
                      })}
                    </button>
                  ))}
                </div>
              </div>

              {/* Step 3: Select Time */}
              <div>
                <h2 className="text-xl font-heading font-bold mb-4">
                  3. Select Time
                </h2>
                <div className="flex flex-wrap gap-2">
                  {timeSlots.map((time) => (
                    <button
                      key={time}
                      type="button"
                      onClick={() => setSelectedTime(time)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                        selectedTime === time
                          ? "bg-primary text-primary-foreground"
                          : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                      }`}
                    >
                      <Clock size={14} className="inline mr-1" />
                      {time}
                    </button>
                  ))}
                </div>
                <p className="text-sm text-muted-foreground mt-3">
                  Choose your preferred slot, then click <span className="font-medium text-foreground">Confirm and Save Consultation</span> below so it appears in your dashboard.
                </p>
              </div>

              {/* Step 4: Additional Info */}
              <div>
                <h2 className="text-xl font-heading font-bold mb-4">
                  4. Tell Us More (Optional)
                </h2>
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

              {/* Submit */}
              <div className="flex items-center justify-between pt-6 border-t border-border">
                <p className="text-sm text-muted-foreground">
                  Consultations are request-based and do not require payment at this stage.
                </p>

                {!user ? (
                  <Button
                    type="button"
                    variant="gold"
                    size="lg"
                    onClick={() => navigate("/auth")}
                  >
                    <User size={18} className="mr-2" />
                    Sign In to Book
                  </Button>
                ) : (
                  <Button
                    type="submit"
                    variant="gold"
                    size="lg"
                    disabled={
                      isSubmitting ||
                      !selectedType ||
                      !selectedDate ||
                      !selectedTime
                    }
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
