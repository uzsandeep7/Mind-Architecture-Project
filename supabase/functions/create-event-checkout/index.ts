import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.25.0?target=denonext";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.8";
import { corsHeaders } from "../_shared/cors.ts";

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") ?? "", {
  apiVersion: "2024-06-20",
});

const TAX_RATE = 0.1;

const roundCurrency = (amount: number) => Math.round(amount * 100) / 100;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
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
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
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

    const { eventId, seats, successUrl, cancelUrl } = await req.json();
    const seatCount = Number(seats);
    if (!eventId || !successUrl || !cancelUrl || !Number.isInteger(seatCount) || seatCount < 1) {
      return new Response(JSON.stringify({ error: "Missing required fields" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const [{ data: event, error: eventError }, { data: profile }] = await Promise.all([
      supabase
        .from("events")
        .select("id, title, price, member_price, available_seats, is_members_only, is_published")
        .eq("id", eventId)
        .maybeSingle(),
      supabase
        .from("profiles")
        .select("membership_tier")
        .eq("id", user.id)
        .maybeSingle(),
    ]);

    if (eventError || !event || !event.is_published) {
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

    if (event.available_seats < seatCount) {
      return new Response(JSON.stringify({ error: "Not enough seats available" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const unitPrice =
      isMember && event.member_price !== null ? Number(event.member_price) : Number(event.price);
    const subtotal = roundCurrency(unitPrice * seatCount);
    const taxAmount = roundCurrency(subtotal * TAX_RATE);
    const totalAmount = roundCurrency(subtotal + taxAmount);

    const { data: booking, error: bookingError } = await supabaseAdmin
      .from("event_bookings")
      .insert({
        user_id: user.id,
        event_id: event.id,
        seats: seatCount,
        total_amount: totalAmount,
        status: "pending",
      })
      .select("id")
      .single();

    if (bookingError || !booking) {
      return new Response(JSON.stringify({ error: bookingError?.message ?? "Failed to create booking" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const lineItems = [
      {
        quantity: seatCount,
        price_data: {
          currency: "aud",
          product_data: {
            name: event.title,
          },
          unit_amount: Math.round(unitPrice * 100),
        },
      },
    ];

    if (taxAmount > 0) {
      lineItems.push({
        quantity: 1,
        price_data: {
          currency: "aud",
          product_data: {
            name: "GST (10%)",
          },
          unit_amount: Math.round(taxAmount * 100),
        },
      });
    }

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
