'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import { saveTeam } from '@/app/actions/teams';

export interface HeroMinimal {
  id: string;
  name: string;
  img: string;
  roles: string[];
  lane?: string;
  winrate?: number;
}

const LANES = [
  { id: 'Tà Thần', label: 'Tà Thần (Top)', icon: '⚔️' },
  { id: 'Rừng', label: 'Rừng (Jungle)', icon: '🌲' },
  { id: 'Trung', label: 'Trung (Mid)', icon: '🔮' },
  { id: 'Rồng', label: 'Rồng (ADC)', icon: '🏹' },
  { id: 'Hỗ trợ', label: 'Hỗ trợ (Support)', icon: '🛡️' },
];

function heroMatchesLane(h: HeroMinimal, laneId: string): boolean {
  if (h.lane) return h.lane === laneId;
  const roles = h.roles || [];
  if (laneId === 'Tà Thần') return roles.includes('Đấu sĩ') || roles.includes('Đỡ đòn') || roles.includes('Sát thủ');
  if (laneId === 'Rừng') return roles.includes('Sát thủ') || roles.includes('Đấu sĩ');
  if (laneId === 'Trung') return roles.includes('Pháp sư');
  if (laneId === 'Rồng') return roles.includes('Xạ thủ');
  if (laneId === 'Hỗ trợ') return roles.includes('Hỗ trợ') || roles.includes('Trợ thủ') || roles.includes('Đỡ đòn');
  return true;
}

export default function TeamBuilderClient({
  heroes,
  session,
}: {
  heroes: HeroMinimal[];
  session: { userId: string; name: string } | null;
}) {
  const [selected, setSelected] = useState<Record<string, HeroMinimal | null>>({
    'Tà Thần': null,
    'Rừng': null,
    'Trung': null,
    'Rồng': null,
    'Hỗ trợ': null,
  });
  const [activeLane, setActiveLane] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [teamName, setTeamName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleSelect = (hero: HeroMinimal) => {
    if (!activeLane) return;
    setSelected((prev) => ({ ...prev, [activeLane]: hero }));
    setActiveLane(null);
    setSearch('');
  };

  const handleRemove = (laneId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelected((prev) => ({ ...prev, [laneId]: null }));
  };

  const handleSave = () => {
    setError(null);
    setSuccess(null);

    if (!session) {
      setError('BẠN_CẦN_ĐĂNG_NHẬP');
      return;
    }

    const composition = LANES.map((l) => selected[l.id]?.id).filter(Boolean) as string[];
    if (composition.length === 0) {
      setError('Vui lòng chọn ít nhất 1 tướng vào đội hình.');
      return;
    }

    if (!teamName.trim() || teamName.trim().length < 2) {
      setError('Vui lòng nhập tên đội hình (ít nhất 2 ký tự).');
      return;
    }

    startTransition(async () => {
      const res = await saveTeam(teamName, composition);
      if (res.error) {
        setError(res.error);
      } else {
        setSuccess('Đã lưu đội hình thành công!');
        setTeamName('');
        setSelected({
          'Tà Thần': null,
          'Rừng': null,
          'Trung': null,
          'Rồng': null,
          'Hỗ trợ': null,
        });
      }
    });
  };

  const filteredHeroes = heroes.filter((h) => {
    const matchSearch = (h.name || h.id).toLowerCase().includes(search.toLowerCase());
    if (!activeLane) return matchSearch;
    return matchSearch && heroMatchesLane(h, activeLane);
  });

  return (
    <div className="builder-container">
      {/* 5 Slot Bar */}
      <div className="lane-slots-grid">
        {LANES.map((lane) => {
          const hero = selected[lane.id];
          return (
            <div
              key={lane.id}
              className={`lane-slot-card ${hero ? 'has-hero' : ''}`}
              onClick={() => setActiveLane(lane.id)}
            >
              <div className="lane-header">
                <span>{lane.icon}</span> <span>{lane.label.split(' ')[0]}</span>
              </div>
              {hero ? (
                <div className="selected-hero-box">
                  <img src={hero.img} alt={hero.name} className="hero-img" />
                  <div className="hero-info">
                    <span className="hero-name">{hero.name}</span>
                    <span className="hero-role">{hero.roles?.join(', ')}</span>
                  </div>
                  <button
                    className="remove-btn"
                    onClick={(e) => handleRemove(lane.id, e)}
                    title="Bỏ chọn"
                  >
                    ✕
                  </button>
                </div>
              ) : (
                <div className="empty-slot-btn">
                  <span>+ Chọn tướng</span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Save Action Form */}
      <div className="spanel save-team-panel">
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
          <input
            type="text"
            className="afield"
            placeholder="Nhập tên đội hình (ví dụ: Đội hình Ep-ic Combat...)"
            value={teamName}
            onChange={(e) => setTeamName(e.target.value)}
            style={{ flex: 1, minWidth: '220px' }}
          />
          <button
            className="abtn"
            onClick={handleSave}
            disabled={isPending}
            style={{ background: 'var(--color-accent)', cursor: isPending ? 'wait' : 'pointer' }}
          >
            {isPending ? 'Đang lưu...' : '💾 Lưu đội hình'}
          </button>
        </div>

        {error === 'BẠN_CẦN_ĐĂNG_NHẬP' && (
          <div className="warn" style={{ marginTop: '12px' }}>
            🔒 Bạn cần <Link href="/login" style={{ color: 'var(--color-accent)', textDecoration: 'underline' }}>Đăng nhập</Link> để lưu đội hình này vào tài khoản.
          </div>
        )}
        {error && error !== 'BẠN_CẦN_ĐĂNG_NHẬP' && (
          <div className="warn" style={{ marginTop: '12px' }}>
            ⚠️ {error}
          </div>
        )}
        {success && (
          <div className="ok-box" style={{ marginTop: '12px', color: 'var(--color-ok)' }}>
            ✅ {success}
          </div>
        )}
      </div>

      {/* Modal / Selector Panel */}
      {activeLane && (
        <div className="hero-selector-overlay" onClick={() => setActiveLane(null)}>
          <div className="hero-selector-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Chọn tướng cho đường {activeLane}</h3>
              <button className="close-btn" onClick={() => setActiveLane(null)}>✕</button>
            </div>

            <div className="modal-search">
              <input
                type="text"
                className="afield"
                placeholder="Tìm kiếm tướng..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                autoFocus
              />
            </div>

            <div className="modal-hero-grid">
              {filteredHeroes.map((h) => (
                <div
                  key={h.id}
                  className="selector-hero-card"
                  onClick={() => handleSelect(h)}
                >
                  <img src={h.img} alt={h.name} className="av" />
                  <div className="nm">{h.name}</div>
                  <div className="ro">{h.roles?.[0]}</div>
                </div>
              ))}
              {filteredHeroes.length === 0 && (
                <div style={{ gridColumn: '1 / -1', padding: '24px', textAlign: 'center', color: 'var(--color-ink-sub)' }}>
                  Không tìm thấy tướng phù hợp.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
