import fs from 'fs';
import path from 'path';
import Link from 'next/link';
import TierListClient from './TierListClient';

async function getHeroes() {
  const filePath = path.join(process.cwd(), '..', 'data', 'heroes_meta.json');
  try {
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    const data = JSON.parse(fileContent);
    return data;
  } catch (error) {
    const fbPath = path.join(process.cwd(), '..', 'data', 'heroes.json');
    try {
      const fbContent = fs.readFileSync(fbPath, 'utf-8');
      return JSON.parse(fbContent);
    } catch(e) {
      return {};
    }
  }
}

export default async function Home() {
  const heroesData = await getHeroes();
  
  let heroesList: any[] = [];
  if (heroesData && Array.isArray(heroesData.heroes)) {
    heroesList = heroesData.heroes;
  } else if (Array.isArray(heroesData)) {
    heroesList = heroesData;
  } else {
    heroesList = Object.entries(heroesData.heroes || heroesData).map(([id, data]: [string, any]) => ({
      id,
      ...data
    }));
  }

  const featured = heroesList
    .filter((h: any) => typeof h.winrate === 'number' && h.img)
    .sort((a: any, b: any) => b.winrate - a.winrate)
    .slice(0, 5);
  const hero = featured.length > 0 ? featured[0] : null;
  const hotList = featured.length > 1 ? featured.slice(1) : [];

  return (
    <div className="hwrap">
      {/* Header Banner */}
      <header className="page-header-esports">
        <div className="badge-meta-live">
          <span className="live-pulse"></span>
          <span>META SEASON 2026 LIVE • XẾP HẠNG MÁY CHỦ VIỆT NAM</span>
        </div>
        <h1 className="header-title-gradient">Bảng Xếp Hạng Sức Mạnh Tướng (Tier List Meta)</h1>
        <div className="header-subtitle">
          Số liệu thống kê tỉ lệ thắng (Winrate), cấm chọn (Ban/Pick) và giáo án leo Rank Thách Đấu được phân tích trực tiếp từ dữ liệu máy chủ.
        </div>
      </header>

      {/* Hero Spotlight Banner */}
      {hero && (
        <div className="herobanner">
          <Link href={`/hero/${hero.id}`} className="hb-feature" style={{ backgroundImage: `url(${hero.img})` }}>
            <div className="hb-overlay"></div>
            <div className="hb-badge">🔥 TOP 1 WINRATE MÙA NÀY</div>
            <div className="nm">{hero.name || hero.id}</div>
            <div className="ro">{hero.roles?.join(' · ') || 'Tướng'}</div>
            <div className="hb-stats">
              <span style={{ color: 'var(--color-gold)', fontWeight: 'bold' }}>Tier SSS+</span>
              <span>·</span>
              <span>Win {hero.winrate}%</span>
              <span>·</span>
              <span>Pick {hero.pickrate || 0}%</span>
            </div>
            <div className="hb-btn">Xem Giáo Án Chi Tiết →</div>
          </Link>
          {hotList.length > 0 && (
            <div className="hb-right">
              <div className="rtitle">⚡ Tướng Đang Lên Hạng</div>
              <div className="hb-list">
                {hotList.map((h: any) => (
                  <Link href={`/hero/${h.id}`} key={h.id} className="hb-item">
                    <img src={h.img} alt={h.name || h.id} className="av" />
                    <div className="nbox">
                      <div className="nm">{h.name || h.id}</div>
                      <div className="ro">{h.roles?.[0] || 'Tướng'}</div>
                    </div>
                    <div className="rstats">
                      <div className="s-tier" style={{ color: 'var(--color-accent)' }}>Win {h.winrate}%</div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Bento Quick Actions Grid */}
      <div className="igrid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px', marginBottom: '32px' }}>
        <Link href="/team-builder" className="spanel btn-interactive bento-link-card">
          <div className="bento-icon">🛠️</div>
          <div className="bento-text">
            <div className="bento-tag">CÔNG CỤ PRO</div>
            <div className="bento-title">Tạo Đội Hình & Combo</div>
            <div className="bento-desc">Phối hợp 5 vị trí chuẩn meta, tính toán sát thương & khống chế.</div>
          </div>
        </Link>

        <Link href="/item-builder" className="spanel btn-interactive bento-link-card">
          <div className="bento-icon">⚔️</div>
          <div className="bento-text">
            <div className="bento-tag">TRANG BỊ</div>
            <div className="bento-title">Lên Đồ & Bảng Ngọc</div>
            <div className="bento-desc">Tự do phối 6 món trang bị, xem tổng chỉ số công & thủ.</div>
          </div>
        </Link>
        
        <Link href="/articles" className="spanel btn-interactive bento-link-card">
          <div className="bento-icon">📜</div>
          <div className="bento-text">
            <div className="bento-tag">CỘNG ĐỒNG</div>
            <div className="bento-title">Giáo Án & Phân Tích</div>
            <div className="bento-desc">Đọc các bài viết chiến thuật, mẹo di chuyển từ Cao Thủ.</div>
          </div>
        </Link>

        <Link href="/su-kien" className="spanel btn-interactive bento-link-card">
          <div className="bento-icon">🎁</div>
          <div className="bento-text">
            <div className="bento-tag">SỰ KIỆN</div>
            <div className="bento-title">Chợ Đổi Thẻ & Bắn Bi</div>
            <div className="bento-desc">Chia sẻ và nhận mã sự kiện Garena miễn phí từ cộng đồng.</div>
          </div>
        </Link>
      </div>

      {/* Main Interactive Tier List Client Component */}
      <TierListClient heroes={heroesList} />
    </div>
  );
}
