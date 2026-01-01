import { Layout } from "@/components/layout/Layout";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Calendar, MapPin, Clock, Users, Filter, Search, ArrowRight } from "lucide-react";
import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";

interface Event {
  id: number;
  title: string;
  description: string;
  date: Date;
  venue: string;
  city: string;
  price: number;
  totalSeats: number;
  availableSeats: number;
  imageUrl: string;
  category: string;
}

const allEvents: Event[] = [
  {
    id: 1,
    title: "Mind Architecture Masterclass",
    description: "A transformative full-day experience to rewire your mindset for success. Learn the foundational principles of mental architecture.",
    date: new Date("2026-02-15T09:00:00"),
    venue: "Melbourne Convention Centre",
    city: "Melbourne",
    price: 299,
    totalSeats: 500,
    availableSeats: 127,
    imageUrl: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800",
    category: "Masterclass",
  },
  {
    id: 2,
    title: "Breakthrough Weekend Intensive",
    description: "Two days of deep work to break through your limiting beliefs and unlock your true potential.",
    date: new Date("2026-03-22T09:00:00"),
    venue: "Sydney Opera House",
    city: "Sydney",
    price: 599,
    totalSeats: 300,
    availableSeats: 89,
    imageUrl: "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=800",
    category: "Intensive",
  },
  {
    id: 3,
    title: "Corporate Leadership Summit",
    description: "Empowering executives with mental frameworks for exceptional leadership and team performance.",
    date: new Date("2026-04-10T09:00:00"),
    venue: "Brisbane Exhibition Centre",
    city: "Brisbane",
    price: 449,
    totalSeats: 200,
    availableSeats: 156,
    imageUrl: "https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=800",
    category: "Corporate",
  },
  {
    id: 4,
    title: "Mindful Entrepreneur Workshop",
    description: "Build a business that aligns with your values while maintaining mental clarity and balance.",
    date: new Date("2026-05-05T10:00:00"),
    venue: "Perth Convention Centre",
    city: "Perth",
    price: 349,
    totalSeats: 150,
    availableSeats: 78,
    imageUrl: "https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=800",
    category: "Workshop",
  },
  {
    id: 5,
    title: "Resilience & Recovery Retreat",
    description: "A three-day immersive experience focused on building unshakeable mental resilience.",
    date: new Date("2026-06-20T08:00:00"),
    venue: "Gold Coast Retreat Centre",
    city: "Gold Coast",
    price: 899,
    totalSeats: 50,
    availableSeats: 12,
    imageUrl: "https://images.unsplash.com/photo-1517457373958-b7bdd4587205?w=800",
    category: "Retreat",
  },
  {
    id: 6,
    title: "Women in Leadership Forum",
    description: "Empowering women leaders with strategies for success in male-dominated industries.",
    date: new Date("2026-07-15T09:00:00"),
    venue: "Adelaide Convention Centre",
    city: "Adelaide",
    price: 399,
    totalSeats: 250,
    availableSeats: 198,
    imageUrl: "https://images.unsplash.com/photo-1528605248644-14dd04022da1?w=800",
    category: "Forum",
  },
];

const categories = ["All", "Masterclass", "Intensive", "Corporate", "Workshop", "Retreat", "Forum"];

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

const EventCard = ({ event, index }: { event: Event; index: number }) => {
  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft(event.date));
  const seatsPercentage = (event.availableSeats / event.totalSeats) * 100;

  useEffect(() => {
    const timer = setInterval(() => setTimeLeft(calculateTimeLeft(event.date)), 1000);
    return () => clearInterval(timer);
  }, [event.date]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="group bg-card rounded-xl overflow-hidden shadow-soft hover-lift border border-border"
    >
      <div className="relative h-56 overflow-hidden">
        <img
          src={event.imageUrl}
          alt={event.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-dark/80 to-transparent" />
        <div className="absolute top-4 left-4">
          <span className="px-3 py-1 bg-primary text-primary-foreground text-xs font-semibold rounded-full">
            {event.category}
          </span>
        </div>
        <div className="absolute bottom-4 left-4 right-4">
          <div className="grid grid-cols-4 gap-2">
            {[
              { value: timeLeft.days, label: "Days" },
              { value: timeLeft.hours, label: "Hrs" },
              { value: timeLeft.minutes, label: "Min" },
              { value: timeLeft.seconds, label: "Sec" },
            ].map((item, i) => (
              <div key={i} className="text-center bg-dark/60 backdrop-blur-sm rounded-md py-1.5">
                <p className="text-xl font-bold text-cream">{item.value}</p>
                <p className="text-[10px] text-cream/60 uppercase">{item.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="p-6">
        <h3 className="text-xl font-heading font-bold mb-2 group-hover:text-primary transition-colors">
          {event.title}
        </h3>
        <p className="text-muted-foreground text-sm mb-4 line-clamp-2">{event.description}</p>

        <div className="space-y-2 mb-4">
          <div className="flex items-center gap-2 text-sm">
            <Calendar size={14} className="text-primary" />
            <span>
              {event.date.toLocaleDateString("en-AU", {
                weekday: "short",
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Clock size={14} className="text-primary" />
            <span>
              {event.date.toLocaleTimeString("en-AU", { hour: "2-digit", minute: "2-digit" })}
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <MapPin size={14} className="text-primary" />
            <span>{event.venue}, {event.city}</span>
          </div>
        </div>

        <div className="mb-4">
          <div className="flex items-center justify-between text-sm mb-1">
            <span className="flex items-center gap-1 text-muted-foreground">
              <Users size={14} />
              {event.availableSeats} seats left
            </span>
            <span className={`font-medium ${seatsPercentage < 30 ? "text-destructive" : "text-primary"}`}>
              {seatsPercentage < 30 ? "Selling Fast!" : "Available"}
            </span>
          </div>
          <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all duration-500"
              style={{ width: `${100 - seatsPercentage}%` }}
            />
          </div>
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-border">
          <p className="text-2xl font-heading font-bold">
            ${event.price}
            <span className="text-sm font-body text-muted-foreground">/person</span>
          </p>
          <Button variant="gold" size="sm">
            Book Now
            <ArrowRight size={14} />
          </Button>
        </div>
      </div>
    </motion.div>
  );
};

const EventsPage = () => {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredEvents = allEvents.filter((event) => {
    const matchesCategory = selectedCategory === "All" || event.category === selectedCategory;
    const matchesSearch =
      event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.city.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

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
              Live Events
            </span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-heading font-bold mt-4 mb-6">
              Transform Your Life
              <span className="text-gradient-gold"> In Person</span>
            </h1>
            <p className="text-cream/70 text-lg">
              Join our transformative live events and experience the power of mindset 
              change in an immersive, high-energy environment.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Filters */}
      <section className="py-8 bg-background border-b border-border sticky top-20 z-30 backdrop-blur-md bg-background/95">
        <div className="container-wide">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0">
              <Filter size={18} className="text-muted-foreground shrink-0" />
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                    selectedCategory === category
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
            <div className="relative w-full md:w-64">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search events..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Events Grid */}
      <section className="section-padding bg-background">
        <div className="container-wide">
          {filteredEvents.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredEvents.map((event, index) => (
                <EventCard key={event.id} event={event} index={index} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <p className="text-muted-foreground text-lg">
                No events found matching your criteria.
              </p>
            </div>
          )}
        </div>
      </section>
    </Layout>
  );
};

export default EventsPage;
