import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongoose";
import { Experience } from "@/models/Experience";
import { Booking } from "@/models/Booking";
import mongoose from "mongoose";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  await connectToDatabase();

  const { id } = await params;

  // First validate the string ID
  // console.log(id)
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return NextResponse.json(
      { error: "Invalid experience id" },
      { status: 400 }
    );
  }

  //convert to ObjectId (optional; Mongoose can handle string IDs too)
  const objectId = new mongoose.Types.ObjectId(id);
  if (!mongoose.Types.ObjectId.isValid(objectId)) {
    return NextResponse.json(
      { error: "Invalid experience id" },
      { status: 400 }
    );
  }
  
  const experience = await Experience.findById(id).lean();
  if (!experience) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  // console.log({ experience });

  // Optional date filter from query (?date=YYYY-MM-DD). Defaults to today.
  const url = new URL(_req.url);
  const date =
    url.searchParams.get("date") || new Date().toISOString().slice(0, 10);

  // Now capacity on each time slot represents current remaining seats.
  // const timesWithAvailability = (experience as any).times.map((t: any) => {
  //   const remaining = Math.max(t.capacity, 0);
  //   return {
  //     time: t.label,
  //     value: t.value || t.label,
  //     capacity: t.capacity,
  //     remaining,
  //     availability: remaining <= 0 ? "Sold out" : `${remaining} left`,
  //     soldOut: remaining <= 0,
  //   };
  // });

  return NextResponse.json({
    ...experience,
    // times: timesWithAvailability,
    // date,
  });
}
