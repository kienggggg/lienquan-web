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
  [key: string]: any;
}

interface TierListClientProps {
  heroes: Hero[];
}

function getTierBadge(winrate?: number) {
  if (typeof winrate !== 'number') return { name: '?', sub: 'Chưa có số', color: '#94A3B8', bg: 'rgba(148, 163, 184, 0.1)' };
  if (winrate >= 53.5) return { name: 'SSS+', sub: 'BÁ CHỦ META', color: '#FFB800', bg: 'rgba(255, 184, 0, 0.15)' };
  if (winrate >= 52.0) return { name: 'SS', sub: 'SIÊU MẠNH LỰC', color: '#00F0FF', bg: 'rgba(0, 240, 255, 0.15)' };
  if (winrate >= 50.5) return { name: 'S', sub: 'CÂN BẰNG TỐT', color: '#10B981', bg: 'rgba(16, 185, 129, 0.15)' };
  if (winrate >= 49.0) return { name: 'A', sub: 'ỔN ĐỊNH', color: '#A855F7', bg: 'rgba(168, 85, 247, 0.15)' };
  return { name: 'B', sub: 'KÉO RANK KHÓ', color: '#EF4444', bg: 'rgba(239, 68, 68, 0.15)' };
}

export default function TierListClient({ heroes }: TierListClientProps) {
  const [selectedLane, setSelectedLane] = useState<string>('all');
  const [selectedRole, setSelectedRole] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('tier');

  const filteredHeroes = useMemo(() => {
    return heroes.filter(h => {
      // Lane filter
      if (selectedLane !== 'all') {
        const heroLanes = (h.lanes || [h.lane]).filter(Boolean).map(l => String(l).toLowerCase());
        const matchLane = heroLanes.some(l => l.includes(selectedLane.toLowerCase()));
        if (!matchLane) return false;
      }

      // Role filter
      if (selectedRole !== 'all') {
        const heroRoles = (h.roles || []).map(r => String(r).toLowerCase());
        const matchRole = heroRoles.some(r => r.includes(selectedRole.toLowerCase()));
        if (!matchRole) return false;
      }

      // Search filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const name = (h.name || h.id || '').toLowerCase();
        const roleStr = (h.roles || []).join(' ').toLowerCase();
        if (!name.includes(q) && !roleStr.includes(q)) return false;
      }

      return true;
    });
  }, [heroes, selectedLane, selectedRole, searchQuery]);

  // Group by Tier
  const tierGroups = useMemo(() => {
    const groups: Record<string, Hero[]> = {
      'SSS+': [],
      'SS': [],
      'S': [],
      'A': [],
      'B': [],
      '?': []
    };

    filteredHeroes.forEach(h => {
      const tier = getTierBadge(h.winrate).name;
      if (groups[tier]) {
        groups[tier].push(h);
      } else {
        groups['?'].push(h);
      }
    });

    // Sort heroes within each tier
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
  }, [filteredHeroes, sortBy]);

  const TIER_ORDER = [
    { key: 'SSS+', label: 'SSS+', sub: 'BÁ CHỦ META', color: '#FFB800' },
    { key: 'SS', label: 'SS', sub: 'SIÊU MẠNH LỰC', color: '#00F0FF' },
    { key: 'S', label: 'S', sub: 'CÂN BẰNG TỐT', color: '#10B981' },
    { key: 'A', label: 'A', sub: 'ỔN ĐỊNH', color: '#A855F7' },
    { key: 'B', label: 'B', sub: 'KÉO RANK KHÓ', color: '#EF4444' },
    { key: '?', label: '?', sub: 'CHƯA CÓ SỐ LIỆU', color: '#94A3B8' }
  ];

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
              { key: 'all', label: '🌟 Toàn Bộ' },
              { key: 'rừng', label: '🌲 Rừng' },
              { key: 'trung', label: '🔮 Đường Giữa' },
              { key: 'rồng', label: '🏹 Đường Rồng' },
              { key: 'tà thần', label: '⚔️ Tà Thần' },
              { key: 'hỗ trợ', label: '🛡️ Trợ Thủ' }
            ].map(l => (
              <button
                key={l.key}
                className={`filter-pill-btn ${selectedLane === l.key ? 'active' : ''}`}
                onClick={() => setSelectedLane(l.key)}
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
              { key: 'sát thủ', label: 'Sát Thủ' },
              { key: 'xạ thủ', label: 'Xạ Thủ' },
              { key: 'pháp sư', label: 'Pháp Sư' },
              { key: 'đấu sĩ', label: 'Đấu Sĩ' },
              { key: 'đỡ đòn', label: 'Đỡ Đòn' },
              { key: 'hỗ trợ', label: 'Hỗ Trợ' }
            ].map(r => (
              <button
                key={r.key}
                className={`filter-pill-btn role ${selectedRole === r.key ? 'active' : ''}`}
                onClick={() => setSelectedRole(r.key)}
              >
                {r.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Result Count Info */}
      <div className="filter-count-info">
        Hiển thị <strong>{filteredHeroes.length}</strong> tướng theo bộ lọc
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
                <span className="tier-count">({heroesInTier.length})</span>
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
                        {h.roles?.[0] || 'Tướng'}
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
