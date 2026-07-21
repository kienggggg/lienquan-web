"""Cào tin tức + sự kiện CHÍNH THỐNG từ lienquan.garena.vn -> data/news.json.

    python scrape_news.py

Chỉ lấy TIÊU ĐỀ + LINK + ẢNH (tổng hợp kiểu aggregator, bấm vào mở trang gốc của
Garena — KHÔNG sao chép nội dung bài). Web app Next.js đọc news.json để render 2
mục Tin tức & Sự kiện. Nên chạy lại định kỳ (AURA/cron) cho tươi.
"""

from __future__ import annotations

import html as H
import json
import re
import sys
import time
import urllib.request
from pathlib import Path

DATA = Path(__file__).parent / "data"
UA = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"}
SOURCES = [
    ("https://lienquan.garena.vn/tin-tuc/", "tin-tuc"),
    ("https://lienquan.garena.vn/cap-nhat/", "cap-nhat"),
]
# Tiêu đề chứa từ khoá này -> xếp vào Sự kiện (còn lại là Tin tức).
EVENT_KW = ("sự kiện", "event", "thi đua", "cộng đồng", "quà", "sưu tầm",
            "ngày hội", "watch party", "giải đấu", "tri ân", "nhận", "tặng")


def _get(url: str) -> str:
    req = urllib.request.Request(url, headers=UA)
    with urllib.request.urlopen(req, timeout=30) as r:
        return r.read().decode("utf-8", errors="replace")


def parse(html: str) -> list[dict]:
    out, seen = [], set()
    for m in re.finditer(
        r'<a[^>]+href="(https://lienquan\.garena\.vn/[a-z0-9-]{8,}/)"[^>]*>(.*?)</a>',
        html, re.DOTALL,
    ):
        href, inner = m.group(1), m.group(2)
        tm = re.search(r'alt="([^"]{12,})"', inner) or re.search(r'>([^<>]{18,})<', inner)
        if not tm or href in seen:
            continue
        title = H.unescape(re.sub(r"\s+", " ", tm.group(1)).strip())
        if len(title) < 12:
            continue
        seen.add(href)
        img = re.search(r'src="([^"]+\.(?:jpg|png|webp))"', inner)
        out.append({"title": title[:120], "url": href,
                    "img": img.group(1) if img else ""})
    return out


def main() -> None:
    if sys.stdout.encoding and sys.stdout.encoding.lower() != "utf-8":
        sys.stdout.reconfigure(encoding="utf-8")
    items, seen = [], set()
    for url, cat in SOURCES:
        try:
            for it in parse(_get(url)):
                if it["url"] in seen:
                    continue
                seen.add(it["url"])
                low = it["title"].lower()
                it["type"] = "event" if any(k in low for k in EVENT_KW) else "news"
                items.append(it)
        except Exception as e:  # noqa: BLE001
            print(f"  ! {url}: {e}")
    (DATA / "news.json").write_text(json.dumps({
        "_note": "Tiêu đề+link tổng hợp từ lienquan.garena.vn (chính thống). Bấm mở trang gốc.",
        "source": "https://lienquan.garena.vn", "updated": time.strftime("%d/%m/%Y %H:%M"),
        "items": items,
    }, ensure_ascii=False, indent=1), encoding="utf-8")
    n_ev = sum(1 for i in items if i["type"] == "event")
    print(f"[OK] {len(items)} mục ({n_ev} sự kiện, {len(items)-n_ev} tin) -> data/news.json")


if __name__ == "__main__":
    main()
