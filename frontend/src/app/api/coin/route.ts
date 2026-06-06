/**
 * Same-origin proxy for the TokenShield coin oracle.
 *
 * The app calls /api/coin?type=... and this forwards to the oracle
 * server-side, sidestepping mixed content (oracle is http) and CORS, and
 * keeping the oracle URL server-only.
 *
 * CORS is open here on purpose. The embeddable widget runs on third-party
 * sites (DEXes) and calls this route cross-origin. The coin badge is a free
 * public good, so any origin may read it.
 *
 * Set COIN_ORACLE_URL in the environment, e.g.
 *   COIN_ORACLE_URL=https://your-oracle-url
 * and later swap for the https tunnel URL with no frontend change.
 */

import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ORACLE = process.env.COIN_ORACLE_URL ?? "";

const CORS: Record<string, string> = {
  "access-control-allow-origin": "*",
  "access-control-allow-methods": "GET, OPTIONS",
  "access-control-allow-headers": "content-type",
};

function json(body: unknown, status: number): NextResponse {
  return NextResponse.json(body, { status, headers: CORS });
}

export async function OPTIONS(): Promise<NextResponse> {
  return new NextResponse(null, { status: 204, headers: CORS });
}

export async function GET(req: NextRequest): Promise<NextResponse> {
  const type = req.nextUrl.searchParams.get("type");

  if (!type) {
    return json({ code: "INVALID", error: "Missing coin type" }, 400);
  }
  if (!ORACLE) {
    return json({ code: "NOT_CONFIGURED", error: "COIN_ORACLE_URL is not set" }, 503);
  }

  const upstream = `${ORACLE.replace(/\/$/, "")}/coin?type=${encodeURIComponent(type)}`;

  try {
    const r = await fetch(upstream, {
      headers: { accept: "application/json" },
      cache: "no-store",
    });
    const text = await r.text();
    return new NextResponse(text, {
      status: r.status,
      headers: { "content-type": "application/json", ...CORS },
    });
  } catch {
    return json({ code: "UPSTREAM_ERROR", error: "Oracle unreachable" }, 502);
  }
}
