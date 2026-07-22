"""Gộp win/pick/ban (OCR từ game) vào data/heroes.json — số THẬT thay số mẫu.

    python merge_winrate.py

Khớp theo tên chuẩn hoá. Báo tướng khớp / không khớp để soát tay.
"""

from __future__ import annotations

import json
import re
import unicodedata
from pathlib import Path

DATA = Path(__file__).parent / "data"
# Tên OCR khác tên roster -> bắc cầu (điền dần khi thấy lệch).
ALIAS = {"ngokhong": "wukong", "lubo": "lubu"}


def norm(s: str) -> str:
    s = unicodedata.normalize("NFD", s)
    s = "".join(c for c in s if unicodedata.category(c) != "Mn")
    s = s.replace("đ", "d").replace("Đ", "d")
    return re.sub(r"[^a-z0-9]", "", s.lower())


def main() -> None:
    hp = DATA / "heroes.json"
    doc = json.loads(hp.read_text(encoding="utf-8"))
    heroes = doc["heroes"]
    wr = json.loads((DATA / "garena_winrate.json").read_text(encoding="utf-8"))["heroes"]

    # index heroes.json theo tên chuẩn hoá (+ id + alias)
    idx: dict[str, dict] = {}
    for h in heroes:
        for k in {norm(h["name"]), h["id"], ALIAS.get(h["id"], "")}:
            if k:
                idx.setdefault(k, h)

    matched, unmatched = 0, []
    for row in wr:
        key = norm(row["name"])
        h = idx.get(key) or idx.get(ALIAS.get(key, ""))
        if h:
            h["winrate"] = row["win"]
            h["pickrate"] = row["pick"]
            h["banrate"] = row["ban"]
            h.pop("templated", None)     # có số thật rồi, bỏ cờ mẫu
            matched += 1
        else:
            unmatched.append(row["name"])

    doc["patch"] = "Số liệu THẬT từ Bảng Phân Bậc Tướng (Garena, OCR)"
    doc["source"] = "Win/pick/ban: chính thống trong game Garena"
    hp.write_text(json.dumps(doc, ensure_ascii=False, indent=1), encoding="utf-8")
    print(f"[OK] khớp {matched}/{len(wr)} tướng, nạp win/pick/ban thật.")
    if unmatched:
        print(f"  ⚠️ {len(unmatched)} tên OCR không khớp roster (soát tay): {unmatched}")


if __name__ == "__main__":
    main()
