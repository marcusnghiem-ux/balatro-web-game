import re
import json

wiki_file = r"C:\Users\marcu\.gemini\antigravity-ide\brain\43d71f02-2f91-479a-bc6a-e572fa82dcf0\.system_generated\steps\128\content.md"
with open(wiki_file, "r", encoding="utf-8") as f:
    text = f.read()

# Split by <tr>
rows = text.split("<tr>")
jokers = []

for row in rows[1:]:
    tds = row.split("</td>")
    if len(tds) < 5:
        continue
    # td 0: Nr
    nr_clean = re.sub(r'<[^>]+>', '', tds[0]).strip()
    if not nr_clean.isdigit():
        continue
    nr = int(nr_clean)

    # td 1: Name
    name_m = re.findall(r'<a href="/w/[^"]*"[^>]*>([^<]+)</a>', tds[1])
    if not name_m:
        continue
    name = name_m[-1].strip()

    # td 2: Effect
    effect = re.sub(r'<[^>]+>', ' ', tds[2])
    effect = re.sub(r'\s+', ' ', effect).strip()

    # td 3: Cost
    cost_m = re.search(r'\$(\d+)', tds[3])
    cost = int(cost_m.group(1)) if cost_m else 4

    # td 4: Rarity
    rarity_m = re.search(r'rarity\s+(common|uncommon|rare|legendary)', tds[4], re.I)
    rarity = rarity_m.group(1).lower() if rarity_m else 'common'

    jokers.append({
        'nr': nr,
        'name': name,
        'effect': effect,
        'cost': cost,
        'rarity': rarity
    })

print(f"Total Jokers parsed: {len(jokers)}")
out_file = r"c:\Users\marcu\OneDrive\Desktop\python\balatro-web-game\src\game\all_jokers.json"
with open(out_file, "w", encoding="utf-8") as f:
    json.dump(jokers, f, indent=2)
print("Saved to all_jokers.json successfully.")
