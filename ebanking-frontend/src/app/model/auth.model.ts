export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  username: string;
  roles: string;
}

export interface UserProfile {
  username: string;
  roles: string[];
}