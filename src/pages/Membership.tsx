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
import {
  Check,
  X,
  Shield,
  Lock,
  RefreshCcw,
  Crown,
  Sparkles,
  Users,
  MessageCircle,
  Calendar,
  BookOpen,
  Headphones,
  FileText,
  Video,
} from "lucide-react";
import { SubscriptionCheckoutModal } from "@/components/checkout/SubscriptionCheckoutModal";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { PaymentSuccessDialog } from "@/components/checkout/PaymentSuccessDialog";
import { useAuth } from "@/hooks/useAuth";
import { FunctionsHttpError } from "@supabase/supabase-js";

const freeFeatures = [
  { text: "User registration & login", included: true },
  { text: "One-time free consultation (20–30 mins)", included: true },
  { text: "Mindset self-assessment", included: true },
  { text: "2–3 videos / audios", included: true },
  { text: "1 downloadable worksheet", included: true },
  { text: "View-only access to events calendar", included: true },
  { text: "View-only access to books & digital products", included: true },
  { text: "Email notifications", included: true },
];

const freeRestrictions = [
  "No commenting",
  "No community access",
  "No messaging",
  "Standard event pricing only",
];

const premiumFeatures = [
  { text: "Full mindset program access", icon: Sparkles },
  { text: "Progress tracking", icon: FileText },
  { text: "Group coaching (live + recordings)", icon: Video },
  { text: "Community access: commenting, discussions", icon: Users },
  { text: "Limited messaging", icon: MessageCircle },
  { text: "Private journaling & notes", icon: BookOpen },
  { text: "Event priority & waitlist access", icon: Calendar },
  { text: "Member-only discounts on events & books", icon: Crown },
  { text: "Exclusive premium content", icon: Headphones },
];

const comparisonTable = [
  { feature: "Registration & Login", free: true, premium: true },
  { feature: "Free Consultation", free: "Once", premium: "Unlimited" },
  { feature: "Mindset Assessment", free: true, premium: true },
  { feature: "Content Library", free: "Limited", premium: "Full Access" },
  { feature: "Community Access", free: false, premium: true },
  { feature: "Commenting", free: false, premium: true },
  { feature: "Group Coaching", free: false, premium: true },
  { feature: "Progress Tracking", free: false, premium: true },
  { feature: "Private Notes", free: false, premium: true },
  { feature: "Event Discounts", free: false, premium: "Up to 30%" },
  { feature: "Book Discounts", free: false, premium: "Up to 25%" },
  { feature: "Priority Booking", free: false, premium: true },
  { feature: "Exclusive Content", free: false, premium: true },
];

const faqs = [
  {
    question: "What's included in Premium?",
    answer:
      "Premium membership includes full access to our mindset program library, group coaching sessions (live and recorded), community features like commenting and discussions, private journaling tools, priority event booking, and exclusive member discounts on all events and books.",
  },
  {
    question: "Can I upgrade later?",
    answer:
      "Absolutely! You can upgrade from Free to Premium at any time. Your premium benefits will activate immediately upon payment, and you'll have instant access to all premium features.",
  },
  {
    question: "Is there a refund policy?",
    answer:
      "Yes, we offer a 14-day money-back guarantee. If you're not satisfied with your Premium membership within the first 14 days, contact us for a full refund, no questions asked.",
  },
  {
    question: "Can I downgrade anytime?",
    answer:
      "Yes, you can downgrade to the Free plan at any time. Your premium access will continue until the end of your current billing period, after which you'll automatically switch to the Free plan.",
  },
];

