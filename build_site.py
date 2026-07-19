"""Dựng site tĩnh Liên Quân Tổng Hợp từ data/ + engine.py.

    python build_site.py    # -> site/index.html, site/comps.html, site/hero/<id>.html

Chỉ dùng thư viện chuẩn. AURA cập nhật meta = sửa data/heroes.json rồi chạy lại lệnh
này; cả web dựng lại đồng bộ.
"""

from __future__ import annotations

import html
import shutil
from pathlib import Path

import engine

OUT = Path(__file__).parent / "docs"   # GitHub Pages phục vụ từ /docs
TIERS = ["S", "A", "B", "C", "D", "?"]
TIER_COLOR = {"S": "#ff5d73", "A": "#ff9f45", "B": "#ffd93d", "C": "#6ee7b7", "D": "#7aa2ff", "?": "#9fb0c3"}
ROLE_COLOR = {"Sát thủ": "#ff5d73", "Xạ thủ": "#ff9f45", "Pháp sư": "#a56cff",
              "Đấu sĩ": "#4aa3ff", "Đỡ đòn": "#2fbf9f", "Hỗ trợ": "#e0b93d"}
ATTRS = [("mobility", "Cơ động"), ("burst", "Bùng nổ"), ("dps", "Sát thương dồn"),
         ("cc", "Khống chế"), ("engage", "Mở giao tranh"), ("tanky", "Trụ đòn"),
         ("sustain", "Hồi phục"), ("range", "Tầm đánh")]
SPIKE_TXT = {"early": "Mạnh sớm", "mid": "Mạnh giữa trận", "late": "Mạnh cuối trận"}

