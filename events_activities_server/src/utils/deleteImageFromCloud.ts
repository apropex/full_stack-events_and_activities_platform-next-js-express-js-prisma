import { sCode } from ".";
import ApiError from "../lib/ApiError";
import { cloudinary } from "../lib/config/cloudinary/cloudinary.config";


/**
 * Deletes an image from Cloudinary using its public ID.
 * This function is designed to be called after retrieving the public ID from the Prisma model (e.g., UserAvatar or EventImage).
 * It handles errors gracefully and throws a custom ApiError on failure.
 *
 * @param publicId - The Cloudinary public ID of the image to delete.
 * @throws ApiError - If deletion fails.
 */
export const deleteImageFromCloud = async (publicId: string): Promise<void> => {
  if (!publicId) {
    throw new ApiError(sCode.BAD_REQUEST, "Public ID is required for image deletion");
  }

  try {
    const result = await cloudinary.uploader.destroy(publicId);
    if (result.result !== "ok") {
      throw new Error(`Cloudinary deletion failed: ${result.result}`);
    }
  } catch (error) {
    console.error("Cloudinary image deletion error:", error);
    throw new ApiError(sCode.INTERNAL_SERVER_ERROR, "Failed to delete image from Cloudinary");
  }
};