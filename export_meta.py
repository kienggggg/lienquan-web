import json
from pathlib import Path
import engine

def main():
    print("Loading heroes...")
    roster = engine.load_heroes()
    
    print("Enriching heroes with role-specific tiers, counters and synergies...")
    enriched_roster = engine.enrich_heroes_with_tiers(roster)
    
    # Add counters and synergies
    for h in enriched_roster:
        h["analysis"] = {
            "counters": engine.counters(h, enriched_roster, top=4),
            "synergies": engine.synergies(h, enriched_roster, top=4)
        }
    
    # Preserve metadata if available
    metadata = {}
    data_file = Path(__file__).parent / "data" / "heroes.json"
    if data_file.exists():
        raw_data = json.loads(data_file.read_text(encoding="utf-8"))
        for k in ["_note", "patch", "source", "scraped_at"]:
            if k in raw_data:
                metadata[k] = raw_data[k]
                
    output_data = metadata
    output_data["heroes"] = enriched_roster
    
    out_file = Path(__file__).parent / "data" / "heroes_meta.json"
    with open(out_file, "w", encoding="utf-8") as f:
        json.dump(output_data, f, ensure_ascii=False, indent=2)
    
    print(f"Exported {len(enriched_roster)} enriched heroes to {out_file}")

if __name__ == "__main__":
    main()
