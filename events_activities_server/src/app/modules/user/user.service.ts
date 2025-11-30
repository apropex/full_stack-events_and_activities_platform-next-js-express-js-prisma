import { Prisma, User } from "@prisma/client";
import ApiError from "../../../lib/ApiError";
import prisma from "../../../lib/prisma";
import { buildHash } from "../../../utils/bcrypt";

export const createUser = async (payload: User) => {
  const existingUser = await prisma.user.findUnique({
    where: { email: payload.email },
  });
  if (existingUser) {
    throw new ApiError(400, "User with this email already exists");
  }

  payload.password = await buildHash(payload.password);

  const newUser = await prisma.user.create({
    data: payload,
  });
  return newUser;
};

export const updateUser = async (
  id: string,
  payload: Prisma.UserUpdateInput,
) => {
  const user = await prisma.user.findUnique({
    where: { id },
  });
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  const updatedUser = await prisma.user.update({
    where: { id },
    data: payload,
  });
  return updatedUser;
};

export const softDeleteUser = async (id: string) => {
  const user = await prisma.user.findUnique({
    where: { id },
  });
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  await prisma.user.update({
    where: { id },
    data: { isDeleted: true },
  });
};

export const getUserById = async (id: string) => {
  const user = await prisma.user.findUnique({
    where: { id },
  });
  if (!user) {
    throw new ApiError(404, "User not found");
  }
  return user;
};

export const getUserByEmail = async (email: string) => {
  const user = await prisma.user.findUnique({
    where: { email },
  });
  return user;
};
