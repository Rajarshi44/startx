import { NextRequest, NextResponse } from "next/server";
import { MongoClient } from "mongodb";
import { v2 as cloudinary } from "cloudinary";

const uri =
  "mongodb+srv://rishi404:giXEpvLDXFg8Jwzd@cluster0.6nhngod.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
const dbName = "resumeUploads";

// Configure Cloudinary
cloudinary.config({
  cloud_name: "djydvffdp",
  api_key: "615679796164426",
  api_secret: "ObBGhhlXY5FxwCvvMqHIGuCsdxI",
  secure: true,
});

// GET - Fetch all messages for the community forum
export async function GET(req: NextRequest) {
  const client = new MongoClient(uri);

  try {
    await client.connect();
    const db = client.db(dbName);
    const messagesCollection = db.collection("communityMessages");

    // Get query parameters for pagination
    const url = new URL(req.url);
    const page = parseInt(url.searchParams.get("page") || "1");
    const limit = parseInt(url.searchParams.get("limit") || "20");
    const skip = (page - 1) * limit;

    // Fetch messages with user information
    const messages = await messagesCollection
      .aggregate([
        {
          $lookup: {
            from: "communityUsers",
            localField: "userId",
            foreignField: "_id",
            as: "user",
          },
        },
        {
          $unwind: "$user",
        },
        {
          $sort: { createdAt: -1 },
        },
        {
          $skip: skip,
        },
        {
          $limit: limit,
        },
        {
          $project: {
            message: 1,
            media: 1,
            createdAt: 1,
            "user.username": 1,
            "user.civicId": 1,
            "user.verificationStatus": 1,
          },
        },
      ])
      .toArray();

    return NextResponse.json({
      success: true,
      messages: messages.reverse(), // Show newest at bottom
      pagination: {
        page,
        limit,
        hasMore: messages.length === limit,
      },
    });
  } catch (error) {
    console.error("Error fetching messages:", error);
    return NextResponse.json(
      { error: "Failed to fetch messages" },
      { status: 500 }
    );
  } finally {
    await client.close();
  }
}