CSS = """
:root{--bg:#0e1420;--card:#161f2e;--ink:#e8eef6;--muted:#9fb0c3;--accent:#4aa3ff;--line:#243347;--chip:#1e2a3d}
@media(prefers-color-scheme:light){:root{--bg:#f4f7fb;--card:#fff;--ink:#16202e;--muted:#5a6b7d;--accent:#0b6bd6;--line:#e2e9f1;--chip:#eef3f9}}
*{box-sizing:border-box;margin:0;padding:0}
body{font:16px/1.6 "Segoe UI",system-ui,Arial,sans-serif;background:var(--bg);color:var(--ink)}
a{color:var(--accent);text-decoration:none}a:hover{text-decoration:underline}
img.av,.av{border-radius:12px;object-fit:cover;display:block;flex:none}
.wrap{max-width:1040px;margin:0 auto;padding:0 20px}
nav{border-bottom:1px solid var(--line);background:var(--card)}
nav .wrap{display:flex;gap:6px;align-items:center;padding:12px 20px}
nav b{font-size:16px;margin-right:14px}
nav a{padding:7px 14px;border-radius:8px;color:var(--muted);font-size:14px;font-weight:600}
nav a.on,nav a:hover{background:var(--chip);color:var(--ink);text-decoration:none}
header{padding:30px 0 6px}h1{font-size:28px}
.sub{color:var(--muted);margin:6px 0 4px;max-width:74ch;font-size:14.5px}
.warn{background:var(--chip);border:1px solid var(--line);border-left:3px solid #ffd93d;border-radius:8px;padding:10px 14px;color:var(--muted);font-size:13px;margin:14px 0}
.bar{display:flex;gap:8px;flex-wrap:wrap;margin:16px 0}
.bar button{background:var(--chip);color:var(--ink);border:1px solid var(--line);border-radius:20px;padding:7px 15px;font-size:13.5px;cursor:pointer}
.bar button.on{background:var(--accent);color:#fff;border-color:transparent}
.tierrow{display:flex;gap:14px;align-items:stretch;margin:12px 0;border:1px solid var(--line);border-radius:12px;overflow:hidden;background:var(--card)}
.tierbadge{width:60px;display:flex;align-items:center;justify-content:center;font-size:24px;font-weight:800;color:#0e1420}
.tierheroes{display:flex;gap:10px;flex-wrap:wrap;padding:12px}
.htile{display:flex;gap:10px;align-items:center;background:var(--chip);border:1px solid var(--line);border-radius:10px;padding:8px 12px 8px 8px;min-width:150px}
.htile:hover{border-color:var(--accent);text-decoration:none;transform:translateY(-2px);transition:.12s}
.htile .av{width:40px;height:40px}
.htile .nm{font-weight:700;color:var(--ink);font-size:14.5px}
.htile .ro{font-size:11.5px;color:var(--muted)}
.htile .wr{font-size:12px;margin-top:2px}.htile .wr b{color:var(--accent)}
footer{color:var(--muted);font-size:13px;padding:30px 0 60px;border-top:1px solid var(--line);margin-top:26px}
code{background:var(--chip);padding:2px 6px;border-radius:5px}

.hwrap{padding:24px 0}
.crumbs{font-size:13px;color:var(--muted);margin-bottom:12px}
.head{display:flex;gap:18px;align-items:center;flex-wrap:wrap}
.head .av{width:76px;height:76px;border-radius:16px}
.head h1{font-size:30px}.head .meta{color:var(--muted);font-size:14px;margin-top:3px}
.pill{display:inline-block;background:var(--chip);border:1px solid var(--line);border-radius:20px;padding:3px 11px;font-size:12.5px;margin:4px 6px 0 0}
.grid2{display:grid;grid-template-columns:1fr 1fr;gap:18px;margin-top:20px}
.panel{background:var(--card);border:1px solid var(--line);border-radius:14px;padding:18px}
.panel h2{font-size:12.5px;letter-spacing:1.3px;text-transform:uppercase;color:var(--accent);margin-bottom:12px}
.attr{display:flex;align-items:center;gap:10px;margin:6px 0;font-size:13px}
.attr .lb{width:104px;color:var(--muted)}
.attr .track{flex:1;height:8px;background:var(--chip);border-radius:6px;overflow:hidden}
.attr .fill{height:100%;border-radius:6px}
.mu{margin:8px 0;font-size:13.5px}.mu a{font-weight:700}.mu .rz{color:var(--muted);display:block;font-size:12.5px;margin-top:1px}
.lst{margin:2px 0 0;padding-left:18px;font-size:13.5px}.lst li{margin:4px 0}
.lst.pro li::marker{color:#2fbf9f}.lst.con li::marker{color:#ff5d73}
.play{font-size:14px;color:var(--ink)}
.build span{display:inline-block;background:var(--chip);border:1px solid var(--line);color:var(--ink);padding:6px 12px;border-radius:20px;font-size:13px;margin:4px 6px 0 0}
.tags span{display:inline-block;background:var(--chip);color:var(--muted);padding:4px 10px;border-radius:20px;font-size:12px;margin:3px 5px 0 0}
.empty{color:var(--muted);font-size:13px}
.subhead{font-size:12px;color:var(--muted);font-weight:700;margin:2px 0 4px;text-transform:uppercase;letter-spacing:.6px}

.comp{background:var(--card);border:1px solid var(--line);border-radius:16px;padding:20px;margin:16px 0}
.comp .top{display:flex;align-items:center;gap:12px;flex-wrap:wrap;margin-bottom:6px}
.comp .thm{font-size:20px;font-weight:800}
.comp .team{display:flex;gap:10px;flex-wrap:wrap;margin:14px 0}
.comp .slot{background:var(--chip);border:1px solid var(--line);border-radius:12px;padding:10px;text-align:center;width:118px}
.comp .slot .av{width:46px;height:46px;margin:0 auto 6px}
.comp .slot .ln{font-size:11px;color:var(--muted)}
.comp .slot .nm{font-weight:700;font-size:13.5px}
.comp .why{display:grid;grid-template-columns:1fr 1fr;gap:8px 20px;font-size:13.5px;margin-top:6px}
.comp .why .k{color:var(--muted);font-size:12px;text-transform:uppercase;letter-spacing:.5px}
@media(max-width:720px){.grid2,.comp .why{grid-template-columns:1fr}}
"""


def esc(s) -> str:
    return html.escape(str(s))


def _nav(active: str) -> str:
    def a(href, key, label):
        return f'<a href="{href}" class="{"on" if key==active else ""}">{label}</a>'
    return (f'<nav><div class="wrap"><b>Liên Quân Tổng Hợp</b>'
            f'{a("index.html","tier","Bảng xếp hạng")}{a("comps.html","comps","Đội hình")}'
            f'</div></nav>')


