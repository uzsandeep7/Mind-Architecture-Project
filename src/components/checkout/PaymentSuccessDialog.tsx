import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CheckCircle2, Calendar, Home, Crown } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface PaymentSuccessDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  type: "subscription" | "event" | "book";
  planName?: string;
  eventTitle?: string;
  orderTotal?: number;
}

export const PaymentSuccessDialog = ({
  open,
  onOpenChange,
  type,
  planName,
  eventTitle,
  orderTotal,
}: PaymentSuccessDialogProps) => {
  const navigate = useNavigate();
  const startDate = new Date().toLocaleDateString("en-AU", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", duration: 0.5 }}
            className="mx-auto mb-4"
          >
            <div className="w-20 h-20 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
              <CheckCircle2 className="w-12 h-12 text-green-600" />
            </div>
          </motion.div>
          <DialogTitle className="text-2xl font-heading text-center">
            Payment Successful!
          </DialogTitle>
        </DialogHeader>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-4 py-4"
        >
          {type === "subscription" && (
            <div className="bg-secondary/50 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Plan</span>
                <span className="font-medium flex items-center gap-2">
                  <Crown className="w-4 h-4 text-primary" />
                  {planName}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Start Date</span>
                <span className="font-medium">{startDate}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Billing</span>
                <span className="font-medium">Monthly</span>
              </div>
            </div>
          )}

          {type === "event" && (
            <div className="bg-secondary/50 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Event</span>
                <span className="font-medium">{eventTitle}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Booking Date</span>
                <span className="font-medium">{startDate}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Total Paid</span>
                <span className="font-medium text-primary">
                  ${orderTotal?.toFixed(2)}
                </span>
              </div>
            </div>
          )}

          {type === "book" && (
            <div className="bg-secondary/50 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Order Date</span>
                <span className="font-medium">{startDate}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Total Paid</span>
                <span className="font-medium text-primary">
                  ${orderTotal?.toFixed(2)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Status</span>
                <span className="text-green-600 font-medium">Confirmed</span>
              </div>
            </div>
          )}

          <p className="text-center text-sm text-muted-foreground">
            A confirmation email has been sent to your inbox.
          </p>
        </motion.div>

        <div className="flex flex-col gap-3 mt-2">
          <Button
            variant="gold"
            className="w-full"
            onClick={() => {
              onOpenChange(false);
              navigate("/dashboard");
            }}
          >
            <Calendar className="w-4 h-4 mr-2" />
            Go to Dashboard
          </Button>
          <Button
            variant="outline"
            className="w-full"
            onClick={() => {
              onOpenChange(false);
              navigate("/");
            }}
          >
            <Home className="w-4 h-4 mr-2" />
            Back to Homepage
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
