"""Dựng site tĩnh Liên Quân Tổng Hợp từ data/ + engine.py.

    python build_site.py    # -> docs/ (index, stats, comps, khac-che, hero/*, sitemap)

Kiến trúc học từ 2 web mẫu (đại tu 2026-07-20):
- MetaTFT: đa trang (tier/chỉ số/đội hình), bảng sort được, tem "cập nhật lúc",
  bộ lọc, disclaimer pháp lý.
- Học viện Liên Quân (chính chủ): trang tướng kiểu GIÁO ÁN — phân tích kỹ năng,
  trang bị + bổ trợ + ngọc, khắc chế nêu rõ "Tại sao thắng".
Chỉ dùng stdlib. AURA cập nhật meta = sửa data/heroes.json rồi chạy lại lệnh này.
"""

from __future__ import annotations

import html
import json
import shutil
import time
from pathlib import Path

import engine

OUT = Path(__file__).parent / "docs"   # GitHub Pages phục vụ từ /docs
SITE_URL = "https://kienggggg.github.io/lienquan"   # đổi khi có domain riêng
TIERS = ["S", "A", "B", "C", "D", "?"]
TIER_COLOR = {"S": "#ff5d73", "A": "#ff9f45", "B": "#ffd93d", "C": "#6ee7b7", "D": "#7aa2ff", "?": "#9fb0c3"}
ROLE_COLOR = {"Sát thủ": "#ff5d73", "Xạ thủ": "#ff9f45", "Pháp sư": "#a56cff",
              "Đấu sĩ": "#4aa3ff", "Đỡ đòn": "#2fbf9f", "Hỗ trợ": "#e0b93d"}
ATTRS = [("mobility", "Cơ động"), ("burst", "Bùng nổ"), ("dps", "Sát thương dồn"),
         ("cc", "Khống chế"), ("engage", "Mở giao tranh"), ("tanky", "Trụ đòn"),
         ("sustain", "Hồi phục"), ("range", "Tầm đánh")]
SPIKE_TXT = {"early": "Mạnh sớm", "mid": "Mạnh giữa trận", "late": "Mạnh cuối trận"}
ROLES = ["Sát thủ", "Xạ thủ", "Pháp sư", "Đấu sĩ", "Đỡ đòn", "Hỗ trợ"]
LANES = ["Rừng", "Rồng", "Trung", "Tà Thần", "Hỗ trợ"]

