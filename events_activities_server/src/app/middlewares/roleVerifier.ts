import { NextFunction, Request, Response } from "express";
import { JwtPayload } from "jsonwebtoken";
import ApiError from "../../lib/ApiError";
import { verifyAccessToken } from "../../lib/jwt";
import { sCode } from "../../utils";

export const roleVerifier =
  (...roles: string[]) =>
  (req: Request, res: Response, next: NextFunction) => {
    const token = req.cookies.accessToken;

    try {
      if (!token)
        return next(new ApiError(sCode.FORBIDDEN, "Token did not arrive"));
      const decoded = verifyAccessToken(token);

      if (!roles.includes(decoded.role))
        return next(new ApiError(sCode.FORBIDDEN, "Forbidden User Role"));

      req.decoded = decoded as JwtPayload;
      next();
    } catch {
      next(new ApiError(sCode.UNAUTHORIZED, "Invalid token"));
    }
  };
