import { Layout } from "@/components/layout/Layout";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  Users, Calendar, BookOpen, ShoppingBag, FileText, 
  MessageSquare, Image, Plus, Trash2, Edit, Eye, EyeOff,
  Mail, Settings, TrendingUp
} from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { format } from "date-fns";

const AdminDashboard = () => {
  const { user, isAdmin, isLoading } = useAuth();
  const navigate = useNavigate();
  
  // Data states
  const [users, setUsers] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [books, setBooks] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [blogPosts, setBlogPosts] = useState<any[]>([]);
  const [contactMessages, setContactMessages] = useState<any[]>([]);
  const [eventBookings, setEventBookings] = useState<any[]>([]);
  const [consultations, setConsultations] = useState<any[]>([]);
  
  // Form states
  const [newEvent, setNewEvent] = useState({ title: "", description: "", date: "", venue: "", price: "", total_seats: "" });
  const [newBook, setNewBook] = useState({ title: "", description: "", author: "", price: "", category: "", stock: "" });
  const [editingEvent, setEditingEvent] = useState<any>(null);
  const [editingBook, setEditingBook] = useState<any>(null);

  useEffect(() => {
    if (!isLoading && (!user || !isAdmin)) {
      navigate("/");
      toast.error("Access denied. Admin privileges required.");
    }
  }, [user, isAdmin, isLoading, navigate]);

  useEffect(() => {
    if (user && isAdmin) {
      fetchAllData();
    }
  }, [user, isAdmin]);

  const fetchAllData = async () => {
    // Fetch users/profiles
    const { data: profilesData } = await supabase.from("profiles").select("*");
    if (profilesData) setUsers(profilesData);

    // Fetch events
    const { data: eventsData } = await supabase.from("events").select("*").order("date");
    if (eventsData) setEvents(eventsData);

    // Fetch books
    const { data: booksData } = await supabase.from("books").select("*");
    if (booksData) setBooks(booksData);

    // Fetch orders with items
    const { data: ordersData } = await supabase
      .from("orders")
      .select("*, order_items(*, book:books(title))")
      .order("created_at", { ascending: false });
    if (ordersData) setOrders(ordersData);

    // Fetch blog posts
    const { data: postsData } = await supabase.from("blog_posts").select("*").order("created_at", { ascending: false });
    if (postsData) setBlogPosts(postsData);

    // Fetch contact messages
    const { data: messagesData } = await supabase.from("contact_messages").select("*").order("created_at", { ascending: false });
    if (messagesData) setContactMessages(messagesData);

    // Fetch event bookings
    const { data: bookingsData } = await supabase
      .from("event_bookings")
      .select("*, event:events(title)")
      .order("created_at", { ascending: false });
    if (bookingsData) setEventBookings(bookingsData);

    // Fetch consultations
    const { data: consultationsData } = await supabase.from("consultations").select("*").order("created_at", { ascending: false });
    if (consultationsData) setConsultations(consultationsData);
  };

  // Event CRUD
  const handleCreateEvent = async () => {
    const { error } = await supabase.from("events").insert({
      title: newEvent.title,
      description: newEvent.description,
      date: newEvent.date,
      venue: newEvent.venue,
      price: parseFloat(newEvent.price),
      total_seats: parseInt(newEvent.total_seats),
      available_seats: parseInt(newEvent.total_seats),
    });
    if (error) {
      toast.error("Failed to create event");
    } else {
      toast.success("Event created");
      setNewEvent({ title: "", description: "", date: "", venue: "", price: "", total_seats: "" });
      fetchAllData();
    }
  };

  const handleDeleteEvent = async (id: string) => {
    const { error } = await supabase.from("events").delete().eq("id", id);
    if (error) {
      toast.error("Failed to delete event");
    } else {
      toast.success("Event deleted");
      fetchAllData();
    }
  };

  const handleToggleEventPublished = async (id: string, currentStatus: boolean) => {
    const { error } = await supabase.from("events").update({ is_published: !currentStatus }).eq("id", id);
    if (error) {
      toast.error("Failed to update event");
    } else {
      toast.success("Event updated");
      fetchAllData();
    }
  };

  // Book CRUD
  const handleCreateBook = async () => {
    const { error } = await supabase.from("books").insert({
      title: newBook.title,
      description: newBook.description,
      author: newBook.author,
      price: parseFloat(newBook.price),
      category: newBook.category,
      stock: parseInt(newBook.stock),
    });
    if (error) {
      toast.error("Failed to create book");
    } else {
      toast.success("Book created");
      setNewBook({ title: "", description: "", author: "", price: "", category: "", stock: "" });
      fetchAllData();
    }
  };

  const handleDeleteBook = async (id: string) => {
    const { error } = await supabase.from("books").delete().eq("id", id);
    if (error) {
      toast.error("Failed to delete book");
    } else {
      toast.success("Book deleted");
      fetchAllData();
    }
  };

  const handleToggleBookPublished = async (id: string, currentStatus: boolean) => {
    const { error } = await supabase.from("books").update({ is_published: !currentStatus }).eq("id", id);
    if (error) {
      toast.error("Failed to update book");
    } else {
      toast.success("Book updated");
      fetchAllData();
    }
  };

  // Blog Post toggle
  const handleToggleBlogPublished = async (id: string, currentStatus: boolean) => {
    const { error } = await supabase.from("blog_posts").update({ 
      is_published: !currentStatus,
      published_at: !currentStatus ? new Date().toISOString() : null
    }).eq("id", id);
    if (error) {
      toast.error("Failed to update blog post");
    } else {
      toast.success("Blog post updated");
      fetchAllData();
    }
  };

  // Update order status
  const handleUpdateOrderStatus = async (id: string, status: string) => {
    const { error } = await supabase.from("orders").update({ status }).eq("id", id);
    if (error) {
      toast.error("Failed to update order");
    } else {
      toast.success("Order updated");
      fetchAllData();
    }
  };

  // Update consultation status
  const handleUpdateConsultationStatus = async (id: string, status: string) => {
    const { error } = await supabase.from("consultations").update({ status }).eq("id", id);
    if (error) {
      toast.error("Failed to update consultation");
    } else {
      toast.success("Consultation updated");
      fetchAllData();
    }
  };

  // Mark message as read
  const handleMarkMessageRead = async (id: string) => {
    const { error } = await supabase.from("contact_messages").update({ is_read: true }).eq("id", id);
    if (error) {
      toast.error("Failed to update message");
    } else {
      fetchAllData();
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <section className="pt-32 pb-16 min-h-screen bg-background">
          <div className="container-wide">
            <p>Loading...</p>
          </div>
        </section>
      </Layout>
    );
  }

  if (!user || !isAdmin) {
    return null;
  }

  // Stats
  const stats = [
    { label: "Total Users", value: users.length, icon: Users },
    { label: "Events", value: events.length, icon: Calendar },
    { label: "Books", value: books.length, icon: BookOpen },
    { label: "Orders", value: orders.length, icon: ShoppingBag },
    { label: "Blog Posts", value: blogPosts.length, icon: FileText },
    { label: "Messages", value: contactMessages.filter(m => !m.is_read).length, icon: Mail },
  ];

  return (
    <Layout>
      {/* Hero */}
      <section className="pt-32 pb-8 bg-gradient-hero text-cream">
        <div className="container-wide">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <span className="text-primary font-medium tracking-widest uppercase text-sm">
              Admin Dashboard
            </span>
            <h1 className="text-4xl md:text-5xl font-heading font-bold mt-4">
              Manage Your
              <span className="text-gradient-gold"> Platform</span>
            </h1>
          </motion.div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-8 bg-background border-b border-border">
        <div className="container-wide">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {stats.map((stat, i) => (
              <Card key={i}>
                <CardContent className="p-4 text-center">
                  <stat.icon className="w-6 h-6 text-primary mx-auto mb-2" />
                  <p className="text-2xl font-bold">{stat.value}</p>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Dashboard Content */}
      <section className="section-padding bg-background">
        <div className="container-wide">
          <Tabs defaultValue="events" className="space-y-8">
            <TabsList className="flex flex-wrap gap-2">
              <TabsTrigger value="events"><Calendar className="w-4 h-4 mr-1" />Events</TabsTrigger>
              <TabsTrigger value="bookings"><TrendingUp className="w-4 h-4 mr-1" />Bookings</TabsTrigger>
              <TabsTrigger value="books"><BookOpen className="w-4 h-4 mr-1" />Books</TabsTrigger>
              <TabsTrigger value="orders"><ShoppingBag className="w-4 h-4 mr-1" />Orders</TabsTrigger>
              <TabsTrigger value="blog"><FileText className="w-4 h-4 mr-1" />Blog</TabsTrigger>
              <TabsTrigger value="consultations"><MessageSquare className="w-4 h-4 mr-1" />Consultations</TabsTrigger>
              <TabsTrigger value="messages"><Mail className="w-4 h-4 mr-1" />Messages</TabsTrigger>
              <TabsTrigger value="users"><Users className="w-4 h-4 mr-1" />Users</TabsTrigger>
            </TabsList>

            {/* Events Tab */}
            <TabsContent value="events">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Manage Events</CardTitle>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="gold" size="sm"><Plus size={16} /> Add Event</Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader><DialogTitle>Create New Event</DialogTitle></DialogHeader>
                      <div className="space-y-4">
                        <div><Label>Title</Label><Input value={newEvent.title} onChange={e => setNewEvent(p => ({...p, title: e.target.value}))} /></div>
                        <div><Label>Description</Label><Textarea value={newEvent.description} onChange={e => setNewEvent(p => ({...p, description: e.target.value}))} /></div>
                        <div><Label>Date & Time</Label><Input type="datetime-local" value={newEvent.date} onChange={e => setNewEvent(p => ({...p, date: e.target.value}))} /></div>
                        <div><Label>Venue</Label><Input value={newEvent.venue} onChange={e => setNewEvent(p => ({...p, venue: e.target.value}))} /></div>
                        <div className="grid grid-cols-2 gap-4">
                          <div><Label>Price ($)</Label><Input type="number" value={newEvent.price} onChange={e => setNewEvent(p => ({...p, price: e.target.value}))} /></div>
                          <div><Label>Total Seats</Label><Input type="number" value={newEvent.total_seats} onChange={e => setNewEvent(p => ({...p, total_seats: e.target.value}))} /></div>
                        </div>
                        <Button variant="gold" className="w-full" onClick={handleCreateEvent}>Create Event</Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {events.map(event => (
                      <div key={event.id} className="flex items-center justify-between p-4 border border-border rounded-lg">
                        <div>
                          <h4 className="font-medium">{event.title}</h4>
                          <p className="text-sm text-muted-foreground">{format(new Date(event.date), "PPP")} • {event.venue}</p>
                          <p className="text-sm">${event.price} • {event.available_seats}/{event.total_seats} seats</p>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="ghost" size="icon" onClick={() => handleToggleEventPublished(event.id, event.is_published)}>
                            {event.is_published ? <Eye size={16} /> : <EyeOff size={16} />}
                          </Button>
                          <Button variant="ghost" size="icon" className="text-destructive" onClick={() => handleDeleteEvent(event.id)}>
                            <Trash2 size={16} />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Event Bookings Tab */}
            <TabsContent value="bookings">
              <Card>
                <CardHeader><CardTitle>Event Bookings</CardTitle></CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {eventBookings.map(booking => (
                      <div key={booking.id} className="flex items-center justify-between p-4 border border-border rounded-lg">
                        <div>
                          <h4 className="font-medium">{booking.event?.title}</h4>
                          <p className="text-sm text-muted-foreground">{booking.seats} seats • ${booking.total_amount}</p>
                          <p className="text-xs text-muted-foreground">{format(new Date(booking.created_at), "PPP")}</p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${booking.status === 'confirmed' ? 'bg-green-100 text-green-600' : 'bg-yellow-100 text-yellow-600'}`}>
                          {booking.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Books Tab */}
            <TabsContent value="books">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Manage Books</CardTitle>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="gold" size="sm"><Plus size={16} /> Add Book</Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader><DialogTitle>Create New Book</DialogTitle></DialogHeader>
                      <div className="space-y-4">
                        <div><Label>Title</Label><Input value={newBook.title} onChange={e => setNewBook(p => ({...p, title: e.target.value}))} /></div>
                        <div><Label>Author</Label><Input value={newBook.author} onChange={e => setNewBook(p => ({...p, author: e.target.value}))} /></div>
                        <div><Label>Description</Label><Textarea value={newBook.description} onChange={e => setNewBook(p => ({...p, description: e.target.value}))} /></div>
                        <div><Label>Category</Label><Input value={newBook.category} onChange={e => setNewBook(p => ({...p, category: e.target.value}))} /></div>
                        <div className="grid grid-cols-2 gap-4">
                          <div><Label>Price ($)</Label><Input type="number" value={newBook.price} onChange={e => setNewBook(p => ({...p, price: e.target.value}))} /></div>
                          <div><Label>Stock</Label><Input type="number" value={newBook.stock} onChange={e => setNewBook(p => ({...p, stock: e.target.value}))} /></div>
                        </div>
                        <Button variant="gold" className="w-full" onClick={handleCreateBook}>Create Book</Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {books.map(book => (
                      <div key={book.id} className="flex items-center justify-between p-4 border border-border rounded-lg">
                        <div>
                          <h4 className="font-medium">{book.title}</h4>
                          <p className="text-sm text-muted-foreground">by {book.author} • {book.category}</p>
                          <p className="text-sm">${book.price} • {book.stock} in stock</p>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="ghost" size="icon" onClick={() => handleToggleBookPublished(book.id, book.is_published)}>
                            {book.is_published ? <Eye size={16} /> : <EyeOff size={16} />}
                          </Button>
                          <Button variant="ghost" size="icon" className="text-destructive" onClick={() => handleDeleteBook(book.id)}>
                            <Trash2 size={16} />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Orders Tab */}
            <TabsContent value="orders">
              <Card>
                <CardHeader><CardTitle>Manage Orders</CardTitle></CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {orders.map(order => (
                      <div key={order.id} className="flex items-center justify-between p-4 border border-border rounded-lg">
                        <div>
                          <h4 className="font-medium">Order #{order.id.slice(0, 8).toUpperCase()}</h4>
                          <p className="text-sm text-muted-foreground">{order.order_items?.map((i: any) => i.book?.title).join(", ")}</p>
                          <p className="text-sm">${order.total_amount} • {format(new Date(order.created_at), "PPP")}</p>
                        </div>
                        <select 
                          value={order.status} 
                          onChange={(e) => handleUpdateOrderStatus(order.id, e.target.value)}
                          className="px-3 py-1 rounded border border-border text-sm"
                        >
                          <option value="pending">Pending</option>
                          <option value="paid">Paid</option>
                          <option value="shipped">Shipped</option>
                          <option value="delivered">Delivered</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Blog Tab */}
            <TabsContent value="blog">
              <Card>
                <CardHeader><CardTitle>Manage Blog Posts</CardTitle></CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {blogPosts.map(post => (
                      <div key={post.id} className="flex items-center justify-between p-4 border border-border rounded-lg">
                        <div>
                          <h4 className="font-medium">{post.title}</h4>
                          <p className="text-sm text-muted-foreground">{post.excerpt?.slice(0, 100)}...</p>
                          <p className="text-xs text-muted-foreground">{format(new Date(post.created_at), "PPP")}</p>
                        </div>
                        <Button variant="ghost" size="icon" onClick={() => handleToggleBlogPublished(post.id, post.is_published)}>
                          {post.is_published ? <Eye size={16} /> : <EyeOff size={16} />}
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Consultations Tab */}
            <TabsContent value="consultations">
              <Card>
                <CardHeader><CardTitle>Manage Consultations</CardTitle></CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {consultations.map(consultation => (
                      <div key={consultation.id} className="flex items-center justify-between p-4 border border-border rounded-lg">
                        <div>
                          <h4 className="font-medium">{consultation.topic || "Consultation"}</h4>
                          <p className="text-sm text-muted-foreground">{format(new Date(consultation.date), "PPP 'at' p")}</p>
                        </div>
                        <select 
                          value={consultation.status} 
                          onChange={(e) => handleUpdateConsultationStatus(consultation.id, e.target.value)}
                          className="px-3 py-1 rounded border border-border text-sm"
                        >
                          <option value="pending">Pending</option>
                          <option value="confirmed">Confirmed</option>
                          <option value="completed">Completed</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Messages Tab */}
            <TabsContent value="messages">
              <Card>
                <CardHeader><CardTitle>Contact Messages</CardTitle></CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {contactMessages.map(message => (
                      <div 
                        key={message.id} 
                        className={`p-4 border border-border rounded-lg ${!message.is_read ? 'bg-primary/5' : ''}`}
                        onClick={() => handleMarkMessageRead(message.id)}
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className="font-medium">{message.name}</h4>
                            <p className="text-sm text-muted-foreground">{message.email}</p>
                            <p className="text-sm mt-2">{message.message}</p>
                            <p className="text-xs text-muted-foreground mt-2">{format(new Date(message.created_at), "PPP")}</p>
                          </div>
                          {!message.is_read && (
                            <span className="w-2 h-2 bg-primary rounded-full" />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Users Tab */}
            <TabsContent value="users">
              <Card>
                <CardHeader><CardTitle>Registered Users</CardTitle></CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {users.map(user => (
                      <div key={user.id} className="flex items-center justify-between p-4 border border-border rounded-lg">
                        <div>
                          <h4 className="font-medium">{user.full_name || "No Name"}</h4>
                          <p className="text-sm text-muted-foreground">{user.id.slice(0, 8)}...</p>
                          <p className="text-xs text-muted-foreground">Joined {format(new Date(user.created_at), "PPP")}</p>
                        </div>
                      </div>
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