CSS = """
:root{--bg:#0e1420;--card:#161f2e;--ink:#e8eef6;--muted:#9fb0c3;--accent:#4aa3ff;--line:#243347;--chip:#1e2a3d;--ok:#2fbf9f;--bad:#ff5d73}
@media(prefers-color-scheme:light){:root{--bg:#f4f7fb;--card:#fff;--ink:#16202e;--muted:#5a6b7d;--accent:#0b6bd6;--line:#e2e9f1;--chip:#eef3f9;--ok:#0e9f6e;--bad:#d64550}}
*{box-sizing:border-box;margin:0;padding:0}
body{font:15.5px/1.6 "Segoe UI",system-ui,Arial,sans-serif;background:var(--bg);color:var(--ink)}
a{color:var(--accent);text-decoration:none}a:hover{text-decoration:underline}
img.av,svg.av{border-radius:12px;object-fit:cover;display:block;flex:none}
.wrap{max-width:1080px;margin:0 auto;padding:0 20px}
nav{border-bottom:1px solid var(--line);background:var(--card);position:sticky;top:0;z-index:9}
nav .wrap{display:flex;gap:4px;align-items:center;padding:10px 20px;flex-wrap:wrap}
nav b{font-size:16px;margin-right:12px;white-space:nowrap}
nav a{padding:7px 13px;border-radius:8px;color:var(--muted);font-size:13.5px;font-weight:600;white-space:nowrap}
nav a.on,nav a:hover{background:var(--chip);color:var(--ink);text-decoration:none}
header{padding:26px 0 6px}h1{font-size:26px}
.sub{color:var(--muted);margin:6px 0 4px;max-width:76ch;font-size:14px}
.trust{display:flex;gap:14px;flex-wrap:wrap;font-size:12.5px;color:var(--muted);margin:10px 0 2px}
.trust b{color:var(--ok)}
.warn{background:var(--chip);border:1px solid var(--line);border-left:3px solid #ffd93d;border-radius:8px;padding:9px 13px;color:var(--muted);font-size:12.5px;margin:12px 0}
.bar{display:flex;gap:8px;flex-wrap:wrap;margin:14px 0;align-items:center}
.bar button{background:var(--chip);color:var(--ink);border:1px solid var(--line);border-radius:20px;padding:6px 14px;font-size:13px;cursor:pointer}
.bar button.on{background:var(--accent);color:#fff;border-color:transparent}
.bar input,select.pick{background:var(--chip);color:var(--ink);border:1px solid var(--line);border-radius:20px;padding:7px 14px;font-size:13.5px;outline:none}
.bar input:focus{border-color:var(--accent)}
.tierrow{display:flex;gap:14px;align-items:stretch;margin:12px 0;border:1px solid var(--line);border-radius:12px;overflow:hidden;background:var(--card)}
.tierbadge{width:56px;display:flex;align-items:center;justify-content:center;font-size:23px;font-weight:800;color:#0e1420;flex:none}
.tierheroes{display:flex;gap:10px;flex-wrap:wrap;padding:12px}
.htile{display:flex;gap:10px;align-items:center;background:var(--chip);border:1px solid var(--line);border-radius:10px;padding:8px 12px 8px 8px;min-width:150px}
.htile:hover{border-color:var(--accent);text-decoration:none;transform:translateY(-2px);transition:.12s}
.htile .av{width:38px;height:38px}
.htile .nm{font-weight:700;color:var(--ink);font-size:14px}
.htile .ro{font-size:11px;color:var(--muted)}
.htile .wr{font-size:11.5px;margin-top:2px}.htile .wr b{color:var(--accent)}
footer{color:var(--muted);font-size:12px;padding:26px 0 55px;border-top:1px solid var(--line);margin-top:26px;line-height:1.7}
code{background:var(--chip);padding:2px 6px;border-radius:5px}

table.stats{width:100%;border-collapse:collapse;background:var(--card);border:1px solid var(--line);border-radius:12px;overflow:hidden;font-size:13.5px}
table.stats th{background:var(--chip);text-align:left;padding:9px 12px;cursor:pointer;user-select:none;white-space:nowrap}
table.stats th:hover{color:var(--accent)}
table.stats td{padding:8px 12px;border-top:1px solid var(--line);white-space:nowrap}
table.stats tr:hover td{background:var(--chip)}
.tbadge{display:inline-block;min-width:26px;text-align:center;border-radius:7px;font-weight:800;color:#0e1420;padding:1px 7px;font-size:12.5px}
.statwrap{overflow-x:auto;border-radius:12px}

.hwrap{padding:22px 0}
.crumbs{font-size:12.5px;color:var(--muted);margin-bottom:12px}
.head{display:flex;gap:18px;align-items:center;flex-wrap:wrap}
.head .av{width:72px;height:72px;border-radius:16px}
.head h1{font-size:28px}.head .meta{color:var(--muted);font-size:13.5px;margin-top:3px}
.pill{display:inline-block;background:var(--chip);border:1px solid var(--line);border-radius:20px;padding:3px 11px;font-size:12px;margin:4px 6px 0 0}
.grid2{display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-top:18px}
.panel{background:var(--card);border:1px solid var(--line);border-radius:14px;padding:17px}
.panel h2{font-size:12px;letter-spacing:1.3px;text-transform:uppercase;color:var(--accent);margin-bottom:11px}
.attr{display:flex;align-items:center;gap:10px;margin:6px 0;font-size:12.5px}
.attr .lb{width:102px;color:var(--muted)}
.attr .track{flex:1;height:8px;background:var(--chip);border-radius:6px;overflow:hidden}
.attr .fill{height:100%;border-radius:6px}
.mu{margin:9px 0;font-size:13px}.mu a{font-weight:700;font-size:14px}
.mu ul{margin:4px 0 0 18px;color:var(--muted);font-size:12.5px}.mu ul li{margin:2px 0}
.lst{margin:2px 0 0;padding-left:18px;font-size:13px}.lst li{margin:4px 0}
.lst.pro li::marker{color:var(--ok)}.lst.con li::marker{color:var(--bad)}
.play{font-size:13.5px}
.build span,.spellbox span{display:inline-block;background:var(--chip);border:1px solid var(--line);color:var(--ink);padding:6px 12px;border-radius:20px;font-size:12.5px;margin:4px 6px 0 0}
.tags span{display:inline-block;background:var(--chip);color:var(--muted);padding:4px 10px;border-radius:20px;font-size:11.5px;margin:3px 5px 0 0}
.empty{color:var(--muted);font-size:12.5px}
.subhead{font-size:11.5px;color:var(--muted);font-weight:700;margin:2px 0 4px;text-transform:uppercase;letter-spacing:.6px}
.skill{border-left:3px solid var(--accent);padding:2px 0 2px 12px;margin:10px 0}
.skill b{font-size:14px}.skill p{color:var(--muted);font-size:13px;margin-top:2px}

.comp{background:var(--card);border:1px solid var(--line);border-radius:16px;padding:18px;margin:14px 0}
.comp .top{display:flex;align-items:center;gap:10px;flex-wrap:wrap;margin-bottom:4px}
.comp .thm{font-size:18px;font-weight:800}
.comp .team{display:flex;gap:10px;flex-wrap:wrap;margin:12px 0}
.comp .slot{background:var(--chip);border:1px solid var(--line);border-radius:12px;padding:9px;text-align:center;width:114px}
.comp .slot .av{width:44px;height:44px;margin:0 auto 5px}
.comp .slot .ln{font-size:10.5px;color:var(--muted)}
.comp .slot .nm{font-weight:700;font-size:13px}
.comp .why{display:grid;grid-template-columns:1fr 1fr;gap:8px 20px;font-size:13px;margin-top:4px}
.comp .why .k{color:var(--muted);font-size:11px;text-transform:uppercase;letter-spacing:.5px}

.picker{display:flex;gap:12px;align-items:center;flex-wrap:wrap;margin:16px 0}
#ctr-result .vs{font-size:19px;font-weight:800;margin:16px 0 4px}
@media(max-width:720px){.grid2,.comp .why{grid-template-columns:1fr}}
"""

