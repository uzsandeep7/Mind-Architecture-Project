import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Calendar, MapPin, Clock, ArrowRight, Users } from "lucide-react";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";

interface Event {
  id: number;
  title: string;
  description: string;
  date: Date;
  venue: string;
  price: number;
  totalSeats: number;
  availableSeats: number;
  imageUrl: string;
}

const featuredEvents: Event[] = [
  {
    id: 1,
    title: "Mind Architecture Masterclass",
    description: "A transformative full-day experience to rewire your mindset for success.",
    date: new Date("2026-02-15T09:00:00"),
    venue: "Melbourne Convention Centre",
    price: 299,
    totalSeats: 500,
    availableSeats: 127,
    imageUrl: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800",
  },
  {
    id: 2,
    title: "Breakthrough Weekend Intensive",
    description: "Two days of deep work to break through your limiting beliefs and unlock potential.",
    date: new Date("2026-03-22T09:00:00"),
    venue: "Sydney Opera House",
    price: 599,
    totalSeats: 300,
    availableSeats: 89,
    imageUrl: "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=800",
  },
  {
    id: 3,
    title: "Corporate Leadership Summit",
    description: "Empowering executives with mental frameworks for exceptional leadership.",
    date: new Date("2026-04-10T09:00:00"),
    venue: "Brisbane Exhibition Centre",
    price: 449,
    totalSeats: 200,
    availableSeats: 156,
    imageUrl: "https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=800",
  },
];

const calculateTimeLeft = (eventDate: Date) => {
  const difference = eventDate.getTime() - new Date().getTime();
  
  if (difference <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0 };
  }

  return {
    days: Math.floor(difference / (1000 * 60 * 60 * 24)),
    hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((difference / (1000 * 60)) % 60),
    seconds: Math.floor((difference / 1000) % 60),
  };
};

const EventCard = ({ event, index }: { event: Event; index: number }) => {
  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft(event.date));

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft(event.date));
    }, 1000);
    return () => clearInterval(timer);
  }, [event.date]);

  const seatsPercentage = (event.availableSeats / event.totalSeats) * 100;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="group bg-card rounded-xl overflow-hidden shadow-soft hover-lift border border-border"
    >
      {/* Image */}
      <div className="relative h-48 overflow-hidden">
        <img
          src={event.imageUrl}
          alt={event.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-dark/80 to-transparent" />
        
        {/* Countdown Timer */}
        <div className="absolute bottom-4 left-4 right-4">
          <div className="grid grid-cols-4 gap-2">
            {[
              { value: timeLeft.days, label: "Days" },
              { value: timeLeft.hours, label: "Hrs" },
              { value: timeLeft.minutes, label: "Min" },
              { value: timeLeft.seconds, label: "Sec" },
            ].map((item, i) => (
              <div key={i} className="text-center bg-dark/60 backdrop-blur-sm rounded-md py-1">
                <p className="text-lg font-bold text-cream">{item.value}</p>
                <p className="text-[10px] text-cream/60 uppercase">{item.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        <h3 className="text-xl font-heading font-bold mb-2 group-hover:text-primary transition-colors">
          {event.title}
        </h3>
        <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
          {event.description}
        </p>

        {/* Event Details */}
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
              {event.date.toLocaleTimeString("en-AU", {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <MapPin size={14} className="text-primary" />
            <span>{event.venue}</span>
          </div>
        </div>

        {/* Seats Availability */}
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

        {/* Price & CTA */}
        <div className="flex items-center justify-between pt-4 border-t border-border">
          <p className="text-2xl font-heading font-bold">
            ${event.price}
            <span className="text-sm font-body text-muted-foreground">/person</span>
          </p>
          <Button variant="gold" size="sm">
            Book Now
          </Button>
        </div>
      </div>
    </motion.div>
  );
};

export const EventsSection = () => {
  return (
    <section className="section-padding bg-secondary/30">
      <div className="container-wide">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <span className="text-primary font-medium tracking-widest uppercase text-sm">
            Upcoming Events
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-heading font-bold mt-4 mb-6">
            Transform Your Life in Person
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Join our transformative live events and experience the power of 
            mindset change in an immersive environment.
          </p>
        </motion.div>

        {/* Events Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {featuredEvents.map((event, index) => (
            <EventCard key={event.id} event={event} index={index} />
          ))}
        </div>

        {/* View All Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center"
        >
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
