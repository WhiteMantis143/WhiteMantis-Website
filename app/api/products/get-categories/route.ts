// app/api/products/categories/route.ts
import { NextResponse } from "next/server";
// ⬇️ adjust this import path to wherever you saved that big Woo helper file
import { fetchProductCategories } from "../../../../lib/woo";

// GET /api/products/categories?parent=0&slug=rings&per_page=50
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    const parentParam = searchParams.get("parent");
    const slugParam = searchParams.get("slug");
    const perPageParam = searchParams.get("per_page");

    // If caller provides a parent param use it. Otherwise leave parent undefined
    // so callers that search by slug will not be constrained to a hard-coded
    // parent id (previous default 32 caused non-slug requests to always return
    // categories under that parent, which made other shop pages resolve the
    // wrong category - e.g. coffee beans).
    const parent =
      parentParam !== null && parentParam !== "" ? Number(parentParam) : undefined;

    const per_page = perPageParam ? Number(perPageParam) : 100;
    const slug = slugParam || undefined;

    // Call your helper function
    const categories = await fetchProductCategories({
      parent,
      slug,
      per_page,
    });

    return NextResponse.json(categories, { status: 200 });
  } catch (err: any) {
    console.error("API /api/products/categories error:", err);

    return NextResponse.json(
      {
        message: err?.message || "Failed to fetch product categories",
        // if you want to debug: body: err?.body, status: err?.status
      },
      { status: err?.status && Number(err.status) >= 400 ? err.status : 500 }
    );
  }
}
