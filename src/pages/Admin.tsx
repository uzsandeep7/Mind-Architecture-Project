import { Layout } from "@/components/layout/Layout";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Users,
  Calendar,
  BookOpen,
  ShoppingBag,
  FileText,
  Plus,
  Trash2,
  Eye,
  EyeOff,
  Mail,
  MessageSquare,
  Crown,
  DollarSign,
  BarChart3,
  PieChart,
  Activity,
  Loader2,
  Save,
  ChevronDown,
  ChevronUp,
  Star,
  Image,
} from "lucide-react";
import { Component, useEffect, useMemo, useState, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart as RechartsPie,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

type AppRole = Database["public"]["Enums"]["app_role"];
type EventRow = Database["public"]["Tables"]["events"]["Row"];
type BookRow = Database["public"]["Tables"]["books"]["Row"];
type BlogPostRow = Database["public"]["Tables"]["blog_posts"]["Row"];
type ContactMessageRow = Database["public"]["Tables"]["contact_messages"]["Row"];
type OrderRow = Database["public"]["Tables"]["orders"]["Row"];
type ProfileRow = Database["public"]["Tables"]["profiles"]["Row"];
type EventBookingRow = Database["public"]["Tables"]["event_bookings"]["Row"];
type ConsultationRow = Database["public"]["Tables"]["consultations"]["Row"];
type TestimonialRow = Database["public"]["Tables"]["testimonials"]["Row"];
type GalleryRow = Database["public"]["Tables"]["gallery"]["Row"];
type ConsultationServiceRow = Database["public"]["Tables"]["consultation_services"]["Row"];
type ConsultationDateBlockRow = Database["public"]["Tables"]["consultation_date_blocks"]["Row"];
type ConsultationTimeBlockRow = Database["public"]["Tables"]["consultation_time_blocks"]["Row"];

type OrderItemWithBook = {
  quantity: number;
  price: number;
  book: { title: string } | null;
};

type ManagedUser = {
  id: string;
  full_name: string | null;
  created_at: string | null;
  role: AppRole | null;
  membership_tier: string;
};

const rolePriority: Record<AppRole, number> = {
  owner: 4,
  admin: 3,
  moderator: 2,
  user: 1,
};

const defaultBookCategories = [
  "Personal Development",
  "Self-Help",
  "Leadership",
  "Mental Health",
  "Productivity",
  "Mindset",
  "Business",
  "Wellness",
];

const defaultEventCategories = [
  "Masterclass",
  "Workshop",
  "Retreat",
  "Summit",
  "Webinar",
  "Training",
  "Corporate",
  "Community",
];

const toLocalDateTimeInput = (value: string | null) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const offset = date.getTimezoneOffset();
  return new Date(date.getTime() - offset * 60000).toISOString().slice(0, 16);
};

const formatDate = (value: string | null | undefined) => {
  if (!value) return "Not set";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "Not set" : date.toLocaleDateString();
};

const formatDateTime = (value: string | null | undefined) => {
  if (!value) return "Not set";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "Not set" : date.toLocaleString();
};

type AdminSectionErrorBoundaryProps = {
  children: ReactNode;
  fallback: ReactNode;
};

type AdminSectionErrorBoundaryState = {
  hasError: boolean;
};

class AdminSectionErrorBoundary extends Component<
  AdminSectionErrorBoundaryProps,
  AdminSectionErrorBoundaryState
> {
  state: AdminSectionErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: unknown) {
    console.error("Admin section render failed:", error);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }

    return this.props.children;
  }
}

const slugify = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");

const getErrorMessage = (error: unknown) => {
  if (error instanceof Error) return error.message;
  if (error && typeof error === "object") {
    const message = "message" in error ? error.message : null;
    const details = "details" in error ? error.details : null;
    const hint = "hint" in error ? error.hint : null;

    return [message, details, hint]
      .filter((value): value is string => typeof value === "string" && value.trim().length > 0)
      .join(" | ");
  }

  return "";
};

const buildAustraliaPostTrackingUrl = (trackingNumber: string) =>
  `https://auspost.com.au/mypost/track/search?trackingNumber=${encodeURIComponent(trackingNumber)}`;

const buildReplyMailtoLink = (email: string, subject?: string) => {
  const replySubject = subject?.trim() ? `Re: ${subject.trim()}` : "Re: Website enquiry";
  const body = "Hi,\n\nThank you for reaching out to MIND Architecture.\n\n";

  return `mailto:${encodeURIComponent(email)}?subject=${encodeURIComponent(replySubject)}&body=${encodeURIComponent(body)}`;
};

const PENDING_ORDER_EXPIRY_MS = 60 * 60 * 1000;

const isExpiredPendingOrder = (order: { status: string; created_at: string }) =>
  order.status === "pending" &&
  new Date(order.created_at).getTime() < Date.now() - PENDING_ORDER_EXPIRY_MS;

const getPendingOrderExpiry = (createdAt: string) =>
  new Date(new Date(createdAt).getTime() + PENDING_ORDER_EXPIRY_MS);

