'use client';

import { useState } from 'react';
import { createEventCode } from '@/app/actions/eventCodes';

export default function CreateCodeForm() {
  const [submitting, setSubmitting] = useState(false);
  const [msg, setMsg] = useState<{ error?: string; success?: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);
    setMsg(null);

    const formData = new FormData(e.currentTarget);
    const res = await createEventCode(formData);
    setSubmitting(false);

    if (res?.error) {
      setMsg({ error: res.error });
    } else {
      setMsg({ success: '🎉 Đăng chia sẻ mã thành công!' });
      (e.target as HTMLFormElement).reset();
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
      <div>
        <label style={{ fontSize: 12, color: 'var(--muted)', display: 'block', marginBottom: 4 }}>Loại Sự Kiện</label>
        <select name="type" className="pick" style={{ width: '100%', borderRadius: 8 }}>
          <option value="CHUNG_SUC">🤝 Mã Chung Sức (Dùng nhiều lần)</option>
          <option value="BAN_BI">🟢 Mã Bắn Bi (Dùng nhiều lần)</option>
          <option value="SAN_THE">🎁 Mã Săn Thẻ (MÃ 1 LẦN - Tự ẩn khi được nhận)</option>
          <option value="KHAC">⚡ Mã Sự Kiện Khác</option>
        </select>
      </div>

      <div>
        <label style={{ fontSize: 12, color: 'var(--muted)', display: 'block', marginBottom: 4 }}>Tên / Ghi Nhớ Ngắn</label>
        <input
          type="text"
          name="title"
          placeholder="Ví dụ: Mã Bắn Bi chặng 3, Thẻ Valhein..."
          required
          style={{ width: '100%', borderRadius: 8 }}
        />
      </div>

      <div>
        <label style={{ fontSize: 12, color: 'var(--muted)', display: 'block', marginBottom: 4 }}>Mã Sự Kiện (Code)</label>
        <input
          type="text"
          name="code"
          placeholder="Dán mã vào đây..."
          required
          style={{ width: '100%', borderRadius: 8, fontFamily: 'monospace', fontWeight: 'bold' }}
        />
      </div>

      <div>
        <label style={{ fontSize: 12, color: 'var(--muted)', display: 'block', marginBottom: 4 }}>Ghi Chú Phụ (Tùy chọn)</label>
        <input
          type="text"
          name="description"
          placeholder="Ví dụ: Cần 3 bạn chép mã giúp mình..."
          style={{ width: '100%', borderRadius: 8 }}
        />
      </div>

      {msg?.error && (
        <div style={{ gridColumn: '1 / -1', color: 'var(--bad)', fontSize: 13 }}>
          {msg.error}
        </div>
      )}

      {msg?.success && (
        <div style={{ gridColumn: '1 / -1', color: 'var(--ok)', fontSize: 13, fontWeight: 'bold' }}>
          {msg.success}
        </div>
      )}

      <div style={{ gridColumn: '1 / -1', textAlign: 'right', marginTop: 4 }}>
        <button
          type="submit"
          disabled={submitting}
          style={{
            background: 'var(--accent)',
            color: '#fff',
            border: 0,
            borderRadius: 8,
            padding: '8px 20px',
            fontWeight: 700,
            fontSize: 14,
            cursor: 'pointer',
          }}
        >
          {submitting ? 'Đang đăng...' : '🚀 Đăng Chia Sẻ Mã'}
        </button>
      </div>
    </form>
  );
}
