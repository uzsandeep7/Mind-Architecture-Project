import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CreditCard, Lock } from "lucide-react";

interface CardPaymentFormProps {
  cardDetails: {
    cardNumber: string;
    expiryDate: string;
    cvv: string;
    nameOnCard: string;
    billingEmail: string;
  };
  onCardDetailsChange: (details: CardPaymentFormProps["cardDetails"]) => void;
}

export const CardPaymentForm = ({
  cardDetails,
  onCardDetailsChange,
}: CardPaymentFormProps) => {
  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "");
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || "";
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    return parts.length ? parts.join(" ") : value;
  };

  const formatExpiryDate = (value: string) => {
    const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "");
    if (v.length >= 2) {
      return v.substring(0, 2) + "/" + v.substring(2, 4);
    }
    return v;
  };

  return (
    <div className="space-y-4">
      <div className="relative">
        <Label htmlFor="cardNumber">Card Number</Label>
        <div className="relative mt-1.5">
          <Input
            id="cardNumber"
            placeholder="1234 5678 9012 3456"
            value={cardDetails.cardNumber}
            onChange={(e) =>
              onCardDetailsChange({
                ...cardDetails,
                cardNumber: formatCardNumber(e.target.value),
              })
            }
            maxLength={19}
            className="pl-12"
          />
          <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="expiryDate">Expiry Date</Label>
          <Input
            id="expiryDate"
            placeholder="MM/YY"
            value={cardDetails.expiryDate}
            onChange={(e) =>
              onCardDetailsChange({
                ...cardDetails,
                expiryDate: formatExpiryDate(e.target.value),
              })
            }
            maxLength={5}
            className="mt-1.5"
          />
        </div>
        <div>
          <Label htmlFor="cvv">CVV</Label>
          <div className="relative mt-1.5">
            <Input
              id="cvv"
              placeholder="123"
              type="password"
              value={cardDetails.cvv}
              onChange={(e) =>
                onCardDetailsChange({
                  ...cardDetails,
                  cvv: e.target.value.replace(/[^0-9]/g, "").substring(0, 4),
                })
              }
              maxLength={4}
              className="pr-10"
            />
            <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          </div>
        </div>
      </div>

      <div>
        <Label htmlFor="nameOnCard">Name on Card</Label>
        <Input
          id="nameOnCard"
          placeholder="John Doe"
          value={cardDetails.nameOnCard}
          onChange={(e) =>
            onCardDetailsChange({ ...cardDetails, nameOnCard: e.target.value })
          }
          className="mt-1.5"
        />
      </div>

      <div>
        <Label htmlFor="billingEmail">Billing Email</Label>
        <Input
          id="billingEmail"
          type="email"
          placeholder="john@example.com"
          value={cardDetails.billingEmail}
          onChange={(e) =>
            onCardDetailsChange({ ...cardDetails, billingEmail: e.target.value })
          }
          className="mt-1.5"
        />
      </div>

      <div className="flex items-center gap-2 p-3 bg-secondary/50 rounded-lg mt-4">
        <Lock className="w-4 h-4 text-primary" />
        <span className="text-xs text-muted-foreground">
          Your payment information is encrypted and secure
        </span>
      </div>
    </div>
  );
};
