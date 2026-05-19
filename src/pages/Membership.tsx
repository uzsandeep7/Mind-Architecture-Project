import { useEffect, useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Check, X, Shield, Lock, Crown, Sparkles, Calendar, BookOpen } from "lucide-react";
import { SubscriptionCheckoutModal } from "@/components/checkout/SubscriptionCheckoutModal";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { PaymentSuccessDialog } from "@/components/checkout/PaymentSuccessDialog";
import { useAuth } from "@/hooks/useAuth";
import { FunctionsHttpError } from "@supabase/supabase-js";

const freeFeatures = [
  "Create an account and manage your dashboard",
  "Book free discovery consultations",
  "Browse public programs and resources",
  "Purchase books and public resources at standard price",
  "Track orders, consultations, and program bookings",
];

const freeRestrictions = [
  "Standard pricing on paid programs",
  "Standard pricing on books and resources",
  "No access to premium-only listings",
];

const premiumFeatures = [
  { text: "Access premium-only programs when published", icon: Sparkles },
  { text: "Member pricing on eligible programs", icon: Calendar },
  { text: "Member pricing on eligible books and resources", icon: BookOpen },
  { text: "Priority access to selected events and offers", icon: Crown },
  { text: "Membership managed securely through Stripe", icon: Shield },
  { text: "Upgrade or manage billing from your account", icon: Lock },
];

const comparisonTable = [
  { feature: "Registration & Login", free: true, premium: true },
  { feature: "Book Consultations", free: true, premium: true },
  { feature: "Public Programs", free: "Standard price", premium: "Member price when available" },
  { feature: "Books", free: "Standard price", premium: "Member price when available" },
  { feature: "Premium-only Listings", free: false, premium: true },
  { feature: "Order & Booking Dashboard", free: true, premium: true },
  { feature: "Stripe Billing Portal", free: false, premium: true },
];

const faqs = [
  {
    question: "What does Premium unlock?",
    answer:
      "Premium unlocks member pricing, premium-only resources or programs when they are published, and secure Stripe membership management.",
  },
  {
    question: "Can I upgrade later?",
    answer:
      "Yes. A user can stay on Free and upgrade only when premium access is needed.",
  },
  {
    question: "How is payment handled?",
    answer:
      "Membership payment is handled through Stripe. In the current handover version Stripe can remain in test mode until live business accounts are connected.",
  },
  {
    question: "Can members manage billing?",
    answer:
      "Yes. Premium members can open the secure Stripe portal to manage billing once live Stripe keys are connected.",
  },
];

const premiumPlan = {
  name: "Premium",
  price: 29,
  features: [
    "Premium-only listings when available",
    "Member pricing on eligible programs",
    "Member pricing on eligible resources",
    "Secure Stripe billing portal",
    "Dashboard access for orders and bookings",
  ],
};

