import { NextRequest, NextResponse } from "next/server";
import { MongoClient, ObjectId } from "mongodb";

const uri = "mongodb+srv://rishi404:giXEpvLDXFg8Jwzd@cluster0.6nhngod.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
const dbName = "resumeUploads";

// GET - Fetch community posts
export async function GET(req: NextRequest) {
  const client = new MongoClient(uri);
  
  try {
    await client.connect();
    const db = client.db(dbName);
    const postsCollection = db.collection("communityPosts");
    const usersCollection = db.collection("communityUsers");
    
    // Get query parameters
    const url = new URL(req.url);
    const page = parseInt(url.searchParams.get("page") || "1");
    const limit = parseInt(url.searchParams.get("limit") || "10");
    const sortBy = url.searchParams.get("sortBy") || "latest";
    const tags = url.searchParams.get("tags")?.split(",").filter(Boolean) || [];
    const skip = (page - 1) * limit;
    
    // Build sort criteria
    let sortCriteria: any = { createdAt: -1 }; // Default: latest first
    
    if (sortBy === "popular") {
      sortCriteria = { likesCount: -1, createdAt: -1 };
    } else if (sortBy === "trending") {
      // Trending: posts with high engagement in last 7 days
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      sortCriteria = { 
        $expr: {
          $add: [
            { $size: "$likes" },
            { $multiply: ["$commentsCount", 2] } // Comments weight more than likes
          ]
        },
        createdAt: { $gte: weekAgo }
      };
    }
    
    // Build match criteria
    let matchCriteria: any = {};
    if (tags.length > 0) {
      matchCriteria.tags = { $in: tags };
    }
    
    // Fetch posts with user information and engagement metrics
    const posts = await postsCollection
      .aggregate([
        { $match: matchCriteria },
        {
          $addFields: {
            likesCount: { $size: "$likes" }
          }
        },
        { $sort: sortCriteria },
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
          $project: {
            title: 1,
            content: 1,
            media: 1,
            tags: 1,
            likes: 1,
            likesCount: 1,
            commentsCount: 1,
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
    const totalCount = await postsCollection.countDocuments(matchCriteria);

    return NextResponse.json({
      success: true,
      posts,
      pagination: {
        page,
        limit,
        hasMore: skip + posts.length < totalCount,
        total: totalCount
      }
    });
    
  } catch (error) {
    console.error("Error fetching posts:", error);
    return NextResponse.json({ error: "Failed to fetch posts" }, { status: 500 });
  } finally {
    await client.close();
  }
}

// POST - Create a new post
export async function POST(req: NextRequest) {
  const client = new MongoClient(uri);
  
  try {
    const { title, content, media, tags, civicId } = await req.json();
    
    if (!title?.trim() || !content?.trim() || !civicId) {
      return NextResponse.json({ 
        error: "Title, content, and civicId are required" 
      }, { status: 400 });
    }
    
    // Validate title and content length
    if (title.length > 200) {
      return NextResponse.json({ 
        error: "Title too long. Maximum 200 characters." 
      }, { status: 400 });
    }
    
    if (content.length > 5000) {
      return NextResponse.json({ 
        error: "Content too long. Maximum 5000 characters." 
      }, { status: 400 });
    }
    
    // Validate tags
    const processedTags = (tags || []).slice(0, 10).map((tag: string) => 
      tag.trim().toLowerCase().replace(/\s+/g, '-')
    ).filter((tag: string) => tag.length > 0 && tag.length <= 30);
    
    await client.connect();
    const db = client.db(dbName);
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
    
    // Create new post
    const newPost = {
      userId: user._id,
      title: title.trim(),
      content: content.trim(),
      media: media || [],
      tags: processedTags,
      likes: [],
      commentsCount: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const result = await postsCollection.insertOne(newPost);
    
    // Return the post with user info
    const postWithUser = await postsCollection
      .aggregate([
        { $match: { _id: result.insertedId } },
        {
          $addFields: {
            likesCount: { $size: "$likes" }
          }
        },
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
          $project: {
            title: 1,
            content: 1,
            media: 1,
            tags: 1,
            likes: 1,
            likesCount: 1,
            commentsCount: 1,
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
      post: postWithUser[0]
    });
    
  } catch (error) {
    console.error("Error creating post:", error);
    return NextResponse.json({ error: "Failed to create post" }, { status: 500 });
  } finally {
    await client.close();
  }
} 