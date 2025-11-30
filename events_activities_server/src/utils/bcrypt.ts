import { compare, genSalt, hash } from "bcryptjs";
import httpStatus from "http-status";
import ApiError from "../lib/ApiError";
import env from "../lib/config/env";


//

export async function buildHash(password: string): Promise<string> {
  const salt = await genSalt(env.bcrypt_salt);
  return await hash(password, salt);
}

export async function compareHash(
  password: string,
  hash: string,
  message = "Invalid credentials",
): Promise<boolean> {
  const isValidate = await compare(password, hash);
  if (!isValidate) throw new ApiError(httpStatus.BAD_REQUEST, message);
  return isValidate;
}
