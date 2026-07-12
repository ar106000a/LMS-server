import { Certificate } from "../../../../generated/prisma/client";
import { CertificateRepository } from "../repositories/certificate.repository";

interface PaginatedCertificatesResult {
  certificates: Certificate[];
  pagination: {
    totalItems: number;
    totalPages: number;
    page: number;
    limit: number;
  };
}

export class GetMyCertificatesService {
  constructor(private certificateRepo = new CertificateRepository()) {}

  async execute(
    userId: string,
    page: number,
    limit: number,
  ): Promise<PaginatedCertificatesResult> {
    const skip = (page - 1) * limit;

    // Concurrently grab count and records
    const [totalItems, certificates] = await Promise.all([
      this.certificateRepo.countByUserId(userId),
      this.certificateRepo.findByUserId(userId, skip, limit),
    ]);

    const totalPages = Math.ceil(totalItems / limit);

    return {
      certificates,
      pagination: {
        totalItems,
        totalPages: totalPages === 0 ? 1 : totalPages,
        page,
        limit,
      },
    };
  }
}
