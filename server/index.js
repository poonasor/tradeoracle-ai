import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import Stripe from "stripe";

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
if (!stripeSecretKey) {
  throw new Error("Missing STRIPE_SECRET_KEY in environment");
}

const stripe = new Stripe(stripeSecretKey);

const app = express();
app.use(cors());
app.use(express.json());

app.get("/api/health", (_req, res) => {
  res.json({ ok: true });
});

app.post("/api/create-checkout-session", async (req, res) => {
  try {
    const { uid, email } = req.body || {};
    if (!uid) {
      res.status(400).json({ error: "Missing uid" });
      return;
    }

    const origin = req.headers.origin || "http://localhost:3000";

    const customerEmail =
      typeof email === "string" && email.trim().length > 0
        ? email.trim()
        : undefined;

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      client_reference_id: uid,
      metadata: { uid: String(uid) },
      ...(customerEmail ? { customer_email: customerEmail } : {}),
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: "usd",
            unit_amount: 799,
            recurring: { interval: "month" },
            product_data: {
              name: "TradeOracle AI Pro",
            },
          },
        },
      ],
      subscription_data: {
        trial_period_days: 7,
      },
      success_url: `${origin}/dashboard?success=1&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/upgrade?canceled=1`,
    });

    res.json({ url: session.url });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create checkout session" });
  }
});

const port = Number(process.env.PORT || 4242);
app.listen(port, () => {
  console.log(`Stripe API server listening on http://localhost:${port}`);
});
