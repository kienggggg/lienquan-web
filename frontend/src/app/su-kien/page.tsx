import { readNews } from '@/lib/data';

export const dynamic = 'force-dynamic';

export default function EventsPage() {
  const { items, updated } = readNews();
  const events = items.filter((i) => i.type === 'event');

  return (
    <div className="hwrap">
      <h1>Sự kiện</h1>
      <p className="sub">
        Sự kiện trong game từ trang chính thống + sự kiện cộng đồng của web (sắp có).
        {updated && <> · Cập nhật: <b>{updated}</b></>}
      </p>

      <div className="afield">
        <div className="lbl">🎮 Sự kiện trong game (chính thống)</div>
        {events.length === 0 ? (
          <div className="empty">Chưa có sự kiện. Chạy <code>python scrape_news.py</code> để cập nhật.</div>
        ) : (
          <div className="alist" style={{ gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))' }}>
            {events.map((e) => (
              <a className="acard" key={e.url} href={e.url} target="_blank" rel="noopener noreferrer"
                 style={{ display: 'block', padding: 0, overflow: 'hidden' }}>
                {e.img && (
                  <img src={e.img} alt="" loading="lazy"
                       style={{ width: '100%', height: 150, objectFit: 'cover', display: 'block' }} />
                )}
                <div style={{ padding: 14 }}>
                  <h3 style={{ fontSize: 15 }}>{e.title}</h3>
                  <div className="am" style={{ marginTop: 6 }}>🔗 lienquan.garena.vn ↗</div>
                </div>
              </a>
            ))}
          </div>
        )}
      </div>

      <div className="afield tip">
        <div className="lbl">🤝 Chợ Mã Sự Kiện Cộng Đồng (Đã ra mắt!)</div>
        <p style={{ fontSize: 14.5, margin: '6px 0 10px' }}>
          Đã có sẵn: <b>Chung sức</b>, <b>Bắn bi</b>, <b>Tặng/săn thẻ tướng (mã 1 lần tự xóa)</b>...
          Tham gia chia sẻ mã hoặc copy mã của các thành viên khác để nhận sự trợ giúp ngay!
        </p>
        <a href="/su-kien/chung-suc" className="button on" style={{ display: 'inline-block', padding: '8px 16px', borderRadius: 8, fontWeight: 700 }}>
          🚀 Mở Chợ Chia Sẻ Mã Sự Kiện ➔
        </a>
      </div>
    </div>
  );
}
