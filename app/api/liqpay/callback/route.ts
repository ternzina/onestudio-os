import { NextResponse } from "next/server";
import {
  decodeLiqPayData,
  recordLiqPayCallback,
  verifyLiqPaySignature,
} from "@/lib/server/payments/liqpay-adapter";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const form = await request.formData();
  const data = String(form.get("data") || "");
  const signature = String(form.get("signature") || "");

  if (!data || !signature) {
    return NextResponse.json({ ok: false, error: "missing_liqpay_signature" }, { status: 400 });
  }
  if (!verifyLiqPaySignature(data, signature)) {
    return NextResponse.json({ ok: false, error: "invalid_liqpay_signature" }, { status: 400 });
  }

  try {
    const payload = decodeLiqPayData<Record<string, unknown>>(data);
    const result = await recordLiqPayCallback(payload);
    return NextResponse.json({ ok: true, ...result });
  } catch (error) {
    console.error("LiqPay callback processing failed", error);
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : "liqpay_callback_failed" },
      { status: 500 },
    );
  }
}
