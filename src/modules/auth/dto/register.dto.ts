export interface RegisterUserDto {
  email: string;
  username: string;
  fullName: string;
  password: string;
}

export interface RegisterResponseDto {
  message: string;
}
