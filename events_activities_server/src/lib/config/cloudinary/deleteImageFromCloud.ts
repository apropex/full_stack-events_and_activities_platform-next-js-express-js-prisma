import { sCode } from "../../../utils";
import { extractPublicIdFromUrl } from "../../../utils/extractPublicIdFromUrl";
import ApiError from "../../ApiError";
import { cloudinary } from "./cloudinary.config";

export const deleteImageFromCloud = async (url: string) => {
  const publicId = extractPublicIdFromUrl(url);
  try {
    if (publicId) await cloudinary.uploader.destroy(publicId);
  } catch {
    throw new ApiError(sCode.BAD_REQUEST, "Cloudinary image deletion failed");
  }
};
