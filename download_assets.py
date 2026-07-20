"""Tải ảnh tướng + icon kỹ năng + icon trang bị về LOCAL (assets/img/).

    python download_assets.py

Thay vì hotlink CDN Garena (bền hơn, không lệ thuộc mạng họ, load nhanh). Tên
file = hash của URL (ổn định) -> build_site.py tự map URL->file local bằng cùng
hàm hash, không cần manifest. Ảnh đã tải thì bỏ qua (chạy lại chỉ tải phần thiếu).
"""

from __future__ import annotations

import hashlib
import json
import sys
import time
import urllib.request
from pathlib import Path

ROOT = Path(__file__).parent
DATA = ROOT / "data"
IMGDIR = ROOT / "assets" / "img"
UA = {"User-Agent": "Mozilla/5.0", "Referer": "https://lienquan.garena.vn/"}


def local_name(url: str) -> str:
    """Tên file local ổn định từ URL (build_site dùng lại đúng hàm này)."""
    ext = ".png"
    for e in (".png", ".jpg", ".jpeg", ".webp", ".gif"):
        if e in url.lower():
            ext = ".jpg" if e == ".jpeg" else e
            break
    return hashlib.md5(url.encode("utf-8")).hexdigest()[:16] + ext


def collect_urls() -> set[str]:
    urls: set[str] = set()
    hf = DATA / "garena_heroes.json"
    if hf.is_file():
        for h in json.loads(hf.read_text(encoding="utf-8")).get("heroes", []):
            if h.get("img"):
                urls.add(h["img"])
            for s in h.get("skills", []):
                if s.get("icon"):
                    urls.add(s["icon"])
    itf = DATA / "garena_items.json"
    if itf.is_file():
        for it in json.loads(itf.read_text(encoding="utf-8")).get("items", []):
            if it.get("icon"):
                urls.add(it["icon"])
    return {u for u in urls if u.startswith("http")}


def main() -> None:
    if sys.stdout.encoding and sys.stdout.encoding.lower() != "utf-8":
        sys.stdout.reconfigure(encoding="utf-8")
    IMGDIR.mkdir(parents=True, exist_ok=True)
    urls = sorted(collect_urls())
    print(f"{len(urls)} ảnh cần đảm bảo có local...")
    got = skipped = failed = 0
    for i, url in enumerate(urls, 1):
        dst = IMGDIR / local_name(url)
        if dst.exists() and dst.stat().st_size > 0:
            skipped += 1
            continue
        try:
            from urllib.parse import quote
            safe = quote(url, safe=":/?#[]@!$&'()*+,;=~%")   # né URL có ký tự non-ASCII
            req = urllib.request.Request(safe, headers=UA)
            with urllib.request.urlopen(req, timeout=30) as r:
                data = r.read()
            if len(data) < 200:
                raise ValueError("file quá nhỏ")
            dst.write_bytes(data)
            got += 1
        except Exception as e:  # noqa: BLE001
            failed += 1
            print(f"  ! {url[-40:]}: {e}")
        if i % 60 == 0:
            print(f"  [{i}/{len(urls)}] tải {got}, bỏ qua {skipped}, lỗi {failed}")
        time.sleep(0.15)
    total = sum(1 for _ in IMGDIR.glob("*"))
    print(f"[OK] tải mới {got}, có sẵn {skipped}, lỗi {failed} | tổng {total} file trong assets/img/")


if __name__ == "__main__":
    main()
