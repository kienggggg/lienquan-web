'use server';

import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

export async function saveTeam(name: string, composition: string[]) {
  const session = await getSession();
  if (!session?.userId) {
    return { error: 'Bạn cần đăng nhập để lưu đội hình.' };
  }

  const trimmedName = name?.trim();
  if (!trimmedName || trimmedName.length < 2) {
    return { error: 'Tên đội hình quá ngắn (tối thiểu 2 ký tự).' };
  }

  if (!Array.isArray(composition) || composition.length === 0) {
    return { error: 'Vui lòng chọn ít nhất 1 tướng cho đội hình.' };
  }

  try {
    await prisma.team.create({
      data: {
        name: trimmedName,
        composition: JSON.stringify(composition),
        authorId: session.userId as string,
      },
    });
    revalidatePath('/team-builder');
    return { ok: true };
  } catch (err: any) {
    return { error: err?.message || 'Có lỗi xảy ra khi lưu đội hình.' };
  }
}
