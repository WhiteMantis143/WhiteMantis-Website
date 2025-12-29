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

export async function GET(req: NextRequest) {
  const session = await getSession(req);
  const cookies = req.cookies;

  try {
    // Logged-in user – fetch cart from DB/WooCommerce
    if (session?.user?.wpCustomerId) {
      const wpCustomerId = Number(session.user.wpCustomerId);

      try {
        const cart = await cartLib.getCartForCustomer(wpCustomerId);
        return NextResponse.json({ ok: true, cart });
      } catch (error) {
        console.log("Error fetching cart for logged-in user:", error);
      }
    }

    // Guest user – read cart directly from cookie `guest_cart_order`
    const guestCartRaw = cookies.get("guest_cart_order")?.value;

    if (guestCartRaw) {
      try {
        const guestCart = JSON.parse(guestCartRaw);
        return NextResponse.json({ ok: true, cart: guestCart });
      } catch (e) {
        console.log("Failed to parse guest_cart_order cookie:", e);
        return NextResponse.json({ ok: true, cart: { items: [] } });
      }
    }

    return NextResponse.json({ ok: true, cart: { items: [] } });
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: String(e?.message || e) },
      { status: 500 }
    );
  }
}
