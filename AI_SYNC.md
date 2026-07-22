# LQMeta Web App - AI Sync & Handoff State

> **Mục đích:** File này dùng để bàn giao tiến độ giữa các trợ lý AI (Claude, Gemini, v.v.) trong quá trình xây dựng dự án Liên Quân Tổng Hợp. Mỗi khi kết thúc một phiên làm việc hoặc khi sắp hết token, AI hiện tại **BẮT BUỘC** phải cập nhật file này để AI tiếp theo có thể đọc và code tiếp ngay mà không bị mất context.

---

## 🧭 CHỈ HUY & BẢNG NHIỆM VỤ (Command Board)

> **Chỉ huy trưởng (Lead/Architect):** **Claude (Claude Code)** — chốt kiến trúc, review code, ra spec nhiệm vụ, xử lý bảo mật & logic phức tạp.
> **Thợ thực thi (Executor):** **Gemini (Antigravity)** — làm UI/tính năng/nội dung theo spec. Các AI khác nhận việc từ bảng dưới.
>
> **LUẬT MỚI (quan trọng):**
> 1. Trước khi làm, đọc bảng này + chọn 1 task `TODO`, đổi sang `DOING (tên bạn)`.
> 2. Làm xong đổi `DONE` + ghi 1 dòng vào Work Log (mục 6). KHÔNG được bỏ log (Antigravity đã quên 1 lần).
> 3. Không tự ý đổi kiến trúc/Tech Stack. Đổi lớn phải ghi đề xuất vào đây cho Chỉ huy duyệt.
> 4. Bảo mật: KHÔNG hard-code secret; input người dùng phải validate + guard đăng nhập.

| # | Nhiệm vụ | Giao cho | Ưu tiên | Trạng thái |
|---|---|---|---|---|
| T1 | Vá dropdown navbar (`.dd` CSS bị thiếu) + hồ sơ `/profile` + lỗ farm uy tín | Claude | Cao | ✅ DONE |
| T2 | Làm giàu trang `/comps` & `/items` (đang cơ bản) — thêm lọc, icon, bố cục đẹp | Gemini | TB | 🔲 TODO |
| T3 | Trang chủ: thêm HERO BANNER (tướng nổi bật / tier nóng) cho bớt trống — **SPEC ở mục 7 bên dưới** | **Gemini** | **Cao** | ✅ DONE — Claude nghiệm thu ĐẠT 6/6 |
| T4 | Áp phong cách skill **Hallmark** để UI bớt "generic AI" (xem AURA/AI_TECH_RESEARCH.md) | Gemini | Thấp | 🔲 TODO |
| T5 | Team Builder — **SPEC mục 9**. Tính năng lá cờ đầu, dùng model Team sẵn có | **Gemini** | **Cao** | 🔄 SPEC READY → Gemini |
| T6 | Deploy Vercel + đổi DB Postgres — SPEC mục 8. **Phần A (code) Claude XONG**, còn Phần B (tài khoản) chờ User | User+Claude | Cao | ✅ DONE — LIVE: lienquan-web-zeta.vercel.app (Claude nghiệm thu ĐẠT) |
| T7 | Nạp win/pick THẬT vào `data/heroes.json` (chạy lại `scrape_*`/merge) | User cấp số | Cao | ⏸ CHỜ user |

| T8 | Trình tạo BỘ TRANG BỊ tự do (user chọn món cho tướng, lưu/chia sẻ) | Gemini | TB | 🔲 TODO |
| T9 | Vote bài vi/build cộng đồng — **SPEC mục 10** | **Gemini** | **Cao** | 🔄 SPEC READY → Gemini |
| T10 | Board "Thảo luận" (forum nhẹ, tái dùng Article/Comment) | Gemini | Thấp | 🔲 TODO |

*(Chỉ huy cập nhật bảng này mỗi phiên. Trạng thái: 🔲 TODO · 🔄 DOING · ✅ DONE · ⏸ CHỜ.)*

---

## 1. Thông Tin Dự Án
- **Thư mục gốc:** `D:\lqmeta`
- **Thư mục Web App:** `D:\lqmeta\frontend`
- **Tech Stack:**
  - **Frontend & Backend:** Next.js 15 (App Router).
  - **Cơ sở dữ liệu:** SQLite (`frontend/prisma/dev.db`) quản lý qua Prisma ORM (v6).
  - **CSS:** CSS Thuần (Vanilla CSS tại `globals.css` - tái sử dụng class từ dự án gốc, **Không dùng Tailwind**).
  - **Authentication:** Custom JWT (JSON Web Tokens) với thư viện `jose` và `bcryptjs`. Server Actions để xử lý logic.

## 2. Tiến Độ (Roadmap)