const MembershipPage = () => {
  const [showCheckout, setShowCheckout] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isOpeningPortal, setIsOpeningPortal] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const { user, refreshUserContext, membershipTier } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const sessionId = searchParams.get("session_id");
    const success = searchParams.get("success");
    const canceled = searchParams.get("canceled");

    if (canceled === "1") {
      toast.error("Stripe checkout was canceled.");
      setSearchParams({}, { replace: true });
      return;
    }

    if (!user || success !== "1" || !sessionId) return;

    const verifyMembershipCheckout = async () => {
      const { data, error } = await supabase.functions.invoke("verify-membership-checkout", {
        body: { sessionId },
      });

      if (error || data?.membershipTier !== "premium") {
        toast.error("We could not verify your Stripe membership payment yet.");
        return;
      }

      await refreshUserContext();
      setShowCheckout(false);
      setShowSuccess(true);
      setSearchParams({}, { replace: true });
      toast.success("Premium membership activated successfully!");
    };

    void verifyMembershipCheckout();
  }, [refreshUserContext, searchParams, setSearchParams, user]);

  const handleManageMembership = async () => {
    if (!user) {
      toast.error("Please sign in to manage your membership");
      return;
    }

    setIsOpeningPortal(true);

    try {
      const { data, error } = await supabase.functions.invoke("create-customer-portal-session", {
        body: {
          returnUrl: `${window.location.origin}/membership`,
        },
      });

      if (error || !data?.url) {
        throw error ?? new Error("Failed to open membership management");
      }

      window.location.href = data.url;
    } catch (error) {
      let message = "We couldn't open membership management right now.";

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
      setIsOpeningPortal(false);
    }
  };

  const handleUpgradeClick = () => {
    if (!user) {
      toast.error("Please sign in to upgrade your membership");
      navigate("/auth");
      return;
    }

    setShowCheckout(true);
  };

  return (
    <Layout>
      <section className="pt-32 pb-16 bg-gradient-to-b from-secondary/50 to-background">
        <div className="container-wide">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mx-auto max-w-3xl text-center"
          >
            <span className="text-sm font-medium uppercase tracking-widest text-primary">
              Membership
            </span>
            <h1 className="mb-6 mt-4 text-4xl font-heading font-bold md:text-5xl lg:text-6xl">
              Choose The Access That Fits
            </h1>
            <p className="text-lg text-muted-foreground">
              A simple free plan for browsing and booking, with premium access for member pricing and selected private offers.
            </p>
          </motion.div>
        </div>
      </section>

      <section className="py-16 bg-background">
        <div className="container-wide">
          <div className="mx-auto grid max-w-5xl gap-8 md:grid-cols-2">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="rounded-2xl border border-border bg-card p-8"
            >
              <Badge variant="secondary" className="mb-4">
                Default Plan
              </Badge>
              <h2 className="mb-2 text-3xl font-heading font-bold">FREE</h2>
              <div className="mb-6 flex items-baseline gap-1">
                <span className="text-4xl font-heading font-bold">$0</span>
                <span className="text-muted-foreground">/ month</span>
              </div>

              <div className="mb-6 space-y-3">
                {freeFeatures.map((feature) => (
                  <div key={feature} className="flex items-start gap-3">
                    <Check className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                    <span className="text-sm">{feature}</span>
                  </div>
                ))}
              </div>

              <div className="border-t border-border pt-4">
                <p className="mb-3 text-sm text-muted-foreground">Limits:</p>
                <div className="space-y-2">
                  {freeRestrictions.map((restriction) => (
                    <div key={restriction} className="flex items-center gap-3">
                      <X className="h-4 w-4 shrink-0 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">{restriction}</span>
                    </div>
                  ))}
                </div>
              </div>

              <Button variant="outline" size="lg" className="mt-8 w-full" disabled>
                {membershipTier === "premium" ? "Free Plan" : "Current Plan"}
              </Button>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="relative rounded-2xl border-2 border-primary bg-card p-8 shadow-lg shadow-primary/10"
            >
              <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                <Badge className="bg-primary px-4 py-1 text-primary-foreground">
                  <Crown className="mr-1 h-4 w-4" />
                  Premium Access
                </Badge>
              </div>

              <Badge variant="outline" className="mb-4 mt-2 border-primary/50 text-primary">
                Premium Plan
              </Badge>
              <h2 className="mb-2 text-3xl font-heading font-bold">PREMIUM</h2>
              <div className="mb-6 flex items-baseline gap-1">
                <span className="text-4xl font-heading font-bold text-primary">$29</span>
                <span className="text-muted-foreground">/ month</span>
              </div>

              <div className="mb-8 space-y-3">
                {premiumFeatures.map((feature) => {
                  const Icon = feature.icon;
                  return (
                    <div key={feature.text} className="flex items-start gap-3">
                      <Icon className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                      <span className="text-sm">{feature.text}</span>
                    </div>
                  );
                })}
              </div>

              <Button
                variant={membershipTier === "premium" ? "outline" : "gold"}
                size="lg"
                className="w-full"
                onClick={
                  membershipTier === "premium"
                    ? () => void handleManageMembership()
                    : handleUpgradeClick
                }
                disabled={isOpeningPortal}
              >
                <Sparkles className="mr-2 h-4 w-4" />
                {membershipTier === "premium"
                  ? isOpeningPortal
                    ? "Opening Membership Portal..."
                    : "Current Plan"
                  : user
                    ? "Upgrade to Premium"
                    : "Sign In to Upgrade"}
              </Button>
            </motion.div>

            <SubscriptionCheckoutModal
              open={showCheckout}
              onOpenChange={setShowCheckout}
              plan={premiumPlan}
            />
            <PaymentSuccessDialog
              open={showSuccess}
              onOpenChange={setShowSuccess}
              type="subscription"
              planName={premiumPlan.name}
            />
          </div>
        </div>
      </section>

      <section className="py-16 bg-secondary/30">
        <div className="container-wide">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-heading font-bold">Feature Comparison</h2>
            <p className="text-muted-foreground">Only the features currently supported by the website are listed here.</p>
          </div>

          <div className="mx-auto max-w-4xl overflow-hidden rounded-2xl border border-border bg-card">
            <div className="grid grid-cols-3 bg-secondary/50 p-4 font-medium">
              <div>Feature</div>
              <div className="text-center">Free</div>
              <div className="text-center text-primary">Premium</div>
            </div>
            {comparisonTable.map((row, index) => (
              <div
                key={row.feature}
                className={`grid grid-cols-3 items-center p-4 ${index % 2 === 0 ? "bg-background" : "bg-card"}`}
              >
                <div className="text-sm">{row.feature}</div>
                <div className="text-center">
                  {row.free === true ? (
                    <Check className="mx-auto h-5 w-5 text-primary" />
                  ) : row.free === false ? (
                    <X className="mx-auto h-5 w-5 text-muted-foreground" />
                  ) : (
                    <span className="text-sm text-muted-foreground">{row.free}</span>
                  )}
                </div>
                <div className="text-center">
                  {row.premium === true ? (
                    <Check className="mx-auto h-5 w-5 text-primary" />
                  ) : (
                    <span className="text-sm font-medium text-primary">{row.premium}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 bg-background">
        <div className="container-wide">
          <div className="mx-auto max-w-3xl">
            <div className="mb-10 text-center">
              <h2 className="mb-4 text-3xl font-heading font-bold">Membership Questions</h2>
              <p className="text-muted-foreground">Clear answers for launch and handover.</p>
            </div>
            <Accordion type="single" collapsible className="space-y-4">
              {faqs.map((faq, index) => (
                <AccordionItem
                  key={faq.question}
                  value={`item-${index}`}
                  className="rounded-xl border border-border bg-card px-6"
                >
                  <AccordionTrigger className="text-left font-medium hover:no-underline">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default MembershipPage;
