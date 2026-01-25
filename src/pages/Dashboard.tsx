import { Layout } from "@/components/layout/Layout";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar, Package, MessageSquare, User, LogOut, Settings, ShoppingBag } from "lucide-react";
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
  event: { title: string; date: string; venue: string } | null;
}

interface Order {
  id: string;
  status: string;
  total_amount: number;
  created_at: string;
  order_items: { quantity: number; price: number; book: { title: string } | null }[];
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

// Mock data
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
  const [eventBookings] = useState<EventBooking[]>(mockEventBookings);
  const [orders] = useState<Order[]>(mockOrders);
  const [consultations] = useState<Consultation[]>(mockConsultations);
  const [isSaving, setIsSaving] = useState(false);
  const [fullName, setFullName] = useState(mockProfile.full_name || "");
  const [email, setEmail] = useState("sarah.johnson@example.com");
  const [phone, setPhone] = useState("+61 412 345 678");

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setTimeout(() => {
      setProfile({ ...profile, full_name: fullName });
      toast.success("Profile updated successfully");
      setIsSaving(false);
    }, 1000);
  };

  const handleSignOut = () => navigate("/");

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
      case "paid":
      case "completed":
      case "delivered":
        return "text-green-600 bg-green-100 dark:bg-green-900 dark:text-green-400";
      case "pending":
        return "text-yellow-600 bg-yellow-100 dark:bg-yellow-900 dark:text-yellow-400";
      case "cancelled":
        return "text-red-600 bg-red-100 dark:bg-red-900 dark:text-red-400";
      default:
        return "text-gray-500 bg-gray-100 dark:bg-gray-800 dark:text-gray-400";
    }
  };

  return (
    <Layout>
      {/* Hero */}
      <section className="pt-32 pb-8 bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 text-cream rounded-b-3xl shadow-lg">
        <div className="container-wide">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <span className="text-yellow-400 font-medium tracking-widest uppercase text-sm">Dashboard</span>
              <h1 className="text-4xl md:text-5xl font-heading font-bold mt-4">
                Welcome, <span className="text-gradient-gold">{profile?.full_name || "User"}</span>
              </h1>
            </div>
            <Button variant="goldOutline" className="flex items-center gap-2" onClick={handleSignOut}>
              <LogOut size={18} /> Sign Out
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Tabs Section */}
      <section className="section-padding bg-gray-50 dark:bg-dark">
        <div className="container-wide">
          <Tabs defaultValue="bookings" className="space-y-8">
            <TabsList className="grid grid-cols-4 w-full max-w-xl bg-gray-200 dark:bg-gray-800 rounded-full p-1">
              <TabsTrigger value="bookings" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-yellow-400 data-[state=active]:to-yellow-500 data-[state=active]:text-white rounded-full">
                <Calendar className="w-4 h-4 mr-2" /> Events
              </TabsTrigger>
              <TabsTrigger value="orders" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-yellow-400 data-[state=active]:to-yellow-500 data-[state=active]:text-white rounded-full">
                <ShoppingBag className="w-4 h-4 mr-2" /> Orders
              </TabsTrigger>
              <TabsTrigger value="consultations" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-yellow-400 data-[state=active]:to-yellow-500 data-[state=active]:text-white rounded-full">
                <MessageSquare className="w-4 h-4 mr-2" /> Consultations
              </TabsTrigger>
              <TabsTrigger value="profile" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-yellow-400 data-[state=active]:to-yellow-500 data-[state=active]:text-white rounded-full">
                <User className="w-4 h-4 mr-2" /> Profile
              </TabsTrigger>
            </TabsList>

            {/* Event Bookings */}
            <TabsContent value="bookings">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {eventBookings.length > 0 ? (
                  eventBookings.map((booking) => (
                    <Card key={booking.id} className="bg-white dark:bg-dark rounded-xl shadow-md hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300">
                      <CardContent className="p-6">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                          <div>
                            <h3 className="font-heading font-bold text-lg text-gray-800 dark:text-cream">{booking.event?.title || "Event"}</h3>
                            <p className="text-sm text-gray-500 dark:text-muted-foreground">
                              {booking.event?.date && format(new Date(booking.event.date), "PPP")} • {booking.event?.venue}
                            </p>
                            <p className="text-sm text-gray-500 dark:text-muted-foreground mt-1">{booking.seats} seat(s) • ${booking.total_amount}</p>
                          </div>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(booking.status)} transition-all`}>
                            {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <Card className="p-8 text-center bg-white dark:bg-dark rounded-xl shadow-md">
                    <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No event bookings yet.</p>
                    <Button variant="gold" className="mt-4" onClick={() => navigate("/events")}>Browse Events</Button>
                  </Card>
                )}
              </div>
            </TabsContent>

            {/* Orders */}
            <TabsContent value="orders">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {orders.length > 0 ? (
                  orders.map((order) => (
                    <Card key={order.id} className="bg-white dark:bg-dark rounded-xl shadow-md hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300">
                      <CardContent className="p-6">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                          <div>
                            <h3 className="font-heading font-bold text-lg text-gray-800 dark:text-cream">Order #{order.id.slice(0, 8).toUpperCase()}</h3>
                            <p className="text-sm text-gray-500 dark:text-muted-foreground">{format(new Date(order.created_at), "PPP")}</p>
                            <p className="text-sm text-gray-500 dark:text-muted-foreground mt-1">{order.order_items.map((item) => item.book?.title).join(", ")}</p>
                            <p className="text-sm font-medium mt-1">${order.total_amount}</p>
                          </div>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)} transition-all`}>
                            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <Card className="p-8 text-center bg-white dark:bg-dark rounded-xl shadow-md">
                    <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No orders yet.</p>
                    <Button variant="gold" className="mt-4" onClick={() => navigate("/books")}>Browse Books</Button>
                  </Card>
                )}
              </div>
            </TabsContent>

            {/* Consultations */}
            <TabsContent value="consultations">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {consultations.length > 0 ? (
                  consultations.map((consultation) => (
                    <Card key={consultation.id} className="bg-white dark:bg-dark rounded-xl shadow-md hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300">
                      <CardContent className="p-6">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                          <div>
                            <h3 className="font-heading font-bold text-lg text-gray-800 dark:text-cream">{consultation.topic || "Consultation"}</h3>
                            <p className="text-sm text-gray-500 dark:text-muted-foreground">{format(new Date(consultation.date), "PPP 'at' p")}</p>
                          </div>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(consultation.status)} transition-all`}>
                            {consultation.status.charAt(0).toUpperCase() + consultation.status.slice(1)}
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <Card className="p-8 text-center bg-white dark:bg-dark rounded-xl shadow-md">
                    <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No consultations booked yet.</p>
                    <Button variant="gold" className="mt-4" onClick={() => navigate("/consultation")}>Book Consultation</Button>
                  </Card>
                )}
              </div>
            </TabsContent>

            {/* Profile */}
            <TabsContent value="profile">
              <Card className="bg-white dark:bg-dark rounded-xl shadow-md">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><Settings size={20} /> Profile Settings</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleUpdateProfile} className="space-y-6 max-w-md bg-white dark:bg-dark p-6 rounded-xl shadow-md">
                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input id="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Enter your email" />
                    </div>
                    <div>
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Enter your phone number" />
                    </div>
                    <div>
                      <Label htmlFor="fullName">Full Name</Label>
                      <Input id="fullName" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Enter your full name" />
                    </div>
                    <Button type="submit" variant="gold" className="w-full">{isSaving ? "Saving..." : "Save Changes"}</Button>
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
