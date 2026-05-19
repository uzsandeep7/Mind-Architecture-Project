import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Calendar, MapPin, Clock, ArrowRight, Users, Crown, Lock } from "lucide-react";
import { Link } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

type EventItem = {
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

const EventCard = ({ event, index, isMember }: { event: EventItem; index: number; isMember: boolean }) => {
  const eventDate = useMemo(() => new Date(event.date), [event.date]);
  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft(eventDate));

  useEffect(() => {
    const timer = setInterval(() => setTimeLeft(calculateTimeLeft(eventDate)), 1000);
    return () => clearInterval(timer);
  }, [eventDate]);

  const seatsPercentage = event.total_seats > 0 ? (event.available_seats / event.total_seats) * 100 : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="group overflow-hidden rounded-xl border border-border bg-card shadow-soft hover-lift"
    >
      <div className="relative h-48 overflow-hidden">
        <img
          src={event.image_url || "/placeholder.svg"}
          alt={event.title}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-dark/80 to-transparent" />
        <div className="absolute bottom-4 left-4 right-4">
          <div className="grid grid-cols-4 gap-2">
            {[
              { value: timeLeft.days, label: "Days" },
              { value: timeLeft.hours, label: "Hrs" },
              { value: timeLeft.minutes, label: "Min" },
              { value: timeLeft.seconds, label: "Sec" },
            ].map((item) => (
              <div key={item.label} className="rounded-md bg-dark/60 py-1 text-center backdrop-blur-sm">
                <p className="text-lg font-bold text-cream">{item.value}</p>
                <p className="text-[10px] uppercase text-cream/60">{item.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="p-6">
        <h3 className="mb-2 text-xl font-heading font-bold transition-colors group-hover:text-primary">
          {event.title}
        </h3>
        <p className="mb-4 line-clamp-2 text-sm text-muted-foreground">
          {event.description || "Live event content managed directly from the backend."}
        </p>
        <div className="mb-4 space-y-2">
          <div className="flex items-center gap-2 text-sm">
            <Calendar size={14} className="text-primary" />
            <span>{eventDate.toLocaleDateString("en-AU", { weekday: "short", day: "numeric", month: "long", year: "numeric" })}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Clock size={14} className="text-primary" />
            <span>{eventDate.toLocaleTimeString("en-AU", { hour: "2-digit", minute: "2-digit" })}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <MapPin size={14} className="text-primary" />
            <span>{event.venue}</span>
          </div>
        </div>
        <div className="mb-4">
          <div className="mb-1 flex items-center justify-between text-sm">
            <span className="flex items-center gap-1 text-muted-foreground">
              <Users size={14} />
              {event.available_seats} seats left
            </span>
            <span className={`font-medium ${seatsPercentage < 30 ? "text-destructive" : "text-primary"}`}>
              {seatsPercentage < 30 ? "Selling Fast!" : "Available"}
            </span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-secondary">
            <div className="h-full rounded-full bg-primary transition-all duration-500" style={{ width: `${100 - seatsPercentage}%` }} />
          </div>
        </div>
        <div className="flex items-center justify-between border-t border-border pt-4">
          <div>
            {isMember && event.member_price !== null && Number(event.member_price) < Number(event.price) ? (
              <>
                <p className="text-sm text-muted-foreground line-through">${Number(event.price).toFixed(2)}</p>
                <p className="flex items-center gap-1 text-2xl font-heading font-bold text-primary">
                  <Crown className="h-4 w-4" />
                  ${Number(event.member_price).toFixed(2)}
                </p>
              </>
            ) : (
              <>
                <p className="text-2xl font-heading font-bold">
                  ${Number(event.price).toFixed(2)}
                  <span className="text-sm font-body text-muted-foreground">/person</span>
                </p>
                {!event.is_members_only && event.member_price !== null && Number(event.member_price) < Number(event.price) ? (
                  <p className="text-xs text-amber-500">Members pay ${Number(event.member_price).toFixed(2)}</p>
                ) : null}
              </>
            )}
          </div>
          <Button variant={event.is_members_only && !isMember ? "outline" : "gold"} size="sm" asChild>
            <Link to={event.is_members_only && !isMember ? "/membership" : `/events/${event.id}`}>
              {event.is_members_only && !isMember ? (
                <>
                  <Lock size={14} />
                  Unlock
                </>
              ) : (
                "Book Now"
              )}
            </Link>
          </Button>
        </div>
      </div>
    </motion.div>
  );
};

export const EventsSection = () => {
  const { isMember } = useAuth();
  const [events, setEvents] = useState<EventItem[]>([]);

  useEffect(() => {
    const loadFeaturedEvents = async () => {
      const { data } = await supabase
        .from("events")
        .select("*")
        .eq("is_published", true)
        .order("date", { ascending: true })
        .limit(3);

      setEvents(data ?? []);
    };

    void loadFeaturedEvents();
  }, []);

  if (events.length === 0) return null;

  return (
    <section className="section-padding bg-secondary/30">
      <div className="container-wide">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-12 text-center"
        >
          <span className="text-sm font-medium uppercase tracking-widest text-primary">Upcoming Events</span>
          <h2 className="mb-6 mt-4 text-3xl font-heading font-bold md:text-4xl lg:text-5xl">
            Transform Your Life in Person
          </h2>
          <p className="mx-auto max-w-2xl text-muted-foreground">
            These featured events and programs are refreshed live, so the homepage always reflects current admin content.
          </p>
        </motion.div>

        <div className="mb-12 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {events.map((event, index) => (
            <EventCard key={event.id} event={event} index={index} isMember={isMember} />
          ))}
        </div>

        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center">
          <Link to="/events">
            <Button variant="goldOutline" size="lg">
              View All Events
              <ArrowRight size={18} />
            </Button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
};
