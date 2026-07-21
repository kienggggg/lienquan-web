'use server';

import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

// Tạo bài viết (giáo án / hướng dẫn). Bắt buộc đăng nhập.
export async function createArticle(formData: FormData) {
  const session = await getSession();
  if (!session?.userId) return { error: 'Bạn cần đăng nhập để đăng bài.' };

  const title = (formData.get('title') as string)?.trim();
  const content = (formData.get('content') as string)?.trim();
  if (!title || title.length < 6) return { error: 'Tiêu đề quá ngắn (tối thiểu 6 ký tự).' };
  if (!content || content.length < 30) return { error: 'Nội dung quá ngắn (tối thiểu 30 ký tự).' };

  const article = await prisma.article.create({
    data: { title, content, authorId: session.userId as string },
  });
  revalidatePath('/articles');
  redirect(`/articles/${article.id}`);
}

// Bình luận vào bài viết + cộng 1 điểm uy tín cho tác giả bài (khích lệ đóng góp).
export async function createComment(articleId: string, formData: FormData) {
  const session = await getSession();
  if (!session?.userId) return { error: 'Bạn cần đăng nhập để bình luận.' };

  const content = (formData.get('content') as string)?.trim();
  if (!content) return { error: 'Chưa nhập nội dung bình luận.' };

  const article = await prisma.article.findUnique({ where: { id: articleId } });
  if (!article) return { error: 'Bài viết không tồn tại.' };

  await prisma.comment.create({
    data: { content, articleId, authorId: session.userId as string },
  });
  // Cộng uy tín cho TÁC GIẢ bài (không cộng cho chính người bình luận để tránh tự bơm).
  if (article.authorId !== session.userId) {
    await prisma.user.update({
      where: { id: article.authorId },
      data: { reputation: { increment: 1 } },
    });
  }
  revalidatePath(`/articles/${articleId}`);
  return { ok: true };
}
