import { prisma } from '../lib/prisma';

export async function findAllWithUser() {
  return prisma.post.findMany({
    orderBy: { created_at: 'desc' },
    include: { user: true },
  });
}

export async function create(data: { user_id: number; title: string; content: string | null }) {
  return prisma.post.create({
    data: {
      user_id: data.user_id,
      title: data.title,
      content: data.content,
    },
  });
}
