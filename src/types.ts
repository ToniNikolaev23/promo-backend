export type AuthTokenPayload = {
  sub: string;
  email: string;
  jti: string;
  iat?: number;
  exp?: number;
};
