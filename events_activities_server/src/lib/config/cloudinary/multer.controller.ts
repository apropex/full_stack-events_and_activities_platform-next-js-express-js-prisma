import fs from "fs";
import multer from "multer";
import path, { extname } from "path";
import { join } from "../../../utils";

const uploadPath = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = join(
      "ph-health-care",
      "-",
      Date.now(),
      "-",
      Math.round(Math.random() * 1000),
    );
    const ext = extname(file.originalname);
    cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
  },
});

const fileFilter = (
  req: Express.Request,
  file: Express.Multer.File,
  cb: any,
) => {
  const allowed = /jpeg|jpg|png|pdf|webp/;
  const ext = path.extname(file.originalname).toLowerCase();
  if (allowed.test(ext)) cb(null, true);
  else cb(new Error("Unsupported file type"), false);
};

const upload = multer({ storage, fileFilter });

export const singleFileUploader = upload.single("file");
export const multiFileUploader = upload.array("files");
