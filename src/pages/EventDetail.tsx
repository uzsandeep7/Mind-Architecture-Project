import { useParams, Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { Layout } from "@/components/layout/Layout";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Calendar,
  MapPin,
  Clock,
  Users,
  ArrowLeft,
  Share2,
  Crown,
  Check,
} from "lucide-react";
import { EventCheckoutModal } from "@/components/checkout/EventCheckoutModal";

interface Event {
  id: number;
  title: string;
  description: string;
  fullDescription: string;
  date: Date;
  venue: string;
  city: string;
  price: number;
  memberPrice: number;
  totalSeats: number;
  availableSeats: number;
  imageUrl: string;
  category: string;
  isPremiumOnly: boolean;
  highlights: string[];
}

const allEvents: Event[] = [
  {
    id: 1,
    title: "Mind Architecture Masterclass",
    description: "A transformative full-day experience to rewire your mindset for success.",
    fullDescription: `Join us for an immersive full-day experience that will fundamentally transform how you think about success, achievement, and personal growth. This masterclass brings together cutting-edge neuroscience, proven psychological frameworks, and practical implementation strategies.

You'll learn the foundational principles of mental architecture—the invisible structures that determine your thoughts, behaviors, and ultimately, your results. Through interactive exercises, group discussions, and personal reflection, you'll identify and begin to rewire the limiting patterns that have been holding you back.

This is not just another motivational seminar. It's a practical, hands-on workshop designed to create lasting change. You'll leave with a personalized action plan and the tools to continue your transformation long after the event ends.`,
    date: new Date("2026-02-15T09:00:00"),
    venue: "Melbourne Convention Centre",
    city: "Melbourne",
    price: 299,
    memberPrice: 209,
    totalSeats: 500,
    availableSeats: 127,
    imageUrl: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200",
    category: "Masterclass",
    isPremiumOnly: false,
    highlights: [
      "Full-day immersive experience (9 AM - 5 PM)",
      "Lunch and refreshments included",
      "Personal workbook and resources",
      "Certificate of completion",
      "30-day follow-up support",
    ],
  },
  {
    id: 2,
    title: "Breakthrough Weekend Intensive",
    description: "Two days of deep work to break through your limiting beliefs.",
    fullDescription: `This intensive two-day program is designed for those who are ready to make a quantum leap in their personal and professional lives. Over the course of the weekend, you'll dive deep into the subconscious patterns that have been silently sabotaging your success.

Working in an intimate group setting, you'll experience powerful breakthrough exercises, guided meditations, and transformational conversations that will shift your perspective on what's possible for your life. Our expert facilitators will guide you through a carefully crafted journey of self-discovery and empowerment.

The Breakthrough Weekend is particularly suited for individuals facing major life transitions, entrepreneurs seeking their next level, or anyone feeling stuck despite their best efforts.`,
    date: new Date("2026-03-22T09:00:00"),
    venue: "Sydney Opera House",
    city: "Sydney",
    price: 599,
    memberPrice: 419,
    totalSeats: 300,
    availableSeats: 89,
    imageUrl: "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=1200",
    category: "Intensive",
    isPremiumOnly: true,
    highlights: [
      "Two full days of transformation",
      "VIP networking dinner Saturday evening",
      "One-on-one breakthrough session",
      "Lifetime access to recordings",
      "Private community membership",
    ],
  },
  {
    id: 3,
    title: "Corporate Leadership Summit",
    description: "Empowering executives with mental frameworks for exceptional leadership.",
    fullDescription: `The Corporate Leadership Summit is designed exclusively for executives, managers, and emerging leaders who understand that true leadership begins with mastering oneself. This premium event brings together thought leaders, successful entrepreneurs, and leadership experts for a day of high-level learning and networking.

You'll discover the mental models used by world-class leaders to navigate complexity, inspire teams, and drive exceptional results. The summit combines keynote presentations, interactive workshops, and mastermind sessions to ensure you leave with immediately applicable strategies.

This is more than a conference—it's an investment in your leadership legacy.`,
    date: new Date("2026-04-10T09:00:00"),
    venue: "Brisbane Exhibition Centre",
    city: "Brisbane",
    price: 449,
    memberPrice: 314,
    totalSeats: 200,
    availableSeats: 156,
    imageUrl: "https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=1200",
    category: "Corporate",
    isPremiumOnly: false,
    highlights: [
      "Executive-level networking",
      "Keynote by industry leaders",
      "Leadership assessment included",
      "Executive summary and action plan",
      "Quarterly follow-up webinars",
    ],
  },
];

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
  const { id } = useParams<{ id: string }>();
  const event = allEvents.find((e) => e.id === Number(id));
  const [showCheckout, setShowCheckout] = useState(false);
  const [timeLeft, setTimeLeft] = useState(
    event ? calculateTimeLeft(event.date) : { days: 0, hours: 0, minutes: 0, seconds: 0 }
  );

  useEffect(() => {
    if (!event) return;
    const timer = setInterval(() => setTimeLeft(calculateTimeLeft(event.date)), 1000);
    return () => clearInterval(timer);
  }, [event]);

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

  const seatsPercentage = (event.availableSeats / event.totalSeats) * 100;

  return (
    <Layout>
      {/* Hero */}
      <section className="pt-24 pb-0">
        <div className="relative h-[50vh] min-h-[400px]">
          <img
            src={event.imageUrl}
            alt={event.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-dark via-dark/50 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-8">
            <div className="container-wide">
              <Link
                to="/events"
                className="inline-flex items-center text-cream/70 hover:text-cream transition-colors mb-4"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Events
              </Link>
              <div className="flex flex-wrap gap-2 mb-4">
                <Badge className="bg-primary text-primary-foreground">
                  {event.category}
                </Badge>
                {event.isPremiumOnly && (
                  <Badge className="bg-amber-500 text-black">
                    <Crown className="w-3 h-3 mr-1" />
                    Premium Only
                  </Badge>
                )}
              </div>
              <h1 className="text-3xl md:text-5xl font-heading font-bold text-cream mb-4">
                {event.title}
              </h1>
            </div>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="py-12 bg-background">
        <div className="container-wide">
          <div className="grid lg:grid-cols-3 gap-12">
            {/* Main Content */}
            <div className="lg:col-span-2">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <h2 className="text-2xl font-heading font-bold mb-6">
                  About This Event
                </h2>
                <div className="prose prose-lg dark:prose-invert max-w-none mb-12">
                  {event.fullDescription.split("\n\n").map((para, index) => (
                    <p key={index} className="text-muted-foreground mb-4">
                      {para}
                    </p>
                  ))}
                </div>

                <h3 className="text-xl font-heading font-bold mb-4">
                  What's Included
                </h3>
                <div className="grid sm:grid-cols-2 gap-3 mb-12">
                  {event.highlights.map((highlight, index) => (
                    <div
                      key={index}
                      className="flex items-start gap-3 p-4 bg-secondary/30 rounded-lg"
                    >
                      <Check className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                      <span className="text-sm">{highlight}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="sticky top-24"
              >
                {/* Booking Card */}
                <div className="bg-card rounded-2xl border border-border p-6 mb-6">
                  {/* Countdown */}
                  <div className="grid grid-cols-4 gap-2 mb-6">
                    {[
                      { value: timeLeft.days, label: "Days" },
                      { value: timeLeft.hours, label: "Hrs" },
                      { value: timeLeft.minutes, label: "Min" },
                      { value: timeLeft.seconds, label: "Sec" },
                    ].map((item, i) => (
                      <div key={i} className="text-center bg-secondary rounded-lg py-3">
                        <p className="text-2xl font-bold">{item.value}</p>
                        <p className="text-[10px] text-muted-foreground uppercase">
                          {item.label}
                        </p>
                      </div>
                    ))}
                  </div>

                  {/* Pricing */}
                  <div className="mb-6">
                    <div className="flex items-baseline justify-between mb-2">
                      <span className="text-muted-foreground">Regular Price</span>
                      <span className="text-xl font-heading font-bold">
                        ${event.price}
                      </span>
                    </div>
                    <div className="flex items-baseline justify-between p-3 bg-primary/10 rounded-lg">
                      <span className="flex items-center gap-2 text-primary">
                        <Crown className="w-4 h-4" />
                        Member Price
                      </span>
                      <span className="text-2xl font-heading font-bold text-primary">
                        ${event.memberPrice}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2 text-center">
                      Save ${event.price - event.memberPrice} with Premium membership
                    </p>
                  </div>

                  {/* Seats Progress */}
                  <div className="mb-6">
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span className="flex items-center gap-1 text-muted-foreground">
                        <Users size={14} />
                        {event.availableSeats} seats left
                      </span>
                      <span
                        className={`font-medium ${
                          seatsPercentage < 30 ? "text-destructive" : "text-primary"
                        }`}
                      >
                        {seatsPercentage < 30 ? "Selling Fast!" : "Available"}
                      </span>
                    </div>
                    <div className="h-2 bg-secondary rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full transition-all duration-500"
                        style={{ width: `${100 - seatsPercentage}%` }}
                      />
                    </div>
                  </div>

                  <Button
                    variant="gold"
                    size="lg"
                    className="w-full mb-3"
                    onClick={() => setShowCheckout(true)}
                  >
                    Book Now - ${event.price}
                  </Button>
                  <Button variant="outline" size="sm" className="w-full">
                    <Share2 className="w-4 h-4 mr-2" />
                    Share Event
                  </Button>

                  <EventCheckoutModal
                    open={showCheckout}
                    onOpenChange={setShowCheckout}
                    event={{
                      title: event.title,
                      date: event.date,
                      venue: event.venue,
                      price: event.price,
                      memberPrice: event.memberPrice,
                      availableSeats: event.availableSeats,
                    }}
                  />
                </div>

                {/* Event Details */}
                <div className="bg-card rounded-2xl border border-border p-6">
                  <h3 className="font-heading font-bold mb-4">Event Details</h3>
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <Calendar className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium">
                          {event.date.toLocaleDateString("en-AU", {
                            weekday: "long",
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                          })}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Clock className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium">
                          {event.date.toLocaleTimeString("en-AU", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <MapPin className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium">{event.venue}</p>
                        <p className="text-sm text-muted-foreground">{event.city}</p>
                      </div>
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
