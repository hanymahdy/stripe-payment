import { serve } from "https://deno.land/std@0.203.0/http/mod.ts";
import Stripe from "https://esm.sh/stripe@12.6.0?target=deno";

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!, {
  apiVersion: "2022-11-15",
});

serve(async (req) => {
  if (req.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405 });
  }

  try {
    const { amount, currency, customer_email } = await req.json();

    if (!amount || !currency || !customer_email) {
      return new Response("Missing fields", { status: 400 });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [{
        price_data: {
          currency,
          product_data: { name: "دفع التطبيق" },
          unit_amount: amount,
        },
        quantity: 1,
      }],
      mode: "payment",
      success_url: "https://getpower.infinityfreeapp.com/success.php",
      cancel_url: "https://https://getpower.infinityfreeapp.com/cancel.php",
      customer_email,
    });

    return new Response(JSON.stringify(session), {
      headers: { "Content-Type": "application/json" },
    });

  } catch (err) {
    console.error(err);
    return new Response("Server Error", { status: 500 });
  }
});