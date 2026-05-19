import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.25.0?target=denonext";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.8";
import { corsHeaders } from "../_shared/cors.ts";

const TAX_RATE = 0.1;

const roundCurrency = (amount: number) => Math.round(amount * 100) / 100;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const stripeSecretKey = Deno.env.get("STRIPE_SECRET_KEY");
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!stripeSecretKey) {
      return new Response(JSON.stringify({ error: "Stripe secret key is not configured for this Supabase function" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!serviceRoleKey) {
      return new Response(JSON.stringify({ error: "Supabase service role key is not configured for this Supabase function" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: "2024-06-20",
    });

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Missing authorization header" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: authHeader } } },
    );
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      serviceRoleKey,
    );

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { eventId, bookingId, seats, successUrl, cancelUrl } = await req.json();
    const seatCount = Number(seats);
    if ((!eventId && !bookingId) || !successUrl || !cancelUrl || !Number.isInteger(seatCount) || seatCount < 1) {
      return new Response(JSON.stringify({ error: "Missing required fields" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let existingBooking: { id: string; event_id: string; seats: number; status: string; total_amount: number } | null = null;

    if (bookingId) {
      const { data: booking, error: bookingError } = await supabaseAdmin
        .from("event_bookings")
        .select("id, event_id, seats, status, total_amount")
        .eq("id", bookingId)
        .eq("user_id", user.id)
        .single();

      if (bookingError || !booking) {
        return new Response(JSON.stringify({ error: "Pending booking not found" }), {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      if (booking.status !== "pending") {
        return new Response(JSON.stringify({ error: "Only pending event bookings can be paid" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      existingBooking = booking;
    }

    const resolvedEventId = existingBooking?.event_id ?? eventId;
    const resolvedSeatCount = existingBooking?.seats ?? seatCount;

    const [{ data: event, error: eventError }, { data: profile }] = await Promise.all([
      supabaseAdmin
        .from("events")
        .select("id, title, price, member_price, available_seats, is_members_only, is_published")
        .eq("id", resolvedEventId)
        .maybeSingle(),
      supabaseAdmin
        .from("profiles")
        .select("membership_tier")
        .eq("id", user.id)
        .maybeSingle(),
    ]);

    if (eventError || !event || (!existingBooking && !event.is_published)) {
      return new Response(JSON.stringify({ error: "Event not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const isMember = profile?.membership_tier === "premium";
    if (event.is_members_only && !isMember) {
      return new Response(JSON.stringify({ error: "This event is available to premium members only" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (event.available_seats < resolvedSeatCount) {
      return new Response(JSON.stringify({ error: "Not enough seats available" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const unitPrice =
      isMember && event.member_price !== null ? Number(event.member_price) : Number(event.price);
    const subtotal = roundCurrency(unitPrice * resolvedSeatCount);
    const taxAmount = roundCurrency(subtotal * TAX_RATE);
    const totalAmount = roundCurrency(subtotal + taxAmount);
    const checkoutTotal = existingBooking ? Number(existingBooking.total_amount) : totalAmount;

    let booking = existingBooking ? { id: existingBooking.id } : null;

    if (!booking) {
      const { data: createdBooking, error: bookingError } = await supabaseAdmin
        .from("event_bookings")
        .insert({
          user_id: user.id,
          event_id: event.id,
          seats: resolvedSeatCount,
          total_amount: totalAmount,
          status: "pending",
        })
        .select("id")
        .single();

      if (bookingError || !createdBooking) {
        return new Response(JSON.stringify({ error: bookingError?.message ?? "Failed to create booking" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      booking = createdBooking;
    }

    if (!Number.isFinite(checkoutTotal) || checkoutTotal <= 0) {
      return new Response(JSON.stringify({ error: "Booking total is invalid" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const lineItems = existingBooking
      ? [
          {
            quantity: 1,
            price_data: {
              currency: "aud",
              product_data: {
                name: `${event.title} booking`,
              },
              unit_amount: Math.round(checkoutTotal * 100),
            },
          },
        ]
      : [
          {
            quantity: resolvedSeatCount,
            price_data: {
              currency: "aud",
              product_data: {
                name: event.title,
              },
              unit_amount: Math.round(unitPrice * 100),
            },
          },
          ...(taxAmount > 0
            ? [
                {
                  quantity: 1,
                  price_data: {
                    currency: "aud",
                    product_data: {
                      name: "GST (10%)",
                    },
                    unit_amount: Math.round(taxAmount * 100),
                  },
                },
              ]
            : []),
        ];

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      customer_email: user.email ?? undefined,
      line_items: lineItems,
      success_url: `${successUrl}${successUrl.includes("?") ? "&" : "?"}booking_id=${booking.id}`,
      cancel_url: `${cancelUrl}${cancelUrl.includes("?") ? "&" : "?"}booking_id=${booking.id}`,
      metadata: {
        booking_id: booking.id,
        event_id: event.id,
        user_id: user.id,
      },
    });

    return new Response(JSON.stringify({ url: session.url, bookingId: booking.id }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
