import { Router } from "express";
import { UploadVideoController } from "../controllers/upload-video.controller";
import { GetVideoController } from "../controllers/get-video.controller";
import { UpdateVideoController } from "../controllers/update-video.controller";
import { DeleteVideoController } from "../controllers/delete-video.controller";
import { UpdateArticleController } from "../controllers/update-article.controller";
import { GetArticleController } from "../controllers/get-article.controller";

import { authenticate } from "../../../shared/middleware/authenticate";
import { authenticateOptional } from "../../../shared/middleware/authenticateOptional";
import { authorize } from "../../../shared/middleware/authorize";
import { validate } from "../../../shared/middleware/validate";
import { upload } from "../../../shared/middleware/upload.middleware";

import { uploadVideoSchema } from "../schemas/upload-video.schema";
import { getVideoSchema } from "../schemas/get-video.schema";
import { updateVideoSchema } from "../schemas/update-video.schema";
import { deleteVideoSchema } from "../schemas/delete-video.schema";
import { updateArticleSchema } from "../schemas/update-article.schema";
import { getArticleSchema } from "../schemas/get-article.schema";

const router = Router();
const uploadVideoController = new UploadVideoController();
const getVideoController = new GetVideoController();
const updateVideoController = new UpdateVideoController();
const deleteVideoController = new DeleteVideoController();
const updateArticleController = new UpdateArticleController();
const getArticleController = new GetArticleController();

// Video Routing Tracks
router.post(
  "/lessons/:lessonId/video",
  authenticate as any,
  authorize("INSTRUCTOR", "ADMIN") as any,
  upload.single("video"),
  validate(uploadVideoSchema),
  uploadVideoController.handle,
);
router.get(
  "/lessons/:lessonId/video",
  authenticateOptional as any,
  validate(getVideoSchema),
  getVideoController.handle,
);
router.patch(
  "/lessons/:lessonId/video",
  authenticate as any,
  authorize("INSTRUCTOR", "ADMIN") as any,
  upload.single("video"),
  validate(updateVideoSchema),
  updateVideoController.handle,
);
router.delete(
  "/lessons/:lessonId/video",
  authenticate as any,
  authorize("INSTRUCTOR", "ADMIN") as any,
  validate(deleteVideoSchema),
  deleteVideoController.handle,
);

// Article Routing Tracks
router.patch(
  "/lessons/:lessonId/article",
  authenticate as any,
  authorize("INSTRUCTOR", "ADMIN") as any,
  validate(updateArticleSchema),
  updateArticleController.handle,
);
router.get(
  "/lessons/:lessonId/article",
  authenticateOptional as any, // Open for potential public preview reads
  validate(getArticleSchema),
  getArticleController.handle,
);

export default router;
