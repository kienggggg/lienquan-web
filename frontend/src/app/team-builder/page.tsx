import fs from 'fs';
import path from 'path';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import TeamBuilderClient, { HeroMinimal } from './builder';

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
      roles: h.roles || [],
      lane: h.lane,
      winrate: h.winrate,
    }));
  } catch (error) {
    console.error('Failed to read heroes data in team-builder', error);
    return [];
  }
}

export default async function TeamBuilderPage() {
  const heroes = await getHeroes();
  const session = await getSession();

  const heroesMap: Record<string, HeroMinimal> = {};
  for (const h of heroes) {
    heroesMap[h.id] = h;
  }

  let myTeams: any[] = [];
  if (session?.userId) {
    myTeams = await prisma.team.findMany({
      where: { authorId: session.userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  return (
    <div className="hwrap">
      <header style={{ paddingBottom: '24px' }}>
        <h1>🛠️ Xây Dựng Đội Hình</h1>
        <div className="sub">
          Tự do tạo và phối hợp đội hình 5 vị tướng theo từng đường. Lưu lại chiến thuật để chia sẻ cùng cộng đồng.
        </div>
      </header>

      <TeamBuilderClient heroes={heroes} session={session ? { userId: session.userId, name: session.name } : null} />

      {/* My Saved Teams Section */}
      {session && (
        <section style={{ marginTop: '48px' }}>
          <h2 style={{ fontSize: '20px', marginBottom: '16px', color: 'var(--color-ink)' }}>
            📋 Đội hình của tôi ({myTeams.length})
          </h2>

          {myTeams.length === 0 ? (
            <div className="spanel" style={{ color: 'var(--color-ink-sub)', textAlign: 'center', padding: '32px' }}>
              Bạn chưa lưu đội hình nào. Hãy chọn tướng và nhấn &quot;Lưu đội hình&quot; ở trên nhé!
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
              {myTeams.map((team: any) => {
                let compIds: string[] = [];
                try {
                  compIds = JSON.parse(team.composition || '[]');
                } catch {
                  compIds = [];
                }

                return (
                  <div key={team.id} className="spanel" style={{ padding: '16px' }}>
                    <div style={{ fontWeight: 'bold', fontSize: '16px', color: 'var(--color-accent)', marginBottom: '12px' }}>
                      {team.name}
                    </div>
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                      {compIds.map((hid: string, idx: number) => {
                        const hero = heroesMap[hid];
                        return (
                          <div key={idx} style={{ textAlign: 'center' }}>
                            {hero ? (
                              <Link href={`/hero/${hero.id}`} title={hero.name}>
                                <img
                                  src={hero.img}
                                  alt={hero.name}
                                  style={{ width: '40px', height: '40px', borderRadius: '8px', border: '1px solid var(--color-line)' }}
                                />
                              </Link>
                            ) : (
                              <div
                                style={{
                                  width: '40px',
                                  height: '40px',
                                  borderRadius: '8px',
                                  background: 'var(--color-paper-3)',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  fontSize: '12px',
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
                    <div style={{ fontSize: '12px', color: 'var(--color-ink-sub)', marginTop: '12px' }}>
                      Đã lưu: {new Date(team.createdAt).toLocaleDateString('vi-VN')}
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
