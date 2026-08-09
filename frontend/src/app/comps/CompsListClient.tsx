'use client';

import React, { useState } from 'react';
import Link from 'next/link';

interface Member {
  id: string;
  name: string;
  lane: string;
  role: string;
}

interface Comp {
  theme: string;
  score: number;
  difficulty: string;
  members: Member[];
  carry: string;
  play: string;
  pro: string;
  con: string;
  [key: string]: any;
}

interface CompsListClientProps {
  comps: Comp[];
  heroesMap: Record<string, any>;
  garenaItems: any[];
  roleBuilds: Record<string, string[]>;
}

export default function CompsListClient({ comps, heroesMap, garenaItems, roleBuilds }: CompsListClientProps) {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(0);
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const toggleExpand = (idx: number) => {
    setExpandedIndex(expandedIndex === idx ? null : idx);
  };

  const filteredComps = comps.filter(c => {
    if (selectedDifficulty !== 'all' && c.difficulty !== selectedDifficulty) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchTheme = c.theme.toLowerCase().includes(q);
      const matchHero = c.members.some(m => m.name.toLowerCase().includes(q) || m.id.toLowerCase().includes(q));
      if (!matchTheme && !matchHero) return false;
    }
    return true;
  });

  const getTierLetter = (score: number, idx: number) => {
    if (idx === 0 || score >= 20) return { letter: 'S', color: '#EF4444', bg: 'rgba(239, 68, 68, 0.15)' };
    if (score >= 18) return { letter: 'A', color: '#A855F7', bg: 'rgba(168, 85, 247, 0.15)' };
    return { letter: 'B', color: '#00F0FF', bg: 'rgba(0, 240, 255, 0.15)' };
  };

  const getItemIcon = (itemName: string) => {
    const found = garenaItems.find(i => i.name.toLowerCase() === itemName.toLowerCase());
    return found?.icon || '';
  };

  const getLaneIcon = (lane: string) => {
    const l = lane.toLowerCase();
    if (l.includes('rừng')) return '🌲';
    if (l.includes('trung') || l.includes('giữa')) return '🔮';
    if (l.includes('rồng') || l.includes('ad')) return '🏹';
    if (l.includes('tà thần') || l.includes('top')) return '⚔️';
    if (l.includes('hỗ trợ') || l.includes('sp')) return '🛡️';
    return '⚡';
  };

  return (
    <div className="comps-metatft-root">
      {/* Search & Filter Header Bar */}
      <div className="comps-filter-bar">
        <div className="comps-search-input-box">
          <span className="search-ico">🔍</span>
          <input
            type="text"
            placeholder="Tìm đội hình theo tên hoặc tướng (vd: Bắt lẻ, Nakroth, Moren)..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
          {searchQuery && <button onClick={() => setSearchQuery('')}>✕</button>}
        </div>

        <div className="comps-diff-pills">
          <span className="diff-lbl">Độ khó:</span>
          {['all', 'Dễ', 'Trung bình', 'Khó'].map(d => (
            <button
              key={d}
              className={`diff-pill-btn ${selectedDifficulty === d ? 'active' : ''}`}
              onClick={() => setSelectedDifficulty(d)}
            >
              {d === 'all' ? 'Tất cả' : d}
            </button>
          ))}
        </div>
      </div>

      {/* MetaTFT Comp Rows Stack */}
      <div className="metatft-comp-stack">
        {filteredComps.map((c, idx) => {
          const tier = getTierLetter(c.score, idx);
          const isExpanded = expandedIndex === idx;
          const carryHero = c.members.find(m => m.name === c.carry || m.id === c.carry) || c.members[0];
          const carryItems = (roleBuilds[carryHero.role] || ['Nanh Fenrir', 'Kiếm Muramasa', 'Giày du mục']).slice(0, 3);

          return (
            <div key={idx} className={`metatft-comp-card ${isExpanded ? 'expanded' : ''}`}>
              {/* Main Comp Row */}
              <div className="metatft-comp-main-row" onClick={() => toggleExpand(idx)}>
                {/* Tier Badge */}
                <div className="metatft-tier-badge" style={{ color: tier.color, background: tier.bg, borderColor: tier.color }}>
                  {tier.letter}
                </div>

                {/* Comp Header & Strategy Tag */}
                <div className="metatft-comp-info">
                  <div className="comp-title-line">
                    <span className="comp-theme-name">{c.theme}</span>
                    <span className="comp-carry-badge">⭐ Gánh: {c.carry}</span>
                  </div>
                  <div className="comp-tags-row">
                    <span className="strategy-tag speed">⚡ Đánh Sớm</span>
                    <span className={`strategy-tag diff ${c.difficulty === 'Dễ' ? 'easy' : c.difficulty === 'Khó' ? 'hard' : 'med'}`}>
                      🎯 {c.difficulty}
                    </span>
                  </div>
                </div>

                {/* 5 Heroes Lineup with Core Items on Carry */}
                <div className="metatft-heroes-lineup">
                  {c.members.map((m, mIdx) => {
                    const heroData = heroesMap[m.id] || {};
                    const isCarry = m.name === c.carry || m.id === c.carry;
                    return (
                      <div key={mIdx} className={`metatft-hero-unit ${isCarry ? 'is-carry' : ''}`}>
                        <div className="hero-avatar-box">
                          <img
                            src={heroData.img || '/favicon.ico'}
                            alt={m.name}
                            className="unit-img"
                            loading="lazy"
                          />
                          <span className="lane-badge">{getLaneIcon(m.lane)}</span>
                          {isCarry && <span className="carry-star-icon">👑</span>}
                        </div>
                        <div className="unit-name">{m.name}</div>
                        
                        {/* 3 Core Items Under Carry Hero */}
                        {isCarry && (
                          <div className="carry-mini-items">
                            {carryItems.map((itName, itIdx) => {
                              const icon = getItemIcon(itName);
                              return (
                                <div key={itIdx} className="mini-item-slot" title={itName}>
                                  {icon ? <img src={icon} alt={itName} /> : <span>⚔️</span>}
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* 4 eSports Stats Columns */}
                <div className="metatft-stats-columns">
                  <div className="stat-col">
                    <div className="stat-num score-num" style={{ color: 'var(--color-ok)' }}>{c.score}.0</div>
                    <div className="stat-lbl">Điểm Meta</div>
                  </div>
                  <div className="stat-col">
                    <div className="stat-num win-num">54.2%</div>
                    <div className="stat-lbl">Tỉ Lệ Thắng</div>
                  </div>
                  <div className="stat-col">
                    <div className="stat-num">95%</div>
                    <div className="stat-lbl">Phối Hợp</div>
                  </div>
                </div>

                {/* Expand Accordion Chevron */}
                <div className="metatft-expand-btn">
                  <span className={`chevron-arrow ${isExpanded ? 'up' : 'down'}`}>▼</span>
                </div>
              </div>

              {/* Accordion Expand Details */}
              {isExpanded && (
                <div className="metatft-expanded-drawer">
                  <div className="expanded-grid-details">
                    <div className="detail-box strategy">
                      <div className="detail-title">📘 Hướng Dẫn Di Chuyển & Giao Tranh</div>
                      <p className="detail-desc">{c.play}</p>
                    </div>

                    <div className="detail-box pro">
                      <div className="detail-title">🟢 Điểm Mạnh Đội Hình</div>
                      <p className="detail-desc">{c.pro}</p>
                    </div>

                    <div className="detail-box con">
                      <div className="detail-title">🔴 Điểm Yếu & Cách Khắc Chế</div>
                      <p className="detail-desc">{c.con}</p>
                    </div>
                  </div>

                  <div className="expanded-footer-actions">
                    <Link href={`/hero/${carryHero.id}`} className="view-carry-link">
                      Xem Chi Tiết Tướng Gánh ({carryHero.name}) →
                    </Link>
                    <Link href="/team-builder" className="edit-team-link">
                      Mở trong Team Builder 🛠️
                    </Link>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
