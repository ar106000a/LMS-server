import { CertificateRepository } from "../repositories/certificate.repository";
import { NotFoundError } from "../../../utils/error";

interface PublicVerificationPayload {
  valid: boolean;
  certificateId: string;
  studentName: string;
  courseTitle: string;
  issuedAt: Date;
}

export class VerifyCertificateService {
  constructor(private certificateRepo = new CertificateRepository()) {}

  async execute(certificateId: string): Promise<PublicVerificationPayload> {
    // 1. Locate Target Certificate Record with loaded entity relations
    const certificate =
      await this.certificateRepo.findByIdWithRelations(certificateId);
    if (!certificate) {
      throw new NotFoundError("Certificate");
    }

    // 2. Format a sanitized student full name string cleanly
    const studentName = `${certificate.user.fullName}`.trim();

    // 3. Map strictly into the verification-safe payload layout
    return {
      valid: true,
      certificateId: certificate.id,
      studentName,
      courseTitle: certificate.course.title,
      issuedAt: certificate.issuedAt,
    };
  }
}
