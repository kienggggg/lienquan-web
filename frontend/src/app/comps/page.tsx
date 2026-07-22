import fs from 'fs';
import path from 'path';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

function readComps() {
  const filePath = path.join(process.cwd(), '..', 'data', 'comps.json');
  try {
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    const data = JSON.parse(fileContent);
    return data.comps || [];
  } catch (error) {
    console.error("Failed to read comps data", error);
    return [];
  }
}

function readHeroesMap() {
  const filePath = path.join(process.cwd(), '..', 'data', 'heroes.json');
  try {
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    const data = JSON.parse(fileContent);
    const list = Array.isArray(data.heroes) ? data.heroes : (data || []);
    const map: Record<string, any> = {};
    for (const h of list) {
      map[h.id] = h;
    }
    return map;
  } catch (error) {
    console.error("Failed to read heroes for comps mapping", error);
    return {};
  }
}

export default async function CompsPage() {
  const comps = readComps();
  const heroesMap = readHeroesMap();

  return (
    <div className="hwrap">
      <header style={{ marginBottom: '24px' }}>
        <h1>Đội hình Meta Liên Quân</h1>
        <div className="sub">Các đội hình leo rank tối ưu được xếp và phân tích dựa trên sự kết hợp kỹ năng và chất tướng.</div>
      </header>

      {comps.length === 0 ? (
        <div className="empty" style={{ marginTop: 20 }}>
          Chưa có dữ liệu đội hình. Vui lòng chạy <code>python export_comps.py</code>.
        </div>
      ) : (
        <div className="clist" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {comps.map((c: any, i: number) => (
            <div
              className="comp spanel"
              key={i}
              style={{
                padding: '24px',
                borderRadius: '16px',
                background: 'var(--color-paper-2)',
                border: '1px solid var(--color-line)',
              }}
            >
              <div
                className="top"
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '20px',
                  borderBottom: '1px solid var(--color-line)',
                  paddingBottom: '12px',
                  flexWrap: 'wrap',
                  gap: '12px',
                }}
              >
                <div
                  className="thm"
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: '20px',
                    fontWeight: 'bold',
                    color: 'var(--color-accent)',
                  }}
                >
                  🚀 {c.theme}
                </div>
                <div className="tags" style={{ display: 'flex', gap: '8px' }}>
                  <span
                    style={{
                      background: 'var(--color-ok)',
                      color: '#fff',
                      padding: '4px 10px',
                      borderRadius: '8px',
                      fontSize: '12px',
                      fontWeight: 'bold',
                    }}
                  >
                    Điểm: {c.score}
                  </span>
                  <span
                    style={{
                      border: '1px solid var(--color-line)',
                      color: 'var(--color-ink-sub)',
                      padding: '4px 10px',
                      borderRadius: '8px',
                      fontSize: '12px',
                      fontWeight: 'bold',
                      background: 'var(--color-paper-3)',
                    }}
                  >
                    Độ khó: {c.difficulty}
                  </span>
                </div>
              </div>

              {/* Members */}
              <div
                className="team"
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))',
                  gap: '12px',
                  marginBottom: '20px',
                }}
              >
                {c.members.map((m: any) => {
                  const heroDetails = heroesMap[m.id];
                  const imgSrc = heroDetails?.img || `https://lienquan.garena.vn/files/hero/${m.id}.jpg`;
                  return (
                    <Link
                      href={`/hero/${m.id}`}
                      key={m.id}
                      className="slot selector-hero-card"
                      style={{
                        textDecoration: 'none',
                      }}
                    >
                      <img
                        className="av"
                        src={imgSrc}
                        alt={m.name}
                        style={{
                          width: '48px',
                          height: '48px',
                          borderRadius: '10px',
                          marginBottom: '8px',
                        }}
                      />
                      <div className="nm">{m.name}</div>
                      <div
                        className="ln"
                        style={{
                          fontSize: '11px',
                          color: 'var(--color-accent)',
                          fontWeight: 'bold',
                          marginTop: '2px',
                        }}
                      >
                        {m.lane}
                      </div>
                    </Link>
                  );
                })}
              </div>

              {/* Why & Pros/Cons */}
              <div
                className="why"
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                  gap: '20px',
                  background: 'var(--color-paper-3)',
                  padding: '16px',
                  borderRadius: '12px',
                }}
              >
                <div>
                  <div
                    className="k"
                    style={{
                      fontFamily: 'var(--font-display)',
                      fontWeight: 'bold',
                      fontSize: '14px',
                      color: 'var(--color-ink)',
                      marginBottom: '6px',
                    }}
                  >
                    📖 Hướng dẫn vận hành
                  </div>
                  <div style={{ fontSize: '13px', lineHeight: '1.6', color: 'var(--color-ink-sub)' }}>{c.play}</div>
                </div>
                <div>
                  <div
                    className="k"
                    style={{
                      fontFamily: 'var(--font-display)',
                      fontWeight: 'bold',
                      fontSize: '14px',
                      color: 'var(--color-ink)',
                      marginBottom: '6px',
                    }}
                  >
                    📊 Phân tích ưu nhược
                  </div>
                  <div style={{ color: 'var(--color-ok)', fontSize: '13px', display: 'flex', gap: '6px', marginBottom: '6px' }}>
                    <span>✓</span> <span>{c.pro}</span>
                  </div>
                  <div style={{ color: 'var(--color-bad)', fontSize: '13px', display: 'flex', gap: '6px' }}>
                    <span>✗</span> <span>{c.con}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
