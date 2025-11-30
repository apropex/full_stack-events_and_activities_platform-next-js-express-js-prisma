import { CookieOptions, Response } from "express";
import { getDuration } from "../utils/time_unit";
import env, { isProd } from "./config/env";

export const COOKIE_NAMES = {
  ACCESS_TOKEN: "accessToken",
  REFRESH_TOKEN: "refreshToken",
} as const;

const defaultOptions: CookieOptions = {
  httpOnly: true,
  secure: isProd,
  sameSite: isProd ? ("none" as const) : ("lax" as const),
  path: "/",
};

// Define specific path for the Refresh Token for enhanced security (path scoping).
const REFRESH_TOKEN_PATH = "/api/v1/auth/refresh";

export const setCookie = {
  /**
   * Sets the Access Token cookie. It uses the default global path.
   * @param res - Express Response object.
   * @param token - The JWT access token string.
   * @param options - Optional custom cookie options to override defaults.
   */
  accessToken(res: Response, token: string, options?: CookieOptions) {
    const maxAge =
      options?.maxAge ?? getDuration(env.jwt.access_token_expire_time);

    res.cookie(COOKIE_NAMES.ACCESS_TOKEN, token, {
      ...defaultOptions,
      ...options,
      maxAge,
    });
  },

  /**
   * Sets the Refresh Token cookie. It uses a restricted path for security.
   * @param res - Express Response object.
   * @param token - The JWT refresh token string.
   * @param options - Optional custom cookie options to override defaults.
   */
  refreshToken(res: Response, token: string, options?: CookieOptions) {
    const maxAge =
      options?.maxAge ?? getDuration(env.jwt.refresh_token_expire_time);

    res.cookie(COOKIE_NAMES.REFRESH_TOKEN, token, {
      ...defaultOptions,
      path: REFRESH_TOKEN_PATH, // Enforce path restriction for security
      ...options,
      maxAge,
    });
  },

  /**
   * Sets both Access and Refresh tokens simultaneously.
   * @param res - Express Response object.
   * @param accessToken - The access token string.
   * @param refreshToken - The refresh token string.
   */
  allTokens(res: Response, accessToken: string, refreshToken: string) {
    this.accessToken(res, accessToken);
    this.refreshToken(res, refreshToken);
  },

  /**
   * Clears all authentication cookies.
   * Note: Options (especially path) must match the options used during setCookie.
   * @param res - Express Response object.
   */
  clearCookies(res: Response) {
    // Clear Access Token (uses default path "/")
    res.clearCookie(COOKIE_NAMES.ACCESS_TOKEN, { ...defaultOptions });

    // Clear Refresh Token (must use the restricted path REFRESH_TOKEN_PATH)
    res.clearCookie(COOKIE_NAMES.REFRESH_TOKEN, {
      ...defaultOptions,
      path: REFRESH_TOKEN_PATH,
    });
  },
};
