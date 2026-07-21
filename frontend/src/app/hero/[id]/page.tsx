import fs from 'fs';
import path from 'path';
import Link from 'next/link';

async function getHeroData(id: string) {
  const filePath = path.join(process.cwd(), '..', 'data', 'garena_heroes.json');
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
        <img src={hero.img} alt={hero.name} className="av" />
        <div>
          <h1>{hero.name}</h1>
          <div className="meta">Vai trò: {hero.roles?.join(', ')}</div>
        </div>
      </div>

      <div className="udetail">
        <div className="usummary">
          <div className="usplash">
            <img src={hero.img} alt={hero.name} />
            <div className="ov">
              <div className="nm">{hero.name}</div>
              <div className="role">{hero.roles?.[0]}</div>
            </div>
          </div>
          
          <div className="uability">
            <h3 style={{ marginBottom: 10, fontSize: 16 }}>Bộ Kỹ Năng (Chính thức)</h3>
            {hero.skills?.map((s: any, idx: number) => (
              <div key={idx} className="skl">
                <img src={s.icon} alt={s.name} />
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
            <div className="t">Phân tích (Đang cập nhật)</div>
            <div className="introbox">
              Trang web đang trong quá trình chuyển đổi sang nền tảng động. Phân tích khắc chế, trang bị và đội hình sẽ sớm được khôi phục.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
