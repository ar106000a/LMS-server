import { v2 as cloudinary } from "cloudinary";
import { env } from "../../config/env"; // Your validated environment config

// Initialize SDK configuration
cloudinary.config({
  cloud_name: env.CLOUD_NAME,
  api_key: env.CLOUD_API_KEY,
  api_secret: env.CLOUD_SECRET_KEY,
});

export class CloudinaryService {
  /**
   * Pipes a memory buffer stream directly up to Cloudinary with async execution wrapping
   */
  async uploadVideo(
    fileBuffer: Buffer,
    folderName: string = "lms/videos",
  ): Promise<{ videoUrl: string; duration: number }> {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          resource_type: "video",
          folder: folderName,
          // Cloudinary automatically extracts audio/video properties like length
        },
        (error, result) => {
          if (error || !result) {
            return reject(error);
          }
          resolve({
            videoUrl: result.secure_url,
            duration: Math.round(result.duration || 0), // Extracted duration in seconds
          });
        },
      );

      // Write the buffer to the readable upload stream
      uploadStream.end(fileBuffer);
    });
  }

  async deleteVideo(url: string): Promise<void> {
    try {
      // Extract the Cloudinary public ID from the secure storage URL string
      const matches = url.match(/\/v\d+\/(.+)\./);
      if (matches && matches[1]) {
        const publicId = matches[1];
        await cloudinary.uploader.destroy(publicId, { resource_type: "video" });
      }
    } catch (error) {
      // Log deletion errors silently to keep background processing unblocked
      console.error("Failed to clean up legacy Cloudinary asset:", error);
    }
  }
}
