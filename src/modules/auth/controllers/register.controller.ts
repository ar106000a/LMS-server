import { Request, Response } from "express";
import { RegisterService } from "../services/register.service";
import { ConflictError, DatabaseError } from "../../../../src/utils/error";
import { successResponse } from "../../../utils/response";

export class RegisterController {
  private registerService: RegisterService;

  constructor() {
    this.registerService = new RegisterService();
  }

  public register = async (req: Request, res: Response) => {
    try {
      const response = await this.registerService.register(req.body);
      return successResponse(res, response, 200); // Return 200 OK with generic success message
    } catch (error) {
      if (error instanceof ConflictError) {
        return res.status(error.statusCode).json({ message: error.message });
      } else if (error instanceof DatabaseError) {
        return res.status(error.statusCode).json({ message: error.message });
      } else {
        // Catch any unexpected errors
        console.error("Unexpected error during registration:", error);
        return res.status(500).json({ message: "Internal server error" });
      }
    }
  };
}
