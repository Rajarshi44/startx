import { NextRequest, NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";

// Configure Cloudinary
cloudinary.config({
  cloud_name: "djydvffdp",
  api_key: "615679796164426",
  api_secret: "ObBGhhlXY5FxwCvvMqHIGuCsdxI",
  secure: true,
});

interface CloudinaryUploadResult {
  public_id: string;
  secure_url: string;
  url: string;
  format: string;
  resource_type: string;
  bytes: number;
  width?: number;
  height?: number;
  duration?: number;
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    const type = formData.get("type") as string; // 'image' or 'audio'
    const civicId = formData.get("civicId") as string;

    if (!file || !type || !civicId) {
      return NextResponse.json(
        {
          error: "File, type, and civicId are required",
        },
        { status: 400 }
      );
    }

    // Validate file size (10MB max)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json(
        {
          error: "File size must be less than 10MB",
        },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    let uploadResult: CloudinaryUploadResult | undefined;

    if (type === "image") {
      // Validate image types
      const allowedImageTypes = [
        "image/jpeg",
        "image/jpg",
        "image/png",
        "image/gif",
        "image/webp",
      ];
      if (!allowedImageTypes.includes(file.type)) {
        return NextResponse.json(
          {
            error: "Only JPEG, PNG, GIF, and WebP images are allowed",
          },
          { status: 400 }
        );
      }

      // Upload image to Cloudinary
      uploadResult = await new Promise<CloudinaryUploadResult>(
        (resolve, reject) => {
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
                else resolve(result as CloudinaryUploadResult);
              }
            )
            .end(buffer);
        }
      );
    } else if (type === "audio") {
      // Validate audio types
      const allowedAudioTypes = [
        "audio/webm",
        "audio/mp4",
        "audio/mpeg",
        "audio/wav",
      ];
      if (!allowedAudioTypes.includes(file.type)) {
        return NextResponse.json(
          {
            error: "Only WebM, MP4, MP3, and WAV audio files are allowed",
          },
          { status: 400 }
        );
      }

      // Upload audio to Cloudinary
      uploadResult = await new Promise<CloudinaryUploadResult>(
        (resolve, reject) => {
          cloudinary.uploader
            .upload_stream(
              {
                resource_type: "video", // Cloudinary treats audio as video
                folder: "community/audio",
                format: "mp3", // Convert to MP3 for better compatibility
              },
              (error, result) => {
                if (error) reject(error);
                else resolve(result as CloudinaryUploadResult);
              }
            )
            .end(buffer);
        }
      );
    } else {
      return NextResponse.json(
        {
          error: "Invalid file type. Must be 'image' or 'audio'",
        },
        { status: 400 }
      );
    }

    if (!uploadResult) {
      return NextResponse.json(
        {
          error: "Upload failed",
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        public_id: uploadResult.public_id,
        secure_url: uploadResult.secure_url,
        url: uploadResult.url,
        format: uploadResult.format,
        resource_type: uploadResult.resource_type,
        bytes: uploadResult.bytes,
        width: uploadResult.width,
        height: uploadResult.height,
        duration: uploadResult.duration,
        type: type,
      },
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      {
        error: "Upload failed. Please try again.",
      },
      { status: 500 }
    );
  }
}
