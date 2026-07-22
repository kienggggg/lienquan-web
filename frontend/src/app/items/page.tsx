import fs from 'fs';
import path from 'path';
import ItemsClient from './items-client';

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
      <header style={{ marginBottom: '24px' }}>
        <h1>Trang bị Liên Quân</h1>
        <div className="sub">Danh sách trang bị tổng hợp từ hệ thống, hỗ trợ tra cứu và lọc theo loại.</div>
      </header>

      <ItemsClient items={items} />
    </div>
  );
}
