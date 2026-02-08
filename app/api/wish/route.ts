import clientPromise from "@/lib/mongodb";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { name, message, theme, pin } = await request.json();
    const client = await clientPromise;
    const db = client.db("wishing_app");

    const result = await db.collection("wishes").insertOne({
      name,
      message,
      theme: theme || 'birthday', // Default to birthday if none selected
      pin: pin || null,           // Store PIN if provided
      views: 0,                   // Initialize view count
      createdAt: new Date(),
    });

    return NextResponse.json({ id: result.insertedId });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}