_NAV = [("index.html", "tier", "Bảng xếp hạng"), ("stats.html", "stats", "Chỉ số tướng"),
        ("comps.html", "comps", "Đội hình"), ("khac-che.html", "counter", "Tra khắc chế")]


def esc(s) -> str:
    return html.escape(str(s))


def _nav(active: str, root: str = "") -> str:
    links = "".join(f'<a href="{root}{h}" class="{"on" if k == active else ""}">{t}</a>'
                    for h, k, t in _NAV)
    return f'<nav><div class="wrap"><b>⚔️ Liên Quân Tổng Hợp</b>{links}</div></nav>'


def _trust(meta: dict, n_heroes: int) -> str:
    stamp = time.strftime("%H:%M %d/%m/%Y")
    return (f'<div class="trust"><span>🕒 Cập nhật: <b>{stamp}</b></span>'
            f'<span>🎮 Phiên bản: {esc(meta.get("patch") or "—")}</span>'
            f'<span>🦸 {n_heroes} tướng</span></div>')


def _footer(root: str = "") -> str:
    return (f'<footer><div class="wrap">'
            f'Trang do người hâm mộ xây dựng — KHÔNG liên kết với Garena hay Tencent/TiMi. '
            f'Liên Quân Mobile là thương hiệu của chủ sở hữu tương ứng.<br>'
            f'Khắc chế · phối hợp · đội hình · trang bị được <b>máy suy luận từ thuộc tính '
            f'bộ kỹ năng</b>; số liệu win/pick nạp từ nguồn ngoài. '
            f'Vận hành: sửa <code>data/heroes.json</code> → <code>python build_site.py</code>.'
            f'</div></footer>')


def _page(title: str, desc: str, nav_active: str, body: str, root: str = "") -> str:
    return (f'<!doctype html><html lang="vi"><head><meta charset="utf-8">'
            f'<meta name="viewport" content="width=device-width,initial-scale=1">'
            f'<title>{esc(title)}</title>'
            f'<meta name="description" content="{esc(desc)}">'
            f'<style>{CSS}</style></head><body>{_nav(nav_active, root)}{body}'
            f'{_footer(root)}</body></html>')


def _initials(name: str) -> str:
    clean = name.replace("'", "")
    parts = clean.split()
    return (parts[0][0] + parts[1][0]).upper() if len(parts) >= 2 else clean[:2].upper()


