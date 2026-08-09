import fs from 'fs';
import path from 'path';
import Link from 'next/link';
import crypto from 'crypto';

export function getLocalImgUrl(url: string) {
  if (!url) return '';
  if (url.startsWith('/')) return url;
  const extMatch = url.match(/\.(png|jpg|jpeg|webp|gif)/i);
  let ext = '.png';
  if (extMatch) {
    ext = extMatch[1].toLowerCase() === 'jpeg' ? '.jpg' : `.${extMatch[1].toLowerCase()}`;
  }
  const hash = crypto.createHash('md5').update(url).digest('hex').slice(0, 16);
  return `/img/${hash}${ext}`;
}

async function getHeroData(id: string) {
  const filePath = path.join(process.cwd(), '..', 'data', 'heroes_meta.json');
  try {
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    const data = JSON.parse(fileContent);
    const hero = data.heroes.find((h: any) => h.id === id);
    return hero || null;
  } catch (error) {
    const fbPath = path.join(process.cwd(), '..', 'data', 'heroes.json');
    try {
      const fbContent = fs.readFileSync(fbPath, 'utf-8');
      const data = JSON.parse(fbContent);
      const heroes = Array.isArray(data) ? data : data.heroes || [];
      return heroes.find((h: any) => h.id === id) || null;
    } catch(e) {
      return null;
    }
  }
}

async function getItemsData() {
  const garenaItemsPath = path.join(process.cwd(), '..', 'data', 'garena_items.json');
  const itemsMetaPath = path.join(process.cwd(), '..', 'data', 'items.json');
  
  let garenaItems: any[] = [];
  let roleBuilds: Record<string, string[]> = {};

  try {
    if (fs.existsSync(garenaItemsPath)) {
      const parsed = JSON.parse(fs.readFileSync(garenaItemsPath, 'utf-8'));
      garenaItems = parsed.items || [];
    }
  } catch(e) {}

  try {
    if (fs.existsSync(itemsMetaPath)) {
      const parsed = JSON.parse(fs.readFileSync(itemsMetaPath, 'utf-8'));
      roleBuilds = parsed.role_builds || {};
    }
  } catch(e) {}

  return { garenaItems, roleBuilds };
}

function getTierBadge(winrate?: number) {
  if (typeof winrate !== 'number') return { name: '?', sub: 'Chưa có số', color: '#94A3B8' };
  if (winrate >= 53.5) return { name: 'SSS+', sub: 'Bá Chủ Meta', color: '#FFB800' };
  if (winrate >= 52.0) return { name: 'SS', sub: 'Siêu Mạnh Lực', color: '#00F0FF' };
  if (winrate >= 50.5) return { name: 'S', sub: 'Cân Bằng Tốt', color: '#10B981' };
  if (winrate >= 49.0) return { name: 'A', sub: 'Ổn Định', color: '#A855F7' };
  return { name: 'B', sub: 'Kéo Rank Khó', color: '#EF4444' };
}

