'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import { createItemBuild } from '@/app/actions/itemBuilds';

export interface HeroMinimal {
  id: string;
  name: string;
  img: string;
}

export interface ItemMinimal {
  id: string;
  name: string;
  type: string;
  icon: string;
}

export default function ItemBuilderClient({
  heroes,
  items,
  session,
}: {
  heroes: HeroMinimal[];
  items: ItemMinimal[];
  session: { userId: string; name: string } | null;
}) {
  const [selectedHero, setSelectedHero] = useState<HeroMinimal | null>(null);
  const [selectedItems, setSelectedItems] = useState<(ItemMinimal | null)[]>([
    null, null, null, null, null, null
  ]);
  const [activeSlot, setActiveSlot] = useState<number | null>(null);
  const [searchItem, setSearchItem] = useState('');
  const [activeItemType, setActiveItemType] = useState<string | null>(null);
  const [buildTitle, setBuildTitle] = useState('');
  const [buildNote, setBuildNote] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const itemTypes = Array.from(new Set(items.map((it) => it.type).filter(Boolean))) as string[];

  const handleSelectItem = (item: ItemMinimal) => {
    if (activeSlot === null) return;
    const newItems = [...selectedItems];
    newItems[activeSlot] = item;
    setSelectedItems(newItems);
    setActiveSlot(null);
    setSearchItem('');
  };

  const handleRemoveItem = (index: number, e: React.MouseEvent) => {
    e.stopPropagation();
    const newItems = [...selectedItems];
    newItems[index] = null;
    setSelectedItems(newItems);
  };

  const handleSave = () => {
    setError(null);
    setSuccess(null);

    if (!session) {
      setError('BẠN_CẦN_ĐĂNG_NHẬP');
      return;
    }

    if (!selectedHero) {
      setError('Vui lòng chọn 1 vị tướng cho bộ trang bị.');
      return;
    }

    const itemIds = selectedItems.filter(Boolean).map((it) => it!.id);
    if (itemIds.length === 0) {
      setError('Vui lòng chọn ít nhất 1 món trang bị.');
      return;
    }

    if (!buildTitle.trim() || buildTitle.trim().length < 2) {
      setError('Vui lòng nhập tên bộ trang bị (ít nhất 2 ký tự).');
      return;
    }

    startTransition(async () => {
      const res = await createItemBuild(
        selectedHero.id,
        buildTitle,
        itemIds,
        buildNote
      );

      if (res.error) {
        setError(res.error);
      } else {
        setSuccess('Lưu bộ trang bị thành công!');
        setBuildTitle('');
        setBuildNote('');
        setSelectedItems([null, null, null, null, null, null]);
        setSelectedHero(null);
      }
    });
  };

  const filteredItems = items.filter((it) => {
    const matchSearch = it.name.toLowerCase().includes(searchItem.toLowerCase());
    const matchType = activeItemType ? it.type === activeItemType : true;
    return matchSearch && matchType;
  });

  return (
    <div className="builder-container">
      <div className="spanel" style={{ padding: '24px' }}>
        {/* Tướng Selector */}
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '8px', color: 'var(--color-ink)' }}>
            1. Chọn tướng:
          </label>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <select
              className="afield"
              style={{ maxWidth: '280px', flex: 1 }}
              onChange={(e) => {
                const h = heroes.find((hero) => hero.id === e.target.value);
                setSelectedHero(h || null);
              }}
              value={selectedHero?.id || ''}
            >
              <option value="">-- Chọn một tướng --</option>
              {heroes.map((h) => (
                <option key={h.id} value={h.id}>
                  {h.name}
                </option>
              ))}
            </select>
            {selectedHero && (
              <img
                src={selectedHero.img}
                alt={selectedHero.name}
                style={{ width: '40px', height: '40px', borderRadius: '8px', border: '1px solid var(--color-line)' }}
              />
            )}
          </div>
        </div>

        {/* 6 Slots Trang bị */}
        <div style={{ marginBottom: '24px' }}>
          <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '12px', color: 'var(--color-ink)' }}>
            2. Gán 6 ô trang bị (click vào từng ô để chọn):
          </label>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(90px, 1fr))',
              gap: '12px',
            }}
          >
            {selectedItems.map((item, index) => (
              <div
                key={index}
                onClick={() => setActiveSlot(index)}
                style={{
                  background: 'var(--color-paper-2)',
                  border: item ? '1px solid var(--color-line)' : '1px dashed var(--color-line)',
                  borderRadius: '12px',
                  padding: '10px',
                  minHeight: '90px',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  position: 'relative',
                  textAlign: 'center',
                }}
              >
                {item ? (
                  <>
                    <img
                      src={item.icon}
                      alt={item.name}
                      style={{ width: '44px', height: '44px', borderRadius: '8px', marginBottom: '4px' }}
                    />
                    <span
                      style={{
                        fontSize: '11px',
                        color: 'var(--color-ink)',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        maxWidth: '100%',
                      }}
                    >
                      {item.name}
                    </span>
                    <button
                      onClick={(e) => handleRemoveItem(index, e)}
                      style={{
                        position: 'absolute',
                        top: '4px',
                        right: '4px',
                        background: 'transparent',
                        border: 'none',
                        color: 'var(--color-ink-sub)',
                        fontSize: '12px',
                        cursor: 'pointer',
                      }}
                    >
                      ✕
                    </button>
                  </>
                ) : (
                  <span style={{ fontSize: '12px', color: 'var(--color-accent)' }}>+ Ô {index + 1}</span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Thông tin build */}
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '8px', color: 'var(--color-ink)' }}>
            3. Thông tin bộ trang bị:
          </label>
          <input
            type="text"
            className="afield"
            placeholder="Tên lối lên đồ (ví dụ: Full Phép Tấn Công, Sát Thủ Rừng...)"
            value={buildTitle}
            onChange={(e) => setBuildTitle(e.target.value)}
            style={{ width: '100%', marginBottom: '12px' }}
          />
          <textarea
            className="afield"
            placeholder="Ghi chú chi tiết lối chơi, thứ tự ưu tiên lên đồ..."
            value={buildNote}
            onChange={(e) => setBuildNote(e.target.value)}
            rows={3}
            style={{ width: '100%' }}
          />
        </div>

        {/* Nút lưu */}
        <button
          className="abtn"
          onClick={handleSave}
          disabled={isPending}
          style={{
            background: 'var(--color-accent)',
            cursor: isPending ? 'wait' : 'pointer',
            width: '100%',
            padding: '12px',
          }}
        >
          {isPending ? 'Đang lưu...' : '💾 Lưu bộ trang bị'}
        </button>

        {error === 'BẠN_CẦN_ĐĂNG_NHẬP' && (
          <div className="warn" style={{ marginTop: '12px' }}>
            🔒 Bạn cần <Link href="/login" style={{ color: 'var(--color-accent)', textDecoration: 'underline' }}>Đăng nhập</Link> để lưu bộ trang bị này vào tài khoản.
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

      {/* Modal Chọn Trang bị */}
      {activeSlot !== null && (
        <div className="hero-selector-overlay" onClick={() => setActiveSlot(null)}>
          <div className="hero-selector-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Chọn trang bị cho ô {activeSlot + 1}</h3>
              <button className="close-btn" onClick={() => setActiveSlot(null)}>✕</button>
            </div>

            <div className="modal-search" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <input
                type="text"
                className="afield"
                placeholder="Tìm kiếm trang bị..."
                value={searchItem}
                onChange={(e) => setSearchItem(e.target.value)}
                autoFocus
              />
              <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                <button
                  onClick={() => setActiveItemType(null)}
                  style={{
                    padding: '4px 8px',
                    borderRadius: '6px',
                    border: '1px solid var(--color-line)',
                    background: activeItemType === null ? 'var(--color-accent)' : 'var(--color-paper-3)',
                    color: activeItemType === null ? '#fff' : 'var(--color-ink)',
                    fontSize: '11px',
                  }}
                >
                  Tất cả
                </button>
                {itemTypes.map((t) => (
                  <button
                    key={t}
                    onClick={() => setActiveItemType(t)}
                    style={{
                      padding: '4px 8px',
                      borderRadius: '6px',
                      border: '1px solid var(--color-line)',
                      background: activeItemType === t ? 'var(--color-accent)' : 'var(--color-paper-3)',
                      color: activeItemType === t ? '#fff' : 'var(--color-ink)',
                      fontSize: '11px',
                    }}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            <div className="modal-hero-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))' }}>
              {filteredItems.map((it) => (
                <div
                  key={it.id}
                  className="selector-hero-card"
                  onClick={() => handleSelectItem(it)}
                  style={{ display: 'flex', flexDirection: 'row', gap: '8px', alignItems: 'center', textAlign: 'left', justifyContent: 'flex-start' }}
                >
                  <img src={it.icon} alt={it.name} style={{ width: '36px', height: '36px', borderRadius: '6px' }} />
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div className="nm" style={{ fontSize: '12px' }}>{it.name}</div>
                    <div style={{ fontSize: '10px', color: 'var(--color-ink-sub)' }}>{it.type}</div>
                  </div>
                </div>
              ))}
              {filteredItems.length === 0 && (
                <div style={{ gridColumn: '1 / -1', padding: '24px', textAlign: 'center', color: 'var(--color-ink-sub)' }}>
                  Không tìm thấy trang bị.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