const getAdminOrderGroup = (status: string) => {
  if (status === "pending") return "Pending Payment";
  if (status === "cancelled") return "Cancelled";
  if (status === "delivered" || status === "completed") return "Delivered / Completed";
  return "In Progress";
};

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { user, isLoading, isAdmin, role, signOut } = useAuth();
  const [isRefreshing, setIsRefreshing] = useState(true);
  const [events, setEvents] = useState<any[]>([]);
  const [books, setBooks] = useState<any[]>([]);
  const [blogPosts, setBlogPosts] = useState<any[]>([]);
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [eventBookings, setEventBookings] = useState<EventBookingRow[]>([]);
  const [orderItems, setOrderItems] = useState<OrderItemWithBook[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [testimonials, setTestimonials] = useState<TestimonialRow[]>([]);
  const [galleryItems, setGalleryItems] = useState<GalleryRow[]>([]);
  const [messageFilter, setMessageFilter] = useState<"unread" | "all">("unread");
  const [managedUsers, setManagedUsers] = useState<ManagedUser[]>([]);
  const [consultations, setConsultations] = useState<ConsultationRow[]>([]);
  const [consultationServices, setConsultationServices] = useState<ConsultationServiceRow[]>([]);
  const [consultationDateBlocks, setConsultationDateBlocks] = useState<ConsultationDateBlockRow[]>([]);
  const [consultationTimeBlocks, setConsultationTimeBlocks] = useState<ConsultationTimeBlockRow[]>([]);
  const [consultationDrafts, setConsultationDrafts] = useState<Record<string, { date: string; status: string }>>({});
  const [trackingDrafts, setTrackingDrafts] = useState<Record<string, { trackingNumber: string; carrier: string }>>({});
  const [editingEventId, setEditingEventId] = useState<string | null>(null);
  const [editingBookId, setEditingBookId] = useState<string | null>(null);
  const [editingPostId, setEditingPostId] = useState<string | null>(null);
  const [isEventDialogOpen, setIsEventDialogOpen] = useState(false);
  const [isBookDialogOpen, setIsBookDialogOpen] = useState(false);
  const [isPostDialogOpen, setIsPostDialogOpen] = useState(false);
  const [isTestimonialDialogOpen, setIsTestimonialDialogOpen] = useState(false);
  const [isGalleryDialogOpen, setIsGalleryDialogOpen] = useState(false);
  const [isSavingEvent, setIsSavingEvent] = useState(false);
  const [isSavingBook, setIsSavingBook] = useState(false);
  const [isSavingPost, setIsSavingPost] = useState(false);
  const [isSavingTestimonial, setIsSavingTestimonial] = useState(false);
  const [isSavingGalleryItem, setIsSavingGalleryItem] = useState(false);
  const [uploadingField, setUploadingField] = useState<string | null>(null);
  const [roleUpdatingId, setRoleUpdatingId] = useState<string | null>(null);
  const [membershipUpdatingId, setMembershipUpdatingId] = useState<string | null>(null);
  const [selectedOrderGroup, setSelectedOrderGroup] = useState("Pending Payment");
  const [expandedEventBookingsId, setExpandedEventBookingsId] = useState<string | null>(null);
  const [editingTestimonialId, setEditingTestimonialId] = useState<string | null>(null);
  const [editingGalleryItemId, setEditingGalleryItemId] = useState<string | null>(null);
  const [newConsultationService, setNewConsultationService] = useState({
    slug: "",
    title: "",
    description: "",
    duration_minutes: "30",
    price: "0",
    display_order: "0",
    is_published: true,
  });
  const [newConsultationTimeBlock, setNewConsultationTimeBlock] = useState({
    label: "",
    time_value: "",
    display_order: "0",
    is_published: true,
  });
  const [newConsultationDateBlock, setNewConsultationDateBlock] = useState({
    label: "",
    date_value: "",
    display_order: "0",
    is_published: true,
  });
  const [newEvent, setNewEvent] = useState({
    title: "",
    description: "",
    category: "",
    date: "",
    venue: "",
    price: "",
    member_price: "",
    total_seats: "",
    available_seats: "",
    image_url: "",
    is_members_only: false,
    is_published: true,
  });
  const [newBook, setNewBook] = useState({
    title: "",
    description: "",
    author: "",
    price: "",
    member_price: "",
    category: "",
    stock: "",
    cover_image_url: "",
    is_members_only: false,
    is_published: true,
  });
  const [newPost, setNewPost] = useState({
    title: "",
    slug: "",
    excerpt: "",
    content: "",
    tags: "",
    cover_image_url: "",
    read_time_minutes: "5",
    is_members_only: false,
    is_published: false,
  });
  const [newTestimonial, setNewTestimonial] = useState({
    name: "",
    role: "",
    company: "",
    content: "",
    rating: "5",
    image_url: "",
    display_order: "0",
    is_published: true,
  });
  const [newGalleryItem, setNewGalleryItem] = useState({
    title: "",
    category: "",
    image_url: "",
    display_order: "0",
    is_published: true,
  });

  useEffect(() => {
    if (!isLoading && user && isAdmin) {
      void loadAdminData();
    }
  }, [isLoading, user, isAdmin]);

  const loadAdminData = async () => {
    setIsRefreshing(true);
    try {
      const expiryCutoff = new Date(Date.now() - PENDING_ORDER_EXPIRY_MS).toISOString();
      const { error: expireOrdersError } = await supabase
        .from("orders")
        .update({ status: "cancelled" })
        .eq("status", "pending")
        .lt("created_at", expiryCutoff);

      if (expireOrdersError) {
        console.error("Failed to expire pending admin orders:", expireOrdersError);
      }

      const [
        eventsResult,
        booksResult,
        blogPostsResult,
        blogCommentsResult,
        ordersResult,
        eventBookingsResult,
        orderItemsResult,
        messagesResult,
        testimonialsResult,
        galleryResult,
        consultationsResult,
        consultationServicesResult,
        consultationDateBlocksResult,
        consultationTimeBlocksResult,
        profilesResult,
        rolesResult,
      ] = await Promise.all([
        supabase.from("events").select("*").order("date", { ascending: false }),
        supabase.from("books").select("*").order("created_at", { ascending: false }),
        supabase.from("blog_posts").select("*").order("updated_at", { ascending: false }),
        supabase.from("blog_comments").select("post_id"),
        supabase.from("orders").select("*").order("created_at", { ascending: false }),
        supabase.from("event_bookings").select("*").order("created_at", { ascending: false }),
        supabase.from("order_items").select("quantity, price, book:books(title)"),
        supabase.from("contact_messages").select("*").order("created_at", { ascending: false }),
        supabase.from("testimonials").select("*").order("display_order", { ascending: true }).order("created_at", { ascending: false }),
        supabase.from("gallery").select("*").order("display_order", { ascending: true }).order("created_at", { ascending: false }),
        supabase.from("consultations").select("*").order("created_at", { ascending: false }),
        supabase.from("consultation_services").select("*").order("display_order", { ascending: true }),
        supabase.from("consultation_date_blocks").select("*").order("display_order", { ascending: true }).order("date_value", { ascending: true }),
        supabase.from("consultation_time_blocks").select("*").order("display_order", { ascending: true }),
        supabase.from("profiles").select("*").order("created_at", { ascending: false }),
        supabase.from("user_roles").select("*"),
      ]);

      for (const result of [
        eventsResult,
        booksResult,
        blogPostsResult,
        ordersResult,
        messagesResult,
        galleryResult,
        consultationsResult,
        profilesResult,
        rolesResult,
      ]) {
        if (result.error) throw result.error;
      }

      if (blogCommentsResult.error) {
        console.warn("Failed to load blog comments for admin analytics:", blogCommentsResult.error);
      }

      if (eventBookingsResult.error) {
        console.warn("Failed to load event bookings for admin analytics:", eventBookingsResult.error);
      }

      if (orderItemsResult.error) {
        console.warn("Failed to load order items for admin analytics:", orderItemsResult.error);
      }

      if (testimonialsResult.error) {
        console.warn("Failed to load testimonials. Apply the testimonials migration in Supabase.", testimonialsResult.error);
      }

      if (galleryResult.error) {
        console.warn("Failed to load gallery items for admin.", galleryResult.error);
      }

      if (consultationServicesResult.error) {
        console.warn("Failed to load consultation services. Apply the consultation setup migration in Supabase.", consultationServicesResult.error);
      }

      if (consultationDateBlocksResult.error) {
        console.warn("Failed to load consultation date blocks. Apply the consultation date migration in Supabase.", consultationDateBlocksResult.error);
      }

      if (consultationTimeBlocksResult.error) {
        console.warn("Failed to load consultation time blocks. Apply the consultation setup migration in Supabase.", consultationTimeBlocksResult.error);
      }

      setEvents(
        (eventsResult.data ?? []).map((event) => ({
          ...event,
          isPublished: event.is_published,
          totalSeats: event.total_seats,
          bookedSeats: event.total_seats - event.available_seats,
        })),
      );
      setBooks(
        (booksResult.data ?? []).map((book) => ({
          ...book,
          isPublished: book.is_published,
          sold: 0,
        })),
      );
      const commentsByPost = new Map<string, number>();
      for (const comment of blogCommentsResult.data ?? []) {
        commentsByPost.set(comment.post_id, (commentsByPost.get(comment.post_id) ?? 0) + 1);
      }
      setBlogPosts(
        (blogPostsResult.data ?? []).map((post) => ({
          ...post,
          isPublished: post.is_published,
          comments: commentsByPost.get(post.id) ?? 0,
        })),
      );
      const loadedOrders = ordersResult.data ?? [];
      setOrders(
        loadedOrders.map((order) =>
          isExpiredPendingOrder(order) ? { ...order, status: "cancelled" } : order,
        ),
      );
      setEventBookings(eventBookingsResult.data ?? []);
      setOrderItems((orderItemsResult.data ?? []) as unknown as OrderItemWithBook[]);
      setTrackingDrafts(
        Object.fromEntries(
          loadedOrders.map((order) => [
            order.id,
            {
              trackingNumber: order.tracking_number ?? "",
              carrier: order.carrier ?? "Australia Post",
            },
          ]),
        ),
      );
      setMessages(
        (messagesResult.data ?? []).map((message) => ({
          ...message,
          isRead: message.is_read,
          date: formatDate(message.created_at),
        })),
      );
      setTestimonials(testimonialsResult.error ? [] : testimonialsResult.data ?? []);
      setGalleryItems(galleryResult.error ? [] : galleryResult.data ?? []);
      setConsultations(consultationsResult.data ?? []);
      setConsultationServices(consultationServicesResult.error ? [] : consultationServicesResult.data ?? []);
      setConsultationDateBlocks(consultationDateBlocksResult.error ? [] : consultationDateBlocksResult.data ?? []);
      setConsultationTimeBlocks(consultationTimeBlocksResult.error ? [] : consultationTimeBlocksResult.data ?? []);
      setConsultationDrafts(
        Object.fromEntries(
          (consultationsResult.data ?? []).map((consultation) => [
            consultation.id,
            {
              date: toLocalDateTimeInput(consultation.date),
              status: consultation.status,
            },
          ]),
        ),
      );

      const profiles = profilesResult.data ?? [];
      const roles = rolesResult.data ?? [];
      const profileMap = new Map<string, ProfileRow>(profiles.map((profile) => [profile.id, profile]));
      const allUserIds = new Set<string>([
        ...profiles.map((profile) => profile.id),
        ...roles.map((entry) => entry.user_id),
      ]);

      const usersList = Array.from(allUserIds).map((id) => {
        const userRoles = roles
          .filter((entry) => entry.user_id === id)
          .map((entry) => entry.role)
          .sort((a, b) => rolePriority[b] - rolePriority[a]);

        return {
          id,
          full_name: profileMap.get(id)?.full_name ?? null,
          created_at: profileMap.get(id)?.created_at ?? null,
          role: userRoles[0] ?? null,
          membership_tier: profileMap.get(id)?.membership_tier ?? "free",
        };
      });

      setManagedUsers(
        usersList.sort((a, b) => {
          const roleDelta = (rolePriority[b.role ?? "user"] ?? 0) - (rolePriority[a.role ?? "user"] ?? 0);
          if (roleDelta !== 0) return roleDelta;
          return (a.full_name ?? a.id).localeCompare(b.full_name ?? b.id);
        }),
      );
    } catch (error) {
      console.error("Failed to load admin data:", error);
      toast.error("Failed to load admin data");
    } finally {
      setIsRefreshing(false);
    }
  };

  const salesData = useMemo(() => {
    const months = Array.from({ length: 6 }, (_, index) => {
      const date = new Date();
      date.setMonth(date.getMonth() - (5 - index), 1);
      date.setHours(0, 0, 0, 0);
      return {
        key: `${date.getFullYear()}-${date.getMonth()}`,
        month: date.toLocaleDateString(undefined, { month: "short" }),
        bookings: 0,
        sales: 0,
      };
    });

    const monthMap = new Map(months.map((entry) => [entry.key, entry]));

    for (const order of orders) {
      const date = new Date(order.created_at);
      const key = `${date.getFullYear()}-${date.getMonth()}`;
      const month = monthMap.get(key);
      if (!month) continue;
      month.sales += Number(order.total_amount) || 0;
    }

    for (const booking of eventBookings) {
      const date = new Date(booking.created_at);
      const key = `${date.getFullYear()}-${date.getMonth()}`;
      const month = monthMap.get(key);
      if (!month) continue;
      month.bookings += 1;
    }

    return months;
  }, [eventBookings, orders]);

  const membershipData = useMemo(
    () => [
      {
        name: "Free",
        value: managedUsers.filter((managedUser) => managedUser.membership_tier !== "premium").length,
        color: "#6B7280",
      },
      {
        name: "Premium",
        value: managedUsers.filter((managedUser) => managedUser.membership_tier === "premium").length,
        color: "#EAB308",
      },
    ].filter((entry) => entry.value > 0),
    [managedUsers],
  );

  const eventBookingsData = useMemo(
    () =>
      events
        .map((event) => ({
          event: event.title,
          booked: Number(event.bookedSeats) || 0,
          capacity: Number(event.totalSeats) || 0,
        }))
        .sort((a, b) => b.booked - a.booked)
        .slice(0, 5),
    [events],
  );

  const bookSalesData = useMemo(() => {
    const salesMap = new Map<string, { name: string; sales: number; revenue: number }>();

    for (const item of orderItems) {
      const name = item.book?.title ?? "Untitled Book";
      const existing = salesMap.get(name) ?? { name, sales: 0, revenue: 0 };
      existing.sales += Number(item.quantity) || 0;
      existing.revenue += (Number(item.quantity) || 0) * (Number(item.price) || 0);
      salesMap.set(name, existing);
    }

    return Array.from(salesMap.values())
      .sort((a, b) => b.sales - a.sales)
      .slice(0, 5);
  }, [orderItems]);

  const stats = useMemo(
    () => [
      {
        label: "Total Users",
        value: managedUsers.length.toLocaleString(),
        icon: Users,
        detail: `${managedUsers.filter((managedUser) => managedUser.role === "admin" || managedUser.role === "owner").length} admin accounts`,
      },
      {
        label: "Premium Members",
        value: managedUsers
          .filter((managedUser) => managedUser.membership_tier === "premium")
          .length
          .toLocaleString(),
        icon: Crown,
        detail: `${managedUsers.filter((managedUser) => managedUser.membership_tier !== "premium").length} free members`,
        highlight: true,
      },
      {
        label: "Total Programs",
        value: events.length.toLocaleString(),
        icon: Calendar,
        detail: `${events.filter((event) => event.is_published).length} published`,
      },
      {
        label: "Books Sold",
        value: orderItems
          .reduce((total, item) => total + (Number(item.quantity) || 0), 0)
          .toLocaleString(),
        icon: BookOpen,
        detail: `${books.length} books listed`,
      },
      {
        label: "Revenue",
        value: `$${orders.reduce((total, order) => total + (Number(order.total_amount) || 0), 0).toLocaleString()}`,
        icon: DollarSign,
        detail: `${orders.length} total orders`,
      },
      {
        label: "Unread Messages",
        value: messages.filter((message) => !message.isRead).length.toLocaleString(),
        icon: Mail,
        detail: `${messages.length} total messages`,
      },
    ],
    [books.length, managedUsers, messages, orderItems, orders, events],
  );

  const unreadMessagesCount = messages.filter((message) => !message.isRead).length;
  const visibleMessages =
    messageFilter === "unread"
      ? messages.filter((message) => !message.isRead)
      : messages;
  const managedUsersMap = useMemo(
    () => new Map(managedUsers.map((managedUser) => [managedUser.id, managedUser])),
    [managedUsers],
  );
  const eventBookingsByEvent = useMemo(() => {
    const bookingsMap = new Map<string, EventBookingRow[]>();

    for (const booking of eventBookings) {
      const current = bookingsMap.get(booking.event_id) ?? [];
      current.push(booking);
      bookingsMap.set(booking.event_id, current);
    }

    return bookingsMap;
  }, [eventBookings]);

  const resetEventForm = () => {
    setEditingEventId(null);
    setIsEventDialogOpen(false);
    setNewEvent({
      title: "",
      description: "",
      category: "",
      date: "",
      venue: "",
      price: "",
      member_price: "",
      total_seats: "",
      available_seats: "",
      image_url: "",
      is_members_only: false,
      is_published: true,
    });
  };

  const resetBookForm = () => {
    setEditingBookId(null);
    setIsBookDialogOpen(false);
    setNewBook({
      title: "",
      description: "",
      author: "",
      price: "",
      member_price: "",
      category: "",
      stock: "",
      cover_image_url: "",
      is_members_only: false,
      is_published: true,
    });
  };

  const resetPostForm = () => {
    setEditingPostId(null);
    setIsPostDialogOpen(false);
    setNewPost({
      title: "",
      slug: "",
      excerpt: "",
      content: "",
      tags: "",
      cover_image_url: "",
      read_time_minutes: "5",
      is_members_only: false,
      is_published: false,
    });
  };

  const resetTestimonialForm = () => {
    setEditingTestimonialId(null);
    setIsTestimonialDialogOpen(false);
    setNewTestimonial({
      name: "",
      role: "",
      company: "",
      content: "",
      rating: "5",
      image_url: "",
      display_order: "0",
      is_published: true,
    });
  };

  const resetGalleryItemForm = () => {
    setEditingGalleryItemId(null);
    setIsGalleryDialogOpen(false);
    setNewGalleryItem({
      title: "",
      category: "",
      image_url: "",
      display_order: "0",
      is_published: true,
    });
  };

  const adminAssetBucket = "admin-assets";

  const sanitizeFileName = (fileName: string) =>
    fileName.replace(/[^a-zA-Z0-9.-]/g, "-").replace(/-+/g, "-");

  const handleImageUpload = async (
    fieldKey: string,
    file: File | null,
    applyValue: (value: string) => void,
  ) => {
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please choose an image file");
      return;
    }

    const maxSizeMb = 4;
    if (file.size > maxSizeMb * 1024 * 1024) {
      toast.error(`Please choose an image smaller than ${maxSizeMb}MB`);
      return;
    }

    setUploadingField(fieldKey);
    try {
      const extension = file.name.split(".").pop() || "jpg";
      const safeFileName = sanitizeFileName(file.name.replace(/\.[^.]+$/, ""));
      const filePath = `${fieldKey}/${Date.now()}-${safeFileName}.${extension}`;

      const { error: uploadError } = await supabase.storage
        .from(adminAssetBucket)
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: true,
        });

      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from(adminAssetBucket).getPublicUrl(filePath);
      applyValue(data.publicUrl);
      toast.success("Image uploaded successfully");
    } catch (error) {
      console.error("Image upload failed:", error);
      const message = getErrorMessage(error) || "Make sure the admin storage bucket is set up.";
      toast.error(`Failed to upload image: ${message}`);
    } finally {
      setUploadingField(null);
    }
  };

  const saveEvent = async () => {
    if (!newEvent.title.trim() || !newEvent.date || !newEvent.venue.trim()) {
      toast.error("Please complete the required event fields");
      return;
    }

    setIsSavingEvent(true);
    try {
      const totalSeats = Number(newEvent.total_seats) || 0;
      const availableSeats = Number(newEvent.available_seats) || totalSeats;
      const standardPrice = Number(newEvent.price) || 0;
      const memberPrice = newEvent.member_price === "" ? standardPrice : Number(newEvent.member_price) || 0;
      const payload = {
        title: newEvent.title.trim(),
        description: newEvent.description.trim() || null,
        category: newEvent.category.trim() || null,
        date: new Date(newEvent.date).toISOString(),
        venue: newEvent.venue.trim(),
        price: standardPrice,
        member_price: memberPrice,
        total_seats: totalSeats,
        available_seats: Math.min(availableSeats, totalSeats),
        image_url: newEvent.image_url.trim() || null,
        is_members_only: newEvent.is_members_only,
        is_published: newEvent.is_published,
      };

      const query = editingEventId
        ? supabase.from("events").update(payload).eq("id", editingEventId)
        : supabase.from("events").insert(payload);

      const { error } = await query;
      if (error) throw error;

      toast.success(editingEventId ? "Program updated" : "Program created");
      resetEventForm();
      await loadAdminData();
    } catch (error) {
      console.error("Failed to save event:", error);
      const message = getErrorMessage(error) || "Unknown error";
      toast.error(`Failed to save event: ${message}`);
    } finally {
      setIsSavingEvent(false);
    }
  };

  const saveBook = async () => {
    if (!newBook.title.trim() || !newBook.author.trim()) {
      toast.error("Please complete the required book fields");
      return;
    }

    setIsSavingBook(true);
    try {
      const standardPrice = Number(newBook.price) || 0;
      const memberPrice = newBook.member_price === "" ? standardPrice : Number(newBook.member_price) || 0;
      const payload = {
        title: newBook.title.trim(),
        description: newBook.description.trim() || null,
        author: newBook.author.trim(),
        price: standardPrice,
        member_price: memberPrice,
        category: newBook.category.trim() || null,
        stock: Number(newBook.stock) || 0,
        cover_image_url: newBook.cover_image_url.trim() || null,
        is_members_only: newBook.is_members_only,
        is_published: newBook.is_published,
      };

      const query = editingBookId
        ? supabase.from("books").update(payload).eq("id", editingBookId)
        : supabase.from("books").insert(payload);

      const { error } = await query;
      if (error) throw error;

      toast.success(editingBookId ? "Book updated" : "Book created");
      resetBookForm();
      await loadAdminData();
    } catch (error) {
      console.error("Failed to save book:", error);
      const message = getErrorMessage(error) || "Unknown error";
      toast.error(`Failed to save book: ${message}`);
    } finally {
      setIsSavingBook(false);
    }
  };

  const savePost = async () => {
    if (!newPost.title.trim() || !newPost.content.trim()) {
      toast.error("Please complete the required insight fields");
      return;
    }

    setIsSavingPost(true);
    try {
      const isPublishing = newPost.is_published;
      const payload = {
        title: newPost.title.trim(),
        slug: slugify(newPost.slug || newPost.title),
        excerpt: newPost.excerpt.trim() || null,
        content: newPost.content.trim(),
        tags: newPost.tags.split(",").map((tag) => tag.trim()).filter(Boolean),
        cover_image_url: newPost.cover_image_url.trim() || null,
        read_time_minutes: Number(newPost.read_time_minutes) || 5,
        is_members_only: newPost.is_members_only,
        is_published: isPublishing,
        published_at: isPublishing ? new Date().toISOString() : null,
        author_id: user?.id ?? null,
      };

      const query = editingPostId
        ? supabase.from("blog_posts").update(payload).eq("id", editingPostId)
        : supabase.from("blog_posts").insert(payload);

      const { error } = await query;
      if (error) throw error;

      toast.success(editingPostId ? "Insight updated" : "Insight created");
      resetPostForm();
      await loadAdminData();
    } catch (error) {
      console.error("Failed to save insight:", error);
      const message = getErrorMessage(error) || "Unknown error";
      toast.error(`Failed to save insight: ${message}`);
    } finally {
      setIsSavingPost(false);
    }
  };

  const saveTestimonial = async () => {
    if (!newTestimonial.name.trim() || !newTestimonial.content.trim()) {
      toast.error("Please add the testimonial name and message");
      return;
    }

    setIsSavingTestimonial(true);
    try {
      const payload = {
        name: newTestimonial.name.trim(),
        role: newTestimonial.role.trim() || null,
        company: newTestimonial.company.trim() || null,
        content: newTestimonial.content.trim(),
        rating: Math.min(5, Math.max(1, Number(newTestimonial.rating) || 5)),
        image_url: newTestimonial.image_url.trim() || null,
        display_order: Number(newTestimonial.display_order) || 0,
        is_published: newTestimonial.is_published,
      };

      const query = editingTestimonialId
        ? supabase.from("testimonials").update(payload).eq("id", editingTestimonialId)
        : supabase.from("testimonials").insert(payload);

      const { error } = await query;
      if (error) throw error;

      toast.success(editingTestimonialId ? "Testimonial updated" : "Testimonial added");
      resetTestimonialForm();
      await loadAdminData();
    } catch (error) {
      console.error("Failed to save testimonial:", error);
      toast.error(getErrorMessage(error) || "Failed to save testimonial");
    } finally {
      setIsSavingTestimonial(false);
    }
  };

  const saveGalleryItem = async () => {
    if (!newGalleryItem.image_url.trim()) {
      toast.error("Please upload or paste a gallery image first");
      return;
    }

    setIsSavingGalleryItem(true);
    try {
      const payload = {
        title: newGalleryItem.title.trim() || null,
        category: newGalleryItem.category.trim() || null,
        image_url: newGalleryItem.image_url.trim(),
        display_order: Number(newGalleryItem.display_order) || 0,
        is_published: newGalleryItem.is_published,
      };

      const query = editingGalleryItemId
        ? supabase.from("gallery").update(payload).eq("id", editingGalleryItemId)
        : supabase.from("gallery").insert(payload);

      const { error } = await query;
      if (error) throw error;

      toast.success(editingGalleryItemId ? "Gallery photo updated" : "Gallery photo added");
      resetGalleryItemForm();
      await loadAdminData();
    } catch (error) {
      console.error("Failed to save gallery photo:", error);
      toast.error(getErrorMessage(error) || "Failed to save gallery photo");
    } finally {
      setIsSavingGalleryItem(false);
    }
  };

  const toggleVisibility = async (
    table: "events" | "books" | "blog_posts" | "testimonials" | "gallery",
    row: { id: string; is_published: boolean | null },
  ) => {
    try {
      const update =
        table === "blog_posts"
          ? {
              is_published: !row.is_published,
              published_at: !row.is_published ? new Date().toISOString() : null,
            }
          : { is_published: !row.is_published };

      const { error } = await supabase.from(table).update(update).eq("id", row.id);
      if (error) throw error;

      toast.success(row.is_published ? "Content hidden" : "Content published");
      await loadAdminData();
    } catch (error) {
      console.error("Failed to update visibility:", error);
      toast.error("Failed to update visibility");
    }
  };

  const deleteContent = async (
    table: "events" | "books" | "blog_posts" | "testimonials" | "gallery" | "orders" | "consultations" | "contact_messages" | "consultation_services" | "consultation_date_blocks" | "consultation_time_blocks",
    id: string,
    label: string,
  ) => {
    const confirmed = window.confirm(`Delete this ${label.toLowerCase()}? This cannot be undone.`);
    if (!confirmed) return;

    try {
      const { error } = await supabase.from(table).delete().eq("id", id);
      if (error) throw error;
      toast.success(`${label} deleted`);
      await loadAdminData();
    } catch (error) {
      console.error(`Failed to delete ${label}:`, error);
      toast.error(`Failed to delete ${label.toLowerCase()}`);
    }
  };

  const toggleMessageRead = async (message: ContactMessageRow) => {
    try {
      const { error } = await supabase
        .from("contact_messages")
        .update({ is_read: !message.is_read })
        .eq("id", message.id);
      if (error) throw error;
      await loadAdminData();
    } catch (error) {
      console.error("Failed to update message status:", error);
      toast.error("Failed to update message");
    }
  };

  const updateConsultationDraft = (
    consultationId: string,
    field: "date" | "status",
    value: string,
  ) => {
    setConsultationDrafts((prev) => ({
      ...prev,
      [consultationId]: {
        date: prev[consultationId]?.date ?? "",
        status: prev[consultationId]?.status ?? "pending",
        [field]: value,
      },
    }));
  };

  const saveConsultation = async (consultationId: string) => {
    const draft = consultationDrafts[consultationId];
    if (!draft?.date) {
      toast.error("Please set the consultation date and time first.");
      return;
    }

    try {
      const { error } = await supabase
        .from("consultations")
        .update({
          date: new Date(draft.date).toISOString(),
          status: draft.status,
        })
        .eq("id", consultationId);

      if (error) throw error;

      toast.success("Consultation updated");
      await loadAdminData();
    } catch (error) {
      console.error("Failed to update consultation:", error);
      toast.error("Failed to update consultation");
    }
  };

  const saveConsultationService = async () => {
    if (!newConsultationService.title.trim() || !newConsultationService.slug.trim()) {
      toast.error("Please add a service title and slug.");
      return;
    }

    const displayOrder = Number(newConsultationService.display_order) || 0;
    if (consultationServices.some((service) => Number(service.display_order) === displayOrder)) {
      toast.error("This service display order is already used. Please choose another number.");
      return;
    }

    try {
      const { error } = await supabase.from("consultation_services").insert({
        slug: slugify(newConsultationService.slug),
        title: newConsultationService.title.trim(),
        description: newConsultationService.description.trim() || "Consultation service",
        duration_minutes: Number(newConsultationService.duration_minutes) || 30,
        price: Number(newConsultationService.price) || 0,
        display_order: displayOrder,
        is_published: newConsultationService.is_published,
      });

      if (error) throw error;

      toast.success("Consultation service added");
      setNewConsultationService({
        slug: "",
        title: "",
        description: "",
        duration_minutes: "30",
        price: "0",
        display_order: "0",
        is_published: true,
      });
      await loadAdminData();
    } catch (error) {
      console.error("Failed to save consultation service:", error);
      toast.error(getErrorMessage(error) || "Failed to save consultation service");
    }
  };

  const updateConsultationService = async (
    service: ConsultationServiceRow,
    field: "title" | "description" | "duration_minutes" | "price" | "display_order" | "is_published",
    value: string | boolean,
  ) => {
    const numericFields = ["duration_minutes", "price", "display_order"];
    const nextValue = numericFields.includes(field) ? Number(value) || 0 : value;

    if (
      field === "display_order" &&
      consultationServices.some((item) => item.id !== service.id && Number(item.display_order) === Number(nextValue))
    ) {
      toast.error("This service display order is already used. Please choose another number.");
      return;
    }

    const { error } = await supabase
      .from("consultation_services")
      .update({ [field]: nextValue })
      .eq("id", service.id);

    if (error) {
      toast.error("Failed to update consultation service");
      return;
    }

    await loadAdminData();
  };

  const saveConsultationTimeBlock = async () => {
    if (!newConsultationTimeBlock.label.trim() || !newConsultationTimeBlock.time_value.trim()) {
      toast.error("Please add a time label and 24-hour time value.");
      return;
    }

    const displayOrder = Number(newConsultationTimeBlock.display_order) || 0;
    if (consultationTimeBlocks.some((block) => Number(block.display_order) === displayOrder)) {
      toast.error("This time block display order is already used. Please choose another number.");
      return;
    }

    try {
      const { error } = await supabase.from("consultation_time_blocks").insert({
        label: newConsultationTimeBlock.label.trim(),
        time_value: newConsultationTimeBlock.time_value.trim(),
        display_order: displayOrder,
        is_published: newConsultationTimeBlock.is_published,
      });

      if (error) throw error;

      toast.success("Consultation time block added");
      setNewConsultationTimeBlock({
        label: "",
        time_value: "",
        display_order: "0",
        is_published: true,
      });
      await loadAdminData();
    } catch (error) {
      console.error("Failed to save consultation time block:", error);
      toast.error(getErrorMessage(error) || "Failed to save consultation time block");
    }
  };

  const updateConsultationTimeBlock = async (
    block: ConsultationTimeBlockRow,
    field: "label" | "time_value" | "display_order" | "is_published",
    value: string | boolean,
  ) => {
    const nextValue = field === "display_order" ? Number(value) || 0 : value;

    if (
      field === "display_order" &&
      consultationTimeBlocks.some((item) => item.id !== block.id && Number(item.display_order) === Number(nextValue))
    ) {
      toast.error("This time block display order is already used. Please choose another number.");
      return;
    }

    const { error } = await supabase
      .from("consultation_time_blocks")
      .update({ [field]: nextValue })
      .eq("id", block.id);

    if (error) {
      toast.error("Failed to update time block");
      return;
    }

    await loadAdminData();
  };

  const saveConsultationDateBlock = async () => {
    if (!newConsultationDateBlock.label.trim() || !newConsultationDateBlock.date_value.trim()) {
      toast.error("Please add a date label and date.");
      return;
    }

    const displayOrder = Number(newConsultationDateBlock.display_order) || 0;
    if (consultationDateBlocks.some((block) => Number(block.display_order) === displayOrder)) {
      toast.error("This date block display order is already used. Please choose another number.");
      return;
    }

    try {
      const { error } = await supabase.from("consultation_date_blocks").insert({
        label: newConsultationDateBlock.label.trim(),
        date_value: newConsultationDateBlock.date_value,
        display_order: displayOrder,
        is_published: newConsultationDateBlock.is_published,
      });

      if (error) throw error;

      toast.success("Consultation date block added");
      setNewConsultationDateBlock({
        label: "",
        date_value: "",
        display_order: "0",
        is_published: true,
      });
      await loadAdminData();
    } catch (error) {
      console.error("Failed to save consultation date block:", error);
      toast.error(getErrorMessage(error) || "Failed to save consultation date block");
    }
  };

  const updateConsultationDateBlock = async (
    block: ConsultationDateBlockRow,
    field: "label" | "date_value" | "display_order" | "is_published",
    value: string | boolean,
  ) => {
    const nextValue = field === "display_order" ? Number(value) || 0 : value;

    if (
      field === "display_order" &&
      consultationDateBlocks.some((item) => item.id !== block.id && Number(item.display_order) === Number(nextValue))
    ) {
      toast.error("This date block display order is already used. Please choose another number.");
      return;
    }

    const { error } = await supabase
      .from("consultation_date_blocks")
      .update({ [field]: nextValue })
      .eq("id", block.id);

    if (error) {
      toast.error("Failed to update date block");
      return;
    }

    await loadAdminData();
  };

  const updateUserRole = async (userId: string, nextRole: AppRole) => {
    setRoleUpdatingId(userId);
    try {
      const { error: deleteError } = await supabase.from("user_roles").delete().eq("user_id", userId);
      if (deleteError) throw deleteError;

      const { error: insertError } = await supabase.from("user_roles").insert({
        user_id: userId,
        role: nextRole,
      });
      if (insertError) throw insertError;

      toast.success("User role updated");
      await loadAdminData();
    } catch (error) {
      console.error("Failed to update user role:", error);
      toast.error("Failed to update user role");
    } finally {
      setRoleUpdatingId(null);
    }
  };

  const updateMembershipTier = async (userId: string, nextTier: "free" | "premium") => {
    setMembershipUpdatingId(userId);
    try {
      const { error } = await supabase.from("profiles").upsert({
        id: userId,
        membership_tier: nextTier,
      });

      if (error) throw error;

      toast.success("Membership updated");
      await loadAdminData();
    } catch (error) {
      console.error("Failed to update membership:", error);
      toast.error("Failed to update membership");
    } finally {
      setMembershipUpdatingId(null);
    }
  };

  const saveOrderTracking = async (orderId: string) => {
    const draft = trackingDrafts[orderId];
    if (!draft) return;

    const trackingNumber = draft.trackingNumber.trim();
    const carrier = (draft.carrier || "Australia Post").trim() || "Australia Post";
    const trackingUrl = trackingNumber ? buildAustraliaPostTrackingUrl(trackingNumber) : null;

    try {
      const { data, error } = await supabase
        .from("orders")
        .update({
          tracking_number: trackingNumber || null,
          carrier: trackingNumber ? carrier : null,
          tracking_url: trackingUrl,
        })
        .eq("id", orderId)
        .select("*")
        .single();

      if (error) throw error;

      setOrders((prev) => prev.map((order) => (order.id === orderId ? data : order)));
      setTrackingDrafts((prev) => ({
        ...prev,
        [orderId]: {
          trackingNumber: data.tracking_number ?? "",
          carrier: data.carrier ?? "Australia Post",
        },
      }));
      toast.success("Tracking details updated");
    } catch (error) {
      console.error("Failed to save tracking details:", error);
      toast.error(getErrorMessage(error) || "Failed to save tracking details");
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <section className="pt-32 pb-16 min-h-screen bg-background">
          <div className="container-wide text-center">
            <h1 className="text-3xl font-heading font-bold">Loading admin panel...</h1>
          </div>
        </section>
      </Layout>
    );
  }

  if (!user || !isAdmin) {
    return (
      <Layout>
        <section className="pt-32 pb-16 min-h-screen bg-background">
          <div className="container-wide max-w-xl text-center">
            <h1 className="mb-4 text-3xl font-heading font-bold">Admin Access Required</h1>
            <p className="mb-8 text-muted-foreground">
              This area is only available to the site owner and admin users.
            </p>
            <Button variant="gold" onClick={() => navigate(user ? "/dashboard" : "/auth")}>
              {user ? "Go to Dashboard" : "Go to Sign In"}
            </Button>
          </div>
        </section>
      </Layout>
    );
  }

  const displayName =
    user.user_metadata?.full_name ||
    user.user_metadata?.name ||
    user.email?.split("@")[0] ||
    "Admin";

  const roleLabel = role === "owner" ? "Owner" : "Admin";
  const bookCategoryOptions = Array.from(
    new Set(
      [...defaultBookCategories, ...books.map((book) => book.category).filter(Boolean)].sort(),
    ),
  );
  const eventCategoryOptions = Array.from(
    new Set(
      [...defaultEventCategories, ...events
        .map((event) => event.category)
        .filter((category): category is string => typeof category === "string" && category.trim().length > 0)]
        .sort(),
    ),
  );
  const groupedOrders = [
    "Pending Payment",
    "In Progress",
    "Delivered / Completed",
    "Cancelled",
  ]
    .map((label) => ({
      label,
      orders: orders.filter((order) => getAdminOrderGroup(order.status) === label),
    }))
    .filter((group) => group.orders.length > 0);
  const activeOrderGroupLabel =
    groupedOrders.some((group) => group.label === selectedOrderGroup)
      ? selectedOrderGroup
      : groupedOrders[0]?.label ?? "Pending Payment";
  const visibleOrderGroup =
    groupedOrders.find((group) => group.label === activeOrderGroupLabel) ?? groupedOrders[0] ?? null;

  return (
    <Layout>
      {/* Hero */}
      <section className="pt-32 pb-8 bg-gradient-hero text-cream">
        <div className="container-wide">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between"
          >
            <div>
              <span className="text-primary font-medium tracking-widest uppercase text-sm">
                {roleLabel} Dashboard
              </span>
              <h1 className="text-4xl md:text-5xl font-heading font-bold mt-4">
                Manage Your
                <span className="text-gradient-gold"> Platform</span>
              </h1>
              <p className="mt-3 text-sm text-cream/70">
                Signed in as {displayName} ({user.email})
              </p>
            </div>
            <Button
              variant="goldOutline"
              className="flex items-center gap-2 self-start md:self-auto"
              onClick={async () => {
                await signOut();
                navigate("/");
              }}
            >
              Sign Out
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Stats Cards */}
      <section className="py-8 bg-background border-b border-border">
        <div className="container-wide">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {stats.map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <Card
                  className={`relative overflow-hidden ${
                    stat.highlight
                      ? "border-primary/50 bg-gradient-to-br from-primary/10 to-transparent"
                      : ""
                  }`}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <stat.icon
                        className={`w-5 h-5 ${
                          stat.highlight ? "text-primary" : "text-muted-foreground"
                        }`}
                      />
                      {stat.highlight && (
                        <Crown className="w-4 h-4 text-primary" />
                      )}
                    </div>
                    <p className="text-2xl font-bold">{stat.value}</p>
                    <div className="mt-1 space-y-1">
                      <p className="text-xs text-muted-foreground">
                        {stat.label}
                      </p>
                      <p className="text-xs font-medium text-muted-foreground">
                        {stat.detail}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Charts Section */}
      <AdminSectionErrorBoundary
        fallback={
          <section className="py-8 bg-secondary/20">
            <div className="container-wide">
              <Card>
                <CardContent className="p-6 text-sm text-muted-foreground">
                  Analytics could not be displayed right now, but the admin tools below are still available.
                </CardContent>
              </Card>
            </div>
          </section>
        }
      >
      <section className="py-8 bg-secondary/20">
        <div className="container-wide">
          <div className="grid lg:grid-cols-2 gap-6 mb-6">
            {/* Revenue & Bookings Chart */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-primary" />
                  Revenue & Bookings
                </CardTitle>
                <Badge variant="secondary">Last 6 months</Badge>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  {salesData.some((entry) => entry.bookings > 0 || entry.sales > 0) ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={salesData}>
                        <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                        <XAxis dataKey="month" fontSize={12} />
                        <YAxis yAxisId="left" fontSize={12} />
                        <YAxis yAxisId="right" orientation="right" fontSize={12} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "hsl(var(--card))",
                            border: "1px solid hsl(var(--border))",
                            borderRadius: "8px",
                          }}
                        />
                        <Line
                          yAxisId="left"
                          type="monotone"
                          dataKey="bookings"
                          stroke="hsl(var(--primary))"
                          strokeWidth={2}
                          dot={{ fill: "hsl(var(--primary))" }}
                          name="Bookings"
                        />
                        <Line
                          yAxisId="right"
                          type="monotone"
                          dataKey="sales"
                          stroke="#10B981"
                          strokeWidth={2}
                          dot={{ fill: "#10B981" }}
                          name="Revenue ($)"
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex h-full items-center justify-center rounded-lg border border-dashed border-border text-sm text-muted-foreground">
                      No order or booking data yet.
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Membership Distribution */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <PieChart className="w-5 h-5 text-primary" />
                  Membership Distribution
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  {membershipData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <RechartsPie>
                        <Pie
                          data={membershipData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={100}
                          paddingAngle={5}
                          dataKey="value"
                          label={({ name, percent }) =>
                            `${name} ${(percent * 100).toFixed(0)}%`
                          }
                        >
                          {membershipData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "hsl(var(--card))",
                            border: "1px solid hsl(var(--border))",
                            borderRadius: "8px",
                          }}
                        />
                        <Legend />
                      </RechartsPie>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex h-full items-center justify-center rounded-lg border border-dashed border-border text-sm text-muted-foreground">
                      No membership records yet.
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            {/* Program Bookings Chart */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Activity className="w-5 h-5 text-primary" />
                  Program Bookings
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[250px]">
                  {eventBookingsData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={eventBookingsData} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                        <XAxis type="number" fontSize={12} />
                        <YAxis dataKey="event" type="category" width={120} fontSize={11} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "hsl(var(--card))",
                            border: "1px solid hsl(var(--border))",
                            borderRadius: "8px",
                          }}
                        />
                        <Bar
                          dataKey="booked"
                          fill="hsl(var(--primary))"
                          name="Booked"
                          radius={[0, 4, 4, 0]}
                        />
                        <Bar
                          dataKey="capacity"
                          fill="hsl(var(--muted))"
                          name="Capacity"
                          radius={[0, 4, 4, 0]}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex h-full items-center justify-center rounded-lg border border-dashed border-border text-sm text-muted-foreground">
                      No programs available yet.
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Top Selling Books */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-primary" />
                  Top Selling Books
                </CardTitle>
              </CardHeader>
              <CardContent>
                {bookSalesData.length > 0 ? (
                  <div className="space-y-4">
                    {bookSalesData.map((book, i) => (
                      <div
                        key={book.name}
                        className="flex items-center justify-between p-3 bg-secondary/30 rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <span className="w-6 h-6 rounded-full bg-primary/20 text-primary text-xs font-bold flex items-center justify-center">
                            {i + 1}
                          </span>
                          <span className="font-medium text-sm">{book.name}</span>
                        </div>
                        <div className="text-right">
                          <p className="font-bold">{book.sales} sold</p>
                          <p className="text-xs text-muted-foreground">
                            ${book.revenue.toLocaleString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex h-[250px] items-center justify-center rounded-lg border border-dashed border-border text-sm text-muted-foreground">
                    No book sales recorded yet.
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
      </AdminSectionErrorBoundary>

      {/* Dashboard Content */}
      <AdminSectionErrorBoundary
        fallback={
          <section className="section-padding bg-background">
            <div className="container-wide">
              <Card>
                <CardContent className="p-6">
                  <h2 className="mb-2 font-heading text-2xl font-bold">Admin tools could not load</h2>
                  <p className="text-sm text-muted-foreground">
                    One admin section has invalid data or failed during rendering. Refresh the page once, and check the browser console if it continues.
                  </p>
                </CardContent>
              </Card>
            </div>
          </section>
        }
      >
      <section className="section-padding bg-background">
        <div className="container-wide">
          <Tabs defaultValue="events" className="space-y-8">
            <TabsList className="flex flex-wrap gap-2">
              <TabsTrigger value="events">
                <Calendar className="w-4 h-4 mr-1" />
                Programs
              </TabsTrigger>
              <TabsTrigger value="books">
                <BookOpen className="w-4 h-4 mr-1" />
                Books
              </TabsTrigger>
              <TabsTrigger value="orders">
                <ShoppingBag className="w-4 h-4 mr-1" />
                Orders
              </TabsTrigger>
              <TabsTrigger value="blog">
                <FileText className="w-4 h-4 mr-1" />
                Insights
              </TabsTrigger>
              <TabsTrigger value="testimonials">
                <Star className="w-4 h-4 mr-1" />
                Testimonials
              </TabsTrigger>
              <TabsTrigger value="gallery">
                <Image className="w-4 h-4 mr-1" />
                Gallery
              </TabsTrigger>
              <TabsTrigger value="users">
                <Users className="w-4 h-4 mr-1" />
                Users
              </TabsTrigger>
              <TabsTrigger value="consultations">
                <MessageSquare className="w-4 h-4 mr-1" />
                Consultations
              </TabsTrigger>
              <TabsTrigger
                value="messages"
                className={unreadMessagesCount > 0 ? "animate-pulse ring-1 ring-destructive/60" : undefined}
              >
                <Mail className="w-4 h-4 mr-1" />
                Messages
              </TabsTrigger>
            </TabsList>

            {/* Programs Tab */}
            <TabsContent value="events">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Manage Programs</CardTitle>
                  <Dialog
                    open={isEventDialogOpen}
                    onOpenChange={(open) => {
                      setIsEventDialogOpen(open);
                      if (!open) resetEventForm();
                    }}
                  >
                    <DialogTrigger asChild>
                      <Button
                        variant="gold"
                        size="sm"
                        onClick={() => {
                          setEditingEventId(null);
                          setIsEventDialogOpen(true);
                        }}
                      >
                        <Plus size={16} className="mr-1" /> Add Program
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>{editingEventId ? "Edit Program" : "Create New Program"}</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4 pr-1">
                        <div>
                          <Label>Title</Label>
                          <Input
                            value={newEvent.title}
                            onChange={(e) =>
                              setNewEvent((p) => ({ ...p, title: e.target.value }))
                            }
                          />
                        </div>
                        <div>
                          <Label>Description</Label>
                          <Textarea
                            value={newEvent.description}
                            onChange={(e) =>
                              setNewEvent((p) => ({
                                ...p,
                                description: e.target.value,
                              }))
                            }
                          />
                        </div>
                        <div>
                          <Label>Category</Label>
                          <Input
                            list="event-category-options"
                            value={newEvent.category}
                            onChange={(e) =>
                              setNewEvent((p) => ({
                                ...p,
                                category: e.target.value,
                              }))
                            }
                            placeholder="Choose or type a category"
                          />
                          <datalist id="event-category-options">
                            {eventCategoryOptions.map((category) => (
                              <option key={category} value={category} />
                            ))}
                          </datalist>
                          <p className="mt-1 text-xs text-muted-foreground">
                            Pick a suggested category or type your own new category.
                          </p>
                        </div>
                        <div>
                          <Label>Date & Time</Label>
                          <Input
                            type="datetime-local"
                            value={newEvent.date}
                            onChange={(e) =>
                              setNewEvent((p) => ({ ...p, date: e.target.value }))
                            }
                          />
                        </div>
                        <div>
                          <Label>Venue</Label>
                          <Input
                            value={newEvent.venue}
                            onChange={(e) =>
                              setNewEvent((p) => ({ ...p, venue: e.target.value }))
                            }
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label>Price ($)</Label>
                            <Input
                              type="number"
                              value={newEvent.price}
                              onChange={(e) =>
                                setNewEvent((p) => ({ ...p, price: e.target.value }))
                              }
                            />
                          </div>
                          <div>
                            <Label>Member Price ($)</Label>
                            <Input
                              type="number"
                              value={newEvent.member_price}
                              onChange={(e) =>
                                setNewEvent((p) => ({ ...p, member_price: e.target.value }))
                              }
                              placeholder="Optional member price"
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label>Total Seats</Label>
                            <Input
                              type="number"
                              value={newEvent.total_seats}
                              onChange={(e) =>
                                setNewEvent((p) => ({
                                  ...p,
                                  total_seats: e.target.value,
                                }))
                              }
                            />
                          </div>
                          <div>
                            <Label>Available Seats</Label>
                            <Input
                              type="number"
                              value={newEvent.available_seats}
                              onChange={(e) =>
                                setNewEvent((p) => ({
                                  ...p,
                                  available_seats: e.target.value,
                                }))
                              }
                            />
                          </div>
                        </div>
                        <div>
                          <Label>Image URL</Label>
                          <Input
                            value={newEvent.image_url}
                            onChange={(e) =>
                              setNewEvent((p) => ({ ...p, image_url: e.target.value }))
                            }
                          />
                        </div>
                        <div>
                          <Label>Upload image from computer</Label>
                          <Input
                            type="file"
                            accept="image/*"
                            onChange={(e) =>
                              void handleImageUpload(
                                "event-image",
                                e.target.files?.[0] ?? null,
                                (value) =>
                                  setNewEvent((p) => ({
                                    ...p,
                                    image_url: value,
                                  })),
                              )
                            }
                          />
                          <p className="mt-1 text-xs text-muted-foreground">
                            You can either paste an image URL or choose an image from your PC.
                          </p>
                        </div>
                        {newEvent.image_url ? (
                          <div className="space-y-2">
                            <Label>Preview</Label>
                            <img
                              src={newEvent.image_url}
                              alt="Program preview"
                              className="h-32 w-full rounded-md border border-border object-cover"
                            />
                          </div>
                        ) : null}
                        <label className="flex items-center gap-2 text-sm">
                          <input
                            type="checkbox"
                            checked={newEvent.is_members_only}
                            onChange={(e) =>
                              setNewEvent((p) => ({
                                ...p,
                                is_members_only: e.target.checked,
                              }))
                            }
                          />
                          Members Only
                        </label>
                        <label className="flex items-center gap-2 text-sm">
                          <input
                            type="checkbox"
                            checked={newEvent.is_published}
                            onChange={(e) =>
                              setNewEvent((p) => ({
                                ...p,
                                is_published: e.target.checked,
                              }))
                            }
                          />
                          Published
                        </label>
                        <div className="flex gap-3">
                          <Button
                            variant="gold"
                            className="w-full"
                            onClick={() => void saveEvent()}
                            disabled={isSavingEvent || uploadingField === "event-image"}
                          >
                            {isSavingEvent || uploadingField === "event-image" ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                            {editingEventId ? "Save Program" : "Create Program"}
                          </Button>
                          {editingEventId ? (
                            <Button variant="outline" className="w-full" onClick={resetEventForm}>
                              Cancel
                            </Button>
                          ) : null}
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {events.map((event) => {
                      const eventBookedUsers = eventBookingsByEvent.get(event.id) ?? [];
                      const isBookingsExpanded = expandedEventBookingsId === event.id;

                      return (
                      <motion.div
                        key={event.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="space-y-4 p-4 border border-border rounded-lg hover:bg-secondary/30 transition-colors"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium">{event.title}</h4>
                            {!event.is_published && (
                              <Badge variant="secondary">Draft</Badge>
                            )}
                            {event.is_members_only ? <Badge className="bg-amber-500 text-black">Members Only</Badge> : null}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {event.date} - {event.venue}
                          </p>
                          <div className="flex items-center gap-4 mt-1">
                            <span className="text-sm font-medium text-primary">
                              ${Number(event.price).toFixed(2)}
                            </span>
                            {event.member_price ? (
                              <span className="text-sm text-amber-500">
                                Member ${Number(event.member_price).toFixed(2)}
                              </span>
                            ) : null}
                            <span className="text-sm text-muted-foreground">
                              {event.total_seats - event.available_seats}/{event.total_seats} booked
                            </span>
                            <div className="w-24 h-2 bg-secondary rounded-full overflow-hidden">
                              <div
                                className="h-full bg-primary rounded-full"
                                style={{
                                  width: `${event.total_seats > 0 ? ((event.total_seats - event.available_seats) / event.total_seats) * 100 : 0}%`,
                                }}
                              />
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setEditingEventId(event.id);
                              setIsEventDialogOpen(true);
                              setNewEvent({
                                title: event.title,
                                description: event.description ?? "",
                                category: event.category ?? "",
                                date: toLocalDateTimeInput(event.date),
                                venue: event.venue,
                                price: String(event.price),
                                member_price: String(event.member_price ?? event.price),
                                total_seats: String(event.total_seats),
                                available_seats: String(event.available_seats),
                                image_url: event.image_url ?? "",
                                is_members_only: Boolean(event.is_members_only),
                                is_published: Boolean(event.is_published),
                              });
                            }}
                          >
                            <Calendar size={16} />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => void toggleVisibility("events", event)}
                          >
                            {event.is_published ? <EyeOff size={16} /> : <Eye size={16} />}
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-destructive"
                            onClick={() => void deleteContent("events", event.id, "Program")}
                          >
                            <Trash2 size={16} />
                          </Button>
                        </div>
                        <div className="rounded-lg border border-border/70 bg-background/60">
                          <button
                            type="button"
                            className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left text-sm font-medium transition-colors hover:bg-secondary/40"
                            onClick={() =>
                              setExpandedEventBookingsId((current) =>
                                current === event.id ? null : event.id,
                              )
                            }
                          >
                            <span>
                              View Bookings ({eventBookedUsers.length})
                            </span>
                            {isBookingsExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                          </button>
                          {isBookingsExpanded ? (
                            <div className="space-y-2 border-t border-border px-4 py-3">
                              {eventBookedUsers.length > 0 ? (
                                eventBookedUsers.map((booking) => {
                                  const bookedUser = managedUsersMap.get(booking.user_id);

                                  return (
                                    <div
                                      key={booking.id}
                                      className="rounded-md border border-border bg-card p-3 text-sm"
                                    >
                                      <div className="flex flex-wrap items-center justify-between gap-2">
                                        <div>
                                          <p className="font-medium">
                                            {bookedUser?.full_name || "Unnamed user"}
                                          </p>
                                          <p className="break-all text-xs text-muted-foreground">
                                            {booking.user_id}
                                          </p>
                                        </div>
                                        <Badge variant="outline">{booking.status}</Badge>
                                      </div>
                                      <div className="mt-2 grid gap-2 text-xs text-muted-foreground md:grid-cols-3">
                                        <span>Seats: {booking.seats}</span>
                                        <span>Total: ${Number(booking.total_amount).toFixed(2)}</span>
                                        <span>Booked: {formatDateTime(booking.created_at)}</span>
                                      </div>
                                    </div>
                                  );
                                })
                              ) : (
                                <p className="text-sm text-muted-foreground">
                                  No bookings for this event yet.
                                </p>
                              )}
                            </div>
                          ) : null}
                        </div>
                      </motion.div>
                      );
                    })}
                    {events.length === 0 ? (
                      <div className="rounded-lg border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
                        No programs yet. Add your first program here, then manage it from this list with edit, hide, or delete.
                      </div>
                    ) : null}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Books Tab */}
            <TabsContent value="books">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Manage Books</CardTitle>
                  <Dialog
                    open={isBookDialogOpen}
                    onOpenChange={(open) => {
                      setIsBookDialogOpen(open);
                      if (!open) resetBookForm();
                    }}
                  >
                    <DialogTrigger asChild>
                      <Button
                        variant="gold"
                        size="sm"
                        onClick={() => {
                          setEditingBookId(null);
                          setIsBookDialogOpen(true);
                        }}
                      >
                        <Plus size={16} className="mr-1" /> Add Book
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>{editingBookId ? "Edit Book" : "Create New Book"}</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4 pr-1">
                        <div>
                          <Label>Title</Label>
                          <Input
                            value={newBook.title}
                            onChange={(e) =>
                              setNewBook((p) => ({ ...p, title: e.target.value }))
                            }
                          />
                        </div>
                        <div>
                          <Label>Author</Label>
                          <Input
                            value={newBook.author}
                            onChange={(e) =>
                              setNewBook((p) => ({ ...p, author: e.target.value }))
                            }
                          />
                        </div>
                        <div>
                          <Label>Description</Label>
                          <Textarea
                            value={newBook.description}
                            onChange={(e) =>
                              setNewBook((p) => ({
                                ...p,
                                description: e.target.value,
                              }))
                            }
                          />
                        </div>
                        <div>
                          <Label>Category</Label>
                          <Input
                            list="book-category-options"
                            value={newBook.category}
                            onChange={(e) =>
                              setNewBook((p) => ({
                                ...p,
                                category: e.target.value,
                              }))
                            }
                            placeholder="Choose or type a category"
                          />
                          <datalist id="book-category-options">
                            {bookCategoryOptions.map((category) => (
                              <option key={category} value={category} />
                            ))}
                          </datalist>
                          <p className="mt-1 text-xs text-muted-foreground">
                            Pick a suggested category or type your own new category.
                          </p>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label>Price ($)</Label>
                            <Input
                              type="number"
                              value={newBook.price}
                              onChange={(e) =>
                                setNewBook((p) => ({ ...p, price: e.target.value }))
                              }
                            />
                          </div>
                          <div>
                            <Label>Member Price ($)</Label>
                            <Input
                              type="number"
                              value={newBook.member_price}
                              onChange={(e) =>
                                setNewBook((p) => ({ ...p, member_price: e.target.value }))
                              }
                              placeholder="Optional member price"
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label>Stock</Label>
                            <Input
                              type="number"
                              value={newBook.stock}
                              onChange={(e) =>
                                setNewBook((p) => ({ ...p, stock: e.target.value }))
                              }
                            />
                          </div>
                          <div className="flex items-end">
                            <label className="flex items-center gap-2 text-sm">
                              <input
                                type="checkbox"
                                checked={newBook.is_members_only}
                                onChange={(e) =>
                                  setNewBook((p) => ({
                                    ...p,
                                    is_members_only: e.target.checked,
                                  }))
                                }
                              />
                              Members Only
                            </label>
                          </div>
                        </div>
                        <div>
                          <Label>Cover Image URL</Label>
                          <Input
                            value={newBook.cover_image_url}
                            onChange={(e) =>
                              setNewBook((p) => ({
                                ...p,
                                cover_image_url: e.target.value,
                              }))
                            }
                          />
                        </div>
                        <div>
                          <Label>Upload cover from computer</Label>
                          <Input
                            type="file"
                            accept="image/*"
                            onChange={(e) =>
                              void handleImageUpload(
                                "book-image",
                                e.target.files?.[0] ?? null,
                                (value) =>
                                  setNewBook((p) => ({
                                    ...p,
                                    cover_image_url: value,
                                  })),
                              )
                            }
                          />
                          <p className="mt-1 text-xs text-muted-foreground">
                            Paste a cover URL or upload a cover image from your computer.
                          </p>
                        </div>
                        {newBook.cover_image_url ? (
                          <div className="space-y-2">
                            <Label>Preview</Label>
                            <img
                              src={newBook.cover_image_url}
                              alt="Book cover preview"
                              className="h-32 w-24 rounded-md border border-border object-cover"
                            />
                          </div>
                        ) : null}
                        <label className="flex items-center gap-2 text-sm">
                          <input
                            type="checkbox"
                            checked={newBook.is_published}
                            onChange={(e) =>
                              setNewBook((p) => ({
                                ...p,
                                is_published: e.target.checked,
                              }))
                            }
                          />
                          Published
                        </label>
                        <div className="flex gap-3">
                          <Button
                            variant="gold"
                            className="w-full"
                            onClick={() => void saveBook()}
                            disabled={isSavingBook || uploadingField === "book-image"}
                          >
                            {isSavingBook || uploadingField === "book-image" ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                            {editingBookId ? "Save Book" : "Create Book"}
                          </Button>
                          {editingBookId ? (
                            <Button variant="outline" className="w-full" onClick={resetBookForm}>
                              Cancel
                            </Button>
                          ) : null}
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {books.map((book) => (
                      <motion.div
                        key={book.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="space-y-4 p-4 border border-border rounded-lg hover:bg-secondary/30 transition-colors"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium">{book.title}</h4>
                            {!book.is_published && (
                              <Badge variant="secondary">Draft</Badge>
                            )}
                            {book.is_members_only ? <Badge className="bg-amber-500 text-black">Members Only</Badge> : null}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            by {book.author}
                          </p>
                          <div className="flex items-center gap-4 mt-1">
                            <span className="text-sm font-medium text-primary">
                              ${Number(book.price).toFixed(2)}
                            </span>
                            {book.member_price ? (
                              <span className="text-sm text-amber-500">
                                Member ${Number(book.member_price).toFixed(2)}
                              </span>
                            ) : null}
                            <span className="text-sm text-muted-foreground">
                              {book.stock} in stock
                            </span>
                            <span className="text-sm text-green-600">
                              {book.category ?? "General"}
                            </span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setEditingBookId(book.id);
                              setIsBookDialogOpen(true);
                              setNewBook({
                                title: book.title,
                                description: book.description ?? "",
                                author: book.author,
                                price: String(book.price),
                                member_price: String(book.member_price ?? book.price),
                                category: book.category ?? "",
                                stock: String(book.stock),
                                cover_image_url: book.cover_image_url ?? "",
                                is_members_only: Boolean(book.is_members_only),
                                is_published: Boolean(book.is_published),
                              });
                            }}
                          >
                            <BookOpen size={16} />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => void toggleVisibility("books", book)}
                          >
                            {book.is_published ? <EyeOff size={16} /> : <Eye size={16} />}
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-destructive"
                            onClick={() => void deleteContent("books", book.id, "Book")}
                          >
                            <Trash2 size={16} />
                          </Button>
                        </div>
                      </motion.div>
                    ))}
                    {books.length === 0 ? (
                      <div className="rounded-lg border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
                        No books yet. Add your first book here, then manage it from this list with edit, hide, or delete.
                      </div>
                    ) : null}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Orders Tab */}
            <TabsContent value="orders">
              <Card>
                <CardHeader>
                  <CardTitle>Order Management</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {groupedOrders.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {groupedOrders.map((group) => (
                          <Button
                            key={group.label}
                            type="button"
                            variant={activeOrderGroupLabel === group.label ? "gold" : "outline"}
                            size="sm"
                            className="gap-2"
                            onClick={() => setSelectedOrderGroup(group.label)}
                          >
                            {group.label}
                            <Badge variant="secondary">{group.orders.length}</Badge>
                          </Button>
                        ))}
                      </div>
                    ) : null}

                    {visibleOrderGroup ? (
                      <div className="space-y-3">
                        <div className="flex items-center justify-between rounded-lg border border-border bg-secondary/20 px-4 py-3">
                          <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                            {visibleOrderGroup.label}
                          </h3>
                          <Badge variant="outline">{visibleOrderGroup.orders.length}</Badge>
                        </div>
                        {visibleOrderGroup.orders.map((order) => (
                          <motion.div
                            key={order.id}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="space-y-4 rounded-lg border border-border p-4 transition-colors hover:bg-secondary/30"
                          >
                            <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                              <div>
                                <div className="flex items-center gap-2">
                                  <h4 className="font-medium">Order #{order.id.slice(0, 8).toUpperCase()}</h4>
                                  <Badge
                                    variant={
                                      order.status === "paid"
                                        ? "default"
                                        : order.status === "delivered" || order.status === "completed"
                                          ? "secondary"
                                          : "outline"
                                    }
                                    className={
                                      order.status === "paid"
                                        ? "bg-green-100 text-green-600 dark:bg-green-900/30"
                                        : ""
                                    }
                                  >
                                    {order.status}
                                  </Badge>
                                </div>
                                <p className="text-sm text-muted-foreground">
                                  {order.payment_method || "Payment method pending"}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {formatDate(order.created_at)}
                                </p>
                                {order.status === "pending" ? (
                                  <p className="mt-1 text-xs text-amber-600 dark:text-amber-400">
                                    Pending until {format(getPendingOrderExpiry(order.created_at), "PPP p")}. If payment is not completed before then, this order is cancelled automatically.
                                  </p>
                                ) : null}
                              </div>
                              <div className="text-left lg:text-right">
                                <p className="font-bold text-primary">${order.total_amount}</p>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="mt-2 gap-2 text-destructive"
                                  onClick={() => void deleteContent("orders", order.id, "Order")}
                                >
                                  <Trash2 size={14} />
                                  Delete
                                </Button>
                              </div>
                            </div>
                            {order.status !== "cancelled" ? (
                              <>
                                <div className="grid gap-3 md:grid-cols-[1.2fr,1fr,auto] md:items-end">
                                  <div>
                                    <Label htmlFor={`tracking-number-${order.id}`}>Tracking Number</Label>
                                    <Input
                                      id={`tracking-number-${order.id}`}
                                      value={trackingDrafts[order.id]?.trackingNumber ?? ""}
                                      onChange={(e) =>
                                        setTrackingDrafts((prev) => ({
                                          ...prev,
                                          [order.id]: {
                                            trackingNumber: e.target.value,
                                            carrier: prev[order.id]?.carrier ?? order.carrier ?? "Australia Post",
                                          },
                                        }))
                                      }
                                      placeholder="Enter AusPost tracking number"
                                    />
                                  </div>
                                  <div>
                                    <Label htmlFor={`carrier-${order.id}`}>Carrier</Label>
                                    <Input
                                      id={`carrier-${order.id}`}
                                      value={trackingDrafts[order.id]?.carrier ?? "Australia Post"}
                                      onChange={(e) =>
                                        setTrackingDrafts((prev) => ({
                                          ...prev,
                                          [order.id]: {
                                            trackingNumber: prev[order.id]?.trackingNumber ?? order.tracking_number ?? "",
                                            carrier: e.target.value,
                                          },
                                        }))
                                      }
                                    />
                                  </div>
                                  <Button
                                    variant="gold"
                                    size="sm"
                                    className="gap-2"
                                    onClick={() => void saveOrderTracking(order.id)}
                                  >
                                    <Save size={15} />
                                    Save Tracking
                                  </Button>
                                </div>
                                {trackingDrafts[order.id]?.trackingNumber ? (
                                  <p className="text-sm text-muted-foreground">
                                    Customer link:{" "}
                                    <a
                                      className="text-primary underline-offset-4 hover:underline"
                                      href={buildAustraliaPostTrackingUrl(trackingDrafts[order.id].trackingNumber)}
                                      target="_blank"
                                      rel="noreferrer"
                                    >
                                      Track with Australia Post
                                    </a>
                                  </p>
                                ) : null}
                              </>
                            ) : (
                              <p className="text-sm text-muted-foreground">
                                This order was cancelled, so tracking is no longer required.
                              </p>
                            )}
                          </motion.div>
                        ))}
                      </div>
                    ) : null}
                    {orders.length === 0 ? (
                      <div className="rounded-lg border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
                        No orders yet. When a user buys a book, you can add their Australia Post tracking details here.
                      </div>
                    ) : null}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Insights Tab */}
            <TabsContent value="blog">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Insights</CardTitle>
                  <Dialog
                    open={isPostDialogOpen}
                    onOpenChange={(open) => {
                      setIsPostDialogOpen(open);
                      if (!open) resetPostForm();
                    }}
                  >
                    <DialogTrigger asChild>
                      <Button
                        variant="gold"
                        size="sm"
                        onClick={() => {
                          setEditingPostId(null);
                          setIsPostDialogOpen(true);
                        }}
                      >
                        <Plus size={16} className="mr-1" /> {editingPostId ? "Edit Post" : "New Post"}
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-3xl">
                      <DialogHeader>
                        <DialogTitle>{editingPostId ? "Edit Insight" : "Create Insight"}</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4 pr-1">
                        <div>
                          <Label>Title</Label>
                          <Input value={newPost.title} onChange={(e) => setNewPost((p) => ({ ...p, title: e.target.value }))} />
                        </div>
                        <div>
                          <Label>Slug</Label>
                          <Input value={newPost.slug} onChange={(e) => setNewPost((p) => ({ ...p, slug: e.target.value }))} />
                        </div>
                        <div>
                          <Label>Excerpt</Label>
                          <Textarea value={newPost.excerpt} onChange={(e) => setNewPost((p) => ({ ...p, excerpt: e.target.value }))} />
                        </div>
                        <div>
                          <Label>Content</Label>
                          <Textarea rows={7} value={newPost.content} onChange={(e) => setNewPost((p) => ({ ...p, content: e.target.value }))} />
                        </div>
                        <div>
                          <Label>Tags</Label>
                          <Input value={newPost.tags} onChange={(e) => setNewPost((p) => ({ ...p, tags: e.target.value }))} placeholder="mindset, resilience" />
                        </div>
                        <div>
                          <Label>Cover Image URL</Label>
                          <Input value={newPost.cover_image_url} onChange={(e) => setNewPost((p) => ({ ...p, cover_image_url: e.target.value }))} />
                        </div>
                        <div>
                          <Label>Upload cover from computer</Label>
                          <Input
                            type="file"
                            accept="image/*"
                            onChange={(e) =>
                              void handleImageUpload(
                                "post-image",
                                e.target.files?.[0] ?? null,
                                (value) => setNewPost((p) => ({ ...p, cover_image_url: value })),
                              )
                            }
                          />
                          <p className="mt-1 text-xs text-muted-foreground">
                            Paste an image URL or upload an insight cover image from your computer.
                          </p>
                        </div>
                        {newPost.cover_image_url ? (
                          <div className="space-y-2">
                            <Label>Preview</Label>
                            <img
                              src={newPost.cover_image_url}
                              alt="Insight cover preview"
                              className="h-32 w-full rounded-md border border-border object-cover"
                            />
                          </div>
                        ) : null}
                        <div>
                          <Label>Read Time (minutes)</Label>
                          <Input type="number" value={newPost.read_time_minutes} onChange={(e) => setNewPost((p) => ({ ...p, read_time_minutes: e.target.value }))} />
                        </div>
                        <label className="flex items-center gap-2 text-sm">
                          <input
                            type="checkbox"
                            checked={newPost.is_members_only}
                            onChange={(e) => setNewPost((p) => ({ ...p, is_members_only: e.target.checked }))}
                          />
                          Members Only
                        </label>
                        <label className="flex items-center gap-2 text-sm">
                          <input type="checkbox" checked={newPost.is_published} onChange={(e) => setNewPost((p) => ({ ...p, is_published: e.target.checked }))} />
                          Published
                        </label>
                        <div className="flex gap-3">
                          <Button variant="gold" className="w-full" onClick={() => void savePost()} disabled={isSavingPost || uploadingField === "post-image"}>
                            {isSavingPost || uploadingField === "post-image" ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                            {editingPostId ? "Save Post" : "Create Post"}
                          </Button>
                          {editingPostId ? (
                            <Button variant="outline" className="w-full" onClick={resetPostForm}>
                              Cancel
                            </Button>
                          ) : null}
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {blogPosts.map((post) => (
                      <motion.div
                        key={post.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-secondary/30 transition-colors"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium">{post.title}</h4>
                            {!post.is_published && (
                              <Badge variant="secondary">Draft</Badge>
                            )}
                            {post.is_members_only ? <Badge className="bg-amber-500 text-black">Members Only</Badge> : null}
                          </div>
                          <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Eye size={14} /> {post.slug}
                            </span>
                            <span>Comments: {post.comments}</span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setEditingPostId(post.id);
                              setIsPostDialogOpen(true);
                              setNewPost({
                                title: post.title,
                                slug: post.slug,
                                excerpt: post.excerpt ?? "",
                                content: post.content,
                                tags: (post.tags ?? []).join(", "),
                                cover_image_url: post.cover_image_url ?? "",
                                read_time_minutes: String(post.read_time_minutes ?? 5),
                                is_members_only: Boolean(post.is_members_only),
                                is_published: Boolean(post.is_published),
                              });
                            }}
                          >
                            <FileText size={16} />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => void toggleVisibility("blog_posts", post)}
                          >
                            {post.is_published ? <EyeOff size={16} /> : <Eye size={16} />}
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-destructive"
                            onClick={() => void deleteContent("blog_posts", post.id, "Insight")}
                          >
                            <Trash2 size={16} />
                          </Button>
                        </div>
                      </motion.div>
                    ))}
                    {blogPosts.length === 0 ? (
                      <div className="rounded-lg border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
                        No insights yet. Create one here and it will appear in this list for editing, hiding, or deleting.
                      </div>
                    ) : null}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Testimonials Tab */}
            <TabsContent value="testimonials">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Manage Testimonials</CardTitle>
                  <Dialog
                    open={isTestimonialDialogOpen}
                    onOpenChange={(open) => {
                      setIsTestimonialDialogOpen(open);
                      if (!open) resetTestimonialForm();
                    }}
                  >
                    <DialogTrigger asChild>
                      <Button
                        variant="gold"
                        size="sm"
                        onClick={() => {
                          setEditingTestimonialId(null);
                          setIsTestimonialDialogOpen(true);
                        }}
                      >
                        <Plus size={16} className="mr-1" /> Add Testimonial
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>{editingTestimonialId ? "Edit Testimonial" : "Add Testimonial"}</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4 pr-1">
                        <div className="grid gap-4 md:grid-cols-2">
                          <div>
                            <Label>Name</Label>
                            <Input
                              value={newTestimonial.name}
                              onChange={(e) => setNewTestimonial((p) => ({ ...p, name: e.target.value }))}
                            />
                          </div>
                          <div>
                            <Label>Role</Label>
                            <Input
                              value={newTestimonial.role}
                              onChange={(e) => setNewTestimonial((p) => ({ ...p, role: e.target.value }))}
                              placeholder="Client, Founder, Manager"
                            />
                          </div>
                        </div>
                        <div className="grid gap-4 md:grid-cols-2">
                          <div>
                            <Label>Company</Label>
                            <Input
                              value={newTestimonial.company}
                              onChange={(e) => setNewTestimonial((p) => ({ ...p, company: e.target.value }))}
                            />
                          </div>
                          <div>
                            <Label>Rating</Label>
                            <Input
                              type="number"
                              min={1}
                              max={5}
                              value={newTestimonial.rating}
                              onChange={(e) => setNewTestimonial((p) => ({ ...p, rating: e.target.value }))}
                            />
                          </div>
                        </div>
                        <div>
                          <Label>Testimonial</Label>
                          <Textarea
                            rows={5}
                            value={newTestimonial.content}
                            onChange={(e) => setNewTestimonial((p) => ({ ...p, content: e.target.value }))}
                          />
                        </div>
                        <div>
                          <Label>Photo URL</Label>
                          <Input
                            value={newTestimonial.image_url}
                            onChange={(e) => setNewTestimonial((p) => ({ ...p, image_url: e.target.value }))}
                            placeholder="Optional"
                          />
                        </div>
                        <div>
                          <Label>Upload photo from computer</Label>
                          <Input
                            type="file"
                            accept="image/*"
                            onChange={(e) =>
                              void handleImageUpload(
                                "testimonial-image",
                                e.target.files?.[0] ?? null,
                                (value) => setNewTestimonial((p) => ({ ...p, image_url: value })),
                              )
                            }
                          />
                        </div>
                        {newTestimonial.image_url ? (
                          <img
                            src={newTestimonial.image_url}
                            alt="Testimonial preview"
                            className="h-20 w-20 rounded-full border border-border object-cover"
                          />
                        ) : null}
                        <div className="grid gap-4 md:grid-cols-2">
                          <div>
                            <Label>Display Order</Label>
                            <Input
                              type="number"
                              value={newTestimonial.display_order}
                              onChange={(e) => setNewTestimonial((p) => ({ ...p, display_order: e.target.value }))}
                            />
                          </div>
                          <label className="flex items-end gap-2 text-sm">
                            <input
                              type="checkbox"
                              checked={newTestimonial.is_published}
                              onChange={(e) => setNewTestimonial((p) => ({ ...p, is_published: e.target.checked }))}
                            />
                            Published
                          </label>
                        </div>
                        <div className="flex gap-3">
                          <Button
                            variant="gold"
                            className="w-full"
                            onClick={() => void saveTestimonial()}
                            disabled={isSavingTestimonial || uploadingField === "testimonial-image"}
                          >
                            {isSavingTestimonial || uploadingField === "testimonial-image" ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                            {editingTestimonialId ? "Save Testimonial" : "Add Testimonial"}
                          </Button>
                          {editingTestimonialId ? (
                            <Button variant="outline" className="w-full" onClick={resetTestimonialForm}>
                              Cancel
                            </Button>
                          ) : null}
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {testimonials.map((testimonial) => (
                      <motion.div
                        key={testimonial.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="space-y-3 rounded-lg border border-border p-4 transition-colors hover:bg-secondary/30"
                      >
                        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                          <div>
                            <div className="flex flex-wrap items-center gap-2">
                              <h4 className="font-medium">{testimonial.name}</h4>
                              {!testimonial.is_published ? <Badge variant="secondary">Draft</Badge> : null}
                              <Badge variant="outline">{testimonial.rating}/5</Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {[testimonial.role, testimonial.company].filter(Boolean).join(", ") || "No role/company"}
                            </p>
                            <p className="mt-2 text-sm">{testimonial.content}</p>
                          </div>
                          <div className="flex gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                className="gap-2"
                                onClick={() => {
                                  setEditingTestimonialId(testimonial.id);
                                  setIsTestimonialDialogOpen(true);
                                setNewTestimonial({
                                  name: testimonial.name,
                                  role: testimonial.role ?? "",
                                  company: testimonial.company ?? "",
                                  content: testimonial.content,
                                  rating: String(testimonial.rating),
                                  image_url: testimonial.image_url ?? "",
                                  display_order: String(testimonial.display_order ?? 0),
                                  is_published: Boolean(testimonial.is_published),
                                });
                              }}
                            >
                              <Star size={16} />
                              Edit
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="gap-2"
                              onClick={() => void toggleVisibility("testimonials", testimonial)}
                            >
                              {testimonial.is_published ? <EyeOff size={16} /> : <Eye size={16} />}
                              {testimonial.is_published ? "Hide" : "Publish"}
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-destructive"
                              onClick={() => void deleteContent("testimonials", testimonial.id, "Testimonial")}
                            >
                              <Trash2 size={16} />
                              Delete
                            </Button>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                    {testimonials.length === 0 ? (
                      <div className="rounded-lg border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
                        No testimonials yet. Add a real client testimonial here and publish it to the Testimonials page.
                      </div>
                    ) : null}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Gallery Tab */}
            <TabsContent value="gallery">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Manage Gallery</CardTitle>
                  <Dialog
                    open={isGalleryDialogOpen}
                    onOpenChange={(open) => {
                      setIsGalleryDialogOpen(open);
                      if (!open) resetGalleryItemForm();
                    }}
                  >
                    <DialogTrigger asChild>
                      <Button
                        variant="gold"
                        size="sm"
                        onClick={() => {
                          setEditingGalleryItemId(null);
                          setIsGalleryDialogOpen(true);
                        }}
                      >
                        <Plus size={16} className="mr-1" /> Add Photo
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>{editingGalleryItemId ? "Edit Gallery Photo" : "Add Gallery Photo"}</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4 pr-1">
                        <div className="grid gap-4 md:grid-cols-2">
                          <div>
                            <Label>Title</Label>
                            <Input
                              value={newGalleryItem.title}
                              onChange={(e) => setNewGalleryItem((p) => ({ ...p, title: e.target.value }))}
                              placeholder="Workshop moment"
                            />
                          </div>
                          <div>
                            <Label>Category</Label>
                            <Input
                              value={newGalleryItem.category}
                              onChange={(e) => setNewGalleryItem((p) => ({ ...p, category: e.target.value }))}
                              placeholder="Workshop, Program, Speaking"
                            />
                          </div>
                        </div>
                        <div>
                          <Label>Image URL</Label>
                          <Input
                            value={newGalleryItem.image_url}
                            onChange={(e) => setNewGalleryItem((p) => ({ ...p, image_url: e.target.value }))}
                            placeholder="Paste image URL or upload below"
                          />
                        </div>
                        <div>
                          <Label>Upload photo from computer</Label>
                          <Input
                            type="file"
                            accept="image/*"
                            onChange={(e) =>
                              void handleImageUpload(
                                "gallery-image",
                                e.target.files?.[0] ?? null,
                                (value) => setNewGalleryItem((p) => ({ ...p, image_url: value })),
                              )
                            }
                          />
                        </div>
                        {newGalleryItem.image_url ? (
                          <img
                            src={newGalleryItem.image_url}
                            alt="Gallery preview"
                            className="h-40 w-full rounded-md border border-border object-cover"
                          />
                        ) : null}
                        <div className="grid gap-4 md:grid-cols-2">
                          <div>
                            <Label>Display Order</Label>
                            <Input
                              type="number"
                              value={newGalleryItem.display_order}
                              onChange={(e) => setNewGalleryItem((p) => ({ ...p, display_order: e.target.value }))}
                            />
                          </div>
                          <label className="flex items-end gap-2 text-sm">
                            <input
                              type="checkbox"
                              checked={newGalleryItem.is_published}
                              onChange={(e) => setNewGalleryItem((p) => ({ ...p, is_published: e.target.checked }))}
                            />
                            Published
                          </label>
                        </div>
                        <div className="flex gap-3">
                          <Button
                            variant="gold"
                            className="w-full"
                            onClick={() => void saveGalleryItem()}
                            disabled={isSavingGalleryItem || uploadingField === "gallery-image"}
                          >
                            {isSavingGalleryItem || uploadingField === "gallery-image" ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                            {editingGalleryItemId ? "Save Photo" : "Add Photo"}
                          </Button>
                          {editingGalleryItemId ? (
                            <Button variant="outline" className="w-full" onClick={resetGalleryItemForm}>
                              Cancel
                            </Button>
                          ) : null}
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </CardHeader>
                <CardContent>
                  {galleryItems.length > 0 ? (
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                      {galleryItems.map((item) => (
                        <motion.div
                          key={item.id}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="overflow-hidden rounded-xl border border-border bg-card"
                        >
                          <div className="aspect-[4/3] bg-secondary">
                            <img
                              src={item.image_url}
                              alt={item.title || "Gallery photo"}
                              className="h-full w-full object-cover"
                            />
                          </div>
                          <div className="space-y-3 p-4">
                            <div>
                              <div className="flex items-center gap-2">
                                <h4 className="line-clamp-1 font-medium">{item.title || "Untitled photo"}</h4>
                                {!item.is_published ? <Badge variant="secondary">Draft</Badge> : null}
                              </div>
                              <p className="text-xs text-muted-foreground">
                                {item.category || "No category"} - Order {item.display_order ?? 0}
                              </p>
                            </div>
                            <div className="flex gap-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => {
                                  setEditingGalleryItemId(item.id);
                                  setIsGalleryDialogOpen(true);
                                  setNewGalleryItem({
                                    title: item.title ?? "",
                                    category: item.category ?? "",
                                    image_url: item.image_url,
                                    display_order: String(item.display_order ?? 0),
                                    is_published: Boolean(item.is_published),
                                  });
                                }}
                              >
                                <Image size={16} />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => void toggleVisibility("gallery", item)}
                              >
                                {item.is_published ? <EyeOff size={16} /> : <Eye size={16} />}
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="text-destructive"
                                onClick={() => void deleteContent("gallery", item.id, "Gallery photo")}
                              >
                                <Trash2 size={16} />
                              </Button>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  ) : (
                    <div className="rounded-lg border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
                      No gallery photos yet. Add photos here and they will appear on the public Gallery page.
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Users Tab */}
            <TabsContent value="consultations">
              <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Consultation Setup</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <h4 className="mb-3 font-medium">Services and Prices</h4>
                    <div className="grid gap-3 lg:grid-cols-2">
                      {consultationServices.map((service) => (
                        <div key={service.id} className="rounded-lg border border-border p-4 space-y-3">
                          <div className="grid gap-3 md:grid-cols-2">
                            <Input
                              value={service.title}
                              onChange={(e) => void updateConsultationService(service, "title", e.target.value)}
                            />
                            <Input
                              type="number"
                              value={service.price}
                              onChange={(e) => void updateConsultationService(service, "price", e.target.value)}
                            />
                          </div>
                          <Textarea
                            rows={2}
                            value={service.description}
                            onChange={(e) => void updateConsultationService(service, "description", e.target.value)}
                          />
                          <div className="grid gap-3 md:grid-cols-3">
                            <Input
                              type="number"
                              value={service.duration_minutes}
                              onChange={(e) => void updateConsultationService(service, "duration_minutes", e.target.value)}
                            />
                            <Input
                              type="number"
                              value={service.display_order ?? 0}
                              onChange={(e) => void updateConsultationService(service, "display_order", e.target.value)}
                            />
                            <label className="flex items-center gap-2 text-sm">
                              <input
                                type="checkbox"
                                checked={Boolean(service.is_published)}
                                onChange={(e) => void updateConsultationService(service, "is_published", e.target.checked)}
                              />
                              Published
                            </label>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-destructive"
                            onClick={() => void deleteContent("consultation_services", service.id, "Consultation service")}
                          >
                            <Trash2 size={16} />
                            Delete Service
                          </Button>
                        </div>
                      ))}
                    </div>
                    <div className="mt-4 grid gap-3 rounded-lg border border-dashed border-border p-4 lg:grid-cols-[1fr,1fr,1fr,120px,120px,auto]">
                      <Input placeholder="slug" value={newConsultationService.slug} onChange={(e) => setNewConsultationService((p) => ({ ...p, slug: e.target.value }))} />
                      <Input placeholder="Title" value={newConsultationService.title} onChange={(e) => setNewConsultationService((p) => ({ ...p, title: e.target.value }))} />
                      <Input placeholder="Description" value={newConsultationService.description} onChange={(e) => setNewConsultationService((p) => ({ ...p, description: e.target.value }))} />
                      <Input type="number" placeholder="Minutes" value={newConsultationService.duration_minutes} onChange={(e) => setNewConsultationService((p) => ({ ...p, duration_minutes: e.target.value }))} />
                      <Input type="number" placeholder="Price" value={newConsultationService.price} onChange={(e) => setNewConsultationService((p) => ({ ...p, price: e.target.value }))} />
                      <Button variant="gold" onClick={() => void saveConsultationService()}>Add</Button>
                    </div>
                  </div>

                  <div>
                    <h4 className="mb-3 font-medium">Available Date Blocks</h4>
                    <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                      {consultationDateBlocks.map((block) => (
                        <div key={block.id} className="rounded-lg border border-border p-4 space-y-3">
                          <Input
                            value={block.label}
                            onChange={(e) => void updateConsultationDateBlock(block, "label", e.target.value)}
                          />
                          <Input
                            type="date"
                            value={block.date_value}
                            onChange={(e) => void updateConsultationDateBlock(block, "date_value", e.target.value)}
                          />
                          <div className="flex items-center gap-3">
                            <Input
                              type="number"
                              value={block.display_order ?? 0}
                              onChange={(e) => void updateConsultationDateBlock(block, "display_order", e.target.value)}
                            />
                            <label className="flex items-center gap-2 text-sm">
                              <input
                                type="checkbox"
                                checked={Boolean(block.is_published)}
                                onChange={(e) => void updateConsultationDateBlock(block, "is_published", e.target.checked)}
                              />
                              Published
                            </label>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-destructive"
                            onClick={() => void deleteContent("consultation_date_blocks", block.id, "Date block")}
                          >
                            <Trash2 size={16} />
                            Delete Date
                          </Button>
                        </div>
                      ))}
                    </div>
                    <div className="mt-4 grid gap-3 rounded-lg border border-dashed border-border p-4 md:grid-cols-[1fr,1fr,120px,auto]">
                      <Input placeholder="Label e.g. Mon, May 25" value={newConsultationDateBlock.label} onChange={(e) => setNewConsultationDateBlock((p) => ({ ...p, label: e.target.value }))} />
                      <Input type="date" value={newConsultationDateBlock.date_value} onChange={(e) => setNewConsultationDateBlock((p) => ({ ...p, date_value: e.target.value }))} />
                      <Input type="number" placeholder="Order" value={newConsultationDateBlock.display_order} onChange={(e) => setNewConsultationDateBlock((p) => ({ ...p, display_order: e.target.value }))} />
                      <Button variant="gold" onClick={() => void saveConsultationDateBlock()}>Add Date</Button>
                    </div>
                  </div>

                  <div>
                    <h4 className="mb-3 font-medium">Available Time Blocks</h4>
                    <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                      {consultationTimeBlocks.map((block) => (
                        <div key={block.id} className="rounded-lg border border-border p-4 space-y-3">
                          <Input
                            value={block.label}
                            onChange={(e) => void updateConsultationTimeBlock(block, "label", e.target.value)}
                          />
                          <Input
                            type="time"
                            value={block.time_value}
                            onChange={(e) => void updateConsultationTimeBlock(block, "time_value", e.target.value)}
                          />
                          <div className="flex items-center gap-3">
                            <Input
                              type="number"
                              value={block.display_order ?? 0}
                              onChange={(e) => void updateConsultationTimeBlock(block, "display_order", e.target.value)}
                            />
                            <label className="flex items-center gap-2 text-sm">
                              <input
                                type="checkbox"
                                checked={Boolean(block.is_published)}
                                onChange={(e) => void updateConsultationTimeBlock(block, "is_published", e.target.checked)}
                              />
                              Published
                            </label>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-destructive"
                            onClick={() => void deleteContent("consultation_time_blocks", block.id, "Time block")}
                          >
                            <Trash2 size={16} />
                            Delete Time
                          </Button>
                        </div>
                      ))}
                    </div>
                    <div className="mt-4 grid gap-3 rounded-lg border border-dashed border-border p-4 md:grid-cols-[1fr,1fr,120px,auto]">
                      <Input placeholder="Label e.g. 9:00 AM" value={newConsultationTimeBlock.label} onChange={(e) => setNewConsultationTimeBlock((p) => ({ ...p, label: e.target.value }))} />
                      <Input type="time" value={newConsultationTimeBlock.time_value} onChange={(e) => setNewConsultationTimeBlock((p) => ({ ...p, time_value: e.target.value }))} />
                      <Input type="number" placeholder="Order" value={newConsultationTimeBlock.display_order} onChange={(e) => setNewConsultationTimeBlock((p) => ({ ...p, display_order: e.target.value }))} />
                      <Button variant="gold" onClick={() => void saveConsultationTimeBlock()}>Add Time</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Consultation Requests</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {consultations.length > 0 ? (
                      consultations.map((consultation) => {
                        const consultationUser = managedUsersMap.get(consultation.user_id);
                        const draft = consultationDrafts[consultation.id] ?? {
                          date: toLocalDateTimeInput(consultation.date),
                          status: consultation.status,
                        };

                        return (
                          <motion.div
                            key={consultation.id}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="space-y-4 rounded-lg border border-border p-4 transition-colors hover:bg-secondary/30"
                          >
                            <div className="flex items-start justify-between gap-4">
                              <div>
                                <div className="flex items-center gap-2">
                                  <h4 className="font-medium">
                                    {consultation.topic || "Consultation Request"}
                                  </h4>
                                  <Badge variant="outline">{consultation.status}</Badge>
                                </div>
                                <p className="text-sm text-muted-foreground">
                                  {consultationUser?.full_name || "Unnamed user"}
                                </p>
                                <p className="text-xs text-muted-foreground break-all">
                                  {consultation.user_id}
                                </p>
                                <p className="mt-2 text-sm text-muted-foreground">
                                  Requested / scheduled: {formatDateTime(consultation.date)}
                                </p>
                                {consultation.message ? (
                                  <p className="mt-2 text-sm whitespace-pre-wrap">
                                    {consultation.message}
                                  </p>
                                ) : null}
                              </div>
                              <p className="text-xs text-muted-foreground">
                                {formatDate(consultation.created_at)}
                              </p>
                            </div>

                            <div className="grid gap-3 md:grid-cols-[1fr_180px_auto]">
                              <div>
                                <Label>Consultation Time</Label>
                                <Input
                                  type="datetime-local"
                                  value={draft.date}
                                  onChange={(e) =>
                                    updateConsultationDraft(consultation.id, "date", e.target.value)
                                  }
                                />
                              </div>
                              <div>
                                <Label>Status</Label>
                                <select
                                  className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                                  value={draft.status}
                                  onChange={(e) =>
                                    updateConsultationDraft(consultation.id, "status", e.target.value)
                                  }
                                >
                                  <option value="pending">Pending</option>
                                  <option value="payment_pending">Payment Pending</option>
                                  <option value="confirmed">Confirmed</option>
                                  <option value="completed">Completed</option>
                                  <option value="cancelled">Cancelled</option>
                                </select>
                              </div>
                              <div className="flex items-end">
                                <div className="flex flex-wrap gap-2">
                                  <Button
                                    variant="gold"
                                    onClick={() => void saveConsultation(consultation.id)}
                                  >
                                    Save Consultation
                                  </Button>
                                  <Button
                                    variant="outline"
                                    className="gap-2 text-destructive"
                                    onClick={() => void deleteContent("consultations", consultation.id, "Consultation")}
                                  >
                                    <Trash2 size={14} />
                                    Delete
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        );
                      })
                    ) : (
                      <div className="rounded-lg border border-dashed border-border p-6 text-sm text-muted-foreground">
                        No consultation requests yet.
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
              </div>
            </TabsContent>

            {/* Users Tab */}
            <TabsContent value="users">
              <Card>
                <CardHeader>
                  <CardTitle>Users</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {managedUsers.map((managedUser) => (
                      <motion.div
                        key={managedUser.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="space-y-4 p-4 border border-border rounded-lg hover:bg-secondary/30 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center">
                            <Users className="w-5 h-5 text-muted-foreground" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="font-medium">{managedUser.full_name || "Unnamed user"}</h4>
                              {managedUser.role ? <Badge className="bg-primary text-primary-foreground">{managedUser.role}</Badge> : null}
                              <Badge variant="outline">{managedUser.membership_tier}</Badge>
                              {managedUser.id === user.id ? <Badge variant="outline">Current</Badge> : null}
                            </div>
                            <p className="text-sm text-muted-foreground break-all">{managedUser.id}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <select
                            className="h-10 rounded-md border border-input bg-background px-3 text-sm"
                            value={managedUser.role ?? "user"}
                            onChange={(e) => void updateUserRole(managedUser.id, e.target.value as AppRole)}
                            disabled={roleUpdatingId === managedUser.id}
                          >
                            <option value="user">User</option>
                            <option value="moderator">Moderator</option>
                            <option value="admin">Admin</option>
                            <option value="owner">Owner</option>
                          </select>
                          {roleUpdatingId === managedUser.id ? <Loader2 className="h-4 w-4 animate-spin text-primary" /> : null}
                          <select
                            className="h-10 rounded-md border border-input bg-background px-3 text-sm"
                            value={managedUser.membership_tier}
                            onChange={(e) => void updateMembershipTier(managedUser.id, e.target.value as "free" | "premium")}
                            disabled={membershipUpdatingId === managedUser.id}
                          >
                            <option value="free">Free</option>
                            <option value="premium">Premium</option>
                          </select>
                          {membershipUpdatingId === managedUser.id ? <Loader2 className="h-4 w-4 animate-spin text-primary" /> : null}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Messages Tab */}
            <TabsContent value="messages">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between gap-4">
                  <div>
                    <CardTitle>Contact Messages</CardTitle>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {unreadMessagesCount} unread of {messages.length} total messages
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant={messageFilter === "unread" ? "gold" : "outline"}
                      size="sm"
                      onClick={() => setMessageFilter("unread")}
                    >
                      Unread
                    </Button>
                    <Button
                      variant={messageFilter === "all" ? "gold" : "outline"}
                      size="sm"
                      onClick={() => setMessageFilter("all")}
                    >
                      All
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {visibleMessages.length > 0 ? (
                      visibleMessages.map((msg) => (
                      <motion.div
                        key={msg.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className={`p-4 border rounded-lg transition-colors ${
                          msg.isRead
                            ? "border-border"
                            : "border-primary/50 bg-primary/5"
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="font-medium">{msg.name}</h4>
                              {!msg.isRead && (
                                <Badge variant="default" className="text-xs">
                                  New
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {msg.email}
                            </p>
                            <p className="text-sm mt-2">{msg.message}</p>
                          </div>
                          <p className="text-xs text-muted-foreground">{msg.date}</p>
                        </div>
                        <div className="mt-3 flex flex-wrap gap-2">
                          <Button variant="gold" size="sm" asChild>
                            <a href={buildReplyMailtoLink(msg.email, `Website enquiry from ${msg.name}`)}>
                              <Mail size={14} className="mr-1" />
                              Reply by Email
                            </a>
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => void toggleMessageRead(msg)}>
                            Mark as {msg.isRead ? "Unread" : "Read"}
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="gap-2 text-destructive"
                            onClick={() => void deleteContent("contact_messages", msg.id, "Message")}
                          >
                            <Trash2 size={14} />
                            Delete
                          </Button>
                        </div>
                      </motion.div>
                      ))
                    ) : (
                      <div className="rounded-lg border border-dashed border-border p-6 text-sm text-muted-foreground">
                        {messageFilter === "unread"
                          ? "No unread messages right now."
                          : "No contact messages yet."}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </section>
      </AdminSectionErrorBoundary>
    </Layout>
  );
};

export default AdminDashboard;

