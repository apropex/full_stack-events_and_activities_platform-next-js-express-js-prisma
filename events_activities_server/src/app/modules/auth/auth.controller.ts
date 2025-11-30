import { User, UserStatus } from "@prisma/client";
import ApiError from "../../../lib/ApiError";
import { setCookie } from "../../../lib/cookie";
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from "../../../lib/jwt";
import prisma from "../../../lib/prisma";
import catchAsync from "../../../shared/catchAsync";
import _response from "../../../shared/sendResponse";
import { sCode } from "../../../utils";
import * as authServices from "./auth.service";

//* USER LOGIN *\\
export const login = catchAsync(async (req, res) => {
  const { user, access_token, refresh_token } = await authServices.login(
    req.body,
  );
  setCookie.allTokens(res, access_token, refresh_token);

  _response(res, {
    message: "User logged in successfully!",
    data: user,
  });
});

//* RESET PASSWORD *\\
export const resetPassword = catchAsync(async (req, res) => {
  await authServices.resetPassword(req.decoded?.id ?? "", req.body);
  _response(res, {
    message: "Password updated successfully!",
  });
});

//* GET ACCESS TOKEN BY REFRESH TOKEN *\\
export const getAccessTokenByRefreshToken = catchAsync(async (req, res) => {
  const existingRefreshToken = req.cookies.refreshToken;

  // 1. Refresh Token missing?
  if (!existingRefreshToken) {
    setCookie.clearCookies(res);
    throw new ApiError(sCode.UNAUTHORIZED, "Refresh token is missing");
  }

  let decoded: Partial<User>;

  try {
    decoded = verifyRefreshToken(existingRefreshToken) as Partial<User>;
  } catch (err) {
    setCookie.clearCookies(res);
    throw new ApiError(sCode.UNAUTHORIZED, "Invalid or expired refresh token");
  }

  const userId = decoded.id;

  // 2. Check if user exists
  const user = await prisma.user.findUnique({
    where: { id: userId },
    omit: { password: true },
  });

  if (!user) {
    setCookie.clearCookies(res);
    throw new ApiError(sCode.UNAUTHORIZED, "User not found");
  }
  if (!user.isDeleted) {
    throw new ApiError(
      sCode.BAD_REQUEST,
      "User account was deleted, contact to support",
    );
  }
  if (user.status === UserStatus.BANNED) {
    throw new ApiError(
      sCode.BAD_REQUEST,
      "User account was banned, contact to support",
    );
  }

  const newAccessToken = generateAccessToken(user);
  const newRefreshToken = generateRefreshToken(user);
  setCookie.allTokens(res, newAccessToken, newRefreshToken);

  _response(res, { message: "Token refreshed successfully!", data: null });
});
