import { createClient } from "npm:@supabase/supabase-js@2.57.4";
import Stripe from "npm:stripe@16.10.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const PRODUCT_PLAN_MAP: Record<string, string> = {
  prod_V8jgJhLb11dAnr: "starter",
  prod_V8jgrTYPo6uRbc: "pro",
  prod_V8jhp68aPWtdis: "agency",
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

    const sig = req.headers.get("stripe-signature");
    const body = await req.text();
    if (!sig) {
      return new Response(JSON.stringify({ error: "Missing signature" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const event = stripe.webhooks.constructEvent(
      body,
      sig,
      Deno.env.get("STRIPE_WEBHOOK_SECRET")!
    );

    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.metadata?.supabase_user_id;
        const plan = session.metadata?.plan;
        if (userId && plan) {
          await supabase
            .from("subscriptions")
            .upsert(
              {
                user_id: userId,
                stripe_customer_id: session.customer as string,
                stripe_subscription_id: session.subscription as string,
                plan,
                status: "active",
                searches_used: 0,
                current_period_end: new Date(
                  (session.expires_at ?? 0) * 1000
                ).toISOString(),
                updated_at: new Date().toISOString(),
              },
              { onConflict: "user_id" }
            );
        }
        break;
      }

      case "customer.subscription.updated":
      case "customer.subscription.created": {
        const sub = event.data.object as Stripe.Subscription;
        const customerId = sub.customer as string;
        const productId = sub.items.data[0]?.price?.product as string;
        const plan = PRODUCT_PLAN_MAP[productId] ?? "free";
        const status = sub.status;

        const { data: subRow } = await supabase
          .from("subscriptions")
          .select("user_id")
          .eq("stripe_customer_id", customerId)
          .maybeSingle();

        if (subRow) {
          await supabase
            .from("subscriptions")
            .update({
              plan,
              status,
              stripe_subscription_id: sub.id,
              current_period_end: new Date(
                sub.current_period_end * 1000
              ).toISOString(),
              updated_at: new Date().toISOString(),
            })
            .eq("user_id", subRow.user_id);
        }
        break;
      }

      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription;
        const customerId = sub.customer as string;
        await supabase
          .from("subscriptions")
          .update({
            status: "canceled",
            plan: "free",
            updated_at: new Date().toISOString(),
          })
          .eq("stripe_customer_id", customerId);
        break;
      }
    }

    return new Response(JSON.stringify({ received: true }), {
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