### ✅ Phase 1: Nền tảng & Đăng ký / Đăng nhập (Hoàn tất)
- Đã khởi tạo Next.js App Router tại `frontend/`.
- Đã cài Prisma, tạo database schema (User, Article, Comment, Team) và chạy `db push`.
- Đã cấu hình Custom Auth (JWT qua cookies) tại `src/lib/auth.ts` và API routes/Server Actions ở `src/app/actions/auth.ts`.
- Đã tạo trang `/register` và `/login`.
- Đã cấu hình Layout hiển thị menu 2 tầng, tên người dùng nếu đã đăng nhập.
- Đã map dữ liệu `heroes.json` cũ lên trang chủ (`/`) dưới dạng thẻ bài Tier.
- Đã tạo trang chi tiết tướng `/hero/[id]` đọc dữ liệu từ `garena_heroes.json`.

### ✅ Phase 2: Chức năng Mạng xã hội / Bài viết (Claude làm xong phần cốt lõi)
- [x] Cho phép người dùng đăng bài viết, giáo án (`/articles/new`, guard server-side chưa login -> /login).
- [x] Xem danh sách bài viết tại `/articles` (hiện tác giả + số bình luận).
- [x] Chi tiết bài `/articles/[id]` + bình luận (`Comment`), form bình luận client tự reset sau khi gửi.
- [x] Tính Uy tín: mỗi bình luận +1 reputation cho TÁC GIẢ bài (không cộng nếu tự bình luận bài mình — chống tự bơm).
- [x] **Bảng xếp hạng người dùng** (`/players`): query user sort reputation desc, hiện huy chương top-3 + số bài/bình luận (Server Component, bảng `.stats`).
- [x] **Tin tức** (`/tin-tuc`) + **Sự kiện** (`/su-kien`): 2 mục nav lớn mới. Đọc `data/news.json` (sinh bởi `scrape_news.py` — cào tiêu đề+link+ảnh từ lienquan.garena.vn, aggregator link-ra-trang-gốc, không copy nội dung). /su-kien có thêm khối "sự kiện cộng đồng sắp có" (bắn bi/đổi thẻ - Phase 3).

### ⏳ Phase 3: Tính năng Sự kiện & Nâng cao (Tương lai)
- Tạo đội hình (Team Builder) và lưu vào bảng `Team`.
- Mini-game / Sự kiện tương tác nhiều người: Chung sức bắn bi, đổi thẻ, tặng thẻ...
- Tích hợp lịch sử đấu thật (Cào/Mock dữ liệu).

## 3. Cấu Trúc File & Quy Tắc Quan Trọng
- **QUY TẮC BẮT BUỘC:** Đọc file `D:\lqmeta\.agents\AGENTS.md` trước khi code. Đây là luật chơi chung để không dọn rác của nhau.
- `frontend/prisma/schema.prisma`: Định nghĩa Database. Cần chạy `npx prisma db push` nếu có thay đổi.
- `frontend/src/app/globals.css`: Toàn bộ CSS (tái sử dụng cấu trúc MetaTFT của dự án cũ).
- `frontend/src/lib/auth.ts`: Logic mã hóa, giải mã JWT và lấy Session.
- `frontend/src/lib/prisma.ts`: Prisma Client Singleton.
- `data/garena_heroes.json`: Dữ liệu chính thức từ Garena, sinh ra bởi `scrape_garena.py`.

## 4. Lệnh Vận Hành Cơ Bản
Mở Terminal, trỏ vào `D:\lqmeta\frontend`:
```bash
npm run dev                 # Khởi động server
npx prisma db push          # Đồng bộ schema vào SQLite
npx prisma studio           # Xem data DB trên web
```

## 5. Lời Nhắn Giao Việc Hiện Tại (Handoff Note)
**Gửi AI tiếp theo (Gemini/Antigravity):** Phase 2 phần bài viết + bình luận + uy tín đã XONG và test chạy thật OK. Việc tiếp theo:
1. **Trang Bảng xếp hạng người dùng** (`/players` — nav đã trỏ tới nhưng route CHƯA có, đang 404): query `prisma.user` sort theo `reputation` desc, hiện tên + điểm uy tín + số bài viết. Dùng Server Component + class `.stats`/`.acard` sẵn có.
2. Route nav khác chưa tạo (đang 404): `/comps`, `/items`, `/profile`. Có thể port từ `build_site.py` (bản tĩnh) sang.
3. **QUAN TRỌNG — BẢO MẬT:** Tôi đã vá lỗ JWT (Gemini lỡ hard-code secret trong `auth.ts`). Giờ secret đọc từ `frontend/.env` (`JWT_SECRET`, đã gitignore). **KHI DEPLOY phải đặt biến môi trường `JWT_SECRET` trên host (Vercel), nếu không app sẽ throw.** File `.env.example` là mẫu (không có giá trị).

---