def avatar(h: dict, size: int) -> str:
    if h.get("img"):
        return f'<img class="av" src="{esc(h["img"])}" width="{size}" height="{size}" alt="{esc(h["name"])}">'
    col = ROLE_COLOR.get(engine.primary_role(h), "#4aa3ff")
    fs = int(size * 0.42)
    return (f'<svg class="av" width="{size}" height="{size}" viewBox="0 0 {size} {size}">'
            f'<rect width="{size}" height="{size}" rx="{int(size*0.16)}" fill="{col}"/>'
            f'<text x="50%" y="50%" dy=".08em" text-anchor="middle" dominant-baseline="middle" '
            f'font-family="Segoe UI,Arial" font-weight="800" font-size="{fs}" '
            f'fill="#0e1420">{esc(_initials(h["name"]))}</text></svg>')


def _tile(h: dict, root: str = "") -> str:
    wr = h.get("winrate")
    wr_html = f'<div class="wr">Win <b>{wr}%</b> · Pick {h.get("pickrate","?")}%</div>' if wr is not None else ""
    return (f'<a class="htile" href="{root}hero/{esc(h["id"])}.html" '
            f'data-role="{esc("|".join(h["roles"]))}" data-lane="{esc(h["lane"])}" '
            f'data-name="{esc(h["name"].lower())}">'
            f'{avatar(h,38)}<div><div class="nm">{esc(h["name"])}</div>'
            f'<div class="ro">{esc(" · ".join(h["roles"]))} · {esc(h["lane"])}</div>{wr_html}</div></a>')


# ------------------------------------------------------------ TRANG CHỦ (TIER)
def build_index(roster, meta) -> str:
    by_tier = {t: [] for t in TIERS}
    for h in roster:
        by_tier[engine.tier_of(h)].append(h)
    for t in by_tier:
        by_tier[t].sort(key=lambda x: -(x.get("winrate") or 0))

    role_bar = "".join(
        f'<button class="{"on" if r=="Tất cả" else ""}" data-f="role" data-v="{esc(r)}" '
        f'onclick="flt(this)">{esc(r)}</button>' for r in ["Tất cả"] + ROLES)
    lane_bar = "".join(
        f'<button data-f="lane" data-v="{esc(l)}" onclick="flt(this)">{esc(l)}</button>'
        for l in LANES)
    search = ('<input id="q" placeholder="🔍 Tìm tướng..." '
              'oninput="doSearch(this.value)" style="min-width:170px">')

    rows = ""
    for t in TIERS:
        if not by_tier[t]:
            continue
        tiles = "".join(_tile(h) for h in by_tier[t])
        rows += (f'<div class="tierrow"><div class="tierbadge" '
                 f'style="background:{TIER_COLOR[t]}">{t}</div>'
                 f'<div class="tierheroes">{tiles}</div></div>')

    js = """<script>
var F={role:'Tất cả',lane:'',q:''};
function flt(btn){var f=btn.dataset.f,v=btn.dataset.v;
 if(f==='lane'&&F.lane===v){F.lane='';btn.classList.remove('on');}
 else{F[f]=(f==='role')?v:v;
  document.querySelectorAll('.bar button[data-f='+f+']').forEach(b=>b.classList.remove('on'));
  btn.classList.add('on');}
 apply();}
function doSearch(v){F.q=v.toLowerCase().trim();apply();}
function apply(){
 document.querySelectorAll('.htile').forEach(function(t){
  var ok=(F.role==='Tất cả'||t.dataset.role.split('|').includes(F.role))
   &&(!F.lane||t.dataset.lane===F.lane)
   &&(!F.q||t.dataset.name.includes(F.q));
  t.style.display=ok?'flex':'none';});
 document.querySelectorAll('.tierrow').forEach(function(r){
  var any=[...r.querySelectorAll('.htile')].some(t=>t.style.display!=='none');
  r.style.display=any?'flex':'none';});}
</script>"""

    body = (f'<header><div class="wrap"><h1>Bảng xếp hạng tướng</h1>'
            f'<p class="sub">Tier theo win-rate; lọc theo vai trò / đường, tìm nhanh theo tên. '
            f'Bấm vào tướng để xem giáo án đầy đủ: kỹ năng, trang bị, bổ trợ, ngọc, khắc chế.</p>'
            f'{_trust(meta, len(roster))}'
            f'<div class="warn">⚠️ Win/pick đang là DỮ LIỆU MẪU ({esc(meta.get("patch") or "")}). '
            f'Khắc chế · đội hình · trang bị do <b>máy suy luận từ bộ kỹ năng</b>, không bịa số.</div>'
            f'<div class="bar">{search}{role_bar}</div>'
            f'<div class="bar"><span style="color:var(--muted);font-size:12.5px">Đường:</span>{lane_bar}</div>'
            f'</div></header><div class="wrap">{rows}</div>{js}')
    return _page("Liên Quân Tổng Hợp — Tier list, khắc chế, đội hình, chỉ số tướng",
                 "Bảng xếp hạng tướng Liên Quân Mobile theo win-rate, khắc chế cùng/khác đường, "
                 "đội hình mạnh và trang bị — suy luận từ bộ kỹ năng.", "tier", body)


