'use server';

import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

// Toggle vote: nếu đã vote -> xoá vote, nếu chưa -> thêm vote.
// Đồng thời cộng/trừ 1 uy tín cho TÁC GIẢ bài viết (không tự cộng bài mình).
export async function toggleVote(articleId: string) {
  const session = await getSession();
  if (!session?.userId) {
    return { error: 'Bạn cần đăng nhập để vote.' };
  }

  const userId = session.userId as string;

  const article = await prisma.article.findUnique({
    where: { id: articleId },
  });
  if (!article) {
    return { error: 'Bài viết không tồn tại.' };
  }

  try {
    // Check if user has already voted
    const existingVote = await prisma.vote.findUnique({
      where: {
        userId_articleId: {
          userId,
          articleId,
        },
      },
    });

    if (existingVote) {
      // Unvote
      await prisma.vote.delete({
        where: {
          userId_articleId: {
            userId,
            articleId,
          },
        },
      });

      // Trừ 1 uy tín cho tác giả bài (không tự trừ bài mình)
      if (article.authorId !== userId) {
        await prisma.user.update({
          where: { id: article.authorId },
          data: { reputation: { decrement: 1 } },
        });
      }

      revalidatePath('/articles');
      revalidatePath(`/articles/${articleId}`);
      return { voted: false };
    } else {
      // Vote
      await prisma.vote.create({
        data: {
          userId,
          articleId,
        },
      });

      // Cộng 1 uy tín cho tác giả bài (không tự cộng bài mình)
      if (article.authorId !== userId) {
        await prisma.user.update({
          where: { id: article.authorId },
          data: { reputation: { increment: 1 } },
        });
      }

      revalidatePath('/articles');
      revalidatePath(`/articles/${articleId}`);
      return { voted: true };
    }
  } catch (err: any) {
    return { error: err?.message || 'Có lỗi xảy ra khi thực hiện vote.' };
  }
}
