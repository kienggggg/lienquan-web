"""Bộ máy TÍNH meta Liên Quân từ thuộc tính tướng.

Không cào, không bịa: mọi kết luận (khắc chế / phối hợp / đội hình / trang bị)
đều suy ra bằng LUẬT từ `attr` + `spike` (mã hóa từ bộ kỹ năng & lối chơi) trong
data/heroes.json. Đây là tầng giá trị mà web chỉ-hiện-winrate không có.
"""

from __future__ import annotations

import json
from itertools import product
from pathlib import Path

DATA = Path(__file__).parent / "data"
_SPIKE = {"early": 0, "mid": 1, "late": 2}

# Mẫu theo vai trò — điền cho tướng nhập gọn (chưa tinh chỉnh riêng). attr là điểm
# KHỞI ĐẦU đại diện cho lối chơi chung của vai trò; Sếp/AURA chỉnh dần theo từng kit.
ROLE_TEMPLATE = {
    "Sát thủ": {"lane": "Rừng", "damage": "physical", "spike": "mid",
        "attr": {"mobility": 3, "cc": 1, "range": 0, "sustain": 1, "burst": 3, "dps": 1, "engage": 2, "tanky": 0},
        "pros": ["Cơ động cao, ra vào giao tranh linh hoạt", "Bùng nổ mạnh, bắt lẻ tốt"],
        "cons": ["Máu mỏng, sợ khống chế cứng", "Đầu trận phụ thuộc farm"],
        "play": "Farm rừng nhanh, rình bắt lẻ mục tiêu tầm xa đi lẻ; giao tranh tổng vào sau nhắm chủ lực rồi thoát."},
    "Xạ thủ": {"lane": "Rồng", "damage": "physical", "spike": "late",
        "attr": {"mobility": 1, "cc": 0, "range": 2, "sustain": 0, "burst": 2, "dps": 3, "engage": 0, "tanky": 0},
        "pros": ["Sát thương dồn cao, gánh kèo cuối trận", "Kiểm soát mục tiêu từ khoảng cách"],
        "cons": ["Mỏng, cơ động thấp, sợ bị bắt lẻ", "Đầu trận yếu, cần được bảo kê"],
        "play": "Farm an toàn, đứng sau tuyến giao tranh xả sát thương vào mục tiêu gần nhất; luôn giữ khoảng cách với sát thủ."},
    "Pháp sư": {"lane": "Trung", "damage": "magic", "spike": "mid",
        "attr": {"mobility": 1, "cc": 1, "range": 2, "sustain": 0, "burst": 3, "dps": 2, "engage": 0, "tanky": 0},
        "pros": ["Bùng nổ phép cao", "Dọn lính nhanh, kiểm soát đường giữa"],
        "cons": ["Mỏng, cơ động thấp", "Hết combo phải chờ hồi chiêu"],
        "play": "Kiểm soát đường giữa, roam hỗ trợ khi có cơ hội; giao tranh đứng xa nhả combo bùng nổ rồi lùi."},
    "Đấu sĩ": {"lane": "Tà Thần", "damage": "physical", "spike": "mid",
        "attr": {"mobility": 1, "cc": 2, "range": 0, "sustain": 2, "burst": 2, "dps": 2, "engage": 2, "tanky": 2},
        "pros": ["Vừa chịu đòn vừa gây sát thương", "Có khống chế, đôi công đường tốt"],
        "cons": ["Cơ động thấp, dễ bị poke tầm xa", "Bùng nổ không cao"],
        "play": "Cầm đường Tà Thần đôi công thắng thế rồi đảo gank; giao tranh nhảy tuyến sau khống chế và chịu đòn cho đội."},
    "Đỡ đòn": {"lane": "Hỗ trợ", "damage": "magic", "spike": "early",
        "attr": {"mobility": 1, "cc": 2, "range": 0, "sustain": 1, "burst": 1, "dps": 1, "engage": 2, "tanky": 3},
        "pros": ["Cực trâu, mở giao tranh và chắn cho đội", "Nhiều khống chế"],
        "cons": ["Sát thương thấp", "Phụ thuộc đồng đội tận dụng khống chế"],
        "play": "Đi tuyến đầu, mở giao tranh bằng khống chế khi địch đứng cụm, chắn giữa địch và chủ lực nhà."},
    "Hỗ trợ": {"lane": "Hỗ trợ", "damage": "magic", "spike": "early",
        "attr": {"mobility": 1, "cc": 2, "range": 1, "sustain": 2, "burst": 1, "dps": 1, "engage": 1, "tanky": 2},
        "pros": ["Bảo kê chủ lực mạnh", "Có khống chế / hồi phục / giải vây"],
        "cons": ["Bản thân yếu, sát thương thấp", "Sợ bị nhắm trước"],
        "play": "Bám sát chủ lực, hồi phục/tạo khiên và khống chế giải vây đúng lúc; giữ tầm nhìn cho đội."},
}
_ROLE_PICK = ["Xạ thủ", "Sát thủ", "Đấu sĩ", "Pháp sư", "Đỡ đòn", "Hỗ trợ"]

