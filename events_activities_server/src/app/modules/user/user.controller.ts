import catchAsync from "../../../shared/catchAsync";
import _response from "../../../shared/sendResponse";
import * as userService from "./user.service";

export const createUser = catchAsync(async (req, res) => {
  const user = await userService.createUser(req.body);

  _response(res, {
    message: "User created successfully!",
    data: user,
  });
});

export const updateUser = catchAsync(async (req, res) => {
  const { id } = req.params;
  const updatedUser = await userService.updateUser(id, req.body);
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
  const { id } = req.params;
  await userService.softDeleteUser(id);
  _response(res, {
    message: "User deleted successfully!",
    data: null,
  });
});
