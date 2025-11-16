import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis;

const prisma = globalForPrisma.__prisma__ || new PrismaClient();
if (!globalForPrisma.__prisma__) globalForPrisma.__prisma__ = prisma;

export default prisma;

