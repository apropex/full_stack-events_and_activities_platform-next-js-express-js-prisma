import type { UploadApiResponse } from "cloudinary";
import { JwtPayload } from "jsonwebtoken";
import ApiError from "../../../lib/ApiError";
import { fileUploader } from "../../../lib/fileUploader";
import catchAsync from "../../../shared/catchAsync";
import _response from "../../../shared/sendResponse";
import * as userService from "./user.service";

export const createUser = catchAsync(async (req, res) => {
  const payload = req.body;
  let file: UploadApiResponse | null = null;

  if (req.file) {
    const uploadResult = await fileUploader(req.file);
    if (uploadResult?.secure_url) file = uploadResult;
  }

  await userService.createUser(payload, file);

  _response(res, {
    message: "User created successfully!",
  });
});

export const updateUser = catchAsync(async (req, res) => {
  const payload = req.body;
  let file: UploadApiResponse | null = null;
  const user = req.decoded ?? ({} as JwtPayload);
  const { id } = req.params;

  if (user.id !== id && user.role !== "admin") {
    throw new ApiError(
      403,
      "Forbidden: You don't have permission to update this user",
    );
  }

  if (req.file) {
    const uploadResult = await fileUploader(req.file);
    if (uploadResult?.secure_url) file = uploadResult;
  }

  const updatedUser = await userService.updateUser(id, payload, file);
  _response(res, {
    message: "User updated successfully!",
    data: updatedUser,
  });
});

export const getUserById = catchAsync(async (req, res) => {
  const { id } = req.params;
  const user = await userService.getUserById(id);
  _response(res, {
    message: "User retrieved successfully!",
    data: user,
  });
});

export const getMe = catchAsync(async (req, res) => {
  const userId = req.decoded?.id ?? "";
  const user = await userService.getUserById(userId);
  _response(res, {
    message: "User retrieved successfully!",
    data: user,
  });
});

export const softDeleteUser = catchAsync(async (req, res) => {
  const user = req.decoded ?? ({} as JwtPayload);
  const { id } = req.params;
  if (user.id !== id && user.role !== "admin") {
    throw new ApiError(
      403,
      "Forbidden: You don't have permission to delete this user",
    );
  }

  await userService.softDeleteUser(id);
  _response(res, {
    message: "User deleted successfully!",
    data: null,
  });
});
