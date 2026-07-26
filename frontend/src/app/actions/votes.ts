'use server';

import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

// value: 1 (Upvote), -1 (Downvote)
export async function submitVote(articleId: string, value: number) {
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
    const existingVote = await prisma.vote.findUnique({
      where: {
        userId_articleId: {
          userId,
          articleId,
        },
      },
    });

    if (existingVote) {
      if (existingVote.value === value) {
        // Unvote (Bỏ vote nếu nhấn lại nút cũ)
        await prisma.vote.delete({
          where: {
            userId_articleId: { userId, articleId },
          },
        });

        // Hoàn trả uy tín (nếu rút upvote thì trừ 1, rút downvote thì cộng 1)
        if (article.authorId !== userId) {
          await prisma.user.update({
            where: { id: article.authorId },
            data: { reputation: { decrement: value } },
          });
        }
      } else {
        // Thay đổi Vote (đang up thành down, hoặc down thành up)
        await prisma.vote.update({
          where: { userId_articleId: { userId, articleId } },
          data: { value },
        });

        // Bù trừ uy tín (từ -1 sang 1 thì lệch 2, từ 1 sang -1 thì lệch -2)
        const diff = value - existingVote.value;
        if (article.authorId !== userId) {
          await prisma.user.update({
            where: { id: article.authorId },
            data: { reputation: { increment: diff } },
          });
        }
      }
    } else {
      // Vote mới
      await prisma.vote.create({
        data: {
          userId,
          articleId,
          value,
        },
      });

      // Cộng hoặc trừ uy tín theo value
      if (article.authorId !== userId) {
        await prisma.user.update({
          where: { id: article.authorId },
          data: { reputation: { increment: value } },
        });
      }
    }

    revalidatePath('/articles');
    revalidatePath(`/articles/${articleId}`);
    return { success: true };
  } catch (err: any) {
    return { error: err?.message || 'Có lỗi xảy ra khi thực hiện vote.' };
  }
}
