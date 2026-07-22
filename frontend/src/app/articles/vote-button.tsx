'use client';

import { useState, useTransition } from 'react';
import { toggleVote } from '@/app/actions/votes';

export default function VoteButton({
  articleId,
  initialVotes,
  initiallyVoted,
  isLoggedIn,
}: {
  articleId: string;
  initialVotes: number;
  initiallyVoted: boolean;
  isLoggedIn: boolean;
}) {
  const [votes, setVotes] = useState(initialVotes);
  const [voted, setVoted] = useState(initiallyVoted);
  const [isPending, startTransition] = useTransition();

  const handleVote = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isLoggedIn) {
      alert('Bạn cần đăng nhập để vote cho bài viết này.');
      window.location.href = '/login';
      return;
    }

    startTransition(async () => {
      // Optimistic UI updates
      const nextVoted = !voted;
      const nextVotes = nextVoted ? votes + 1 : votes - 1;
      setVoted(nextVoted);
      setVotes(nextVotes);

      const res = await toggleVote(articleId);
      if (res.error) {
        // Rollback
        setVoted(voted);
        setVotes(votes);
        alert(res.error);
      } else if (typeof res.voted === 'boolean') {
        setVoted(res.voted);
      }
    });
  };

  return (
    <button
      onClick={handleVote}
      className={`vote-btn ${voted ? 'voted' : ''}`}
      disabled={isPending}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        padding: '6px 12px',
        borderRadius: '20px',
        border: '1px solid var(--color-line)',
        background: voted ? 'var(--color-accent)' : 'var(--color-paper-3)',
        color: voted ? '#fff' : 'var(--color-ink)',
        fontSize: '13px',
        fontWeight: 'bold',
        cursor: isPending ? 'wait' : 'pointer',
        transition: 'all 0.2s ease',
      }}
    >
      👍 {votes}
    </button>
  );
}
