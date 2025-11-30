import fs from "fs";
import multer from "multer";
import path from "path";
import { join } from "../../../utils"; // Adjust import path as needed

// Define the upload directory
const uploadPath = path.join(process.cwd(), "uploads");

// Ensure the upload directory exists (synchronously at startup – safe & common practice)
if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath, { recursive: true });
}

// Configure Multer storage
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadPath);
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = join(
      "event-activity-platform",
      "-",
      Date.now().toString(),
      "-",
      Math.round(Math.random() * 1e9).toString(),
    );
    const ext = path.extname(file.originalname);
    cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
  },
});

// File filter to allow only supported image types
const fileFilter = (
  _req: Express.Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback,
) => {
  const allowedTypes = /jpeg|jpg|png|webp|gif/i;
  const ext = path.extname(file.originalname).toLowerCase();
  const mimeType = file.mimetype.toLowerCase();

  if (allowedTypes.test(ext) && allowedTypes.test(mimeType)) {
    cb(null, true);
  } else {
    cb(
      new Error(
        "Unsupported file type. Only JPEG, JPG, PNG, WEBP, GIF are allowed.",
      ),
    );
  }
};

// Multer instance with limits for production safety
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB max file size
    files: 10, // Max 10 files per request
  },
});

export const singleFileUploader = upload.single("file");
export const multiFileUploader = upload.array("files", 10); // Limit to 10 files
