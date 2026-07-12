import { Certificate } from "../../../../generated/prisma/client";
import { CertificateRepository } from "../repositories/certificate.repository";
import { NotFoundError, ForbiddenError } from "../../../utils/error";

export class GetCertificateService {
  constructor(private certificateRepo = new CertificateRepository()) {}

  async execute(
    certificateId: string,
    authUserId: string,
    authUserRole: string,
  ): Promise<Certificate> {
    // 1. Locate Target Certificate Record
    const certificate = await this.certificateRepo.findById(certificateId);
    if (!certificate) {
      throw new NotFoundError("Certificate");
    }

    // 2. Business Rule Verification: Multi-Tenant Role Boundary Guard
    // If the caller isn't an ADMIN, they must be the explicit owner of this certificate asset
    if (authUserRole !== "ADMIN" && certificate.userId !== authUserId) {
      throw new ForbiddenError(
        "Access denied. You lack permissions to inspect another user's credential records.",
      );
    }

    return certificate;
  }
}
