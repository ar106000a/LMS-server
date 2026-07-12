import { Router } from "express";
import { RegisterController } from "../controllers/register.controller";
import { validate } from "../../../shared/middleware/validate";
import { registerSchema } from "../schemas/register.schema";
import { asyncHandler } from "../../../shared/middleware/asyncHandler";
import { VerifyEmailController } from "../controllers/verify-email.controller";
import { verifyEmailSchema } from "../schemas/verify-email.schema";
import { LoginController } from "../controllers/login.controller";
import { loginSchema } from "../schemas/login.schema";
import { RefreshController } from "../controllers/refresh.controller";
import { LogoutAllController } from "../controllers/logout-all.controller";
import { LogoutController } from "../controllers/logout.controller";
import { authenticate } from "../../../shared/middleware/authenticate";
import {
  forgotPasswordSchema,
  resetPasswordSchema,
  verifyResetSchema,
} from "../schemas/password-reset.schema";
import { PasswordResetController } from "../controllers/password-reset.controller";
import { MeController } from "../controllers/me.controller";
import { ChangePasswordController } from "../controllers/change-password.controller";
import { changePasswordSchema } from "../schemas/change-password.schema";

const router = Router();
const registerController = new RegisterController();
const verifyEmailController = new VerifyEmailController();
const loginController = new LoginController();
const refreshController = new RefreshController();
const logoutController = new LogoutController();
const logoutAllController = new LogoutAllController();
const passwordResetController = new PasswordResetController();
const meController = new MeController();
const changePasswordController = new ChangePasswordController();

router.post(
  "/register",
  validate(registerSchema),
  asyncHandler(registerController.register),
);
router.post(
  "/verify-email",
  validate(verifyEmailSchema),
  asyncHandler(verifyEmailController.handle),
);
router.post(
  "/login",
  validate(loginSchema),
  asyncHandler(loginController.handle),
);
router.post("/refresh", asyncHandler(refreshController.handle));

router.post("/logout", asyncHandler(logoutController.handle));
router.post(
  "/logout-all",
  authenticate,
  asyncHandler(logoutAllController.handle),
);
router.post(
  "/forgot-password",
  validate(forgotPasswordSchema),
  passwordResetController.forgotPassword,
);

router.post(
  "/verify-reset",
  validate(verifyResetSchema),
  passwordResetController.verifyReset,
);

router.post(
  "/reset-password",
  validate(resetPasswordSchema),
  passwordResetController.resetPassword,
);
router.get("/me", authenticate, asyncHandler(meController.handle));
router.patch(
  "/change-password",
  authenticate,
  validate(changePasswordSchema),
  asyncHandler(changePasswordController.handle),
);

export default router;
