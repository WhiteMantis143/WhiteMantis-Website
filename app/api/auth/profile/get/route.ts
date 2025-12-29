import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../../../../lib/nextauth';
import { getCustomerById, findCustomerByEmail } from '../../../../../lib/woo';

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions as any);
    const s = session as any;
    if (!s || !s.user) return NextResponse.json({ billing: null }, { status: 200 });

    let wpCustomerId = s.user?.wpCustomerId;
    let customer = null;
    if (wpCustomerId) {
      customer = await getCustomerById(wpCustomerId).catch(() => null);
    }
    if (!customer) {
      const found = await findCustomerByEmail(s.user.email).catch(() => null);
      if (found) customer = found;
    }

    const billing = customer?.billing || null;
    return NextResponse.json({ billing }, { status: 200 });
  } catch (e) {
    return NextResponse.json({ billing: null }, { status: 200 });
  }
}
