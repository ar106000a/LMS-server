import { Router } from "express";
import { GenerateCertificateController } from "../controllers/generate-certificate.controller";
import { GetMyCertificatesController } from "../controllers/get-my-certificates.controller";
import { GetCertificateController } from "../controllers/get-certificate.controller";
import { VerifyCertificateController } from "../controllers/verify-certificate.controller";

import { authenticate } from "../../../shared/middleware/authenticate";
import { authorize } from "../../../shared/middleware/authorize";
import { validate } from "../../../shared/middleware/validate";

import { generateCertificateSchema } from "../schemas/generate-certificate.schema";
import { getMyCertificatesSchema } from "../schemas/get-my-certificates.schema";
import { getCertificateSchema } from "../schemas/get-certificate.schema";
import { verifyCertificateSchema } from "../schemas/verify-certificate.schema";

const router = Router();
const generateCertificateController = new GenerateCertificateController();
const getMyCertificatesController = new GetMyCertificatesController();
const getCertificateController = new GetCertificateController();
const verifyCertificateController = new VerifyCertificateController();

// --- Public Gateways (Place above or separate from restrictive check pipelines) ---
router.get(
  "/certificates/verify/:certificateId",
  validate(verifyCertificateSchema), // Business Rule: Public verification bypasses authenticate/authorize middleware completely
  verifyCertificateController.handle,
);

// --- Authenticated Portfolio Metrics ---
router.get(
  "/me/certificates",
  authenticate as any,
  authorize("STUDENT") as any,
  validate(getMyCertificatesSchema),
  getMyCertificatesController.handle,
);

// --- Secure Specific Record Inspector ---
router.get(
  "/certificates/:certificateId",
  authenticate as any,
  validate(getCertificateSchema),
  getCertificateController.handle,
);

// --- Credential Creation Mutator ---
router.post(
  "/courses/:courseId/certificate",
  authenticate as any,
  authorize("STUDENT") as any,
  validate(generateCertificateSchema),
  generateCertificateController.handle,
);

export default router;
