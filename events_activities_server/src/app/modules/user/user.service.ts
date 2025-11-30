import { Prisma, User } from "@prisma/client";
import type { UploadApiResponse } from "cloudinary";
import ApiError from "../../../lib/ApiError";
import prisma from "../../../lib/prisma";
import { iQuery } from "../../../shared/global-query-interfaces";
import { buildHash } from "../../../utils/bcrypt";
import configureQuery, {
  getSearchFilters,
} from "../../../utils/configureQuery";
import { deleteImageFromCloud } from "../../../utils/deleteImageFromCloud";
import {
  userBooleanFields,
  userFilterFields,
  userSearchFields,
} from "./user.constants";

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

//* GET ALL USERS *\\

type WhereInput = Prisma.UserWhereInput;

export const getAllUsers = async (query: iQuery) => {
  const { page, take, skip, orderBy, search, filters } = configureQuery(query, {
    filterFields: userFilterFields,
    booleanFields: userBooleanFields,
  });

  const { interests, ...restFilters } = filters;

  const where = getSearchFilters({
    searchFields: userSearchFields,
    search,
    filters: { ...restFilters },
  }) as WhereInput;

  if (!Array.isArray(where?.AND)) where.AND = [];

  const interestsArray = (interests as string)
    ?.split(" ")
    .map((interest) => interest.trim())
    ?.filter((interest) => interest.length > 0);

  if (interestsArray && interestsArray.length > 0) {
    where.AND.push({
      interests: {
        hasSome: interestsArray,
      },
    });
  }

  const include = {
    avatar: true,
  };

  const [users, total_records, filtered_records] = await Promise.all([
    prisma.user.findMany({ where, orderBy, skip, take, include }),
    prisma.user.count(),
    prisma.user.count({ where }),
  ]);

  return {
    data: users,
    meta: {
      total_records,
      filtered_records,
      present_records: users.length ?? 0,
      total_pages: Math.ceil(filtered_records / take),
      present_page: page,
      skip,
      limit: take,
    },
  };
};
