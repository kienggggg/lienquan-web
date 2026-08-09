'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';

interface Hero {
  id: string;
  name?: string;
  img?: string;
  roles?: string[];
  lanes?: string[];
  lane?: string;
  winrate?: number;
  pickrate?: number;
  banrate?: number;
  role_tiers?: Record<string, string>;
  role_tiers_reason?: Record<string, string>;
  [key: string]: any;
}

interface TierListClientProps {
  heroes: Hero[];
}

export default function TierListClient({ heroes }: TierListClientProps) {
  const [selectedLane, setSelectedLane] = useState<string>('all');
  const [selectedRole, setSelectedRole] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('tier');

  // Map lane key to canonical role/lane name
  const LANE_MAP: Record<string, string[]> = {
    'rừng': ['rừng', 'jungle', 'sát thủ'],
    'trung': ['trung', 'mid', 'đường giữa', 'pháp sư'],
    'rồng': ['rồng', 'ad', 'đường rồng', 'xạ thủ'],
    'tà thần': ['tà thần', 'top', 'đường tà thần', 'đấu sĩ'],
    'hỗ trợ': ['hỗ trợ', 'support', 'trợ thủ', 'đỡ đòn', 'sp']
  };

  const filteredHeroes = useMemo(() => {
    return heroes.filter(h => {
      // Lane filter
      if (selectedLane !== 'all') {
        const heroLanes = [
          h.lane,
          ...(h.lanes || []),
          ...(h.roles || []),
          ...(h.sub_roles || [])
        ].filter(Boolean).map(l => String(l).toLowerCase());

        const targets = LANE_MAP[selectedLane] || [selectedLane];
        const matchLane = targets.some(target => heroLanes.some(l => l.includes(target)));
        if (!matchLane) return false;
      }

      // Role filter
      if (selectedRole !== 'all') {
        const heroRoles = [
          ...(h.roles || []),
          ...(h.sub_roles || []),
          h.lane
        ].filter(Boolean).map(r => String(r).toLowerCase());

        const matchRole = heroRoles.some(r => r.includes(selectedRole.toLowerCase()));
        if (!matchRole) return false;
      }

      // Search filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const name = (h.name || h.id || '').toLowerCase();
        const roleStr = (h.roles || []).join(' ').toLowerCase();
        const laneStr = String(h.lane || '').toLowerCase();
        if (!name.includes(q) && !roleStr.includes(q) && !laneStr.includes(q)) return false;
      }

      return true;
    });
  }, [heroes, selectedLane, selectedRole, searchQuery]);

  // Dynamic Tier Grouping:
  // When a specific lane/role is selected -> rank relatively so every lane has SSS+, SS, S, A, B!
  const tierGroups = useMemo(() => {
    const isFilteredByPosition = selectedLane !== 'all' || selectedRole !== 'all';
    
    const withWR = filteredHeroes.filter(h => typeof h.winrate === 'number');
    const noWR = filteredHeroes.filter(h => typeof h.winrate !== 'number');

    // Sort descending by winrate
    withWR.sort((a, b) => (b.winrate || 0) - (a.winrate || 0));

    const groups: Record<string, Hero[]> = {
      'SSS+': [],
      'SS': [],
      'S': [],
      'A': [],
      'B': [],
      '?': [...noWR]
    };

    if (isFilteredByPosition && withWR.length > 0) {
      // Relative Position Ranking (Phân bố bậc chuẩn eSports cho từng vị trí riêng biệt)
      const total = withWR.length;
      withWR.forEach((h, idx) => {
        const percentile = idx / total;
        if (percentile < 0.15 || idx === 0) {
          groups['SSS+'].push(h);
        } else if (percentile < 0.35) {
          groups['SS'].push(h);
        } else if (percentile < 0.65) {
          groups['S'].push(h);
        } else if (percentile < 0.85) {
          groups['A'].push(h);
        } else {
          groups['B'].push(h);
        }
      });
    } else {
      // General Ranking (Xếp hạng toàn server theo mốc điểm tuyệt đối)
      withWR.forEach(h => {
        const wr = h.winrate || 0;
        if (wr >= 53.5) groups['SSS+'].push(h);
        else if (wr >= 52.0) groups['SS'].push(h);
        else if (wr >= 50.5) groups['S'].push(h);
        else if (wr >= 49.0) groups['A'].push(h);
        else groups['B'].push(h);
      });
    }

    // Sort heroes within each tier by selected sort mode
    Object.keys(groups).forEach(key => {
      groups[key].sort((a, b) => {
        if (sortBy === 'winrate') {
          return (b.winrate || 0) - (a.winrate || 0);
        } else if (sortBy === 'name') {
          return (a.name || a.id).localeCompare(b.name || b.id);
        }
        return (b.winrate || 0) - (a.winrate || 0);
      });
    });

    return groups;
  }, [filteredHeroes, selectedLane, selectedRole, sortBy]);

  const TIER_ORDER = [
    { key: 'SSS+', label: 'SSS+', sub: 'BÁ CHỦ META', color: '#FFB800' },
    { key: 'SS', label: 'SS', sub: 'SIÊU MẠNH LỰC', color: '#00F0FF' },
    { key: 'S', label: 'S', sub: 'CÂN BẰNG TỐT', color: '#10B981' },
    { key: 'A', label: 'A', sub: 'ỔN ĐỊNH', color: '#A855F7' },
    { key: 'B', label: 'B', sub: 'KÉO RANK KHÓ', color: '#EF4444' },
    { key: '?', label: '?', sub: 'CHƯA CÓ SỐ LIỆU', color: '#94A3B8' }
  ];

  const getPositionTitle = () => {
    if (selectedLane === 'rừng') return 'Đi Rừng (Jungle)';
    if (selectedLane === 'trung') return 'Đường Giữa (Mid)';
    if (selectedLane === 'rồng') return 'Đường Rồng (AD Carry)';
    if (selectedLane === 'tà thần') return 'Đường Tà Thần (Solo Top)';
    if (selectedLane === 'hỗ trợ') return 'Trợ Thủ / Đỡ Đòn (Support)';
    if (selectedRole !== 'all') return `Vai Trò ${selectedRole.toUpperCase()}`;
    return 'Toàn Bộ Máy Chủ (Tổng Hợp)';
  };

  return (
    <div className="tierlist-client-root">
      {/* Control Bar: Search & Lane / Role Filters */}
      <div className="filter-panel-card">
        {/* Search & Sort Row */}
        <div className="filter-search-row">
          <div className="search-box-lq">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              placeholder="Tìm nhanh tướng (vd: Nakroth, Elsu, Raz, Florentino)..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button className="clear-btn" onClick={() => setSearchQuery('')}>✕</button>
            )}
          </div>

          <div className="sort-box-lq">
            <label>Sắp xếp:</label>
            <select value={sortBy} onChange={e => setSortBy(e.target.value)}>
              <option value="tier">Cấp Sức Mạnh (Tier)</option>
              <option value="winrate">Tỉ Lệ Thắng (Win %)</option>
              <option value="name">Tên Tướng (A-Z)</option>
            </select>
          </div>
        </div>

        {/* Lanes Filter Bar */}
        <div className="filter-lanes-bar">
          <span className="filter-label">Vị trí:</span>
          <div className="filter-pill-group">
            {[
              { key: 'all', label: '🌟 Toàn Bộ (Xếp Hạng Chung)' },
              { key: 'rừng', label: '🌲 Đi Rừng' },
              { key: 'trung', label: '🔮 Đường Giữa' },
              { key: 'rồng', label: '🏹 Đường Rồng' },
              { key: 'tà thần', label: '⚔️ Đường Tà Thần' },
              { key: 'hỗ trợ', label: '🛡️ Trợ Thủ' }
            ].map(l => (
              <button
                key={l.key}
                className={`filter-pill-btn ${selectedLane === l.key ? 'active' : ''}`}
                onClick={() => {
                  setSelectedLane(l.key);
                  setSelectedRole('all'); // Reset role when picking lane
                }}
              >
                {l.label}
              </button>
            ))}
          </div>
        </div>

        {/* Roles Filter Bar */}
        <div className="filter-roles-bar">
          <span className="filter-label">Vai trò:</span>
          <div className="filter-pill-group">
            {[
              { key: 'all', label: 'Tất Cả' },
              { key: 'sát thủ', label: '🗡️ Sát Thủ' },
              { key: 'xạ thủ', label: '🏹 Xạ Thủ' },
              { key: 'pháp sư', label: '🔮 Pháp Sư' },
              { key: 'đấu sĩ', label: '⚔️ Đấu Sĩ' },
              { key: 'đỡ đòn', label: '🛡️ Đỡ Đòn' },
              { key: 'hỗ trợ', label: '💚 Hỗ Trợ' }
            ].map(r => (
              <button
                key={r.key}
                className={`filter-pill-btn role ${selectedRole === r.key ? 'active' : ''}`}
                onClick={() => {
                  setSelectedRole(r.key);
                }}
              >
                {r.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Result Count Info */}
      <div className="filter-count-info" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          Bảng Xếp Hạng: <strong style={{ color: 'var(--color-gold)', fontSize: '15px' }}>{getPositionTitle()}</strong>
          <span style={{ marginLeft: '10px', opacity: 0.75 }}>({filteredHeroes.length} tướng)</span>
        </div>
        {selectedLane !== 'all' && (
          <span className="badge-lane-notice" style={{ fontSize: '12px', background: 'rgba(0,240,255,0.1)', color: 'var(--color-accent)', padding: '3px 8px', borderRadius: '4px', border: '1px solid rgba(0,240,255,0.3)' }}>
            ✦ Đã xếp hạng riêng đầy đủ các bậc SSS+ ➔ B cho vị trí này
          </span>
        )}
      </div>

      {/* Tier Rows Render */}
      <div className="tier-rows-stack">
        {TIER_ORDER.map(t => {
          const heroesInTier = tierGroups[t.key] || [];
          if (heroesInTier.length === 0) return null;

          return (
            <div className="esports-tier-row" key={t.key}>
              <div className="esports-tier-badge" style={{ borderColor: t.color }}>
                <span className="tier-symbol" style={{ color: t.color }}>{t.label}</span>
                <span className="tier-tagline">{t.sub}</span>
                <span className="tier-count">({heroesInTier.length} tướng)</span>
              </div>

              <div className="esports-tier-heroes-grid">
                {heroesInTier.map(h => (
                  <Link href={`/hero/${h.id}`} key={h.id} className="esports-hero-tile">
                    <div className="hero-avatar-wrapper">
                      <img src={h.img || '/favicon.ico'} alt={h.name || h.id} className="hero-img" loading="lazy" />
                      {typeof h.winrate === 'number' && (
                        <div className="hero-win-badge" style={{ color: t.color }}>
                          {h.winrate.toFixed(1)}%
                        </div>
                      )}
                    </div>
                    <div className="hero-info-box">
                      <div className="hero-title-name">{h.name || h.id}</div>
                      <div className="hero-sub-meta">
                        {h.sub_roles?.[0] || h.roles?.[0] || 'Tướng'}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
