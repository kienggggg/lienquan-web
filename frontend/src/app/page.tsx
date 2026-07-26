import fs from 'fs';
import path from 'path';
import Link from 'next/link';

async function getHeroes() {
  const filePath = path.join(process.cwd(), '..', 'data', 'heroes_meta.json');
  try {
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    const data = JSON.parse(fileContent);
    return data;
  } catch (error) {
    console.error("Failed to read heroes_meta data", error);
    // fallback
    const fbPath = path.join(process.cwd(), '..', 'data', 'heroes.json');
    try {
      const fbContent = fs.readFileSync(fbPath, 'utf-8');
      return JSON.parse(fbContent);
    } catch(e) {
      return {};
    }
  }
}

function getTier(winrate: number) {
  if (winrate >= 52) return { name: 'S', color: 'var(--color-ok)' };
  if (winrate >= 51) return { name: 'A', color: 'var(--color-accent)' };
  if (winrate >= 50) return { name: 'B', color: 'var(--color-gold)' };
  if (winrate >= 48.5) return { name: 'C', color: 'var(--color-ink-faint)' };
  return { name: 'D', color: 'var(--color-bad)' };
}

const TIER_COLOR: Record<string, string> = {
  S: 'var(--color-ok)',
  A: 'var(--color-accent)',
  B: 'var(--color-gold)',
  C: 'var(--color-ink-faint)',
  D: 'var(--color-bad)'
};

const ROLES = ["Tất cả", "Rừng", "Đường Tà Thần", "Đường Giữa", "Đường Rồng", "Hỗ Trợ"];
// Ánh xạ từ Tên Đường/Tab sang Role name thực tế trong data
const ROLE_MAP: Record<string, string> = {
  "Rừng": "Sát thủ",
  "Đường Tà Thần": "Đấu sĩ",
  "Đường Giữa": "Pháp sư",
  "Đường Rồng": "Xạ thủ",
  "Hỗ Trợ": "Hỗ trợ"
};

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>