# Bổ trợ mặc định: đi Rừng luôn là Trừng Trị; còn lại Bộc Phá (đổi Thanh Tẩy khi
# địch nhiều khống chế — ghi chú hiện trên trang). Ngọc gợi ý theo LOẠI CHỈ SỐ
# (luôn đúng theo vai trò); tên viên cụ thể để user tinh chỉnh theo phiên bản.
ROLE_SPELL = {"default": "Bộc Phá", "Rừng": "Trừng Trị"}
ROLE_ARCANA = {
    "Sát thủ": ["Đỏ: Công vật lý / chí mạng", "Tím: Xuyên giáp + tốc chạy", "Lục: Công vật lý / xuyên giáp"],
    "Xạ thủ":  ["Đỏ: Công vật lý / tốc đánh", "Tím: Tốc đánh + tốc chạy", "Lục: Chí mạng / xuyên giáp"],
    "Pháp sư": ["Đỏ: Công phép", "Tím: Xuyên giáp phép + tốc chạy", "Lục: Công phép / giảm hồi chiêu"],
    "Đấu sĩ":  ["Đỏ: Công vật lý / máu", "Tím: Máu + tốc chạy", "Lục: Xuyên giáp / hút máu"],
    "Đỡ đòn":  ["Đỏ: Máu / giáp", "Tím: Máu + tốc chạy", "Lục: Giáp / kháng phép / hồi chiêu"],
    "Hỗ trợ":  ["Đỏ: Máu / công phép", "Tím: Máu + tốc chạy", "Lục: Giảm hồi chiêu / kháng phép"],
}


def _fill(h: dict) -> dict:
    """Điền các trường thiếu từ mẫu vai trò (cho tướng nhập gọn)."""
    h["templated"] = "attr" not in h          # tướng chưa có thuộc tính riêng = còn dùng mẫu
    role = next((r for r in _ROLE_PICK if r in h.get("roles", [])), h.get("roles", ["Đấu sĩ"])[0])
    tpl = ROLE_TEMPLATE.get(role, ROLE_TEMPLATE["Đấu sĩ"])
    for k in ("lane", "damage", "spike", "attr", "pros", "cons", "play"):
        h.setdefault(k, tpl[k])
    h.setdefault("tags", [])
    h.setdefault("combo", "")
    h.setdefault("winrate", None)
    h.setdefault("pickrate", None)
    h.setdefault("skills", [])       # [{"name","desc","note"}] — nạp dần từ giáo án
    h.setdefault("spell", ROLE_SPELL.get(h.get("lane"), ROLE_SPELL["default"]))
    h.setdefault("arcana", ROLE_ARCANA.get(role, ROLE_ARCANA["Đấu sĩ"]))
    return h


def load_heroes() -> list[dict]:
    raw = json.loads((DATA / "heroes.json").read_text(encoding="utf-8"))["heroes"]
    return [_fill(dict(h)) for h in raw]


def load_meta() -> dict:
    """Metadata site: patch (phiên bản game của số liệu), nguồn số liệu..."""
    d = json.loads((DATA / "heroes.json").read_text(encoding="utf-8"))
    return {"patch": d.get("patch", ""), "source": d.get("source", "")}


def load_items() -> dict:
    return json.loads((DATA / "items.json").read_text(encoding="utf-8"))


