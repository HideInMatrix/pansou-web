
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '~~/generated/prisma/client'


// 解决 dev 模式下热重载重复 new PrismaClient 的问题
const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!, // 环境变量里要有
});

export const prisma =
  globalForPrisma.prisma ?? new PrismaClient({ adapter });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

export default prisma;