## 6. Nhật Ký Làm Việc & Thảo Luận Giữa Các AI (Work Log)
> **Quy định:** Mỗi khi kết thúc hoặc bắt đầu ca làm việc, AI phải ghi danh (Tôi là ai, phong cách code là gì) và log lại những gì mình đã làm, giải pháp đã chọn để AI sau nắm được tư duy logic.

**[20/07/2026 - Gemini (Antigravity)] - Hoàn thành Phase 1**
- **Phong cách làm việc:** Tập trung vào sự tối giản, tuân thủ chặt chẽ kiến trúc Vanilla CSS đã có, thích dùng Server Actions của Next.js 15 thay vì API routes truyền thống để tối ưu hiệu suất và code ngắn gọn.
- **Những gì đã làm:**
  - Setup Next.js App Router, Prisma ORM (SQLite).
  - Viết `src/lib/auth.ts` dùng `jose` cho JWT (Edge-compatible).
  - Tích hợp Server Actions ở `actions/auth.ts` cho Đăng ký/Đăng nhập.
  - Sửa `layout.tsx` (hiển thị 👤 tên user) và `page.tsx` (thẻ tướng link sang `/hero/[id]`).
- **Ghi chú cho Claude/AI sau:** Khi bạn (Claude) làm Phase 2 (Bài viết người dùng), hãy tiếp tục tận dụng Server Actions. Schema Prisma của chúng ta đã có sẵn model `Article` và `Comment`. Hãy cẩn thận với JWT khi lấy thông tin `userId` từ token nhé.

**[21/07/2026 - Claude (Claude Code)] - Vá bảo mật + Hoàn thành Phase 2 (bài viết/bình luận)**
- **Phong cách làm việc:** Trọng bảo mật + verify chạy thật trước khi bàn giao. Ưu tiên Server Actions + Server Components (data fetch phía server), form dùng `useActionState`, guard đăng nhập ở tầng server (`redirect`) thay vì chỉ ẩn nút. Giữ đúng Vanilla CSS (class `.panel/.bar/.warn/.acard/.alist/.afield`), KHÔNG thêm Tailwind.
- **🔴 Vá bảo mật (làm TRƯỚC):** `auth.ts` đang hard-code `secretKey` -> chuyển sang `process.env.JWT_SECRET` (throw nếu thiếu). Tạo `frontend/.env` (secret ngẫu nhiên 48 byte, đã gitignore) + `.env.example`. Cookie thêm `sameSite:'lax'` + `maxAge` 24h.
- **Những gì đã làm (Phase 2):**
  - `src/app/actions/articles.ts`: `createArticle` (validate title>=6/content>=30, guard login) + `createComment` (guard, +1 reputation cho tác giả, chống tự-bơm).
  - `src/app/articles/page.tsx` (list, Server Component), `articles/new/page.tsx` (guard) + `new/form.tsx` (client), `articles/[id]/page.tsx` (detail + comments) + `[id]/comment-form.tsx` (client, tự reset).
  - **Verify chạy thật:** `npm run dev` Ready OK; các route 200; `/articles/new` chưa login -> 307 /login; test Prisma: tạo bài + bình luận -> uy tín tác giả 0->1 chuẩn; đã dọn data test (DB về 0 user/0 bài).
- **Ghi chú cho AI sau:** Xem Handoff Note mục 5 — việc tiếp là trang `/players` (leaderboard theo uy tín) + các route nav còn 404. Nhớ `JWT_SECRET` phải set khi deploy.

**[21/07/2026 - Claude (Claude Code)] - Leaderboard + Tin tức + Sự kiện**
- **Những gì đã làm:**
  - `/players`: Bảng xếp hạng người dùng theo uy tín (Server Component, `prisma.user` sort reputation, huy chương top-3, đếm bài/bình luận). → HẾT 404, Phase 2 xong 100%.
  - Thêm 2 mục nav lớn: **Tin tức** (`/tin-tuc`) + **Sự kiện** (`/su-kien`).
  - `scrape_news.py` (ở gốc lqmeta): cào tiêu đề+link+ảnh tin/sự kiện chính thống từ lienquan.garena.vn (/tin-tuc + /cap-nhat) → `data/news.json`, phân loại news/event bằng từ khoá. AGGREGATOR: chỉ tiêu đề+link, bấm mở trang gốc (không copy nội dung → an toàn bản quyền).
  - `src/lib/data.ts` `readNews()` đọc `../data/news.json` (giống cách đọc heroes.json). Trang /tin-tuc (news) + /su-kien (event + khối cộng đồng sắp có).
  - **Verify:** /players, /tin-tuc, /su-kien đều 200 + render nội dung thật (test qua curl).
- **Ghi chú cho AI sau:** Route nav còn 404: `/comps`, `/items`, `/profile` — port từ `build_site.py` (bản tĩnh) sang React/Server Component. news.json nên có cron chạy `scrape_news.py` cho tươi (AURA lo được).

