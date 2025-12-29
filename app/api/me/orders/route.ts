import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../../../lib/nextauth';
import { getOrdersByCustomer } from '../../../../lib/woo';

export async function GET(req: Request) {
  try {
  // Enforce server-side session check: only allow requests from an authenticated user
  // The API uses the session's wpCustomerId to ensure we only fetch that user's orders.
  const session = (await getServerSession(authOptions as any)) as any;
  if (!session?.user?.wpCustomerId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const wpCustomerId = Number(session.user.wpCustomerId);

    // Support pagination via query params (per_page, page)
    const url = new URL(req.url);
    const per_page = url.searchParams.get('per_page') ? Number(url.searchParams.get('per_page')) : undefined;
    const page = url.searchParams.get('page') ? Number(url.searchParams.get('page')) : undefined;

    const orders = await getOrdersByCustomer(wpCustomerId, { per_page, page });
    return NextResponse.json({ orders });
  } catch (e: any) {
    console.error('orders error', e);
    return NextResponse.json({ error: e?.message || 'unknown' }, { status: 500 });
  }
}
