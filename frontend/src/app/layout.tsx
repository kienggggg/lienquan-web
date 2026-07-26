import type { Metadata } from "next";
import "./globals.css";
import Link from "next/link";
import { getSession } from "@/lib/auth";
import MobileNav from "./comps/MobileNav";

export const metadata: Metadata = {
  title: "Liên Quân Tổng Hợp",
  description: "Trang tổng hợp meta Liên Quân Mobile / Arena of Valor",
  verification: {
    google: "5s4XsTshbh_BqEpbcePMkaDhbjCpwDxoeHq945pOLgI",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getSession();

  return (
    <html lang="vi">
      <body>
        <div className="navtop">
          <div className="wrap">
            <span className="brand">⚔️ Liên Quân Tổng Hợp</span>
            <div className="ng">
              <Link href="/">Tướng ▾</Link>
              <div className="dd">
                <Link href="/">Bảng xếp hạng Tướng</Link>
                <Link href="/team-builder">🛠️ Tạo đội hình</Link>
                <Link href="/item-builder">⚔️ Lên trang bị</Link>
                <Link href="/comps">Đội hình Meta</Link>
                <Link href="/items">Trang bị</Link>
              </div>
            </div>
            <div className="ng">
              <Link href="/articles">Cộng đồng ▾</Link>
              <div className="dd">
                <Link href="/articles">Bài viết & Giáo án</Link>
                <Link href="/players">BXH Người chơi</Link>
              </div>
            </div>
            <div className="ng">
              <Link href="/tin-tuc">Tin tức & Sự kiện ▾</Link>
              <div className="dd">
                <Link href="/tin-tuc">Tin tức Liên Quân</Link>
                <Link href="/su-kien">Sự kiện đang diễn ra</Link>
                <Link href="/su-kien/chung-suc">🤝 Chợ Mã Chung Sức / Bắn Bi</Link>
              </div>
            </div>
            <div className="ng" style={{ marginLeft: "auto" }}>
              {session ? (
                <Link href="/profile" style={{ color: "var(--ok)", fontWeight: "bold" }}>
                  👤 {session.name}
                </Link>
              ) : (
                <Link href="/login">Đăng nhập</Link>
              )}
            </div>
          </div>
        </div>
        
        <main className="main-content wrap">
          {children}
        </main>
        
        <footer>
          <div className="wrap">
            Trang do người hâm mộ xây dựng — KHÔNG liên kết với Garena hay Tencent/TiMi.<br/>
            Liên Quân Mobile là thương hiệu của chủ sở hữu tương ứng.
          </div>
        </footer>
        <MobileNav />
      </body>
    </html>
  );
}