def _page(title: str, nav_active: str, body: str, root: str = "") -> str:
    nav = _nav(nav_active).replace('href="', f'href="{root}')
    return (f'<!doctype html><html lang="vi"><head><meta charset="utf-8">'
            f'<meta name="viewport" content="width=device-width,initial-scale=1">'
            f'<title>{esc(title)}</title><style>{CSS}</style></head><body>{nav}{body}</body></html>')


def _initials(name: str) -> str:
    clean = name.replace("'", "")
    parts = clean.split()
    if len(parts) >= 2:
        return (parts[0][0] + parts[1][0]).upper()
    return clean[:2].upper()


def avatar(h: dict, size: int) -> str:
    """Ảnh thật nếu có img, không thì avatar SVG chữ-cái theo màu vai trò."""
    if h.get("img"):
        return f'<img class="av" src="{esc(h["img"])}" width="{size}" height="{size}" alt="{esc(h["name"])}">'
    col = ROLE_COLOR.get(engine.primary_role(h), "#4aa3ff")
    ini = esc(_initials(h["name"]))
    fs = int(size * 0.42)
    return (f'<svg class="av" width="{size}" height="{size}" viewBox="0 0 {size} {size}">'
            f'<rect width="{size}" height="{size}" rx="{int(size*0.16)}" fill="{col}"/>'
            f'<text x="50%" y="50%" dy=".08em" text-anchor="middle" dominant-baseline="middle" '
            f'font-family="Segoe UI,Arial" font-weight="800" font-size="{fs}" fill="#0e1420">{ini}</text></svg>')


def _tile(h: dict, root: str = "") -> str:
    wr = h.get("winrate")
    wr_html = f'<div class="wr">Win <b>{wr}%</b> · Pick {h.get("pickrate","?")}%</div>' if wr is not None else ""
    return (f'<a class="htile" href="{root}hero/{esc(h["id"])}.html" data-role="{esc("|".join(h["roles"]))}">'
            f'{avatar(h,40)}<div><div class="nm">{esc(h["name"])}</div>'
            f'<div class="ro">{esc(" · ".join(h["roles"]))} · {esc(h["lane"])}</div>{wr_html}</div></a>')


# --------------------------------------------------------------- TRANG CHỦ ----
def build_index(roster: list[dict]) -> str:
    by_tier = {t: [] for t in TIERS}
    for h in roster:
        by_tier[engine.tier_of(h)].append(h)
    for t in by_tier:
        by_tier[t].sort(key=lambda x: -(x.get("winrate") or 0))

    roles = ["Tất cả", "Sát thủ", "Xạ thủ", "Pháp sư", "Đấu sĩ", "Đỡ đòn", "Hỗ trợ"]
    bar = '<div class="bar">' + "".join(
        f'<button class="{"on" if r=="Tất cả" else ""}" onclick="flt(this,\'{esc(r)}\')">{esc(r)}</button>'
        for r in roles) + "</div>"

    rows = ""
    for t in TIERS:
        if not by_tier[t]:
            continue
        tiles = "".join(_tile(h) for h in by_tier[t])
        rows += (f'<div class="tierrow" data-tier="{t}">'
                 f'<div class="tierbadge" style="background:{TIER_COLOR[t]}">{t}</div>'
                 f'<div class="tierheroes">{tiles}</div></div>')

    js = """<script>
function flt(btn,role){document.querySelectorAll('.bar button').forEach(b=>b.classList.remove('on'));btn.classList.add('on');
document.querySelectorAll('.htile').forEach(t=>{t.style.display=(role==='Tất cả'||t.dataset.role.split('|').includes(role))?'flex':'none';});
document.querySelectorAll('.tierrow').forEach(r=>{const any=[...r.querySelectorAll('.htile')].some(t=>t.style.display!=='none');r.style.display=any?'flex':'none';});}
</script>"""

    body = (f'<header><div class="wrap"><h1>Bảng xếp hạng tướng</h1>'
            f'<p class="sub">Xếp tier theo win-rate, lọc theo vai trò. Bấm vào tướng để xem '
            f'khắc chế, phối hợp, trang bị và cách vận hành.</p>'
            f'<div class="warn">⚠️ Bản mẫu — win/pick là DỮ LIỆU MẪU. Khắc chế · phối hợp · đội hình · '
            f'trang bị được <b>máy tính suy ra từ bộ kỹ năng</b>, không cào và không bịa.</div>'
            f'{bar}</div></header><div class="wrap">{rows}</div>'
            f'<footer><div class="wrap">Cập nhật meta: sửa <code>data/heroes.json</code> rồi chạy '
            f'<code>python build_site.py</code>. AURA lo phần dựng lại toàn site.</div></footer>{js}')
    return _page("Liên Quân Tổng Hợp — Tier list, khắc chế, đội hình", "tier", body)


