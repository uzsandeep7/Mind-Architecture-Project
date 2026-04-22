import { useParams, Link, useSearchParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { Layout } from "@/components/layout/Layout";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin, Clock, Users, ArrowLeft, Share2, Check } from "lucide-react";
import { EventCheckoutModal } from "@/components/checkout/EventCheckoutModal";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { PaymentSuccessDialog } from "@/components/checkout/PaymentSuccessDialog";

type EventDetails = {
  id: string;
  title: string;
  description: string | null;
  date: string;
  venue: string;
  price: number;
  total_seats: number;
  available_seats: number;
  image_url: string | null;
  member_price: number | null;
  is_members_only: boolean;
};

const calculateTimeLeft = (eventDate: Date) => {
  const difference = eventDate.getTime() - new Date().getTime();
  if (difference <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 };
  return {
    days: Math.floor(difference / (1000 * 60 * 60 * 24)),
    hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((difference / (1000 * 60)) % 60),
    seconds: Math.floor((difference / 1000) % 60),
  };
};

const EventDetailPage = () => {
  const { isMember } = useAuth();
  const { id } = useParams<{ id: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const [event, setEvent] = useState<EventDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [showCheckout, setShowCheckout] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [bookingTotal, setBookingTotal] = useState<number | undefined>(undefined);
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const fetchEvent = async () => {
      if (!id) {
        setLoading(false);
        return;
      }

      const { data } = await supabase
        .from("events")
        .select("*")
        .eq("id", id)
        .eq("is_published", true)
        .maybeSingle();

      setEvent(data ?? null);
      setLoading(false);
    };

    void fetchEvent();
  }, [id]);

  useEffect(() => {
    if (!event) return;
    const eventDate = new Date(event.date);
    setTimeLeft(calculateTimeLeft(eventDate));
    const timer = setInterval(() => setTimeLeft(calculateTimeLeft(eventDate)), 1000);
    return () => clearInterval(timer);
  }, [event]);

  useEffect(() => {
    const sessionId = searchParams.get("session_id");
    const success = searchParams.get("success");
    const canceled = searchParams.get("canceled");
    const bookingId = searchParams.get("booking_id");

    if (canceled === "1") {
      toast.error("Stripe checkout was canceled.");
      setSearchParams({}, { replace: true });
      return;
    }

    if (!success || success !== "1" || !sessionId || !bookingId || !event) return;

    const verifyEventCheckout = async () => {
      const { data, error } = await supabase.functions.invoke("verify-event-checkout", {
        body: { sessionId, bookingId },
      });

      if (error || !data?.bookingId) {
        toast.error("We could not verify your Stripe event payment yet.");
        return;
      }

      setEvent((prev) =>
        prev
          ? {
              ...prev,
              available_seats: Math.max(0, prev.available_seats - Number(data.seats ?? 0)),
            }
          : prev,
      );
      const unitPrice = isMember && event.member_price !== null ? Number(event.member_price) : Number(event.price);
      setBookingTotal(unitPrice * Number(data.seats ?? 0) * 1.1);
      setShowCheckout(false);
      setShowSuccess(true);
      setSearchParams({}, { replace: true });
      toast.success("Event booking confirmed successfully!");
    };

    void verifyEventCheckout();
  }, [event, isMember, searchParams, setSearchParams]);

  if (loading) {
    return (
      <Layout>
        <div className="pt-32 pb-16 text-center">
          <h1 className="text-2xl font-heading">Loading event...</h1>
        </div>
      </Layout>
    );
  }

  if (!event) {
    return (
      <Layout>
        <div className="pt-32 pb-16 text-center">
          <h1 className="text-2xl font-heading">Event not found</h1>
          <Button variant="goldOutline" className="mt-4" asChild>
            <Link to="/events">Back to Events</Link>
          </Button>
        </div>
      </Layout>
    );
  }

  const eventDate = new Date(event.date);
  const seatsPercentage = event.total_seats > 0 ? (event.available_seats / event.total_seats) * 100 : 0;
  const highlights = [
    "Live guided session and practical event experience",
    "Interactive learning and community engagement",
    "Entry managed directly through the updated backend",
    "Event details and availability updated in real time",
  ];

  return (
    <Layout>
      <section className="pb-0 pt-24">
        <div className="relative h-[50vh] min-h-[400px]">
          <img
            src={event.image_url || "/placeholder.svg"}
            alt={event.title}
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-dark via-dark/50 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-8">
            <div className="container-wide">
              <Link to="/events" className="mb-4 inline-flex items-center text-cream/70 transition-colors hover:text-cream">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Events
              </Link>
              <div className="mb-4 flex flex-wrap gap-2">
                <Badge className="bg-primary text-primary-foreground">Live Event</Badge>
                {event.is_members_only ? <Badge className="bg-amber-500 text-black">Members Only</Badge> : null}
              </div>
              <h1 className="mb-4 text-3xl font-heading font-bold text-cream md:text-5xl">
                {event.title}
              </h1>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-background py-12">
        <div className="container-wide">
          <div className="grid gap-12 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                <h2 className="mb-6 text-2xl font-heading font-bold">About This Event</h2>
                <div className="prose prose-lg mb-12 max-w-none dark:prose-invert">
                  <p className="text-muted-foreground">
                    {event.description || "This event was created from the admin backend and is now visible on the live events page."}
                  </p>
                </div>

                <h3 className="mb-4 text-xl font-heading font-bold">What's Included</h3>
                <div className="mb-12 grid gap-3 sm:grid-cols-2">
                  {highlights.map((highlight) => (
                    <div key={highlight} className="flex items-start gap-3 rounded-lg bg-secondary/30 p-4">
                      <Check className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                      <span className="text-sm">{highlight}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>

            <div className="lg:col-span-1">
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="sticky top-24">
                <div className="mb-6 rounded-2xl border border-border bg-card p-6">
                  <div className="mb-6 grid grid-cols-4 gap-2">
                    {[
                      { value: timeLeft.days, label: "Days" },
                      { value: timeLeft.hours, label: "Hrs" },
                      { value: timeLeft.minutes, label: "Min" },
                      { value: timeLeft.seconds, label: "Sec" },
                    ].map((item) => (
                      <div key={item.label} className="rounded-lg bg-secondary py-3 text-center">
                        <p className="text-2xl font-bold">{item.value}</p>
                        <p className="text-[10px] uppercase text-muted-foreground">{item.label}</p>
                      </div>
                    ))}
                  </div>

                  <div className="mb-6">
                    <div className="mb-2 flex items-baseline justify-between">
                      <span className="text-muted-foreground">Price</span>
                      <div className="text-right">
                        {isMember && event.member_price !== null && Number(event.member_price) < Number(event.price) ? (
                          <>
                            <p className="text-sm text-muted-foreground line-through">${Number(event.price).toFixed(2)}</p>
                            <span className="text-2xl font-heading font-bold text-primary">${Number(event.member_price).toFixed(2)}</span>
                          </>
                        ) : (
                          <>
                            <span className="text-2xl font-heading font-bold">${Number(event.price).toFixed(2)}</span>
                            {!event.is_members_only && event.member_price !== null && Number(event.member_price) < Number(event.price) ? (
                              <p className="text-xs text-amber-500">Members pay ${Number(event.member_price).toFixed(2)}</p>
                            ) : null}
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="mb-6">
                    <div className="mb-2 flex items-center justify-between text-sm">
                      <span className="flex items-center gap-1 text-muted-foreground">
                        <Users size={14} />
                        {event.available_seats} seats left
                      </span>
                      <span className={`font-medium ${seatsPercentage < 30 ? "text-destructive" : "text-primary"}`}>
                        {seatsPercentage < 30 ? "Selling Fast!" : "Available"}
                      </span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-secondary">
                      <div className="h-full rounded-full bg-primary transition-all duration-500" style={{ width: `${100 - seatsPercentage}%` }} />
                    </div>
                  </div>

                  {event.is_members_only && !isMember ? (
                    <Button variant="outline" size="lg" className="mb-3 w-full" asChild>
                      <Link to="/membership">Unlock with Premium Membership</Link>
                    </Button>
                  ) : (
                    <Button variant="gold" size="lg" className="mb-3 w-full" onClick={() => setShowCheckout(true)}>
                      Book Now - $
                      {Number(isMember && event.member_price !== null ? event.member_price : event.price).toFixed(2)}
                    </Button>
                  )}
                  <Button variant="outline" size="sm" className="w-full">
                    <Share2 className="mr-2 h-4 w-4" />
                    Share Event
                  </Button>

                  <EventCheckoutModal
                    open={showCheckout}
                    onOpenChange={setShowCheckout}
                    event={{
                      id: event.id,
                      title: event.title,
                      date: eventDate,
                      venue: event.venue,
                      price: Number(event.price),
                      memberPrice: Number(event.member_price ?? event.price),
                      availableSeats: event.available_seats,
                    }}
                    isMember={isMember}
                  />
                  <PaymentSuccessDialog
                    open={showSuccess}
                    onOpenChange={setShowSuccess}
                    type="event"
                    eventTitle={event.title}
                    orderTotal={bookingTotal}
                  />
                </div>

                <div className="rounded-2xl border border-border bg-card p-6">
                  <h3 className="mb-4 font-heading font-bold">Event Details</h3>
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <Calendar className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                      <p className="font-medium">
                        {eventDate.toLocaleDateString("en-AU", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
                      </p>
                    </div>
                    <div className="flex items-start gap-3">
                      <Clock className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                      <p className="font-medium">
                        {eventDate.toLocaleTimeString("en-AU", { hour: "2-digit", minute: "2-digit" })}
                      </p>
                    </div>
                    <div className="flex items-start gap-3">
                      <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                      <p className="font-medium">{event.venue}</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default EventDetailPage;
