import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';

function readItems() {
  const filePath = path.join(process.cwd(), '..', 'data', 'garena_items.json');
  try {
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    const data = JSON.parse(fileContent);
    return data.items || [];
  } catch (error) {
    console.error("Failed to read items data", error);
    return [];
  }
}

export default async function ItemsPage() {
  const items = readItems();

  return (
    <div className="hwrap">
      <header>
        <h1>Trang bị Liên Quân</h1>
        <div className="sub">Danh sách trang bị tổng hợp từ hệ thống.</div>
      </header>

      {items.length === 0 ? (
        <div className="empty" style={{ marginTop: 20 }}>
          Chưa có dữ liệu trang bị.
        </div>
      ) : (
        <div className="igrid">
          {items.map((it: any, i: number) => (
            <div className="icard" key={it.id || i}>
              <img src={it.icon} alt={it.name} />
              <div className="inm">{it.name}</div>
              <div className="ity">{it.type}</div>
              {it.level && <div className="ilv">Cấp {it.level}</div>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
