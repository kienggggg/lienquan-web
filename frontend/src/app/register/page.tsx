'use client';

import { useActionState } from 'react';
import { register } from '@/app/actions/auth';
import Link from 'next/link';

export default function RegisterPage() {
  const [state, formAction, isPending] = useActionState(
    async (prevState: any, formData: FormData) => {
      return await register(formData);
    },
    null
  );

  return (
    <div className="hwrap" style={{ maxWidth: 400, margin: '0 auto', paddingTop: 80 }}>
      <div className="panel">
        <h1 style={{ marginBottom: 20, textAlign: 'center' }}>Đăng Ký Tài Khoản</h1>
        <form action={formAction} style={{ display: 'flex', flexDirection: 'column', gap: 15 }} className="bar">
          <input type="text" name="name" placeholder="Tên hiển thị (Tên game)" required />
          <input type="email" name="email" placeholder="Email" required />
          <input type="password" name="password" placeholder="Mật khẩu" required />
          
          {state?.error && (
            <div className="warn" style={{ color: 'var(--bad)', borderColor: 'var(--bad)' }}>
              {state.error}
            </div>
          )}

          <button type="submit" className="on" style={{ padding: '10px', marginTop: 10 }} disabled={isPending}>
            {isPending ? 'Đang xử lý...' : 'Đăng Ký'}
          </button>
        </form>
        <div style={{ marginTop: 20, textAlign: 'center', fontSize: 13 }}>
          Đã có tài khoản? <Link href="/login" style={{ color: 'var(--accent)' }}>Đăng nhập ngay</Link>
        </div>
      </div>
    </div>
  );
}
