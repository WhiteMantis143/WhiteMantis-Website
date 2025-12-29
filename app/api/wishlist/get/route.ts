// app/api/wishlist/get/route.ts
import { NextResponse } from "next/server";
import { getServerSession, type Session } from "next-auth";
import { authOptions } from "../../../../lib/nextauth"; // ⬅️ adjust path if needed

// Prefer public env for client-aware URLs, but fall back to server-side WP_URL
const WP_BASE_URL = (
  process.env.NEXT_PUBLIC_WORDPRESS_URL ||
  process.env.WP_URL ||
  process.env.WORDPRESS_URL
)?.replace(/\/$/, "");

if (!WP_BASE_URL) {
  console.warn(
    "[wishlist] WordPress base URL not set (set NEXT_PUBLIC_WORDPRESS_URL or WP_URL)"
  );
}

// Shared secret used to talk to WordPress wishlist endpoints
const INTERNAL_SECRET = process.env.NEXTAUTH_SECRET;

/** simple normalizer for WC Store product response */
function normalizeProduct(raw: any) {
  return {
    id: raw.id ?? raw.product_id ?? null,
    name:
      raw.name ??
      raw.title ??
      raw.product_name ??
      raw.post_title ??
      (raw.title && raw.title.rendered) ??
      "",
    price_html: raw.price_html ?? raw.formatted_price ?? raw.price ?? null,
    price: raw.price ?? raw.regular_price ?? null,
    images:
      Array.isArray(raw.images) && raw.images.length
        ? raw.images.map((img: any) => ({
            src: img.src ?? img.url ?? img.srcUrl ?? null,
            alt: img.alt ?? null,
          }))
        : raw.image
        ? [{ src: raw.image }]
        : [],
    raw,
  };
}

export async function GET() {
  if (!WP_BASE_URL) {
    return NextResponse.json(
      { message: "Server configuration error" },
      { status: 500 }
    );
  }

  if (!INTERNAL_SECRET) {
    console.error("[wishlist] NEXTAUTH_SECRET is not set in environment");
    return NextResponse.json(
      { message: "Server configuration error (missing NEXTAUTH_SECRET)" },
      { status: 500 }
    );
  }

  try {
    // 1) Get NextAuth session (typed) and ensure user is logged in
    const session = (await getServerSession(authOptions)) as Session | null;

    if (!session || !session.user) {
      return NextResponse.json(
        { message: "Not authenticated" },
        { status: 401 }
      );
    }

    const userAny = session.user as any;
    const wpCustomerId: number | undefined = userAny.wpCustomerId;

    if (!wpCustomerId) {
      return NextResponse.json(
        { message: "No WordPress user ID (wpCustomerId) on session" },
        { status: 400 }
      );
    }

    // 2) Get wishlist from WP using user_id (matches updated PHP)
    const forwardHeaders: Record<string, string> = {
      Accept: "application/json",
      "X-Nextauth-Secret": INTERNAL_SECRET, // 🔒 must match hard-coded NEXTAUTH_SECRET in PHP
    };

    const wpResp = await fetch(
      `${WP_BASE_URL}/wp-json/my-wishlist/v1/get?user_id=${wpCustomerId}`,
      {
        method: "GET",
        headers: forwardHeaders,
        cache: "no-store",
      }
    );

    // parse JSON, fallback to text
    let data: any;
    try {
      data = await wpResp.json();
    } catch {
      const t = await wpResp.text();
      data = { raw: t };
    }

    if (!wpResp.ok) {
      return NextResponse.json(
        {
          message: "WordPress returned non-OK",
          status: wpResp.status,
          wpBody: data,
        },
        { status: 502 }
      );
    }

    // 3) Extract wishlist items (ids or objects)
    let rawItems: any[] = [];
    if (Array.isArray(data)) {
      rawItems = data;
    } else if (Array.isArray(data.items)) {
      rawItems = data.items;
    } else if (Array.isArray(data.data)) {
      rawItems = data.data;
    } else if (data.wishlist_items && Array.isArray(data.wishlist_items)) {
      rawItems = data.wishlist_items;
    } else {
      const found = Object.values(data).find((v) => Array.isArray(v));
      rawItems = (found as any[]) ?? [];
    }

    // 4) Split ids vs objects
    const idList: number[] = rawItems
      .filter(
        (x) =>
          typeof x === "number" || (typeof x === "string" && /^\d+$/.test(x))
      )
      .map((x) => Number(x));

    const objectItems: any[] = rawItems.filter(
      (x) => typeof x === "object" && x !== null
    );

    const productFetches: Promise<any>[] = [];

    // For each id, fetch WC Store product
    for (const id of idList) {
      const url = `${WP_BASE_URL}/wp-json/wc/store/v1/products/${id}`;
      productFetches.push(
        fetch(url, {
          method: "GET",
          headers: { Accept: "application/json" }, // Store API usually doesn't need auth
          cache: "no-store",
        })
          .then(async (r) => {
            if (!r.ok) {
              const txt = await r.text().catch(() => "");
              console.warn(
                `[wishlist/get] product ${id} fetch failed:`,
                r.status,
                txt
              );
              return null;
            }
            try {
              return await r.json();
            } catch {
              const t = await r.text().catch(() => "");
              return { raw: t };
            }
          })
          .catch((err) => {
            console.error(`[wishlist/get] product ${id} fetch error:`, err);
            return null;
          })
      );
    }

    const fetchedProducts = (await Promise.all(productFetches)).filter(Boolean);

    // Normalize both fetchedProducts and objectItems
    const normalizedFromFetched = fetchedProducts.map((p) =>
      normalizeProduct(p)
    );
    const normalizedFromObjects = objectItems.map((o) => normalizeProduct(o));

    // Preserve numeric id order, then append object items
    const numericOrderNormalized = idList
      .map((id) =>
        normalizedFromFetched.find((p) => Number(p.id) === Number(id))
      )
      .filter(Boolean) as any[];

    const combined = [...numericOrderNormalized, ...normalizedFromObjects];

    let finalItems = combined;
    if (finalItems.length === 0 && objectItems.length > 0) {
      finalItems = objectItems.map((o) => normalizeProduct(o));
    }

    return NextResponse.json({ items: finalItems }, { status: 200 });
  } catch (err: any) {
    console.error("Wishlist GET proxy error:", err);
    return NextResponse.json(
      { message: "Internal server error", error: String(err) },
      { status: 500 }
    );
  }
}
