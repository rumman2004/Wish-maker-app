import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import { notFound } from "next/navigation";
import WishDisplay from "./WishDisplay"; 

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function WishPage({ params }: PageProps) {
  // 1. Await params (Required for Next.js 15+)
  const { id } = await params;

  // 2. Validate ID
  if (!ObjectId.isValid(id)) return notFound();

  const client = await clientPromise;
  const db = client.db("wishing_app");
  
  // 3. Increment View Count
  await db.collection("wishes").updateOne(
    { _id: new ObjectId(id) }, 
    { $inc: { views: 1 } }
  );
  
  // 4. Fetch Wish
  const wish = await db.collection("wishes").findOne({ _id: new ObjectId(id) });

  if (!wish) return notFound();

  // 5. Serialize Data (Convert ObjectId to string for Client Component)
  const serializedWish = {
    name: wish.name,
    message: wish.message,
    theme: wish.theme || 'birthday',
    pin: wish.pin || null,
    _id: wish._id.toString(),
  };

  return <WishDisplay wish={serializedWish} />;
}