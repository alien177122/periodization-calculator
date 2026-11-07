#!/usr/bin/env python3
"""Build digest.md + per-topic shortlists (full abstracts) for curation.

Selection: meta/review-query hits (topic-relevant by construction) plus cited-sorted
hits whose TITLE matches topic keywords. Top-10 per topic, deduped by DOI/PMCID/title.
"""
import json
import re
from pathlib import Path

OUT_DIR = Path(__file__).resolve().parent.parent

TOPIC_TITLES = {
    "resistance-training-volume": "Объём силовой тренировки / dose-response (гипертрофия)",
    "proximity-to-failure-rir": "Proximity to failure / RIR (гипертрофия, сила)",
    "training-frequency": "Частота тренировок",
    "periodization": "Периодизация / блочная периодизация",
    "grip-strength-mortality": "Сила хвата и смертность",
    "vo2max-mortality": "VO2max / кардиореспираторная пригодность и смертность",
    "sleep-testosterone-metabolic": "Сон → тестостерон / метаболизм",
    "anabolic-steroids-cardio": "Анаболические стероиды — сердечно-сосудистый риск",
    "autoregulation-rpe": "Автогрегуляция / RPE в силовой",
    "velocity-based-training": "Velocity-based training",
}

TITLE_KEYWORDS = {
    "resistance-training-volume": ["volume", "dose-respons", "sets per", "weekly set"],
    "proximity-to-failure-rir": ["failure", "repetitions in reserve", "proximity"],
    "training-frequency": ["frequency"],
    "periodization": ["periodization", "periodisation", "periodized", "periodised", "block"],
    "grip-strength-mortality": ["grip strength", "handgrip", "hand grip", "grip"],
    "vo2max-mortality": ["cardiorespiratory", "aerobic", "fitness", "vo2", "cardiorespiratory fitness"],
    "sleep-testosterone-metabolic": ["sleep"],
    "anabolic-steroids-cardio": ["anabolic", "androgenic"],
    "autoregulation-rpe": ["perceived exertion", "autoregulat", "rpe", "repetitions in reserve"],
    "velocity-based-training": ["velocity"],
}

HEADERS = ("| # | Работа | Год | Журнал | Цит. | Ссылка |\n|---|--------|-----|--------|------|--------|")


def key(rec: dict):
    return rec.get("doi") or rec.get("pmcid") or rec.get("title", "")


def load_union() -> dict:
    """topic -> {key: (rec, best_mode)}; mode meta wins over cited."""
    best = {}
    for line in (OUT_DIR / "meta-analysis-digest.jsonl").read_text().splitlines():
        rec_json = json.loads(line)
        for r in rec_json["results"]:
            k = key(r)
            cur = best.setdefault(rec_json["topic"], {}).get(k)
            if cur is None or (rec_json["mode"] == "meta" and cur[1] != "meta"):
                best[rec_json["topic"]][k] = (r, rec_json["mode"])
    return best


def select(topic: str, pool: dict) -> list:
    kw = TITLE_KEYWORDS.get(topic, [])
    out = {}
    for k, (r, mode) in pool.items():
        title = r["title"].lower()
        ok = mode == "meta" or any(w in title for w in kw)
        if ok:
            out[k] = r
    return sorted(out.values(), key=lambda r: -int(r["citedBy"] or 0))


def link(rec: dict) -> str:
    if rec.get("doi"):
        return f"[DOI:{rec['doi']}](https://doi.org/{rec['doi']})"
    if rec.get("pmcid"):
        return f"[{rec['pmcid']}](https://europepmc.org/article/{rec['pmcid']})"
    return "—"


def main():
    union = load_union()
    shortlists = {}
    for topic, pool in union.items():
        shortlists[topic] = select(topic, pool)
        Path(OUT_DIR / f"_shortlist_{topic}.json").write_text(
            json.dumps(shortlists[topic][:14], ensure_ascii=False, indent=1))

    lines = ["# Europe PMC digest — мета-анализы и ключевые исследования по темам «Журнал Сплит»",
             "",
             "Источник: Europe PMC REST API, 2015–2026. Фильтры: мета-анализы/систематические обзоры/обзоры"
             " либо высокоцитируемые работы (сортировка по цитированиям, ключевое слово в заголовке).",
             "Сырые данные: `meta-analysis-digest.jsonl`, `raw/`. Точные цифры: `key-numbers.md`.",
             "Скрипты: `scripts/fetch_europepmc.py`, `scripts/supplement.py`, `scripts/build_digest_md.py`.",
             ""]
    for topic in TOPIC_TITLES:
        recs = shortlists.get(topic, [])
        lines += [f"## {TOPIC_TITLES[topic]} (`{topic}`)", "",
                  HEADERS]
        for i, r in enumerate(recs[:10], 1):
            title = r["title"].replace("|", "/")
            lines.append(f"| {i} | {title} | {r['year']} | {r['journal']} | {r['citedBy']} | {link(r)} |")
        lines += ["", f"Найдено уникальных записей по теме: **{len(recs)}**.",
                  "Выжимки «что нашли» — ниже таблицы (по abstract, без домыслов).", ""]
        for i, r in enumerate(recs[:10], 1):
            ab = r.get("abstract") or ""
            found = ab if ab else "abstract отсутствует, смотреть полный текст"
            if ab and len(found) > 450:
                found = found[:447].rstrip() + "…"
            lines += [f"**{i}. {r['title']}** ({r['year']}, {r['journal']}, цит. {r['citedBy']}, {link(r)})",
                      f"   - Что нашли (из abstract): {found}", ""]
        lines += ["---", ""]
    (OUT_DIR / "digest.md").write_text("\n".join(lines))
    print("digest.md + shortlists written")
    for t, r in shortlists.items():
        print(f"  {t}: {len(r)} candidates")


if __name__ == "__main__":
    main()
