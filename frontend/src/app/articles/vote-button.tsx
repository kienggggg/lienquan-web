'use client';

import { useState, useTransition } from 'react';
import { submitVote } from '@/app/actions/votes';

export default function VoteButton({
  articleId,
  initialNetVotes,
  initialVoteValue, // 1 (Up), -1 (Down), 0 (None)
  isLoggedIn,
}: {
  articleId: string;
  initialNetVotes: number;
  initialVoteValue: number;
  isLoggedIn: boolean;
}) {
  const [netVotes, setNetVotes] = useState(initialNetVotes);
  const [voteValue, setVoteValue] = useState(initialVoteValue);
  const [isPending, startTransition] = useTransition();

  const handleVote = (e: React.MouseEvent, value: number) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isLoggedIn) {
      alert('Bạn cần đăng nhập để vote cho bài viết này.');
      window.location.href = '/login';
      return;
    }

    startTransition(async () => {
      // Optimistic UI updates
      const isUnvoting = voteValue === value;
      const nextVoteValue = isUnvoting ? 0 : value;
      
      let nextNetVotes = netVotes;
      if (isUnvoting) {
        nextNetVotes -= voteValue;
      } else {
        // Nếu đã vote trước đó, bù trừ
        nextNetVotes = netVotes - voteValue + value;
      }
      
      setVoteValue(nextVoteValue);
      setNetVotes(nextNetVotes);

      const res = await submitVote(articleId, value);
      if (res.error) {
        // Rollback
        setVoteValue(voteValue);
        setNetVotes(netVotes);
        alert(res.error);
      }
    });
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--color-paper-2)', borderRadius: '20px', border: '1px solid var(--color-line)', padding: '4px' }}>
      <button
        onClick={(e) => handleVote(e, 1)}
        disabled={isPending}
        style={{
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          width: '32px', height: '32px', borderRadius: '16px', border: 'none',
          background: voteValue === 1 ? 'var(--color-accent)' : 'transparent',
          color: voteValue === 1 ? '#fff' : 'var(--color-ink-sub)',
          cursor: isPending ? 'wait' : 'pointer', transition: 'all 0.2s ease',
        }}
        title="Thích"
      >
        ▲
      </button>
      
      <span style={{ fontSize: '14px', fontWeight: 'bold', color: 'var(--color-ink)', minWidth: '24px', textAlign: 'center' }}>
        {netVotes}
      </span>

      <button
        onClick={(e) => handleVote(e, -1)}
        disabled={isPending}
        style={{
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          width: '32px', height: '32px', borderRadius: '16px', border: 'none',
          background: voteValue === -1 ? 'var(--color-bad)' : 'transparent',
          color: voteValue === -1 ? '#fff' : 'var(--color-ink-sub)',
          cursor: isPending ? 'wait' : 'pointer', transition: 'all 0.2s ease',
        }}
        title="Không thích"
      >
        ▼
      </button>
    </div>
  );
}
