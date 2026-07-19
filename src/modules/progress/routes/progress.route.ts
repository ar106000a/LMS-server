import { Router } from "express";
import { CompleteLessonController } from "../controllers/complete-lesson.controller";
import { GetCourseProgressController } from "../controllers/get-course-progress.controller";
import { GetLessonProgressController } from "../controllers/get-lesson-progress.controller";

import { authenticate } from "../../../shared/middleware/authenticate";
import { authorize } from "../../../shared/middleware/authorize";
import { validate } from "../../../shared/middleware/validate";

import { completeLessonSchema } from "../schemas/complete-lesson.schema";
import { getCourseProgressSchema } from "../schemas/get-course-progress.schema";
import { getLessonProgressSchema } from "../schemas/get-lesson-progress.schema";

const router = Router();
const completeLessonController = new CompleteLessonController();
const getCourseProgressController = new GetCourseProgressController();
const getLessonProgressController = new GetLessonProgressController();

// --- Progress Mutation Gateways ---
router.post(
  "/lessons/:lessonId/complete",
  authenticate as any,
  authorize("STUDENT", "INSTRUCTOR", "ADMIN") as any,
  validate(completeLessonSchema),
  completeLessonController.handle,
);

// --- Macro Course Metrics Dashboard Vectors ---
router.get(
  "/courses/:courseId/progress",
  authenticate as any,
  authorize("STUDENT", "INSTRUCTOR", "ADMIN") as any,
  validate(getCourseProgressSchema),
  getCourseProgressController.handle,
);

// --- Atomic Individual Lesson Context Vectors ---
router.get(
  "/lessons/:lessonId/progress",
  authenticate as any,
  authorize("STUDENT", "INSTRUCTOR", "ADMIN") as any, // Business Rule: Protect lesson player data states from malicious non-enrolled calls
  validate(getLessonProgressSchema),
  getLessonProgressController.handle,
);

export default router;