# ---------------------------------------------------------------- ĐỘI HÌNH ----
def build_comps(roster: list[dict], by_id: dict) -> str:
    comps = engine.team_comps(roster)
    cards = ""
    for c in comps:
        slots = "".join(
            f'<div class="slot">{avatar(by_id[m["id"]],46)}'
            f'<div class="ln">{esc(m["lane"])}</div><div class="nm">'
            f'<a href="hero/{esc(m["id"])}.html">{esc(m["name"])}</a></div>'
            f'<div class="ln">{esc(m["role"])}</div></div>' for m in c["members"])
        cards += (f'<div class="comp"><div class="top">'
                  f'<span class="thm">{esc(c["theme"])}</span>'
                  f'<span class="pill">Độ khó: {esc(c["difficulty"])}</span>'
                  f'<span class="pill">Chủ lực: {esc(c["carry"])}</span></div>'
                  f'<div class="team">{slots}</div>'
                  f'<div class="why">'
                  f'<div><div class="k">Cách vận hành</div>{esc(c["play"])}</div>'
                  f'<div><div class="k">Ưu điểm</div>{esc(c["pro"])}'
                  f'<div class="k" style="margin-top:8px">Nhược điểm</div>{esc(c["con"])}</div>'
                  f'</div></div>')

    body = (f'<header><div class="wrap"><h1>Đội hình mạnh nhất</h1>'
            f'<p class="sub">Máy ghép 1 tướng mỗi đường rồi chấm điểm ăn ý toàn đội (tuyến đầu, '
            f'khống chế, sát thương, bảo kê) — lấy đội mạnh nhất theo từng lối chơi.</p>'
            f'<div class="warn">⚠️ Đội hình được <b>tính từ độ ăn ý giữa bộ kỹ năng</b>, không phải xếp tay.</div>'
            f'</div></header><div class="wrap">{cards}</div>'
            f'<footer><div class="wrap">Thêm tướng vào <code>data/heroes.json</code> để có nhiều đội hình hơn.</div></footer>')
    return _page("Đội hình mạnh nhất — Liên Quân Tổng Hợp", "comps", body)


# ---------------------------------------------------------------- TRANG TƯỚNG -
def _attr_bar(h: dict) -> str:
    col = ROLE_COLOR.get(engine.primary_role(h), "#4aa3ff")
    out = ""
    for key, lb in ATTRS:
        v = h.get("attr", {}).get(key, 0)
        out += (f'<div class="attr"><div class="lb">{esc(lb)}</div><div class="track">'
                f'<div class="fill" style="width:{v/3*100:.0f}%;background:{col}"></div></div></div>')
    return out


def _mu_list(items: list[dict], empty: str) -> str:
    if not items:
        return f'<div class="empty">{esc(empty)}</div>'
    return "".join(
        f'<div class="mu"><a href="{esc(m["id"])}.html">{esc(m["name"])}</a>'
        f'<span class="rz">{esc(m["why"])}</span></div>' for m in items)


def _ul(items: list[str], cls: str) -> str:
    return f'<ul class="lst {cls}">' + "".join(f"<li>{esc(x)}</li>" for x in items) + "</ul>"


