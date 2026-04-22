import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ArrowLeft, Crown, Check, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { FunctionsHttpError } from "@supabase/supabase-js";

interface SubscriptionCheckoutModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  plan: {
    name: string;
    price: number;
    features: string[];
  };
}

export const SubscriptionCheckoutModal = ({
  open,
  onOpenChange,
  plan,
}: SubscriptionCheckoutModalProps) => {
  const [step, setStep] = useState<"confirm" | "payment">("confirm");
  const [isProcessing, setIsProcessing] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  const taxes = plan.price * 0.1;
  const total = plan.price + taxes;

  const handleHostedCheckout = async () => {
    if (!user) {
      toast.error("Please sign in to upgrade your membership");
      onOpenChange(false);
      navigate("/auth");
      return;
    }

    const membershipPriceId = import.meta.env.VITE_STRIPE_MEMBERSHIP_PRICE_ID;
    if (!membershipPriceId) {
      toast.error("Membership Stripe price is not configured yet");
      return;
    }

    setIsProcessing(true);
    try {
      const successUrl = `${window.location.origin}/membership?success=1&session_id={CHECKOUT_SESSION_ID}`;
      const cancelUrl = `${window.location.origin}/membership?canceled=1`;

      const { data, error } = await supabase.functions.invoke("create-membership-checkout", {
        body: {
          priceId: membershipPriceId,
          successUrl,
          cancelUrl,
        },
      });

      if (error || !data?.url) {
        throw error ?? new Error("Failed to create Stripe checkout session");
      }

      window.location.href = data.url;
    } catch (error) {
      let message = "Failed to start membership checkout.";

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
      }

      toast.error(message);
      setIsProcessing(false);
    }
  };

  const handleClose = (nextOpen: boolean) => {
    if (!nextOpen) {
      setStep("confirm");
      setIsProcessing(false);
    }
    onOpenChange(nextOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {step === "payment" && (
              <Button
                variant="ghost"
                size="icon"
                className="mr-2"
                onClick={() => setStep("confirm")}
              >
                <ArrowLeft className="w-4 h-4" />
              </Button>
            )}
            {step === "confirm" ? "Confirm Your Plan" : "Stripe Subscription Checkout"}
          </DialogTitle>
        </DialogHeader>

        <AnimatePresence mode="wait">
          {step === "confirm" && (
            <motion.div
              key="confirm"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-6"
            >
              <div className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-xl p-6 border border-primary/20">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Crown className="w-5 h-5 text-primary" />
                      <h3 className="font-heading font-bold text-xl">{plan.name}</h3>
                    </div>
                    <p className="text-muted-foreground text-sm">Unlock your full potential</p>
                  </div>
                  <div className="text-right">
                    <p className="text-3xl font-heading font-bold text-primary">${plan.price}</p>
                    <p className="text-sm text-muted-foreground">/month</p>
                  </div>
                </div>

                <div className="space-y-2">
                  {plan.features.slice(0, 4).map((feature, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm">
                      <Check className="w-4 h-4 text-primary" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-card rounded-xl border border-border p-4 space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>${plan.price.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Taxes (10%)</span>
                  <span>${taxes.toFixed(2)}</span>
                </div>
                <div className="border-t border-border pt-3 flex justify-between font-bold">
                  <span>Total</span>
                  <span className="text-primary">${total.toFixed(2)}</span>
                </div>
              </div>

              <Button variant="gold" size="lg" className="w-full" onClick={() => setStep("payment")}>
                Continue to Payment
              </Button>
            </motion.div>
          )}

          {step === "payment" && (
            <motion.div
              key="payment"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="rounded-xl border border-border bg-secondary/20 p-5">
                <div className="flex items-center gap-3">
                  <div className="rounded-full bg-primary/10 p-2 text-primary">
                    <ExternalLink size={18} />
                  </div>
                  <div>
                    <p className="font-medium">Stripe Hosted Subscription Checkout</p>
                    <p className="text-sm text-muted-foreground">
                      You&apos;ll be redirected to Stripe&apos;s secure checkout page to start your premium membership.
                    </p>
                  </div>
                </div>
                <div className="mt-4 rounded-lg border border-dashed border-primary/30 bg-background/40 p-4 text-sm text-muted-foreground">
                  Use the Stripe test card <span className="font-medium text-foreground">4242 4242 4242 4242</span>,
                  any future expiry date, and any 3-digit CVC.
                </div>
              </div>

              <div className="bg-secondary/30 rounded-xl p-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{plan.name}</span>
                  <span>${plan.price.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Taxes</span>
                  <span>${taxes.toFixed(2)}</span>
                </div>
                <div className="border-t border-border pt-2 flex justify-between font-bold">
                  <span>Total</span>
                  <span className="text-primary">${total.toFixed(2)}</span>
                </div>
              </div>

              <Button
                variant="gold"
                size="lg"
                className="w-full"
                onClick={() => void handleHostedCheckout()}
                disabled={isProcessing}
              >
                {isProcessing ? "Redirecting..." : `Continue to Stripe - $${total.toFixed(2)}`}
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
};
