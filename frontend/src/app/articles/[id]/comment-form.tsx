'use client';

import { useActionState, useRef, useEffect } from 'react';
import { createComment } from '@/app/actions/articles';

export default function CommentForm({ articleId }: { articleId: string }) {
  const formRef = useRef<HTMLFormElement>(null);
  const [state, formAction, isPending] = useActionState(
    async (_prev: any, formData: FormData) => await createComment(articleId, formData),
    null,
  );

  // Gửi xong (ok) thì xóa ô nhập.
  useEffect(() => {
    if (state?.ok) formRef.current?.reset();
  }, [state]);

  return (
    <form ref={formRef} action={formAction} className="bar" style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 14 }}>
      <textarea
        name="content"
        placeholder="Viết bình luận..."
        required
        rows={3}
        style={{
          background: 'var(--chip)', color: 'var(--ink)', border: '1px solid var(--line)',
          borderRadius: 10, padding: '10px 12px', fontSize: 14, fontFamily: 'inherit', resize: 'vertical',
        }}
      />
      {state?.error && (
        <div className="warn" style={{ color: 'var(--bad)', borderColor: 'var(--bad)' }}>{state.error}</div>
      )}
      <button type="submit" className="on" style={{ padding: '9px 18px', alignSelf: 'flex-start' }} disabled={isPending}>
        {isPending ? 'Đang gửi...' : 'Gửi bình luận'}
      </button>
    </form>
  );
}
