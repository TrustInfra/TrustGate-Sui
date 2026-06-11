import { NextResponse } from "next/server";

// The Sui wallet oracle base URL lives only on the server, never in the client,
// so the oracle host and IP are never exposed to the browser. Set this on Vercel
// (and in .env.local for local testing) to the https oracle domain, for example
// https://sui-oracle.trustgated.xyz
const ORACLE_URL = process.env.SUI_WALLET_ORACLE_URL;

const ADDRESS_PATTERN = /^0x[0-9a-fA-F]{1,64}$/;

export async function POST(request: Request) {
  if (!ORACLE_URL) {
    return NextResponse.json(
      { ok: false, error: "Scoring service is not configured yet." },
      { status: 503 },
    );
  }

  let address: string | undefined;
  try {
    const body = (await request.json()) as { address?: unknown };
    address = typeof body.address === "string" ? body.address.trim() : undefined;
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid request." }, { status: 400 });
  }

  if (!address || !ADDRESS_PATTERN.test(address)) {
    return NextResponse.json({ ok: false, error: "Enter a valid Sui address." }, { status: 400 });
  }

  const base = ORACLE_URL.replace(/\/$/, "");

  try {
    const upstream = await fetch(`${base}/score/${address}`, {
      method: "GET",
      headers: { accept: "application/json" },
      signal: AbortSignal.timeout(20000),
    });

    if (!upstream.ok) {
      return NextResponse.json(
        { ok: false, error: `Scoring failed (${upstream.status}).` },
        { status: 502 },
      );
    }

    const data = (await upstream.json()) as Record<string, unknown>;
    return NextResponse.json({ ok: true, ...data });
  } catch (error) {
    const timedOut = error instanceof Error && error.name === "TimeoutError";
    return NextResponse.json(
      { ok: false, error: timedOut ? "Scoring timed out, try again." : "Could not reach the scoring service." },
      { status: 504 },
    );
  }
}
