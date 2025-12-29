import { NextResponse } from "next/server";
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

    if (Date.now() > data.exp) {
      return NextResponse.json(
        { success: false, message: "Signup expired" },
        { status: 410 }
      );
    }

    if (!WP_BASE) {
      console.error("WP_BASE not configured for OTP send");
      return NextResponse.json(
        {
          success: false,
          message: "Server misconfiguration: WordPress base URL not set",
        },
        { status: 500 }
      );
    }

    const res = await fetch(`${WP_BASE}/wp-json/otp/v1/send`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: data.email }),
    });

    console.log("WP OTP send response status:", await res.json());

    let json: any;
    try {
      json = await res.json();
    } catch (e) {
      const txt = await res.text().catch(() => "");
      json = { raw: txt };
    }

    if (res.ok) {
      const out =
        typeof json === "object" && json !== null
          ? {
              success: typeof json.success === "boolean" ? json.success : true,
              ...json,
            }
          : { success: true, data: json };
      return NextResponse.json(out, { status: 200 });
    }

    // Non-OK upstream -> return failure with upstream payload for debugging
    const out =
      typeof json === "object" && json !== null
        ? { success: false, ...json }
        : { success: false, data: json };
    return NextResponse.json(out, { status: res.status });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
}
