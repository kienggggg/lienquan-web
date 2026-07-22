import fs from 'fs';
import path from 'path';
import Link from 'next/link';

async function getHeroes() {
  const filePath = path.join(process.cwd(), '..', 'data', 'heroes.json');
  try {
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    const data = JSON.parse(fileContent);
    return data;
  } catch (error) {
    console.error("Failed to read heroes data", error);
    return {};
  }
}

function getTier(winrate: number) {
  if (winrate >= 52) return { name: 'S', color: 'var(--color-ok)' };
  if (winrate >= 51) return { name: 'A', color: 'var(--color-accent)' };
  if (winrate >= 50) return { name: 'B', color: 'var(--color-gold)' };
  if (winrate >= 48.5) return { name: 'C', color: 'var(--color-ink-faint)' };
  return { name: 'D', color: 'var(--color-bad)' };
}

export default async function Home() {
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

  const featured = heroesList
    .filter((h:any) => typeof h.winrate === 'number' && h.img)
    .sort((a:any,b:any) => b.winrate - a.winrate)
    .slice(0, 5);
  const hero = featured.length > 0 ? featured[0] : null;
  const hotList = featured.length > 1 ? featured.slice(1) : [];

  return (
    <div className="hwrap">
      <header style={{ paddingBottom: '32px' }}>
        <h1>Bảng xếp hạng Tướng & Meta</h1>
        <div className="sub">Phân tích meta mới nhất. Dữ liệu tỉ lệ thắng và sức mạnh từ xếp hạng máy chủ.</div>
      </header>

      {hero && (
        <div className="herobanner">
          <Link href={`/hero/${hero.id}`} className="hb-feature" style={{ backgroundImage: `url(${hero.img})` }}>
            <div className="hb-overlay"></div>
            <div className="hb-badge">🔥 META NỔI BẬT</div>
            <div className="nm">{hero.name || hero.id}</div>
            <div className="ro">{hero.roles?.join(' · ') || 'Unknown'}</div>
            <div className="hb-stats">
              <span style={{ color: getTier(hero.winrate).color }}>Tier {getTier(hero.winrate).name}</span>
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
                  const tier = getTier(h.winrate);
                  return (
                    <Link href={`/hero/${h.id}`} key={h.id} className="hb-item">
                      <img src={h.img} alt={h.name || h.id} className="av" />
                      <div className="nbox">
                        <div className="nm">{h.name || h.id}</div>
                        <div className="ro">{h.roles?.[0] || 'Unknown'}</div>
                      </div>
                      <div className="rstats">
                        <div className="s-tier" style={{ color: tier.color }}>{tier.name}</div>
                        <div className="s-win">Win {h.winrate}%</div>
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
        const TIER_COLOR: Record<string, string> = {
          S: 'var(--color-ok)',
          A: 'var(--color-accent)',
          B: 'var(--color-gold)',
          C: 'var(--color-ink-faint)',
          D: 'var(--color-bad)'
        };
        const withWR = heroesList.filter((h: any) => typeof h.winrate === 'number');
        const noWR = heroesList.filter((h: any) => typeof h.winrate !== 'number');
        
        const byTier: Record<string, any[]> = { S: [], A: [], B: [], C: [], D: [] };
        for (const h of withWR) {
          const t = getTier(h.winrate).name;
          if (byTier[t]) byTier[t].push(h);
        }
        for (const t of TIER_ORDER) {
          byTier[t].sort((a: any, b: any) => b.winrate - a.winrate);
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
                          <div className="ro">{h.roles?.[0] || 'Unknown'}</div>
                          <div className="wr">Win <b>{h.winrate}%</b></div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              );
            })}

            {noWR.length > 0 && (
              <div className="tierrow" key="unranked">
                <div className="tierbadge" style={{ color: 'var(--color-ink-sub)', borderRight: '2px solid var(--color-line)' }}>
                  ?
                </div>
                <div className="tierheroes">
                  {noWR.map((h: any) => (
                    <Link href={`/hero/${h.id}`} key={h.id} className="htile">
                      <img src={h.img} alt={h.name || h.id} className="av" />
                      <div>
                        <div className="nm">{h.name || h.id}</div>
                        <div className="ro">{h.roles?.[0] || 'Unknown'}</div>
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
