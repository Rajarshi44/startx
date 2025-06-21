import { NextRequest, NextResponse } from "next/server";
import { MongoClient, ObjectId } from "mongodb";

const uri =
  "mongodb+srv://rishi404:giXEpvLDXFg8Jwzd@cluster0.6nhngod.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
const dbName = "resumeUploads";

// GET - Get single post with comments
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

    await client.connect();
    const db = client.db(dbName);
    const postsCollection = db.collection("communityPosts");

    // Get post with user information
    const post = await postsCollection
      .aggregate([
        { $match: { _id: new ObjectId(postId) } },
        {
          $addFields: {
            likesCount: { $size: "$likes" },
          },
        },
        {
          $lookup: {
            from: "communityUsers",
            localField: "userId",
            foreignField: "_id",
            as: "user",
          },
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
            "user.verificationStatus": 1,
          },
        },
      ])
      .toArray();

    if (post.length === 0) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      post: post[0],
    });
  } catch (error) {
    console.error("Error fetching post:", error);
    return NextResponse.json(
      { error: "Failed to fetch post" },
      { status: 500 }
    );
  } finally {
    await client.close();
  }
}

// PUT - Update post (only by owner)
export async function PUT(
  req: NextRequest,
  { params }: { params: { postId: string } }
) {
  const client = new MongoClient(uri);

  try {
    const { postId } = params;
    const { title, content, media, tags, civicId } = await req.json();

    if (!ObjectId.isValid(postId)) {
      return NextResponse.json({ error: "Invalid post ID" }, { status: 400 });
    }

    if (!civicId) {
      return NextResponse.json(
        { error: "civicId is required" },
        { status: 400 }
      );
    }

    await client.connect();
    const db = client.db(dbName);
    const postsCollection = db.collection("communityPosts");
    const usersCollection = db.collection("communityUsers");

    // Find the user by civicId
    const user = await usersCollection.findOne({ civicId });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check if user owns the post
    const post = await postsCollection.findOne({ _id: new ObjectId(postId) });

    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    if (post.userId.toString() !== user._id.toString()) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Update post
    interface UpdateData {
      updatedAt: Date;
      title?: string;
      content?: string;
      media?: Array<{
        type: string;
        url: string;
        publicId: string;
        width?: number;
        height?: number;
        duration?: number;
        format?: string;
        bytes?: number;
      }>;
      tags?: string[];
    }

    const updateData: UpdateData = { updatedAt: new Date() };

    if (title !== undefined) updateData.title = title.trim();
    if (content !== undefined) updateData.content = content.trim();
    if (media !== undefined) updateData.media = media;
    if (tags !== undefined) {
      updateData.tags = tags
        .slice(0, 10)
        .map((tag: string) => tag.trim().toLowerCase().replace(/\s+/g, "-"))
        .filter((tag: string) => tag.length > 0 && tag.length <= 30);
    }

    await postsCollection.updateOne(
      { _id: new ObjectId(postId) },
      { $set: updateData }
    );

    // Return updated post
    const updatedPost = await postsCollection
      .aggregate([
        { $match: { _id: new ObjectId(postId) } },
        {
          $addFields: {
            likesCount: { $size: "$likes" },
          },
        },
        {
          $lookup: {
            from: "communityUsers",
            localField: "userId",
            foreignField: "_id",
            as: "user",
          },
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
            "user.verificationStatus": 1,
          },
        },
      ])
      .toArray();

    return NextResponse.json({
      success: true,
      post: updatedPost[0],
    });
  } catch (error) {
    console.error("Error updating post:", error);
    return NextResponse.json(
      { error: "Failed to update post" },
      { status: 500 }
    );
  } finally {
    await client.close();
  }
}

// DELETE - Delete post (only by owner)
export async function DELETE(
  req: NextRequest,
  { params }: { params: { postId: string } }
) {
  const client = new MongoClient(uri);

  try {
    const { postId } = params;
    const url = new URL(req.url);
    const civicId = url.searchParams.get("civicId");

    if (!ObjectId.isValid(postId)) {
      return NextResponse.json({ error: "Invalid post ID" }, { status: 400 });
    }

    if (!civicId) {
      return NextResponse.json(
        { error: "civicId is required" },
        { status: 400 }
      );
    }

    await client.connect();
    const db = client.db(dbName);
    const postsCollection = db.collection("communityPosts");
    const commentsCollection = db.collection("communityComments");
    const usersCollection = db.collection("communityUsers");

    // Find the user by civicId
    const user = await usersCollection.findOne({ civicId });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check if user owns the post
    const post = await postsCollection.findOne({ _id: new ObjectId(postId) });

    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    if (post.userId.toString() !== user._id.toString()) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Delete post and its comments
    await Promise.all([
      postsCollection.deleteOne({ _id: new ObjectId(postId) }),
      commentsCollection.deleteMany({ postId: new ObjectId(postId) }),
    ]);

    return NextResponse.json({
      success: true,
      message: "Post deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting post:", error);
    return NextResponse.json(
      { error: "Failed to delete post" },
      { status: 500 }
    );
  } finally {
    await client.close();
  }
}