**[21/07/2026 - Gemini (Antigravity)] - Chợ mã sự kiện (GHI HỘ bởi Claude — Antigravity quên log)**
- Làm `/comps` + `/items` (2 route 404 còn lại), và thêm MỚI `/su-kien/chung-suc`: chợ chia sẻ mã sự kiện (Chung sức/Bắn bi/Săn thẻ mã-1-lần) + đánh giá sao.
- Thêm 2 model: `EventCode` + `CodeRating` (đã db push). Actions ở `actions/eventCodes.ts`.
- ⚠️ **Nhắc:** lần sau PHẢI tự cập nhật AI_SYNC.md (luật mục 4-5). Và code chợ mã ban đầu có LỖ farm uy tín (Claude đã vá — xem dưới).

**[21/07/2026 - Claude (Claude Code)] - Vá lỗ farm uy tín + trang /profile**
- **🔴 Vá farm uy tín (chợ mã):** `CodeRating` thiếu ràng buộc -> 1 người spam đánh giá 5★ 1 mã vô hạn để bơm uy tín cho bạn. Thêm `@@unique([authorId, codeId])` (db push + prisma generate lại client vì action dùng composite key `authorId_codeId`). `rateAndCommentCode` check rating cũ trước -> báo "Bạn đã đánh giá mã này rồi" thay vì crash P2002. Verify: đánh giá lần 2 bị chặn (P2002).
- **`/profile`** (route 404 CUỐI cùng): Server Component, guard chưa login -> /login. Thẻ hồ sơ (tên/email/ngày tham gia/role) + chỉ số (uy tín/bài/bình luận/đội hình) + danh sách bài của mình + nút Đăng xuất (`logoutAction` mới trong actions/auth.ts). Verify: chưa login -> 307 /login OK.
- **HẾT 404 toàn bộ nav.** Verify /su-kien/chung-suc vẫn 200 sau khi đổi schema.
- **Ghi chú cho AI sau:** Còn lại chủ yếu là làm giàu nội dung (port /comps /items cho đẹp hơn nếu cần) + deploy Vercel (nhớ set JWT_SECRET). Tham khảo skill "Hallmark" (ghi trong AURA/AI_TECH_RESEARCH.md) để giao diện bớt generic.


**[21/07/2026 - Claude (Chỉ huy trưởng)] - Vá navbar dropdown + lập Command Board**
- **Bệnh navbar:** Antigravity viết lại theme (navbar dạng pill nổi, màu oklch) nhưng QUÊN carry rule CSS `.dd` → mọi link con bị đổ hết ra thanh nav (chính là "lộn xộn" user thấy). VÁ: thêm `.ng .dd` (ẩn mặc định, hover mới hiện) + cầu nối `.ng::after` chống đóng menu khi rê chuột qua khe. Verify: CSS đã nạp vào bản phục vụ, trang 200.
- **Vai trò mới:** User chỉ định Claude làm CHỈ HUY (điều phối multi-agent qua file này, không đợi hết-quota-mới-đổi-AI). Đã lập **BẢNG NHIỆM VỤ (Command Board)** ở đầu file + luật mới (chọn task → DOING → DONE + log bắt buộc).
- **Ghi chú:** Cơ chế thật là giao tiếp GIÁN TIẾP qua file (Claude không gọi trực tiếp Gemini được). User là người chuyển lệnh. Việc tiếp cho Gemini: xem Command Board T2-T5.

**[21/07/2026 - Gemini (Antigravity)] - Hoàn thành Task T3 (Hero Banner Trang Chủ)**
- **Những gì đã làm:**
  - Thêm thẻ HERO BANNER hiển thị tướng nổi bật có winrate cao nhất và 4 tướng đang lên hạng ở `frontend/src/app/page.tsx`.
  - Bổ sung Vanilla CSS thuần cho banner (`.herobanner`, `.hb-feature`, v.v.) vào `frontend/src/app/globals.css`.
  - Thiết kế 2 cột cho desktop và responsive xếp dọc cho màn hình di động (<720px).
- **Ghi chú cho AI sau / Chỉ huy:** T3 đã hoàn tất, đảm bảo yêu cầu dùng Vanilla CSS, Server Component. Các task tiếp theo (T2, T4, T5) đang chờ.

---

## 7. SPEC CHI TIẾT — T3: HERO BANNER trang chủ (Chỉ huy Claude giao Gemini)

> **Người giao:** Claude (Chỉ huy). **Người làm:** Gemini/Antigravity. **File sửa:** `frontend/src/app/page.tsx` + thêm class vào `frontend/src/app/globals.css`. Làm xong đổi T3 = ✅ DONE + ghi Work Log.

### 🎯 Mục tiêu
Trang chủ đang trống trải (chỉ có 2 ô bento + list tier). Thêm 1 **HERO BANNER** to, đẹp ở TRÊN CÙNG (ngay dưới `<header>`, trước lưới bento) để hút mắt + khoe tướng đang mạnh — kiểu "featured" của MetaTFT/web game.

