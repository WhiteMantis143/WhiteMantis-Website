import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../../../lib/nextauth";
import cartLib from "../../../../lib/cart";

// app/api/cart/route.ts
export async function DELETE(req: NextRequest) {
  const session = (await getServerSession(authOptions)) as any;
  const body = await req.json().catch(() => ({}));
  const { action, product_id, variation_id } = body;

  // 1) CLEAR CART
  if (action === "clear") {
    // logged-in
    if (session?.user?.wpCustomerId) {
      const wpCustomerId = Number(session.user.wpCustomerId);
      await cartLib.setCartForCustomer(wpCustomerId, { items: [] });
      return NextResponse.json({ ok: true, cart: { items: [] } });
    }

    // guest (cookie)
    const res = NextResponse.json({ ok: true, cart: { items: [] } });
    res.cookies.set("guest_cart_order", JSON.stringify({ items: [] }), {
      path: "/",
      httpOnly: true,
      sameSite: "lax",
    });
    return res;
  }

  // 🔹 2) REMOVE SINGLE ITEM
  if (!product_id) {
    return NextResponse.json(
      { ok: false, error: "product_id required" },
      { status: 400 }
    );
  }

  const sameVariant = (item: any) =>
    Number(item.product_id) === Number(product_id) &&
    Number(item.variation_id || 0) === Number(variation_id || 0);

  if (session?.user?.wpCustomerId) {
    const wpCustomerId = Number(session.user.wpCustomerId);
    const cart = (await cartLib.getCartForCustomer(wpCustomerId)) || {
      items: [],
    };
    const items = cart.items || [];

    const filtered = items.filter((i: any) => {
      if (variation_id != null) return !sameVariant(i);
      return Number(i.product_id) !== Number(product_id);
    });

    const newCart = { items: filtered };
    await cartLib.setCartForCustomer(wpCustomerId, newCart);
    return NextResponse.json({ ok: true, cart: newCart });
  }

  // guest cookie remove
  const cookies = req.cookies;
  const guestRaw = cookies.get("guest_cart_order")?.value;
  let guestCart = guestRaw ? JSON.parse(guestRaw) : { items: [] };

  const updatedItems = guestCart.items.filter((item: any) => {
    if (variation_id != null) return !sameVariant(item);
    return Number(item.product_id) !== Number(product_id);
  });

  const newGuestCart = { items: updatedItems };
  const res = NextResponse.json({ ok: true, cart: newGuestCart });
  res.cookies.set("guest_cart_order", JSON.stringify(newGuestCart), {
    path: "/",
    httpOnly: true,
    sameSite: "lax",
  });
  return res;
}
