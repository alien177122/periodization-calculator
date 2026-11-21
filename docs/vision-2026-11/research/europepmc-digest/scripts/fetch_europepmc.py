#!/usr/bin/env python3
"""Europe PMC digest pipeline.

Collects machine-readable digests of meta-analyses / key studies for the
"Журнал Сплит" project topics via the Europe PMC REST API (no API key).
Output: raw JSON per query, aggregated meta-analysis-digest.jsonl,
draft digest.md (auto-extracted one-liners, curated afterwards).

Usage: python3 fetch_europepmc.py
"""
import json
import re
import sys
import time
import urllib.parse
import urllib.request
from pathlib import Path

BASE = "https://www.ebi.ac.uk/europepmc/webservices/rest/search"
OUT_DIR = Path(__file__).resolve().parent.parent
RAW_DIR = OUT_DIR / "raw"
RAW_DIR.mkdir(exist_ok=True)

SLEEP = 1.6  # seconds between requests (target: 1-2 s)
PAGE_SIZE = 25
YEAR_FILTER = "AND (PUB_YEAR:[2015 TO 2026])"
META_FILTER = 'AND (PUB_TYPE:"Meta-Analysis" OR PUB_TYPE:"Systematic Review" OR PUB_TYPE:"Review")'

# mode "meta"  -> restrict to meta-analyses / systematic reviews / reviews
# mode "cited" -> no pub-type filter, sort by citation count desc (key studies)
TOPICS = [
    {
        "topic": "resistance-training-volume",
        "queries": [
            {"mode": "meta", "q": '(TITLE:"resistance training" AND TITLE:(volume OR "dose-response"))'},
            {"mode": "meta", "q": '(TITLE:volume AND TITLE:hypertrophy)'},
            {"mode": "cited", "q": '("training volume" AND hypertrophy AND "resistance training")'},
            {"mode": "meta", "q": '(ABSTRACT:"dose-response" AND ABSTRACT:hypertrophy AND ABSTRACT:"resistance training")'},
        ],
    },
    {
        "topic": "proximity-to-failure-rir",
        "queries": [
            {"mode": "meta", "q": '(TITLE:("proximity to failure" OR "repetitions in reserve" OR "training to failure"))'},
            {"mode": "cited", "q": '("proximity to failure" AND (hypertrophy OR strength))'},
            {"mode": "meta", "q": '(ABSTRACT:"repetitions in reserve")'},
            {"mode": "meta", "q": '(TITLE:"momentary muscular failure")'},
        ],
    },
    {
        "topic": "training-frequency",
        "queries": [
            {"mode": "meta", "q": '(TITLE:"training frequency")'},
            {"mode": "cited", "q": '("resistance training frequency" AND (hypertrophy OR strength))'},
            {"mode": "meta", "q": '(TITLE:"resistance training frequency")'},
        ],
    },
    {
        "topic": "periodization",
        "queries": [
            {"mode": "meta", "q": '(TITLE:periodization)'},
            {"mode": "meta", "q": '(TITLE:"block periodization")'},
            {"mode": "cited", "q": '(periodization AND "strength training")'},
        ],
    },
    {
        "topic": "grip-strength-mortality",
        "queries": [
            {"mode": "meta", "q": '(TITLE:"grip strength" AND TITLE:(mortality OR survival))'},
            {"mode": "cited", "q": '("grip strength" AND "all-cause mortality")'},
            {"mode": "meta", "q": '(ABSTRACT:"grip strength" AND ABSTRACT:mortality AND (ABSTRACT:cohort OR ABSTRACT:"systematic review"))'},
        ],
    },
    {
        "topic": "vo2max-mortality",
        "queries": [
            {"mode": "meta", "q": '(TITLE:"cardiorespiratory fitness" AND TITLE:(mortality OR survival))'},
            {"mode": "cited", "q": '("cardiorespiratory fitness" AND "all-cause mortality")'},
            {"mode": "meta", "q": '(TITLE:"aerobic fitness" AND TITLE:(mortality OR "risk of death"))'},
        ],
    },
    {
        "topic": "sleep-testosterone-metabolic",
        "queries": [
            {"mode": "cited", "q": '(sleep AND testosterone AND (restriction OR deprivation OR duration))'},
            {"mode": "meta", "q": '(TITLE:sleep AND ABSTRACT:testosterone)'},
            {"mode": "meta", "q": '(TITLE:("sleep restriction" OR "sleep deprivation") AND TITLE:(metabolic OR glucose OR insulin))'},
        ],
    },
    {
        "topic": "anabolic-steroids-cardio",
        "queries": [
            {"mode": "meta", "q": '(TITLE:("anabolic-androgenic steroids" OR "anabolic steroids") AND TITLE:(cardiovascular OR cardiac OR heart))'},
            {"mode": "cited", "q": '("anabolic-androgenic steroids" AND (cardiovascular OR mortality))'},
            {"mode": "cited", "q": '("anabolic steroids" AND (hypertrophy OR "left ventricular" OR cardiomyopathy))'},
        ],
    },
    {
        "topic": "autoregulation-rpe",
        "queries": [
            {"mode": "meta", "q": '(TITLE:(autoregulation OR "rating of perceived exertion") AND TITLE:(training OR resistance))'},
            {"mode": "cited", "q": '(autoregulation AND "resistance training")'},
            {"mode": "meta", "q": '(ABSTRACT:"rating of perceived exertion" AND ABSTRACT:"resistance training")'},
        ],
    },
    {
        "topic": "velocity-based-training",
        "queries": [
            {"mode": "meta", "q": '(TITLE:("velocity-based training" OR "velocity based training"))'},
            {"mode": "cited", "q": '("velocity-based training" AND (strength OR power))'},
            {"mode": "meta", "q": '(TITLE:"barbell velocity")'},
        ],
    },
]


