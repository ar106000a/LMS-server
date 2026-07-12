import { Request, Response, NextFunction } from "express";

import prisma from "../../../config/prisma";
import { generateAccessToken } from "../../../shared/auth/jwt";

export class LoginController {
  becomeInstructor = async (req: Request, res: Response, next:NextFunction) => {
    try {
      // Assuming your auth middleware populates req.user
      const userId = req.user?.id;

      if (!userId) {
        return res
          .status(401)
          .json({ success: false, message: "Unauthorized" });
      }

      // 1. Update the role in the database
      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: { role: "INSTRUCTOR" },
        select: { id: true, email: true, name: true, role: true },
      });

      // 2. CRITICAL: Generate a fresh token containing the new role
      const newToken = generateAccessToken({
        userId: updatedUser.id,
        role: updatedUser.role,
        email: updatedUser.email,
      });

      return res.json({
        success: true,
        message: "Welcome to the instructor team!",
        data: {
          user: updatedUser,
          token: newToken, // Send this back so the frontend can replace the old token
        },
      });
    } catch (error) {
      return res
        .status(500)
        .json({ success: false, message: "Internal server error" });
    }
  };
}
