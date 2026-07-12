import prisma from "../../../config/prisma";
import { AuditLog, Prisma } from "../../../../generated/prisma/client";

export class AuditLogRepository {
  async create(data: Prisma.AuditLogUncheckedCreateInput): Promise<AuditLog> {
    return prisma.auditLog.create({ data });
  }
}
