"""Bóc win/pick/ban từ ảnh chụp 'Bảng Phân Bậc Tướng' trong game (easyocr).

    python scrape_winrate_ocr.py

Đọc mọi ảnh z8068*.jpg trong D:\\AURA_OS_v2 (ảnh user chụp bảng tỉ lệ thắng chính
thức trong app Garena) -> data/garena_winrate.json {name, tier, win, pick, ban}.
Mỗi hàng OCR ra thứ tự: Tên, Tier(T4..), Win%, Pick%, Ban%, Vai trò.
"""

from __future__ import annotations

import json
import re
import sys
from pathlib import Path

IMG_DIR = Path(r"D:\AURA_OS_v2")
OUT = Path(__file__).parent / "data" / "garena_winrate.json"
PCT = re.compile(r"^(\d+),(\d+)%$")
TIER = re.compile(r"^T\d+$")


def parse_tokens(tokens: list[str]) -> list[dict]:
    rows = []
    for i, tk in enumerate(tokens):
        t = tk.strip()
        if not TIER.match(t):
            continue
        name = tokens[i - 1].strip() if i > 0 else ""
        nums = []
        j = i + 1
        while j < len(tokens) and len(nums) < 3:
            m = PCT.match(tokens[j].strip())
            if m:
                nums.append(round(float(f"{m.group(1)}.{m.group(2)}"), 2))
                j += 1
            else:
                break
        if name and len(nums) == 3 and len(name) >= 2 and not TIER.match(name):
            rows.append({"name": name, "tier": t,
                         "win": nums[0], "pick": nums[1], "ban": nums[2]})
    return rows


def main() -> None:
    if sys.stdout.encoding and sys.stdout.encoding.lower() != "utf-8":
        sys.stdout.reconfigure(encoding="utf-8")
    import easyocr
    import warnings
    warnings.filterwarnings("ignore")
    reader = easyocr.Reader(["vi", "en"], gpu=False, verbose=False)

    imgs = sorted(IMG_DIR.glob("z8068*.jpg"))
    print(f"OCR {len(imgs)} ảnh...")
    by_name: dict[str, dict] = {}
    for k, img in enumerate(imgs, 1):
        tokens = reader.readtext(str(img), detail=0)
        rows = parse_tokens(tokens)
        for r in rows:
            by_name[r["name"]] = r          # trùng thì lấy bản sau (ảnh nét hơn)
        print(f"  [{k}/{len(imgs)}] {img.name[:22]} -> {len(rows)} tướng")

    data = sorted(by_name.values(), key=lambda x: -x["win"])
    OUT.write_text(json.dumps({
        "_note": "Win/pick/ban CHÍNH THỐNG từ Bảng Phân Bậc Tướng trong app Garena (user chụp, OCR).",
        "source": "in-game Garena", "heroes": data,
    }, ensure_ascii=False, indent=1), encoding="utf-8")
    print(f"[OK] {len(data)} tướng có win/pick/ban -> {OUT}")


if __name__ == "__main__":
    main()
