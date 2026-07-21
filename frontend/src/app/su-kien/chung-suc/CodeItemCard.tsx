'use client';

import { useState } from 'react';
import { claimOneTimeCode, rateAndCommentCode, recordCopy } from '@/app/actions/eventCodes';

interface CodeItemCardProps {
  item: {
    id: string;
    code: string;
    type: string;
    title: string;
    description: string | null;
    copyCount: number;
    createdAt: Date;
    author: {
      name: string;
      reputation: number;
    };
    ratings: {
      id: string;
      stars: number;
      comment: string | null;
      author: { name: string };
      createdAt: Date;
    }[];
  };
  currentUserId?: string | null;
}

export default function CodeItemCard({ item, currentUserId }: CodeItemCardProps) {
  const [copied, setCopied] = useState(false);
  const [claiming, setClaiming] = useState(false);
  const [showRatingForm, setShowRatingForm] = useState(false);
  const [selectedStars, setSelectedStars] = useState(5);
  const [commentText, setCommentText] = useState('');
  const [submittingRating, setSubmittingRating] = useState(false);
  const [msg, setMsg] = useState<{ error?: string; success?: string } | null>(null);

  const avgRating =
    item.ratings.length > 0
      ? (item.ratings.reduce((acc, r) => acc + r.stars, 0) / item.ratings.length).toFixed(1)
      : null;

  const handleCopyNormalCode = async () => {
    try {
      await navigator.clipboard.writeText(item.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
      await recordCopy(item.id);
    } catch (e) {
      alert('Mã của bạn: ' + item.code);
    }
  };

  const handleClaimOneTimeCode = async () => {
    if (!currentUserId) {
      alert('Bạn cần đăng nhập để nhận mã Săn Thẻ.');
      return;
    }
    if (!confirm('Xác nhận nhận mã này? Mã sẽ bị ẨN NGAY LẬP TỨC khỏi bảng tin để tránh bị dùng trùng.')) {
      return;
    }
    setClaiming(true);
    const res = await claimOneTimeCode(item.id);
    setClaiming(false);

    if (res.error) {
      alert(res.error);
    } else if (res.code) {
      try {
        await navigator.clipboard.writeText(res.code);
        alert(`🎉 ĐÃ NHẬN MÃ THÀNH CÔNG!\n\nMã: ${res.code}\n(Đã tự động chép vào Clipboard & xóa mã khỏi bảng tin public).`);
      } catch (e) {
        alert(`🎉 ĐÃ NHẬN MÃ THÀNH CÔNG!\n\nMã của bạn là: ${res.code}`);
      }
    }
  };

  const handleSubmitRating = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUserId) {
      setMsg({ error: 'Bạn cần đăng nhập để đánh giá mã.' });
      return;
    }
    setSubmittingRating(true);
    setMsg(null);
    const res = await rateAndCommentCode(item.id, selectedStars, commentText);
    setSubmittingRating(false);

    if (res.error) {
      setMsg({ error: res.error });
    } else {
      setMsg({ success: 'Đã gửi đánh giá thành công! Cảm ơn đóng góp của bạn.' });
      setCommentText('');
      setShowRatingForm(false);
    }
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'SAN_THE':
        return <span className="tbadge" style={{ background: '#ff5f6e', color: '#fff' }}>🎁 Săn Thẻ (Mã 1 lần)</span>;
      case 'BAN_BI':
        return <span className="tbadge" style={{ background: 'var(--accent)', color: '#fff' }}>🟢 Bắn Bi</span>;
      case 'CHUNG_SUC':
        return <span className="tbadge" style={{ background: 'var(--gold)', color: '#000' }}>🤝 Chung Sức</span>;
      default:
        return <span className="tbadge" style={{ background: 'var(--chip)', color: 'var(--ink)' }}>Mã Khác</span>;
    }
  };

  return (
    <div className="acard" style={{ position: 'relative', border: '1px solid var(--line)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 8 }}>
        <div>
          {getTypeBadge(item.type)}
          <h3 style={{ fontSize: 16, marginTop: 6, marginBottom: 4 }}>{item.title}</h3>
          <div className="am" style={{ fontSize: 12.5 }}>
            Bởi <b>{item.author.name}</b> (🏅 {item.author.reputation} uy tín) · {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </div>
        </div>

        {avgRating && (
          <div style={{ background: 'var(--chip)', border: '1px solid var(--line)', borderRadius: 8, padding: '4px 8px', textAlign: 'right' }}>
            <span style={{ color: 'var(--gold)', fontWeight: 800 }}>⭐ {avgRating}</span>
            <span style={{ fontSize: 11, color: 'var(--muted)', display: 'block' }}>({item.ratings.length} vote)</span>
          </div>
        )}
      </div>

      {item.description && (
        <p style={{ fontSize: 13.5, color: 'var(--muted)', margin: '8px 0 12px', background: 'var(--chip)', padding: '6px 10px', borderRadius: 6 }}>
          💬 {item.description}
        </p>
      )}

      {/* Hành động mã */}
      {item.type === 'SAN_THE' ? (
        <div style={{ marginTop: 12 }}>
          <button
            onClick={handleClaimOneTimeCode}
            disabled={claiming}
            style={{
              width: '100%',
              background: 'linear-gradient(90deg, #ff5f6e, #ff9f45)',
              color: '#fff',
              border: 0,
              borderRadius: 8,
              padding: '9px 14px',
              fontWeight: 800,
              fontSize: 14,
              cursor: 'pointer',
            }}
          >
            {claiming ? 'Đang xử lý...' : '🎁 Sao chép & Nhận Mã (Dùng 1 Lần - Xóa Ngay)'}
          </button>
          <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 4, textAlign: 'center' }}>
            🔒 Khi bấm nút này, mã sẽ được chép vào máy bạn và TỰ ĐỘNG XÓA khỏi trang tin công khai.
          </div>
        </div>
      ) : (
        <div style={{ marginTop: 12 }}>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', background: 'var(--bg)', border: '1px dashed var(--accent)', padding: '8px 12px', borderRadius: 8 }}>
            <code style={{ fontSize: 16, fontWeight: 'bold', color: 'var(--accent)', flex: 1, letterSpacing: 1 }}>{item.code}</code>
            <button
              onClick={handleCopyNormalCode}
              style={{
                background: copied ? 'var(--ok)' : 'var(--accent)',
                color: '#fff',
                border: 0,
                borderRadius: 6,
                padding: '6px 12px',
                fontSize: 13,
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              {copied ? '✓ Đã chép!' : '📋 Sao chép'}
            </button>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8, fontSize: 12, color: 'var(--muted)' }}>
            <span>Đã sao chép: <b>{item.copyCount}</b> lượt</span>
            <button
              onClick={() => setShowRatingForm(!showRatingForm)}
              style={{ background: 'none', border: 0, color: 'var(--accent)', cursor: 'pointer', fontSize: 12.5, fontWeight: 600 }}
            >
              {showRatingForm ? '▲ Đóng đánh giá' : '⭐ Đánh giá & Bình luận (' + item.ratings.length + ')'}
            </button>
          </div>
        </div>
      )}

      {/* Form đánh giá cho mã Bắn bi / Chung sức */}
      {showRatingForm && item.type !== 'SAN_THE' && (
        <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid var(--line)', background: 'var(--chip)', padding: 12, borderRadius: 8 }}>
          <h4 style={{ fontSize: 13.5, marginBottom: 8 }}>Đánh giá mã này có dùng được không?</h4>
          <form onSubmit={handleSubmitRating}>
            <div style={{ display: 'flex', gap: 6, marginBottom: 8, alignItems: 'center' }}>
              <span style={{ fontSize: 13, color: 'var(--muted)' }}>Chọn sao:</span>
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  type="button"
                  key={star}
                  onClick={() => setSelectedStars(star)}
                  style={{
                    background: 'none',
                    border: 0,
                    fontSize: 18,
                    cursor: 'pointer',
                    opacity: star <= selectedStars ? 1 : 0.3,
                  }}
                >
                  ⭐
                </button>
              ))}
              <span style={{ fontSize: 12, fontWeight: 700, marginLeft: 4 }}>({selectedStars} sao)</span>
            </div>

            <input
              type="text"
              placeholder="Bình luận thêm (ví dụ: Code chuẩn 100%, hoặc Code đã hết lượt)..."
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              style={{
                width: '100%',
                background: 'var(--card)',
                border: '1px solid var(--line)',
                color: 'var(--ink)',
                borderRadius: 6,
                padding: '7px 10px',
                fontSize: 13,
                marginBottom: 8,
                outline: 'none',
              }}
            />

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
              <button
                type="submit"
                disabled={submittingRating}
                style={{
                  background: 'var(--ok)',
                  color: '#000',
                  border: 0,
                  borderRadius: 6,
                  padding: '5px 12px',
                  fontWeight: 700,
                  fontSize: 12.5,
                  cursor: 'pointer',
                }}
              >
                {submittingRating ? 'Đang gửi...' : 'Gửi đánh giá'}
              </button>
            </div>
          </form>

          {/* Hiển thị bình luận gần đây */}
          {item.ratings.length > 0 && (
            <div style={{ marginTop: 10, display: 'flex', flexDirection: 'column', gap: 6 }}>
              <div style={{ fontSize: 11.5, color: 'var(--muted)', fontWeight: 700 }}>Bình luận gần đây:</div>
              {item.ratings.slice(0, 3).map((r) => (
                <div key={r.id} style={{ fontSize: 12, background: 'var(--card)', padding: '5px 8px', borderRadius: 4 }}>
                  <span style={{ color: 'var(--gold)', fontWeight: 'bold' }}>{'⭐'.repeat(r.stars)}</span>{' '}
                  <b>{r.author.name}</b>: {r.comment || 'Không có nhận xét.'}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {msg?.error && <div style={{ color: 'var(--bad)', fontSize: 12, marginTop: 6 }}>{msg.error}</div>}
      {msg?.success && <div style={{ color: 'var(--ok)', fontSize: 12, marginTop: 6 }}>{msg.success}</div>}
    </div>
  );
}
