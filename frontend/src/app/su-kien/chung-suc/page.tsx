import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import CodeItemCard from './CodeItemCard';
import CreateCodeForm from './CreateCodeForm';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

interface PageProps {
  searchParams: Promise<{ type?: string }>;
}

export default async function ChungSucPage({ searchParams }: PageProps) {
  const session = await getSession();
  const params = await searchParams;
  const currentType = params.type || 'ALL';

  // Lấy các mã chưa bị dùng (isUsed = false)
  const whereCondition: any = { isUsed: false };
  if (currentType !== 'ALL') {
    whereCondition.type = currentType;
  }

  const codesRaw = await prisma.eventCode.findMany({
    where: whereCondition,
    orderBy: { createdAt: 'desc' },
    take: 50,
    include: {
      author: { select: { name: true, reputation: true } },
      ratings: {
        orderBy: { createdAt: 'desc' },
        include: { author: { select: { name: true } } },
      },
    },
  });

  const codes = codesRaw.map(c => ({
    ...c,
    author: { ...c.author, name: c.author.name || 'Vô danh' },
    ratings: c.ratings.map(r => ({ ...r, author: { ...r.author, name: r.author.name || 'Vô danh' } }))
  }));

  return (
    <div className="hwrap">
      <header>
        <div className="crumbs">
          <Link href="/su-kien">Sự kiện</Link> › <span>Chợ Mã Sự Kiện & Chung Sức</span>
        </div>
        <h1>Chợ Chia Sẻ Mã Sự Kiện (Chung Sức / Bắn Bi / Săn Thẻ)</h1>
        <p className="sub">
          Nơi tập trung mã sự kiện Liên Quân cho cộng đồng! Dán mã của bạn để nhận sự trợ giúp hoặc copy mã của người khác.
        </p>
      </header>

      {/* Form đăng mã sự kiện */}
      <div className="panel" style={{ margin: '16px 0 24px' }}>
        <h2 style={{ fontSize: 14, color: 'var(--accent)', marginBottom: 10 }}>➕ Đăng Mã Sự Kiện Mới</h2>
        {session ? (
          <CreateCodeForm />
        ) : (
          <div className="empty">
            Bạn cần <Link href="/login" style={{ color: 'var(--accent)', fontWeight: 'bold' }}>Đăng nhập</Link> để đăng mã chia sẻ với cộng đồng.
          </div>
        )}
      </div>

      {/* Tabs lọc loại mã */}
      <div className="bar" style={{ marginBottom: 16 }}>
        <Link href="/su-kien/chung-suc" className={`button ${currentType === 'ALL' ? 'on' : ''}`}>
          Tất cả mã
        </Link>
        <Link href="/su-kien/chung-suc?type=CHUNG_SUC" className={`button ${currentType === 'CHUNG_SUC' ? 'on' : ''}`}>
          🤝 Chung Sức
        </Link>
        <Link href="/su-kien/chung-suc?type=BAN_BI" className={`button ${currentType === 'BAN_BI' ? 'on' : ''}`}>
          🟢 Bắn Bi
        </Link>
        <Link href="/su-kien/chung-suc?type=SAN_THE" className={`button ${currentType === 'SAN_THE' ? 'on' : ''}`}>
          🎁 Săn Thẻ (Mã 1 Lần)
        </Link>
      </div>

      {/* Danh sách mã */}
      {codes.length === 0 ? (
        <div className="empty" style={{ padding: 40, marginTop: 10 }}>
          Chưa có mã nào trong mục này. Hãy là người đầu tiên đăng mã chia sẻ nhé!
        </div>
      ) : (
        <div className="alist" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 16 }}>
          {codes.map((item) => (
            <CodeItemCard key={item.id} item={item} currentUserId={session?.userId as string} />
          ))}
        </div>
      )}
    </div>
  );
}
