import { NextRequest, NextResponse } from "next/server";
import { MongoClient } from "mongodb";

const uri = "mongodb+srv://rishi404:giXEpvLDXFg8Jwzd@cluster0.6nhngod.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
const dbName = "resumeUploads";

// GET - Check if user exists and get user info
export async function GET(req: NextRequest) {
  const client = new MongoClient(uri);
  
  try {
    const url = new URL(req.url);
    const civicId = url.searchParams.get("civicId");
    
    if (!civicId) {
      return NextResponse.json({ error: "civicId parameter is required" }, { status: 400 });
    }
    
    await client.connect();
    const db = client.db(dbName);
    const usersCollection = db.collection("communityUsers");
    
    const user = await usersCollection.findOne({ civicId });
    
    if (!user) {
      return NextResponse.json({ 
        success: true, 
        exists: false, 
        user: null 
      });
    }
    
    return NextResponse.json({ 
      success: true, 
      exists: true, 
      user: {
        _id: user._id,
        username: user.username,
        civicId: user.civicId,
        verificationStatus: user.verificationStatus,
        joinedAt: user.joinedAt
      }
    });
    
  } catch (error) {
    console.error("Error checking user:", error);
    return NextResponse.json({ error: "Failed to check user" }, { status: 500 });
  } finally {
    await client.close();
  }
}

// POST - Register new user or update username
export async function POST(req: NextRequest) {
  const client = new MongoClient(uri);
  
  try {
    const { civicId, username, walletAddress } = await req.json();
    
    if (!civicId || !username) {
      return NextResponse.json({ error: "civicId and username are required" }, { status: 400 });
    }
    
    // Validate username
    if (username.length < 3 || username.length > 20) {
      return NextResponse.json({ error: "Username must be between 3 and 20 characters" }, { status: 400 });
    }
    
    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      return NextResponse.json({ error: "Username can only contain letters, numbers, and underscores" }, { status: 400 });
    }
    
    await client.connect();
    const db = client.db(dbName);
    const usersCollection = db.collection("communityUsers");
    
    // Check if username is already taken
    const existingUsername = await usersCollection.findOne({ 
      username: username.toLowerCase(),
      civicId: { $ne: civicId }
    });
    
    if (existingUsername) {
      return NextResponse.json({ error: "Username is already taken" }, { status: 409 });
    }
    
    // Check if user already exists
    const existingUser = await usersCollection.findOne({ civicId });
    
    if (existingUser) {
      // Update existing user
      const result = await usersCollection.updateOne(
        { civicId },
        { 
          $set: { 
            username: username.toLowerCase(),
            walletAddress: walletAddress || existingUser.walletAddress,
            updatedAt: new Date()
          }
        }
      );
      
      if (result.modifiedCount === 0) {
        return NextResponse.json({ error: "Failed to update user" }, { status: 500 });
      }
      
      const updatedUser = await usersCollection.findOne({ civicId });

      if (!updatedUser) {
        return NextResponse.json({ error: "Failed to retrieve updated user" }, { status: 500 });
      }
      
      return NextResponse.json({ 
        success: true, 
        user: {
          _id: updatedUser._id,
          username: updatedUser.username,
          civicId: updatedUser.civicId,
          verificationStatus: updatedUser.verificationStatus,
          joinedAt: updatedUser.joinedAt
        },
        message: "Username updated successfully"
      });
    } else {
      // Create new user
      const newUser = {
        civicId,
        username: username.toLowerCase(),
        walletAddress: walletAddress || null,
        verificationStatus: "verified", // Auto-verify since they're on our platform
        joinedAt: new Date(),
        updatedAt: new Date()
      };
      
      const result = await usersCollection.insertOne(newUser);
      
      return NextResponse.json({ 
        success: true, 
        user: {
          _id: result.insertedId,
          username: newUser.username,
          civicId: newUser.civicId,
          verificationStatus: newUser.verificationStatus,
          joinedAt: newUser.joinedAt
        },
        message: "User registered successfully"
      });
    }
    
  } catch (error) {
    console.error("Error registering user:", error);
    return NextResponse.json({ error: "Failed to register user" }, { status: 500 });
  } finally {
    await client.close();
  }
}

// PUT - Update user verification status (admin only)
export async function PUT(req: NextRequest) {
  const client = new MongoClient(uri);
  
  try {
    const { civicId, verificationStatus, adminCivicId } = await req.json();
    
    if (!civicId || !verificationStatus || !adminCivicId) {
      return NextResponse.json({ error: "civicId, verificationStatus, and adminCivicId are required" }, { status: 400 });
    }
    
    // TODO: Add admin verification logic here
    // For now, we'll allow any verified user to update verification status
    
    await client.connect();
    const db = client.db(dbName);
    const usersCollection = db.collection("communityUsers");
    
    const result = await usersCollection.updateOne(
      { civicId },
      { 
        $set: { 
          verificationStatus,
          updatedAt: new Date()
        }
      }
    );
    
    if (result.modifiedCount === 0) {
      return NextResponse.json({ error: "User not found or update failed" }, { status: 404 });
    }
    
    return NextResponse.json({ 
      success: true, 
      message: "Verification status updated successfully"
    });
    
  } catch (error) {
    console.error("Error updating verification:", error);
    return NextResponse.json({ error: "Failed to update verification" }, { status: 500 });
  } finally {
    await client.close();
  }
} 