# ---------------------------------------------------------- BẢNG CHỈ SỐ (SORT)
def build_stats(roster, meta) -> str:
    rows = ""
    for h in sorted(roster, key=lambda x: -(x.get("winrate") or 0)):
        t = engine.tier_of(h)
        wr, pr = h.get("winrate"), h.get("pickrate")
        rows += (f'<tr data-role="{esc("|".join(h["roles"]))}">'
                 f'<td><a href="hero/{esc(h["id"])}.html" style="display:flex;gap:9px;align-items:center">'
                 f'{avatar(h,30)}<b>{esc(h["name"])}</b></a></td>'
                 f'<td><span class="tbadge" style="background:{TIER_COLOR[t]}">{t}</span></td>'
                 f'<td data-v="{wr if wr is not None else -1}">{wr if wr is not None else "—"}%</td>'
                 f'<td data-v="{pr if pr is not None else -1}">{pr if pr is not None else "—"}%</td>'
                 f'<td>{esc(" · ".join(h["roles"]))}</td><td>{esc(h["lane"])}</td>'
                 f'<td>{esc(SPIKE_TXT.get(h.get("spike","mid"),""))}</td></tr>')

    role_bar = "".join(
        f'<button class="{"on" if r=="Tất cả" else ""}" data-v="{esc(r)}" '
        f'onclick="fr(this)">{esc(r)}</button>' for r in ["Tất cả"] + ROLES)

    js = """<script>
function fr(btn){document.querySelectorAll('.bar button').forEach(b=>b.classList.remove('on'));
 btn.classList.add('on');var v=btn.dataset.v;
 document.querySelectorAll('tbody tr').forEach(function(tr){
  tr.style.display=(v==='Tất cả'||tr.dataset.role.split('|').includes(v))?'':'none';});}
var dir={};
function srt(idx){var tb=document.querySelector('tbody');dir[idx]=!dir[idx];
 [...tb.rows].sort(function(a,b){
  var x=a.cells[idx].dataset.v!==undefined?+a.cells[idx].dataset.v:a.cells[idx].innerText.toLowerCase();
  var y=b.cells[idx].dataset.v!==undefined?+b.cells[idx].dataset.v:b.cells[idx].innerText.toLowerCase();
  return (x>y?1:x<y?-1:0)*(dir[idx]?1:-1);
 }).forEach(r=>tb.appendChild(r));}
</script>"""

    body = (f'<header><div class="wrap"><h1>Chỉ số tướng</h1>'
            f'<p class="sub">Toàn bộ tướng trong một bảng — bấm tiêu đề cột để sắp xếp '
            f'(kiểu MetaTFT). Bấm tên tướng để mở giáo án.</p>'
            f'{_trust(meta, len(roster))}'
            f'<div class="bar">{role_bar}</div></div></header>'
            f'<div class="wrap"><div class="statwrap"><table class="stats">'
            f'<thead><tr>'
            f'<th onclick="srt(0)">Tướng ⇅</th><th onclick="srt(1)">Tier ⇅</th>'
            f'<th onclick="srt(2)">Win % ⇅</th><th onclick="srt(3)">Pick % ⇅</th>'
            f'<th onclick="srt(4)">Vai trò ⇅</th><th onclick="srt(5)">Đường ⇅</th>'
            f'<th onclick="srt(6)">Sức mạnh ⇅</th></tr></thead>'
            f'<tbody>{rows}</tbody></table></div></div>{js}')
    return _page("Chỉ số tướng Liên Quân — bảng win rate, pick rate, tier",
                 "Bảng chỉ số toàn bộ tướng Liên Quân Mobile: win rate, pick rate, tier, "
                 "vai trò, đường — sắp xếp và lọc như MetaTFT.", "stats", body)