def _a(h: dict, k: str) -> int:
    return int(h.get("attr", {}).get(k, 0))


def _is(h: dict, role: str) -> bool:
    return role in h.get("roles", [])


def _spike(h: dict) -> int:
    return _SPIKE.get(h.get("spike", "mid"), 1)


# ------------------------------------------------- KHẮC CHẾ KHÁC ĐƯỜNG --------
# (giao tranh tổng / bản đồ — hai tướng KHÔNG đối đầu trực tiếp khi đi đường)
def _counter_teamfight(a: dict, b: dict) -> tuple[int, list[str]]:
    s, why = 0, []
    if _a(a, "mobility") >= 3 and _a(a, "burst") >= 3 and _a(b, "range") >= 2 \
            and _a(b, "mobility") <= 1 and _a(b, "tanky") <= 1:
        s += 3
        why.append(f"Cơ động + bùng nổ, nhảy thẳng vào {b['name']} (tầm xa, ít di chuyển) hạ trước khi kịp phản ứng.")
    if _a(a, "cc") >= 2 and _a(a, "tanky") >= 2 and _is(b, "Sát thủ") and _a(b, "tanky") <= 1:
        s += 3
        why.append(f"Khống chế cứng + trụ đòn, khóa chết {b['name']} ngay khi lao vào.")
    if _a(a, "range") >= 3 and _a(b, "range") <= 1 and _a(b, "mobility") <= 1:
        s += 2
        why.append(f"Tầm bắn vượt trội, rỉa máu {b['name']} cận chiến trước khi kịp áp sát.")
    if _a(a, "tanky") >= 3 and _a(a, "cc") >= 2 and _is(b, "Sát thủ"):
        s += 2
        why.append(f"Thân trâu + khống chế, đỡ trọn combo dồn của {b['name']} rồi phản đòn.")
    # Lối chơi: đội mạnh sớm bóp nghẹt tướng mạnh muộn trước khi kịp lên đồ
    if _spike(a) == 0 and _a(a, "engage") >= 2 and _spike(b) == 2:
        s += 1
        why.append(f"Mạnh sớm + chủ động mở giao tranh, snowball trước khi {b['name']} kịp lên sức mạnh cuối trận.")
    return s, why


# -------------------------------------------------- KHẮC CHẾ CÙNG ĐƯỜNG -------
# (đối đầu 1-1 giai đoạn đi đường — hai tướng CÙNG lane)
def _counter_lane(a: dict, b: dict) -> tuple[int, list[str]]:
    s, why = 0, []
    if _a(a, "range") - _a(b, "range") >= 1:
        s += 2
        why.append(f"Tầm tay dài hơn, cấu rỉa {b['name']} ngay từ giai đoạn đi đường.")
    if _a(a, "sustain") >= 2 and _a(a, "sustain") > _a(b, "sustain"):
        s += 1
        why.append(f"Hồi phục tốt hơn, đôi công đường dài trội hơn {b['name']}.")
    if _a(a, "burst") >= 3 and _a(b, "tanky") <= 1 and _a(a, "mobility") >= _a(b, "mobility"):
        s += 2
        why.append(f"Bùng nổ cao, dồn hạ {b['name']} mỗi khi {b['name']} bước vào tầm.")
    if _a(a, "tanky") >= 2 and _a(a, "tanky") > _a(b, "tanky") and _a(a, "dps") >= 2:
        s += 1
        why.append(f"Trâu hơn hẳn, ép {b['name']} không dám all-in.")
    return s, why


def counters(hero: dict, roster: list[dict], top: int = 3) -> dict:
    """Trả về khắc chế cùng đường & khác đường, mỗi bên có beats/beaten."""
    lane_beats, lane_beaten, tf_beats, tf_beaten = [], [], [], []
    for o in roster:
        if o["id"] == hero["id"]:
            continue
        same_lane = o.get("lane") == hero.get("lane")
        scorer = _counter_lane if same_lane else _counter_teamfight
        s, why = scorer(hero, o)
        s2, why2 = scorer(o, hero)
        entry = lambda x, sc, w: {"id": x["id"], "name": x["name"], "score": sc, "why": w[0]}
        if s > 0:
            (lane_beats if same_lane else tf_beats).append(entry(o, s, why))
        if s2 > 0:
            (lane_beaten if same_lane else tf_beaten).append(entry(o, s2, why2))
    srt = lambda lst: sorted(lst, key=lambda x: -x["score"])[:top]
    return {
        "lane": {"khac_che": srt(lane_beats), "bi_khac_che": srt(lane_beaten)},
        "teamfight": {"khac_che": srt(tf_beats), "bi_khac_che": srt(tf_beaten)},
    }


