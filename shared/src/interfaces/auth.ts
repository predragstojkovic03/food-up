// Shared interfaces for Auth DTOs

export interface ILogin {
  email: string;
  password: string;
}

export interface IAuthResponse {
  access_token: string;
}

export interface IMeResponse {
  id: string;
  type: string;
  role?: string;
}
