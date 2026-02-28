import * as postRepo from '../repositories/post.repository';

export async function getPosts() {
  const rows = await postRepo.findAllWithUser();
  return rows.map((p) => ({
    id: p.id,
    user_id: p.user_id,
    title: p.title,
    content: p.content,
    created_at: p.created_at,
    user_name: p.user.name,
    user_email: p.user.email,
  }));
}

export async function createPost(data: { user_id: number; title: string; content: string }) {
  const post = await postRepo.create({
    user_id: data.user_id,
    title: data.title,
    content: data.content,
  });
  return { id: post.id };
}
