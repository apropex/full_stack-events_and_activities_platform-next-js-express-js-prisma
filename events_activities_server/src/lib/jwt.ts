import { User } from "@prisma/client";
import * as jwt from "jsonwebtoken";
import { sCode } from "../utils";
import ApiError from "./ApiError";
import env from "./config/env";

const payloadMaker = (user: Partial<User>) => {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    gender: user.gender,
    role: user.role,
    avatar: user.avatar,
    status: user.status,
    isVerified: user.isVerified,
    isDeleted: user.isDeleted,
    isPremium: user.isPremium,
  };
};

//* GENERATE ACCESS TOKEN
export const generateAccessToken = (
  userPayload: Partial<User>,
  { secretKey, period }: { secretKey?: string; period?: string } = {},
) => {
  //

  const payload = payloadMaker(userPayload);
  const secret = secretKey || env.jwt.access_token_secret;
  const options = {
    expiresIn: period || env.jwt.access_token_expire_time,
  } as jwt.SignOptions;

  const access_token = jwt.sign(payload, secret, options);

  if (!access_token)
    throw new ApiError(
      sCode.EXPECTATION_FAILED,
      "Failed to generate access token",
    );

  return access_token;
};

//* GENERATE REFRESH TOKEN
export const generateRefreshToken = (
  userPayload: Partial<User>,
  { secretKey, period }: { secretKey?: string; period?: string } = {},
) => {
  //

  const payload = payloadMaker(userPayload);
  const secret = secretKey || env.jwt.refresh_token_secret;
  const options = {
    expiresIn: period || env.jwt.refresh_token_expire_time,
  } as jwt.SignOptions;

  const refresh_token = jwt.sign(payload, secret, options);

  if (!refresh_token)
    throw new ApiError(
      sCode.EXPECTATION_FAILED,
      "Failed to generate refresh token",
    );

  return refresh_token;
};

//* VERIFY ACCESS TOKEN
export const verifyAccessToken = (token: string): jwt.JwtPayload => {
  const accessToken = jwt.verify(
    token,
    env.jwt.access_token_secret,
  ) as jwt.JwtPayload;
  if (!accessToken)
    throw new ApiError(sCode.UNAUTHORIZED, "Token is not valid");
  return accessToken;
};

//* VERIFY REFRESH TOKEN
export const verifyRefreshToken = (token: string): jwt.JwtPayload => {
  const refreshToken = jwt.verify(
    token,
    env.jwt.refresh_token_secret,
  ) as jwt.JwtPayload;
  if (!refreshToken)
    throw new ApiError(sCode.UNAUTHORIZED, "Token is not valid");
  return refreshToken;
};
