'use server';

import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

export async function createItemBuild(
  heroId: string,
  title: string,
  itemIds: string[],
  note?: string
) {
  const session = await getSession();
  if (!session?.userId) {
    return { error: 'Bạn cần đăng nhập để lưu bộ trang bị.' };
  }

  const trimmedTitle = title?.trim();
  if (!trimmedTitle || trimmedTitle.length < 2) {
    return { error: 'Tiêu đề bộ trang bị quá ngắn (tối thiểu 2 ký tự).' };
  }

  if (!heroId) {
    return { error: 'Vui lòng chọn tướng cho bộ trang bị.' };
  }

  if (!Array.isArray(itemIds) || itemIds.length === 0) {
    return { error: 'Vui lòng chọn ít nhất 1 món trang bị.' };
  }

  if (itemIds.length > 6) {
    return { error: 'Bộ trang bị chỉ được chọn tối đa 6 món.' };
  }

  try {
    await prisma.itemBuild.create({
      data: {
        authorId: session.userId as string,
        heroId,
        title: trimmedTitle,
        itemIds: JSON.stringify(itemIds),
        note: note?.trim() || null,
      },
    });
    revalidatePath('/item-builder');
    revalidatePath('/profile');
    return { ok: true };
  } catch (err: any) {
    return { error: err?.message || 'Có lỗi xảy ra khi lưu bộ trang bị.' };
  }
}

export async function deleteItemBuild(id: string) {
  const session = await getSession();
  if (!session?.userId) {
    return { error: 'Bạn cần đăng nhập để thực hiện thao tác.' };
  }

  try {
    const build = await prisma.itemBuild.findUnique({ where: { id } });
    if (!build) {
      return { error: 'Không tìm thấy bộ trang bị.' };
    }

    if (build.authorId !== session.userId) {
      return { error: 'Bạn không có quyền xóa bộ trang bị này.' };
    }

    await prisma.itemBuild.delete({ where: { id } });
    revalidatePath('/item-builder');
    revalidatePath('/profile');
    return { ok: true };
  } catch (err: any) {
    return { error: err?.message || 'Có lỗi xảy ra khi xóa bộ trang bị.' };
  }
}
