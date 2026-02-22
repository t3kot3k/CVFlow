/**
 * Route Handler: POST /api/ats-analyze
 *
 * Proxies ATS analyze requests directly to the FastAPI backend.
 * This avoids the Next.js dev-server `rewrites` proxy which can drop the
 * TCP connection during long-running Gemini AI calls (ECONNRESET / socket
 * hang up).  Node.js `fetch` used here has no hard timeout.
 */
import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.BACKEND_URL || "http://127.0.0.1:8066";

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get("Authorization");
    const body = await req.text();

    const backendRes = await fetch(`${BACKEND_URL}/api/v1/ats/analyze`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(authHeader ? { Authorization: authHeader } : {}),
      },
      body,
    });

    const data = await backendRes.json().catch(() => null);
    return NextResponse.json(data, { status: backendRes.status });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { detail: `Proxy error: ${msg}` },
      { status: 502 }
    );
  }
}
