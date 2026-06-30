import { NextResponse } from "next/server";
import { getCartCount } from "@/lib/cart";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const count = await getCartCount();
  return NextResponse.json(
    { count },
    { headers: { "Cache-Control": "no-store" } }
  );
}
