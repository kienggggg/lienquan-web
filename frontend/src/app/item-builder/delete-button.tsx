'use client';

import { useTransition } from 'react';
import { deleteItemBuild } from '@/app/actions/itemBuilds';

export default function DeleteBuildButton({ id }: { id: string }) {
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    if (!confirm('Bạn có chắc chắn muốn xóa bộ trang bị này?')) return;
    startTransition(async () => {
      const res = await deleteItemBuild(id);
      if (res.error) {
        alert(res.error);
      }
    });
  };

  return (
    <button
      onClick={handleDelete}
      disabled={isPending}
      style={{
        background: 'transparent',
        border: 'none',
        color: 'var(--color-bad)',
        fontSize: '13px',
        cursor: isPending ? 'wait' : 'pointer',
        padding: '4px 8px',
        borderRadius: '6px',
      }}
    >
      {isPending ? 'Đang xóa...' : '🗑️ Xóa'}
    </button>
  );
}
