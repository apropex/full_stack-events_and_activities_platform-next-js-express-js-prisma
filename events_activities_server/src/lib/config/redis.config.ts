import { sCode } from "../../utils";
import { OTP } from "../../utils/generateOtp";
import ApiError from "../ApiError";
import { redisClient } from "../redis";
import env from "./env";

const getOtpKey = (email: string) => `otp:${email}`;
const getOtpCountKey = (email: string) => `otp-req-count:${email}`;

const OTP_REQUEST_LIMIT = 5;
const OTP_REQUEST_WINDOW = 10 * 60; // 10 minutes

export const canRequestOtp = async (email: string) => {
  const key = getOtpCountKey(email);
  const currentCount = Number(await redisClient.get(key));

  // If first request, initialize with expiry
  if (!currentCount) {
    await redisClient.set(key, 1, {
      expiration: {
        type: "EX",
        value: OTP_REQUEST_WINDOW,
      },
    });
    return {
      allowed: true,
      remaining: OTP_REQUEST_LIMIT - 1,
      resetIn: OTP_REQUEST_WINDOW,
    };
  }

  const ttl = await redisClient.ttl(key);

  // If already passed the limit
  if (currentCount >= OTP_REQUEST_LIMIT) {
    return {
      allowed: false,
      remaining: 0,
      resetIn: ttl,
    };
  }

  // Increase count
  await redisClient.incr(key);
  return {
    allowed: true,
    remaining: OTP_REQUEST_LIMIT - (currentCount + 1),
    resetIn: ttl,
  };
};

export const setOtp = async (
  email: string,
  expirySeconds: number = env.redis.otp_expiration,
) => {
  if (!email) throw new ApiError(sCode.BAD_REQUEST, "Email is required");

  const limitInfo = await canRequestOtp(email);
  if (!limitInfo.allowed) {
    throw new ApiError(
      sCode.TOO_MANY_REQUESTS,
      `OTP limit exceeded. Try again in ${limitInfo.resetIn} seconds`,
    );
  }

  const redisKey = getOtpKey(email);
  const otp = OTP();

  await redisClient.set(redisKey, otp, {
    expiration: {
      type: "EX",
      value: expirySeconds,
    },
  });

  return { otp, ...limitInfo };
};

export const verifyOtp = async (
  email: string,
  otp: string,
): Promise<{ success: boolean }> => {
  if (!email) throw new ApiError(sCode.BAD_REQUEST, "Email is required");
  if (!otp) throw new ApiError(sCode.BAD_REQUEST, "OTP is required");

  const redisKey = getOtpKey(email);
  const savedOtp = await redisClient.get(redisKey);

  if (!savedOtp)
    throw new ApiError(sCode.BAD_REQUEST, "OTP has expired or not found");

  if (savedOtp !== otp) throw new ApiError(sCode.UNAUTHORIZED, "Invalid OTP");

  await redisClient.del([redisKey]);

  return { success: true };
};
