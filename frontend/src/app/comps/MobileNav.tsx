"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

export default function MobileNav() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      {menuOpen && (
        <div className="mobile-drawer-overlay" onClick={() => setMenuOpen(false)}>
          <div className="mobile-drawer-content" onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h2 style={{ margin: 0, fontSize: 20 }}>Tất cả tính năng</h2>
              <button onClick={() => setMenuOpen(false)} style={{ background: 'transparent', border: 'none', color: 'var(--color-ink)', fontSize: 32, cursor: 'pointer' }}>&times;</button>
            </div>
            
            <div className="md-section">
              <div className="md-heading">⚔️ Tướng & Đội hình</div>
              <Link href="/" onClick={() => setMenuOpen(false)}>Bảng xếp hạng Tướng</Link>
              <Link href="/comps" onClick={() => setMenuOpen(false)}>Đội hình Meta</Link>
              <Link href="/team-builder" onClick={() => setMenuOpen(false)}>Tạo đội hình</Link>
              <Link href="/item-builder" onClick={() => setMenuOpen(false)}>Lên trang bị</Link>
              <Link href="/items" onClick={() => setMenuOpen(false)}>Từ điển Trang bị</Link>
            </div>

            <div className="md-section">
              <div className="md-heading">💬 Cộng đồng</div>
              <Link href="/articles" onClick={() => setMenuOpen(false)}>Bài viết & Giáo án</Link>
              <Link href="/players" onClick={() => setMenuOpen(false)}>BXH Người chơi</Link>
            </div>

            <div className="md-section">
              <div className="md-heading">📰 Tin tức & Sự kiện</div>
              <Link href="/tin-tuc" onClick={() => setMenuOpen(false)}>Tin tức Liên Quân</Link>
              <Link href="/su-kien" onClick={() => setMenuOpen(false)}>Sự kiện đang diễn ra</Link>
              <Link href="/su-kien/chung-suc" onClick={() => setMenuOpen(false)}>Chợ Mã Chung Sức</Link>
            </div>

            <div className="md-section">
              <div className="md-heading">👤 Tài khoản</div>
              <Link href="/profile" onClick={() => setMenuOpen(false)}>Hồ sơ Cá nhân</Link>
            </div>
          </div>
        </div>
      )}

      <div className="mobile-nav">
        <Link href="/" className={`mn-item ${pathname === "/" ? "active" : ""}`}>
          <span className="mn-icon">⚔️</span>
          <span className="mn-label">Tướng</span>
        </Link>
        <Link href="/comps" className={`mn-item ${pathname === "/comps" ? "active" : ""}`}>
          <span className="mn-icon">🛡️</span>
          <span className="mn-label">Meta</span>
        </Link>
        <Link href="/articles" className={`mn-item ${pathname === "/articles" ? "active" : ""}`}>
          <span className="mn-icon">💬</span>
          <span className="mn-label">Cộng đồng</span>
        </Link>
        <Link href="/profile" className={`mn-item ${pathname === "/profile" ? "active" : ""}`}>
          <span className="mn-icon">👤</span>
          <span className="mn-label">Cá nhân</span>
        </Link>
        <button className={`mn-item ${menuOpen ? "active" : ""}`} onClick={() => setMenuOpen(true)} style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}>
          <span className="mn-icon">☰</span>
          <span className="mn-label">Menu</span>
        </button>
      </div>
    </>
  );
}
