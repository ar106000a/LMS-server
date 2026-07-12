import { Response, CookieOptions } from "express";

const IS_PRODUCTION = process.env.NODE_ENV === "production";

const COOKIE_NAMES = {
  ACCESS_TOKEN: "accessToken",
  REFRESH_TOKEN: "refreshToken",
};

const commonOptions: CookieOptions = {
  httpOnly: true,
  secure: IS_PRODUCTION, // true in production, false in development
  sameSite: "lax",
  path: "/",
};

const accessCookieOptions: CookieOptions = {
  ...commonOptions,
  maxAge: 15 * 60 * 1000, // 15 minutes
};

const refreshCookieOptions: CookieOptions = {
  ...commonOptions,
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
};

/**
 * Sets the access token cookie on the response object.
 */
export const setAccessCookie = (res: Response, token: string): void => {
  res.cookie(COOKIE_NAMES.ACCESS_TOKEN, token, accessCookieOptions);
};

/**
 * Sets the refresh token cookie on the response object.
 */
export const setRefreshCookie = (res: Response, token: string): void => {
  res.cookie(COOKIE_NAMES.REFRESH_TOKEN, token, refreshCookieOptions);
};

/**
 * Clears all authentication-related cookies.
 */
export const clearAuthCookies = (res: Response): void => {
  res.clearCookie(COOKIE_NAMES.ACCESS_TOKEN, commonOptions);
  res.clearCookie(COOKIE_NAMES.REFRESH_TOKEN, commonOptions);
};
