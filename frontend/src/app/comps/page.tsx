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

export default async function CompsPage() {
  const comps = readComps();

  return (
    <div className="hwrap">
      <header>
        <h1>Đội hình Meta Liên Quân</h1>
        <div className="sub">Đội hình tối ưu theo thuật toán, cập nhật dựa trên chất tướng và tỉ lệ thắng.</div>
      </header>

      {comps.length === 0 ? (
        <div className="empty" style={{ marginTop: 20 }}>
          Chưa có dữ liệu đội hình. Vui lòng chạy <code>python export_comps.py</code>.
        </div>
      ) : (
        <div className="clist">
          {comps.map((c: any, i: number) => (
            <div className="comp" key={i}>
              <div className="top">
                <div className="thm">{c.theme}</div>
                <span className="tags" style={{ display: 'flex' }}>
                  <span style={{ margin: 0, marginLeft: 8, background: 'var(--accent)', color: '#fff' }}>Điểm: {c.score}</span>
                  <span style={{ margin: 0, marginLeft: 8, border: '1px solid var(--line)' }}>Độ khó: {c.difficulty}</span>
                </span>
              </div>
              <div className="team">
                {c.members.map((m: any) => (
                  <Link href={`/hero/${m.id}`} key={m.id} className="slot">
                    <img className="av" src={`https://lienquan.garena.vn/files/hero/${m.id}.jpg`} alt={m.name} />
                    <div className="nm">{m.name}</div>
                    <div className="ln">{m.lane}</div>
                  </Link>
                ))}
              </div>
              <div className="why">
                <div>
                  <div className="k">Cách vận hành</div>
                  <div>{c.play}</div>
                </div>
                <div>
                  <div className="k">Điểm mạnh</div>
                  <div style={{ color: 'var(--ok)', marginBottom: 4 }}>✓ {c.pro}</div>
                  <div className="k" style={{ marginTop: 8 }}>Điểm yếu</div>
                  <div style={{ color: 'var(--bad)' }}>✗ {c.con}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
