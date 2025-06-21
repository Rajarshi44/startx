import { NextRequest, NextResponse } from "next/server";
import { MongoClient, ObjectId } from "mongodb";

const uri = "mongodb+srv://rishi404:giXEpvLDXFg8Jwzd@cluster0.6nhngod.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
const dbName = "resumeUploads";

// GET - Fetch comments for a post
export async function GET(
  req: NextRequest,
  { params }: { params: { postId: string } }
) {
  const client = new MongoClient(uri);
  
  try {
    const { postId } = params;
    
    if (!ObjectId.isValid(postId)) {
      return NextResponse.json({ error: "Invalid post ID" }, { status: 400 });
    }
    
    // Get query parameters
    const url = new URL(req.url);
    const page = parseInt(url.searchParams.get("page") || "1");
    const limit = parseInt(url.searchParams.get("limit") || "20");
    const skip = (page - 1) * limit;
    
    await client.connect();
    const db = client.db(dbName);
    const commentsCollection = db.collection("communityComments");
    
    // Fetch comments with user information
    const comments = await commentsCollection
      .aggregate([
        { $match: { postId: new ObjectId(postId) } },
        { $sort: { createdAt: -1 } }, // Latest comments first
        { $skip: skip },
        { $limit: limit },
        {
          $lookup: {
            from: "communityUsers",
            localField: "userId",
            foreignField: "_id",
            as: "user"
          }
        },
        { $unwind: "$user" },
        {
          $addFields: {
            likesCount: { $size: "$likes" }
          }
        },
        {
          $project: {
            content: 1,
            likes: 1,
            likesCount: 1,
            createdAt: 1,
            updatedAt: 1,
            "user.username": 1,
            "user.civicId": 1,
            "user.verificationStatus": 1
          }
        }
      ])
      .toArray();

    // Get total count for pagination
    const totalCount = await commentsCollection.countDocuments({ 
      postId: new ObjectId(postId) 
    });

    return NextResponse.json({
      success: true,
      comments,
      pagination: {
        page,
        limit,
        hasMore: skip + comments.length < totalCount,
        total: totalCount
      }
    });
    
  } catch (error) {
    console.error("Error fetching comments:", error);
    return NextResponse.json({ error: "Failed to fetch comments" }, { status: 500 });
  } finally {
    await client.close();
  }
}

// POST - Create a new comment
export async function POST(
  req: NextRequest,
  { params }: { params: { postId: string } }
) {
  const client = new MongoClient(uri);
  
  try {
    const { postId } = params;
    const { content, civicId } = await req.json();
    
    if (!ObjectId.isValid(postId)) {
      return NextResponse.json({ error: "Invalid post ID" }, { status: 400 });
    }
    
    if (!content?.trim() || !civicId) {
      return NextResponse.json({ 
        error: "Content and civicId are required" 
      }, { status: 400 });
    }
    
    // Validate content length
    if (content.length > 2000) {
      return NextResponse.json({ 
        error: "Comment too long. Maximum 2000 characters." 
      }, { status: 400 });
    }
    
    await client.connect();
    const db = client.db(dbName);
    const commentsCollection = db.collection("communityComments");
    const postsCollection = db.collection("communityPosts");
    const usersCollection = db.collection("communityUsers");
    
    // Find the user by civicId
    const user = await usersCollection.findOne({ civicId });
    
    if (!user) {
      return NextResponse.json({ 
        error: "User not found. Please register first." 
      }, { status: 404 });
    }
    
    if (user.verificationStatus !== "verified") {
      return NextResponse.json({ 
        error: "User not verified. Please complete verification." 
      }, { status: 403 });
    }
    
    // Check if post exists
    const post = await postsCollection.findOne({ _id: new ObjectId(postId) });
    
    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }
    
    // Create new comment
    const newComment = {
      postId: new ObjectId(postId),
      userId: user._id,
      content: content.trim(),
      likes: [],
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const result = await commentsCollection.insertOne(newComment);
    
    // Update post comments count
    await postsCollection.updateOne(
      { _id: new ObjectId(postId) },
      { $inc: { commentsCount: 1 } }
    );
    
    // Return the comment with user info
    const commentWithUser = await commentsCollection
      .aggregate([
        { $match: { _id: result.insertedId } },
        {
          $lookup: {
            from: "communityUsers",
            localField: "userId",
            foreignField: "_id",
            as: "user"
          }
        },
        { $unwind: "$user" },
        {
          $addFields: {
            likesCount: { $size: "$likes" }
          }
        },
        {
          $project: {
            content: 1,
            likes: 1,
            likesCount: 1,
            createdAt: 1,
            updatedAt: 1,
            "user.username": 1,
            "user.civicId": 1,
            "user.verificationStatus": 1
          }
        }
      ])
      .toArray();
    
    return NextResponse.json({
      success: true,
      comment: commentWithUser[0]
    });
    
  } catch (error) {
    console.error("Error creating comment:", error);
    return NextResponse.json({ error: "Failed to create comment" }, { status: 500 });
  } finally {
    await client.close();
  }
} 