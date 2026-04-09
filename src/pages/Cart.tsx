import { Layout } from "@/components/layout/Layout";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Trash2, Plus, Minus, ArrowRight } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

const CartPage = () => {
  const { items, itemCount, totalPrice, updateQuantity, removeFromCart, isLoading } = useCart();
  const { user, isMember } = useAuth();
  const navigate = useNavigate();

  if (!user) {
    return (
      <Layout>
        <section className="pt-32 pb-16 min-h-screen bg-background">
          <div className="container-wide">
            <div className="max-w-lg mx-auto text-center">
              <ShoppingCart className="w-16 h-16 text-muted-foreground mx-auto mb-6" />
              <h1 className="text-3xl font-heading font-bold mb-4">
                Sign In to View Your Cart
              </h1>
              <p className="text-muted-foreground mb-8">
                Please sign in to add items to your cart and proceed to checkout.
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

  if (items.length === 0) {
    return (
      <Layout>
        <section className="pt-32 pb-16 min-h-screen bg-background">
          <div className="container-wide">
            <div className="max-w-lg mx-auto text-center">
              <ShoppingCart className="w-16 h-16 text-muted-foreground mx-auto mb-6" />
              <h1 className="text-3xl font-heading font-bold mb-4">
                Your Cart is Empty
              </h1>
              <p className="text-muted-foreground mb-8">
                Looks like you haven't added any books yet. Explore our collection!
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
              Shopping Cart
            </span>
            <h1 className="text-4xl md:text-5xl font-heading font-bold mt-4">
              Your Cart
              <span className="text-gradient-gold"> ({itemCount} items)</span>
            </h1>
          </motion.div>
        </div>
      </section>

      {/* Cart Content */}
      <section className="section-padding bg-background">
        <div className="container-wide">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {items.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-card p-4 md:p-6 rounded-xl border border-border flex gap-4"
                >
                  <div className="w-20 h-28 md:w-24 md:h-32 bg-secondary rounded-lg overflow-hidden shrink-0">
                    {item.book?.cover_image_url ? (
                      <img
                        src={item.book.cover_image_url}
                        alt={item.book.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                        No Image
                      </div>
                    )}
                  </div>
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="font-heading font-bold text-lg">
                        {item.book?.title}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        by {item.book?.author}
                      </p>
                    </div>
                    <div className="flex items-center justify-between mt-4">
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => updateQuantity(item.book_id, item.quantity - 1)}
                        >
                          <Minus size={14} />
                        </Button>
                        <span className="w-8 text-center font-medium">
                          {item.quantity}
                        </span>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => updateQuantity(item.book_id, item.quantity + 1)}
                        >
                          <Plus size={14} />
                        </Button>
                      </div>
                      <div className="flex items-center gap-4">
                        <p className="font-bold text-lg">
                          ${(((isMember ? item.book?.member_price ?? item.book?.price : item.book?.price) || 0) * item.quantity).toFixed(2)}
                        </p>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive hover:text-destructive"
                          onClick={() => removeFromCart(item.book_id)}
                        >
                          <Trash2 size={18} />
                        </Button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
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
                <div className="space-y-4 mb-6">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>${totalPrice.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Shipping</span>
                    <span className="text-primary">Free</span>
                  </div>
                  <div className="h-px bg-border" />
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total</span>
                    <span>${totalPrice.toFixed(2)}</span>
                  </div>
                </div>
                <Button
                  variant="gold"
                  size="lg"
                  className="w-full"
                  onClick={() => navigate("/checkout")}
                >
                  Proceed to Checkout
                  <ArrowRight size={18} />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full mt-3"
                  asChild
                >
                  <Link to="/books">Continue Shopping</Link>
                </Button>
              </motion.div>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default CartPage;
