export class CreateUserDto {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  profilePictureUrl?: string;
  googleId?: string;
  isEmailVerified?: boolean;
}
