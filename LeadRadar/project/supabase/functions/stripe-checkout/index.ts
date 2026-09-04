import { createClient } from "npm:@supabase/supabase-js@2.57.4";
import Stripe from "npm:stripe@16.10.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!, {
      apiVersion: "2025-03-31.basil",
    });

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Missing auth token" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userErr } = await supabase.auth.getUser(token);
    if (userErr || !userData.user) {
      return new Response(JSON.stringify({ error: "Invalid token" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const userId = userData.user.id;
    const userEmail = userData.user.email;

    const body = await req.json();
    const { priceId, mode, successUrl, cancelUrl, plan } = body;

    if (!priceId) {
      return new Response(JSON.stringify({ error: "Missing priceId" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const checkoutMode: "subscription" | "payment" = mode === "payment" ? "payment" : "subscription";
    const success = successUrl || `${req.headers.get("origin") || "http://localhost:5173"}/?checkout=success`;
    const cancel = cancelUrl || `${req.headers.get("origin") || "http://localhost:5173"}/?checkout=cancel`;

    let customerId: string;

    const { data: existingSub } = await supabase
      .from("subscriptions")
      .select("stripe_customer_id")
      .eq("user_id", userId)
      .maybeSingle();

    if (existingSub?.stripe_customer_id) {
      try {
        await stripe.customers.retrieve(existingSub.stripe_customer_id);
        customerId = existingSub.stripe_customer_id;
      } catch {
        // Stored customer ID is invalid for the current API key
        // (e.g. created in test mode, now using live key). Create a new one.
        const customer = await stripe.customers.create({
          email: userEmail,
          metadata: { supabase_user_id: userId },
        });
        customerId = customer.id;

        await supabase.from("subscriptions").upsert(
          {
            user_id: userId,
            stripe_customer_id: customerId,
            plan: "free",
            status: "free",
          },
          { onConflict: "user_id" }
        );
      }
    } else {
      const customer = await stripe.customers.create({
        email: userEmail,
        metadata: { supabase_user_id: userId },
      });
      customerId = customer.id;

      await supabase.from("subscriptions").upsert(
        {
          user_id: userId,
          stripe_customer_id: customerId,
          plan: "free",
          status: "free",
        },
        { onConflict: "user_id" }
      );
    }

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: checkoutMode,
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: success,
      cancel_url: cancel,
      metadata: { supabase_user_id: userId, plan: plan || "" },
    });

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : "Unknown error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
