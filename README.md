# Liên Quân Tổng Hợp

Trang tổng hợp meta **Liên Quân Mobile / Arena of Valor** kiểu MetaTFT: bảng xếp
hạng tướng, **khắc chế**, **phối hợp**, **đội hình mạnh nhất** và **trang bị** —
tất cả **tính từ bộ kỹ năng của tướng**, không cào và không bịa.

> ⚠️ Bản mẫu. Win/pick rate là dữ liệu MẪU; nhiều tướng còn dùng thuộc tính theo
> mẫu vai trò (đánh dấu "chờ tinh chỉnh"). Cập nhật số thật là việc vận hành.

## Ý tưởng

Các web hiện có chỉ hiện *win-rate / pick-rate* trơ. Giá trị riêng ở đây là **tầng
phân tích tính bằng luật**:

- **Khắc chế** tách 2 loại: *cùng đường* (đối đầu đi đường — tầm, hồi máu, all-in)
  và *khác đường* (giao tranh/bản đồ — lao vào, khóa sát thủ, poke, mạnh-sớm bóp mạnh-muộn).
- **Phối hợp** giữa các tướng (mở giao tranh + dồn, tuyến đầu + chủ lực, bảo kê…).
- **Đội hình** ghép 1 tướng/đường, chấm điểm ăn ý toàn đội, phân theo lối chơi.
- **Trang bị** gợi ý theo vai trò + loại sát thương.

## Cấu trúc

```
data/heroes.json   # tướng: attr(0-3) từ kỹ năng, spike, ưu/nhược/vận hành, win/pick
data/items.json    # trang bị theo nhóm
engine.py          # bộ luật tính khắc chế / phối hợp / đội hình / trang bị / tier
build_site.py      # dựng site tĩnh -> docs/
docs/              # site đã dựng (GitHub Pages phục vụ từ đây)
```

## Cập nhật & dựng lại

```bash
python build_site.py     # đọc data/ -> dựng lại docs/
```

Sửa `data/heroes.json` (win/pick mới, thêm tướng, tinh chỉnh thuộc tính) rồi chạy
lại một lệnh trên là cả web đồng bộ. Thêm tướng nhập gọn:

```json
{"id":"ten_id","name":"Tên","roles":["Sát thủ"],"lane":"Rừng"}
```

các trường còn thiếu tự điền theo mẫu vai trò cho tới khi được tinh chỉnh riêng.

## Deploy (GitHub Pages)

Repo đẩy lên GitHub → Settings → Pages → Source: `main` / thư mục `/docs`.
Trang chạy tại `https://<user>.github.io/<repo>/`.
