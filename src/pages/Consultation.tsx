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
import { useNavigate } from "react-router-dom";
import type { User as SupabaseUser } from "@supabase/supabase-js";

const consultationTypes = [
  {
    id: "discovery",
    icon: MessageSquare,
    title: "Discovery Call",
    duration: "30 min",
    price: 0,
    description: "A free introductory call to discuss your goals and how we can help.",
  },
  {
    id: "coaching",
    icon: Video,
    title: "1-on-1 Coaching",
    duration: "60 min",
    price: 299,
    description: "Personalized coaching session tailored to your specific challenges.",
  },
  {
    id: "strategic",
    icon: Calendar,
    title: "Strategic Planning",
    duration: "90 min",
    price: 449,
    description: "Comprehensive session to map out your transformation journey.",
  },
];

const timeSlots = [
  "09:00 AM", "10:00 AM", "11:00 AM", "12:00 PM",
  "02:00 PM", "03:00 PM", "04:00 PM", "05:00 PM"
];

const CALENDAR_EMBED_URL = import.meta.env.VITE_CONSULTATION_CALENDAR_URL as string | undefined;

const ConsultationPage = () => {
  const [user, setUser] = useState<SupabaseUser | null>(null);

  const [selectedType, setSelectedType] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");

  const [topic, setTopic] = useState("");
  const [message, setMessage] = useState("");

  const [useCalendarIntegration, setUseCalendarIntegration] = useState(true);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isBooked, setIsBooked] = useState(false);

  const navigate = useNavigate();

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

    // If not using calendar integration, enforce date/time
    if (!useCalendarIntegration) {
      if (!selectedDate || !selectedTime) {
        toast.error("Please select date and time");
        return;
      }
    } else {
      // If calendar integration is ON, ensure you at least set the embed URL
      if (!CALENDAR_EMBED_URL) {
        toast.error("Calendar integration URL is missing. Please add it to .env.local");
        return;
      }
    }

    setIsSubmitting(true);

    try {
      // If using manual date/time -> store selected slot
      // If using calendar embed -> store a placeholder timestamp + notes (prototype-friendly)
      let dateTime: Date;
      if (!useCalendarIntegration) {
        dateTime = new Date(`${selectedDate}T${convertTo24Hour(selectedTime)}`);
      } else {
        dateTime = new Date(); // placeholder for prototype
      }

      const typeTitle = consultationTypes.find((t) => t.id === selectedType)?.title ?? selectedType;

      const { error } = await supabase
        .from("consultations")
        .insert({
          user_id: user.id,
          date: dateTime.toISOString(),
          topic: `${typeTitle}${topic ? ` - ${topic}` : ""}`,
          message: `${message ? message + "\n\n" : ""}${
            useCalendarIntegration
              ? "Booking method: Google Calendar integration (embedded scheduler)"
              : `Requested slot: ${selectedDate} ${selectedTime}`
          }`,
          status: "pending",
        });

      if (error) throw error;

      setIsBooked(true);
      toast.success("Consultation request submitted successfully!");
    } catch (error) {
      console.error("Error booking consultation:", error);
      toast.error("Failed to book consultation. Please try again.");
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
                Consultation Booked!
              </h1>
              <p className="text-muted-foreground mb-8">
                Your consultation request has been submitted. If you booked via the calendar, it should appear in the admin schedule.
                We’ll send confirmation details shortly.
              </p>
              <div className="flex gap-4 justify-center">
                <Button variant="gold" onClick={() => navigate("/dashboard")}>
                  View My Bookings
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
              Schedule a personalised session to discuss your goals and create a roadmap for your transformation.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Booking Form */}
      <section className="section-padding bg-background">
        <div className="container-wide">
          <div className="max-w-4xl mx-auto">
            <form onSubmit={handleSubmit} className="space-y-8">

              {/* Step 0: Choose booking method */}
              <div className="p-5 rounded-xl border border-border bg-card">
                <h2 className="text-xl font-heading font-bold mb-3">
                  Booking Method
                </h2>

                <div className="flex flex-wrap gap-3">
                  <Button
                    type="button"
                    variant={useCalendarIntegration ? "gold" : "outline"}
                    onClick={() => setUseCalendarIntegration(true)}
                  >
                    <Calendar size={16} className="mr-2" />
                    Book via Google Calendar
                  </Button>

                  <Button
                    type="button"
                    variant={!useCalendarIntegration ? "gold" : "outline"}
                    onClick={() => setUseCalendarIntegration(false)}
                  >
                    <Clock size={16} className="mr-2" />
                    Pick a time manually
                  </Button>
                </div>

                {useCalendarIntegration && (
                  <p className="text-sm text-muted-foreground mt-3">
                    This uses an embedded scheduler connected to the admin’s Google Calendar.
                  </p>
                )}
              </div>

              {/* Step 1: Select Type */}
              <div>
                <h2 className="text-xl font-heading font-bold mb-4">
                  1. Choose Consultation Type
                </h2>
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
                        <span className="font-bold text-primary">
                          {type.price === 0 ? "Free" : `$${type.price}`}
                        </span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Step 2+3: Calendar OR manual date/time */}
              {useCalendarIntegration ? (
                <div>
                  <h2 className="text-xl font-heading font-bold mb-4">
                    2. Select a Time (Google Calendar)
                  </h2>

                  {!CALENDAR_EMBED_URL ? (
                    <div className="p-5 rounded-xl border border-destructive/30 bg-destructive/5">
                      <p className="font-medium mb-2">Calendar URL missing</p>
                      <p className="text-sm text-muted-foreground">
                        Add this to <code className="px-1 py-0.5 rounded bg-muted">.env.local</code>:
                        <br />
                        <code className="block mt-2 px-2 py-2 rounded bg-muted">
                          VITE_CONSULTATION_CALENDAR_URL=YOUR_LINK
                        </code>
                      </p>
                    </div>
                  ) : (
                    <div className="rounded-2xl overflow-hidden border border-border bg-card">
                      <iframe
                        title="Book a Consultation"
                        src={CALENDAR_EMBED_URL}
                        width="100%"
                        height="750"
                        frameBorder="0"
                      />
                    </div>
                  )}

                  <p className="text-sm text-muted-foreground mt-3">
                    After selecting a slot above, submit this form to save your request in the system.
                  </p>
                </div>
              ) : (
                <>
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
                  </div>
                </>
              )}

              {/* Step 4: Additional Info */}
              <div>
                <h2 className="text-xl font-heading font-bold mb-4">
                  {useCalendarIntegration ? "3. Tell Us More (Optional)" : "4. Tell Us More (Optional)"}
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
                <div>
                  {selectedType && (
                    <p className="text-lg font-bold">
                      Total: $
                      {consultationTypes.find((t) => t.id === selectedType)?.price || 0}
                    </p>
                  )}
                </div>

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
                      (!useCalendarIntegration && (!selectedDate || !selectedTime)) ||
                      (useCalendarIntegration && !CALENDAR_EMBED_URL)
                    }
                  >
                    {isSubmitting ? "Submitting..." : "Confirm Booking"}
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
