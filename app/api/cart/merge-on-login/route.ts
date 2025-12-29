import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../../../lib/nextauth";
import cartLib from "../../../../lib/cart";

async function getSession(req: NextRequest): Promise<any> {
  try {
    const session = (await getServerSession(authOptions)) as any;
    return session;
  } catch (e) {
    return null;
  }
}

export async function POST(req: NextRequest) {
  const session = await getSession(req);
  if (!session?.user?.wpCustomerId) {
    return NextResponse.json({ ok: false, error: "Not authenticated" }, { status: 401 });
  }

  const wpCustomerId = Number(session.user.wpCustomerId);
  const cookies = req.cookies;
  const guestRaw = cookies.get("guest_cart_order")?.value;

  // If there's no guest cookie, just return the existing server cart
  if (!guestRaw) {
    try {
      const cart = (await cartLib.getCartForCustomer(wpCustomerId)) || { items: [] };
      return NextResponse.json({ ok: true, cart });
    } catch (err: any) {
      return NextResponse.json({ ok: false, error: String(err?.message || err) }, { status: 500 });
    }
  }

  let guestCart: any = { items: [] };
  try {
    guestCart = JSON.parse(guestRaw) || { items: [] };
  } catch (e) {
    // malformed cookie — treat as empty
    guestCart = { items: [] };
  }

  try {
    const serverCart = (await cartLib.getCartForCustomer(wpCustomerId)) || { items: [] };
    const mergedMap: any = {};

    const pushItem = (it: any) => {
      const pid = Number(it.product_id);
      const vid = Number(it.variation_id || 0);
      const key = `${pid}:${vid}`;
      if (!mergedMap[key]) {
        // clone to avoid mutating source
        mergedMap[key] = { ...it, product_id: pid, variation_id: it.variation_id ? Number(it.variation_id) : undefined, quantity: Number(it.quantity || 0) };
      } else {
        mergedMap[key].quantity = Number(mergedMap[key].quantity || 0) + Number(it.quantity || 0);
      }
    };

    // Add existing server items
    (serverCart.items || []).forEach(pushItem);
    // Merge in guest items (summing quantities)
    (guestCart.items || []).forEach(pushItem);

    const mergedItems = Object.keys(mergedMap).map((k) => mergedMap[k]);
    const newCart = { items: mergedItems };

    // Persist merged cart to customer's meta (this writes to cart:web:v1 via lib/cart.ts)
    await cartLib.setCartForCustomer(wpCustomerId, newCart);

    const res = NextResponse.json({ ok: true, cart: newCart });
    // Clear guest cookie after successful merge
    res.cookies.set("guest_cart_order", "", { path: "/", httpOnly: true, sameSite: "lax", maxAge: 0 });
    return res;
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: String(err?.message || err) }, { status: 500 });
  }
}
