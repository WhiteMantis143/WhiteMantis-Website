import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../../../lib/nextauth";
import cartLib from "../../../../lib/cart";

const WP_API_BASE = process.env.WP_URL
  ? process.env.WP_URL.replace(/\/$/, "")
  : "";

export async function POST(req: NextRequest) {
  const session = (await getServerSession(authOptions)) as any;

  const body = await req.json().catch(() => ({}));
  const billing = body?.billing || null;

  console.log("session : ", session);

  console.log("billing : ", billing);

  // Logged in user flow
  if (session?.user?.wpCustomerId) {
    try {
      const wpCustomerId = Number(session.user.wpCustomerId);
      const customerData = session.user;

      const cart = (await cartLib.getCartForCustomer(wpCustomerId)) || {
        items: [],
      };

      console.log("Checkout logged in user, cart items:", cart);

      const items = Array.isArray(cart.items) ? cart.items : [];

      if (!items.length) {
        return NextResponse.json(
          { ok: false, error: "No items in cart" },
          { status: 400 }
        );
      }

      const line_items = items.map((it: any) => ({
        product_id: Number(it.product_id),
        quantity: Number(it.quantity) || 0,
        ...(it.variation_id && { variation_id: Number(it.variation_id) }),
      }));

      const authHeader =
        "Basic " +
        Buffer.from(
          `${process.env.WC_CONSUMER_KEY}:${process.env.WC_CONSUMER_SECRET}`
        ).toString("base64");

      const payload: any = {
        status: "pending",
        customer_id: wpCustomerId,
        line_items,
      };

      if (body?.billing) payload.billing = body.billing;

      payload.billing = {
        ...payload.billing,
        email: customerData.email || payload.billing?.email || "",
      };

      const url = `${WP_API_BASE}/wp-json/wc/v3/orders`;

      const res = await fetch(url, {
        method: "POST",
        headers: {
          Authorization: authHeader,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        console.error("WooCommerce order create error:", data);
        return NextResponse.json({ ok: false, error: data }, { status: 500 });
      }

      return NextResponse.json(
        { ok: true, order_id: data.id },
        { status: 200 }
      );
    } catch (error) {
      console.log("Checkout error logged users:", error);
      return NextResponse.json(
        { ok: false, error: String((error as any)?.message || error) },
        { status: 500 }
      );
    }
  }

  // Guest checkout flow

  if (!billing) {
    return NextResponse.json(
      {
        ok: false,
        error: "Billing information is required for guest checkout",
      },
      { status: 400 }
    );
  }

  // Guest checkout flow
  try {
    const cookies = req.cookies;
    const cookieVal = cookies.get("guest_cart_order")?.value;

    if (!cookieVal) {
      return NextResponse.json(
        { ok: false, error: "No guest cart found" },
        { status: 400 }
      );
    }

    const parsed = JSON.parse(cookieVal);
    const items = Array.isArray(parsed.items) ? parsed.items : [];

    if (!items.length) {
      return NextResponse.json(
        { ok: false, error: "No items in guest cart" },
        { status: 400 }
      );
    }

    const line_items = items.map((it: any) => ({
      product_id: Number(it.product_id),
      quantity: Number(it.quantity) || 0,
      ...(it.variation_id && { variation_id: Number(it.variation_id) }),
    }));

    const authHeader =
      "Basic " +
      Buffer.from(
        `${process.env.WC_CONSUMER_KEY}:${process.env.WC_CONSUMER_SECRET}`
      ).toString("base64");

    const payload: any = {
      status: "pending",
      line_items,
    };

    if (billing) {
      payload.billing = billing;
    }

    const url = `${WP_API_BASE}/wp-json/wc/v3/orders`;
    const res = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: authHeader,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json();

    if (!res.ok) {
      console.error("WooCommerce guest order error:", data);
      return NextResponse.json({ ok: false, error: data }, { status: 500 });
    }

    const out = NextResponse.json(
      { ok: true, order_id: data.id },
      { status: 200 }
    );

    out.cookies.delete("guest_cart_order");

    return out;
  } catch (e) {
    console.error("Guest checkout error:", e);
    return NextResponse.json(
      { ok: false, error: String((e as any)?.message || e) },
      { status: 500 }
    );
  }
}
