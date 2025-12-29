import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../../../../lib/nextauth';
import cartLib from '../../../../../lib/cart';
import { getCustomerById, findCustomerByEmail, updateCustomerById } from '../../../../../lib/woo';

// Merge guest order billing into the logged-in user's Woo profile.
// Strategy: fill-if-empty only (do not overwrite existing profile values).
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions as any);
    const s = session as any;
    if (!s || !s.user) return NextResponse.json({ ok: false, message: 'Not authenticated' }, { status: 401 });

    // Read guest order cookie from request headers (Next.js request headers available on server)
    // Note: in app router handlers, cookies are available via req.cookies in NextRequest, but here we use Request.
    // As a safe fallback, inspect Cookie header.
    const cookieHeader = (req as any).headers?.get ? (req as any).headers.get('cookie') : null;
    let guestOrderId: number | null = null;
    if (cookieHeader) {
      // Check for guest_last_order (set after checkout) first, then fallback to guest_cart_order
      const parts = cookieHeader.split(';').map(c => c.trim());
      const last = parts.find(c => c.startsWith('guest_last_order='));
      const cart = parts.find(c => c.startsWith('guest_cart_order='));
      const found = last || cart;
      if (found) guestOrderId = Number(found.split('=')[1]);
    }

    if (!guestOrderId) return NextResponse.json({ ok: false, message: 'No guest order' }, { status: 200 });

    const order = await cartLib.fetchOrderById(Number(guestOrderId)).catch(() => null);
    if (!order) return NextResponse.json({ ok: false, message: 'Guest order not found' }, { status: 200 });

    const billing = order.billing || null;
    if (!billing) return NextResponse.json({ ok: false, message: 'No billing on guest order' }, { status: 200 });

    // Determine WP customer id
    let wpCustomerId = s.user?.wpCustomerId;
    if (!wpCustomerId) {
      const found = await findCustomerByEmail(s.user.email).catch(() => null);
      if (found) wpCustomerId = found.id;
    }
    if (!wpCustomerId) return NextResponse.json({ ok: false, message: 'Could not determine customer id' }, { status: 400 });

    // Load existing customer to decide merge behavior
    const customer = await getCustomerById(wpCustomerId).catch(() => null);
    const existingBilling = customer?.billing || {};

    // Only fill fields that are empty in profile (fill-if-empty). Build payload accordingly.
    const payload: any = { billing: {}, shipping: {} };
    const fields = ['first_name','last_name','address_1','address_2','city','state','postcode','country','phone'];
    let anyUpdate = false;
    for (const f of fields) {
      const val = billing[f];
      const existing = existingBilling[f];
      if ((existing === undefined || existing === null || existing === '') && val) {
        payload.billing[f] = val;
        payload.shipping[f] = val;
        anyUpdate = true;
      }
    }

    if (anyUpdate) {
      const updated = await updateCustomerById(wpCustomerId, payload).catch((err) => { console.error('merge update failed', err); return null; });
      // delete guest cookie by returning Set-Cookie header that clears it (NextResponse helper)
  const out = NextResponse.json({ ok: true, merged: !!updated, customer: updated || null }, { status: 200 });
  // clear both cookies if present
  out.cookies.delete('guest_cart_order');
  out.cookies.delete('guest_last_order');
  return out;
    }

    return NextResponse.json({ ok: true, merged: false, message: 'Nothing to merge' }, { status: 200 });
  } catch (e: any) {
    console.error('merge-guest error', e);
    return NextResponse.json({ ok: false, message: String(e?.message || e) }, { status: 500 });
  }
}
