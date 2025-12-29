import { NextResponse } from "next/server";
import cookie from "cookie";
import { decryptToObject } from "../../../../../lib/enc";

const WP_BASE =
  process.env.NEXT_PUBLIC_WORDPRESS_URL ||
  process.env.WP_URL ||
  process.env.WORDPRESS_URL ||
  process.env.WP_BASE
    ? String(
        process.env.NEXT_PUBLIC_WORDPRESS_URL ||
          process.env.WP_URL ||
          process.env.WORDPRESS_URL ||
          process.env.WP_BASE
      ).replace(/\/$/, "")
    : undefined;

export async function POST(req: Request) {
  try {
    const { otp } = await req.json();
    if (!otp)
      return NextResponse.json(
        { success: false, message: "Missing OTP" },
        { status: 400 }
      );

    const cookieHeader = req.headers.get("cookie") || "";
    const cookies = Object.fromEntries(
      cookieHeader.split(";").map((c) => c.trim().split("="))
    );

    const enc = cookies[process.env.PENDING_COOKIE_NAME || "pendingSignup"];

    if (!enc)
      return NextResponse.json(
        { success: false, message: "No signup cookie" },
        { status: 400 }
      );

    const data = decryptToObject(enc);
    if (Date.now() > data.exp)
      return NextResponse.json(
        { success: false, message: "Signup expired" },
        { status: 410 }
      );

    const { name, email, password } = data;

    if (!WP_BASE) {
      console.error("WP_BASE not configured for OTP verify");
      return NextResponse.json(
        {
          success: false,
          message: "Server misconfiguration: WordPress base URL not set",
        },
        { status: 500 }
      );
    }

    const wpRes = await fetch(`${WP_BASE}/wp-json/otp/v1/verify`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        email,
        password,
        otp,
      }),
    });

    let json: any;
    try {
      json = await wpRes.json();
    } catch (e) {
      const txt = await wpRes.text().catch(() => "");
      json = { raw: txt };
    }

    // If upstream indicates success and provides token, set auth cookie.
    if (wpRes.ok && json && json.token) {
      const res = new NextResponse(JSON.stringify({ success: true }), {
        status: 200,
      });

      res.headers.append(
        "Set-Cookie",
        cookie.serialize(process.env.AUTH_COOKIE_NAME || "token", json.token, {
          httpOnly: true,
          path: "/",
          sameSite: "lax",
          secure: process.env.NODE_ENV === "production",
          maxAge: Number(process.env.AUTH_COOKIE_TTL || 86400),
        })
      );

      // Remove pending cookie
      res.headers.append(
        "Set-Cookie",
        cookie.serialize(
          process.env.PENDING_COOKIE_NAME || "pendingSignup",
          "",
          {
            httpOnly: true,
            maxAge: 0,
            path: "/",
          }
        )
      );

      return res;
    }

    // Normalize non-token success responses: treat any 2xx as success when appropriate
    if (wpRes.ok) {
      const out =
        typeof json === "object" && json !== null
          ? {
              success: typeof json.success === "boolean" ? json.success : true,
              ...json,
            }
          : { success: true, data: json };
      return NextResponse.json(out, { status: 200 });
    }

    const out =
      typeof json === "object" && json !== null
        ? { success: false, ...json }
        : { success: false, data: json };
    return NextResponse.json(out, { status: wpRes.status });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
}
