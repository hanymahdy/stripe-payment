// main.ts

import { serve } from "https://deno.land/std@0.203.0/http/mod.ts";
import Stripe from "https://esm.sh/stripe@12.6.0?target=deno";

// احصل على مفتاح Stripe السري من متغيرات البيئة
const stripe = new Stripe(Deno.env.get("sk_test_51RY4MHFYktepKbNrKGm1GTT81E3VgDWA0SCChvW41vJkl5HVzIzab2S1SET1nIslgemW6S28IiXlsvi93Om7CrRx00UHOn1iIE")!, {
  apiVersion: "2022-11-15",
});

serve(async (req) => {
  if (req.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405 });
  }

  try {
    const { amount, currency, customer_email } = await req.json();

    if (!amount || !currency || !customer_email) {
      return new Response("Missing required fields", { status: 400 });
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
      cancel_url: "https://getpower.infinityfreeapp.com/cancel.php",
      customer_email,
    });

    return new Response(JSON.stringify(session), {
      headers: { "Content-Type": "application/json" },
    });

  } catch (err) {
    console.error(err);
    return new Response("Internal Server Error", { status: 500 });
  }
});