// POST - Send a new message
export async function POST(req: NextRequest) {
  const client = new MongoClient(uri);

  try {
    let message = "";
    let civicId = "";
    let media = null;
    let audioBlob = null;

    // Check if the request is multipart/form-data (for file uploads)
    const contentType = req.headers.get("content-type") || "";

    if (contentType.includes("multipart/form-data")) {
      // Handle FormData (for images/audio)
      const formData = await req.formData();
      const imageFile = formData.get("image") as File;
      const audioFile = formData.get("audio") as File;
      civicId = formData.get("civicId") as string;
      message = (formData.get("message") as string) || "";

      if (!civicId) {
        return NextResponse.json(
          { error: "civicId is required" },
          { status: 400 }
        );
      }

      if (!imageFile && !audioFile) {
        return NextResponse.json(
          { error: "Image or audio file is required" },
          { status: 400 }
        );
      }

      // Upload image to Cloudinary
      if (imageFile) {
        const bytes = await imageFile.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // Validate image types
        const allowedImageTypes = [
          "image/jpeg",
          "image/jpg",
          "image/png",
          "image/gif",
          "image/webp",
        ];
        if (!allowedImageTypes.includes(imageFile.type)) {
          return NextResponse.json(
            {
              error: "Only JPEG, PNG, GIF, and WebP images are allowed",
            },
            { status: 400 }
          );
        }

        // Validate file size (10MB max)
        const maxSize = 10 * 1024 * 1024;
        if (imageFile.size > maxSize) {
          return NextResponse.json(
            {
              error: "File size must be less than 10MB",
            },
            { status: 400 }
          );
        }

        const uploadResult = await new Promise((resolve, reject) => {
          cloudinary.uploader
            .upload_stream(
              {
                resource_type: "image",
                folder: "community/images",
                transformation: [
                  { quality: "auto", fetch_format: "auto" },
                  { width: 1200, height: 1200, crop: "limit" },
                ],
              },
              (error, result) => {
                if (error) reject(error);
                else resolve(result);
              }
            )
            .end(buffer);
        });

        media = {
          type: "image",
          url: (uploadResult as any).secure_url,
          publicId: (uploadResult as any).public_id,
          width: (uploadResult as any).width,
          height: (uploadResult as any).height,
          format: (uploadResult as any).format,
          bytes: (uploadResult as any).bytes,
        };
      }

      // Upload audio to Cloudinary
      if (audioFile) {
        const bytes = await audioFile.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // Validate audio types
        const allowedAudioTypes = [
          "audio/webm",
          "audio/mp4",
          "audio/mpeg",
          "audio/wav",
        ];
        if (!allowedAudioTypes.includes(audioFile.type)) {
          return NextResponse.json(
            {
              error: "Only WebM, MP4, MP3, and WAV audio files are allowed",
            },
            { status: 400 }
          );
        }

        // Validate file size (10MB max)
        const maxSize = 10 * 1024 * 1024;
        if (audioFile.size > maxSize) {
          return NextResponse.json(
            {
              error: "File size must be less than 10MB",
            },
            { status: 400 }
          );
        }

        const uploadResult = await new Promise((resolve, reject) => {
          cloudinary.uploader
            .upload_stream(
              {
                resource_type: "video", // Cloudinary treats audio as video
                folder: "community/audio",
                format: "mp3", // Convert to MP3 for better compatibility
              },
              (error, result) => {
                if (error) reject(error);
                else resolve(result);
              }
            )
            .end(buffer);
        });

        media = {
          type: "audio",
          url: (uploadResult as any).secure_url,
          publicId: (uploadResult as any).public_id,
          duration: (uploadResult as any).duration,
          format: (uploadResult as any).format,
          bytes: (uploadResult as any).bytes,
        };
      }
    } else {
      // Handle JSON request (for text messages)
      const body = await req.json();
      message = body.message || "";
      civicId = body.civicId;
      media = body.media || null;
    }

    if ((!message || message.trim() === "") && !media) {
      return NextResponse.json(
        { error: "Message or media is required" },
        { status: 400 }
      );
    }

    if (!civicId) {
      return NextResponse.json(
        { error: "civicId is required" },
        { status: 400 }
      );
    }

    // Validate message length (only if message exists)
    if (message && message.length > 1000) {
      return NextResponse.json(
        { error: "Message too long. Maximum 1000 characters." },
        { status: 400 }
      );
    }

    await client.connect();
    const db = client.db(dbName);
    const messagesCollection = db.collection("communityMessages");

    // Find the user by civicId
    const user = await db.collection("communityUsers").findOne({ civicId });

    if (!user) {
      return NextResponse.json(
        { error: "User not found. Please register first." },
        { status: 404 }
      );
    }

    if (user.verificationStatus !== "verified") {
      return NextResponse.json(
        { error: "User not verified. Please complete verification." },
        { status: 403 }
      );
    }

    // Create new message
    const newMessage = {
      userId: user._id,
      message: message ? message.trim() : "",
      media: media || null,
      createdAt: new Date(),
      editedAt: null,
    };

    const result = await messagesCollection.insertOne(newMessage);

    // Return the message with user info
    const messageWithUser = await messagesCollection
      .aggregate([
        {
          $match: { _id: result.insertedId },
        },
        {
          $lookup: {
            from: "communityUsers",
            localField: "userId",
            foreignField: "_id",
            as: "user",
          },
        },
        {
          $unwind: "$user",
        },
        {
          $project: {
            message: 1,
            media: 1,
            createdAt: 1,
            "user.username": 1,
            "user.civicId": 1,
            "user.verificationStatus": 1,
          },
        },
      ])
      .toArray();

    return NextResponse.json({
      success: true,
      message: messageWithUser[0],
    });
  } catch (error) {
    console.error("Error sending message:", error);
    return NextResponse.json(
      { error: "Failed to send message" },
      { status: 500 }
    );
  } finally {
    await client.close();
  }
}
