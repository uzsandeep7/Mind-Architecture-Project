import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ArrowLeft, Crown, Shield, Check } from "lucide-react";
import { PaymentMethodSelector } from "./PaymentMethodSelector";
import { CardPaymentForm } from "./CardPaymentForm";
import { PaymentSuccessDialog } from "./PaymentSuccessDialog";

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
  const [paymentMethod, setPaymentMethod] = useState<"paypal" | "card">("card");
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [cardDetails, setCardDetails] = useState({
    cardNumber: "",
    expiryDate: "",
    cvv: "",
    nameOnCard: "",
    billingEmail: "",
  });

  const taxes = plan.price * 0.1;
  const total = plan.price + taxes;

  const handlePayment = () => {
    setIsProcessing(true);
    // Simulate payment processing
    setTimeout(() => {
      setIsProcessing(false);
      onOpenChange(false);
      setShowSuccess(true);
    }, 2000);
  };

  const handleClose = () => {
    setStep("confirm");
    setPaymentMethod("card");
    setCardDetails({
      cardNumber: "",
      expiryDate: "",
      cvv: "",
      nameOnCard: "",
      billingEmail: "",
    });
    onOpenChange(false);
  };

  return (
    <>
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
              {step === "confirm" ? "Confirm Your Plan" : "Payment Details"}
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
                {/* Selected Plan */}
                <div className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-xl p-6 border border-primary/20">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <Crown className="w-5 h-5 text-primary" />
                        <h3 className="font-heading font-bold text-xl">
                          {plan.name}
                        </h3>
                      </div>
                      <p className="text-muted-foreground text-sm">
                        Unlock your full potential
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-3xl font-heading font-bold text-primary">
                        ${plan.price}
                      </p>
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

                {/* Summary */}
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

                <Button
                  variant="gold"
                  size="lg"
                  className="w-full"
                  onClick={() => setStep("payment")}
                >
                  Continue to Payment
                </Button>

                <Button
                  variant="ghost"
                  className="w-full text-muted-foreground"
                  onClick={handleClose}
                >
                  Choose a different plan
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
                {/* Payment Method Selection */}
                <div>
                  <h4 className="font-medium mb-3">Select Payment Method</h4>
                  <PaymentMethodSelector
                    selectedMethod={paymentMethod}
                    onMethodChange={setPaymentMethod}
                  />
                </div>

                {/* PayPal Placeholder */}
                {paymentMethod === "paypal" && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="bg-secondary/50 rounded-xl p-6 text-center"
                  >
                    <p className="text-muted-foreground mb-4">
                      You will be redirected to PayPal to complete your payment
                    </p>
                    <Button
                      variant="gold"
                      size="lg"
                      className="w-full"
                      onClick={handlePayment}
                      disabled={isProcessing}
                    >
                      {isProcessing ? (
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{
                            repeat: Infinity,
                            duration: 1,
                            ease: "linear",
                          }}
                          className="w-5 h-5 border-2 border-primary-foreground border-t-transparent rounded-full"
                        />
                      ) : (
                        "Continue with PayPal"
                      )}
                    </Button>
                  </motion.div>
                )}

                {/* Card Payment Form */}
                {paymentMethod === "card" && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                  >
                    <CardPaymentForm
                      cardDetails={cardDetails}
                      onCardDetailsChange={setCardDetails}
                    />
                  </motion.div>
                )}

                {/* Order Summary */}
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

                {/* Pay Button */}
                {paymentMethod === "card" && (
                  <Button
                    variant="gold"
                    size="lg"
                    className="w-full"
                    onClick={handlePayment}
                    disabled={isProcessing}
                  >
                    {isProcessing ? (
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{
                          repeat: Infinity,
                          duration: 1,
                          ease: "linear",
                        }}
                        className="w-5 h-5 border-2 border-primary-foreground border-t-transparent rounded-full mr-2"
                      />
                    ) : (
                      <Shield className="w-4 h-4 mr-2" />
                    )}
                    {isProcessing
                      ? "Processing..."
                      : `Confirm & Pay $${total.toFixed(2)}`}
                  </Button>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </DialogContent>
      </Dialog>

      <PaymentSuccessDialog
        open={showSuccess}
        onOpenChange={setShowSuccess}
        type="subscription"
        planName={plan.name}
      />
    </>
  );
};
