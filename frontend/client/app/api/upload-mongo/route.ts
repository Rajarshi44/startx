import { NextRequest, NextResponse } from "next/server";
import { MongoClient, GridFSBucket } from "mongodb";

const uri = "mongodb+srv://rishi404:giXEpvLDXFg8Jwzd@cluster0.6nhngod.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
const dbName = "resumeUploads";

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const file = formData.get("file") as File;
  const civicId = formData.get("civicId") as string;
  if (!file || !civicId) {
    return NextResponse.json({ error: "Missing file or civicId" }, { status: 400 });
  }
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db(dbName);
    const bucket = new GridFSBucket(db, { bucketName: "resumes" });

    // Await the upload to finish
    await new Promise<void>((resolve, reject) => {
      const uploadStream = bucket.openUploadStream(`${civicId}_${file.name}`);
      uploadStream.end(buffer);
      uploadStream.on("finish", () => resolve());
      uploadStream.on("error", (err) => reject(err));
    });

    return NextResponse.json({ success: true });
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (e) {
    return NextResponse.json({ error: "MongoDB upload failed" }, { status: 500 });
  } finally {
    await client.close();
  }
}