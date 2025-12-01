import { UserStatus } from "@prisma/client";
import { NextFunction, Request, Response } from "express";
import ApiError from "../../lib/ApiError";
import prisma from "../../lib/prisma";
import { sCode } from "../../utils";

export const userAccessVerifier = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    if (!req.decoded)
      return next(
        new ApiError(
          sCode.UNAUTHORIZED,
          "Unauthorized, probably token not found",
        ),
      );

    const user = await prisma.user.findUniqueOrThrow({
      where: { id: req.decoded.id },
    });

    if (!user) {
      return next(new ApiError(404, "User not found from user access"));
    }

    const { isDeleted, isVerified, status } = user;

    if (isDeleted) {
      return next(new ApiError(401, "User was deleted, contact to support"));
    }
    if (!isVerified) {
      return next(new ApiError(401, "User is not verified"));
    }
    if (status === UserStatus.BANNED) {
      return next(new ApiError(401, "User was banned"));
    }

    next();
  } catch (error) {
    next(error);
  }
};
