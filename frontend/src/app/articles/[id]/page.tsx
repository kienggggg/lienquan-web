import Link from 'next/link';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import CommentForm from './comment-form';
import VoteButton from '../vote-button';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';

export default async function ArticleDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getSession();
  const article = await prisma.article.findUnique({
    where: { id },
    include: {
      author: true,
      votes: true,
      comments: { orderBy: { createdAt: 'asc' }, include: { author: true } },
    },
  });
  
  if (!article) notFound();

  const netVotes = article.votes.reduce((acc: number, v: any) => acc + v.value, 0);
  const userVote = session ? article.votes.find((v: any) => v.userId === session.userId) : null;
  const initialVoteValue = userVote ? userVote.value : 0;

  // Resolve hero name
  let heroName = article.heroId;
  let heroImg = null;
  if (article.heroId) {
    const filePath = path.join(process.cwd(), '..', 'data', 'heroes.json');
    try {
      const fileContent = fs.readFileSync(filePath, 'utf-8');
      const data = JSON.parse(fileContent);
      const heroes = Array.isArray(data.heroes) ? data.heroes : Object.entries(data.heroes || data).map(([id, d]: any) => ({ id, ...d }));
      const h = heroes.find((h: any) => h.id === article.heroId);
      if (h) {
        heroName = h.name || h.id;
        heroImg = h.img;
      }
    } catch(e) {}
  }

  const TIER_COLORS: any = {
    S: 'var(--color-ok)',
    A: 'var(--color-accent)',
    B: 'var(--color-gold)',
    C: 'var(--color-ink-faint)',
    D: 'var(--color-bad)'
  };

  return (
    <div className="hwrap article" style={{ maxWidth: 820, margin: '0 auto' }}>
      <div className="crumbs"><Link href="/articles">← Cẩm nang</Link></div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '16px', flexWrap: 'wrap' }}>
        <div style={{ flex: 1 }}>
          <h1 style={{ margin: 0, marginBottom: '12px' }}>{article.title}</h1>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center', marginBottom: '16px' }}>
            {article.heroId && (
              <Link href={`/hero/${article.heroId}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'var(--color-paper-2)', padding: '4px 12px 4px 4px', borderRadius: '20px', border: '1px solid var(--color-line)', color: 'var(--color-ink)', textDecoration: 'none' }}>
                {heroImg ? <img src={heroImg} alt={heroName || ''} style={{ width: '24px', height: '24px', borderRadius: '50%' }} /> : '🎯'}
                <span style={{ fontSize: '13px', fontWeight: 'bold' }}>{heroName}</span>
              </Link>
            )}
            {article.tierVote && (
              <span style={{ display: 'inline-flex', alignItems: 'center', padding: '6px 12px', borderRadius: '20px', border: '1px solid var(--color-line)', background: 'var(--color-paper-2)', fontSize: '13px', fontWeight: 'bold', color: TIER_COLORS[article.tierVote] || 'var(--color-ink)' }}>
                🏅 Tier {article.tierVote}
              </span>
            )}
          </div>
        </div>
        <div style={{ marginTop: '8px' }}>
          <VoteButton
            articleId={article.id}
            initialNetVotes={netVotes}
            initialVoteValue={initialVoteValue}
            isLoggedIn={!!session}
          />
        </div>
      </div>
      <div className="am" style={{ color: 'var(--color-ink-sub)', fontSize: 13, paddingBottom: 16, borderBottom: '1px solid var(--color-line)' }}>
        ✍️ {article.author.name} · 🏅 {article.author.reputation} uy tín ·{' '}
        {new Date(article.createdAt).toLocaleDateString('vi-VN')}
      </div>

      <div className="afield" style={{ whiteSpace: 'pre-wrap', fontSize: 15, lineHeight: 1.7, marginTop: 24 }}>
        {article.content}
      </div>

      <div className="afield" style={{ marginTop: 40 }}>
        <div className="lbl" style={{ fontSize: 16, fontWeight: 'bold', marginBottom: 16 }}>💬 Bình luận ({article.comments.length})</div>
        {article.comments.length === 0 && (
          <p className="empty" style={{ color: 'var(--color-ink-sub)' }}>Chưa có bình luận. Hãy là người đầu tiên góp ý!</p>
        )}
        {article.comments.map((c: any) => (
          <div className="acard" key={c.id} style={{ marginTop: 12, background: 'var(--color-paper-2)', padding: 16, borderRadius: 12, border: '1px solid var(--color-line)' }}>
            <div className="am" style={{ fontSize: 12, color: 'var(--color-ink-sub)' }}>
              👤 {c.author.name} · {new Date(c.createdAt).toLocaleDateString('vi-VN')}
            </div>
            <div style={{ marginTop: 8, whiteSpace: 'pre-wrap', fontSize: 14 }}>{c.content}</div>
          </div>
        ))}

        {session ? (
          <div style={{ marginTop: 24 }}><CommentForm articleId={article.id} /></div>
        ) : (
          <p className="empty" style={{ marginTop: 24, padding: 16, background: 'var(--color-paper-2)', borderRadius: 12, textAlign: 'center' }}>
            <Link href="/login" style={{ color: 'var(--color-accent)', fontWeight: 'bold' }}>Đăng nhập</Link> để tham gia thảo luận.
          </p>
        )}
      </div>
    </div>
  );
}