const premiumPlan = {
  name: "Premium",
  price: 29,
  features: [
    "Full mindset program access",
    "Progress tracking",
    "Group coaching (live + recordings)",
    "Community access: commenting, discussions",
    "Limited messaging",
    "Private journaling & notes",
    "Event priority & waitlist access",
    "Member-only discounts on events & books",
    "Exclusive premium content",
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
      {/* Header Section */}
      <section className="pt-32 pb-16 bg-gradient-to-b from-secondary/50 to-background">
        <div className="container-wide">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-3xl mx-auto"
          >
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-heading font-bold mb-6">
              Membership Plans
            </h1>
            <p className="text-lg text-muted-foreground">
              Choose the level of support that fits your journey
            </p>
          </motion.div>
        </div>
      </section>

      {/* Plans Comparison Cards */}
      <section className="py-16 bg-background">
        <div className="container-wide">
          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {/* Free Plan Card */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="relative bg-card rounded-2xl border border-border p-8"
            >
              <div className="mb-6">
                <Badge variant="secondary" className="mb-4">
                  Default Plan
                </Badge>
                <h2 className="text-3xl font-heading font-bold mb-2">FREE</h2>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-heading font-bold">$0</span>
                  <span className="text-muted-foreground">/ month</span>
                </div>
              </div>

              <div className="space-y-3 mb-6">
                {freeFeatures.map((feature, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                    <span className="text-sm">{feature.text}</span>
                  </div>
                ))}
              </div>

              <div className="pt-4 border-t border-border">
                <p className="text-sm text-muted-foreground mb-3">Restrictions:</p>
                <div className="space-y-2">
                  {freeRestrictions.map((restriction, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <X className="w-4 h-4 text-muted-foreground shrink-0" />
                      <span className="text-sm text-muted-foreground">{restriction}</span>
                    </div>
                  ))}
                </div>
              </div>

              <Button
                variant="outline"
                size="lg"
                className="w-full mt-8"
                disabled
              >
                {membershipTier === "premium" ? "Free Plan" : "Current Plan"}
              </Button>
            </motion.div>

            {/* Premium Plan Card */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="relative bg-card rounded-2xl border-2 border-primary p-8 shadow-lg shadow-primary/10"
            >
              {/* Popular Badge */}
              <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                <Badge className="bg-primary text-primary-foreground px-4 py-1">
                  <Crown className="w-4 h-4 mr-1" />
                  Most Popular
                </Badge>
              </div>

              <div className="mb-6 pt-2">
                <Badge variant="outline" className="mb-4 border-primary/50 text-primary">
                  Premium Plan
                </Badge>
                <h2 className="text-3xl font-heading font-bold mb-2">PREMIUM</h2>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-heading font-bold text-primary">$29</span>
                  <span className="text-muted-foreground">/ month</span>
                </div>
              </div>

              <div className="space-y-3 mb-8">
                {premiumFeatures.map((feature, index) => {
                  const Icon = feature.icon;
                  return (
                    <div key={index} className="flex items-start gap-3">
                      <Icon className="w-5 h-5 text-primary shrink-0 mt-0.5" />
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
                <Sparkles className="w-4 h-4 mr-2" />
                {membershipTier === "premium"
                  ? isOpeningPortal
                    ? "Opening Membership Portal..."
                    : "Current Plan"
                  : user
                    ? "Upgrade to Premium"
                    : "Sign In to Upgrade"}
              </Button>
              {membershipTier === "premium" ? (
                <p className="mt-3 text-center text-xs text-muted-foreground">
                  Use Stripe&apos;s secure customer portal to cancel, update payment details, or manage billing.
                </p>
              ) : null}
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

      {/* Feature Comparison Table */}
      <section className="py-16 bg-secondary/30">
        <div className="container-wide">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-heading font-bold mb-4">
              Feature Comparison
            </h2>
            <p className="text-muted-foreground">
              See what's included in each plan
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-4xl mx-auto bg-card rounded-2xl border border-border overflow-hidden"
          >
            <div className="grid grid-cols-3 bg-secondary/50 p-4 font-medium">
              <div>Feature</div>
              <div className="text-center">Free</div>
              <div className="text-center text-primary">Premium</div>
            </div>
            {comparisonTable.map((row, index) => (
              <div
                key={index}
                className={`grid grid-cols-3 p-4 items-center ${
                  index % 2 === 0 ? "bg-background" : "bg-card"
                }`}
              >
                <div className="text-sm">{row.feature}</div>
                <div className="text-center">
                  {row.free === true ? (
                    <Check className="w-5 h-5 text-primary mx-auto" />
                  ) : row.free === false ? (
                    <X className="w-5 h-5 text-muted-foreground mx-auto" />
                  ) : (
                    <span className="text-sm text-muted-foreground">{row.free}</span>
                  )}
                </div>
                <div className="text-center">
                  {row.premium === true ? (
                    <Check className="w-5 h-5 text-primary mx-auto" />
                  ) : (
                    <span className="text-sm font-medium text-primary">{row.premium}</span>
                  )}
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Trust & Value Section */}
      <section className="py-16 bg-background">
        <div className="container-wide">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center max-w-3xl mx-auto"
          >
            <h2 className="text-2xl font-heading font-bold mb-8">
              Upgrade anytime. Cancel anytime.
            </h2>
            <div className="flex flex-wrap justify-center gap-8">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <Shield className="w-6 h-6 text-primary" />
                </div>
                <span className="text-sm font-medium">Secure Checkout</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <Lock className="w-6 h-6 text-primary" />
                </div>
                <span className="text-sm font-medium">Privacy Respected</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <RefreshCcw className="w-6 h-6 text-primary" />
                </div>
                <span className="text-sm font-medium">No Long-term Lock-in</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 bg-secondary/30">
        <div className="container-wide">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-heading font-bold mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-muted-foreground">
              Got questions? We've got answers.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-3xl mx-auto"
          >
            <Accordion type="single" collapsible className="space-y-4">
              {faqs.map((faq, index) => (
                <AccordionItem
                  key={index}
                  value={`item-${index}`}
                  className="bg-card rounded-xl border border-border px-6"
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
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-hero text-cream">
        <div className="container-wide text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-2xl mx-auto"
          >
            <h2 className="text-3xl md:text-4xl font-heading font-bold mb-6">
              Ready to Unlock Your Full Potential?
            </h2>
            <p className="text-cream/70 mb-8">
              Join thousands of members who are transforming their mindset and achieving extraordinary results.
            </p>
            <Button
              variant="gold"
              size="lg"
              onClick={
                membershipTier === "premium"
                  ? () => void handleManageMembership()
                  : handleUpgradeClick
              }
              disabled={isOpeningPortal}
            >
              <Crown className="w-5 h-5 mr-2" />
              {membershipTier === "premium"
                ? isOpeningPortal
                  ? "Opening Membership Portal..."
                  : "Manage Membership"
                : user
                  ? "Get Premium Access"
                  : "Sign In for Premium Access"}
            </Button>
          </motion.div>
        </div>
      </section>
    </Layout>
  );
};

export default MembershipPage;
