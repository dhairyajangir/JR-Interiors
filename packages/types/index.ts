export type UserRole = "SUPER_ADMIN" | "ADMIN" | "SELLER";

export interface User {
  id: string;
  email: string;
  supabaseId: string | null;
  fullName: string;
  phone: string | null;
  role: UserRole;
  isAdmin: boolean;
  sellerId: string | null;
  brandName: string | null;
  permissions: string[]; // Granular permissions mapped from the matrix
}

export interface Session {
  accessToken: string;
  refreshToken: string;
  expiresAt: number; // timestamp in seconds
  user: User;
}

export interface AuthState {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  error: string | null;
}
