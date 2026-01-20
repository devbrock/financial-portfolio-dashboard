export type AuthUser = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
};

export type AuthState = {
  user: AuthUser | null;
  sessionId: string | null;
};
