import json
from pathlib import Path
import engine

def main():
    print("Loading heroes...")
    roster = engine.load_heroes()
    
    print("Generating team compositions...")
    comps = engine.team_comps(roster, per_theme=4)
    
    out_file = Path(__file__).parent / "data" / "comps.json"
    with open(out_file, "w", encoding="utf-8") as f:
        json.dump({"comps": comps}, f, ensure_ascii=False, indent=2)
    
    print(f"Exported {len(comps)} team comps to {out_file}")

if __name__ == "__main__":
    main()
