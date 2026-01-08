import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ArrowLeft, Calendar, MapPin, Users, Shield, Minus, Plus } from "lucide-react";
import { PaymentMethodSelector } from "./PaymentMethodSelector";
import { CardPaymentForm } from "./CardPaymentForm";
import { PaymentSuccessDialog } from "./PaymentSuccessDialog";

interface EventCheckoutModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  event: {
    title: string;
    date: Date;
    venue: string;
    price: number;
    memberPrice: number;
    availableSeats: number;
  };
  isMember?: boolean;
}

export const EventCheckoutModal = ({
  open,
  onOpenChange,
  event,
  isMember = false,
}: EventCheckoutModalProps) => {
  const [step, setStep] = useState<"details" | "payment">("details");
  const [seats, setSeats] = useState(1);
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

  const pricePerSeat = isMember ? event.memberPrice : event.price;
  const subtotal = pricePerSeat * seats;
  const taxes = subtotal * 0.1;
  const total = subtotal + taxes;

  const handlePayment = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      onOpenChange(false);
      setShowSuccess(true);
    }, 2000);
  };

  const handleClose = () => {
    setStep("details");
    setSeats(1);
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
                  onClick={() => setStep("details")}
                >
                  <ArrowLeft className="w-4 h-4" />
                </Button>
              )}
              {step === "details" ? "Book Your Seat" : "Payment Details"}
            </DialogTitle>
          </DialogHeader>

          <AnimatePresence mode="wait">
            {step === "details" && (
              <motion.div
                key="details"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-6"
              >
                {/* Event Info */}
                <div className="bg-secondary/30 rounded-xl p-4">
                  <h3 className="font-heading font-bold text-lg mb-3">
                    {event.title}
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Calendar className="w-4 h-4" />
                      <span>
                        {event.date.toLocaleDateString("en-AU", {
                          weekday: "long",
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <MapPin className="w-4 h-4" />
                      <span>{event.venue}</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Users className="w-4 h-4" />
                      <span>{event.availableSeats} seats available</span>
                    </div>
                  </div>
                </div>

                {/* Seat Selection */}
                <div>
                  <Label className="mb-3 block">Number of Seats</Label>
                  <div className="flex items-center justify-center gap-4">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setSeats((s) => Math.max(1, s - 1))}
                      disabled={seats <= 1}
                    >
                      <Minus className="w-4 h-4" />
                    </Button>
                    <Input
                      type="number"
                      min={1}
                      max={event.availableSeats}
                      value={seats}
                      onChange={(e) =>
                        setSeats(
                          Math.min(
                            Math.max(1, parseInt(e.target.value) || 1),
                            event.availableSeats
                          )
                        )
                      }
                      className="w-20 text-center text-lg font-bold"
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() =>
                        setSeats((s) => Math.min(event.availableSeats, s + 1))
                      }
                      disabled={seats >= event.availableSeats}
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {/* Pricing Summary */}
                <div className="bg-card rounded-xl border border-border p-4 space-y-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      {seats} x ${pricePerSeat.toFixed(2)}
                      {isMember && (
                        <span className="text-primary text-xs ml-1">
                          (Member)
                        </span>
                      )}
                    </span>
                    <span>${subtotal.toFixed(2)}</span>
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
                <div>
                  <h4 className="font-medium mb-3">Select Payment Method</h4>
                  <PaymentMethodSelector
                    selectedMethod={paymentMethod}
                    onMethodChange={setPaymentMethod}
                  />
                </div>

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
                      {isProcessing ? "Processing..." : "Continue with PayPal"}
                    </Button>
                  </motion.div>
                )}

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

                <div className="bg-secondary/30 rounded-xl p-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">
                      {seats} seat(s) × ${pricePerSeat.toFixed(2)}
                    </span>
                    <span>${subtotal.toFixed(2)}</span>
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
        type="event"
        eventTitle={event.title}
        orderTotal={total}
      />
    </>
  );
};
