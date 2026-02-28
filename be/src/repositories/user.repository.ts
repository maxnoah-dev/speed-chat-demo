import { prisma } from '../lib/prisma';

export async function findAll() {
  return prisma.user.findMany({
    orderBy: { created_at: 'desc' },
  });
}
