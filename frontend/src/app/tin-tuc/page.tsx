import { readNews } from '@/lib/data';

export const dynamic = 'force-dynamic';

export default function NewsPage() {
  const { items, updated } = readNews();
  const news = items.filter((i) => i.type === 'news');

  return (
    <div className="hwrap">
      <h1>Tin tức Liên Quân</h1>
      <p className="sub">
        Tổng hợp tin mới từ trang chủ chính thống — bấm để mở bài gốc trên Garena.
        {updated && <> · Cập nhật: <b>{updated}</b></>}
      </p>

      {news.length === 0 ? (
        <div className="empty" style={{ marginTop: 20 }}>
          Chưa có tin. Chạy <code>python scrape_news.py</code> để cập nhật.
        </div>
      ) : (
        <div className="alist" style={{ gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))' }}>
          {news.map((n) => (
            <a className="acard" key={n.url} href={n.url} target="_blank" rel="noopener noreferrer"
               style={{ display: 'block', padding: 0, overflow: 'hidden' }}>
              {n.img && (
                <img src={n.img} alt="" loading="lazy"
                     style={{ width: '100%', height: 150, objectFit: 'cover', display: 'block' }} />
              )}
              <div style={{ padding: 14 }}>
                <h3 style={{ fontSize: 15 }}>{n.title}</h3>
                <div className="am" style={{ marginTop: 6 }}>🔗 lienquan.garena.vn ↗</div>
              </div>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
