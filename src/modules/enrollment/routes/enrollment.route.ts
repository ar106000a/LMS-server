import { Router } from "express";
import { EnrollCourseController } from "../controllers/enroll-course.controller";
import { GetMyEnrollmentsController } from "../controllers/get-my-enrollments.controller";
import { CheckEnrollmentController } from "../controllers/check-enrollment.controller";
import { CompleteEnrollmentController } from "../controllers/complete-enrollment.controller";
import { SuspendEnrollmentController } from "../controllers/suspend-enrollment.controller";

import { authenticate } from "../../../shared/middleware/authenticate";
import { authorize } from "../../../shared/middleware/authorize";
import { validate } from "../../../shared/middleware/validate";

import { enrollCourseSchema } from "../schemas/enroll-course.schema";
import { getMyEnrollmentsSchema } from "../schemas/get-my-enrollments.schema";
import { checkEnrollmentSchema } from "../schemas/check-enrollment.schema";
import { completeEnrollmentSchema } from "../schemas/complete-enrollment.schema";
import { suspendEnrollmentSchema } from "../schemas/suspend-enrollment.schema";

const router = Router();
const enrollCourseController = new EnrollCourseController();
const getMyEnrollmentsController = new GetMyEnrollmentsController();
const checkEnrollmentController = new CheckEnrollmentController();
const completeEnrollmentController = new CompleteEnrollmentController();
const suspendEnrollmentController = new SuspendEnrollmentController();

// --- Student Lifecycle Vectors ---
router.post(
  "/courses/:courseId/enroll",
  authenticate as any,
  authorize("STUDENT", "INSTRUCTOR", "ADMIN") as any,
  validate(enrollCourseSchema),
  enrollCourseController.handle,
);
router.get(
  "/me/enrollments",
  authenticate as any,
  validate(getMyEnrollmentsSchema),
  getMyEnrollmentsController.handle,
);
router.get(
  "/courses/:courseId/enrollment",
  authenticate as any,
  validate(checkEnrollmentSchema),
  checkEnrollmentController.handle,
);
router.patch(
  "/enrollments/:enrollmentId/complete",
  authenticate as any,
  validate(completeEnrollmentSchema),
  completeEnrollmentController.handle,
);

// --- Administrative Override Control Vectors ---
router.patch(
  "/enrollments/:enrollmentId/suspend",
  authenticate as any,
  authorize("ADMIN") as any, // Business Rule: Access explicitly locked down to global administrators
  validate(suspendEnrollmentSchema),
  suspendEnrollmentController.handle,
);

export default router;
