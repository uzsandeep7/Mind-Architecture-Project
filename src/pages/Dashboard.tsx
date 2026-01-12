import { Layout } from "@/components/layout/Layout";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar, Package, MessageSquare, User, LogOut, Settings, ShoppingBag, Phone } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { format } from "date-fns";

interface EventBooking {
  id: string;
  seats: number;
  status: string;
  total_amount: number;
  created_at: string;
  event: {
    title: string;
    date: string;
    venue: string;
  } | null;
}

interface Order {
  id: string;
  status: string;
  total_amount: number;
  created_at: string;
  order_items: {
    quantity: number;
    price: number;
    book: {
      title: string;
    } | null;
  }[];
}

interface Consultation {
  id: string;
  date: string;
  topic: string | null;
  status: string;
  created_at: string;
}

interface Profile {
  full_name: string | null;
  avatar_url: string | null;
}

// Mock data for frontend design purposes
const mockEventBookings: EventBooking[] = [
  {
    id: "1",
    seats: 2,
    status: "confirmed",
    total_amount: 199.98,
    created_at: new Date().toISOString(),
    event: { title: "Resilience Leadership Workshop", date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), venue: "Sydney Convention Centre" }
  },
  {
    id: "2",
    seats: 1,
    status: "pending",
    total_amount: 149.99,
    created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    event: { title: "Mind Architecture Masterclass", date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(), venue: "Melbourne Business Hub" }
  }
];

const mockOrders: Order[] = [
  {
    id: "ORD12345",
    status: "delivered",
    total_amount: 54.98,
    created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    order_items: [
      { quantity: 1, price: 29.99, book: { title: "Mind Architecture" } },
      { quantity: 1, price: 24.99, book: { title: "The Breakthrough Blueprint" } }
    ]
  }
];

const mockConsultations: Consultation[] = [
  {
    id: "1",
    date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
    topic: "Executive Burnout Recovery",
    status: "confirmed",
    created_at: new Date().toISOString()
  }
];

const mockProfile: Profile = {
  full_name: "Sarah Johnson",
  avatar_url: null
};