def build_url(query: str, mode: str) -> str:
    full_q = f"{query}{YEAR_FILTER}"
    if mode == "meta":
        full_q += META_FILTER
    params = {
        "query": full_q,
        "format": "json",
        "pageSize": str(PAGE_SIZE),
        "resultType": "core",
    }
    if mode == "cited":
        params["sort"] = "CITED desc"
    return BASE + "?" + urllib.parse.urlencode(params)


def fetch(url: str) -> dict:
    req = urllib.request.Request(url, headers={"User-Agent": "journal-split-research/1.0"})
    with urllib.request.urlopen(req, timeout=40) as resp:
        return json.loads(resp.read().decode("utf-8"))


def first_sentences(text: str, n: int = 4) -> str:
    if not text:
        return ""
    # split on sentence enders; keep abbreviations like "et al." mostly intact
    parts = re.split(r"(?<=[.!?])\s+(?=[A-Z0-9(])", text.strip())
    out = " ".join(parts[:n])
    if len(parts) > n and not out.endswith((".", "!", "?")):
        out += " …"
    return out


def clean(text: str) -> str:
    return re.sub(r"\s+", " ", re.sub(r"<[^>]+>", " ", text or "")).strip()


def extract(hit: dict) -> dict:
    abs_text = clean(hit.get("abstractText") or "")
    return {
        "title": clean(hit.get("title", "")),
        "authors": hit.get("authorString", "").strip(),
        "year": hit.get("pubYear"),
        "journal": (hit.get("journalInfo") or {}).get("journal", {}).get("title", ""),
        "citedBy": hit.get("citedByCount", 0),
        "pmcid": hit.get("pmcid", ""),
        "doi": hit.get("doi", ""),
        "abstract": first_sentences(abs_text, 4),
        "abstractFull": abs_text,
        "hasFullAbstract": bool(abs_text),
    }


def key(rec: dict) -> tuple:
    return (rec.get("doi") or rec.get("pmcid") or rec.get("title", ""),)


def main():
    digest_records = []
    topic_results = {}  # topic -> {key: rec} for dedupe
    n_req = 0
    for topic in TOPICS:
        topic_results[topic["topic"]] = {}
        for i, spec in enumerate(topic["queries"]):
            url = build_url(spec["q"], spec["mode"])
            n_req += 1
            try:
                data = fetch(url)
            except Exception as e:  # noqa: BLE001
                print(f"[FAIL] {topic['topic']} #{i}: {e}", file=sys.stderr)
                data = {}
            raw_path = RAW_DIR / f"{topic['topic']}__q{i}_{spec['mode']}.json"
            raw_path.write_text(json.dumps(data, ensure_ascii=False, indent=1))
            hits = (data.get("resultList") or {}).get("result", [])
            recs = [extract(h) for h in hits if h.get("title")]
            for r in recs:
                k = key(r)
                if k not in topic_results[topic["topic"]]:
                    topic_results[topic["topic"]][k] = r
            digest_records.append({
                "topic": topic["topic"],
                "query": spec["q"],
                "mode": spec["mode"],
                "url": url,
                "hitCount": data.get("hitCount", 0),
                "nFetched": len(recs),
                "results": recs,
            })
            print(f"[OK] {topic['topic']} #{i} ({spec['mode']}): hitCount={data.get('hitCount', 0)}, fetched={len(recs)}")
            time.sleep(SLEEP)

    # aggregated jsonl: one record per query
    with open(OUT_DIR / "meta-analysis-digest.jsonl", "w") as f:
        for rec in digest_records:
            f.write(json.dumps(rec, ensure_ascii=False) + "\n")

    # per-topic deduped sorted lists for digest.md drafting
    for topic in topic_results:
        recs = sorted(topic_results[topic].values(), key=lambda r: -int(r["citedBy"] or 0))
        path = OUT_DIR / f"_dedup_{topic}.json"
        path.write_text(json.dumps(recs, ensure_ascii=False, indent=1))
        print(f"[DEDUP] {topic}: {len(recs)} unique")
    print(f"Done. Requests: {n_req}, jsonl records: {len(digest_records)}")


if __name__ == "__main__":
    main()