### 📦 Dữ liệu (đã có sẵn, KHÔNG cào thêm)
- `page.tsx` đã đọc `heroesList` từ `data/heroes.json`. Mỗi tướng có: `id`, `name`, `roles[]`, `img` (URL ảnh dùng thẳng được), `winrate` (số, VD 52.4 — CÓ THỂ null với tướng chưa có số), `pickrate`.
- **Chọn tướng nổi bật = winrate cao nhất:**
  ```ts
  const featured = heroesList
    .filter((h:any) => typeof h.winrate === 'number' && h.img)
    .sort((a:any,b:any) => b.winrate - a.winrate)
    .slice(0, 5);
  const hero = featured[0];          // tướng lớn ở giữa
  const hotList = featured.slice(1); // 4 tướng nhỏ bên cạnh
  ```
- **Tier từ winrate** (giữ ĐÚNG ngưỡng engine cho nhất quán, viết helper nhỏ trong page.tsx):
  `>=52 → S · >=51 → A · >=50 → B · >=48.5 → C · còn lại → D`. Màu tier: S=`--color-ok`, A=`--color-accent`, B=`--color-gold`, C=`--color-ink-faint`, D=`--color-bad`.

### 🎨 Layout (2 cột, responsive)
- **Cột trái (lớn ~62%) — thẻ tướng nổi bật:** dùng `hero.img` làm ẢNH NỀN (background-image) + lớp phủ gradient tối dần xuống dưới để chữ đọc được. Trên nền hiện: badge "🔥 META NỔI BẬT" nhỏ; **tên tướng** (to, `font-family: var(--font-display)`); vai trò (`hero.roles.join(' · ')`); hàng chỉ số: **Tier X** (badge màu theo tier) · **Win hero.winrate%** · **Pick hero.pickrate%**; nút **"Xem chi tiết →"** link `/hero/${hero.id}`. Cả thẻ bấm được (link tới hero detail).
- **Cột phải (~38%) — "Đang lên hạng":** tiêu đề nhỏ + danh sách `hotList` (4 tướng), mỗi dòng: ảnh tròn/bo (`h.img`) + tên + role + badge tier + `Win h.winrate%`, link `/hero/${h.id}`.
- **Responsive:** `< 720px` xếp DỌC 1 cột (cột phải xuống dưới). Dùng CSS grid/flex.

### 🧩 CSS (thêm class MỚI vào globals.css — theo LUẬT: chỉ THÊM, không sửa class cũ)
- Đặt tên class rõ ràng: `.herobanner`, `.hb-feature`, `.hb-overlay`, `.hb-list`, `.hb-item`, `.hb-stats`, `.hb-badge`.
- Dùng ĐÚNG design tokens hiện có (đừng chế màu mới): `--color-paper-2/3`, `--color-line`, `--color-ink`, `--color-ink-sub`, `--color-accent`, `--color-gold`, `--color-ok`, `--color-bad`, `--font-display`. Bo góc ~16-20px, khớp phong cách "pill/glass" của navbar (có thể dùng `box-shadow` + `border:1px solid var(--color-line)`).
- Ảnh nền featured: `background-size:cover; background-position:center top;` + overlay `linear-gradient(...)`.

### ✅ Tiêu chí nghiệm thu (Chỉ huy sẽ review)
1. `npm run dev` chạy, trang `/` 200, KHÔNG lỗi console/build.
2. Banner hiện tướng winrate cao nhất + 4 tướng kế; **số Win/Pick + Tier khớp winrate thật** (không hard-code).
3. Bấm banner / item → sang đúng `/hero/[id]`.
4. Thu nhỏ cửa sổ < 720px → xếp dọc gọn, không tràn ngang.
5. **Vanilla CSS thuần**, KHÔNG thêm Tailwind/thư viện, KHÔNG sửa class cũ. Server Component (không cần 'use client').
6. Nếu `featured` rỗng (không tướng nào có winrate) → ẩn banner (đừng để vỡ layout).

### ⚠️ Ràng buộc
- Không đụng logic list tier phía dưới (giữ nguyên).
- Ảnh dùng thẳng `h.img` (đã là URL chạy được — xem `page.tsx` dòng cũ `<img src={h.img}>`).
- Xong PHẢI: cập nhật T3=✅ DONE ở Command Board + ghi 1 entry Work Log (mục 6, ghi danh Gemini + tóm tắt).

---

## 8. SPEC CHI TIẾT — T6: DEPLOY VERCEL + đổi DB Postgres (Chỉ huy Claude giao)