const DashboardPage = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile | null>(mockProfile);
  const [eventBookings, setEventBookings] = useState<EventBooking[]>(mockEventBookings);
  const [orders, setOrders] = useState<Order[]>(mockOrders);
  const [consultations, setConsultations] = useState<Consultation[]>(mockConsultations);
  const [isSaving, setIsSaving] = useState(false);
  const [fullName, setFullName] = useState(mockProfile.full_name || "");
  const [email, setEmail] = useState("sarah.johnson@example.com");
  const [phone, setPhone] = useState("+61 412 345 678");

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    // Simulate save for frontend demo
    setTimeout(() => {
      setProfile({ ...profile, full_name: fullName });
      toast.success("Profile updated successfully");
      setIsSaving(false);
    }, 1000);
  };

  const handleSignOut = () => {
    navigate("/");
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
      case "paid":
      case "completed":
      case "delivered":
        return "text-green-600 bg-green-100";
      case "pending":
        return "text-yellow-600 bg-yellow-100";
      case "cancelled":
        return "text-red-600 bg-red-100";
      default:
        return "text-muted-foreground bg-secondary";
    }
  };

  return (
    <Layout>
      {/* Hero */}
      <section className="pt-32 pb-8 bg-gradient-hero text-cream">
        <div className="container-wide">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between"
          >
            <div>
              <span className="text-primary font-medium tracking-widest uppercase text-sm">
                Dashboard
              </span>
              <h1 className="text-4xl md:text-5xl font-heading font-bold mt-4">
                Welcome,
                <span className="text-gradient-gold"> {profile?.full_name || "User"}</span>
              </h1>
            </div>
            <Button variant="goldOutline" onClick={handleSignOut}>
              <LogOut size={18} />
              Sign Out
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Dashboard Content */}
      <section className="section-padding bg-background">
        <div className="container-wide">
          <Tabs defaultValue="bookings" className="space-y-8">
            <TabsList className="grid grid-cols-4 w-full max-w-xl">
              <TabsTrigger value="bookings">
                <Calendar className="w-4 h-4 mr-2" />
                Events
              </TabsTrigger>
              <TabsTrigger value="orders">
                <ShoppingBag className="w-4 h-4 mr-2" />
                Orders
              </TabsTrigger>
              <TabsTrigger value="consultations">
                <MessageSquare className="w-4 h-4 mr-2" />
                Consultations
              </TabsTrigger>
              <TabsTrigger value="profile">
                <User className="w-4 h-4 mr-2" />
                Profile
              </TabsTrigger>
            </TabsList>

            {/* Event Bookings */}
            <TabsContent value="bookings">
              <div className="grid gap-4">
                {eventBookings.length > 0 ? (
                  eventBookings.map((booking) => (
                    <Card key={booking.id}>
                      <CardContent className="p-6">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                          <div>
                            <h3 className="font-heading font-bold text-lg">
                              {booking.event?.title || "Event"}
                            </h3>
                            <p className="text-sm text-muted-foreground">
                              {booking.event?.date && format(new Date(booking.event.date), "PPP")} • {booking.event?.venue}
                            </p>
                            <p className="text-sm text-muted-foreground mt-1">
                              {booking.seats} seat(s) • ${booking.total_amount}
                            </p>
                          </div>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}>
                            {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <Card>
                    <CardContent className="p-8 text-center">
                      <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">No event bookings yet.</p>
                      <Button variant="gold" className="mt-4" onClick={() => navigate("/events")}>
                        Browse Events
                      </Button>
                    </CardContent>
                  </Card>
                )}
              </div>
            </TabsContent>

            {/* Orders */}
            <TabsContent value="orders">
              <div className="grid gap-4">
                {orders.length > 0 ? (
                  orders.map((order) => (
                    <Card key={order.id}>
                      <CardContent className="p-6">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                          <div>
                            <h3 className="font-heading font-bold text-lg">
                              Order #{order.id.slice(0, 8).toUpperCase()}
                            </h3>
                            <p className="text-sm text-muted-foreground">
                              {format(new Date(order.created_at), "PPP")}
                            </p>
                            <p className="text-sm text-muted-foreground mt-1">
                              {order.order_items.map((item) => item.book?.title).join(", ")}
                            </p>
                            <p className="text-sm font-medium mt-1">${order.total_amount}</p>
                          </div>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <Card>
                    <CardContent className="p-8 text-center">
                      <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">No orders yet.</p>
                      <Button variant="gold" className="mt-4" onClick={() => navigate("/books")}>
                        Browse Books
                      </Button>
                    </CardContent>
                  </Card>
                )}
              </div>
            </TabsContent>

            {/* Consultations */}
            <TabsContent value="consultations">
              <div className="grid gap-4">
                {consultations.length > 0 ? (
                  consultations.map((consultation) => (
                    <Card key={consultation.id}>
                      <CardContent className="p-6">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                          <div>
                            <h3 className="font-heading font-bold text-lg">
                              {consultation.topic || "Consultation"}
                            </h3>
                            <p className="text-sm text-muted-foreground">
                              {format(new Date(consultation.date), "PPP 'at' p")}
                            </p>
                          </div>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(consultation.status)}`}>
                            {consultation.status.charAt(0).toUpperCase() + consultation.status.slice(1)}
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <Card>
                    <CardContent className="p-8 text-center">
                      <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">No consultations booked yet.</p>
                      <Button variant="gold" className="mt-4" onClick={() => navigate("/consultation")}>
                        Book Consultation
                      </Button>
                    </CardContent>
                  </Card>
                )}
              </div>
            </TabsContent>

            {/* Profile */}
            <TabsContent value="profile">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings size={20} />
                    Profile Settings
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleUpdateProfile} className="space-y-6 max-w-md">
                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Enter your email"
                      />
                    </div>
                    <div>
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input
                        id="phone"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="Enter your phone number"
                      />
                    </div>
                    <div>
                      <Label htmlFor="fullName">Full Name</Label>
                      <Input
                        id="fullName"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="Enter your full name"
                      />
                    </div>
                    <Button type="submit" variant="gold" disabled={isSaving}>
                      {isSaving ? "Saving..." : "Save Changes"}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </section>
    </Layout>
  );
};

export default DashboardPage;
