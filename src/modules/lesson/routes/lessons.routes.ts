import { Router } from "express";
import { CreateLessonController } from "../controllers/create-lesson.controller";
import { GetLessonsController } from "../controllers/get-lessons.controller";
import { UpdateLessonController } from "../controllers/update-lesson.controller";
import { DeleteLessonController } from "../controllers/delete-lesson.controller";
import { ReorderLessonsController } from "../controllers/reorder-lessons.controller";

import { authenticate } from "../../../shared/middleware/authenticate";
import { authenticateOptional } from "../../../shared/middleware/authenticateOptional";
import { authorize } from "../../../shared/middleware/authorize";
import { validate } from "../../../shared/middleware/validate";

import { createLessonSchema } from "../schemas/create-lesson.schema";
import { getLessonsSchema } from "../schemas/get-lessons.schema";
import { updateLessonSchema } from "../schemas/update-lesson.schema";
import { deleteLessonSchema } from "../schemas/delete-lesson.schema";
import { reorderLessonsSchema } from "../schemas/reorder-lessons.schema";

const router = Router();
const createLessonController = new CreateLessonController();
const getLessonsController = new GetLessonsController();
const updateLessonController = new UpdateLessonController();
const deleteLessonController = new DeleteLessonController();
const reorderLessonsController = new ReorderLessonsController();

// Create Lesson
router.post(
  "/sections/:sectionId/lessons",
  authenticate as any,
  authorize("INSTRUCTOR", "ADMIN") as any,
  validate(createLessonSchema),
  createLessonController.handle,
);

// Get Lessons
router.get(
  "/sections/:sectionId/lessons",
  authenticateOptional as any,
  validate(getLessonsSchema),
  getLessonsController.handle,
);

// Update Lesson
router.patch(
  "/lessons/:lessonId",
  authenticate as any,
  authorize("INSTRUCTOR", "ADMIN") as any,
  validate(updateLessonSchema),
  updateLessonController.handle,
);

// Delete Lesson
router.delete(
  "/lessons/:lessonId",
  authenticate as any,
  authorize("INSTRUCTOR", "ADMIN") as any,
  validate(deleteLessonSchema),
  deleteLessonController.handle,
);

// Reorder Lessons
router.patch(
  "/lessons/reorder",
  authenticate as any,
  authorize("INSTRUCTOR", "ADMIN") as any,
  validate(reorderLessonsSchema),
  reorderLessonsController.handle,
);

export default router;
