'use server';

import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

export async function createEventCode(formData: FormData) {
  const session = await getSession();
  if (!session?.userId) return { error: 'Bạn cần đăng nhập để chia sẻ mã sự kiện.' };

  const code = (formData.get('code') as string)?.trim();
  const type = (formData.get('type') as string)?.trim() || 'CHUNG_SUC';
  const title = (formData.get('title') as string)?.trim();
  const description = (formData.get('description') as string)?.trim() || '';

  if (!code || code.length < 3) return { error: 'Mã sự kiện quá ngắn (tối thiểu 3 ký tự).' };
  if (!title || title.length < 3) return { error: 'Tiêu đề / tên gợi nhớ quá ngắn (tối thiểu 3 ký tự).' };

  await prisma.eventCode.create({
    data: {
      code,
      type,
      title,
      description,
      authorId: session.userId as string,
    },
  });

  revalidatePath('/su-kien/chung-suc');
  revalidatePath('/su-kien');
  return { ok: true };
}

// Nhận mã dùng 1 lần (Săn Thẻ) -> Trả về mã & TỰ ĐỘNG XÓA / ẨN khỏi trang tin
export async function claimOneTimeCode(codeId: string) {
  const session = await getSession();
  if (!session?.userId) return { error: 'Bạn cần đăng nhập để nhận mã săn thẻ.' };

  const item = await prisma.eventCode.findUnique({ where: { id: codeId } });
  if (!item) return { error: 'Mã không tồn tại.' };
  if (item.isUsed) return { error: 'Mã này vừa có người nhận mất rồi!' };

  // Đánh dấu mã đã sử dụng (isUsed = true) để ẩn ngay lập tức khỏi bảng tin công khai
  await prisma.eventCode.update({
    where: { id: codeId },
    data: {
      isUsed: true,
      copyCount: { increment: 1 },
    },
  });

  // Khích lệ cộng điểm uy tín cho người tặng thẻ
  if (item.authorId !== session.userId) {
    await prisma.user.update({
      where: { id: item.authorId },
      data: { reputation: { increment: 1 } },
    });
  }

  revalidatePath('/su-kien/chung-suc');
  revalidatePath('/su-kien');
  return { ok: true, code: item.code };
}

// Đánh giá 1-5 sao + bình luận mã sự kiện (Bắn Bi / Chung Sức)
export async function rateAndCommentCode(codeId: string, stars: number, commentText?: string) {
  const session = await getSession();
  if (!session?.userId) return { error: 'Bạn cần đăng nhập để đánh giá mã.' };

  if (stars < 1 || stars > 5) return { error: 'Số sao đánh giá phải từ 1 đến 5.' };

  const item = await prisma.eventCode.findUnique({ where: { id: codeId } });
  if (!item) return { error: 'Mã sự kiện không tồn tại.' };

  // Chống farm uy tín: mỗi người chỉ đánh giá 1 mã 1 lần (khớp @@unique schema).
  const existing = await prisma.codeRating.findUnique({
    where: { authorId_codeId: { authorId: session.userId as string, codeId } },
  });
  if (existing) return { error: 'Bạn đã đánh giá mã này rồi.' };

  await prisma.codeRating.create({
    data: {
      codeId,
      stars,
      comment: commentText?.trim() || '',
      authorId: session.userId as string,
    },
  });

  // Nếu đánh giá tốt (>= 4 sao), cộng 1 uy tín cho người chia sẻ mã
  if (stars >= 4 && item.authorId !== session.userId) {
    await prisma.user.update({
      where: { id: item.authorId },
      data: { reputation: { increment: 1 } },
    });
  }

  revalidatePath('/su-kien/chung-suc');
  return { ok: true };
}

// Tăng số lượt copy mã thông thường
export async function recordCopy(codeId: string) {
  try {
    await prisma.eventCode.update({
      where: { id: codeId },
      data: { copyCount: { increment: 1 } },
    });
    revalidatePath('/su-kien/chung-suc');
  } catch (e) {
    // ignore
  }
}
