import { Response, NextFunction } from "express";
import { AuthenticatedRequest } from "../../../shared/middleware/authenticate";
import { MeService } from "../services/me.service";

export class MeController {
  constructor(private meService = new MeService()) {}

  handle = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const userId = req.user!.userId; // Assured via authentication middleware
      const profile = await this.meService.execute(userId);

      res.status(200).json({
        success: true,
        data: { user: profile },
      });
    } catch (error) {
      next(error);
    }
  };
}
