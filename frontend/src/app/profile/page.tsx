import Link from 'next/link';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { logoutAction } from '@/app/actions/auth';

export const dynamic = 'force-dynamic';

export default async function ProfilePage() {
  const session = await getSession();
  if (!session?.userId) redirect('/login');

  const user = await prisma.user.findUnique({
    where: { id: session.userId as string },
    include: {
      articles: { orderBy: { createdAt: 'desc' }, include: { _count: { select: { comments: true } } } },
      _count: { select: { articles: true, comments: true, teams: true } },
    },
  });
  if (!user) redirect('/login');

  return (
    <div className="hwrap">
      {/* Thẻ hồ sơ */}
      <div className="panel" style={{ display: 'flex', gap: 18, alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{
          width: 72, height: 72, borderRadius: 16, background: 'var(--accent)', color: '#0e1420',
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 30, fontWeight: 800, flex: 'none',
        }}>
          {(user.name || 'Vô danh').slice(0, 1).toUpperCase()}
        </div>
        <div style={{ flex: 1, minWidth: 200 }}>
          <h1 style={{ fontSize: 24 }}>
            {user.name || 'Vô danh'}
            {user.role === 'ADMIN' && (
              <span className="tbadge" style={{ background: 'var(--accent)', marginLeft: 8 }}>ADMIN</span>
            )}
          </h1>
          <div className="am" style={{ color: 'var(--muted)', fontSize: 13, marginTop: 4 }}>
            ✉️ {user.email} · Tham gia {new Date(user.createdAt).toLocaleDateString('vi-VN')}
          </div>
        </div>
        <form action={logoutAction}>
          <button type="submit" style={{
            background: 'transparent', border: '1px solid var(--bad)', color: 'var(--bad)',
            borderRadius: 8, padding: '9px 16px', fontWeight: 700, cursor: 'pointer',
          }}>
            Đăng xuất
          </button>
        </form>
      </div>

      {/* Chỉ số */}
      <div className="kpirow" style={{ margin: '18px 0' }}>
        <div className="kpi"><b style={{ color: 'var(--gold)' }}>{user.reputation}</b><span>🏅 Uy tín</span></div>
        <div className="kpi"><b>{user._count.articles}</b><span>📝 Bài viết</span></div>
        <div className="kpi"><b>{user._count.comments}</b><span>💬 Bình luận</span></div>
        <div className="kpi"><b>{user._count.teams}</b><span>🛡️ Đội hình</span></div>
      </div>

      {/* Bài viết của tôi */}
      <div className="afield">
        <div className="lbl" style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span>Bài viết của tôi</span>
          <Link href="/articles/new" style={{ color: 'var(--accent)', fontSize: 12 }}>+ Viết bài mới</Link>
        </div>
        {user.articles.length === 0 ? (
          <p className="empty">Bạn chưa viết bài nào. <Link href="/articles/new" style={{ color: 'var(--accent)' }}>Viết bài đầu tiên →</Link></p>
        ) : (
          <div className="alist">
            {user.articles.map((a) => (
              <div className="acard" key={a.id}>
                <h3><Link href={`/articles/${a.id}`}>{a.title}</Link></h3>
                <div className="am">
                  {new Date(a.createdAt).toLocaleDateString('vi-VN')} · 💬 {a._count.comments}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
