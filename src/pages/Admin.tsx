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
  Crown,
  DollarSign,
  BarChart3,
  PieChart,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  Loader2,
  Save,
} from "lucide-react";
import { useEffect, useState } from "react";
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

// Mock data for charts
const salesData = [
  { month: "Jan", bookings: 65, sales: 4500 },
  { month: "Feb", bookings: 78, sales: 5200 },
  { month: "Mar", bookings: 92, sales: 6100 },
  { month: "Apr", bookings: 84, sales: 5800 },
  { month: "May", bookings: 110, sales: 7200 },
  { month: "Jun", bookings: 125, sales: 8500 },
];

const bookSalesData = [
  { name: "The Power of Mind", sales: 234, revenue: 4446 },
  { name: "Lead with Heart", sales: 189, revenue: 4536 },
  { name: "Mindset Mastery", sales: 156, revenue: 3432 },
  { name: "Success Blueprint", sales: 98, revenue: 1764 },
];

const membershipData = [
  { name: "Free", value: 2847, color: "#6B7280" },
  { name: "Premium", value: 423, color: "#EAB308" },
];

const eventBookingsData = [
  { event: "Masterclass", booked: 373, capacity: 500 },
  { event: "Weekend Intensive", booked: 211, capacity: 300 },
  { event: "Leadership Summit", booked: 44, capacity: 200 },
  { event: "Online Workshop", booked: 892, capacity: 1000 },
];

// Mock users with premium status
const mockUsers = [
  { id: 1, name: "Sarah Johnson", email: "sarah@email.com", isPremium: true, joinedAt: "2025-12-01" },
  { id: 2, name: "Michael Chen", email: "michael@email.com", isPremium: false, joinedAt: "2025-11-15" },
  { id: 3, name: "Emma Williams", email: "emma@email.com", isPremium: true, joinedAt: "2025-10-22" },
  { id: 4, name: "James Brown", email: "james@email.com", isPremium: false, joinedAt: "2026-01-02" },
  { id: 5, name: "Olivia Davis", email: "olivia@email.com", isPremium: true, joinedAt: "2025-09-18" },
  { id: 6, name: "William Taylor", email: "william@email.com", isPremium: false, joinedAt: "2025-08-30" },
];

// Mock events
const mockEvents = [
  { id: 1, title: "Mind Architecture Masterclass", date: "2026-02-15", venue: "Melbourne", price: 299, totalSeats: 500, bookedSeats: 373, isPublished: true },
  { id: 2, title: "Breakthrough Weekend Intensive", date: "2026-03-22", venue: "Sydney", price: 599, totalSeats: 300, bookedSeats: 211, isPublished: true },
  { id: 3, title: "Corporate Leadership Summit", date: "2026-04-10", venue: "Brisbane", price: 449, totalSeats: 200, bookedSeats: 44, isPublished: false },
];

// Mock books
const mockBooks = [
  { id: 1, title: "The Power of Mind", author: "Dr. Sarah Mitchell", price: 19, stock: 234, sold: 234, isPublished: true },
  { id: 2, title: "Lead with Heart", author: "Dr. Sarah Mitchell", price: 24, stock: 156, sold: 189, isPublished: true },
  { id: 3, title: "Mindset Mastery", author: "Dr. Sarah Mitchell", price: 22, stock: 89, sold: 156, isPublished: true },
];

// Mock orders
const mockOrders = [
  { id: "ORD-001", customer: "Sarah Johnson", items: 2, total: 43, status: "completed", date: "2026-01-07" },
  { id: "ORD-002", customer: "Michael Chen", items: 1, total: 19, status: "processing", date: "2026-01-06" },
  { id: "ORD-003", customer: "Emma Williams", items: 3, total: 65, status: "completed", date: "2026-01-05" },
  { id: "ORD-004", customer: "James Brown", items: 1, total: 24, status: "shipped", date: "2026-01-04" },
];

// Mock blog posts
const mockBlogPosts = [
  { id: 1, title: "5 Morning Rituals for Peak Performance", views: 12450, likes: 892, comments: 156, isPublished: true },
  { id: 2, title: "The Science of Positive Thinking", views: 8920, likes: 654, comments: 98, isPublished: true },
  { id: 3, title: "Building Resilience in Challenging Times", views: 6780, likes: 423, comments: 67, isPublished: false },
];

// Mock messages
const mockMessages = [
  { id: 1, name: "Jennifer Smith", email: "jen@email.com", message: "I would like to know more about corporate workshops...", isRead: false, date: "2026-01-07" },
  { id: 2, name: "Robert Johnson", email: "rob@email.com", message: "Amazing event last week! Thank you for the inspiration.", isRead: true, date: "2026-01-05" },
];

