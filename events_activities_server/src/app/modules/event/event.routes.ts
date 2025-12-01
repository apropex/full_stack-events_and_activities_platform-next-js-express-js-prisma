import { Role } from "@prisma/client";
import { Router } from "express";
import { multiFileUploader } from "../../../lib/config/cloudinary/multer.controller";
import { roleVerifier } from "../../middlewares/roleVerifier";
import { tokenVerifier } from "../../middlewares/tokenVerifier";
import validateRequest from "../../middlewares/validateRequest";
import * as eventControllers from "./event.controller";
import {
  CreateEventPayloadSchema,
  UpdateEventPayloadSchema,
} from "./event.validation";

const router = Router();

const { SUPER_ADMIN, ADMIN, HOST } = Role;

router.get("/", eventControllers.getAllEvents);

router.get("/:id", tokenVerifier, eventControllers.getEventById);

router.post(
  "/create",
  roleVerifier(SUPER_ADMIN, ADMIN, HOST),
  multiFileUploader,
  validateRequest(CreateEventPayloadSchema),
  eventControllers.createEvent,
);

router.post(
  "/update",
  roleVerifier(SUPER_ADMIN, ADMIN, HOST),
  multiFileUploader,
  validateRequest(UpdateEventPayloadSchema),
  eventControllers.updateEvent,
);

router.delete(
  "/soft-delete/:id",
  roleVerifier(SUPER_ADMIN, ADMIN, HOST),
  eventControllers.eventSoftDelete,
);

router.delete(
  "/hard-delete/:id",
  roleVerifier(SUPER_ADMIN, ADMIN),
  eventControllers.eventHardDelete,
);

export default router;
