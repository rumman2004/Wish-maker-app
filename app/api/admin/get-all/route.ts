import clientPromise from "@/lib/mongodb";
import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db("wishing_app");

    // Fetch latest 100 wishes
    const wishes = await db.collection("wishes")
        .find({})
        .sort({ createdAt: -1 })
        .limit(100)
        .toArray();

    // Convert ObjectId to string for the frontend
    const serializedWishes = wishes.map(wish => ({
      ...wish,
      _id: wish._id.toString(),
      createdAt: wish.createdAt || new Date().toISOString(),
      views: wish.views || 0,
    }));

    return NextResponse.json(serializedWishes);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}