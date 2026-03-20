export type UserRow = {
  id: string;
  email: string;
  password_hash: string;
  created_at: string;
};

export type JwtTokenRow = {
  id: string;
  user_id: string;
  jti: string;
  expires_at: string;
  created_at: string;
};

export type AuthTokenPayload = {
  sub: string;
  email: string;
  jti: string;
  iat?: number;
  exp?: number;
};