> **⚠️ CHỐT CHẶN:** SQLite (`dev.db` file) KHÔNG chạy trên Vercel (serverless = ổ đĩa chỉ đọc, reset mỗi request → mất data). PHẢI đổi sang DB đám mây. DB đang RỖNG nên đổi provider gần như miễn phí. Chốt: **Postgres** (Neon hoặc Vercel Postgres — cùng chuẩn, Prisma hỗ trợ sẵn không cần adapter).

### 👥 Phân công rõ (T6 là việc PHỐI HỢP, không phải AI code hết)

**A. Việc của Gemini (CODE) — làm trước, verify build local:**
1. `prisma/schema.prisma`: đổi `datasource db { provider = "sqlite"; url = "file:./dev.db" }` → `provider = "postgresql"; url = env("DATABASE_URL")`. (Schema hiện chỉ dùng String/Int/Boolean/DateTime/cuid() → tương thích Postgres 100%, KHÔNG cần sửa model.)
2. `package.json`: đổi build script `"build": "next build"` → **`"build": "prisma generate && next build"`** (nếu không, Vercel build fail vì thiếu Prisma Client).
3. `frontend/.env.example`: thêm dòng `DATABASE_URL=` (mẫu, không giá trị). Giữ `JWT_SECRET=`.
4. **Verify build local:** tạo 1 Postgres free tạm (Neon) HOẶC báo User cấp `DATABASE_URL`, đặt vào `frontend/.env`, chạy `npx prisma db push` (tạo bảng trên Postgres) + `npm run build` → phải PASS, không lỗi.
5. (Tiện tay) Task phụ T6b: thêm nút "🚩 Báo cáo mã xấu" ở chợ mã (`/su-kien/chung-suc`) — 1 model `Report` hoặc field `reportCount` + action tăng đếm, ẩn mã khi bị báo cáo nhiều. (Nếu hết thời gian, để TODO riêng.)
6. Xong: cập nhật T6 + ghi Work Log. **KHÔNG commit file `.env` (đã gitignore) — chỉ commit `.env.example`.**

**B. Việc của User (TÀI KHOẢN — Claude/Gemini KHÔNG làm thay được):**
1. Tạo DB Postgres free: **neon.tech** (hoặc bật Vercel Postgres trong dashboard) → copy chuỗi `DATABASE_URL` (dạng `postgresql://...`).
2. Đưa code lên GitHub: repo hiện `github.com/kienggggg/lienquan` đang chứa web TĨNH (docs/). NÊN tạo **repo MỚI riêng cho web app** (vd `lienquan-web`) để khỏi lẫn — rồi push thư mục `lqmeta/frontend` (hoặc cả `lqmeta`) lên. *(Gemini/Claude commit hộ được nhưng PUSH cần User đăng nhập GitHub.)*
3. Vercel (vercel.com, đăng nhập bằng GitHub): New Project → chọn repo → **Root Directory = `frontend`** (vì app nằm trong thư mục con) → Framework tự nhận Next.js.
4. Ở Vercel → Settings → Environment Variables, thêm: **`JWT_SECRET`** (chuỗi ngẫu nhiên mạnh, KHÁC file local — chạy `openssl rand -base64 48`) + **`DATABASE_URL`** (từ bước 1).
5. Deploy. Sau khi deploy lần đầu, chạy `npx prisma db push` trỏ tới `DATABASE_URL` đám mây (từ máy local) để tạo bảng — HOẶC thêm vào build script tạm.

**C. Việc của Claude (Chỉ huy — REVIEW):**
- Duyệt: schema đổi đúng, build script có `prisma generate`, KHÔNG commit secret, `.env.example` đủ biến, build local PASS trước khi đẩy.

### ✅ Tiêu chí nghiệm thu T6
1. `npm run build` (local, với DATABASE_URL Postgres) PASS.
2. Trang deploy trên Vercel mở được (link `*.vercel.app`), đăng ký/đăng nhập/đăng bài chạy thật trên DB đám mây (data KHÔNG mất sau reload).
3. Không lỗi "Missing JWT_SECRET" (đã set env trên Vercel).
4. Không có secret nào bị commit lên GitHub (`.env` gitignored, chỉ `.env.example`).

### ⚠️ Ràng buộc
- Không đổi kiến trúc khác (giữ Next.js + Prisma + Server Actions).
- Migration DB không mất mát vì DB đang rỗng — nếu có data test thì kệ, tạo mới trên Postgres.

