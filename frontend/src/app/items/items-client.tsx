'use client';

import { useState } from 'react';

export interface Item {
  id: string;
  name: string;
  type: string;
  level?: number;
  icon: string;
}

export default function ItemsClient({ items }: { items: Item[] }) {
  const [search, setSearch] = useState('');
  const [activeType, setActiveType] = useState<string | null>(null);

  // Lấy danh sách các loại trang bị duy nhất
  const itemTypes = Array.from(new Set(items.map((it) => it.type).filter(Boolean))) as string[];

  const filteredItems = items.filter((it) => {
    const matchesSearch = it.name.toLowerCase().includes(search.toLowerCase());
    const matchesType = activeType ? it.type === activeType : true;
    return matchesSearch && matchesType;
  });

  return (
    <div>
      {/* Search and Filters */}
      <div className="spanel" style={{ padding: '16px', marginBottom: '24px' }}>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
          <input
            type="text"
            className="afield"
            placeholder="🔍 Tìm kiếm trang bị..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ flex: 1, minWidth: '200px' }}
          />

          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            <button
              onClick={() => setActiveType(null)}
              style={{
                padding: '6px 12px',
                borderRadius: '8px',
                border: '1px solid var(--color-line)',
                background: activeType === null ? 'var(--color-accent)' : 'var(--color-paper-3)',
                color: activeType === null ? '#fff' : 'var(--color-ink)',
                fontSize: '13px',
                fontWeight: 'bold',
                cursor: 'pointer',
              }}
            >
              Tất cả
            </button>
            {itemTypes.map((t) => (
              <button
                key={t}
                onClick={() => setActiveType(t)}
                style={{
                  padding: '6px 12px',
                  borderRadius: '8px',
                  border: '1px solid var(--color-line)',
                  background: activeType === t ? 'var(--color-accent)' : 'var(--color-paper-3)',
                  color: activeType === t ? '#fff' : 'var(--color-ink)',
                  fontSize: '13px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                }}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Grid items */}
      {filteredItems.length === 0 ? (
        <div className="empty">Không tìm thấy trang bị nào phù hợp.</div>
      ) : (
        <div className="igrid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px' }}>
          {filteredItems.map((it) => (
            <div
              key={it.id}
              className="icard spanel"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px',
                borderRadius: '12px',
                border: '1px solid var(--color-line)',
                background: 'var(--color-paper-2)',
              }}
            >
              <img
                src={it.icon}
                alt={it.name}
                style={{ width: '48px', height: '48px', borderRadius: '10px', objectFit: 'cover' }}
              />
              <div style={{ minWidth: 0, flex: 1 }}>
                <div
                  className="inm"
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontWeight: 'bold',
                    fontSize: '14px',
                    color: 'var(--color-ink)',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {it.name}
                </div>
                <div style={{ display: 'flex', gap: '6px', marginTop: '2px', alignItems: 'center' }}>
                  <span
                    className="ity"
                    style={{
                      fontSize: '11px',
                      background: 'var(--color-paper-3)',
                      color: 'var(--color-ink-sub)',
                      padding: '2px 6px',
                      borderRadius: '6px',
                    }}
                  >
                    {it.type}
                  </span>
                  {it.level && (
                    <span
                      style={{
                        fontSize: '11px',
                        color: 'var(--color-gold)',
                        fontWeight: 'bold',
                      }}
                    >
                      Cấp {it.level}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
