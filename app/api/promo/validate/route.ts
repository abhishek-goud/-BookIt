import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongoose";
import { Promo } from "@/models/Promo";

export async function POST(req: NextRequest) {
  await connectToDatabase();
  const body = await req.json().catch(() => null);
  if (!body)
    return NextResponse.json({ valid: false, error: "Invalid JSON" }, { status: 400 });

  const code = (body.code || "").toString().trim().toUpperCase();
  console.log({code})
  if (!code)
    return NextResponse.json({ valid: false }, { status: 200 });

  const found = await Promo.findOne({ promoCode: code })
    .select("promoCode discount")
    .lean<{ promoCode: string; discount: number } | null>();
  console.log(found);
  if (!found) return NextResponse.json({ valid: false }, { status: 200 });

  // Schema currently only stores the code. Extend later for amount/type.
  return NextResponse.json({ valid: true, code, discount: found.discount });
}


