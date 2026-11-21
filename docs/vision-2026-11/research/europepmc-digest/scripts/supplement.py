#!/usr/bin/env python3
"""Supplemental queries for topics with zero/weak coverage; merges into jsonl + dedup files."""
import json
from pathlib import Path
from fetch_europepmc import build_url, fetch, extract, key, OUT_DIR, RAW_DIR, SLEEP
import time

EXTRA = [
    {"topic": "periodization", "mode": "cited", "q": '("block periodization")'},
    {"topic": "periodization", "mode": "meta", "q": '(ABSTRACT:"block periodization" AND ABSTRACT:strength)'},
    {"topic": "proximity-to-failure-rir", "mode": "meta", "q": '(ABSTRACT:"momentary muscular failure" AND ABSTRACT:(hypertrophy OR strength))'},
    {"topic": "vo2max-mortality", "mode": "meta", "q": '(TITLE:fitness AND TITLE:mortality AND ABSTRACT:(fitness OR "cardiorespiratory"))'},
    {"topic": "grip-strength-mortality", "mode": "meta", "q": '(ABSTRACT:"handgrip strength" AND ABSTRACT:mortality)'},
]


def main():
    jsonl = OUT_DIR / "meta-analysis-digest.jsonl"
    existing = jsonl.read_text().splitlines()
    added = []
    for spec in EXTRA:
        url = build_url(spec["q"], spec["mode"])
        try:
            data = fetch(url)
        except Exception as e:  # noqa: BLE001
            print(f"[FAIL] {spec['topic']}: {e}")
            continue
        RAW_DIR.joinpath(f"{spec['topic']}__suppl_{spec['mode']}.json").write_text(
            json.dumps(data, ensure_ascii=False, indent=1))
        recs = [extract(h) for h in (data.get("resultList") or {}).get("result", []) if h.get("title")]
        added.append({"topic": spec["topic"], "query": spec["q"], "mode": spec["mode"],
                      "url": url, "hitCount": data.get("hitCount", 0),
                      "nFetched": len(recs), "results": recs})
        print(f"[OK] {spec['topic']} ({spec['mode']}): hits={data.get('hitCount', 0)} fetched={len(recs)}")
        time.sleep(SLEEP)

    with open(jsonl, "a") as f:
        for rec in added:
            f.write(json.dumps(rec, ensure_ascii=False) + "\n")

    # merge into dedup files
    dedup_files = sorted(OUT_DIR.glob("_dedup_*.json"))
    by_topic = {}
    for p in dedup_files:
        topic = p.stem.replace("_dedup_", "")
        by_topic[topic] = p
    for rec in added:
        p = by_topic.get(rec["topic"])
        if not p:
            continue
        cur = json.loads(p.read_text())
        seen = {key(r) for r in cur}
        for r in rec["results"]:
            if key(r) not in seen:
                cur.append(r)
        cur.sort(key=lambda r: -int(r["citedBy"] or 0))
        p.write_text(json.dumps(cur, ensure_ascii=False, indent=1))
        print(f"[DEDUP] {rec['topic']}: now {len(cur)} unique")
    print("Done.")


if __name__ == "__main__":
    main()
