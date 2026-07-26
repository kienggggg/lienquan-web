"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function MobileNav() {
  const pathname = usePathname();

  return (
    <div className="mobile-nav">
      <Link href="/" className={`mn-item ${pathname === "/" ? "active" : ""}`}>
        <span className="mn-icon">⚔️</span>
        <span className="mn-label">Tướng</span>
      </Link>
      <Link href="/team-builder" className={`mn-item ${pathname === "/team-builder" ? "active" : ""}`}>
        <span className="mn-icon">🛠️</span>
        <span className="mn-label">Đội hình</span>
      </Link>
      <Link href="/tin-tuc" className={`mn-item ${pathname === "/tin-tuc" ? "active" : ""}`}>
        <span className="mn-icon">📰</span>
        <span className="mn-label">Tin tức</span>
      </Link>
      <Link href="/profile" className={`mn-item ${pathname === "/profile" ? "active" : ""}`}>
        <span className="mn-icon">👤</span>
        <span className="mn-label">Cá nhân</span>
      </Link>
    </div>
  );
}
