import type { UploadApiResponse } from "cloudinary";
import fs from "fs/promises";
import { sCode } from "../utils";
import ApiError from "./ApiError";
import { cloudinary } from "./config/cloudinary/cloudinary.config";

/**
 * Uploads a file to Cloudinary with retry logic and automatic local file cleanup.
 * Returns the full Cloudinary response for storage in Prisma models (e.g., UserAvatar or EventImage).
 * Supports exponential backoff retries and handles production-level error scenarios.
 *
 * @param file - The Multer file object to upload.
 * @param maxRetries - Maximum retry attempts (default: 3).
 * @returns The Cloudinary upload result object.
 * @throws ApiError - If upload fails after all retries.
 */

export const fileUploader = async (
  file: Express.Multer.File,
  folder: string = "events-activity/uploads",
  maxRetries: number = 3,
): Promise<UploadApiResponse> => {
  let attempt = 0;
  let lastError: unknown;

  while (attempt < maxRetries) {
    try {
      const result = await cloudinary.uploader.upload(file.path, {
        folder,
        resource_type: "auto",
        timeout: 60000, // 60s timeout for large files
      });

      // Clean up local file on success
      await fs.unlink(file.path).catch((err) => {
        console.warn(`Failed to delete local file ${file.path}:`, err);
      });

      return result;
    } catch (error) {
      attempt++;
      lastError = error;
      console.error(
        `Cloudinary upload attempt ${attempt}/${maxRetries} failed for file ${file.originalname}:`,
        (error as Error).message,
      );

      // Exponential backoff delay
      await new Promise((resolve) =>
        setTimeout(resolve, 1000 * Math.pow(2, attempt)),
      );
    }
  }

  // Clean up local file on final failure
  await fs.unlink(file.path).catch((err) => {
    console.error(
      `Failed to delete local file ${file.path} after upload failure:`,
      err,
    );
  });

  throw new ApiError(
    sCode.INTERNAL_SERVER_ERROR,
    `Failed to upload file to Cloudinary after ${maxRetries} attempts. ${(lastError as Error)?.message || "Unknown error"}`,
  );
};

/**
 * Uploads multiple files to Cloudinary in parallel with individual retry logic.
 * Returns an array of Cloudinary responses for storage in Prisma models.
 * Cleans up local files regardless of success/failure.
 *
 * @param files - Array of Multer file objects to upload.
 * @param maxRetries - Maximum retry attempts per file (default: 3).
 * @returns Array of Cloudinary upload results.
 * @throws ApiError - If any upload fails after retries.
 */
export const multiFileUploaderToCloud = async (
  files: Express.Multer.File[],
  folder?: string,
  maxRetries: number = 3,
): Promise<UploadApiResponse[]> => {
  const uploadPromises = files.map((file) =>
    fileUploader(file, folder, maxRetries),
  );

  try {
    return await Promise.all(uploadPromises);
  } catch (error) {
    // On error, attempt to clean up any remaining local files
    await Promise.all(
      files.map((file) =>
        fs.unlink(file.path).catch((err) => {
          console.warn(
            `Failed to delete local file ${file.path} after multi-upload error:`,
            err,
          );
        }),
      ),
    );
    throw error;
  }
};
