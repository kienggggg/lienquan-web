'use client';

import { useActionState } from 'react';
import { createForumPost } from '@/app/actions/articles';
import Link from 'next/link';

export default function NewForumForm() {
  const [state, action, isPending] = useActionState(
    async (prevState: any, formData: FormData) => {
      return await createForumPost(formData);
    },
    null
  );

  return (
    <div className="panel" style={{ maxWidth: 800, margin: '40px auto' }}>
      <h2>Tạo chủ đề thảo luận mới</h2>
      <p className="sub" style={{ marginBottom: 24 }}>Chia sẻ kinh nghiệm, hỏi đáp hoặc chém gió với cộng đồng.</p>

      {state?.error && <div className="warn" style={{ marginBottom: 16 }}>{state.error}</div>}

      <form action={action}>
        <div className="afield">
          <label>Tiêu đề</label>
          <input name="title" type="text" placeholder="Ví dụ: Nên pick tướng nào để leo rank đơn tốt nhất?" required minLength={6} />
        </div>

        <div className="afield" style={{ marginTop: 16 }}>
          <label>Nội dung</label>
          <textarea name="content" rows={8} placeholder="Viết nội dung thảo luận ở đây..." required minLength={10}></textarea>
        </div>

        <div className="bar" style={{ marginTop: 24 }}>
          <Link href="/thao-luan"><button type="button" disabled={isPending}>Hủy</button></Link>
          <button type="submit" className="on btn-interactive" disabled={isPending}>
            {isPending ? 'Đang đăng...' : 'Đăng bài'}
          </button>
        </div>
      </form>
    </div>
  );
}
