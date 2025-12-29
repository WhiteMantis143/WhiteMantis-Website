import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../../../../lib/nextauth';
import { updateCustomerById, findCustomerByEmail } from '../../../../../lib/woo';

export async function POST(req: Request) {
  try {
  const session = await getServerSession(authOptions as any);
  const s = session as any;
  if (!s || !s.user) return NextResponse.json({ message: 'Not authenticated' }, { status: 401 });

  const body = await req.json();
  const { country, city, postcode, address_1, address_2, state, phone, first_name, last_name } = body || {};

  // derive first/last name from session if not provided in the body
  let fn = first_name;
  let ln = last_name;
  if ((!fn || !ln) && s.user?.name) {
    const nameRaw = (s.user.name || '').trim();
    const parts = nameRaw.split(/\s+/);
    if (parts.length === 1) {
      // If the single token contains separators like '.' '_' or '-', split on the last one.
      const m = nameRaw.match(/(.+)[._-](.+)$/);
      if (m) {
        if (!fn) fn = m[1];
        if (!ln) ln = m[2];
      } else {
        // single token with no separator — treat as first name
        if (!fn) fn = parts[0] || '';
        if (!ln) ln = '';
      }
    } else {
      if (!fn) fn = parts.slice(0, -1).join(' ') || parts[0] || '';
      if (!ln) ln = parts[parts.length - 1] || '';
    }
  }

    // prefer using stored wpCustomerId, otherwise try to lookup by email
    let wpCustomerId = s.user?.wpCustomerId;
    if (!wpCustomerId) {
      const existing = await findCustomerByEmail(s.user.email).catch(() => null);
      if (existing) wpCustomerId = existing.id;
    }

    if (!wpCustomerId) return NextResponse.json({ message: 'Could not determine customer ID' }, { status: 400 });

    // Build payload for WooCommerce customer update (billing)
    const payload: any = { billing: {} };
    if (country !== undefined) payload.billing.country = country;
    if (city !== undefined) payload.billing.city = city;
    if (postcode !== undefined) payload.billing.postcode = postcode;
    if (address_1 !== undefined) payload.billing.address_1 = address_1;
    if (address_2 !== undefined) payload.billing.address_2 = address_2;
    if (state !== undefined) payload.billing.state = state;
  if (phone !== undefined) payload.billing.phone = phone;
  if (fn !== undefined) payload.billing.first_name = fn;
  if (ln !== undefined) payload.billing.last_name = ln;

    // Also update shipping to match billing (many stores expect shipping fields populated)
    // Shipping typically includes address_1, address_2, city, postcode, state, country.
    payload.shipping = {
      first_name: fn || '',
      last_name: ln || '',
      address_1: payload.billing.address_1 || '',
      address_2: payload.billing.address_2 || '',
      city: payload.billing.city || '',
      postcode: payload.billing.postcode || '',
      state: payload.billing.state || '',
      country: payload.billing.country || '',
      phone: payload.billing.phone || '',
    };

    const updated = await updateCustomerById(wpCustomerId, payload);
    return NextResponse.json({ success: true, customer: updated }, { status: 200 });
  } catch (e: any) {
    console.error('profile update error', e);
    return NextResponse.json({ message: e?.message || 'Server error' }, { status: 500 });
  }
}
