import { NextResponse } from "next/server";
import cookie from "cookie";
import { findCustomerByEmail } from "../../../../lib/woo";
import { encryptObject } from "../../../../lib/enc";

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
    const body = await req.json();
    const { name, email, password } = body || {};

    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: "email and password are required" },
        { status: 400 }
      );
    }

    // Optional: still split name if you need it later
    const nameStr = (name || "").trim();

    // 1️⃣ Check if Woo customer already exists
    const existing = await findCustomerByEmail(email);
    if (existing) {
      return NextResponse.json(
        { success: false, message: "Customer already exists" },
        { status: 409 }
      );
    }

    if (!WP_BASE) {
      console.error("WP_BASE not configured for signup OTP send");
      return NextResponse.json(
        {
          success: false,
          message: "Server misconfiguration: WordPress base URL not set",
        },
        { status: 500 }
      );
    }

    // 2️⃣ Build the pending payload that /api/auth/otp/verify will use
    const pendingPayload = {
      name: nameStr,
      email,
      password,
      exp: Date.now() + 10 * 60 * 1000, // 10 minutes validity
    };

    // 3️⃣ Ask WordPress to send OTP to this email
    const otpRes = await fetch(`${WP_BASE}/wp-json/otp/v1/send`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });

    let otpJson: any;
    try {
      otpJson = await otpRes.json();
    } catch (e) {
      const txt = await otpRes.text().catch(() => "");
      otpJson = { raw: txt };
    }

    if (!otpRes.ok) {
      console.error("OTP send failed", otpRes.status, otpJson);
      return NextResponse.json(
        {
          success: false,
          message: "Failed to send OTP",
          ...otpJson,
        },
        { status: otpRes.status }
      );
    }

    // 4️⃣ Only if OTP send succeeded, set pendingSignup cookie
    const enc = encryptObject(pendingPayload); // <– use your encoder

    const res = NextResponse.json(
      {
        success: typeof otpJson?.success === "boolean" ? otpJson.success : true,
        ...otpJson,
      },
      { status: 200 }
    );

    res.headers.append(
      "Set-Cookie",
      cookie.serialize(
        process.env.PENDING_COOKIE_NAME || "pendingSignup",
        enc,
        {
          httpOnly: true,
          path: "/",
          sameSite: "lax",
          secure: process.env.NODE_ENV === "production",
          maxAge: 10 * 60, // 10 minutes
        }
      )
    );

    return res;
  } catch (e: any) {
    console.error("signup error", e);
    return NextResponse.json(
      { success: false, message: e?.message || "unknown" },
      { status: 500 }
    );
  }
}
