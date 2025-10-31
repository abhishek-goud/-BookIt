import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongoose";
import { Booking } from "@/models/Booking";
import { Experience } from "@/models/Experience";
import mongoose from "mongoose";

export async function POST(req: NextRequest) {
  await connectToDatabase();

  const body = await req.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { experienceId, date, time, qty, total, refTxn, email, name } = body as {
    experienceId: string;
    date: string;
    time: string;
    qty: number;
    total: number;
    refTxn: string;
    email: string;
    name: string
  };
  console.log( {metaData: { experienceId, date, time, qty, total, refTxn, email, name } })
  if (!experienceId || !date || !time || !qty || !total || !refTxn || !email || !name) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  if (!mongoose.Types.ObjectId.isValid(experienceId)) {
    return NextResponse.json({ error: "Invalid experienceId" }, { status: 400 });
  }

  const experience = await Experience.findById(experienceId).lean();
  if (!experience) {
    return NextResponse.json({ error: "Experience not found" }, { status: 404 });
  }
  console.log({experience})
  const timesArr = (experience as any).times as Array<{ time: string; capacity: number }>;
  const slotIndex = Array.isArray(timesArr) ? timesArr.findIndex((t: any) => t.time === time) : -1;
  const checkTime = slotIndex >= 0 ? timesArr[slotIndex] : null;
  // const dateValid = Array.isArray((experience as any).dates) && (experience as any).dates.includes(date);
  const datesArr = (experience as any).dates as Array<String>
  const dateIdx =  Array.isArray(datesArr) ? datesArr.findIndex((d: any) => d === date) : -1;
  const dateValue = dateIdx >= 0 ? datesArr[dateIdx] : null;

  console.log({checkTime, dateValue})
  if (!checkTime || !dateValue) {
    return NextResponse.json({ error: "Invalid time slot" }, { status: 400 });
  }

  // Idempotency: if same refTxn exists, return it (do not decrement again)
  const existingByRef = await Booking.findOne({ refTxn }).lean();
  if (existingByRef) {
    return NextResponse.json(existingByRef, { status: 200 });
  }

  // Email policy: ensure a particular email can book a given experience only once
  const existingByEmailAndExperience = await Booking.findOne({ experienceId, email }).lean();
  console.log({booking: existingByEmailAndExperience})
  if (existingByEmailAndExperience) {
    console.log("email conflict")
    return NextResponse.json({ error: "This email has already booked this spot." }, { status: 409 });
  }

  // Check capacity before attempting to decrement (capacity stored as string)
  if (Number(checkTime.capacity) < qty) {
    return NextResponse.json({ error: "Slot sold out" }, { status: 409 });
  }

  // Atomically decrement remaining capacity on the matching time slot by index
  if (checkTime.capacity < qty) {
    return NextResponse.json({ error: "Slot sold out" }, { status: 409 });
  }
  const decPath = `times.${slotIndex}.capacity` as const;
  // const idx = (experience as any).times.findIndex((time: any) => time.time === time )
  // console.log({idx})
  // let timeSlot = (experience as any).times[idx]
  // console.log("rererere", timeSlot)
  // timeSlot = {...timeSlot, capacity: timeSlot.capacity - qty}
  // (experience as any).times.splice(idx, 0, timeSlot);
  // console.log({experience})

  checkTime.capacity = checkTime.capacity - qty
  const dec = await Experience.updateOne(
    { _id: experienceId, [decPath]: { $gte: qty } as any },
    { $inc: { [decPath]: -qty } as any }
  );

  if (dec.modifiedCount === 0) {
    return NextResponse.json({ error: "Slot sold out" }, { status: 409 });
  }

  try {
    const created = await Booking.create({
      experienceId,
      date,
      time,
      qty,
      total,
      refTxn,
      email,
      name,
    });
    return NextResponse.json(created, { status: 201 });
  } catch (err: any) {
    // Compensate decrement on failure (add back qty)
    const incPath = `times.${slotIndex}.capacity` as const;
    await Experience.updateOne(
      { _id: experienceId },
      { $inc: { [incPath]: qty } as any }
    );
    if (err?.code === 11000 && err?.keyPattern?.refTxn) {
      const existing = await Booking.findOne({ refTxn }).lean();
      return NextResponse.json(existing, { status: 200 });
    }
    return NextResponse.json({ error: "Failed to create booking" }, { status: 500 });
  }
}


