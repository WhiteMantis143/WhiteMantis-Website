import { NextResponse } from 'next/server';

function clearAuthCookies(res) {
  // Clear WP JWT cookie (legacy) and common NextAuth cookies
  res.cookies.set('token', '', { httpOnly: true, path: '/', maxAge: 0 });
  // NextAuth cookie names vary by environment; clear common ones
  res.cookies.set('next-auth.session-token', '', { httpOnly: true, path: '/', maxAge: 0 });
  res.cookies.set('__Secure-next-auth.session-token', '', { httpOnly: true, path: '/', maxAge: 0 });
  res.cookies.set('next-auth.callback-url', '', { path: '/', maxAge: 0 });
  res.cookies.set('next-auth.csrf-token', '', { path: '/', maxAge: 0 });
}

export async function POST() {
  const res = NextResponse.json({ ok: true });
  clearAuthCookies(res);
  return res;
}

// Support GET so visiting the URL in a browser will also clear auth cookies
export async function GET() {
  const res = NextResponse.json({ ok: true });
  clearAuthCookies(res);
  return res;
}
