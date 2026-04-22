import { Layout } from "@/components/layout/Layout";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CheckCircle, CreditCard, ExternalLink, Lock, ShoppingBag } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { useEffect, useState } from "react";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { FunctionsHttpError } from "@supabase/supabase-js";

const PENDING_ORDER_EXPIRY_MS = 60 * 60 * 1000;

const CheckoutPage = () => {
  const { items, totalPrice, clearCart } = useCart();
  const { user, isMember } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [isProcessing, setIsProcessing] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [orderId, setOrderId] = useState("");
  
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    address: "",
    city: "",
    postalCode: "",
    country: "Australia",
  });

  useEffect(() => {
    if (!user) return;

    const expirePendingOrders = async () => {
      const expiryCutoff = new Date(Date.now() - PENDING_ORDER_EXPIRY_MS).toISOString();
      const { error } = await supabase
        .from("orders")
        .update({ status: "cancelled" })
        .eq("user_id", user.id)
        .eq("status", "pending")
        .lt("created_at", expiryCutoff);

      if (error) {
        console.error("Error expiring pending orders:", error);
      }
    };

    void expirePendingOrders();
  }, [user]);

  useEffect(() => {
    const sessionId = searchParams.get("session_id");
    const success = searchParams.get("success");
    const orderIdParam = searchParams.get("order_id");
    const canceled = searchParams.get("canceled");

    if (canceled === "1") {
      toast.error("Stripe checkout was canceled. Your order is still pending.");
      setSearchParams({}, { replace: true });
      return;
    }

    if (!user || success !== "1" || !sessionId || !orderIdParam) return;

    const verifyCheckout = async () => {
      setIsProcessing(true);
      const { data, error } = await supabase.functions.invoke("verify-book-checkout", {
        body: {
          sessionId,
          orderId: orderIdParam,
        },
      });

      if (error || !data?.orderId) {
        toast.error("We could not verify your Stripe payment yet.");
        setIsProcessing(false);
        return;
      }

      await clearCart();
      setOrderId(data.orderId);
      setIsComplete(true);
      setSearchParams({}, { replace: true });
      toast.success("Payment confirmed successfully!");
      setIsProcessing(false);
    };

    void verifyCheckout();
  }, [clearCart, searchParams, setSearchParams, user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast.error("Please sign in to complete your order");
      navigate("/auth");
      return;
    }

    if (items.length === 0) {
      toast.error("Your cart is empty");
      return;
    }

    setIsProcessing(true);

    try {
      // Create order
      const { data: order, error: orderError } = await supabase
        .from("orders")
        .insert({
          user_id: user.id,
          status: "pending",
          total_amount: totalPrice,
          shipping_address: `${formData.address}, ${formData.city}, ${formData.postalCode}, ${formData.country}`,
          payment_method: "stripe_test_card",
        })
        .select()
        .single();

      if (orderError) throw orderError;

      // Create order items
      const orderItems = items.map((item) => ({
        order_id: order.id,
        book_id: item.book_id,
        quantity: item.quantity,
        price: (isMember ? item.book?.member_price ?? item.book?.price : item.book?.price) || 0,
      }));

      const { error: itemsError } = await supabase
        .from("order_items")
        .insert(orderItems);

      if (itemsError) throw itemsError;

      const successUrl = `${window.location.origin}/checkout?success=1&session_id={CHECKOUT_SESSION_ID}&order_id=${order.id}`;
      const cancelUrl = `${window.location.origin}/checkout?canceled=1&order_id=${order.id}`;
      const checkoutItems = items.map((item) => ({
        title: item.book?.title ?? "Book Purchase",
        quantity: item.quantity,
        price: (isMember ? item.book?.member_price ?? item.book?.price : item.book?.price) || 0,
      }));

      const { data: checkoutData, error: checkoutError } = await supabase.functions.invoke(
        "create-book-checkout",
        {
          body: {
            orderId: order.id,
            successUrl,
            cancelUrl,
            items: checkoutItems,
          },
        },
      );

      if (checkoutError || !checkoutData?.url) {
        throw checkoutError ?? new Error("Failed to create Stripe checkout session");
      }

      window.location.href = checkoutData.url;
    } catch (error) {
      console.error("Error processing order:", error);
      let message = "Failed to process order. Please try again.";

      if (error instanceof FunctionsHttpError) {
        try {
          const errorBody = await error.context.json();
          message =
            typeof errorBody?.error === "string"
              ? errorBody.error
              : JSON.stringify(errorBody);
        } catch {
          message = error.message;
        }
      } else if (error instanceof Error) {
        message = error.message;
      } else if (typeof error === "object" && error && "message" in error) {
        message = String(error.message);
      }

      toast.error(message);
    } finally {
      setIsProcessing(false);
    }
  };

  if (!user) {
    return (
      <Layout>
        <section className="pt-32 pb-16 min-h-screen bg-background">
          <div className="container-wide">
            <div className="max-w-lg mx-auto text-center">
              <Lock className="w-16 h-16 text-muted-foreground mx-auto mb-6" />
              <h1 className="text-3xl font-heading font-bold mb-4">
                Sign In Required
              </h1>
              <p className="text-muted-foreground mb-8">
                Please sign in to complete your purchase.
              </p>
              <Button variant="gold" size="lg" asChild>
                <Link to="/auth">Sign In</Link>
              </Button>
            </div>
          </div>
        </section>
      </Layout>
    );
  }

  if (items.length === 0 && !isComplete) {
    return (
      <Layout>
        <section className="pt-32 pb-16 min-h-screen bg-background">
          <div className="container-wide">
            <div className="max-w-lg mx-auto text-center">
              <ShoppingBag className="w-16 h-16 text-muted-foreground mx-auto mb-6" />
              <h1 className="text-3xl font-heading font-bold mb-4">
                Your Cart is Empty
              </h1>
              <p className="text-muted-foreground mb-8">
                Add some books to your cart to proceed with checkout.
              </p>
              <Button variant="gold" size="lg" asChild>
                <Link to="/books">Browse Books</Link>
              </Button>
            </div>
          </div>
        </section>
      </Layout>
    );
  }

  if (isComplete) {
    return (
      <Layout>
        <section className="pt-32 pb-16 min-h-screen bg-background">
          <div className="container-wide">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="max-w-lg mx-auto text-center"
            >
              <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-10 h-10 text-primary" />
              </div>
              <h1 className="text-3xl font-heading font-bold mb-4">
                Order Confirmed!
              </h1>
              <p className="text-muted-foreground mb-2">
                Thank you for your purchase.
              </p>
              <p className="text-sm text-muted-foreground mb-8">
                Order ID: {orderId.slice(0, 8).toUpperCase()}
              </p>
              <div className="flex gap-4 justify-center">
                <Button variant="gold" onClick={() => navigate("/dashboard")}>
                  View My Orders
                </Button>
                <Button variant="outline" onClick={() => navigate("/")}>
                  Back to Home
                </Button>
              </div>
            </motion.div>
          </div>
        </section>
      </Layout>
    );
  }

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
              Checkout
            </span>
            <h1 className="text-4xl md:text-5xl font-heading font-bold mt-4">
              Complete Your
              <span className="text-gradient-gold"> Order</span>
            </h1>
          </motion.div>
        </div>
      </section>

      {/* Checkout Form */}
      <section className="section-padding bg-background">
        <div className="container-wide">
          <form onSubmit={handleSubmit}>
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Form Fields */}
              <div className="lg:col-span-2 space-y-8">
                {/* Shipping Info */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-card p-6 rounded-xl border border-border"
                >
                  <h2 className="text-xl font-heading font-bold mb-6">
                    Shipping Information
                  </h2>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="sm:col-span-2">
                      <Label htmlFor="fullName">Full Name</Label>
                      <Input
                        id="fullName"
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <Label htmlFor="address">Street Address</Label>
                      <Input
                        id="address"
                        name="address"
                        value={formData.address}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="city">City</Label>
                      <Input
                        id="city"
                        name="city"
                        value={formData.city}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="postalCode">Postal Code</Label>
                      <Input
                        id="postalCode"
                        name="postalCode"
                        value={formData.postalCode}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>
                </motion.div>

                {/* Payment Info */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="bg-card p-6 rounded-xl border border-border"
                >
                  <h2 className="text-xl font-heading font-bold mb-6">
                    Payment Method
                  </h2>
                  <div className="rounded-xl border border-border bg-secondary/20 p-5">
                    <div className="flex items-center gap-3">
                      <div className="rounded-full bg-primary/10 p-2 text-primary">
                        <CreditCard size={18} />
                      </div>
                      <div>
                        <p className="font-medium">Stripe Hosted Checkout</p>
                        <p className="text-sm text-muted-foreground">
                          You will be redirected to Stripe&apos;s secure test checkout page to enter card details.
                        </p>
                      </div>
                    </div>
                    <div className="mt-4 rounded-lg border border-dashed border-primary/30 bg-background/40 p-4 text-sm text-muted-foreground">
                      Use the Stripe test card <span className="font-medium text-foreground">4242 4242 4242 4242</span>,
                      any future expiry date, and any 3-digit CVC.
                    </div>
                  </div>
                </motion.div>
              </div>

              {/* Order Summary */}
              <div className="lg:col-span-1">
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="bg-card p-6 rounded-xl border border-border sticky top-24"
                >
                  <h2 className="text-xl font-heading font-bold mb-6">
                    Order Summary
                  </h2>
                  <div className="space-y-3 mb-6">
                    {items.map((item) => (
                      <div key={item.id} className="flex justify-between text-sm">
                        <span className="text-muted-foreground">
                          {item.book?.title} x{item.quantity}
                        </span>
                        <span>
                          ${(((isMember ? item.book?.member_price ?? item.book?.price : item.book?.price) || 0) * item.quantity).toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>
                  <div className="space-y-2 mb-6 pt-4 border-t border-border">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Subtotal</span>
                      <span>${totalPrice.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Shipping</span>
                      <span className="text-primary">Free</span>
                    </div>
                    <div className="flex justify-between text-lg font-bold pt-2">
                      <span>Total</span>
                      <span>${totalPrice.toFixed(2)}</span>
                    </div>
                  </div>
                  <Button
                    type="submit"
                    variant="gold"
                    size="lg"
                    className="w-full"
                    disabled={isProcessing}
                  >
                    {isProcessing ? (
                      "Processing..."
                    ) : (
                      <>
                        <ExternalLink size={16} />
                        Pay with Stripe Test Checkout
                      </>
                    )}
                  </Button>
                  <p className="text-xs text-muted-foreground text-center mt-4">
                    Your payment information is secure and encrypted.
                  </p>
                </motion.div>
              </div>
            </div>
          </form>
        </div>
      </section>
    </Layout>
  );
};

export default CheckoutPage;