export default async function HeroPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const hero = await getHeroData(resolvedParams.id);
  const { garenaItems, roleBuilds } = await getItemsData();

  if (!hero) {
    return (
      <div className="hwrap" style={{ padding: '60px 0', textAlign: 'center' }}>
        <h1 style={{ marginBottom: 16 }}>Không tìm thấy tướng</h1>
        <p style={{ color: 'var(--color-ink-sub)', marginBottom: 24 }}>Dữ liệu tướng không tồn tại hoặc đã được cập nhật lại mã định danh.</p>
        <Link href="/" className="btn-solid">Quay lại Bảng Xếp Hạng</Link>
      </div>
    );
  }

  const tier = getTierBadge(hero.winrate);
  const primaryRole = hero.roles?.[0] || 'Pháp sư';

  // Build items mapping
  const recommendedItemNames = hero.items || roleBuilds[primaryRole] || roleBuilds['Pháp sư'] || [];
  const recommendedItems = recommendedItemNames.map((name: string) => {
    const found = garenaItems.find((i: any) => i.name.toLowerCase() === name.toLowerCase());
    return {
      name,
      icon: found?.icon || '',
      type: found?.type || 'Trang bị'
    };
  });

  // Arcana breakdown
  const arcanaList = hero.arcana && hero.arcana.length === 3 ? [
    { color: '#EF4444', label: '10x Ngọc Đỏ', desc: hero.arcana[0].replace(/^Đỏ:\s*/i, '') },
    { color: '#A855F7', label: '10x Ngọc Tím', desc: hero.arcana[1].replace(/^Tím:\s*/i, '') },
    { color: '#10B981', label: '10x Ngọc Xanh', desc: hero.arcana[2].replace(/^Lục:\s*|^Xanh:\s*/i, '') }
  ] : [
    { color: '#EF4444', label: '10x Ngọc Đỏ', desc: hero.damage === 'magical' ? 'Công phép / Xuyên giáp phép' : 'Công vật lý / Xuyên giáp' },
    { color: '#A855F7', label: '10x Ngọc Tím', desc: 'Tốc đánh / Tốc chạy / Máu tối đa' },
    { color: '#10B981', label: '10x Ngọc Xanh', desc: 'Giảm hồi chiêu / Xuyên giáp phép' }
  ];

  // Attributes
  const attr = hero.attr || {
    burst: 2,
    dps: 2,
    mobility: 2,
    cc: 1,
    range: 2,
    tanky: 1
  };

  const getAttrPercent = (val: number) => Math.min(100, Math.max(15, (val / 3) * 100));

  return (
    <div className="hwrap hero-detail-page">
      {/* Breadcrumb Navigation */}
      <div className="crumbs">
        <Link href="/">Trang chủ</Link> › <Link href="/">Bảng Xếp Hạng Tướng</Link> › <span style={{ color: 'var(--color-accent)' }}>{hero.name}</span>
      </div>

      {/* Hero Showcase Banner */}
      <div className="hero-showcase-card">
        <div className="hero-showcase-bg" style={{ backgroundImage: `url(${hero.img || ''})` }}></div>
        <div className="hero-showcase-overlay"></div>

        <div className="hero-showcase-content">
          <div className="hero-avatar-large">
            <img src={getLocalImgUrl(hero.img)} alt={hero.name} className="hero-avatar-img" />
            <div className="hero-tier-flag" style={{ background: tier.color }}>
              {tier.name}
            </div>
          </div>

          <div className="hero-main-info">
            <div className="hero-subrole-tag">
              {hero.sub_roles?.join(' • ') || hero.roles?.join(' • ') || 'Tướng Liên Quân'}
            </div>
            <h1 className="hero-name-big">{hero.name}</h1>
            <div className="hero-meta-strip">
              <span className="hero-lane-chip">📍 Vị trí: <strong>{hero.lane || hero.roles?.[0] || 'Tự do'}</strong></span>
              <span className="hero-damage-chip">⚔️ Sát thương: <strong>{hero.damage === 'magical' ? 'Phép thuật' : 'Vật lý'}</strong></span>
              <span className="hero-spike-chip">⏱️ Đỉnh cao: <strong>{hero.spike === 'early' ? 'Đầu trận' : hero.spike === 'late' ? 'Cuối trận' : 'Giữa trận'}</strong></span>
            </div>

            {/* Performance Stat Pills */}
            <div className="hero-stats-grid">
              <div className="stat-pill">
                <span className="stat-label">TỈ LỆ THẮNG</span>
                <span className="stat-value" style={{ color: 'var(--color-ok)' }}>{hero.winrate ? `${hero.winrate}%` : 'Chưa có'}</span>
              </div>
              <div className="stat-pill">
                <span className="stat-label">TỈ LỆ CHỌN</span>
                <span className="stat-value" style={{ color: 'var(--color-accent)' }}>{hero.pickrate ? `${hero.pickrate}%` : '0%'}</span>
              </div>
              <div className="stat-pill">
                <span className="stat-label">TỈ LỆ CẤM</span>
                <span className="stat-value" style={{ color: '#EF4444' }}>{hero.banrate ? `${hero.banrate}%` : '0%'}</span>
              </div>
              <div className="stat-pill">
                <span className="stat-label">ĐÁNH GIÁ META</span>
                <span className="stat-value" style={{ color: tier.color }}>{tier.sub}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: 2 Columns */}
      <div className="hero-content-columns">
        {/* Left Column: Skills & Combat Attributes */}
        <div className="hero-col-left">
          {/* Attributes Power Bars */}
          <div className="panel-cyber">
            <div className="panel-cyber-title">
              <span>📊 CHỈ SỐ SỨC MẠNH TOÀN DIỆN</span>
            </div>
            <div className="attr-bars-list">
              <div className="attr-bar-row">
                <span className="attr-name">💥 Sát thương bộc phát (Burst)</span>
                <div className="attr-track"><div className="attr-fill" style={{ width: `${getAttrPercent(attr.burst || 0)}%`, background: '#FF5722' }}></div></div>
              </div>
              <div className="attr-bar-row">
                <span className="attr-name">⚔️ Sát thương liên tục (DPS)</span>
                <div className="attr-track"><div className="attr-fill" style={{ width: `${getAttrPercent(attr.dps || 0)}%`, background: '#FF9800' }}></div></div>
              </div>
              <div className="attr-bar-row">
                <span className="attr-name">🏃 Cơ động & Đột kích (Mobility)</span>
                <div className="attr-track"><div className="attr-fill" style={{ width: `${getAttrPercent(attr.mobility || 0)}%`, background: '#00F0FF' }}></div></div>
              </div>
              <div className="attr-bar-row">
                <span className="attr-name">🌀 Khống chế & Hiệu ứng (CC)</span>
                <div className="attr-track"><div className="attr-fill" style={{ width: `${getAttrPercent(attr.cc || 0)}%`, background: '#A855F7' }}></div></div>
              </div>
              <div className="attr-bar-row">
                <span className="attr-name">🛡️ Chống chịu & Hồi phục (Tanky)</span>
                <div className="attr-track"><div className="attr-fill" style={{ width: `${getAttrPercent(attr.tanky || 0)}%`, background: '#10B981' }}></div></div>
              </div>
            </div>
          </div>

          {/* Official Skills Kit */}
          <div className="panel-cyber">
            <div className="panel-cyber-title">
              <span>⚡ BỘ KỸ NĂNG CHÍNH THỨC (4 CHIÊU THỨC)</span>
            </div>
            <div className="skills-vertical-stack">
              {hero.skills && hero.skills.length > 0 ? (
                hero.skills.map((s: any, idx: number) => (
                  <div key={idx} className="skill-card-modern">
                    <div className="skill-icon-box">
                      <img src={getLocalImgUrl(s.icon)} alt={s.name} className="skill-img" />
                      <span className="skill-badge-type">{idx === 0 ? 'Nội tại' : `Chiêu ${idx}`}</span>
                    </div>
                    <div className="skill-info-box">
                      <div className="skill-title-row">
                        <span className="skill-name-txt">{s.name}</span>
                      </div>
                      <p className="skill-desc-txt">{s.desc}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="empty-notice">Đang cập nhật mô tả chi tiết kỹ năng cho tướng này.</div>
              )}
            </div>
          </div>

          {/* Gameplay & Strategy Guide */}
          <div className="panel-cyber">
            <div className="panel-cyber-title">
              <span>📘 GIÁO ÁN CHIẾN THUẬT & CÁCH CHƠI</span>
            </div>
            
            {hero.pros && hero.pros.length > 0 && (
              <div className="tactic-box pro">
                <h4 className="tactic-head pro">🟢 Điểm Mạnh Vượt Trội</h4>
                <ul className="tactic-list">
                  {hero.pros.map((p: string, i: number) => <li key={i}>{p}</li>)}
                </ul>
              </div>
            )}

            {hero.cons && hero.cons.length > 0 && (
              <div className="tactic-box con">
                <h4 className="tactic-head con">🔴 Điểm Yếu Cần Khắc Phục</h4>
                <ul className="tactic-list">
                  {hero.cons.map((p: string, i: number) => <li key={i}>{p}</li>)}
                </ul>
              </div>
            )}

            {hero.play && (
              <div className="tactic-box guide">
                <h4 className="tactic-head guide">🎯 Hướng Dẫn Di Chuyển & Giao Tranh</h4>
                <p className="guide-txt">{hero.play}</p>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Arcana, 6 Items Build, Spell, Counters */}
        <div className="hero-col-right">
          {/* 6-Items Build */}
          <div className="panel-cyber">
            <div className="panel-cyber-title">
              <span>⚔️ BỘ 6 TRANG BỊ CHUẨN META</span>
            </div>
            <div className="items-grid-six">
              {recommendedItems.map((item: any, idx: number) => (
                <div key={idx} className="item-slot-card">
                  <div className="item-slot-icon-wrapper">
                    {item.icon ? (
                      <img src={getLocalImgUrl(item.icon)} alt={item.name} className="item-slot-img" />
                    ) : (
                      <div className="item-slot-fallback">{idx + 1}</div>
                    )}
                    <span className="item-slot-num">{idx + 1}</span>
                  </div>
                  <div className="item-slot-name">{item.name}</div>
                </div>
              ))}
            </div>
          </div>

          {/* 3-Color Arcana Board */}
          <div className="panel-cyber">
            <div className="panel-cyber-title">
              <span>💎 BẢNG NGỌC 30 VIÊN CAO THỦ</span>
            </div>
            <div className="arcana-stack">
              {arcanaList.map((arc, i) => (
                <div key={i} className="arcana-row-card" style={{ borderLeftColor: arc.color }}>
                  <div className="arcana-dot" style={{ background: arc.color }}></div>
                  <div className="arcana-info">
                    <div className="arcana-label" style={{ color: arc.color }}>{arc.label}</div>
                    <div className="arcana-desc">{arc.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Spell & Enchantment */}
          <div className="panel-cyber">
            <div className="panel-cyber-title">
              <span>🔮 PHÉP BỔ TRỢ & PHÙ HIỆU</span>
            </div>
            <div className="spell-row-layout">
              <div className="spell-box">
                <span className="spell-lbl">Phép Bổ Trợ:</span>
                <strong className="spell-val">⚡ {hero.spell || (hero.lane === 'Rừng' ? 'Trừng Trị' : 'Tốc Biến')}</strong>
              </div>
              <div className="spell-box">
                <span className="spell-lbl">Phù Hiệu Khuyên Dùng:</span>
                <strong className="spell-val">🌟 {primaryRole === 'Sát thủ' ? 'Ma Tính / Du Hiệp' : primaryRole === 'Pháp sư' ? 'Thần Quang' : 'Mộc Giáp'}</strong>
              </div>
            </div>
          </div>

          {/* Matchups & Counter Picks */}
          <div className="panel-cyber">
            <div className="panel-cyber-title">
              <span>⚖️ TƯƠNG KHẮC & KÈO ĐẤU</span>
            </div>
            
            {/* Khắc chế */}
            <div className="counter-section">
              <div className="counter-title win">⚔️ KÈO TRÊN (Khắc chế tốt)</div>
              <div className="counter-hero-chips">
                {hero.analysis?.counters?.lane?.khac_che?.length > 0 ? (
                  hero.analysis.counters.lane.khac_che.map((c: any) => (
                    <div key={c.id} className="counter-chip win">
                      <span className="counter-chip-name">{c.name}</span>
                      {c.why && <span className="counter-chip-why">{c.why}</span>}
                    </div>
                  ))
                ) : (
                  <div className="counter-chip win">
                    <span className="counter-chip-name">Tướng cơ động thấp, thiếu khống chế</span>
                  </div>
                )}
              </div>
            </div>

            {/* Bị khắc chế */}
            <div className="counter-section" style={{ marginTop: 14 }}>
              <div className="counter-title lose">🛡️ KÈO DƯỚI (Cần cẩn thận khi gặp)</div>
              <div className="counter-hero-chips">
                {hero.analysis?.counters?.lane?.bi_khac_che?.length > 0 ? (
                  hero.analysis.counters.lane.bi_khac_che.map((c: any) => (
                    <div key={c.id} className="counter-chip lose">
                      <span className="counter-chip-name">{c.name}</span>
                      {c.why && <span className="counter-chip-why">{c.why}</span>}
                    </div>
                  ))
                ) : (
                  <div className="counter-chip lose">
                    <span className="counter-chip-name">Sát thủ dồn sát thương nhanh, khống chế cứng</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
