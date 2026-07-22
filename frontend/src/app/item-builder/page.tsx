import fs from 'fs';
import path from 'path';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import ItemBuilderClient, { HeroMinimal, ItemMinimal } from './builder-client';
import DeleteBuildButton from './delete-button';

export const dynamic = 'force-dynamic';

async function getHeroes(): Promise<HeroMinimal[]> {
  const filePath = path.join(process.cwd(), '..', 'data', 'heroes.json');
  try {
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    const data = JSON.parse(fileContent);
    let list: any[] = [];
    if (Array.isArray(data.heroes)) list = data.heroes;
    else if (Array.isArray(data)) list = data;
    else {
      list = Object.entries(data.heroes || data).map(([id, d]: [string, any]) => ({ id, ...d }));
    }
    return list.map((h: any) => ({
      id: h.id,
      name: h.name || h.id,
      img: h.img || '',
    })).sort((a, b) => a.name.localeCompare(b.name, 'vi'));
  } catch (error) {
    console.error('Failed to read heroes data in item-builder', error);
    return [];
  }
}

async function getItems(): Promise<ItemMinimal[]> {
  const filePath = path.join(process.cwd(), '..', 'data', 'garena_items.json');
  try {
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    const data = JSON.parse(fileContent);
    const list = data.items || [];
    return list.map((it: any) => ({
      id: it.id,
      name: it.name,
      type: it.type,
      icon: it.icon,
    }));
  } catch (error) {
    console.error('Failed to read items data in item-builder', error);
    return [];
  }
}

export default async function ItemBuilderPage() {
  const heroes = await getHeroes();
  const items = await getItems();
  const session = await getSession();

  const heroesMap: Record<string, HeroMinimal> = {};
  for (const h of heroes) {
    heroesMap[h.id] = h;
  }

  const itemsMap: Record<string, ItemMinimal> = {};
  for (const it of items) {
    itemsMap[it.id] = it;
  }

  let myBuilds: any[] = [];
  if (session?.userId) {
    myBuilds = await prisma.itemBuild.findMany({
      where: { authorId: session.userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  return (
    <div className="hwrap">
      <header style={{ paddingBottom: '24px' }}>
        <h1>🛠️ Trình Tạo Bộ Trang Bị</h1>
        <div className="sub">
          Tự do sáng tạo và thiết lập 6 món trang bị tối ưu cho từng vị tướng theo phong cách chơi riêng biệt của bạn.
        </div>
      </header>

      <ItemBuilderClient
        heroes={heroes}
        items={items}
        session={session ? { userId: session.userId, name: session.name } : null}
      />

      {/* My Saved Builds */}
      {session && (
        <section style={{ marginTop: '48px' }}>
          <h2 style={{ fontSize: '20px', marginBottom: '16px', color: 'var(--color-ink)' }}>
            📋 Bộ trang bị của tôi ({myBuilds.length})
          </h2>

          {myBuilds.length === 0 ? (
            <div className="spanel" style={{ color: 'var(--color-ink-sub)', textAlign: 'center', padding: '32px' }}>
              Bạn chưa lưu bộ trang bị nào. Hãy chọn tướng và trang bị ở trên rồi nhấn &quot;Lưu bộ trang bị&quot; nhé!
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px' }}>
              {myBuilds.map((build: any) => {
                const hero = heroesMap[build.heroId];
                let itemIds: string[] = [];
                try {
                  itemIds = JSON.parse(build.itemIds || '[]');
                } catch {
                  itemIds = [];
                }

                return (
                  <div key={build.id} className="spanel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                        {hero && (
                          <img
                            src={hero.img}
                            alt={hero.name}
                            style={{ width: '40px', height: '40px', borderRadius: '8px', border: '1px solid var(--color-line)' }}
                          />
                        )}
                        <div>
                          <div style={{ fontWeight: 'bold', fontSize: '15px', color: 'var(--color-accent)' }}>
                            {build.title}
                          </div>
                          <div style={{ fontSize: '12px', color: 'var(--color-ink-sub)' }}>
                            Tướng: {hero?.name || build.heroId}
                          </div>
                        </div>
                      </div>
                      <DeleteBuildButton id={build.id} />
                    </div>

                    {/* 6 Icons Grid */}
                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                      {itemIds.map((iid, idx) => {
                        const item = itemsMap[iid];
                        return (
                          <div key={idx} style={{ textAlign: 'center' }}>
                            {item ? (
                              <img
                                src={item.icon}
                                alt={item.name}
                                title={item.name}
                                style={{
                                  width: '36px',
                                  height: '36px',
                                  borderRadius: '6px',
                                  border: '1px solid var(--color-line)',
                                }}
                              />
                            ) : (
                              <div
                                style={{
                                  width: '36px',
                                  height: '36px',
                                  borderRadius: '6px',
                                  background: 'var(--color-paper-3)',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  fontSize: '10px',
                                  color: 'var(--color-ink-sub)',
                                }}
                              >
                                ?
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {build.note && (
                      <div
                        style={{
                          fontSize: '12px',
                          color: 'var(--color-ink-sub)',
                          background: 'var(--color-paper-3)',
                          padding: '8px 12px',
                          borderRadius: '8px',
                          whiteSpace: 'pre-wrap',
                          lineHeight: '1.5',
                        }}
                      >
                        📝 {build.note}
                      </div>
                    )}

                    <div style={{ fontSize: '11px', color: 'var(--color-ink-sub)', marginTop: 'auto' }}>
                      Đã tạo: {new Date(build.createdAt).toLocaleDateString('vi-VN')}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      )}
    </div>
  );
}
