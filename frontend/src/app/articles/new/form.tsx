'use client';

import { useActionState } from 'react';
import Link from 'next/link';
import { createArticle } from '@/app/actions/articles';

export default function NewArticleForm({ heroes }: { heroes: any[] }) {
  const [state, formAction, isPending] = useActionState(
    async (_prev: any, formData: FormData) => await createArticle(formData),
    null,
  );

  return (
    <div className="hwrap" style={{ maxWidth: 720, margin: '0 auto' }}>
      <div className="crumbs"><Link href="/articles">← Cẩm nang</Link></div>
      <div className="panel">
        <h1 style={{ marginBottom: 16 }}>Viết bài đánh giá / phân tích</h1>
        <form action={formAction} className="bar" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <label style={{ fontSize: 13, fontWeight: 'bold', color: 'var(--color-ink-sub)' }}>Gắn thẻ Tướng (Không bắt buộc)</label>
              <select name="heroId" style={{ background: 'var(--color-paper-2)', color: 'var(--color-ink)', border: '1px solid var(--color-line)', borderRadius: 10, padding: '10px 14px', fontSize: 15, outline: 'none' }}>
                <option value="">-- Chọn tướng --</option>
                {heroes.map(h => (
                  <option key={h.id} value={h.id}>{h.name || h.id}</option>
                ))}
              </select>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <label style={{ fontSize: 13, fontWeight: 'bold', color: 'var(--color-ink-sub)' }}>Đánh giá Xếp Hạng (Tier)</label>
              <select name="tierVote" style={{ background: 'var(--color-paper-2)', color: 'var(--color-ink)', border: '1px solid var(--color-line)', borderRadius: 10, padding: '10px 14px', fontSize: 15, outline: 'none' }}>
                <option value="">-- Không đánh giá --</option>
                <option value="S">Tier S (Rất mạnh, phá game)</option>
                <option value="A">Tier A (Mạnh, ổn định)</option>
                <option value="B">Tier B (Trung bình, theo meta)</option>
                <option value="C">Tier C (Yếu, cần buff)</option>
                <option value="D">Tier D (Quá yếu, không nên pick)</option>
              </select>
            </div>
          </div>

          <input type="text" name="title" placeholder="Tiêu đề bài viết (vd: Tại sao Violet xứng đáng Tier S)" required 
            style={{ background: 'var(--color-paper-2)', color: 'var(--color-ink)', border: '1px solid var(--color-line)', borderRadius: 10, padding: '12px 14px', fontSize: 15 }} />
          
          <textarea
            name="content"
            placeholder="Nội dung: Phân tích lý do bạn chọn mức xếp hạng này, điểm mạnh, điểm yếu..."
            required
            rows={14}
            style={{
              background: 'var(--color-paper-2)', color: 'var(--color-ink)', border: '1px solid var(--color-line)',
              borderRadius: 10, padding: '12px 14px', fontSize: 15, fontFamily: 'inherit', resize: 'vertical',
            }}
          />
          {state?.error && (
            <div className="warn" style={{ color: 'var(--color-bad)', border: '1px solid var(--color-bad)', padding: 12, borderRadius: 8 }}>{state.error}</div>
          )}
          <button type="submit" className="btn-interactive" style={{ padding: 12, background: 'var(--color-accent)', color: '#fff', border: 'none' }} disabled={isPending}>
            {isPending ? 'Đang đăng...' : 'Đăng bài phân tích'}
          </button>
        </form>
      </div>
    </div>
  );
}
