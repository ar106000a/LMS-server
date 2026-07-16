import { Response, NextFunction } from "express";

import { env } from "../../../config/env";
import prisma from "../../../config/prisma";
import { generateAccessToken } from "../../../shared/auth/jwt";
import { AuthenticatedRequest } from "../../../shared/middleware/authenticate";
import { AppError } from "../../../utils/error";

export class UserController {
  becomeInstructor = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const userId = req.user?.userId;

      if (!userId) {
        throw new AppError("Authentication required. Please log in.", 401);
      }

      const existingUser = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          email: true,
          username: true,
          fullName: true,
          role: true,
        },
      });

      if (!existingUser) {
        throw new AppError("User not found.", 404);
      }

      // Early return if they are already an instructor
      if (existingUser.role === "INSTRUCTOR") {
        const accessToken = generateAccessToken({
          userId: existingUser.id,
          role: existingUser.role,
        });

        res.cookie("accessToken", accessToken, {
          httpOnly: true,
          secure: env.NODE_ENV === "production",
          sameSite: env.NODE_ENV === "production" ? "strict" : "lax",
          maxAge: 15 * 60 * 1000,
        });

        res.status(200).json({
          success: true,
          message: "You are already an instructor.",
          data: {
            user: existingUser,
            accessToken,
          },
        });
        return;
      }

      // TRANSACTION: Update the user's role AND ensure the instructor profile exists safely
      const [updatedUser, _instructorProfile] = await prisma.$transaction([
        prisma.user.update({
          where: { id: userId },
          data: { role: "INSTRUCTOR" },
          select: {
            id: true,
            email: true,
            username: true,
            fullName: true,
            role: true,
          },
        }),
        prisma.instructorProfile.upsert({
          where: { userId: userId },
          update: {}, // If it already exists, do nothing
          create: { userId: userId }, // If it doesn't exist, create it
        }),
      ]);

      const refreshedAccessToken = generateAccessToken({
        userId: updatedUser.id,
        role: updatedUser.role,
      });

      res.cookie("accessToken", refreshedAccessToken, {
        httpOnly: true,
        secure: env.NODE_ENV === "production",
        sameSite: env.NODE_ENV === "production" ? "strict" : "lax",
        maxAge: 15 * 60 * 1000,
      });

      res.status(200).json({
        success: true,
        message: "Welcome to the instructor team!",
        data: {
          user: updatedUser,
          accessToken: refreshedAccessToken,
        },
      });
    } catch (error) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json({
          success: false,
          message: error.message,
        });
        return;
      }

      next(error);
    }
  };
}