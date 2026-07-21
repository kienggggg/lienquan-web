import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

const MEDAL = ['🥇', '🥈', '🥉'];

export default async function PlayersPage() {
  const users = await prisma.user.findMany({
    orderBy: [{ reputation: 'desc' }, { createdAt: 'asc' }],
    take: 100,
    include: { _count: { select: { articles: true, comments: true } } },
  });

  return (
    <div className="hwrap">
      <h1>Bảng xếp hạng người chơi</h1>
      <p className="sub">
        Xếp theo <b>uy tín</b> — điểm nhận được khi bài viết/giáo án của bạn được cộng đồng bình luận, tương tác.
        Đóng góp nội dung chất lượng để leo hạng!
      </p>

      {users.length === 0 ? (
        <div className="empty" style={{ marginTop: 20 }}>
          Chưa có người dùng nào. <a href="/register" style={{ color: 'var(--accent)' }}>Đăng ký</a> và viết bài để lên bảng vàng!
        </div>
      ) : (
        <div className="statwrap" style={{ marginTop: 14 }}>
          <table className="stats">
            <thead>
              <tr>
                <th style={{ width: 60 }}>#</th>
                <th>Người chơi</th>
                <th>🏅 Uy tín</th>
                <th>📝 Bài viết</th>
                <th>💬 Bình luận</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u, i) => (
                <tr key={u.id}>
                  <td style={{ fontWeight: 800 }}>{MEDAL[i] ?? i + 1}</td>
                  <td>
                    <b>{u.name}</b>
                    {u.role === 'ADMIN' && (
                      <span className="tbadge" style={{ background: 'var(--accent)', marginLeft: 8 }}>ADMIN</span>
                    )}
                  </td>
                  <td style={{ color: 'var(--gold)', fontWeight: 700 }}>{u.reputation}</td>
                  <td>{u._count.articles}</td>
                  <td>{u._count.comments}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
