import { Router } from "express";
import { singleFileUploader } from "../../../lib/config/cloudinary/multer.controller";
import { tokenVerifier } from "../../middlewares/tokenVerifier";
import validateRequest from "../../middlewares/validateRequest";
import * as userController from "./user.controller";
import { CreateUserSchema, UpdateUserSchema } from "./user.validation";

const router = Router();

router.post(
  "/",
  singleFileUploader,
  validateRequest(CreateUserSchema),
  userController.createUser,
);

router.patch(
  "/:id",
  tokenVerifier,
  singleFileUploader,
  validateRequest(UpdateUserSchema),
  userController.updateUser,
);

router.get("/me", tokenVerifier, userController.getMe);
router.get("/:id", tokenVerifier, userController.getUserById);
router.delete("/:id", tokenVerifier, userController.softDeleteUser);

export default router;
