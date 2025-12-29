import { NextResponse } from 'next/server';

const WP_URL = process.env.WP_URL;

export async function GET(req) {
  try {
    const cookie = req.headers.get('cookie') || '';
    const match = cookie.split(';').map(c => c.trim()).find(c => c.startsWith('token='));
    const token = match ? match.split('=')[1] : null;
    if (!token) return NextResponse.json({ authenticated: false }, { status: 200 });

    const res = await fetch(`${WP_URL.replace(/\/$/, '')}/wp-json/wp/v2/users/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) return NextResponse.json({ authenticated: false }, { status: 200 });
    const data = await res.json();
    return NextResponse.json({ authenticated: true, user: { id: data.id, name: data.name, email: data.email } }, { status: 200 });
  } catch (err) {
    return NextResponse.json({ authenticated: false }, { status: 200 });
  }
}
