import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../../../lib/nextauth";
import cartLib from "../../../../lib/cart";
import { fetchProductById } from "../../../../lib/woocommerce";

export async function POST(req: NextRequest) {
  const session = (await getServerSession(authOptions)) as any;

  const body = await req.json().catch(() => ({}));
  const { product_id, quantity = 1, price } = body;
  let { variation_id } = body;

  console.log("Add to cart body:", body);

  if (!product_id || !quantity) {
    return NextResponse.json(
      { ok: false, error: "product_id required" },
      { status: 400 }
    );
  }

  try {
    // Fetch product (used for both logged-in and guest carts)
    const productResponse = await fetchProductById(product_id);

    if (!productResponse || (productResponse as any).error) {
      return NextResponse.json(
        { ok: false, error: "Product not found" },
        { status: 404 }
      );
    }

    // Compute unit price (same logic as before)
    let unitPrice = 0;
    let selectedVariation: any = null;

    if (
      productResponse.type === "variable" &&
      Array.isArray(productResponse.variation_options) &&
      productResponse.variation_options.length > 0
    ) {
      console.log("Variable product detected.");

      if (!variation_id) {
        variation_id = productResponse.variation_options[0].id;
      }

      selectedVariation = productResponse.variation_options.find(
        (variation: any) => Number(variation.id) === Number(variation_id)
      );

      if (!selectedVariation) {
        return NextResponse.json(
          { ok: false, error: "Selected variation not found" },
          { status: 400 }
        );
      }

      unitPrice = Number(selectedVariation.price) || 0;
      console.log("Selected Variation:", selectedVariation);
    } else {
      console.log("Normal product detected.");
      unitPrice =
        Number(productResponse?.price) ||
        Number(productResponse?.regular_price) ||
        Number(productResponse?.sale_price) ||
        Number(price) ||
        0;
    }

    const qty = Number(quantity) || 0;

    const sameItem = (item: any) =>
      Number(item.product_id) === Number(product_id) &&
      Number(item.variation_id || 0) === Number(variation_id || 0);

    // helper to add/update an item in cart items
    const upsertItem = (items: any[] = []) => {
      const arr = Array.isArray(items) ? [...items] : [];
      const existing = arr.find(sameItem);

      if (existing) {
        existing.quantity = Number(existing.quantity || 0) + qty;
        existing.price = unitPrice;
        existing.subtotal = unitPrice * Number(existing.quantity || 0);
      } else {
        arr.push({
          product_id: Number(product_id),
          ...(variation_id && { variation_id: Number(variation_id) }),
          quantity: qty,
          price: unitPrice,
          subtotal: unitPrice * qty,
          name: productResponse.name,
        });
      }

      return arr;
    };

    try {
      // Logged-in user branch (same as before)
      if (session?.user?.wpCustomerId && session.user && session) {
        const wpCustomerId = Number(session.user.wpCustomerId);

        const cart = (await cartLib.getCartForCustomer(wpCustomerId)) || {
          items: [],
        };

        const items = upsertItem(cart.items);
        const newCart = { items };

        await cartLib.setCartForCustomer(wpCustomerId, newCart);

        return NextResponse.json({ ok: true, cart: newCart });
      }
    } catch (error) {
      console.log(
        "Error in logged-in user branch in Add to cart Route :",
        error
      );
    }

    try {
      let guestCart: { items: any[] } = { items: [] };

      const existingCookie = req.cookies.get("guest_cart_order")?.value;
      if (existingCookie) {
        try {
          const parsed = JSON.parse(existingCookie);
          if (parsed && Array.isArray(parsed.items)) {
            guestCart.items = parsed.items;
          }
        } catch (e) {
          console.warn("Invalid guest_cart_order cookie, resetting.", e);
        }
      }

      const items = upsertItem(guestCart.items);
      const newCart = { items };

      const res = NextResponse.json({ ok: true, cart: newCart, guest: true });

      res.cookies.set("guest_cart_order", JSON.stringify(newCart), {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24,
      });

      return res;
    } catch (error) {
      console.log("Error in guest cart branch in Add to cart Route :", error);
    }
  } catch (error) {
    console.error("Error adding to cart:", error);
    return NextResponse.json(
      { ok: false, error: String((error as any)?.message || error) },
      { status: 500 }
    );
  }
}