# --------------------------------------------------------------- PHỐI HỢP ----
def _synergy_score(a: dict, b: dict) -> tuple[int, str]:
    if _a(a, "cc") >= 2 and _a(a, "engage") >= 2 and _a(b, "burst") >= 3 and _a(b, "mobility") >= 2:
        return 3, f"{a['name']} mở giao tranh + khống chế để {b['name']} dồn sát thương bùng nổ dứt điểm."
    if _a(a, "tanky") >= 2 and _a(b, "tanky") <= 1 and (_a(b, "range") >= 2 or _is(b, "Xạ thủ")):
        return 2, f"{a['name']} chắn tuyến đầu cho {b['name']} rảnh tay xả sát thương."
    if (_a(a, "sustain") >= 2 or (_a(a, "cc") >= 2 and _is(a, "Hỗ trợ"))) \
            and _a(b, "tanky") <= 1 and _a(b, "dps") >= 2:
        return 2, f"{a['name']} giữ máu & giải vây cho chủ lực {b['name']}."
    return 0, ""


def _pair_synergy(a: dict, b: dict) -> tuple[int, str]:
    s1, w1 = _synergy_score(a, b)
    s2, w2 = _synergy_score(b, a)
    return (s1, w1) if s1 >= s2 else (s2, w2)


def synergies(hero: dict, roster: list[dict], top: int = 3) -> list[dict]:
    out = []
    for o in roster:
        if o["id"] == hero["id"]:
            continue
        s, w = _pair_synergy(hero, o)
        if s > 0:
            out.append({"id": o["id"], "name": o["name"], "score": s, "why": w})
    out.sort(key=lambda x: -x["score"])
    return out[:top]


# --------------------------------------------------------------- TRANG BỊ ----
_ROLE_ORDER = ["Xạ thủ", "Sát thủ", "Đấu sĩ", "Pháp sư", "Đỡ đòn", "Hỗ trợ"]


def primary_role(hero: dict) -> str:
    return next((r for r in _ROLE_ORDER if _is(hero, r)), hero.get("roles", ["Đấu sĩ"])[0])


def build(hero: dict, items: dict) -> list[dict]:
    cats = items["builds"].get(primary_role(hero), [])
    out = []
    for c in cats:
        meta = items["categories"].get(c, {"label": c, "items": []})
        out.append({"label": meta["label"], "items": meta.get("items", [])})
    return out


# -------------------------------------------------------------------- TIER ----
def tier_of(hero: dict) -> str:
    wr = hero.get("winrate")
    if wr is None:
        return "?"
    if wr >= 52:
        return "S"
    if wr >= 51:
        return "A"
    if wr >= 50:
        return "B"
    if wr >= 48.5:
        return "C"
    return "D"


