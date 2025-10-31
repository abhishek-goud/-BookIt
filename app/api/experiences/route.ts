import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongoose";
import { Experience } from "@/models/Experience";
import seed from "@/constants/experience";

export async function GET(req: NextRequest) {
  await connectToDatabase();

  // Seed if empty (idempotent)
  const count = await Experience.countDocuments();
  if (count === 0) {
    const defaultTimes = [
      { time: "07:00 am", capacity: 4 },
      { time: "09:00 am", capacity: 2 },
      { time: "11:00 am", capacity: 1 },
      { time: "01:00 pm", capacity: 0 },
    ];
    const defaultDates = [
      "Oct 22",
      "Oct 23",
      "Oct 24",
      "Oct 25",
      "Oct 26",
    ];
    const toInsert = seed.map((x: any) => ({ ...x, times: defaultTimes, dates: defaultDates }));
    await Experience.insertMany(toInsert);
  }

  const url = new URL(req.url);
  const location = url.searchParams.get("location");

  if (location && location.trim().length > 0) {
    console.log(location)
    const experiences = await Experience.find({
      location: { $regex: location.trim(), $options: "i" },
    }).lean();
    console.log(experiences)
    return NextResponse.json(experiences);
  }

  const experiences = await Experience.find().lean();
  // console.log(experiences)
  return NextResponse.json(experiences);
}


