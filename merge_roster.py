"""Gộp roster cào từ Garena vào data/heroes.json.

    python merge_roster.py     # garena_heroes.json (nền) + overlay tay -> heroes.json

Cào là NỀN (roster đầy đủ + tên/vai trò/ảnh/kỹ năng CHÍNH THỐNG). Số liệu tay của
mình (attr, spike, pros/cons, play, winrate, tags, combo — thứ engine cần để tính
khắc chế/đội hình) được OVERLAY lên tướng khớp (theo id hoặc tên chuẩn hoá). Tướng
mình từng chỉnh tay mà không có trong cào thì giữ nguyên (không mất công sức cũ).
"""

from __future__ import annotations

import json
import re
import unicodedata
from pathlib import Path

DATA = Path(__file__).parent / "data"
# Field số liệu TAY (engine cần) — overlay từ heroes.json cũ lên tướng cào.
OVERLAY_KEYS = ("attr", "spike", "lane", "damage", "pros", "cons", "play",
                "combo", "tags", "winrate", "pickrate", "intro")
# Tên mình đặt khác tên chính thống Garena -> bắc cầu để overlay đúng tướng.
ALIAS = {"wukong": "ngokhong", "riktor": "richter", "lubu": "lubo"}


def norm(s: str) -> str:
    s = unicodedata.normalize("NFD", s)
    s = "".join(c for c in s if unicodedata.category(c) != "Mn")
    s = s.replace("đ", "d").replace("Đ", "d")
    return re.sub(r"[^a-z0-9]", "", s.lower())


def main() -> None:
    scraped = json.loads((DATA / "garena_heroes.json").read_text(encoding="utf-8"))
    old = json.loads((DATA / "heroes.json").read_text(encoding="utf-8"))
    old_heroes = old.get("heroes", [])

    # Index overlay tay theo id + tên chuẩn hoá (+ alias sang tên Garena).
    overlay: dict[str, dict] = {}
    for h in old_heroes:
        keys = {h.get("id", ""), norm(h.get("name", ""))}
        keys.add(ALIAS.get(h.get("id", ""), ""))
        for key in keys:
            if key:
                overlay.setdefault(key, h)

    # Dedupe tướng cào theo tên chuẩn hoá (vd Flowborn bị liệt kê 2 lần) — gộp vai trò.
    dedup: dict[str, dict] = {}
    for g in scraped["heroes"]:
        k = norm(g["name"])
        if k in dedup:
            for r in g["roles"]:
                if r not in dedup[k]["roles"]:
                    dedup[k]["roles"].append(r)
        else:
            dedup[k] = g

    merged, used_old = [], set()
    for g in dedup.values():
        rec = {"id": g["id"], "name": g["name"], "roles": g["roles"],
               "lane": None, "img": g.get("img", ""), "skills": g.get("skills", [])}
        # tìm overlay
        o = overlay.get(g["id"]) or overlay.get(norm(g["name"]))
        if o:
            used_old.add(o["id"])
            for k in OVERLAY_KEYS:
                if k in o and o[k] not in (None, "", []):
                    rec[k] = o[k]
        rec = {k: v for k, v in rec.items() if v is not None}
        merged.append(rec)

    # Tướng cũ chỉnh tay mà cào không có -> giữ lại.
    kept = 0
    have = {m["id"] for m in merged} | {norm(m["name"]) for m in merged}
    for h in old_heroes:
        if h["id"] not in used_old and h["id"] not in have and norm(h["name"]) not in have:
            merged.append(h)
            kept += 1

    out = {
        "_note": old.get("_note", ""),
        "patch": old.get("patch", ""),
        "source": scraped.get("source", ""),
        "scraped_at": scraped.get("scraped_at", ""),
        "heroes": merged,
    }
    (DATA / "heroes.json").write_text(json.dumps(out, ensure_ascii=False, indent=1),
                                      encoding="utf-8")
    n_sk = sum(1 for m in merged if m.get("skills"))
    n_tuned = sum(1 for m in merged if "attr" in m)
    print(f"[OK] {len(merged)} tướng (giữ {kept} tướng cũ ngoài cào) | "
          f"{n_sk} có kỹ năng | {n_tuned} có số liệu tay | còn lại theo mẫu vai trò")


if __name__ == "__main__":
    main()
