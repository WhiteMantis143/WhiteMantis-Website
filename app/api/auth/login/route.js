import { NextResponse } from 'next/server';
import { findCustomerByEmail } from '../../../../lib/woo';

const WP_URL = process.env.WP_URL;

export async function POST(req) {
  if (!WP_URL) return NextResponse.json({ message: 'Server misconfigured' }, { status: 500 });

  let body;
  try {
    body = await req.json();
  } catch (err) {
    return NextResponse.json({ message: 'Invalid JSON' }, { status: 400 });
  }

  const { username, password } = body || {};
  if (!username || !password) return NextResponse.json({ message: 'Missing username or password' }, { status: 400 });

  const wpTokenUrl = `${WP_URL.replace(/\/$/, '')}/wp-json/jwt-auth/v1/token`;

  async function tryGetToken(creds) {
    try {
      const tRes = await fetch(wpTokenUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        cache: 'no-store',
        body: JSON.stringify(creds),
      });
      let data;
      try { data = await tRes.json(); } catch (e) { data = null; }
      return { ok: tRes.ok, status: tRes.status, body: data };
    } catch (e) {
      return { ok: false, status: 0, body: null, error: e };
    }
  }

  try {
    // First attempt: username as provided (often email)
    let attempt = await tryGetToken({ username, password });

    // If first attempt failed with incorrect_password, try with Woo customer username/login if available
    if (!attempt.ok) {
      // parse WP error message if present
      if (attempt.body && attempt.body.code === '[jwt_auth] incorrect_password') {
        // try to find existing customer and attempt with its username
        try {
          const existing = await findCustomerByEmail(username).catch(() => null);
          if (existing) {
            const usernameCandidate = existing.username || existing.login || existing.slug || existing.email || null;
            if (usernameCandidate && usernameCandidate !== username) {
              const retry = await tryGetToken({ username: usernameCandidate, password });
              if (retry.ok) attempt = retry;
              else {
                // keep original attempt results
              }
            }
          }
        } catch (e) {
          // ignore and continue to return original error
        }
      }
    }

    if (!attempt.ok) {
      const details = attempt.body || { message: 'Auth failed' };
      console.error('WP auth failed', attempt.status, details);
      return NextResponse.json({ message: details.message || 'Auth failed', details }, { status: 401 });
    }

    // If WP token endpoint returned success but did not include a user_display_name,
    // try to fetch /wp/v2/users/me using the returned token to obtain a proper display name/email.
    let token = attempt.body?.token;
    let userDisplay = attempt.body?.user_display_name || null;
    let userEmail = attempt.body?.user_email || null;

    if (token && (!userDisplay || !userEmail)) {
      try {
        const meRes = await fetch(`${WP_URL.replace(/\/$/, '')}/wp-json/wp/v2/users/me`, {
          headers: { Authorization: `Bearer ${token}` },
          cache: 'no-store',
        });
        if (meRes.ok) {
          const me = await meRes.json().catch(() => null);
          if (me) {
            // WP user object: name, email, id, etc.
            userDisplay = userDisplay || me.name || me.display_name || null;
            userEmail = userEmail || me.email || null;
            // also augment attempt.body for downstream consumers
            attempt.body = { ...attempt.body, user_display_name: userDisplay, user_email: userEmail, user: me };
          }
        }
      } catch (e) {
        // ignore fetch errors and proceed with what we have
      }
    }

    const nextRes = NextResponse.json({ user: userDisplay || userEmail || attempt.body?.user?.id || null });
    // cookie options
    nextRes.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      sameSite: 'lax',
    });
    return nextRes;
  } catch (err) {
    console.error('login route error', err);
    return NextResponse.json({ message: err.message || 'Server error' }, { status: 500 });
  }
}
