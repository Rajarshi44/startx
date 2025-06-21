import { NextRequest, NextResponse } from "next/server";
import { MongoClient } from "mongodb";

const uri = "mongodb+srv://rishi404:giXEpvLDXFg8Jwzd@cluster0.6nhngod.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
const dbName = "resumeUploads";

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
            as: "user"
          }
        },
        {
          $unwind: "$user"
        },
        {
          $sort: { createdAt: -1 }
        },
        {
          $skip: skip
        },
        {
          $limit: limit
        },
        {
          $project: {
            message: 1,
            createdAt: 1,
            "user.username": 1,
            "user.civicId": 1,
            "user.verificationStatus": 1
          }
        }
      ])
      .toArray();

    return NextResponse.json({ 
      success: true, 
      messages: messages.reverse(), // Show newest at bottom
      pagination: {
        page,
        limit,
        hasMore: messages.length === limit
      }
    });
    
  } catch (error) {
    console.error("Error fetching messages:", error);
    return NextResponse.json({ error: "Failed to fetch messages" }, { status: 500 });
  } finally {
    await client.close();
  }
}

// POST - Send a new message
export async function POST(req: NextRequest) {
  const client = new MongoClient(uri);
  
  try {
    const { message, civicId } = await req.json();
    
    if (!message || !civicId) {
      return NextResponse.json({ error: "Message and civicId are required" }, { status: 400 });
    }
    
    // Validate message length
    if (message.length > 1000) {
      return NextResponse.json({ error: "Message too long. Maximum 1000 characters." }, { status: 400 });
    }
    
    await client.connect();
    const db = client.db(dbName);
    const messagesCollection = db.collection("communityMessages");
    
    // Find the user by civicId
    const user = await db.collection("communityUsers").findOne({ civicId });
    
    if (!user) {
      return NextResponse.json({ error: "User not found. Please register first." }, { status: 404 });
    }
    
    if (user.verificationStatus !== "verified") {
      return NextResponse.json({ error: "User not verified. Please complete verification." }, { status: 403 });
    }
    
    // Create new message
    const newMessage = {
      userId: user._id,
      message: message.trim(),
      createdAt: new Date(),
      editedAt: null
    };
    
    const result = await messagesCollection.insertOne(newMessage);
    
    // Return the message with user info
    const messageWithUser = await messagesCollection
      .aggregate([
        {
          $match: { _id: result.insertedId }
        },
        {
          $lookup: {
            from: "communityUsers",
            localField: "userId",
            foreignField: "_id",
            as: "user"
          }
        },
        {
          $unwind: "$user"
        },
        {
          $project: {
            message: 1,
            createdAt: 1,
            "user.username": 1,
            "user.civicId": 1,
            "user.verificationStatus": 1
          }
        }
      ])
      .toArray();
    
    return NextResponse.json({ 
      success: true, 
      message: messageWithUser[0] 
    });
    
  } catch (error) {
    console.error("Error sending message:", error);
    return NextResponse.json({ error: "Failed to send message" }, { status: 500 });
  } finally {
    await client.close();
  }
}