import { Layout } from "@/components/layout/Layout";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Calendar,
  ExternalLink,
  Package,
  MessageSquare,
  User,
  LogOut,
  Settings,
  ShoppingBag,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { format } from "date-fns";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

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
  carrier: string | null;
  tracking_number: string | null;
  tracking_url: string | null;
  order_items: { quantity: number; price: number; book: { title: string } | null }[];
}

interface Consultation {
  id: string;
  date: string;
  topic: string | null;
  message?: string | null;
  status: string;
  created_at: string;
}

interface Profile {
  full_name: string | null;
  avatar_url: string | null;
  membership_tier: string;
}

interface MembershipStatus {
  status: string;
  cancelAtPeriodEnd: boolean;
  currentPeriodEnd: string | null;
  cancelAt: string | null;
}

const PENDING_ORDER_EXPIRY_MS = 60 * 60 * 1000;

const buildAustraliaPostTrackingUrl = (trackingNumber: string) =>
  `https://auspost.com.au/mypost/track/search?trackingNumber=${encodeURIComponent(trackingNumber)}`;

const isExpiredPendingOrder = (order: { status: string; created_at: string }) =>
  order.status === "pending" &&
  new Date(order.created_at).getTime() < Date.now() - PENDING_ORDER_EXPIRY_MS;

const getPendingOrderExpiry = (createdAt: string) =>
  new Date(new Date(createdAt).getTime() + PENDING_ORDER_EXPIRY_MS);

