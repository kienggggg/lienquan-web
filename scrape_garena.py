"""Cào dữ liệu tướng CHÍNH THỐNG từ trang Học viện Liên Quân (Garena).

    python scrape_garena.py        # -> data/garena_heroes.json

Nguồn: https://lienquan.garena.vn/hoc-vien/tuong-skin/ (WordPress SSR, HTML tĩnh).
Lấy: roster đầy đủ (tên/slug/vai trò/ảnh chân dung) + bộ KỸ NĂNG chính thống mỗi
tướng (tên chiêu + icon + mô tả). Đây là dữ liệu game THỰC TẾ (fact) — trang mình
hiển thị kèm ghi nguồn, và phần phân tích (khắc chế/đội hình) do engine tự tính.

Lịch sự: có delay giữa các request, User-Agent trình duyệt. ~128 tướng ~vài phút.
"""

from __future__ import annotations

import html as _html
import json
import re
import sys
import time
import urllib.request
from pathlib import Path

BASE = "https://lienquan.garena.vn"
ROSTER = f"{BASE}/hoc-vien/tuong-skin/"
DATA = Path(__file__).parent / "data"
UA = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"}

# data-id nút lọc -> vai trò (khớp tên engine: Trợ thủ -> Hỗ trợ)
ROLE_ID = {"28": "Đấu sĩ", "29": "Pháp sư", "30": "Hỗ trợ",
           "31": "Đỡ đòn", "32": "Sát thủ", "33": "Xạ thủ"}


def _get(url: str, tries: int = 3) -> str:
    for i in range(tries):
        try:
            req = urllib.request.Request(url, headers=UA)
            with urllib.request.urlopen(req, timeout=30) as r:
                return r.read().decode("utf-8", errors="replace")
        except Exception as e:  # noqa: BLE001
            if i == tries - 1:
                raise
            time.sleep(3 * (i + 1))
    return ""


def _clean(t: str) -> str:
    t = re.sub(r"<[^>]+>", " ", t)
    t = _html.unescape(t)
    return re.sub(r"\s+", " ", t).strip()


def _id_from_slug(slug: str) -> str:
    return re.sub(r"[^a-z0-9]+", "", slug.lower()) or slug


def parse_roster(html: str) -> list[dict]:
    """Mỗi item: href/slug, data-type (vai trò), tên, ảnh."""
    out, seen = [], set()
    for m in re.finditer(
        r'href="([^"]*tuong-skin/d/([^"/]+)/)"\s+class="st-heroes__item"\s+'
        r'data-keyword="([^"]*)"\s+data-type="(\[[^\]]*\])"[^>]*>.*?'
        r'<img src="([^"]+)"[^>]*>\s*</div>\s*<h2[^>]*>\s*([^<]+?)\s*</h2>',
        html, re.DOTALL,
    ):
        url, slug, _kw, types_raw, img, name = m.groups()
        name = _html.unescape(name.strip())
        ids = re.findall(r"\d+", types_raw)
        roles = [ROLE_ID[i] for i in ids if i in ROLE_ID]
        key = _id_from_slug(slug)
        if key in seen or not roles:
            continue
        seen.add(key)
        out.append({"id": key, "slug": slug, "name": name, "url": url,
                    "roles": roles, "img": img.strip()})
    return out


def parse_skills(html: str) -> list[dict]:
    """[{name, icon, desc}] từ khối hero__skills."""
    icons = dict(re.findall(r'title="([^"]+)"\s*>\s*<img[^>]*\bsrc="([^"]+)"', html))
    skills = []
    for m in re.finditer(
        r'hero__skills--detail[^"]*"\s+id="heroSkill-\d+">\s*<h3>([^<]+)</h3>\s*<article>(.*?)</article>',
        html, re.DOTALL,
    ):
        name = _html.unescape(m.group(1).strip())
        desc = _clean(m.group(2))
        if name and desc:
            skills.append({"name": name, "icon": icons.get(name, ""), "desc": desc})
    return skills


def main() -> None:
    if sys.stdout.encoding and sys.stdout.encoding.lower() != "utf-8":
        sys.stdout.reconfigure(encoding="utf-8")
    print("Tải roster...")
    roster = parse_roster(_get(ROSTER))
    print(f"  {len(roster)} tướng.")
    if not roster:
        raise SystemExit("Không parse được roster — trang có thể đã đổi cấu trúc.")

    for i, h in enumerate(roster, 1):
        try:
            h["skills"] = parse_skills(_get(h["url"]))
        except Exception as e:  # noqa: BLE001
            h["skills"] = []
            print(f"  ! {h['name']}: {e}")
        print(f"  [{i}/{len(roster)}] {h['name']} — {len(h['skills'])} kỹ năng")
        time.sleep(0.5)

    DATA.mkdir(exist_ok=True)
    out = DATA / "garena_heroes.json"
    out.write_text(json.dumps({
        "_note": "Cào từ lienquan.garena.vn/hoc-vien/tuong-skin (dữ liệu game chính thống). "
                 "Kỹ năng = mô tả chính thức; trang hiển thị kèm ghi nguồn.",
        "source": "https://lienquan.garena.vn/hoc-vien/tuong-skin/",
        "scraped_at": time.strftime("%Y-%m-%d"),
        "heroes": roster,
    }, ensure_ascii=False, indent=1), encoding="utf-8")
    n_sk = sum(1 for h in roster if h["skills"])
    print(f"[OK] {len(roster)} tướng ({n_sk} có kỹ năng) -> {out}")


if __name__ == "__main__":
    main()
