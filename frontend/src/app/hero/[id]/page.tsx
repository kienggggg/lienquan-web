import fs from 'fs';
import path from 'path';
import Link from 'next/link';
import crypto from 'crypto';

export function getLocalImgUrl(url: string) {
  if (!url) return '';
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
    return hero;
  } catch (error) {
    return null;
  }
}

export default async function HeroPage({ params }: { params: { id: string } }) {
  const resolvedParams = await params;
  const hero = await getHeroData(resolvedParams.id);

  if (!hero) {
    return (
      <div className="hwrap">
        <h1>Không tìm thấy tướng</h1>
        <Link href="/">Quay lại trang chủ</Link>
      </div>
    );
  }

  return (
    <div className="hwrap">
      <div className="crumbs">
        <Link href="/">Trang chủ</Link> › <Link href="/">Tướng</Link> › {hero.name}
      </div>
      
      <div className="head" style={{ marginBottom: 20 }}>
        <img src={getLocalImgUrl(hero.img)} alt={hero.name} className="av" />
        <div>
          <h1>{hero.name}</h1>
          <div className="meta">Vai trò: {hero.roles?.join(', ')}</div>
        </div>
      </div>

      <div className="udetail">
        <div className="usummary">
          <div className="usplash">
            <img src={getLocalImgUrl(hero.img)} alt={hero.name} />
            <div className="ov">
              <div className="nm">{hero.name}</div>
              <div className="role">{hero.roles?.[0]}</div>
            </div>
          </div>
          
          <div className="uability">
            <h3 style={{ marginBottom: 10, fontSize: 16 }}>Bộ Kỹ Năng (Chính thức)</h3>
            {hero.skills?.map((s: any, idx: number) => (
              <div key={idx} className="skl">
                <img src={getLocalImgUrl(s.icon)} alt={s.name} />
                <div>
                  <div className="kind">Chiêu {idx === 0 ? 'Nội tại' : idx}</div>
                  <div className="nm">{s.name}</div>
                  <div className="ds">{s.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <div className="spanel">
            <div className="t">Phân tích chuyên sâu</div>
            
            {hero.pros && hero.pros.length > 0 && (
              <div className="introbox" style={{ marginBottom: 15, borderLeftColor: '#4caf50' }}>
                <h4 style={{ color: '#4caf50', marginBottom: 5 }}>Điểm mạnh</h4>
                <ul style={{ paddingLeft: 20, margin: 0 }}>
                  {hero.pros.map((p: string, i: number) => <li key={i}>{p}</li>)}
                </ul>
              </div>
            )}
            
            {hero.cons && hero.cons.length > 0 && (
              <div className="introbox" style={{ marginBottom: 15, borderLeftColor: '#f44336' }}>
                <h4 style={{ color: '#f44336', marginBottom: 5 }}>Điểm yếu</h4>
                <ul style={{ paddingLeft: 20, margin: 0 }}>
                  {hero.cons.map((p: string, i: number) => <li key={i}>{p}</li>)}
                </ul>
              </div>
            )}
            
            {hero.play && (
              <div className="introbox" style={{ marginBottom: 15, borderLeftColor: '#2196f3' }}>
                <h4 style={{ color: '#2196f3', marginBottom: 5 }}>Lối chơi (Giáo án)</h4>
                <p style={{ margin: 0 }}>{hero.play}</p>
              </div>
            )}

            {hero.analysis?.counters?.lane?.bi_khac_che && hero.analysis.counters.lane.bi_khac_che.length > 0 && (
              <div className="introbox" style={{ marginBottom: 15 }}>
                <h4 style={{ color: '#ff9800', marginBottom: 5 }}>Sợ các tướng (Đi đường)</h4>
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 10 }}>
                  {hero.analysis.counters.lane.bi_khac_che.map((c: any) => (
                    <div key={c.id} style={{ display: 'flex', alignItems: 'center', gap: 5, background: '#222', padding: '5px 10px', borderRadius: 4 }}>
                      <span style={{ fontSize: 13 }}>{c.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
