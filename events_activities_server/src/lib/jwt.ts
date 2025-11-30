import { User, UserAvatar } from "@prisma/client";
import * as jwt from "jsonwebtoken";
import { sCode } from "../utils";
import ApiError from "./ApiError";
import env from "./config/env";

export type iJwtPayloadMaker = Partial<
  Partial<User> & {
    avatar: UserAvatar;
  }
>;

const payloadMaker = (user: iJwtPayloadMaker) => {
  const payload = {} as Partial<User> & {
    avatar: string;
  };

  if (user.id) payload.id = user.id;
  if (user.name) payload.name = user.name;
  if (user.email) payload.email = user.email;
  if (user.phone) payload.phone = user.phone;
  if (user.gender) payload.gender = user.gender;
  if (user.role) payload.role = user.role;
  if (user.avatar) payload.avatar = user.avatar.url;
  if (user.status) payload.status = user.status;
  if ("isVerified" in user) payload.isVerified = user.isVerified;
  if ("isDeleted" in user) payload.isDeleted = user.isDeleted;
  if ("isPremium" in user) payload.isPremium = user.isPremium;

  return payload;
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