const DashboardPage = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user, isLoading, signOut } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [eventBookings, setEventBookings] = useState<EventBooking[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [membershipStatus, setMembershipStatus] = useState<MembershipStatus | null>(null);
  const [retryingOrderId, setRetryingOrderId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const validTabs = ["bookings", "orders", "consultations", "profile"] as const;
  const requestedTab = searchParams.get("tab");
  const activeTab = validTabs.includes((requestedTab as (typeof validTabs)[number]) ?? "bookings")
    ? (requestedTab as (typeof validTabs)[number])
    : "bookings";

  useEffect(() => {
    if (!user) return;

    setEmail(user.email ?? "");
    setFullName(
      user.user_metadata?.full_name ??
      user.user_metadata?.name ??
      ""
    );

    const loadProfile = async () => {
      const expiryCutoff = new Date(Date.now() - PENDING_ORDER_EXPIRY_MS).toISOString();
      const { error: expireOrdersError } = await supabase
        .from("orders")
        .update({ status: "cancelled" })
        .eq("user_id", user.id)
        .eq("status", "pending")
        .lt("created_at", expiryCutoff);

      if (expireOrdersError) {
        console.error("Error expiring pending orders:", expireOrdersError);
      }

      const [
        profileResult,
        bookingsResult,
        ordersResult,
        consultationsResult,
      ] = await Promise.all([
        supabase
          .from("profiles")
          .select("full_name, avatar_url, membership_tier")
          .eq("id", user.id)
          .maybeSingle(),
        supabase
          .from("event_bookings")
          .select("id, seats, status, total_amount, created_at, event:events(title, date, venue)")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false }),
        supabase
          .from("orders")
          .select("id, status, total_amount, created_at, carrier, tracking_number, tracking_url, order_items(quantity, price, book:books(title))")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false }),
        supabase
          .from("consultations")
          .select("id, date, topic, message, status, created_at")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false }),
      ]);

      if (profileResult.error) {
        console.error("Error loading profile:", profileResult.error);
      }

      if (bookingsResult.error) {
        console.error("Error loading bookings:", bookingsResult.error);
      } else {
        setEventBookings((bookingsResult.data ?? []) as EventBooking[]);
      }

      if (ordersResult.error) {
        console.error("Error loading orders:", ordersResult.error);
      } else {
        setOrders(
          ((ordersResult.data ?? []) as unknown as Order[]).map((order) =>
            isExpiredPendingOrder(order) ? { ...order, status: "cancelled" } : order,
          ),
        );
      }

      if (consultationsResult.error) {
        console.error("Error loading consultations:", consultationsResult.error);
      } else {
        setConsultations((consultationsResult.data ?? []) as Consultation[]);
      }

      const data = profileResult.data;
      if (data) {
        setProfile(data);
        setFullName(
          data.full_name ??
          user.user_metadata?.full_name ??
          user.user_metadata?.name ??
          ""
        );
      } else {
        setProfile({
          full_name:
            user.user_metadata?.full_name ??
            user.user_metadata?.name ??
            null,
          avatar_url: null,
          membership_tier: "free",
        });
      }

      const resolvedTier = data?.membership_tier === "premium" ? "premium" : "free";
      if (resolvedTier === "premium") {
        const { data: membershipData, error: membershipError } = await supabase.functions.invoke("get-membership-status");

        if (membershipError) {
          console.error("Error loading membership status:", membershipError);
          setMembershipStatus(null);
        } else {
          setMembershipStatus((membershipData?.membership ?? null) as MembershipStatus | null);
        }
      } else {
        setMembershipStatus(null);
      }
    };

    void loadProfile();
  }, [user]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    if (!user) {
      setIsSaving(false);
      return;
    }

    const { error } = await supabase
      .from("profiles")
      .upsert({
        id: user.id,
        full_name: fullName.trim() || null,
      });

    if (error) {
      toast.error("Failed to update profile");
      setIsSaving(false);
      return;
    }

    setProfile((prev) => ({
      full_name: fullName.trim() || null,
      avatar_url: prev?.avatar_url ?? null,
    }));
    toast.success("Profile updated successfully");
    setIsSaving(false);
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

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

  const membershipDateLabel = membershipStatus?.cancelAtPeriodEnd
    ? "Membership ends on"
    : "Next renewal on";
  const membershipDateValue = membershipStatus?.cancelAt ?? membershipStatus?.currentPeriodEnd;

  const handleResumeOrderPayment = async (orderId: string) => {
    setRetryingOrderId(orderId);

    try {
      const successUrl = `${window.location.origin}/checkout?success=1&session_id={CHECKOUT_SESSION_ID}&order_id=${orderId}`;
      const cancelUrl = `${window.location.origin}/checkout?canceled=1&order_id=${orderId}`;

      const { data, error } = await supabase.functions.invoke("create-book-checkout", {
        body: {
          orderId,
          successUrl,
          cancelUrl,
        },
      });

      if (error || !data?.url) {
        throw error ?? new Error("Failed to reopen Stripe checkout");
      }

      window.location.href = data.url;
    } catch (error) {
      console.error("Error resuming order payment:", error);
      const message = error instanceof Error ? error.message : "Failed to reopen payment checkout.";
      toast.error(message);
      setRetryingOrderId(null);
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <section className="pt-32 pb-16 min-h-screen bg-background">
          <div className="container-wide text-center">
            <h1 className="text-3xl font-heading font-bold">Loading dashboard...</h1>
          </div>
        </section>
      </Layout>
    );
  }

  if (!user) {
    return (
      <Layout>
        <section className="pt-32 pb-16 min-h-screen bg-background">
          <div className="container-wide max-w-lg text-center">
            <h1 className="mb-4 text-3xl font-heading font-bold">Sign In Required</h1>
            <p className="mb-8 text-muted-foreground">
              Please sign in to access your dashboard.
            </p>
            <Button variant="gold" onClick={() => navigate("/auth")}>
              Go to Sign In
            </Button>
          </div>
        </section>
      </Layout>
    );
  }

  return (
    <Layout>
      {/* Hero */}
      <section className="pt-24 md:pt-28 pb-8 bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 text-cream rounded-b-3xl shadow-lg">
        <div className="container-wide">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col md:flex-row md:items-center justify-between gap-6"
          >
            <div>
              <span className="text-yellow-400 font-medium tracking-widest uppercase text-sm">
                Dashboard
              </span>
              <h1 className="text-4xl md:text-5xl font-heading font-bold mt-4">
                Hi,{" "}
                <span className="text-gradient-gold">
                  {profile?.full_name || user.user_metadata?.full_name || user.email?.split("@")[0] || "User"}
                </span>
              </h1>
              <p className="mt-2 text-sm text-white/60">{user.email}</p>
              <p className="mt-1 text-xs uppercase tracking-[0.2em] text-yellow-400/90">
                {profile?.membership_tier === "premium" ? "Premium Member" : "Free Member"}
              </p>
              {profile?.membership_tier === "premium" && membershipDateValue ? (
                <p className="mt-2 text-sm text-white/75">
                  {membershipDateLabel} {format(new Date(membershipDateValue), "PPP")}
                </p>
              ) : null}
            </div>
            <Button
              variant="goldOutline"
              className="flex items-center gap-2"
              onClick={handleSignOut}
            >
              <LogOut size={18} /> Sign Out
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Tabs Section (✅ dark background so no white overlaps under navbar) */}
      <section className="section-padding bg-gray-950 text-white">
        <div className="container-wide">
          <Tabs
            value={activeTab}
            onValueChange={(value) => {
              const nextParams = new URLSearchParams(searchParams);
              nextParams.set("tab", value);
              setSearchParams(nextParams, { replace: true });
            }}
            className="space-y-8"
          >
            <TabsList className="grid grid-cols-4 w-full max-w-xl bg-white/5 border border-white/10 rounded-full p-1">
              <TabsTrigger
                value="bookings"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-yellow-400 data-[state=active]:to-yellow-500 data-[state=active]:text-black rounded-full"
              >
                <Calendar className="w-4 h-4 mr-2" /> Events
              </TabsTrigger>
              <TabsTrigger
                value="orders"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-yellow-400 data-[state=active]:to-yellow-500 data-[state=active]:text-black rounded-full"
              >
                <ShoppingBag className="w-4 h-4 mr-2" /> Orders
              </TabsTrigger>
              <TabsTrigger
                value="consultations"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-yellow-400 data-[state=active]:to-yellow-500 data-[state=active]:text-black rounded-full"
              >
                <MessageSquare className="w-4 h-4 mr-2" /> Consultations
              </TabsTrigger>
              <TabsTrigger
                value="profile"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-yellow-400 data-[state=active]:to-yellow-500 data-[state=active]:text-black rounded-full"
              >
                <User className="w-4 h-4 mr-2" /> Profile
              </TabsTrigger>
            </TabsList>

            {/* Event Bookings */}
            <TabsContent value="bookings">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {eventBookings.length > 0 ? (
                  eventBookings.map((booking) => (
                    <Card
                      key={booking.id}
                      className="bg-white/5 border border-white/10 backdrop-blur-md rounded-xl shadow-md hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300"
                    >
                      <CardContent className="p-6">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                          <div>
                            <h3 className="font-heading font-bold text-lg text-white">
                              {booking.event?.title || "Event"}
                            </h3>
                            <p className="text-sm text-white/70 mt-1">
                              {booking.event?.date &&
                                format(new Date(booking.event.date), "PPP")}{" "}
                              • {booking.event?.venue}
                            </p>
                            <p className="text-sm text-white/70 mt-1">
                              {booking.seats} seat(s) • ${booking.total_amount}
                            </p>
                          </div>
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                              booking.status
                            )} transition-all`}
                          >
                            {booking.status.charAt(0).toUpperCase() +
                              booking.status.slice(1)}
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <Card className="p-8 text-center bg-white/5 border border-white/10 rounded-xl shadow-md">
                    <Calendar className="w-12 h-12 text-white/60 mx-auto mb-4" />
                    <p className="text-white/70">No event bookings yet.</p>
                    <Button
                      variant="gold"
                      className="mt-4"
                      onClick={() => navigate("/events")}
                    >
                      Browse Events
                    </Button>
                  </Card>
                )}
              </div>
            </TabsContent>

            {/* Orders */}
            <TabsContent value="orders">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {orders.length > 0 ? (
                  orders.map((order) => (
                    <Card
                      key={order.id}
                      className="bg-white/5 border border-white/10 backdrop-blur-md rounded-xl shadow-md hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300"
                    >
                      <CardContent className="p-6">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                          <div>
                            <h3 className="font-heading font-bold text-lg text-white">
                              Order #{order.id.slice(0, 8).toUpperCase()}
                            </h3>
                            <p className="text-sm text-white/70">
                              {format(new Date(order.created_at), "PPP")}
                            </p>
                            <p className="text-sm text-white/70 mt-1">
                              {order.order_items
                                .map((item) => item.book?.title)
                                .join(", ")}
                            </p>
                            <p className="text-sm font-medium mt-1 text-white">
                              ${order.total_amount}
                            </p>
                            {order.tracking_number ? (
                              <div className="mt-3 space-y-1">
                                <p className="text-xs text-white/60">
                                  {order.carrier || "Australia Post"} Tracking: {order.tracking_number}
                                </p>
                                <Button
                                  variant="goldOutline"
                                  size="sm"
                                  asChild
                                  className="h-8 px-3"
                                >
                                  <a
                                    href={order.tracking_url || buildAustraliaPostTrackingUrl(order.tracking_number)}
                                    target="_blank"
                                    rel="noreferrer"
                                  >
                                    Track Order
                                  </a>
                                </Button>
                              </div>
                            ) : null}
                            {order.status === "pending" ? (
                              <div className="mt-3 space-y-2">
                                <p className="text-xs text-white/60">
                                  Pending until {format(getPendingOrderExpiry(order.created_at), "PPP p")}. Complete payment before then or this order will be cancelled automatically.
                                </p>
                                <Button
                                  variant="goldOutline"
                                  size="sm"
                                  className="h-8 px-3"
                                  disabled={retryingOrderId === order.id}
                                  onClick={() => void handleResumeOrderPayment(order.id)}
                                >
                                  <ExternalLink className="mr-2 h-4 w-4" />
                                  {retryingOrderId === order.id ? "Opening Checkout..." : "Complete Payment"}
                                </Button>
                              </div>
                            ) : null}
                          </div>
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                              order.status
                            )} transition-all`}
                          >
                            {order.status.charAt(0).toUpperCase() +
                              order.status.slice(1)}
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <Card className="p-8 text-center bg-white/5 border border-white/10 rounded-xl shadow-md">
                    <Package className="w-12 h-12 text-white/60 mx-auto mb-4" />
                    <p className="text-white/70">No orders yet.</p>
                    <Button
                      variant="gold"
                      className="mt-4"
                      onClick={() => navigate("/books")}
                    >
                      Browse Books
                    </Button>
                  </Card>
                )}
              </div>
            </TabsContent>

            {/* Consultations */}
            <TabsContent value="consultations">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {consultations.length > 0 ? (
                  consultations.map((consultation) => (
                    <Card
                      key={consultation.id}
                      className="bg-white/5 border border-white/10 backdrop-blur-md rounded-xl shadow-md hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300"
                    >
                      <CardContent className="p-6">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                          <div>
                            <h3 className="font-heading font-bold text-lg text-white">
                              {consultation.topic || "Consultation"}
                            </h3>
                            <p className="text-sm text-white/70">
                              Requested on{" "}
                              {format(
                                new Date(consultation.created_at),
                                "PPP",
                              )}
                            </p>
                          </div>
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                              consultation.status
                            )} transition-all`}
                          >
                            {consultation.status.charAt(0).toUpperCase() +
                              consultation.status.slice(1)}
                          </span>
                        </div>
                        <div className="mt-4 space-y-2 text-sm text-white/80">
                          <p>
                            <span className="font-medium text-white">Consultation time:</span>{" "}
                            {consultation.status === "confirmed" || consultation.status === "completed"
                              ? format(new Date(consultation.date), "PPP 'at' p")
                              : "Awaiting confirmation from Mind Architecture"}
                          </p>
                          <p>
                            <span className="font-medium text-white">Current update:</span>{" "}
                            {consultation.status === "pending"
                              ? "Your request has been received and is waiting for confirmation."
                              : consultation.status === "confirmed"
                                ? "Your consultation has been approved."
                                : consultation.status === "completed"
                                  ? "Your consultation has been completed."
                                  : consultation.status === "cancelled"
                                    ? "This consultation request was cancelled."
                                    : `Status: ${consultation.status}`}
                          </p>
                          {consultation.message ? (
                            <p className="text-white/70">
                              <span className="font-medium text-white">Notes:</span>{" "}
                              {consultation.message}
                            </p>
                          ) : null}
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <Card className="p-8 text-center bg-white/5 border border-white/10 rounded-xl shadow-md">
                    <MessageSquare className="w-12 h-12 text-white/60 mx-auto mb-4" />
                    <p className="text-white/70">No consultations booked yet.</p>
                    <Button
                      variant="gold"
                      className="mt-4"
                      onClick={() => navigate("/consultation")}
                    >
                      Book Consultation
                    </Button>
                  </Card>
                )}
              </div>
            </TabsContent>

            {/* Profile */}
            <TabsContent value="profile">
              <Card className="bg-white/5 border border-white/10 backdrop-blur-md rounded-xl shadow-md text-white">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings size={20} /> Profile Settings
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <form
                    onSubmit={handleUpdateProfile}
                    className="space-y-6 max-w-md bg-white/5 border border-white/10 p-6 rounded-xl shadow-md"
                  >
                    <div>
                      <Label htmlFor="email" className="text-white/80">
                        Email
                      </Label>
                      <Input
                        id="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Enter your email"
                        className="bg-black/40 border-white/10 text-white placeholder:text-white/40"
                      />
                    </div>
                    <div>
                      <Label htmlFor="phone" className="text-white/80">
                        Phone Number
                      </Label>
                      <Input
                        id="phone"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="Enter your phone number"
                        className="bg-black/40 border-white/10 text-white placeholder:text-white/40"
                      />
                    </div>
                    <div>
                      <Label className="text-white/80">Membership Plan</Label>
                      <Input
                        value={profile?.membership_tier === "premium" ? "Premium" : "Free"}
                        readOnly
                        className="bg-black/40 border-white/10 text-white"
                      />
                    </div>
                    <div>
                      <Label className="text-white/80">
                        {profile?.membership_tier === "premium"
                          ? membershipDateLabel
                          : "Membership Status"}
                      </Label>
                      <Input
                        value={
                          profile?.membership_tier === "premium"
                            ? membershipDateValue
                              ? format(new Date(membershipDateValue), "PPP")
                              : "Premium active"
                            : "Free plan"
                        }
                        readOnly
                        className="bg-black/40 border-white/10 text-white"
                      />
                    </div>
                    <div>
                      <Label htmlFor="fullName" className="text-white/80">
                        Full Name
                      </Label>
                      <Input
                        id="fullName"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="Enter your full name"
                        className="bg-black/40 border-white/10 text-white placeholder:text-white/40"
                      />
                    </div>
                    <Button type="submit" variant="gold" className="w-full">
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
