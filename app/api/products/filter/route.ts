import { NextResponse } from "next/server";
import { fetchProductsByCategory } from "../../../../lib/woo";

// GET /api/products/filter?category=12&categories=13,14&per_page=24&page=1
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    const category = searchParams.get("category");
    const categories = searchParams.get("categories"); // comma separated child category ids
    const per_page = Number(searchParams.get("per_page") || 24);
    const page = Number(searchParams.get("page") || 1);

    // If specific child categories provided, use them as the category filter (Woo accepts comma-separated ids)
    const categoryParam = categories || category;

    const products = await fetchProductsByCategory(categoryParam || '', { per_page, page });

    return NextResponse.json(products, { status: 200 });
  } catch (err: any) {
    console.error("API /products/filter error:", err);
    return NextResponse.json({ message: err?.message || "Failed to fetch products" }, { status: err?.status || 500 });
  }
}
