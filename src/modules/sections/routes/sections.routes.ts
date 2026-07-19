import { Router } from "express";
import { CreateSectionController } from "../controllers/create-section.controller";
import { GetSectionsController } from "../controllers/get-sections.controller";
import { UpdateSectionController } from "../controllers/update-section.controller";
import { DeleteSectionController } from "../controllers/delete-section.controller";
import { ReorderSectionsController } from "../controllers/reorder-sections.controller";

import { authenticate } from "../../../shared/middleware/authenticate";
import { authenticateOptional } from "../../../shared/middleware/authenticateOptional";
import { authorize } from "../../../shared/middleware/authorize";
import { validate } from "../../../shared/middleware/validate";

import { createSectionSchema } from "../schemas/create-section.schema";
import { getSectionsSchema } from "../schemas/get-sections.schema";
import { updateSectionSchema } from "../schemas/update-section.schema";
import { deleteSectionSchema } from "../schemas/delete-section.schema";
import { reorderSectionsSchema } from "../schemas/reorder-sections.schema";

const router = Router();
const createSectionController = new CreateSectionController();
const getSectionsController = new GetSectionsController();
const updateSectionController = new UpdateSectionController();
const deleteSectionController = new DeleteSectionController();
const reorderSectionsController = new ReorderSectionsController();

// Create Section
router.post(
  "/courses/:courseId/sections",
  authenticate as any,
  authorize("INSTRUCTOR", "ADMIN") as any,
  validate(createSectionSchema),
  createSectionController.handle,
);

// Get Sections
router.get(
  "/courses/:courseId/sections",
  authenticateOptional as any,
  validate(getSectionsSchema),
  getSectionsController.handle,
);



// Delete Section
router.delete(
  "/sections/:sectionId",
  authenticate as any,
  authorize("INSTRUCTOR", "ADMIN") as any,
  validate(deleteSectionSchema),
  deleteSectionController.handle,
);

// Reorder Sections (Atomically re-sequence curriculum sort placement)
router.patch(
  "/sections/reorder",
  authenticate as any,
  authorize("INSTRUCTOR", "ADMIN") as any,
  validate(reorderSectionsSchema),
  reorderSectionsController.handle,
);

// Update Section Title
router.patch(
  "/sections/:sectionId",
  authenticate as any,
  authorize("INSTRUCTOR", "ADMIN") as any,
  validate(updateSectionSchema),
  updateSectionController.handle,
);

export default router;
