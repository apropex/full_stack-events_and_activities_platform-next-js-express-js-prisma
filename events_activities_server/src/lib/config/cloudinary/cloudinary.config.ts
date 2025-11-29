import { v2 } from "cloudinary";
import env from "../env";

v2.config({
  cloud_name: env.cloudinary.cloud_name,
  api_key: env.cloudinary.api_key,
  api_secret: env.cloudinary.api_secret,
  secure: true,
});

export const cloudinary = v2;
