'use client';

import { useActionState } from 'react';
import Link from 'next/link';
import { createArticle } from '@/app/actions/articles';

export default function NewArticleForm() {
  const [state, formAction, isPending] = useActionState(
    async (_prev: any, formData: FormData) => await createArticle(formData),
    null,
  );

  return (
    <div className="hwrap" style={{ maxWidth: 720, margin: '0 auto' }}>
      <div className="crumbs"><Link href="/articles">← Cẩm nang</Link></div>
      <div className="panel">
        <h1 style={{ marginBottom: 16 }}>Viết bài mới</h1>
        <form action={formAction} className="bar" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <input type="text" name="title" placeholder="Tiêu đề bài viết (vd: Cách chơi Murad leo rank)" required />
          <textarea
            name="content"
            placeholder="Nội dung: giới thiệu tướng, trang bị, cách chơi, khắc chế, mẹo..."
            required
            rows={14}
            style={{
              background: 'var(--chip)', color: 'var(--ink)', border: '1px solid var(--line)',
              borderRadius: 10, padding: '12px 14px', fontSize: 15, fontFamily: 'inherit', resize: 'vertical',
            }}
          />
          {state?.error && (
            <div className="warn" style={{ color: 'var(--bad)', borderColor: 'var(--bad)' }}>{state.error}</div>
          )}
          <button type="submit" className="on" style={{ padding: 11 }} disabled={isPending}>
            {isPending ? 'Đang đăng...' : 'Đăng bài'}
          </button>
        </form>
      </div>
    </div>
  );
}
