import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.25.0?target=denonext";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.8";
import { corsHeaders } from "../_shared/cors.ts";

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") ?? "", {
  apiVersion: "2024-06-20",
});

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

    const { consultation, successUrl, cancelUrl } = await req.json();
    const price = Number(consultation?.price);
    const serviceTitle = String(consultation?.serviceTitle ?? "Consultation");

    if (!consultation?.date || !consultation?.topic || !successUrl || !cancelUrl || !Number.isFinite(price) || price <= 0) {
      return new Response(JSON.stringify({ error: "Missing required consultation checkout fields" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: savedConsultation, error: consultationError } = await supabaseAdmin
      .from("consultations")
      .insert({
        user_id: user.id,
        date: consultation.date,
        topic: consultation.topic,
        message: consultation.message ?? null,
        status: "payment_pending",
      })
      .select("id")
      .single();

    if (consultationError || !savedConsultation) {
      return new Response(JSON.stringify({ error: consultationError?.message ?? "Failed to create consultation" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      customer_email: user.email ?? undefined,
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: "aud",
            product_data: {
              name: serviceTitle,
            },
            unit_amount: Math.round(price * 100),
          },
        },
      ],
      success_url: `${successUrl}${successUrl.includes("?") ? "&" : "?"}consultation_id=${savedConsultation.id}`,
      cancel_url: `${cancelUrl}${cancelUrl.includes("?") ? "&" : "?"}consultation_id=${savedConsultation.id}`,
      metadata: {
        consultation_id: savedConsultation.id,
        user_id: user.id,
      },
    });

    return new Response(JSON.stringify({ url: session.url, consultationId: savedConsultation.id }), {
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
