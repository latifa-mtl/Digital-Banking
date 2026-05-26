export interface LoginRequest {
  username: string;
  password: string;
}

export interface AuthResponse {
  accessToken: string;
  username: string;
  roles: string[];
}

export interface AppUser {
  id: number;
  userId: string;
  username: string;
  email: string;
  roles: AppRole[];
}

export interface AppRole {
  id: number;
  roleName: string;
}

export interface ChangePasswordRequest {
  oldPassword: string;
  newPassword: string;
  confirmPassword: string;
}
