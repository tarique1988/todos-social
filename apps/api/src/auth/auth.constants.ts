// auth.constants.ts

import { CookieOptions } from 'express';

export const REFRESH_COOKIE_NAME = 'refresh_token';

export const REFRESH_COOKIE_OPTIONS: CookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',
  path: '/auth',
};
