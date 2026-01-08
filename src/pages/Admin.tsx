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
  MessageSquare,
  Plus,
  Trash2,
  Eye,
  EyeOff,
  Mail,
  TrendingUp,
  Crown,
  DollarSign,
  BarChart3,
  PieChart,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import { useState } from "react";
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

const AdminDashboard = () => {
  const [newEvent, setNewEvent] = useState({
    title: "",
    description: "",
    date: "",
    venue: "",
    price: "",
    total_seats: "",
  });
  const [newBook, setNewBook] = useState({
    title: "",
    description: "",
    author: "",
    price: "",
    category: "",
    stock: "",
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

  return (
    <Layout>
      {/* Hero */}
      <section className="pt-32 pb-8 bg-gradient-hero text-cream">
        <div className="container-wide">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
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
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="gold" size="sm">
                        <Plus size={16} className="mr-1" /> Add Event
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Create New Event</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
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
                        </div>
                        <Button variant="gold" className="w-full">
                          Create Event
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {mockEvents.map((event) => (
                      <motion.div
                        key={event.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-secondary/30 transition-colors"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium">{event.title}</h4>
                            {!event.isPublished && (
                              <Badge variant="secondary">Draft</Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {event.date} • {event.venue}
                          </p>
                          <div className="flex items-center gap-4 mt-1">
                            <span className="text-sm font-medium text-primary">
                              ${event.price}
                            </span>
                            <span className="text-sm text-muted-foreground">
                              {event.bookedSeats}/{event.totalSeats} booked
                            </span>
                            <div className="w-24 h-2 bg-secondary rounded-full overflow-hidden">
                              <div
                                className="h-full bg-primary rounded-full"
                                style={{
                                  width: `${(event.bookedSeats / event.totalSeats) * 100}%`,
                                }}
                              />
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="ghost" size="icon">
                            {event.isPublished ? (
                              <Eye size={16} />
                            ) : (
                              <EyeOff size={16} />
                            )}
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-destructive"
                          >
                            <Trash2 size={16} />
                          </Button>
                        </div>
                      </motion.div>
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
                      <Button variant="gold" size="sm">
                        <Plus size={16} className="mr-1" /> Add Book
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Create New Book</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
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
                            value={newBook.category}
                            onChange={(e) =>
                              setNewBook((p) => ({
                                ...p,
                                category: e.target.value,
                              }))
                            }
                          />
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
                            <Label>Stock</Label>
                            <Input
                              type="number"
                              value={newBook.stock}
                              onChange={(e) =>
                                setNewBook((p) => ({ ...p, stock: e.target.value }))
                              }
                            />
                          </div>
                        </div>
                        <Button variant="gold" className="w-full">
                          Create Book
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {mockBooks.map((book) => (
                      <motion.div
                        key={book.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-secondary/30 transition-colors"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium">{book.title}</h4>
                            {!book.isPublished && (
                              <Badge variant="secondary">Draft</Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            by {book.author}
                          </p>
                          <div className="flex items-center gap-4 mt-1">
                            <span className="text-sm font-medium text-primary">
                              ${book.price}
                            </span>
                            <span className="text-sm text-muted-foreground">
                              {book.stock} in stock
                            </span>
                            <span className="text-sm text-green-600">
                              {book.sold} sold
                            </span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="ghost" size="icon">
                            {book.isPublished ? (
                              <Eye size={16} />
                            ) : (
                              <EyeOff size={16} />
                            )}
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-destructive"
                          >
                            <Trash2 size={16} />
                          </Button>
                        </div>
                      </motion.div>
                    ))}
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
                    {mockOrders.map((order) => (
                      <motion.div
                        key={order.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-secondary/30 transition-colors"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium">{order.id}</h4>
                            <Badge
                              variant={
                                order.status === "completed"
                                  ? "default"
                                  : order.status === "shipped"
                                  ? "secondary"
                                  : "outline"
                              }
                              className={
                                order.status === "completed"
                                  ? "bg-green-100 text-green-600 dark:bg-green-900/30"
                                  : ""
                              }
                            >
                              {order.status}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {order.customer} • {order.items} item(s)
                          </p>
                          <p className="text-xs text-muted-foreground">{order.date}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-primary">${order.total}</p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Blog Tab */}
            <TabsContent value="blog">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Blog Posts</CardTitle>
                  <Button variant="gold" size="sm">
                    <Plus size={16} className="mr-1" /> New Post
                  </Button>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {mockBlogPosts.map((post) => (
                      <motion.div
                        key={post.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-secondary/30 transition-colors"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium">{post.title}</h4>
                            {!post.isPublished && (
                              <Badge variant="secondary">Draft</Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Eye size={14} /> {post.views.toLocaleString()}
                            </span>
                            <span>❤️ {post.likes}</span>
                            <span>💬 {post.comments}</span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="ghost" size="icon">
                            {post.isPublished ? (
                              <Eye size={16} />
                            ) : (
                              <EyeOff size={16} />
                            )}
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-destructive"
                          >
                            <Trash2 size={16} />
                          </Button>
                        </div>
                      </motion.div>
                    ))}
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
                    {mockUsers.map((user) => (
                      <motion.div
                        key={user.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-secondary/30 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center">
                            <Users className="w-5 h-5 text-muted-foreground" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="font-medium">{user.name}</h4>
                              {user.isPremium && (
                                <Badge className="bg-primary text-primary-foreground">
                                  <Crown className="w-3 h-3 mr-1" />
                                  Premium
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {user.email}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-muted-foreground">
                            Joined {user.joinedAt}
                          </p>
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
                    {mockMessages.map((msg) => (
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
                        {!msg.isRead && (
                          <Button variant="outline" size="sm" className="mt-3">
                            Mark as Read
                          </Button>
                        )}
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
