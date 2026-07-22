import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import VoteButton from './vote-button';

export const dynamic = 'force-dynamic';

export default async function ArticlesPage({
  searchParams,
}: {
  searchParams: Promise<{ sort?: string }>;
}) {
  const { sort } = await searchParams;
  const sortBy = sort === 'hot' ? 'hot' : 'new';
  const session = await getSession();

  const articles = await prisma.article.findMany({
    include: {
      author: true,
      votes: true,
      _count: { select: { comments: true, votes: true } },
    },
  });

  // Sắp xếp
  if (sortBy === 'hot') {
    articles.sort((a, b) => b._count.votes - a._count.votes);
  } else {
    articles.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

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

      {/* Tabs Sort */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', borderBottom: '1px solid var(--color-line)', paddingBottom: '8px' }}>
        <Link
          href="/articles?sort=new"
          style={{
            padding: '6px 16px',
            borderRadius: '8px',
            background: sortBy === 'new' ? 'var(--color-paper-3)' : 'transparent',
            color: sortBy === 'new' ? 'var(--color-accent)' : 'var(--color-ink-sub)',
            fontWeight: 'bold',
            fontSize: '14px',
          }}
        >
          🆕 Mới nhất
        </Link>
        <Link
          href="/articles?sort=hot"
          style={{
            padding: '6px 16px',
            borderRadius: '8px',
            background: sortBy === 'hot' ? 'var(--color-paper-3)' : 'transparent',
            color: sortBy === 'hot' ? 'var(--color-accent)' : 'var(--color-ink-sub)',
            fontWeight: 'bold',
            fontSize: '14px',
          }}
        >
          🔥 Nổi bật
        </Link>
      </div>

      {articles.length === 0 ? (
        <div className="empty" style={{ marginTop: 20 }}>Chưa có bài viết nào. Hãy là người đầu tiên!</div>
      ) : (
        <div className="alist">
          {articles.map((a) => {
            const initiallyVoted = session ? a.votes.some((v: any) => v.userId === session.userId) : false;
            return (
              <div className="acard" key={a.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px' }}>
                <div style={{ flex: 1 }}>
                  <h3><Link href={`/articles/${a.id}`}>{a.title}</Link></h3>
                  <div className="am">
                    ✍️ {a.author.name} · {new Date(a.createdAt).toLocaleDateString('vi-VN')}
                    {' · '}💬 {a._count.comments}
                  </div>
                </div>
                <div>
                  <VoteButton
                    articleId={a.id}
                    initialVotes={a._count.votes}
                    initiallyVoted={initiallyVoted}
                    isLoggedIn={!!session}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
