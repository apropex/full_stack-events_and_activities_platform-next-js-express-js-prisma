import ApiError from "../../../lib/ApiError";
import catchAsync from "../../../shared/catchAsync";
import _response from "../../../shared/sendResponse";
import { sCode } from "../../../utils";
import * as bookingServices from "./booking.service";

//
export const createBooking = catchAsync(async (req, res) => {
  const { data, options } = await bookingServices.createBooking(
    req.decoded ?? {},
    req.body,
  );

  _response(res, {
    message: "Booking created successfully",
    data,
    meta: { options },
  });
});

//
export const getAllBookings = catchAsync(async (req, res) => {
  const result = await bookingServices.getAllBookings(req.query);

  _response(res, {
    message: "All bookings retrieved successfully!",
    data: result,
  });
});

//
export const getMyBookings = catchAsync(async (req, res) => {
  if (!req.decoded?.id) {
    throw new ApiError(
      sCode.BAD_REQUEST,
      "User id not found, login again or contact to support",
    );
  }

  const result = await bookingServices.getMyBookings(req.decoded.id, req.query);

  _response(res, {
    message: "User bookings retrieved successfully!",
    data: result,
  });
});

//
export const updateBookingStatus = catchAsync(async (req, res) => {
  const result = await bookingServices.updateBookingStatus(
    req.params.id,
    req.body,
  );

  _response(res, {
    message: "Booking updated successfully!",
    data: result,
  });
});

//
export const getBookingById = catchAsync(async (req, res) => {
  const result = await bookingServices.getBookingById(req.params.id);

  _response(res, {
    message: "Booking retrieved successfully!",
    data: result,
  });
});
