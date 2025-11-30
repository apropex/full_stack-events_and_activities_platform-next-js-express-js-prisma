import ApiError from "../../../lib/ApiError";
import { generateAccessToken, generateRefreshToken } from "../../../lib/jwt";
import prisma from "../../../lib/prisma";
import { buildHash, compareHash } from "../../../utils/bcrypt";
import { iLoginPayload, iResetPasswordPayload } from "./auth.validation";

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
