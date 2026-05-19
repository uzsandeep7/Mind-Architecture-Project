import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Component, type ReactNode } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { CartProvider } from "@/contexts/CartContext";

import Index from "./pages/Index";
import Events from "./pages/Events";
import EventDetail from "./pages/EventDetail";
import Books from "./pages/Books";
import About from "./pages/About";
import Testimonials from "./pages/Testimonials";
import Contact from "./pages/Contact";
import Blog from "./pages/Blog";
import BlogPost from "./pages/BlogPost";
import Auth from "./pages/Auth";
import Gallery from "./pages/Gallery";
import Consultation from "./pages/Consultation";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import Dashboard from "./pages/Dashboard";
import Admin from "./pages/Admin";
import Membership from "./pages/Membership";
import NotFound from "./pages/NotFound";

import ChatWidget from "./components/ChatWidget";
import { ScrollToTop } from "./components/ScrollToTop";

const queryClient = new QueryClient();

type RouteErrorBoundaryProps = {
  children: ReactNode;
};

type RouteErrorBoundaryState = {
  hasError: boolean;
};

class RouteErrorBoundary extends Component<RouteErrorBoundaryProps, RouteErrorBoundaryState> {
  state: RouteErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: unknown) {
    console.error("Route render failed:", error);
  }

  render() {
    if (this.state.hasError) {
      return (
        <main className="min-h-screen bg-background pt-32">
          <div className="container-wide max-w-2xl text-center">
            <h1 className="mb-4 text-3xl font-heading font-bold">Something went wrong</h1>
            <p className="mb-6 text-muted-foreground">
              Please refresh the page. If this continues, check the browser console for the exact error.
            </p>
          </div>
        </main>
      );
    }

    return this.props.children;
  }
}

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <CartProvider>
          <Toaster />
          <Sonner />


          <BrowserRouter>
            <ScrollToTop />
            <ChatWidget />
            <RouteErrorBoundary>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/programs" element={<Events />} />
                <Route path="/programs/:id" element={<EventDetail />} />
                <Route path="/events" element={<Navigate to="/programs" replace />} />
                <Route path="/events/:id" element={<EventDetail />} />
                <Route path="/books" element={<Books />} />
                <Route path="/about" element={<About />} />
                <Route path="/testimonials" element={<Testimonials />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/insights" element={<Blog />} />
                <Route path="/insights/:slug" element={<BlogPost />} />
                <Route path="/blog" element={<Navigate to="/insights" replace />} />
                <Route path="/blog/:slug" element={<BlogPost />} />
                <Route path="/auth" element={<Auth />} />
                <Route path="/gallery" element={<Gallery />} />
                <Route path="/consultation" element={<Consultation />} />
                <Route path="/cart" element={<Cart />} />
                <Route path="/checkout" element={<Checkout />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/admin" element={<Admin />} />
                <Route path="/membership" element={<Membership />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </RouteErrorBoundary>
          </BrowserRouter>
        </CartProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