def build_hero(h: dict, roster: list[dict]) -> str:
    c = engine.counters(h, roster)
    syn = engine.synergies(h, roster)
    bld = engine.build(h, engine.load_items())
    t = engine.tier_of(h)
    wr = h.get("winrate")

    build_html = "".join(
        f'<span title="{esc(s["label"])}">{esc(", ".join(s["items"]) if s["items"] else s["label"])}</span>'
        for s in bld)
    tags = "".join(f"<span>{esc(x)}</span>" for x in h.get("tags", []))
    winline = (f"Win {wr}% · Pick {h.get('pickrate','?')}% · " if wr is not None else "") \
        + esc(" · ".join(h["roles"])) + " · " + esc(h["lane"])
    combo = f'<span class="pill">Combo: {esc(h["combo"])}</span>' if h.get("combo") else ""
    tmpl = ('<span class="pill" style="border-color:#ffd93d;color:#c99a00">Thuộc tính theo mẫu vai trò — chờ tinh chỉnh</span>'
            if h.get("templated") else "")

    lane_block = (f'<div class="subhead">⚔️ Khắc chế được (cùng đường)</div>'
                  f'{_mu_list(c["lane"]["khac_che"], "Không có đối thủ cùng đường bị khắc rõ.")}'
                  f'<div class="subhead" style="margin-top:12px">🛡️ Bị khắc chế (cùng đường)</div>'
                  f'{_mu_list(c["lane"]["bi_khac_che"], "Không bị tướng cùng đường khắc rõ.")}')
    tf_block = (f'<div class="subhead">⚔️ Khắc chế được (khác đường)</div>'
                f'{_mu_list(c["teamfight"]["khac_che"], "Chưa tính ra đối trọng rõ ở giao tranh.")}'
                f'<div class="subhead" style="margin-top:12px">🛡️ Bị khắc chế (khác đường)</div>'
                f'{_mu_list(c["teamfight"]["bi_khac_che"], "Chưa có tướng khắc rõ ở giao tranh.")}')

    body = (f'<div class="wrap hwrap">'
            f'<div class="crumbs"><a href="../index.html">← Bảng xếp hạng</a> · '
            f'<a href="../comps.html">Đội hình</a></div>'
            f'<div class="head">{avatar(h,76)}<div><h1>{esc(h["name"])}</h1>'
            f'<div class="meta">{winline}</div>'
            f'<span class="pill" style="background:{TIER_COLOR[t]};color:#0e1420;border:0;font-weight:700">Tier {t}</span>'
            f'<span class="pill">{esc(SPIKE_TXT.get(h.get("spike","mid"),""))}</span>{combo}{tmpl}'
            f'<div class="tags">{tags}</div></div></div>'
            f'<div class="grid2">'
            f'<div class="panel"><h2>Thuộc tính (từ bộ kỹ năng)</h2>{_attr_bar(h)}</div>'
            f'<div class="panel"><h2>Cách vận hành</h2><div class="play">{esc(h.get("play",""))}</div></div>'
            f'<div class="panel"><h2>✅ Ưu điểm</h2>{_ul(h.get("pros",[]),"pro")}</div>'
            f'<div class="panel"><h2>⚠️ Nhược điểm</h2>{_ul(h.get("cons",[]),"con")}</div>'
            f'<div class="panel"><h2>Khắc chế — đi đường</h2>{lane_block}</div>'
            f'<div class="panel"><h2>Khắc chế — giao tranh</h2>{tf_block}</div>'
            f'<div class="panel"><h2>🤝 Phối hợp đội hình</h2>{_mu_list(syn,"Chưa tính ra cặp phối hợp nổi bật.")}</div>'
            f'<div class="panel"><h2>Trang bị gợi ý</h2><div class="build">{build_html}</div>'
            f'<div class="empty" style="margin-top:10px">Địch nhiều hồi máu → thêm <b>Kháng hồi máu</b>. '
            f'Nhiều khống chế → <b>Giày kháng hiệu ứng</b>.</div></div>'
            f'</div></div>')
    return _page(f'{h["name"]} — khắc chế, trang bị, đội hình | Liên Quân Tổng Hợp', "", body, root="../")


def main() -> None:
    roster = engine.load_heroes()
    by_id = {h["id"]: h for h in roster}
    if OUT.exists():
        shutil.rmtree(OUT)
    (OUT / "hero").mkdir(parents=True)

    (OUT / ".nojekyll").write_text("", encoding="utf-8")   # để GitHub Pages phục vụ nguyên trạng
    (OUT / "index.html").write_text(build_index(roster), encoding="utf-8")
    (OUT / "comps.html").write_text(build_comps(roster, by_id), encoding="utf-8")
    for h in roster:
        (OUT / "hero" / f"{h['id']}.html").write_text(build_hero(h, roster), encoding="utf-8")

    print(f"[OK] built index + comps + {len(roster)} hero pages -> {OUT}")


if __name__ == "__main__":
    main()
