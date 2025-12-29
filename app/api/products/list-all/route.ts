// app/api/products/route.ts
import { NextResponse } from "next/server";
import { fetchProducts } from "../../../../lib/woocommerce";

// GET /api/products?per_page=12&page=1
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    const per_page = Number(searchParams.get("per_page") || 12);
    const page = Number(searchParams.get("page") || 1);

    const products = await fetchProducts({ per_page, page });

    return NextResponse.json(products, { status: 200 });
  } catch (error: any) {
    console.error("API /products error:", error);

    return NextResponse.json(
      {
        message: error?.message || "Failed to fetch products",
      },
      { status: 500 }
    );
  }
}