# ------------------------------------------------------------------- ĐỘI HÌNH
def _comp_tier(rank: int, total: int) -> str:
    if total <= 1 or rank == 0:
        return "S"
    ratio = rank / total
    return "S" if ratio < 0.25 else "A" if ratio < 0.6 else "B"


def build_comps(roster, by_id, meta) -> str:
    comps = engine.team_comps(roster)
    cards = ""
    for i, c in enumerate(comps):
        ct = _comp_tier(i, len(comps))
        slots = "".join(
            f'<div class="slot">{avatar(by_id[m["id"]],44)}'
            f'<div class="ln">{esc(m["lane"])}</div><div class="nm">'
            f'<a href="hero/{esc(m["id"])}.html">{esc(m["name"])}</a></div>'
            f'<div class="ln">{esc(m["role"])}</div></div>' for m in c["members"])
        cards += (f'<div class="comp"><div class="top">'
                  f'<span class="tbadge" style="background:{TIER_COLOR[ct]};font-size:15px;padding:3px 11px">{ct}</span>'
                  f'<span class="thm">{esc(c["theme"])}</span>'
                  f'<span class="pill">Độ khó: {esc(c["difficulty"])}</span>'
                  f'<span class="pill">Chủ lực: {esc(c["carry"])}</span>'
                  f'<span class="pill">Điểm ăn ý: {c["score"]}</span></div>'
                  f'<div class="team">{slots}</div>'
                  f'<div class="why"><div><div class="k">Cách vận hành</div>{esc(c["play"])}</div>'
                  f'<div><div class="k">Ưu điểm</div>{esc(c["pro"])}'
                  f'<div class="k" style="margin-top:8px">Nhược điểm</div>{esc(c["con"])}</div>'
                  f'</div></div>')

    body = (f'<header><div class="wrap"><h1>Đội hình mạnh nhất</h1>'
            f'<p class="sub">Máy ghép 1 tướng mỗi đường, chấm điểm ăn ý toàn đội (tuyến đầu, '
            f'khống chế, sát thương, bảo kê) rồi xếp hạng theo lối chơi — như trang Comps của MetaTFT.</p>'
            f'{_trust(meta, len(roster))}'
            f'<div class="warn">⚠️ Đội hình <b>tính từ độ ăn ý giữa bộ kỹ năng</b>, không phải xếp tay.</div>'
            f'</div></header><div class="wrap">{cards}</div>')
    return _page("Đội hình mạnh nhất Liên Quân — comps theo lối chơi",
                 "Đội hình Liên Quân Mobile mạnh nhất theo từng lối chơi: giao tranh tổng, "
                 "poke, bắt lẻ — máy tính độ ăn ý từ bộ kỹ năng.", "comps", body)


