import Link from 'next/link';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import CommentForm from './comment-form';

export const dynamic = 'force-dynamic';

export default async function ArticleDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getSession();
  const article = await prisma.article.findUnique({
    where: { id },
    include: {
      author: true,
      comments: { orderBy: { createdAt: 'asc' }, include: { author: true } },
    },
  });
  if (!article) notFound();

  return (
    <div className="hwrap article" style={{ maxWidth: 820, margin: '0 auto' }}>
      <div className="crumbs"><Link href="/articles">← Cẩm nang</Link></div>
      <h1>{article.title}</h1>
      <div className="am" style={{ color: 'var(--muted)', fontSize: 13, marginBottom: 16 }}>
        ✍️ {article.author.name} · 🏅 {article.author.reputation} uy tín ·{' '}
        {new Date(article.createdAt).toLocaleDateString('vi-VN')}
      </div>

      <div className="afield" style={{ whiteSpace: 'pre-wrap', fontSize: 15, lineHeight: 1.7 }}>
        {article.content}
      </div>

      <div className="afield">
        <div className="lbl">💬 Bình luận ({article.comments.length})</div>
        {article.comments.length === 0 && (
          <p className="empty">Chưa có bình luận. Hãy là người đầu tiên góp ý!</p>
        )}
        {article.comments.map((c) => (
          <div className="acard" key={c.id} style={{ marginTop: 10 }}>
            <div className="am" style={{ fontSize: 12, color: 'var(--muted)' }}>
              👤 {c.author.name} · {new Date(c.createdAt).toLocaleDateString('vi-VN')}
            </div>
            <div style={{ marginTop: 4, whiteSpace: 'pre-wrap' }}>{c.content}</div>
          </div>
        ))}

        {session ? (
          <CommentForm articleId={article.id} />
        ) : (
          <p className="empty" style={{ marginTop: 14 }}>
            <Link href="/login" style={{ color: 'var(--accent)' }}>Đăng nhập</Link> để bình luận.
          </p>
        )}
      </div>
    </div>
  );
}