# ------------------------------------------------------------- ĐỘI HÌNH -------
LANES = ["Rừng", "Rồng", "Trung", "Tà Thần", "Hỗ trợ"]
_THEME_TXT = {
    "Giao tranh tổng": {
        "play": "Đội hình đánh hội đồng: gom quân, để tuyến đầu mở giao tranh bằng khống chế rồi cả đội dồn vào cụm địch. Mạnh nhất khi ép giao tranh 5v5 quanh mục tiêu lớn (Rồng/trụ).",
        "pro": "Sức mạnh giao tranh tổng cực cao, kiểm soát mục tiêu tốt.",
        "con": "Kém trong việc bắt lẻ; nếu bị chia cắt hoặc poke mòn trước giao tranh sẽ đuối."},
    "Poke rỉa máu": {
        "play": "Bào máu địch từ xa trước khi vào giao tranh chính. Chiếm địa hình, đẩy lính tạo sức ép, không giao tranh khi địch còn đầy máu.",
        "pro": "Kiểm soát khoảng cách, ép địch không dám vào; an toàn.",
        "con": "Yếu khi bị lao vào cắt mặt; thiếu trâu tuyến đầu là dễ vỡ."},
    "Lao vào bắt lẻ": {
        "play": "Rình bắt lẻ mục tiêu đi một mình, tạo lợi thế quân số rồi cuốn chiếu. Ưu tiên cơ động cao, chọn thời điểm địch dàn trải.",
        "pro": "Tạo đột biến nhanh, snowball mạnh khi dẫn trước.",
        "con": "Nếu địch đi cụm và có khống chế cứng thì khó ăn; hụt combo là mất nhịp."},
    "Đội hình cân bằng": {
        "play": "Đủ tuyến đầu, sát thương và khống chế — chơi theo tình huống: giao tranh khi có lợi, bắt lẻ khi địch hớ.",
        "pro": "Linh hoạt, ít điểm yếu rõ rệt.",
        "con": "Không có điểm mạnh vượt trội để áp đặt lối chơi."}}


def _lane_options(roster: list[dict]) -> dict:
    opt = {ln: [] for ln in LANES}
    for h in roster:
        if h.get("lane") in opt:
            opt[h["lane"]].append(h)
    return opt


def _theme_of(team: list[dict]) -> str:
    eng = sum(_a(h, "engage") + _a(h, "cc") for h in team)
    rng = sum(_a(h, "range") for h in team) * 1.5
    dive = sum(_a(h, "mobility") + _a(h, "burst") for h in team)
    best = max((eng, "Giao tranh tổng"), (rng, "Poke rỉa máu"), (dive, "Lao vào bắt lẻ"),
               key=lambda x: x[0])
    # nếu không nổi trội hơn hẳn -> cân bằng
    vals = sorted([eng, rng, dive], reverse=True)
    return best[1] if vals[0] - vals[1] >= 3 else "Đội hình cân bằng"


def _team_score(team: list[dict]) -> int:
    s = 0
    for i in range(len(team)):
        for j in range(i + 1, len(team)):
            s += _pair_synergy(team[i], team[j])[0]
    s += 3 if any(_a(h, "tanky") >= 2 for h in team) else -4      # cần tuyến đầu
    s += 1 if any(_a(h, "engage") >= 3 or (_a(h, "cc") >= 2 and _a(h, "engage") >= 2) for h in team) else -2
    s += 1 if any((_a(h, "dps") >= 3 or _a(h, "burst") >= 3) and _a(h, "tanky") <= 1 for h in team) else -2
    s += 1 if any(_a(h, "sustain") >= 2 or _a(h, "cc") >= 2 for h in team) else 0
    return s


def _difficulty(team: list[dict]) -> str:
    hard = sum(1 for h in team if _a(h, "mobility") >= 3 or h.get("spike") == "late")
    return "Khó" if hard >= 3 else "Trung bình" if hard >= 1 else "Dễ"


def team_comps(roster: list[dict], per_theme: int = 2) -> list[dict]:
    """Ghép mọi tổ hợp 1 tướng/đường, chấm điểm phối hợp, lấy đội mạnh nhất theo từng theme."""
    opt = _lane_options(roster)
    if any(not opt[ln] for ln in LANES):
        return []
    buckets: dict[str, list[dict]] = {}
    for combo in product(*[opt[ln] for ln in LANES]):
        team = list(combo)
        score = _team_score(team)
        theme = _theme_of(team)
        comp = {
            "theme": theme, "score": score, "difficulty": _difficulty(team),
            "members": [{"id": h["id"], "name": h["name"], "lane": h["lane"],
                         "role": primary_role(h)} for h in team],
            "carry": max(team, key=lambda h: _a(h, "burst") + _a(h, "dps"))["name"],
            "play": _THEME_TXT[theme]["play"], "pro": _THEME_TXT[theme]["pro"],
            "con": _THEME_TXT[theme]["con"],
        }
        buckets.setdefault(theme, []).append(comp)
    out = []
    for theme, comps in buckets.items():
        comps.sort(key=lambda c: -c["score"])
        out.extend(comps[:per_theme])
    out.sort(key=lambda c: -c["score"])
    return out
