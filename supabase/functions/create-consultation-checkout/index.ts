import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.25.0?target=denonext";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.8";
import { corsHeaders } from "../_shared/cors.ts";

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

    const { consultation, consultationId, successUrl, cancelUrl } = await req.json();
    const price = Number(consultation?.price);
    const serviceTitle = String(consultation?.serviceTitle ?? "Consultation");

    if (!consultation?.date || !consultation?.topic || !successUrl || !cancelUrl || !Number.isFinite(price) || price <= 0) {
      return new Response(JSON.stringify({ error: "Missing required consultation checkout fields" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let savedConsultation: { id: string } | null = null;

    if (consultationId) {
      const { data: existingConsultation, error: existingError } = await supabaseAdmin
        .from("consultations")
        .select("id, user_id, status")
        .eq("id", consultationId)
        .eq("user_id", user.id)
        .single();

      if (existingError || !existingConsultation) {
        return new Response(JSON.stringify({ error: "Pending consultation not found" }), {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      if (existingConsultation.status !== "payment_pending") {
        return new Response(JSON.stringify({ error: "Only payment pending consultations can be paid" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      savedConsultation = { id: existingConsultation.id };
    } else {
      const { data: createdConsultation, error: consultationError } = await supabaseAdmin
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

      if (consultationError || !createdConsultation) {
        return new Response(JSON.stringify({ error: consultationError?.message ?? "Failed to create consultation" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      savedConsultation = createdConsultation;
    }

    if (!savedConsultation) {
      return new Response(JSON.stringify({ error: "Failed to prepare consultation checkout" }), {
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
