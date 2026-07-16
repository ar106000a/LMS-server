import { Router } from "express";
import { asyncHandler } from "../../../shared/middleware/asyncHandler";
import { authenticate } from "../../../shared/middleware/authenticate";
import { UserController } from "../controllers/user.controller";

const router = Router();
const userController = new UserController();

router.post(
  "/become-instructor",
  authenticate,
  asyncHandler(userController.becomeInstructor),
);

export default router;