export default async function Home(props: { searchParams: SearchParams }) {
  const searchParams = await props.searchParams;
  const currentTab = typeof searchParams.role === 'string' ? searchParams.role : 'Tất cả';
  const targetRole = ROLE_MAP[currentTab]; // may be undefined for "Tất cả"
  
  const heroesData = await getHeroes();
  
  let heroesList = [];
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

  // Filter list based on selected role
  let filteredList = heroesList;
  if (targetRole) {
    filteredList = heroesList.filter((h: any) => h.roles?.includes(targetRole) || h.role_tiers?.[targetRole]);
  }

  const featured = filteredList
    .filter((h:any) => typeof h.winrate === 'number' && h.img)
    .sort((a:any,b:any) => b.winrate - a.winrate)
    .slice(0, 5);
  const hero = featured.length > 0 ? featured[0] : null;
  const hotList = featured.length > 1 ? featured.slice(1) : [];

  return (
    <div className="hwrap">
      <header style={{ paddingBottom: '32px' }}>
        <h1>Bảng xếp hạng Tướng & Meta</h1>
        <div className="sub">Phân tích meta mới nhất. Dữ liệu tỉ lệ thắng, kỹ năng và mức độ khắc chế.</div>
      </header>

      {/* Role Tabs */}
      <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '24px' }}>
        {ROLES.map(role => (
          <Link 
            key={role} 
            href={`/?role=${encodeURIComponent(role)}`}
            className="btn-interactive"
            style={{
              padding: '8px 16px',
              borderRadius: '20px',
              backgroundColor: currentTab === role ? 'var(--color-accent)' : 'var(--color-bg-elevated)',
              color: currentTab === role ? '#fff' : 'var(--color-ink)',
              fontWeight: currentTab === role ? 'bold' : 'normal',
              whiteSpace: 'nowrap'
            }}
          >
            {role}
          </Link>
        ))}
      </div>

      {hero && (
        <div className="herobanner">
          <Link href={`/hero/${hero.id}`} className="hb-feature" style={{ backgroundImage: `url(${hero.img})` }}>
            <div className="hb-overlay"></div>
            <div className="hb-badge">🔥 META NỔI BẬT</div>
            <div className="nm">{hero.name || hero.id}</div>
            <div className="ro">{targetRole || hero.roles?.join(' · ') || 'Unknown'}</div>
            <div className="hb-stats">
              <span style={{ color: targetRole && hero.role_tiers ? TIER_COLOR[hero.role_tiers[targetRole] || 'B'] : getTier(hero.winrate).color }}>
                Tier {targetRole && hero.role_tiers ? (hero.role_tiers[targetRole] || '?') : getTier(hero.winrate).name}
              </span>
              <span>·</span>
              <span>Win {hero.winrate}%</span>
              <span>·</span>
              <span>Pick {hero.pickrate || 0}%</span>
            </div>
            <div className="hb-btn">Xem chi tiết →</div>
          </Link>
          {hotList.length > 0 && (
            <div className="hb-right">
              <div className="rtitle">Đang lên hạng</div>
              <div className="hb-list">
                {hotList.map((h: any) => {
                  const tName = targetRole && h.role_tiers ? (h.role_tiers[targetRole] || '?') : getTier(h.winrate).name;
                  const tColor = TIER_COLOR[tName] || 'var(--color-ink-sub)';
                  return (
                    <Link href={`/hero/${h.id}`} key={h.id} className="hb-item">
                      <img src={h.img} alt={h.name || h.id} className="av" />
                      <div className="nbox">
                        <div className="nm">{h.name || h.id}</div>
                        <div className="ro">{h.sub_roles && h.sub_roles.length > 0 ? h.sub_roles[0] : (targetRole || h.roles?.[0] || 'Unknown')}</div>
                      </div>
                      <div className="rstats">
                        <div className="s-tier" style={{ color: tColor }}>{tName}</div>
                        <div className="s-win">Win {h.winrate ? `${h.winrate}%` : '---'}</div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Bento Grid layout for top resources */}
      <div className="igrid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px', marginBottom: '40px' }}>
        <Link href="/su-kien" className="spanel btn-interactive" style={{ display: 'block', textAlign: 'left', padding: '24px' }}>
          <div className="t" style={{ color: 'var(--color-accent)', marginBottom: '8px' }}>Sự kiện nổi bật</div>
          <div style={{ fontSize: '18px', fontWeight: 'bold', color: 'var(--color-ink)' }}>Khuyến mãi & Nhiệm vụ</div>
          <div style={{ color: 'var(--color-ink-sub)', fontSize: '14px', marginTop: '6px' }}>Tham gia nhận trang phục và các phần quà hấp dẫn từ Garena Liên Quân.</div>
        </Link>
        
        <Link href="/tin-tuc" className="spanel btn-interactive" style={{ display: 'block', textAlign: 'left', padding: '24px' }}>
          <div className="t" style={{ color: 'var(--color-accent)', marginBottom: '8px' }}>Tin tức & Giáo án</div>
          <div style={{ fontSize: '18px', fontWeight: 'bold', color: 'var(--color-ink)' }}>Bản tin & Phiên bản mới</div>
          <div style={{ color: 'var(--color-ink-sub)', fontSize: '14px', marginTop: '6px' }}>Đọc các bài phân tích chiến thuật, thay đổi sức mạnh tướng và trang bị.</div>
        </Link>
      </div>

      {(() => {
        const TIER_ORDER = ['S', 'A', 'B', 'C', 'D'];
        
        const byTier: Record<string, any[]> = { S: [], A: [], B: [], C: [], D: [], '?': [] };
        
        for (const h of filteredList) {
          // Tính tier dựa trên targetRole nếu có, nếu không thì lấy winrate tổng
          let t = '?';
          if (targetRole && h.role_tiers) {
            t = h.role_tiers[targetRole] || '?';
          } else if (h.role_tiers && Object.keys(h.role_tiers).length > 0) {
            // Pick highest tier if no target role
            const tiers = Object.values(h.role_tiers) as string[];
            if (tiers.includes('S')) t = 'S';
            else if (tiers.includes('A')) t = 'A';
            else if (tiers.includes('B')) t = 'B';
            else if (tiers.includes('C')) t = 'C';
            else if (tiers.includes('D')) t = 'D';
          } else if (typeof h.winrate === 'number') {
            t = getTier(h.winrate).name;
          }
          if (byTier[t]) byTier[t].push(h);
        }
        
        for (const t of [...TIER_ORDER, '?']) {
          // Sắp xếp theo winrate giảm dần trong cùng 1 tier (nếu có winrate)
          if (byTier[t]) {
             byTier[t].sort((a: any, b: any) => (b.winrate || 50) - (a.winrate || 50));
          }
        }

        return (
          <>
            {TIER_ORDER.map(t => {
              const tierHeroes = byTier[t];
              if (!tierHeroes || tierHeroes.length === 0) return null;
              return (
                <div className="tierrow" key={t}>
                  <div className="tierbadge" style={{ color: TIER_COLOR[t], borderRight: `2px solid color-mix(in oklch, ${TIER_COLOR[t]} 30%, transparent)` }}>
                    {t}
                  </div>
                  <div className="tierheroes">
                    {tierHeroes.map((h: any) => (
                      <Link href={`/hero/${h.id}`} key={h.id} className="htile">
                        <img src={h.img} alt={h.name || h.id} className="av" />
                        <div>
                          <div className="nm">{h.name || h.id}</div>
                          <div className="ro">{h.sub_roles ? h.sub_roles.join(' · ') : (targetRole || h.roles?.[0] || 'Unknown')}</div>
                          <div className="wr">Win <b>{h.winrate ? `${h.winrate}%` : '---'}</b></div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              );
            })}

            {byTier['?'] && byTier['?'].length > 0 && (
              <div className="tierrow" key="unranked">
                <div className="tierbadge" style={{ color: 'var(--color-ink-sub)', borderRight: '2px solid var(--color-line)' }}>
                  ?
                </div>
                <div className="tierheroes">
                  {byTier['?'].map((h: any) => (
                    <Link href={`/hero/${h.id}`} key={h.id} className="htile">
                      <img src={h.img} alt={h.name || h.id} className="av" />
                      <div>
                        <div className="nm">{h.name || h.id}</div>
                        <div className="ro">{h.sub_roles ? h.sub_roles.join(' · ') : (targetRole || h.roles?.[0] || 'Unknown')}</div>
                        <div className="wr">Win <b>{h.winrate ? `${h.winrate}%` : '---'}</b></div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </>
        );
      })()}
    </div>
  );
}
