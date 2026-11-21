#!/usr/bin/env python3
"""Second supplemental round: missing meta-analyses (periodization, sleep-metabolic)."""
import json
import time
from pathlib import Path
from fetch_europepmc import build_url, fetch, extract, key, OUT_DIR, RAW_DIR

EXTRA = [
    {"topic": "periodization", "mode": "meta", "q": '(ABSTRACT:"periodized" AND ABSTRACT:"non-periodized" AND ABSTRACT:(strength OR hypertrophy))'},
    {"topic": "periodization", "mode": "meta", "q": '(TITLE:(periodized OR periodization) AND ABSTRACT:(strength OR resistance OR "1RM"))'},
    {"topic": "sleep-testosterone-metabolic", "mode": "meta", "q": '(TITLE:"sleep duration" AND TITLE:(metabolic OR cardiometabolic OR "metabolic syndrome"))'},
    {"topic": "sleep-testosterone-metabolic", "mode": "meta", "q": '(TITLE:"sleep restriction" AND TITLE:(glucose OR insulin OR appetite OR metabolism))'},
]


def main():
    by_topic = {p.stem.replace("_dedup_", ""): p for p in sorted(OUT_DIR.glob("_dedup_*.json"))}
    jsonl = OUT_DIR / "meta-analysis-digest.jsonl"
    added = []
    for spec in EXTRA:
        url = build_url(spec["q"], spec["mode"])
        try:
            data = fetch(url)
        except Exception as e:  # noqa: BLE001
            print(f"[FAIL] {spec['topic']}: {e}")
            continue
        RAW_DIR.joinpath(f"{spec['topic']}__suppl2_{spec['mode']}.json").write_text(
            json.dumps(data, ensure_ascii=False, indent=1))
        recs = [extract(h) for h in (data.get("resultList") or {}).get("result", []) if h.get("title")]
        added.append({"topic": spec["topic"], "query": spec["q"], "mode": spec["mode"],
                      "url": url, "hitCount": data.get("hitCount", 0),
                      "nFetched": len(recs), "results": recs})
        print(f"[OK] {spec['topic']} ({spec['mode']}): hits={data.get('hitCount', 0)} fetched={len(recs)}")
        time.sleep(1.6)

    with open(jsonl, "a") as f:
        for rec in added:
            f.write(json.dumps(rec, ensure_ascii=False) + "\n")

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
