import { NextRequest, NextResponse } from "next/server";
import { MongoClient, ObjectId } from "mongodb";

const uri =
  "mongodb+srv://rishi404:giXEpvLDXFg8Jwzd@cluster0.6nhngod.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
const dbName = "resumeUploads";

// POST - Like/Unlike a post
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ postId: string }> }
) {
  const client = new MongoClient(uri);

  try {
    const { postId } = await params;
    const { civicId } = await req.json();

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

    if (user.verificationStatus !== "verified") {
      return NextResponse.json(
        {
          error: "User not verified. Please complete verification.",
        },
        { status: 403 }
      );
    }

    // Check if post exists
    const post = await postsCollection.findOne({ _id: new ObjectId(postId) });

    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    const userIdObj = new ObjectId(user._id);
    const likes = post.likes || [];
    const isLiked = likes.some(
      (id: unknown) =>
        id && typeof id === "object" && id.toString() === userIdObj.toString()
    );

    if (isLiked) {
      // Unlike the post
      await postsCollection.updateOne(
        { _id: new ObjectId(postId) },
        { $pull: { likes: userIdObj as unknown as never } }
      );
    } else {
      // Like the post
      await postsCollection.updateOne(
        { _id: new ObjectId(postId) },
        { $addToSet: { likes: userIdObj as unknown as never } }
      );
    }

    // Get updated like count
    const updatedPost = await postsCollection.findOne({
      _id: new ObjectId(postId),
    });

    return NextResponse.json({
      success: true,
      liked: !isLiked,
      likesCount: updatedPost?.likes?.length || 0,
    });
  } catch (error) {
    console.error("Error toggling like:", error);
    return NextResponse.json(
      { error: "Failed to toggle like" },
      { status: 500 }
    );
  } finally {
    await client.close();
  }
}
