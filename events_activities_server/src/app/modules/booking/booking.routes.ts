import { Role } from "@prisma/client";
import { Router } from "express";
import { roleVerifier } from "../../middlewares/roleVerifier";
import { tokenVerifier } from "../../middlewares/tokenVerifier";
import { userAccessVerifier } from "../../middlewares/userAccessVerifier";
import * as bookingControllers from "./booking.controller";

const bookingRoutes = Router();

bookingRoutes.post(
  "/create",
  tokenVerifier,
  userAccessVerifier,
  bookingControllers.createBooking,
);

bookingRoutes.get(
  "/all",
  roleVerifier(Role.ADMIN),
  bookingControllers.getAllBookings,
);

bookingRoutes.get(
  "/my-bookings",
  tokenVerifier,
  bookingControllers.getMyBookings,
);

bookingRoutes.patch(
  "/:id/status",
  roleVerifier(Role.ADMIN),
  bookingControllers.updateBookingStatus,
);

bookingRoutes.get("/:id", tokenVerifier, bookingControllers.getBookingById);

export default bookingRoutes;