# -------------------------------------------------------------- TRA KHẮC CHẾ
def build_counter_page(roster, meta) -> str:
    """Trang tra cứu: chọn tướng địch -> ai khắc chế nó (+lý do). Data nhúng JSON."""
    data = {}
    for h in roster:
        c = engine.counters(h, roster, top=4)
        data[h["id"]] = {
            "name": h["name"], "lane": h["lane"],
            "beat_lane": c["lane"]["bi_khac_che"],      # ai khắc h khi CÙNG đường
            "beat_tf": c["teamfight"]["bi_khac_che"],   # ai khắc h khác đường
            "lose_lane": c["lane"]["khac_che"],
            "lose_tf": c["teamfight"]["khac_che"],
        }
    options = "".join(f'<option value="{esc(h["id"])}">{esc(h["name"])} ({esc(h["lane"])})</option>'
                      for h in sorted(roster, key=lambda x: x["name"]))
    js_data = json.dumps(data, ensure_ascii=False)

    js = f"""<script>
var D={js_data};
function pick(id){{
 if(!id||!D[id]){{document.getElementById('ctr-result').innerHTML='';return;}}
 var d=D[id];
 function block(title,arr,posneg){{
  if(!arr.length)return '<div class="panel"><h2>'+title+'</h2><div class="empty">Chưa tính ra tướng nổi bật.</div></div>';
  var items=arr.map(function(m){{return '<div class="mu"><a href="hero/'+m.id+'.html">'+m.name+'</a>'+
   '<ul><li>'+m.why+'</li></ul></div>';}}).join('');
  return '<div class="panel"><h2>'+title+'</h2>'+items+'</div>';
 }}
 document.getElementById('ctr-result').innerHTML=
  '<div class="vs">Đối đầu: '+d.name+' ('+d.lane+')</div><div class="grid2">'+
  block('✅ Chọn tướng này để KHẮC '+d.name+' (cùng đường)',d.beat_lane)+
  block('✅ Khắc '+d.name+' trong giao tranh (khác đường)',d.beat_tf)+
  block('⚠️ Tránh chọn (bị '+d.name+' khắc khi đi đường)',d.lose_lane)+
  block('⚠️ Tránh chọn (bị '+d.name+' khắc ở giao tranh)',d.lose_tf)+'</div>';
}}
</script>"""

    body = (f'<header><div class="wrap"><h1>Tra khắc chế</h1>'
            f'<p class="sub">Địch vừa khóa tướng nào? Chọn tướng đó để xem NÊN CHỌN AI khắc lại '
            f'— tách rõ cùng đường / khác đường, kèm lý do "tại sao thắng" như giáo án Học viện.</p>'
            f'{_trust(meta, len(roster))}'
            f'<div class="picker"><span style="font-weight:700">Tướng địch:</span>'
            f'<select class="pick" onchange="pick(this.value)">'
            f'<option value="">— chọn tướng —</option>{options}</select></div>'
            f'</div></header><div class="wrap"><div id="ctr-result"></div></div>{js}')
    return _page("Tra khắc chế tướng Liên Quân — chọn ai để counter?",
                 "Tra cứu khắc chế Liên Quân Mobile: chọn tướng địch để biết nên chọn tướng nào "
                 "khắc chế khi cùng đường và trong giao tranh, kèm lý do.", "counter", body)


# ---------------------------------------------------------------- TRANG TƯỚNG
def _attr_bar(h) -> str:
    col = ROLE_COLOR.get(engine.primary_role(h), "#4aa3ff")
    return "".join(
        f'<div class="attr"><div class="lb">{esc(lb)}</div><div class="track">'
        f'<div class="fill" style="width:{h.get("attr",{}).get(k,0)/3*100:.0f}%;background:{col}"></div></div></div>'
        for k, lb in ATTRS)


def _mu_list(items, empty) -> str:
    if not items:
        return f'<div class="empty">{esc(empty)}</div>'
    return "".join(
        f'<div class="mu"><a href="{esc(m["id"])}.html">{esc(m["name"])}</a>'
        f'<ul><li>{esc(m["why"])}</li></ul></div>' for m in items)


def _ul(items, cls) -> str:
    return f'<ul class="lst {cls}">' + "".join(f"<li>{esc(x)}</li>" for x in items) + "</ul>"