**[21/07/2026 - Claude (Chỉ huy)] - T6 Phần A: chuẩn bị deploy (đổi DB + build)**
- User giao tự làm Phần A (chỗ dễ hỏng). Đã: (1) schema.prisma `sqlite`→`postgresql` url=env(DATABASE_URL) — schema tương thích 100%, không sửa model; (2) build script → `prisma generate && next build` + thêm `postinstall: prisma generate` (Vercel cần); (3) `.env.example` thêm DATABASE_URL.
- **🔴 Chặn được 1 lỗi deploy-killer:** `npm run build` FAIL ở type-check `page.tsx:130` (`h` implicit any) — Antigravity CHƯA từng chạy `npm run build` thật (next dev không type-check). Đã vá `(h: any)`. Build giờ PASS (15 route đều Dynamic, không cần DB lúc build).
- **CÒN LẠI = Phần B (chỉ User làm được):** tạo Neon Postgres → DATABASE_URL; tạo repo GitHub + push frontend; Vercel New Project (Root=frontend) + set env JWT_SECRET & DATABASE_URL; sau deploy chạy `prisma db push` lên DB đám mây tạo bảng.
- **⚠️ Lưu ý cho Gemini:** local dev từ giờ CẦN DATABASE_URL Postgres (dùng chính URL Neon là được, Neon chạy từ localhost). SQLite `dev.db` cũ bỏ đi.

**[21/07/2026 - Claude (Chỉ huy)] - T6 XONG: web LIVE trên Vercel**
- User deploy thành công: **https://lienquan-web-zeta.vercel.app**. Nghiệm thu live: mọi route 200, trang chủ có hero banner (Lauriel), /players & /articles query Neon OK (không 500) → DATABASE_URL + JWT_SECRET trên Vercel đúng.
- **Workflow cập nhật từ giờ:** sửa code → `git push` → Vercel TỰ redeploy (CI/CD). Không cần thao tác tay trên Vercel nữa.
- **Web KHÔNG cần máy user bật** — chạy 24/7 trên cloud Vercel + DB Neon.
- Việc tiếp (Command Board): T2 (làm giàu comps/items), T5 (Team Builder), T7 (nạp win/pick thật). T4 Hallmark đã áp 1 phần.

---

## 9. SPEC CHI TIẾT — T5: TEAM BUILDER (Chỉ huy Claude giao Gemini)

> **File tạo:** `frontend/src/app/team-builder/page.tsx` (+ client component + server action). Thêm link nav "Tạo đội hình" vào layout (nhóm Tướng dropdown). Xong đổi T5=✅ + ghi Work Log.

### 🎯 Mục tiêu
Trang cho người dùng TỰ ghép đội hình 5 tướng (1 mỗi đường), đặt tên, LƯU vào DB (model `Team` đã có sẵn: `id/name/composition/authorId`). Là tính năng tương tác lá cờ đầu (mọi web meta game đều có — MetaTFT có "Team Builder").

### 📦 Dữ liệu & Model (đã có sẵn)
- Đọc tướng từ `data/heroes.json` (như `page.tsx` đang làm) — mỗi tướng có `id`, `name`, `img`, `lane` (1 trong: `Rừng`/`Rồng`/`Trung`/`Tà Thần`/`Hỗ trợ`), `roles`.
- Model Prisma `Team { id, name, composition (String - JSON), authorId }` ĐÃ CÓ. `composition` = chuỗi JSON mảng 5 hero id, vd `["murad","violet","lauriel","thane","alice"]`.

### 🎨 Layout
- **5 ô đường** (Rừng · Rồng · Trung · Tà Thần · Hỗ trợ) nằm ngang. Mỗi ô: bấm vào → hiện danh sách tướng CỦA ĐÚNG ĐƯỜNG ĐÓ (lọc `h.lane === lane`) để chọn; chọn xong ô hiện avatar+tên tướng, có nút ✕ bỏ chọn.
- Ô input **tên đội hình** + nút **"💾 Lưu đội hình"** (chỉ bật khi đã chọn đủ/đăng nhập).
- Dưới cùng: **"Đội hình của tôi"** — list các Team user đã lưu (nếu đăng nhập), mỗi cái hiện tên + 5 avatar nhỏ.
- Chưa đăng nhập: vẫn ghép/xem được, nhưng bấm Lưu → nhắc đăng nhập (link /login).

### 🧩 Kỹ thuật
- Trang chọn tướng = **client component** (`'use client'`, dùng `useState` giữ 5 lựa chọn). Truyền danh sách tướng (đã lọc gọn: id/name/img/lane) từ Server Component cha xuống props.
- **Server action** `saveTeam(name, composition)` ở `src/app/actions/teams.ts`: guard đăng nhập (`getSession`), validate name>=2 + composition có ít nhất 1 tướng, `prisma.team.create`. `revalidatePath`.
- List "đội hình của tôi": query `prisma.team.findMany({ where:{authorId}, orderBy:{createdAt:'desc'} })` ở Server Component; parse `composition` JSON → map ra avatar (tra id trong heroes.json).
- Nav: thêm `<a href="/team-builder">Tạo đội hình</a>` vào dropdown nhóm **Tướng** trong `layout.tsx`.

