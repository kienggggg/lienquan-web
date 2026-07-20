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

import hashlib
import html
import json
import shutil
import time
from pathlib import Path

import engine

ROOT = Path(__file__).parent
OUT = ROOT / "docs"                     # GitHub Pages phục vụ từ /docs
ASSETS = ROOT / "assets" / "img"        # ảnh đã tải local (download_assets.py)


def _local_name(url: str) -> str:
    """Khớp download_assets.local_name — map URL Garena -> tên file local."""
    ext = ".png"
    for e in (".png", ".jpg", ".jpeg", ".webp", ".gif"):
        if e in url.lower():
            ext = ".jpg" if e == ".jpeg" else e
            break
    return hashlib.md5(url.encode("utf-8")).hexdigest()[:16] + ext


def _loc(url: str, root: str = "") -> str:
    """URL ảnh -> đường dẫn LOCAL nếu đã tải; không thì giữ URL gốc (hotlink dự phòng)."""
    if not url or not url.startswith("http"):
        return url
    if (ASSETS / _local_name(url)).is_file():
        return f"{root}img/{_local_name(url)}"
    return url
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
:root{--bg:#080b12;--card:#121a28;--card2:#0f1622;--ink:#eef3fa;--muted:#8393aa;--accent:#4ea8ff;--accent2:#7c5cff;--line:#1e2a3e;--chip:#161f30;--ok:#35d6a8;--bad:#ff5f6e;--gold:#ffcf5c}
*{box-sizing:border-box;margin:0;padding:0}
body{font:15.5px/1.6 "Segoe UI",system-ui,Arial,sans-serif;color:var(--ink);
     background:radial-gradient(1100px 560px at 50% -8%,#16233f 0%,#0b1120 45%,#080b12 100%) fixed}
a{color:var(--accent);text-decoration:none}a:hover{text-decoration:underline}
img.av,svg.av{border-radius:12px;object-fit:cover;display:block;flex:none}
.wrap{max-width:1080px;margin:0 auto;padding:0 20px}
/* Nav 2 tầng kiểu MetaTFT */
.navtop{background:var(--card2);border-bottom:1px solid var(--line);position:sticky;top:0;z-index:20}
.navtop .wrap{display:flex;gap:2px;align-items:center;padding:9px 20px;flex-wrap:wrap}
.navtop .brand{font-size:16px;font-weight:800;margin-right:16px;white-space:nowrap;color:var(--ink)}
.ng{position:relative}
.ng>a{display:block;padding:9px 15px;border-radius:8px;color:var(--muted);font-size:14px;font-weight:700;white-space:nowrap}
.ng.on>a,.ng:hover>a{background:var(--chip);color:var(--ink);text-decoration:none}
.ng .dd{position:absolute;top:100%;left:0;min-width:190px;background:var(--card);border:1px solid var(--line);border-radius:10px;padding:6px;box-shadow:0 12px 30px rgba(0,0,0,.5);opacity:0;visibility:hidden;transform:translateY(6px);transition:.14s;z-index:30}
.ng:hover .dd{opacity:1;visibility:visible;transform:translateY(2px)}
.ng .dd a{display:block;padding:8px 12px;border-radius:7px;color:var(--muted);font-size:13.5px;font-weight:600}
.ng .dd a:hover,.ng .dd a.on{background:var(--chip);color:var(--ink);text-decoration:none}
.navsub{background:var(--bg);border-bottom:1px solid var(--line);position:sticky;top:41px;z-index:19}
.navsub .wrap{display:flex;gap:4px;align-items:center;padding:7px 20px;flex-wrap:wrap;overflow-x:auto}
.navsub a{padding:6px 13px;border-radius:7px;color:var(--muted);font-size:13px;font-weight:600;white-space:nowrap}
.navsub a.on{color:var(--accent);border-bottom:2px solid var(--accent);border-radius:0}
.navsub a:hover{color:var(--ink);text-decoration:none}
/* Tab trong trang tướng */
.htabs{display:flex;gap:4px;flex-wrap:wrap;border-bottom:1px solid var(--line);margin:16px 0 4px;position:sticky;top:78px;background:var(--bg);z-index:8;padding-top:4px}
.htabs button{background:none;border:0;border-bottom:2px solid transparent;color:var(--muted);font-size:14px;font-weight:700;padding:9px 14px;cursor:pointer}
.htabs button.on{color:var(--accent);border-bottom-color:var(--accent)}
.htab{display:none}.htab.on{display:block}
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
.htile{display:flex;gap:10px;align-items:center;background:var(--chip);border:1px solid var(--line);border-radius:10px;padding:8px 12px 8px 8px;min-width:150px;transition:.14s}
.htile:hover{border-color:var(--accent);text-decoration:none;transform:translateY(-2px);box-shadow:0 6px 20px rgba(78,168,255,.18)}
.htile .av{width:38px;height:38px;border:1px solid var(--line)}
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

/* Unit detail kiểu MetaTFT: thẻ chân dung trái + chỉ số phải */
.udetail{display:grid;grid-template-columns:340px 1fr;gap:16px;margin-bottom:16px}
.usummary{background:var(--card);border:1px solid var(--line);border-radius:16px;overflow:hidden}
.usplash{position:relative;height:190px}
.usplash img{width:100%;height:100%;object-fit:cover;filter:saturate(1.12) contrast(1.06)}
.usplash .ov{position:absolute;inset:0;background:linear-gradient(180deg,rgba(0,0,0,.05) 40%,rgba(0,0,0,.85) 100%);display:flex;flex-direction:column;justify-content:flex-end;padding:12px 14px}
.usplash .nm{font-size:26px;font-weight:800;color:#fff;line-height:1.1;text-shadow:0 2px 10px rgba(0,0,0,.7)}
.usplash .role{display:inline-block;width:fit-content;margin-top:5px;padding:3px 10px;border-radius:7px;font-size:12px;font-weight:700;color:#0e1420}
.usplash .cost{position:absolute;top:10px;right:10px;display:flex;gap:6px}
.usplash .cost span{background:rgba(0,0,0,.55);border:1px solid rgba(255,255,255,.2);color:#fff;border-radius:8px;padding:3px 9px;font-size:12px;font-weight:700;backdrop-filter:blur(3px)}
.utraits{display:flex;gap:6px;flex-wrap:wrap;margin-top:7px}
.utraits span{background:rgba(255,255,255,.14);border:1px solid rgba(255,255,255,.2);color:#fff;border-radius:20px;padding:2px 9px;font-size:11px}
.uability{padding:13px 14px}
.uability .top{display:flex;gap:10px;align-items:center}
.uability .top img{width:44px;height:44px;border-radius:10px;flex:none;background:var(--chip)}
.uability .kind{font-size:11px;color:var(--accent);font-weight:700}
.uability .an{font-weight:700;font-size:15px}
.uability .desc{color:var(--muted);font-size:12.5px;margin-top:8px;line-height:1.55}
.ustats{display:flex;flex-direction:column;gap:14px}
.spanel{background:var(--card);border:1px solid var(--line);border-radius:16px;padding:16px}
.spanel .t{font-size:13px;font-weight:700;margin-bottom:12px}
.kpirow{display:flex;gap:26px;flex-wrap:wrap}
.kpi{text-align:left}
.kpi b{font-size:28px;font-weight:800;display:block;line-height:1}
.kpi span{font-size:11.5px;color:var(--muted);text-transform:uppercase;letter-spacing:.4px}
.posboard{display:grid;grid-template-columns:repeat(5,1fr);gap:8px;margin-top:6px}
.posboard .cell{background:var(--chip);border:1px solid var(--line);border-radius:9px;padding:9px 4px;text-align:center;font-size:11px;color:var(--muted)}
.posboard .cell.on{background:var(--accent);color:#fff;border-color:transparent;font-weight:700}
.rbanner{background:var(--card);border:1px solid var(--line);border-radius:16px;padding:16px;margin-bottom:16px}
.rbanner .t{font-size:13px;font-weight:700;margin-bottom:4px}
.rbanner .sub{color:var(--muted);font-size:12.5px;margin-bottom:12px}

/* Item build có icon + thứ tự */
.ib{display:flex;gap:8px;flex-wrap:wrap;align-items:stretch}
.ib .step{background:var(--chip);border:1px solid var(--line);border-radius:12px;padding:10px;width:130px;text-align:center;position:relative}
.ib .step .o{position:absolute;top:6px;left:8px;font-size:10px;font-weight:800;color:var(--accent)}
.ib .step img,.ib .step .ph2{width:48px;height:48px;border-radius:10px;margin:6px auto 6px;display:block;background:var(--bg)}
.ib .step .nm{font-weight:700;font-size:12.5px}.ib .step .ph{color:var(--muted);font-size:11px;margin-top:2px}
.ib .arrow{align-self:center;color:var(--muted);font-size:18px}
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

/* Khối kỹ năng chính thống (icon + tên + mô tả) */
.skl{display:flex;gap:12px;align-items:flex-start;background:var(--card);border:1px solid var(--line);border-radius:12px;padding:12px;margin:8px 0}
.skl img{width:46px;height:46px;border-radius:10px;flex:none;background:var(--chip)}
.skl .nm{font-weight:700;font-size:14px}.skl .ds{color:var(--muted);font-size:13px;margin-top:3px}
.skl .kind{font-size:11px;color:var(--accent);font-weight:700}
/* Trang bị theo thứ tự ưu tiên */
.prio{display:flex;gap:8px;flex-wrap:wrap;align-items:stretch}
.prio .step{background:var(--chip);border:1px solid var(--line);border-radius:11px;padding:9px 12px;min-width:120px;position:relative}
.prio .step .o{font-size:11px;color:var(--accent);font-weight:800}
.prio .step .ph{font-weight:700;font-size:13px}.prio .step .lb{color:var(--muted);font-size:12px;margin-top:2px}
.prio .arrow{align-self:center;color:var(--muted);font-size:18px}
.posbox{display:flex;gap:14px;align-items:center}
.posbox .tag{font-size:15px;font-weight:800;color:var(--accent)}
.introbox{background:var(--card);border:1px solid var(--line);border-left:3px solid var(--accent);border-radius:10px;padding:13px 16px;font-size:14px;margin:14px 0}
.srcnote{font-size:11px;color:var(--muted);margin-top:8px;font-style:italic}

/* Quảng cáo — vị trí kiểu MetaTFT (top banner + 2 rail dọc + xen nội dung) */
.ad{background:repeating-linear-gradient(45deg,var(--chip),var(--chip) 10px,transparent 10px,transparent 20px);border:1px dashed var(--line);border-radius:10px;display:flex;align-items:center;justify-content:center;color:var(--muted);font-size:11px;letter-spacing:1px;text-transform:uppercase}
.ad-top{height:90px;margin:14px 0}
.ad-inline{height:110px;margin:16px 0}
.ad-rail{position:fixed;top:120px;width:160px;height:600px;z-index:5;display:none}
.ad-rail.left{left:12px}.ad-rail.right{right:12px}
@media(min-width:1480px){.ad-rail{display:flex}}
/* Lưới trang bị */
.igrid{display:grid;grid-template-columns:repeat(auto-fill,minmax(140px,1fr));gap:10px;margin-top:14px}
.icard{background:var(--card);border:1px solid var(--line);border-radius:12px;padding:12px;text-align:center;transition:.14s}
.icard:hover{border-color:var(--accent);transform:translateY(-2px);box-shadow:0 6px 20px rgba(78,168,255,.15)}
.icard img{width:52px;height:52px;border-radius:11px;margin:0 auto 8px;display:block;background:var(--chip)}
.icard .inm{font-weight:700;font-size:13px}
.icard .ity{font-size:11px;color:var(--muted);margin-top:2px}
.icard .ilv{display:inline-block;margin-top:5px;font-size:10.5px;font-weight:700;padding:1px 7px;border-radius:20px;background:var(--chip);color:var(--gold)}
/* Bài viết */
.alist{display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-top:14px}
.acard{background:var(--card);border:1px solid var(--line);border-radius:14px;padding:16px;transition:.14s}
.acard:hover{border-color:var(--accent);transform:translateY(-2px)}
.acard h3{font-size:16px;margin-bottom:6px}.acard h3 a{color:var(--ink)}
.acard .am{font-size:12px;color:var(--muted)}.acard .atags{margin-top:8px}
.atags span{display:inline-block;background:var(--chip);color:var(--muted);border-radius:20px;padding:2px 9px;font-size:11px;margin:2px 5px 0 0}
.article{max-width:820px}
.article h1{font-size:26px;margin-bottom:6px}
.article .am{color:var(--muted);font-size:13px;margin-bottom:16px}
.afield{margin:16px 0}
.afield .lbl{font-size:11.5px;font-weight:800;color:var(--accent);text-transform:uppercase;letter-spacing:.6px;margin-bottom:7px}
.afield p{margin:8px 0;font-size:14.5px;line-height:1.7}
.afield.tip{background:var(--chip);border-left:3px solid var(--gold);border-radius:8px;padding:12px 16px}
.aicons{display:flex;gap:8px;flex-wrap:wrap}
.aicons img{width:48px;height:48px;border-radius:10px;background:var(--chip)}
.aicons a{display:block}
@media(max-width:720px){.grid2,.comp .why,.alist{grid-template-columns:1fr}.prio{flex-direction:column}.prio .arrow{transform:rotate(90deg)}.udetail{grid-template-columns:1fr}}
"""

# Nhóm nav 2 tầng: (group_key, nhãn, [(href, item_key, nhãn_con), ...])
NAV_GROUPS = [
    ("heroes", "Tướng", [("index.html", "tier", "Bảng xếp hạng"),
                         ("stats.html", "stats", "Chỉ số tướng"),
                         ("khac-che.html", "counter", "Tra khắc chế")]),
    ("comps", "Đội hình", [("comps.html", "comps", "Đội hình mạnh")]),
    ("items", "Trang bị", [("trang-bi.html", "items", "Danh sách trang bị")]),
    ("guides", "Cẩm nang", [("cam-nang.html", "guides", "Bài viết & hướng dẫn")]),
]


def esc(s) -> str:
    return html.escape(str(s))


def _nav(active_group: str, active_item: str, root: str = "") -> str:
    top = f'<span class="brand">⚔️ Liên Quân Tổng Hợp</span>'
    for gkey, glabel, items in NAV_GROUPS:
        dd = "".join(
            f'<a href="{root}{href}" class="{"on" if ik == active_item else ""}">{esc(lbl)}</a>'
            for href, ik, lbl in items)
        head = items[0][0]      # bấm nhãn nhóm -> trang đầu của nhóm
        top += (f'<div class="ng {"on" if gkey == active_group else ""}">'
                f'<a href="{root}{head}">{esc(glabel)}</a><div class="dd">{dd}</div></div>')
    nav = f'<div class="navtop"><div class="wrap">{top}</div></div>'
    # Sub-bar: các mục con của nhóm đang mở.
    cur = next((g for g in NAV_GROUPS if g[0] == active_group), None)
    if cur and len(cur[2]) >= 1:
        sub = "".join(
            f'<a href="{root}{href}" class="{"on" if ik == active_item else ""}">{esc(lbl)}</a>'
            for href, ik, lbl in cur[2])
        nav += f'<div class="navsub"><div class="wrap">{sub}</div></div>'
    return nav


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


def _ad(slot: str, cls: str) -> str:
    """Ô quảng cáo — chèn mã AdSense vào giữa (giữ marker để dễ tìm & thay)."""
    return (f'<!-- AD SLOT: {slot} — dán mã AdSense <ins class="adsbygoogle">…</ins> vào đây -->'
            f'<div class="ad {cls}" data-ad="{slot}">Quảng cáo</div>')


def _page(title: str, desc: str, nav_group: str, nav_item: str, body: str,
          root: str = "") -> str:
    rails = (_ad("rail-left", "ad-rail left") + _ad("rail-right", "ad-rail right"))
    return (f'<!doctype html><html lang="vi"><head><meta charset="utf-8">'
            f'<meta name="viewport" content="width=device-width,initial-scale=1">'
            f'<title>{esc(title)}</title>'
            f'<meta name="description" content="{esc(desc)}">'
            f'<style>{CSS}</style></head><body>{_nav(nav_group, nav_item, root)}{rails}'
            f'<div class="wrap">{_ad("top-banner", "ad-top")}</div>{body}'
            f'{_footer(root)}</body></html>')


def _initials(name: str) -> str:
    clean = name.replace("'", "")
    parts = clean.split()
    return (parts[0][0] + parts[1][0]).upper() if len(parts) >= 2 else clean[:2].upper()


def avatar(h: dict, size: int, root: str = "") -> str:
    if h.get("img"):
        return f'<img class="av" src="{esc(_loc(h["img"], root))}" width="{size}" height="{size}" alt="{esc(h["name"])}" loading="lazy">'
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
            f'{avatar(h,38,root)}<div><div class="nm">{esc(h["name"])}</div>'
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
                 "đội hình mạnh và trang bị — suy luận từ bộ kỹ năng.", "heroes", "tier", body)


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
                 "vai trò, đường — sắp xếp và lọc như MetaTFT.", "heroes", "stats", body)


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
                 "poke, bắt lẻ — máy tính độ ăn ý từ bộ kỹ năng.", "comps", "comps", body)


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
                 "khắc chế khi cùng đường và trong giao tranh, kèm lý do.", "heroes", "counter", body)


# ------------------------------------------------------------- TRANG TRANG BỊ
_ITEM_TYPES = ["Công", "Phép", "Thủ", "Tốc độ", "Đi rừng", "Trợ thủ"]


def build_items_page(items_db: list[dict], meta) -> str:
    lvl_txt = {1: "Cấp 1", 2: "Cấp 2", 3: "Cấp 3"}
    cards = ""
    for it in sorted(items_db, key=lambda x: (_ITEM_TYPES.index(x["type"]) if x["type"] in _ITEM_TYPES else 9, -x["level"])):
        ic = (f'<img src="{esc(_loc(it["icon"]))}" alt="" loading="lazy">'
              if it.get("icon") else '<div style="width:52px;height:52px;border-radius:11px;background:var(--chip);margin:0 auto 8px"></div>')
        cards += (f'<div class="icard" data-type="{esc(it["type"])}" data-lv="{it["level"]}">{ic}'
                  f'<div class="inm">{esc(it["name"])}</div><div class="ity">{esc(it["type"])}</div>'
                  f'<span class="ilv">{esc(lvl_txt.get(it["level"], "?"))}</span></div>')
    tbar = "".join(
        f'<button class="{"on" if x=="Tất cả" else ""}" data-f="type" data-v="{esc(x)}" onclick="fit(this)">{esc(x)}</button>'
        for x in ["Tất cả"] + _ITEM_TYPES)
    lbar = "".join(
        f'<button data-f="lv" data-v="{v}" onclick="fit(this)">{esc(t)}</button>'
        for v, t in [(3, "Cấp 3"), (2, "Cấp 2"), (1, "Cấp 1")])
    js = """<script>
var IF={type:'Tất cả',lv:0};
function fit(b){var f=b.dataset.f,v=b.dataset.v;
 if(f==='lv'&&IF.lv==v){IF.lv=0;b.classList.remove('on');}
 else{IF[f]=(f==='lv')?+v:v;document.querySelectorAll('.bar button[data-f='+f+']').forEach(x=>x.classList.remove('on'));b.classList.add('on');}
 document.querySelectorAll('.icard').forEach(function(c){
  var ok=(IF.type==='Tất cả'||c.dataset.type===IF.type)&&(!IF.lv||+c.dataset.lv===IF.lv);
  c.style.display=ok?'block':'none';});}
</script>"""
    body = (f'<header><div class="wrap"><h1>Danh sách trang bị</h1>'
            f'<p class="sub">{len(items_db)} trang bị Liên Quân — lọc theo loại và cấp. '
            f'Dữ liệu chính thống từ Garena; dùng để dựng bộ đồ đề xuất trên trang tướng.</p>'
            f'{_trust(meta, len(items_db))}'
            f'<div class="bar">{tbar}</div><div class="bar"><span style="color:var(--muted);font-size:12.5px">Cấp:</span>{lbar}</div>'
            f'</div></header><div class="wrap"><div class="igrid">{cards}</div></div>{js}')
    return _page("Danh sách trang bị Liên Quân — icon, loại, cấp",
                 "Toàn bộ trang bị Liên Quân Mobile: công, phép, thủ, giày, đi rừng, trợ thủ — "
                 "lọc theo loại và cấp.", "items", "items", body)


# --------------------------------------------------------------- CẨM NANG ----
def _article_slug(a: dict) -> str:
    import re
    return a.get("id") or (re.sub(r"[^\w]+", "-", a.get("title", "bai-viet").lower()).strip("-")[:50] or "bai-viet")


def _hero_icon_by_key(key: str, by_id: dict, by_name: dict, root: str) -> str:
    h = by_id.get(key) or by_name.get(key.lower())
    if not h:
        return ""
    href = f'{root}hero/{esc(h["id"])}.html'
    img = (f'<img src="{esc(_loc(h["img"], root))}" alt="{esc(h["name"])}" title="{esc(h["name"])}" loading="lazy">'
           if h.get("img") else "")
    return f'<a href="{href}">{img}</a>'


def build_guides(articles: list[dict], meta) -> str:
    cards = ""
    for a in articles:
        tags = "".join(f'<span>{esc(t)}</span>' for t in a.get("tags", []))
        cards += (f'<div class="acard"><h3><a href="bai-viet/{esc(_article_slug(a))}.html">'
                  f'{esc(a["title"])}</a></h3>'
                  f'<div class="am">✍️ {esc(a.get("author","AURA"))} · {esc(a.get("date",""))}</div>'
                  f'<div class="atags">{tags}</div></div>')
    body = (f'<header><div class="wrap"><h1>Cẩm nang & Bài viết</h1>'
            f'<p class="sub">Hướng dẫn chơi, phân tích meta, mẹo leo rank. '
            f'Muốn góp bài? Xem phần bình luận cuối mỗi bài (khi bật Giscus).</p>'
            f'</div></header><div class="wrap"><div class="alist">{cards or "<div class=\'empty\'>Chưa có bài viết.</div>"}</div></div>')
    return _page("Cẩm nang Liên Quân — hướng dẫn, mẹo, phân tích meta",
                 "Bài viết & cẩm nang Liên Quân Mobile: hướng dẫn chơi tướng, phân tích meta, "
                 "mẹo leo rank, cách đọc khắc chế.", "guides", "guides", body)


def build_article(a: dict, by_id: dict, by_name: dict) -> str:
    root = "../"
    fields = ""
    for s in a.get("sections", []):
        typ = s.get("type", "text")
        lbl = f'<div class="lbl">{esc(s["label"])}</div>' if s.get("label") else ""
        if typ in ("text", "tip", "stage"):
            cls = "tip" if typ == "tip" else ""
            txt = s.get("html") or f'<p>{esc(s.get("text",""))}</p>'
            fields += f'<div class="afield {cls}">{lbl}{txt}</div>'
        elif typ == "items":
            db = engine.item_db()
            icons = "".join(
                f'<img src="{esc(_loc(db.get(n,{}).get("icon",""), root))}" alt="{esc(n)}" title="{esc(n)}" loading="lazy">'
                for n in s.get("items", []) if db.get(n, {}).get("icon"))
            fields += f'<div class="afield">{lbl}<div class="aicons">{icons}</div></div>'
        elif typ in ("teammate", "counter"):
            icons = "".join(_hero_icon_by_key(k, by_id, by_name, root) for k in s.get("heroes", []))
            fields += f'<div class="afield">{lbl}<div class="aicons">{icons}</div></div>'
        else:  # talent/rune/emblem: hiển thị text
            fields += f'<div class="afield">{lbl}<p>{esc(s.get("value") or s.get("text",""))}</p></div>'
    tags = "".join(f'<span>{esc(t)}</span>' for t in a.get("tags", []))
    body = (f'<div class="wrap hwrap article">'
            f'<div class="crumbs"><a href="../cam-nang.html">← Cẩm nang</a></div>'
            f'<h1>{esc(a["title"])}</h1>'
            f'<div class="am">✍️ {esc(a.get("author","AURA"))} · {esc(a.get("date",""))} '
            f'<span class="atags">{tags}</span></div>'
            f'{_ad("article-top","ad-inline")}{fields}'
            f'<div class="afield"><div class="lbl">Bình luận</div>'
            f'<p class="empty">Khu vực bình luận sẽ hiện ở đây khi bật Giscus (bình luận qua tài '
            f'khoản GitHub, miễn phí) — xem README để cấu hình.</p></div></div>')
    return _page(f'{a["title"]} — Cẩm nang Liên Quân',
                 esc(a.get("title", ""))[:150], "guides", "guides", body, root="../")


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


_SKILL_KIND = ["Nội tại", "Chiêu 1", "Chiêu 2", "Chiêu cuối"]


def _intro(h) -> str:
    if h.get("intro"):
        return h["intro"]
    roles = " / ".join(h["roles"])
    spike = SPIKE_TXT.get(h.get("spike", "mid"), "").lower()
    tags = ", ".join(h.get("tags", [])[:3])
    s = f'{h["name"]} là tướng {roles} đi đường {h["lane"]}, {spike}.'
    if tags:
        s += f' Nổi bật ở lối chơi: {tags}.'
    return s


def build_hero(h, roster, items) -> str:
    c = engine.counters(h, roster)
    syn = engine.synergies(h, roster)
    prio = engine.build_priority(h, items)
    pos_tag, pos_note = engine.positioning(h)
    fit = engine.comps_with(h, roster)
    t = engine.tier_of(h)
    wr = h.get("winrate")

    tags = "".join(f"<span>{esc(x)}</span>" for x in h.get("tags", []))
    winline = (f"Win {wr}% · Pick {h.get('pickrate','?')}% · " if wr is not None else "") \
        + esc(" · ".join(h["roles"])) + " · " + esc(h["lane"])
    combo = f'<span class="pill">Combo: {esc(h["combo"])}</span>' if h.get("combo") else ""
    tmpl = ('<span class="pill" style="border-color:#ffd93d;color:#c99a00">Số liệu chiến đấu theo mẫu vai trò — chờ tinh chỉnh</span>'
            if h.get("templated") else "")

    # 1) Kỹ năng chính thống (icon + tên + mô tả từ Garena).
    if h.get("skills"):
        rows = ""
        for i, s in enumerate(h["skills"]):
            kind = _SKILL_KIND[i] if i < len(_SKILL_KIND) else f"Chiêu {i}"
            icon = (f'<img src="{esc(_loc(s["icon"], "../"))}" alt="" loading="lazy">'
                    if s.get("icon") else '<div style="width:46px;height:46px;border-radius:10px;background:var(--chip)"></div>')
            rows += (f'<div class="skl">{icon}<div><div class="kind">{kind}</div>'
                     f'<div class="nm">{esc(s.get("name",""))}</div>'
                     f'<div class="ds">{esc(s.get("desc",""))}</div></div></div>')
        skills_html = (f'<div class="panel" style="grid-column:1/-1"><h2>Bộ kỹ năng</h2>{rows}'
                       f'<div class="srcnote">Nguồn mô tả kỹ năng: Garena Liên Quân (hocvien.lienquan.garena.vn).</div></div>')
    else:
        skills_html = ('<div class="panel" style="grid-column:1/-1"><h2>Bộ kỹ năng</h2>'
                       '<div class="empty">Chưa nạp được kỹ năng cho tướng này.</div></div>')

    # 2) Trang bị theo THỨ TỰ ƯU TIÊN (icon + tên thật).
    steps = []
    for s in prio:
        ic = (f'<img src="{esc(_loc(s["icon"], "../"))}" alt="" loading="lazy">'
              if s.get("icon") else '<div class="ph2"></div>')
        steps.append(f'<div class="step"><div class="o">{s["order"]}</div>{ic}'
                     f'<div class="nm">{esc(s["name"])}</div>'
                     f'<div class="ph">{esc(s["phase"])}</div></div>')
    build_html = '<span class="arrow">→</span>'.join(steps)

    # 3) Bổ trợ / Phù hiệu / Ngọc.
    spellbox = (f'<div class="subhead">Bổ trợ</div><div class="spellbox">'
                f'<span>{esc(h.get("spell",""))}</span>'
                f'<span style="color:var(--muted)">Địch nhiều khống chế → Thanh Tẩy</span></div>'
                f'<div class="subhead" style="margin-top:12px">Phù hiệu</div><div class="spellbox">'
                f'<span>{esc(engine.emblem(h))}</span></div>'
                f'<div class="subhead" style="margin-top:12px">Bảng ngọc (theo loại chỉ số)</div>'
                f'<div class="spellbox">'
                + "".join(f'<span>{esc(a)}</span>' for a in h.get("arcana", [])) + '</div>')

    # 4) Đội hình phù hợp.
    if fit:
        cboxes = ""
        for comp in fit:
            note = " (gợi ý theo lối chơi)" if comp.get("suggested") else ""
            mem = " · ".join(m["name"] for m in comp["members"])
            cboxes += (f'<div class="mu"><a href="../comps.html">{esc(comp["theme"])}{note}</a>'
                       f'<ul><li>{esc(mem)}</li><li style="color:var(--accent)">{esc(comp["play"])}</li></ul></div>')
    else:
        cboxes = '<div class="empty">Chưa tính ra đội hình phù hợp.</div>'

    lane_block = (f'<div class="subhead">⚔️ Khắc chế được (cùng đường)</div>'
                  f'{_mu_list(c["lane"]["khac_che"], "Không có đối thủ cùng đường bị khắc rõ.")}'
                  f'<div class="subhead" style="margin-top:12px">🛡️ Bị khắc chế (cùng đường)</div>'
                  f'{_mu_list(c["lane"]["bi_khac_che"], "Không bị tướng cùng đường khắc rõ.")}')
    tf_block = (f'<div class="subhead">⚔️ Khắc chế được (khác đường)</div>'
                f'{_mu_list(c["teamfight"]["khac_che"], "Chưa tính ra đối trọng rõ ở giao tranh.")}'
                f'<div class="subhead" style="margin-top:12px">🛡️ Bị khắc chế (khác đường)</div>'
                f'{_mu_list(c["teamfight"]["bi_khac_che"], "Chưa có tướng khắc rõ ở giao tranh.")}')

    # ---- Khối UnitDetail kiểu MetaTFT ----
    rc = ROLE_COLOR.get(engine.primary_role(h), "#4aa3ff")
    splash_img = (f'<img src="{esc(_loc(h["img"], "../"))}" alt="{esc(h["name"])}" loading="lazy">'
                  if h.get("img") else avatar(h, 180, "../"))
    traits = "".join(f'<span>{esc(x)}</span>' for x in h.get("tags", [])[:4])
    summary = (
        f'<div class="usummary"><div class="usplash">{splash_img}'
        f'<div class="cost"><span style="background:{TIER_COLOR[t]};color:#0e1420">Tier {t}</span>'
        f'<span>{esc(SPIKE_TXT.get(h.get("spike","mid"),""))}</span></div>'
        f'<div class="ov"><div class="nm">{esc(h["name"])}</div>'
        f'<span class="role" style="background:{rc}">{esc(" · ".join(h["roles"]))}</span>'
        f'<div class="utraits">{traits}</div></div></div>')
    # Kỹ năng nổi bật = chiêu cuối (hoặc nội tại nếu ít chiêu).
    if h.get("skills"):
        feat = h["skills"][-1] if len(h["skills"]) >= 4 else h["skills"][0]
        fi = len(h["skills"]) - 1 if len(h["skills"]) >= 4 else 0
        kind = _SKILL_KIND[fi] if fi < len(_SKILL_KIND) else "Chiêu"
        ic = (f'<img src="{esc(_loc(feat.get("icon",""), "../"))}" alt="" loading="lazy">' if feat.get("icon")
              else '<div style="width:44px;height:44px;border-radius:10px;background:var(--chip)"></div>')
        summary += (f'<div class="uability"><div class="top">{ic}'
                    f'<div><div class="kind">{kind} · Kỹ năng chủ chốt</div>'
                    f'<div class="an">{esc(feat.get("name",""))}</div></div></div>'
                    f'<div class="desc">{esc(feat.get("desc",""))}</div></div>')
    summary += "</div>"

    # Cột phải: chỉ số + vị trí (bảng 5 đường).
    kpirow = (f'<div class="kpirow">'
              f'<div class="kpi"><b style="color:{TIER_COLOR[t]}">{wr if wr is not None else "—"}%</b><span>Tỉ lệ thắng</span></div>'
              f'<div class="kpi"><b>{h.get("pickrate","—")}%</b><span>Tỉ lệ chọn</span></div>'
              f'<div class="kpi"><b>{t}</b><span>Xếp hạng</span></div></div>')
    board = '<div class="posboard">' + "".join(
        f'<div class="cell{" on" if l==h["lane"] else ""}">{esc(l)}</div>' for l in LANES
    ) + "</div>"
    stats = (f'<div class="ustats">'
             f'<div class="spanel"><div class="t">Chỉ số {esc(h["name"])}</div>{kpirow}</div>'
             f'<div class="spanel"><div class="t">Vị trí trong đội hình</div>'
             f'<div class="kpi"><b style="font-size:16px;color:{rc}">{esc(pos_tag)}</b></div>'
             f'<div class="play" style="margin:6px 0 4px">{esc(pos_note)}</div>{board}</div>'
             f'{_ad("hero-side","ad-inline")}</div>')

    detail = f'<div class="udetail">{summary}{stats}</div>'

    # Recommended Builds — dải nổi bật (giống MetaTFT).
    rec = (f'<div class="rbanner"><div class="t">⚙️ Bộ trang bị đề xuất (thứ tự ưu tiên lên đồ)</div>'
           f'<div class="sub">Gợi ý theo vai trò {esc(engine.primary_role(h))} — bổ trợ '
           f'<b>{esc(h.get("spell",""))}</b>, phù hiệu <b>{esc(engine.emblem(h))}</b>. '
           f'Địch nhiều hồi máu → chèn Kháng hồi máu; nhiều khống chế → Giày kháng hiệu ứng.</div>'
           f'<div class="ib">{build_html}</div></div>')

    # Tab nội dung (phong cách sub-nav của MetaTFT áp vào trang tướng).
    tab_over = (f'<div class="htab on" id="tab-over"><div class="introbox">{esc(_intro(h))}</div>'
                f'<div class="grid2">'
                f'<div class="panel"><h2>Thuộc tính (từ bộ kỹ năng)</h2>{_attr_bar(h)}</div>'
                f'<div class="panel"><h2>Hướng dẫn chơi cơ bản</h2><div class="play">{esc(h.get("play",""))}</div></div>'
                f'<div class="panel"><h2>✅ Ưu điểm</h2>{_ul(h.get("pros",[]),"pro")}</div>'
                f'<div class="panel"><h2>⚠️ Nhược điểm</h2>{_ul(h.get("cons",[]),"con")}</div>'
                f'</div></div>')
    tab_skill = f'<div class="htab" id="tab-skill"><div class="grid2">{skills_html}</div></div>'
    tab_item = (f'<div class="htab" id="tab-item">{rec}'
                f'{_ad("hero-mid","ad-inline")}'
                f'<div class="grid2"><div class="panel" style="grid-column:1/-1">'
                f'<h2>Bổ trợ · Phù hiệu · Bảng ngọc</h2>{spellbox}</div></div></div>')
    tab_ctr = (f'<div class="htab" id="tab-ctr"><div class="grid2">'
               f'<div class="panel"><h2>Khắc chế — đi đường</h2>{lane_block}</div>'
               f'<div class="panel"><h2>Khắc chế — giao tranh</h2>{tf_block}</div></div></div>')
    tab_team = (f'<div class="htab" id="tab-team"><div class="grid2">'
                f'<div class="panel"><h2>🤝 Phối hợp đội hình</h2>'
                f'{_mu_list(syn,"Chưa tính ra cặp phối hợp nổi bật.")}</div>'
                f'<div class="panel"><h2>Đội hình phù hợp</h2>{cboxes}</div></div></div>')
    tabbar = ('<div class="htabs">'
              '<button class="on" onclick="ht(this,\'over\')">Tổng quan</button>'
              '<button onclick="ht(this,\'skill\')">Kỹ năng</button>'
              '<button onclick="ht(this,\'item\')">Trang bị & Ngọc</button>'
              '<button onclick="ht(this,\'ctr\')">Khắc chế</button>'
              '<button onclick="ht(this,\'team\')">Đội hình</button></div>')
    js = ("<script>function ht(b,id){"
          "document.querySelectorAll('.htabs button').forEach(x=>x.classList.remove('on'));b.classList.add('on');"
          "document.querySelectorAll('.htab').forEach(t=>t.classList.remove('on'));"
          "document.getElementById('tab-'+id).classList.add('on');}</script>")

    body = (f'<div class="wrap hwrap">'
            f'<div class="crumbs"><a href="../index.html">← Bảng xếp hạng</a> · '
            f'<a href="../khac-che.html">Tra khắc chế</a> · <a href="../comps.html">Đội hình</a></div>'
            f'{tmpl}{detail}{tabbar}{tab_over}{tab_skill}{tab_item}{tab_ctr}{tab_team}</div>{js}')
    return _page(f'{h["name"]} Liên Quân — kỹ năng, trang bị, ngọc, phù hiệu, khắc chế',
                 f'Giáo án {h["name"]} Liên Quân Mobile: giới thiệu, bộ kỹ năng, hướng dẫn chơi, '
                 f'trang bị theo thứ tự ưu tiên, phù hiệu, ngọc, vị trí, khắc chế, đội hình.', "heroes", "", body, root="../")


# ----------------------------------------------------------------------- SEO
def build_sitemap(roster, articles=()) -> str:
    today = time.strftime("%Y-%m-%d")
    pages = [href for _, _, items in NAV_GROUPS for href, _, _ in items]
    urls = [f"{SITE_URL}/{p}" for p in pages] \
        + [f"{SITE_URL}/hero/{h['id']}.html" for h in roster] \
        + [f"{SITE_URL}/bai-viet/{_article_slug(a)}.html" for a in articles]
    entries = "".join(f"<url><loc>{u}</loc><lastmod>{today}</lastmod></url>" for u in urls)
    return f'<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">{entries}</urlset>'


def _load_items_db() -> list[dict]:
    f = ROOT / "data" / "garena_items.json"
    return json.loads(f.read_text(encoding="utf-8")).get("items", []) if f.is_file() else []


def _load_articles() -> list[dict]:
    f = ROOT / "data" / "articles.json"
    return json.loads(f.read_text(encoding="utf-8")).get("articles", []) if f.is_file() else []


def main() -> None:
    roster = engine.load_heroes()
    meta = engine.load_meta()
    items = engine.load_items()
    items_db = _load_items_db()
    articles = _load_articles()
    by_id = {h["id"]: h for h in roster}
    by_name = {h["name"].lower(): h for h in roster}
    # Dọn docs NHƯNG GIỮ docs/img (ảnh nặng, được commit để GitHub Pages phục vụ;
    # không xóa mỗi lần build kẻo rebuild trên bản clone thiếu assets/ làm mất ảnh).
    if OUT.exists():
        for p in OUT.iterdir():
            if p.name == "img":
                continue
            shutil.rmtree(p) if p.is_dir() else p.unlink()
    OUT.mkdir(exist_ok=True)
    (OUT / "hero").mkdir(parents=True, exist_ok=True)
    (OUT / "img").mkdir(exist_ok=True)

    # Bổ sung ảnh mới từ assets/img (nếu có) — chỉ copy file còn thiếu.
    if ASSETS.is_dir():
        added = 0
        for f in ASSETS.glob("*"):
            dst = OUT / "img" / f.name
            if not dst.exists():
                shutil.copy2(f, dst)
                added += 1
        print(f"  đồng bộ ảnh -> docs/img (+{added} mới, tổng {sum(1 for _ in (OUT/'img').glob('*'))})")

    (OUT / ".nojekyll").write_text("", encoding="utf-8")
    (OUT / "index.html").write_text(build_index(roster, meta), encoding="utf-8")
    (OUT / "stats.html").write_text(build_stats(roster, meta), encoding="utf-8")
    (OUT / "comps.html").write_text(build_comps(roster, by_id, meta), encoding="utf-8")
    (OUT / "khac-che.html").write_text(build_counter_page(roster, meta), encoding="utf-8")
    (OUT / "trang-bi.html").write_text(build_items_page(items_db, meta), encoding="utf-8")
    (OUT / "cam-nang.html").write_text(build_guides(articles, meta), encoding="utf-8")
    for h in roster:
        (OUT / "hero" / f"{h['id']}.html").write_text(build_hero(h, roster, items), encoding="utf-8")
    if articles:
        (OUT / "bai-viet").mkdir(exist_ok=True)
        for a in articles:
            (OUT / "bai-viet" / f"{_article_slug(a)}.html").write_text(
                build_article(a, by_id, by_name), encoding="utf-8")
    (OUT / "sitemap.xml").write_text(build_sitemap(roster, articles), encoding="utf-8")
    (OUT / "robots.txt").write_text(f"User-agent: *\nAllow: /\nSitemap: {SITE_URL}/sitemap.xml\n",
                                    encoding="utf-8")

    print(f"[OK] built 4 pages + {len(roster)} hero pages + sitemap -> {OUT}")


if __name__ == "__main__":
    main()
