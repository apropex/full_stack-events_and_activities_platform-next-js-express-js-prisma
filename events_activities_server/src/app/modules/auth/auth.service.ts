import { UserStatus } from "@prisma/client";
import ApiError from "../../../lib/ApiError";
import { setOtp, verifyOtp } from "../../../lib/config/redis.config";
import { generateAccessToken, generateRefreshToken } from "../../../lib/jwt";
import prisma from "../../../lib/prisma";
import { sCode } from "../../../utils";
import { buildHash, compareHash } from "../../../utils/bcrypt";
import {
  iLoginPayload,
  iOtpVerifyPayload,
  iResetPasswordPayload,
} from "./auth.validation";

//* USER LOGIN *\\
export const login = async (payload: iLoginPayload) => {
  const existingUser = await prisma.user.findUnique({
    where: { email: payload.email },
    include: {
      avatar: true,
      events: true,
      bookings: { include: { payment: true } },
    },
  });

  if (!existingUser) {
    throw new ApiError(404, "User does not exist with this email");
  }

  const { password, ...safeUser } = existingUser;

  await compareHash(payload.password, password);

  const access_token = generateAccessToken(safeUser);
  const refresh_token = generateRefreshToken(safeUser);

  return { user: safeUser, access_token, refresh_token };
};

//* RESET PASSWORD *\\
export const resetPassword = async (
  id: string,
  { oldPassword, newPassword }: iResetPasswordPayload,
) => {
  const existingUser = await prisma.user.findUnique({ where: { id } });
  await compareHash(oldPassword, existingUser?.password ?? "");

  const hashed = await buildHash(newPassword);
  await prisma.user.update({ where: { id }, data: { password: hashed } });
};

//* VERIFY USER *\\
export const verifyUser = async ({ email, option, otp }: iOtpVerifyPayload) => {
  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (!existingUser) {
    throw new ApiError(sCode.NOT_FOUND, "User does not exist with this email");
  }

  if (existingUser.isVerified) {
    throw new ApiError(sCode.BAD_REQUEST, "User already verified");
  }

  if (option === "setOtp") return await setOtp(email);
  //
  else if (option === "verifyOtp") {
    if (!otp) throw new ApiError(sCode.BAD_REQUEST, "OTP not found");
    const result = await verifyOtp(email, otp);

    if (result.success) {
      await prisma.user.update({
        where: { id: existingUser.id },
        data: { isVerified: true },
      });
    }

    return result;
  }
};

//* FORGOT PASSWORD *\\
export const forgotPassword = async ({
  email,
  option,
  otp,
}: iOtpVerifyPayload) => {
  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (!existingUser) {
    throw new ApiError(sCode.NOT_FOUND, "User does not exist with this email");
  }

  if (existingUser.isDeleted) {
    throw new ApiError(
      sCode.BAD_REQUEST,
      "User was deleted, contact to support",
    );
  }

  if (existingUser.status === UserStatus.BANNED) {
    throw new ApiError(
      sCode.BAD_REQUEST,
      "User was banned, contact to support",
    );
  }

  if (option === "setOtp") return await setOtp(email);
  //
  else if (option === "verifyOtp") {
    if (!otp) throw new ApiError(sCode.BAD_REQUEST, "OTP not found");
    const result = await verifyOtp(email, otp);

    if (result.success) {
      const access_token = generateAccessToken(
        { id: existingUser.id },
        { period: "5m" },
      );
      return { access_token };
    }
  }
};

//* RESET FORGOT PASSWORD *\\
export const resetForgotPassword = async (
  id: string,
  { newPassword }: { newPassword: string },
) => {
  const hashed = await buildHash(newPassword);
  await prisma.user.update({ where: { id }, data: { password: hashed } });
};
