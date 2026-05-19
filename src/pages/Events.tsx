import { Layout } from "@/components/layout/Layout";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Calendar, MapPin, Clock, Users, Filter, Search, ArrowRight, Crown, Lock } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Link } from "react-router-dom";
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
  is_published: boolean | null;
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

const EventCard = ({
  event,
  index,
  isMember,
  isLoggedIn,
}: {
  event: EventItem;
  index: number;
  isMember: boolean;
  isLoggedIn: boolean;
}) => {
  const eventDate = new Date(event.date);
  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft(eventDate));
  const seatsPercentage = event.total_seats > 0 ? (event.available_seats / event.total_seats) * 100 : 0;

  useEffect(() => {
    const timer = setInterval(() => setTimeLeft(calculateTimeLeft(eventDate)), 1000);
    return () => clearInterval(timer);
  }, [event.date]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="group flex h-full flex-col overflow-hidden rounded-xl border border-border bg-card shadow-soft hover-lift"
    >
      <Link to={`/programs/${event.id}`}>
        <div className="relative h-56 overflow-hidden">
          <img
            src={event.image_url || "/placeholder.svg"}
            alt={event.title}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-dark/80 to-transparent" />
          <div className="absolute top-4 left-4">
            <div className="flex flex-wrap gap-2">
              <span className="rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground">
                Live Program
              </span>
              {event.is_members_only ? (
                <span className="flex items-center gap-1 rounded-full bg-amber-500 px-3 py-1 text-xs font-semibold text-black">
                  <Crown className="h-3 w-3" />
                  Members Only
                </span>
              ) : null}
            </div>
          </div>
          <div className="absolute bottom-4 left-4 right-4">
            <div className="grid grid-cols-4 gap-2">
              {[
                { value: timeLeft.days, label: "Days" },
                { value: timeLeft.hours, label: "Hrs" },
                { value: timeLeft.minutes, label: "Min" },
                { value: timeLeft.seconds, label: "Sec" },
              ].map((item) => (
                <div key={item.label} className="rounded-md bg-dark/60 py-1.5 text-center backdrop-blur-sm">
                  <p className="text-xl font-bold text-cream">{item.value}</p>
                  <p className="text-[10px] uppercase text-cream/60">{item.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Link>

      <div className="flex flex-1 flex-col p-6">
        <Link to={`/programs/${event.id}`}>
          <h3 className="mb-2 text-xl font-heading font-bold transition-colors group-hover:text-primary">
            {event.title}
          </h3>
        </Link>
        <p className="mb-4 min-h-[3.5rem] line-clamp-2 text-sm text-muted-foreground">
          {event.description || "Join this upcoming event and explore a live Mind Architecture experience."}
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
            <div
              className="h-full rounded-full bg-primary transition-all duration-500"
              style={{ width: `${100 - seatsPercentage}%` }}
            />
          </div>
        </div>

        <div className="mt-auto flex items-end justify-between gap-4 border-t border-border pt-4">
          <div className="min-w-0 flex-1">
            {isMember && event.member_price !== null && Number(event.member_price) < Number(event.price) ? (
              <>
                <p className="text-sm text-muted-foreground line-through">${Number(event.price).toFixed(2)}</p>
                <p className="flex flex-wrap items-baseline gap-1 text-2xl font-heading font-bold text-primary leading-none">
                  <Crown className="h-4 w-4" />
                  ${Number(event.member_price).toFixed(2)}
                  <span className="text-sm font-body text-muted-foreground">/person</span>
                </p>
              </>
            ) : (
              <>
                <p className="flex flex-wrap items-baseline gap-1 text-2xl font-heading font-bold leading-none">
                  ${Number(event.price).toFixed(2)}
                  <span className="text-sm font-body text-muted-foreground">/person</span>
                </p>
                {!event.is_members_only && event.member_price !== null && Number(event.member_price) < Number(event.price) ? (
                  <p className="mt-2 text-xs font-medium text-amber-500">Members pay ${Number(event.member_price).toFixed(2)}</p>
                ) : null}
              </>
            )}
          </div>
          <Button
            variant={event.is_members_only && !isMember ? "outline" : "gold"}
            size="sm"
            className="shrink-0 min-w-[148px]"
            asChild
          >
            <Link
              to={
                event.is_members_only && !isMember
                  ? isLoggedIn
                    ? "/membership"
                    : "/auth"
                  : isLoggedIn
                    ? `/programs/${event.id}`
                    : "/auth"
              }
            >
              {event.is_members_only && !isMember ? (
                <>
                  <Lock size={14} />
                  {isLoggedIn ? "Upgrade to Book" : "Sign In to Upgrade"}
                </>
              ) : (
                <>
                  {isLoggedIn ? "Book Program" : "Sign In to Book"}
                  <ArrowRight size={14} />
                </>
              )}
            </Link>
          </Button>
        </div>
      </div>
    </motion.div>
  );
};

const EventsPage = () => {
  const { user, isMember } = useAuth();
  const [events, setEvents] = useState<EventItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedVenue, setSelectedVenue] = useState("All");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadEvents = async () => {
      setIsLoading(true);
      const { data, error } = await supabase
        .from("events")
        .select("*")
        .eq("is_published", true)
        .order("date", { ascending: true });

      if (!error) {
        setEvents(data ?? []);
      }
      setIsLoading(false);
    };

    void loadEvents();
  }, []);

  const venues = useMemo(
    () => ["All", ...Array.from(new Set(events.map((event) => event.venue).filter(Boolean))).sort()],
    [events],
  );

  const filteredEvents = useMemo(
    () =>
      events.filter((event) => {
        const q = searchQuery.toLowerCase();
        const matchesVenue = selectedVenue === "All" || event.venue === selectedVenue;
        return (
          matchesVenue &&
          event.title.toLowerCase().includes(q) ||
          matchesVenue && event.venue.toLowerCase().includes(q) ||
          matchesVenue && (event.description || "").toLowerCase().includes(q)
        );
      }),
    [events, searchQuery, selectedVenue],
  );

  return (
    <Layout>
      <section className="bg-gradient-hero pb-16 pt-32 text-cream">
        <div className="container-wide">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-3xl">
            <span className="text-sm font-medium uppercase tracking-widest text-primary">Live Programs</span>
            <h1 className="mb-6 mt-4 text-4xl font-heading font-bold md:text-5xl lg:text-6xl">
              Explore Upcoming
              <span className="text-gradient-gold"> MIND Architecture Programs</span>
            </h1>
            <p className="text-lg text-cream/70">
              Explore upcoming MIND Architecture programs and experiences.
            </p>
          </motion.div>
        </div>
      </section>

      <section className="sticky top-16 z-30 border-b border-border bg-background/95 py-8 backdrop-blur-md">
        <div className="container-wide">
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            <div className="flex w-full items-center gap-2 overflow-x-auto pb-2 md:w-auto md:pb-0">
              <Filter size={18} className="shrink-0 text-muted-foreground" />
              {venues.map((venue) => (
                <button
                  key={venue}
                  onClick={() => setSelectedVenue(venue)}
                  className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition-all ${
                    selectedVenue === venue
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                  }`}
                >
                  {venue}
                </button>
              ))}
            </div>
            <div className="relative w-full md:w-64">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search programs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="section-padding bg-background">
        <div className="container-wide">
          {isLoading ? (
            <div className="py-16 text-center text-lg text-muted-foreground">Loading programs...</div>
          ) : filteredEvents.length > 0 ? (
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {filteredEvents.map((event, index) => (
                <EventCard
                  key={event.id}
                  event={event}
                  index={index}
                  isMember={isMember}
                  isLoggedIn={Boolean(user)}
                />
              ))}
            </div>
          ) : (
            <div className="py-16 text-center">
              <p className="text-lg text-muted-foreground">No live programs available right now.</p>
            </div>
          )}
        </div>
      </section>
    </Layout>
  );
};

export default EventsPage;