### ✅ Tiêu chí nghiệm thu (Chỉ huy review)
1. `npm run build` PASS (❗nhớ: mọi param map phải có kiểu, tránh lỗi implicit-any như T3 — build mới bắt).
2. Chọn được 1 tướng/đường (đúng tướng theo lane), bỏ chọn được.
3. Đăng nhập → lưu đội hình → hiện trong "Đội hình của tôi" (lưu thật vào Neon).
4. Chưa đăng nhập → bấm Lưu nhắc đăng nhập, KHÔNG crash.
5. Vanilla CSS (thêm class mới nếu cần), Server Action, không Tailwind.
6. Trang `/team-builder` phải có `export const dynamic = 'force-dynamic'` (vì query DB) — nếu không build sẽ cố prerender + nối Neon lúc build → fail.

### ⚠️ Nhắc quan trọng (rút từ T3)
- CHẠY `npm run build` TRƯỚC KHI BÀN GIAO (không chỉ `npm run dev`) — dev không bắt lỗi type, build mới bắt. Deploy Vercel = chạy build, sai type là fail.

**[21/07/2026 - Claude (Chỉ huy)] - Seed 15 bài hướng dẫn mẫu (thay vì cào Học viện)**
- User muốn cào Học viện lấy build/lối chơi làm mẫu. Chỉ huy quyết KHÔNG cào (Học viện render JS khó cào + prose là bản quyền người viết → AdSense reject). THAY BẰNG: seed từ chính data engine mình (play/pros/cons/combo tính từ bộ kỹ năng — 100% gốc).
- Tạo user hệ thống `AURA` (email aura@lienquan.system, không login được) làm tác giả; seed 15 bài "Hướng dẫn chơi [Tướng]" vào Neon (script chạy 1 lần, idempotent — xóa bài AURA cũ rồi seed lại). Đã verify hiện trên live /articles.
- Ý đồ: có mẫu ngay cho web đỡ trống; sau này bài user đánh giá cao (qua T9 vote) nổi lên thay dần. Thêm task T8/T9/T10 cho hướng "tự do như MetaTFT" + forum nhẹ.
- **Nhắc:** nếu chạy lại seed hoặc reset DB, bài AURA sẽ tạo lại; đừng seed trùng.

---

## 10. SPEC CHI TIẾT — T9: VOTE bài viết / build cộng đồng (Chỉ huy Claude giao Gemini)

> **Mục tiêu:** cho user "vote" (thích/hữu ích) bài viết → bài điểm cao nổi lên đầu = "meta do cộng đồng chọn". Đây là cốt lõi để bài mẫu AURA bị bài hay của user thay dần.

### 📦 Model MỚI (thêm vào schema.prisma rồi `npx prisma db push` + generate)
```prisma
model Vote {
  id        String   @id @default(cuid())
  userId    String
  user      User     @relation(fields: [userId], references: [id])
  articleId String
  article   Article  @relation(fields: [articleId], references: [id], onDelete: Cascade)
  createdAt DateTime @default(now())
  @@unique([userId, articleId])   // 1 người vote 1 bài đúng 1 lần (chống farm)
}
```
- Thêm quan hệ ngược: model `User` thêm `votes Vote[]`; model `Article` thêm `votes Vote[]`.

### ⚙️ Server action `src/app/actions/votes.ts`
- `toggleVote(articleId)`: guard đăng nhập; nếu đã vote → xoá (bỏ vote), nếu chưa → tạo. Trả `{ voted: bool, count: number }`. `revalidatePath`.
- Cộng/trừ 1 uy tín cho TÁC GIẢ bài mỗi lần vote/bỏ vote (không cộng nếu tự vote bài mình — như logic comment đã có).

### 🎨 UI
- Trang `/articles` + trang chi tiết `/articles/[id]`: nút **👍 số-vote** (client component nhỏ), bấm toggle, hiện trạng thái đã-vote (đổi màu). Dùng `useActionState`/`useTransition`.
- `/articles`: thêm nút sắp xếp **"🔥 Nổi bật"** (sort theo số vote desc) vs "Mới nhất" (createdAt). Đếm vote qua `_count: { select: { votes: true } }`.

### ✅ Tiêu chí nghiệm thu (Chỉ huy review)
1. `npm run build` PASS (❗nhớ type đủ, tránh implicit-any).
2. Đăng nhập → vote 1 bài → số tăng, nút đổi trạng thái; vote lại → bỏ vote (toggle). Vote lần 2 KHÔNG farm được (schema @@unique + toggle).
3. Sort "Nổi bật" đẩy bài nhiều vote lên đầu.
4. Chưa login → bấm vote nhắc đăng nhập, không crash.
5. `prisma db push` chạy trên Neon (DATABASE_URL trong .env) — báo Chỉ huy nếu cần.
6. Vanilla CSS, Server Action, không Tailwind.

### ⚠️ Nhắc: chạy `npm run build` TRƯỚC khi bàn giao (dev không bắt lỗi type). Xong đổi T9=✅ + ghi Work Log.
