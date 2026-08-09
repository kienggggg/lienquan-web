import fs from 'fs';
import path from 'path';
import Link from 'next/link';
import CompsListClient from './CompsListClient';

export const dynamic = 'force-dynamic';

function readComps() {
  const filePath = path.join(process.cwd(), '..', 'data', 'comps.json');
  try {
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    const data = JSON.parse(fileContent);
    return data.comps || [];
  } catch (error) {
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
    return {};
  }
}

function readItemsData() {
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

export default async function CompsPage() {
  const comps = readComps();
  const heroesMap = readHeroesMap();
  const { garenaItems, roleBuilds } = readItemsData();

  return (
    <div className="hwrap">
      {/* Header Banner */}
      <header className="page-header-esports" style={{ marginBottom: 20 }}>
        <div className="badge-meta-live">
          <span className="live-pulse"></span>
          <span>META COMPS 2026 • ĐỘI HÌNH LEO RANK THÁCH ĐẤU</span>
        </div>
        <h1 className="header-title-gradient">Top Đội Hình Meta Liên Quân (Team Comps Tier List)</h1>
        <div className="header-subtitle">
          Bảng phân tích và xếp hạng các bộ khung đội hình 5 vị trí tối ưu nhất hiện tại. Được tính toán dựa trên độ phối hợp chiêu thức (Synergy), chất tướng gánh kèo và khả năng giao tranh tổng.
        </div>
      </header>

      {/* Interactive MetaTFT-style Comps List */}
      <CompsListClient
        comps={comps}
        heroesMap={heroesMap}
        garenaItems={garenaItems}
        roleBuilds={roleBuilds}
      />
    </div>
  );
}
