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
import { ArrowLeft, Calendar, MapPin, Users, Minus, Plus, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { FunctionsHttpError } from "@supabase/supabase-js";

interface EventCheckoutModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  event: {
    id: string;
    title: string;
    date: Date;
    venue: string;
    price: number;
    memberPrice: number;
    availableSeats: number;
  };
  isMember?: boolean;
}

interface Attendee {
  name: string;
  email: string;
  phone: string;
}

export const EventCheckoutModal = ({
  open,
  onOpenChange,
  event,
  isMember = false,
}: EventCheckoutModalProps) => {
  const [step, setStep] = useState<"details" | "attendees" | "payment">("details");
  const [seats, setSeats] = useState(1);
  const [attendees, setAttendees] = useState<Attendee[]>([{ name: "", email: "", phone: "" }]);
  const [isProcessing, setIsProcessing] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleSeatsChange = (newSeats: number) => {
    setSeats(newSeats);
    const nextAttendees = [...attendees];
    if (newSeats > attendees.length) {
      for (let i = attendees.length; i < newSeats; i += 1) {
        nextAttendees.push({ name: "", email: "", phone: "" });
      }
    } else {
      nextAttendees.splice(newSeats);
    }
    setAttendees(nextAttendees);
  };

  const updateAttendee = (index: number, field: keyof Attendee, value: string) => {
    const nextAttendees = [...attendees];
    nextAttendees[index] = { ...nextAttendees[index], [field]: value };
    setAttendees(nextAttendees);
  };

  const pricePerSeat = isMember ? event.memberPrice : event.price;
  const subtotal = pricePerSeat * seats;
  const taxes = subtotal * 0.1;
  const total = subtotal + taxes;

  const attendeesAreValid = attendees.every((attendee) => attendee.name.trim() && attendee.email.trim());

  const handleHostedCheckout = async () => {
    if (!user) {
      toast.error("Please sign in to book this event");
      onOpenChange(false);
      navigate("/auth");
      return;
    }

    if (!attendeesAreValid) {
      toast.error("Please complete each attendee's name and email");
      return;
    }

    setIsProcessing(true);

    try {
      const successUrl = `${window.location.origin}/programs/${event.id}?success=1&session_id={CHECKOUT_SESSION_ID}`;
      const cancelUrl = `${window.location.origin}/programs/${event.id}?canceled=1`;

      const { data, error } = await supabase.functions.invoke("create-event-checkout", {
        body: {
          eventId: event.id,
          seats,
          successUrl,
          cancelUrl,
        },
      });

      if (error || !data?.url) {
        throw error ?? new Error("Failed to create Stripe checkout session");
      }

      window.location.href = data.url;
    } catch (error) {
      let message = "Failed to start event checkout.";

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
      setStep("details");
      setSeats(1);
      setAttendees([{ name: "", email: "", phone: "" }]);
      setIsProcessing(false);
    }
    onOpenChange(nextOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {(step === "attendees" || step === "payment") && (
              <Button
                variant="ghost"
                size="icon"
                className="mr-2"
                onClick={() => setStep(step === "payment" ? "attendees" : "details")}
              >
                <ArrowLeft className="w-4 h-4" />
              </Button>
            )}
            {step === "details" ? "Book Your Seat" : step === "attendees" ? "Attendee Details" : "Stripe Program Checkout"}
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
              <div className="bg-secondary/30 rounded-xl p-4">
                <h3 className="font-heading font-bold text-lg mb-3">{event.title}</h3>
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

              <div>
                <Label className="mb-3 block">Number of Seats</Label>
                <div className="flex items-center justify-center gap-4">
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => handleSeatsChange(Math.max(1, seats - 1))}
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
                      handleSeatsChange(
                        Math.min(Math.max(1, parseInt(e.target.value, 10) || 1), event.availableSeats),
                      )
                    }
                    className="w-20 text-center text-lg font-bold"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => handleSeatsChange(Math.min(event.availableSeats, seats + 1))}
                    disabled={seats >= event.availableSeats}
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <div className="bg-card rounded-xl border border-border p-4 space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    {seats} x ${pricePerSeat.toFixed(2)}
                    {isMember ? <span className="text-primary text-xs ml-1">(Member)</span> : null}
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

              <Button variant="gold" size="lg" className="w-full" onClick={() => setStep("attendees")}>
                Continue to Attendee Details
              </Button>
            </motion.div>
          )}

          {step === "attendees" && (
            <motion.div
              key="attendees"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <p className="text-sm text-muted-foreground">Please provide details for each attendee.</p>

              <div className="space-y-6 max-h-[300px] overflow-y-auto pr-2">
                {attendees.map((attendee, index) => (
                  <div key={index} className="bg-secondary/30 rounded-xl p-4 space-y-4">
                    <h4 className="font-medium flex items-center gap-2">
                      <Users className="w-4 h-4 text-primary" />
                      Attendee {index + 1}
                    </h4>
                    <div className="grid gap-4">
                      <div>
                        <Label htmlFor={`name-${index}`}>Full Name *</Label>
                        <Input
                          id={`name-${index}`}
                          placeholder="John Doe"
                          value={attendee.name}
                          onChange={(e) => updateAttendee(index, "name", e.target.value)}
                        />
                      </div>
                      <div>
                        <Label htmlFor={`email-${index}`}>Email *</Label>
                        <Input
                          id={`email-${index}`}
                          type="email"
                          placeholder="john@example.com"
                          value={attendee.email}
                          onChange={(e) => updateAttendee(index, "email", e.target.value)}
                        />
                      </div>
                      <div>
                        <Label htmlFor={`phone-${index}`}>Phone</Label>
                        <Input
                          id={`phone-${index}`}
                          type="tel"
                          placeholder="+61 400 000 000"
                          value={attendee.phone}
                          onChange={(e) => updateAttendee(index, "phone", e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                ))}
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
                    <p className="font-medium">Stripe Hosted Program Checkout</p>
                    <p className="text-sm text-muted-foreground">
                      You&apos;ll be redirected to Stripe&apos;s secure checkout page to complete this event booking.
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
                  <span className="text-muted-foreground">
                    {seats} seat(s) x ${pricePerSeat.toFixed(2)}
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
