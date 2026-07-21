# Bộ Quy Tắc Luân Phiên (Handoff Rules) - Dự án Liên Quân Meta

**CẢNH BÁO QUAN TRỌNG:** Dự án này được luân phiên phát triển bởi nhiều phiên bản AI (Claude, Gemini...). Để tiết kiệm token và tránh việc "người sau dọn rác người trước", MỌI AGENT phải tuân thủ nghiêm ngặt các quy tắc sau:

## 1. Tôn Trọng Kiến Trúc Đã Chọn (Không Đập Xây Lại)
- **Cấm tự ý đổi Tech Stack:** Dự án sử dụng Next.js 15 (App Router), Prisma ORM + SQLite, và Custom JWT Auth. Tuyệt đối không đề xuất hay tự ý cài đặt NextAuth, Firebase, TailwindCSS, hay chuyển sang React SPA.
- **CSS Thuần là Chân lý:** Giao diện đang dùng Vanilla CSS tại `globals.css` kế thừa từ bản cũ rất chuẩn. Không được sửa đổi hay xóa class cũ, chỉ được viết thêm nếu có chức năng mới hoàn toàn.

## 2. Nguồn Dữ Liệu Rõ Ràng
- Dữ liệu tĩnh gốc của game (thông tin tướng, kỹ năng) nằm ở `data/garena_heroes.json` (do script python cào về). **Tuyệt đối không sửa file JSON này bằng tay**.
- Mọi dữ liệu động (Tài khoản, Bài viết, Đội hình) lưu trong SQLite qua Prisma. Không trộn lẫn dữ liệu tĩnh của game vào SQLite để tránh rác DB.

## 3. Vệ Sinh Mã Nguồn (Code Hygiene)
- Không bao giờ bàn giao khi code đang bị lỗi (Syntax Error, Build Fail). Trước khi kết thúc phiên, phải đảm bảo app có thể chạy được `npm run dev`.
- Không tạo các file nháp (scratch) rồi vứt trong thư mục gốc.

## 4. Cập Nhật AI_SYNC.md
- Đây là nghĩa vụ BẮT BUỘC. Bất kỳ khi nào làm xong một Task lớn, phải mở file `AI_SYNC.md` ra và:
  1. Đánh dấu `[x]` vào việc đã làm.
  2. Ghi rõ phần "Lời Nhắn Giao Việc (Handoff Note)" cho AI tiếp theo biết chính xác vị trí file đang code dở và logic tiếp theo cần làm.

## 5. Nhật Ký Thảo Luận (Work Log)
- Tại mục "6. Nhật Ký Làm Việc & Thảo Luận" trong `AI_SYNC.md`, mỗi AI khi kết thúc ca làm việc phải **tự xưng danh** (ví dụ: "Tôi là Claude/Gemini"), tóm tắt ngắn gọn phong cách code của mình (những thư viện/pattern ưu tiên sử dụng) và để lại hướng dẫn cụ thể về logic đã viết để AI sau hiểu rõ cách làm.

## 6. Tiết Kiệm Token
- Tránh việc đọc lại toàn bộ `globals.css` hay `build_site.py` trừ khi thực sự cần thiết.
- Dùng chức năng tìm kiếm (grep) thay vì list toàn bộ thư mục.
