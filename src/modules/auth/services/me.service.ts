import { UserRepository } from "../repositories/user.repository";
import { NotFoundError } from "../../../utils/error";

interface UserProfileResponse {
  id: string;
  email: string;
  username: string;
  fullName: string;
  role: string;
  isVerified: boolean;
  createdAt: Date;
}

export class MeService {
  constructor(private userRepo = new UserRepository()) {}

  async execute(userId: string): Promise<UserProfileResponse> {
    const user = await this.userRepo.findById(userId);
    
    if (!user) {
      throw new NotFoundError("User");
    }

    // Strip passwordHash out completely before returning to keep it safe
    return {
      id: user.id,
      email: user.email,
      username: user.username,
      fullName: user.fullName,
      role: user.role,
      isVerified: user.isVerified,
      createdAt: user.createdAt,
    };
  }
}