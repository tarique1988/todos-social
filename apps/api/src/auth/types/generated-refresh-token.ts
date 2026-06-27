export interface GeneratedRefreshToken {
  token: string;
  jti: string;
  hash: string;
  expiresAt: Date;
  maxAge: number;
}
