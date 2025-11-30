import { Prisma, User } from "@prisma/client";
import type { UploadApiResponse } from "cloudinary";
import ApiError from "../../../lib/ApiError";
import prisma from "../../../lib/prisma";
import { buildHash } from "../../../utils/bcrypt";
import { deleteImageFromCloud } from "../../../utils/deleteImageFromCloud";

//* CREATE A NEW USER *\\
export const createUser = async (
  payload: User,
  file: UploadApiResponse | null,
) => {
  const existingUser = await prisma.user.findUnique({
    where: { email: payload.email },
  });
  if (existingUser) {
    throw new ApiError(400, "User with this email already exists");
  }

  payload.password = await buildHash(payload.password);

  await prisma.$transaction(async (trx) => {
    const newUser = await trx.user.create({
      data: payload,
    });

    if (file) {
      await trx.userAvatar.create({
        data: {
          userId: newUser.id,
          url: file.secure_url,
          publicId: file.public_id,
          folder: file.folder,
        },
      });
    }
  });
};

//* UPDATE AN EXISTING USER *\\
export const updateUser = async (
  id: string,
  payload: Prisma.UserUpdateInput,
  file: UploadApiResponse | null,
) => {
  const user = await prisma.user.findUnique({
    where: { id },
    select: { id: true, avatar: true },
  });
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  return await prisma.$transaction(async (trx) => {
    const updatedUser = await trx.user.update({
      where: { id },
      data: payload,
      include: {
        avatar: true,
        // events: true,
        // bookings: { include: { payment: true } },
      },
      omit: { password: true },
    });

    if (file) {
      if (user.avatar) {
        await trx.userAvatar.delete({
          where: { id: user.avatar.id },
        });

        await deleteImageFromCloud(user.avatar.publicId);
      }

      await trx.userAvatar.create({
        data: {
          userId: user.id,
          url: file.secure_url,
          publicId: file.public_id,
          folder: file.folder,
        },
      });
    }

    return updatedUser;
  });
};

//* SOFT DELETE A USER *\\
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

//* GET USER BY ID *\\
export const getUserById = async (id: string) => {
  const user = await prisma.user.findUnique({
    where: { id },
    include: {
      avatar: true,
      events: true,
      bookings: { include: { payment: true } },
    },
    omit: { password: true },
  });
  if (!user) {
    throw new ApiError(404, "User not found");
  }
  return user;
};

//* GET USER BY EMAIL *\\
export const getUserByEmail = async (email: string) => {
  const user = await prisma.user.findUnique({
    where: { email },
    include: { avatar: true },
    omit: { password: true },
  });
  return user;
};
