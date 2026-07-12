export interface ForgotPasswordDto {
  email: string;
}

export interface VerifyResetDto {
  email: string;
  otp: string;
}

export interface ResetPasswordDto {
  resetJWT: string;
  password: string;
}
