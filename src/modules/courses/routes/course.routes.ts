import { Router } from "express";
import { CreateCourseController } from "../controllers/create-course.controller";
import { authenticate } from "../../../shared/middleware/authenticate";
import { authorize } from "../../../shared/middleware/authorize";
import { validate } from "../../../shared/middleware/validate";
import { createCourseSchema } from "../schemas/create-course.schema";
import { getCoursesSchema } from "../schemas/get-courses.schema";
import { GetCoursesController } from "../controllers/get-courses.controller";
import { getCourseBySlugSchema } from "../schemas/get-course-by-slug";
import { authenticateOptional } from "../../../shared/middleware/authenticateOptional";
import { GetCourseBySlugController } from "../controllers/get-course-by-slug.controller";
import { UpdateCourseController } from "../controllers/update-course.controller";
import { updateCourseSchema } from "../schemas/update-course.schema";
import { PublishCourseController } from "../controllers/publish-course.controller";
import { publishCourseSchema } from "../schemas/publish-course.schema";
import { UnpublishCourseController } from "../controllers/unpublish-course.controller";
import { unpublishCourseSchema } from "../schemas/unpublish-course.schema";
import { ArchiveCourseController } from "../controllers/archive-course.controller";
import { archiveCourseSchema } from "../schemas/archive-course.schema";
import { DeleteCourseController } from "../controllers/delete-course.controller";
import { deleteCourseSchema } from "../schemas/delete-course.schema";

const router = Router();
const createCourseController = new CreateCourseController();
const getCoursesController = new GetCoursesController();
const getCourseBySlugController = new GetCourseBySlugController();
const updateCourseController = new UpdateCourseController();
const publishCourseController = new PublishCourseController();
const unpublishCourseController = new UnpublishCourseController();
const archiveCourseController = new ArchiveCourseController();
const deleteCourseController = new DeleteCourseController();

router.post(
  "/courses",
  authenticate as any,
  authorize("INSTRUCTOR", "ADMIN") as any,
  validate(createCourseSchema),
  createCourseController.handle,
);
router.get("/courses", validate(getCoursesSchema), getCoursesController.handle);
router.get(
  "/courses/:slug",
  authenticateOptional as any,
  validate(getCourseBySlugSchema),
  getCourseBySlugController.handle,
);
router.patch(
  "/courses/:courseId",
  authenticate as any,
  authorize("INSTRUCTOR", "ADMIN") as any,
  validate(updateCourseSchema),
  updateCourseController.handle,
);

router.patch(
  "/courses/:courseId/publish",
  authenticate as any,
  authorize("INSTRUCTOR", "ADMIN") as any,
  validate(publishCourseSchema),
  publishCourseController.handle,
);
router.patch(
  "/courses/:courseId/unpublish",
  authenticate as any,
  authorize("INSTRUCTOR", "ADMIN") as any,
  validate(unpublishCourseSchema),
  unpublishCourseController.handle,
);
router.patch(
  "/courses/:courseId/archive",
  authenticate as any,
  authorize("INSTRUCTOR", "ADMIN") as any,
  validate(archiveCourseSchema),
  archiveCourseController.handle,
);
router.delete(
  "/courses/:courseId",
  authenticate as any,
  authorize("INSTRUCTOR", "ADMIN") as any,
  validate(deleteCourseSchema),
  deleteCourseController.handle,
);

export default router;