def build_hero(h, roster, items) -> str:
    c = engine.counters(h, roster)
    syn = engine.synergies(h, roster)
    bld = engine.build(h, items)
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

    # Kỹ năng (giáo án) — chỉ hiện khi đã nạp dữ liệu thật.
    skills_html = ""
    if h.get("skills"):
        sk = "".join(
            f'<div class="skill"><b>{esc(s.get("name",""))}</b>'
            f'<p>{esc(s.get("desc",""))}</p>'
            + (f'<p style="color:var(--accent)">→ {esc(s["note"])}</p>' if s.get("note") else "")
            + '</div>' for s in h["skills"])
        skills_html = f'<div class="panel" style="grid-column:1/-1"><h2>Phân tích bộ kỹ năng</h2>{sk}</div>'

    spellbox = (f'<div class="spellbox"><div class="subhead">Bổ trợ</div>'
                f'<span>{esc(h.get("spell",""))}</span>'
                f'<span style="color:var(--muted)">Địch nhiều khống chế → Thanh Tẩy</span>'
                f'<div class="subhead" style="margin-top:10px">Ngọc (theo loại chỉ số)</div>'
                + "".join(f'<span>{esc(a)}</span>' for a in h.get("arcana", [])) + '</div>')

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
            f'<a href="../khac-che.html">Tra khắc chế</a> · <a href="../comps.html">Đội hình</a></div>'
            f'<div class="head">{avatar(h,72)}<div><h1>{esc(h["name"])}</h1>'
            f'<div class="meta">{winline}</div>'
            f'<span class="pill" style="background:{TIER_COLOR[t]};color:#0e1420;border:0;font-weight:700">Tier {t}</span>'
            f'<span class="pill">{esc(SPIKE_TXT.get(h.get("spike","mid"),""))}</span>{combo}{tmpl}'
            f'<div class="tags">{tags}</div></div></div>'
            f'<div class="grid2">'
            f'<div class="panel"><h2>Thuộc tính (từ bộ kỹ năng)</h2>{_attr_bar(h)}</div>'
            f'<div class="panel"><h2>Cách vận hành</h2><div class="play">{esc(h.get("play",""))}</div></div>'
            f'{skills_html}'
            f'<div class="panel"><h2>✅ Ưu điểm</h2>{_ul(h.get("pros",[]),"pro")}</div>'
            f'<div class="panel"><h2>⚠️ Nhược điểm</h2>{_ul(h.get("cons",[]),"con")}</div>'
            f'<div class="panel"><h2>Trang bị gợi ý</h2><div class="build">{build_html}</div>'
            f'<div class="empty" style="margin-top:10px">Địch nhiều hồi máu → thêm <b>Kháng hồi máu</b>. '
            f'Nhiều khống chế → <b>Giày kháng hiệu ứng</b>.</div></div>'
            f'<div class="panel"><h2>Bổ trợ & Ngọc</h2>{spellbox}</div>'
            f'<div class="panel"><h2>Khắc chế — đi đường</h2>{lane_block}</div>'
            f'<div class="panel"><h2>Khắc chế — giao tranh</h2>{tf_block}</div>'
            f'<div class="panel" style="grid-column:1/-1"><h2>🤝 Phối hợp đội hình</h2>'
            f'{_mu_list(syn,"Chưa tính ra cặp phối hợp nổi bật.")}</div>'
            f'</div></div>')
    return _page(f'{h["name"]} Liên Quân — khắc chế, trang bị, ngọc bổ trợ, cách chơi',
                 f'Giáo án {h["name"]} Liên Quân Mobile: cách chơi, trang bị, ngọc, bổ trợ, '
                 f'khắc chế cùng đường và giao tranh, đội hình phối hợp.', "", body, root="../")


# ----------------------------------------------------------------------- SEO
def build_sitemap(roster) -> str:
    today = time.strftime("%Y-%m-%d")
    urls = [f"{SITE_URL}/{p}" for p, _, _ in _NAV] + \
           [f"{SITE_URL}/hero/{h['id']}.html" for h in roster]
    entries = "".join(f"<url><loc>{u}</loc><lastmod>{today}</lastmod></url>" for u in urls)
    return f'<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">{entries}</urlset>'


def main() -> None:
    roster = engine.load_heroes()
    meta = engine.load_meta()
    items = engine.load_items()
    by_id = {h["id"]: h for h in roster}
    if OUT.exists():
        shutil.rmtree(OUT)
    (OUT / "hero").mkdir(parents=True)

    (OUT / ".nojekyll").write_text("", encoding="utf-8")
    (OUT / "index.html").write_text(build_index(roster, meta), encoding="utf-8")
    (OUT / "stats.html").write_text(build_stats(roster, meta), encoding="utf-8")
    (OUT / "comps.html").write_text(build_comps(roster, by_id, meta), encoding="utf-8")
    (OUT / "khac-che.html").write_text(build_counter_page(roster, meta), encoding="utf-8")
    for h in roster:
        (OUT / "hero" / f"{h['id']}.html").write_text(build_hero(h, roster, items), encoding="utf-8")
    (OUT / "sitemap.xml").write_text(build_sitemap(roster), encoding="utf-8")
    (OUT / "robots.txt").write_text(f"User-agent: *\nAllow: /\nSitemap: {SITE_URL}/sitemap.xml\n",
                                    encoding="utf-8")

    print(f"[OK] built 4 pages + {len(roster)} hero pages + sitemap -> {OUT}")


if __name__ == "__main__":
    main()