type AppRole = Database["public"]["Enums"]["app_role"];
type EventRow = Database["public"]["Tables"]["events"]["Row"];
type BookRow = Database["public"]["Tables"]["books"]["Row"];
type BlogPostRow = Database["public"]["Tables"]["blog_posts"]["Row"];
type ContactMessageRow = Database["public"]["Tables"]["contact_messages"]["Row"];
type OrderRow = Database["public"]["Tables"]["orders"]["Row"];
type ProfileRow = Database["public"]["Tables"]["profiles"]["Row"];

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
  const offset = date.getTimezoneOffset();
  return new Date(date.getTime() - offset * 60000).toISOString().slice(0, 16);
};

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

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { user, isLoading, isAdmin, role, signOut } = useAuth();
  const [isRefreshing, setIsRefreshing] = useState(true);
  const [events, setEvents] = useState<any[]>([]);
  const [books, setBooks] = useState<any[]>([]);
  const [blogPosts, setBlogPosts] = useState<any[]>([]);
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [managedUsers, setManagedUsers] = useState<ManagedUser[]>([]);
  const [trackingDrafts, setTrackingDrafts] = useState<Record<string, { trackingNumber: string; carrier: string }>>({});
  const [editingEventId, setEditingEventId] = useState<string | null>(null);
  const [editingBookId, setEditingBookId] = useState<string | null>(null);
  const [editingPostId, setEditingPostId] = useState<string | null>(null);
  const [isEventDialogOpen, setIsEventDialogOpen] = useState(false);
  const [isBookDialogOpen, setIsBookDialogOpen] = useState(false);
  const [isPostDialogOpen, setIsPostDialogOpen] = useState(false);
  const [isSavingEvent, setIsSavingEvent] = useState(false);
  const [isSavingBook, setIsSavingBook] = useState(false);
  const [isSavingPost, setIsSavingPost] = useState(false);
  const [uploadingField, setUploadingField] = useState<string | null>(null);
  const [roleUpdatingId, setRoleUpdatingId] = useState<string | null>(null);
  const [membershipUpdatingId, setMembershipUpdatingId] = useState<string | null>(null);
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

  // Stats
  const stats = [
    {
      label: "Total Users",
      value: "3,270",
      icon: Users,
      change: "+12.5%",
      isPositive: true,
    },
    {
      label: "Premium Members",
      value: "423",
      icon: Crown,
      change: "+8.2%",
      isPositive: true,
      highlight: true,
    },
    {
      label: "Total Events",
      value: "12",
      icon: Calendar,
      change: "+2",
      isPositive: true,
    },
    {
      label: "Books Sold",
      value: "579",
      icon: BookOpen,
      change: "+18.3%",
      isPositive: true,
    },
    {
      label: "Revenue",
      value: "$45,280",
      icon: DollarSign,
      change: "+23.1%",
      isPositive: true,
    },
    {
      label: "Unread Messages",
      value: "8",
      icon: Mail,
      change: "-3",
      isPositive: false,
    },
  ];

  useEffect(() => {
    if (!isLoading && user && isAdmin) {
      void loadAdminData();
    }
  }, [isLoading, user, isAdmin]);

  const loadAdminData = async () => {
    setIsRefreshing(true);
    try {
      const [
        eventsResult,
        booksResult,
        blogPostsResult,
        ordersResult,
        messagesResult,
        profilesResult,
        rolesResult,
      ] = await Promise.all([
        supabase.from("events").select("*").order("date", { ascending: false }),
        supabase.from("books").select("*").order("created_at", { ascending: false }),
        supabase.from("blog_posts").select("*").order("updated_at", { ascending: false }),
        supabase.from("orders").select("*").order("created_at", { ascending: false }),
        supabase.from("contact_messages").select("*").order("created_at", { ascending: false }),
        supabase.from("profiles").select("*").order("created_at", { ascending: false }),
        supabase.from("user_roles").select("*"),
      ]);

      for (const result of [
        eventsResult,
        booksResult,
        blogPostsResult,
        ordersResult,
        messagesResult,
        profilesResult,
        rolesResult,
      ]) {
        if (result.error) throw result.error;
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
      setBlogPosts(
        (blogPostsResult.data ?? []).map((post) => ({
          ...post,
          isPublished: post.is_published,
          views: 0,
          likes: 0,
          comments: 0,
        })),
      );
      const loadedOrders = ordersResult.data ?? [];
      setOrders(loadedOrders);
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
          date: new Date(message.created_at).toLocaleDateString(),
        })),
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

      toast.success(editingEventId ? "Event updated" : "Event created");
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
      toast.error("Please complete the required blog fields");
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

      toast.success(editingPostId ? "Blog post updated" : "Blog post created");
      resetPostForm();
      await loadAdminData();
    } catch (error) {
      console.error("Failed to save blog post:", error);
      const message = getErrorMessage(error) || "Unknown error";
      toast.error(`Failed to save blog post: ${message}`);
    } finally {
      setIsSavingPost(false);
    }
  };

  const toggleVisibility = async (
    table: "events" | "books" | "blog_posts",
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
    table: "events" | "books" | "blog_posts",
    id: string,
    label: string,
  ) => {
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
                    <div className="flex items-center justify-between mt-1">
                      <p className="text-xs text-muted-foreground">
                        {stat.label}
                      </p>
                      <span
                        className={`flex items-center text-xs font-medium ${
                          stat.isPositive ? "text-green-600" : "text-red-500"
                        }`}
                      >
                        {stat.isPositive ? (
                          <ArrowUpRight className="w-3 h-3" />
                        ) : (
                          <ArrowDownRight className="w-3 h-3" />
                        )}
                        {stat.change}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Charts Section */}
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
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            {/* Event Bookings Chart */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Activity className="w-5 h-5 text-primary" />
                  Event Bookings
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[250px]">
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
                <div className="space-y-4">
                  {bookSalesData.map((book, i) => (
                    <div
                      key={i}
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
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Dashboard Content */}
      <section className="section-padding bg-background">
        <div className="container-wide">
          <Tabs defaultValue="events" className="space-y-8">
            <TabsList className="flex flex-wrap gap-2">
              <TabsTrigger value="events">
                <Calendar className="w-4 h-4 mr-1" />
                Events
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
                Blog
              </TabsTrigger>
              <TabsTrigger value="users">
                <Users className="w-4 h-4 mr-1" />
                Users
              </TabsTrigger>
              <TabsTrigger value="messages">
                <Mail className="w-4 h-4 mr-1" />
                Messages
              </TabsTrigger>
            </TabsList>

            {/* Events Tab */}
            <TabsContent value="events">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Manage Events</CardTitle>
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
                        <Plus size={16} className="mr-1" /> Add Event
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>{editingEventId ? "Edit Event" : "Create New Event"}</DialogTitle>
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
                              alt="Event preview"
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
                            {editingEventId ? "Save Event" : "Create Event"}
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
                    {events.map((event) => (
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
                            {event.date} • {event.venue}
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
                            onClick={() => void deleteContent("events", event.id, "Event")}
                          >
                            <Trash2 size={16} />
                          </Button>
                        </div>
                      </motion.div>
                    ))}
                    {events.length === 0 ? (
                      <div className="rounded-lg border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
                        No events yet. Add your first event here, then manage it from this list with edit, hide, or delete.
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
                  <CardTitle>Recent Orders</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {orders.map((order) => (
                      <motion.div
                        key={order.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="space-y-4 p-4 border border-border rounded-lg hover:bg-secondary/30 transition-colors"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium">Order #{order.id.slice(0, 8).toUpperCase()}</h4>
                            <Badge
                              variant={
                                order.status === "paid"
                                  ? "default"
                                  : order.status === "delivered"
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
                          <p className="text-xs text-muted-foreground">{new Date(order.created_at).toLocaleDateString()}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-primary">${order.total_amount}</p>
                        </div>
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
                      </motion.div>
                    ))}
                    {orders.length === 0 ? (
                      <div className="rounded-lg border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
                        No orders yet. When a user buys a book, you can add their Australia Post tracking details here.
                      </div>
                    ) : null}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Blog Tab */}
            <TabsContent value="blog">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Blog Posts</CardTitle>
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
                        <DialogTitle>{editingPostId ? "Edit Blog Post" : "Create Blog Post"}</DialogTitle>
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
                            Paste an image URL or upload a blog cover image from your computer.
                          </p>
                        </div>
                        {newPost.cover_image_url ? (
                          <div className="space-y-2">
                            <Label>Preview</Label>
                            <img
                              src={newPost.cover_image_url}
                              alt="Blog cover preview"
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
                            <span>❤️ {post.likes}</span>
                            <span>💬 {post.comments}</span>
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
                            onClick={() => void deleteContent("blog_posts", post.id, "Blog post")}
                          >
                            <Trash2 size={16} />
                          </Button>
                        </div>
                      </motion.div>
                    ))}
                    {blogPosts.length === 0 ? (
                      <div className="rounded-lg border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
                        No blog posts yet. Create one here and it will appear in this list for editing, hiding, or deleting.
                      </div>
                    ) : null}
                  </div>
                </CardContent>
              </Card>
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
                <CardHeader>
                  <CardTitle>Contact Messages</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {messages.map((msg) => (
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
                        <Button variant="outline" size="sm" className="mt-3" onClick={() => void toggleMessageRead(msg)}>
                          Mark as {msg.isRead ? "Unread" : "Read"}
                        </Button>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </section>
    </Layout>
  );
};

export default AdminDashboard;

