import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export default async function ArticlesPage() {
  const session = await getSession();
  const articles = await prisma.article.findMany({
    orderBy: { createdAt: 'desc' },
    include: { author: true, _count: { select: { comments: true } } },
  });

  return (
    <div className="hwrap">
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
        <h1 style={{ flex: 1 }}>Cẩm nang & Bài viết</h1>
        {session ? (
          <Link href="/articles/new" className="bar"><button className="on" style={{ padding: '8px 16px' }}>✍️ Viết bài</button></Link>
        ) : (
          <Link href="/login" style={{ color: 'var(--accent)' }}>Đăng nhập để viết bài →</Link>
        )}
      </div>
      <p className="sub">Giáo án tướng, phân tích meta, mẹo leo rank do cộng đồng đóng góp.</p>

      {articles.length === 0 ? (
        <div className="empty" style={{ marginTop: 20 }}>Chưa có bài viết nào. Hãy là người đầu tiên!</div>
      ) : (
        <div className="alist">
          {articles.map((a) => (
            <div className="acard" key={a.id}>
              <h3><Link href={`/articles/${a.id}`}>{a.title}</Link></h3>
              <div className="am">
                ✍️ {a.author.name} · {new Date(a.createdAt).toLocaleDateString('vi-VN')}
                {' · '}💬 {a._count.comments}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
