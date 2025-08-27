import subprocess
import json
from bs4 import BeautifulSoup

# Teams with SofaScore ID, MongoDB OID, and correct slug
teams = teams = [
    {"team_sofa_id": 59630, "oid": "6879135f09b81cb547ab8506", "slug": "es-zarzis"},
    {"team_sofa_id": 112647, "oid": "6879135f09b81cb547ab850f", "slug": "es-metlaoui"},
    {"team_sofa_id": 341145, "oid": "6879135f09b81cb547ab8513", "slug": "js-omrane"},
    {"team_sofa_id": 39618, "oid": "6879135f09b81cb547ab8511", "slug": "club-africain"},
    {"team_sofa_id": 59638, "oid": "6879135f09b81cb547ab850b", "slug": "us-monastir"},
    {"team_sofa_id": 59628, "oid": "6879135f09b81cb547ab8507", "slug": "esperance-tunis"},
    {"team_sofa_id": 59636, "oid": "6879135f09b81cb547ab850d", "slug": "stade-tunisien"},
    {"team_sofa_id": 59616, "oid": "6879135f09b81cb547ab8505", "slug": "avenir-sportif-de-gabes"},
    {"team_sofa_id": 148874, "oid": "6879135f09b81cb547ab8509", "slug": "us-ben-guerdane"},
    {"team_sofa_id": 59614, "oid": "6879135f09b81cb547ab8510", "slug": "avenir-sportif-de-la-marsa"},
    {"team_sofa_id": 59632, "oid": "6879135e09b81cb547ab8504", "slug": "js-kairouanaise"},
    {"team_sofa_id": 59618, "oid": "6879135f09b81cb547ab8512", "slug": "ca-bizertin"},
    {"team_sofa_id": 44463, "oid": "6879135f09b81cb547ab850a", "slug": "cs-sfaxien"},
    {"team_sofa_id": 274247, "oid": "6879135f09b81cb547ab850c", "slug": "as-soliman"},
    {"team_sofa_id": 35188, "oid": "6879135f09b81cb547ab8508", "slug": "etoile-sportive-du-sahel"},
    {"team_sofa_id": 59634, "oid": "6879135f09b81cb547ab850e", "slug": "olympique-beja"}
]


def fetch_sofascore_html(url, referer, output_file):
    curl_cmd = [
        "curl", url,
        "-H", "accept: text/html,application/xhtml+xml,application/xml;q=0.9",
        "-H", "accept-language: en-US,en;q=0.9",
        "-H", f"referer: {referer}",
        "-H", "user-agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64)"
    ]

    try:
        result = subprocess.run(curl_cmd, capture_output=True, check=True)
        html = result.stdout
        if not html:
            print(f"❌ No HTML returned for {url}")
        with open(output_file, "wb") as f:
            f.write(html)
        print(f"✅ HTML saved to {output_file} ({len(html)} bytes)")
    except subprocess.CalledProcessError as e:
        print(f"❌ curl failed: {e}")

def extract_players(file_path, team_oid):
    players = []
    with open(file_path, "r", encoding="utf-8") as f:
        html = f.read()

    soup = BeautifulSoup(html, "html.parser")

    # DEBUG: print length and check if "player" word exists
    print(f"📄 {file_path} loaded ({len(html)} chars)")
    if "player" not in html.lower():
        print("⚠️ No 'player' word found in HTML — maybe roster loads via JS?")
    
    content = soup.find_all(["div"], class_=["px_lg", "p_xs", "pt_lg"])
    print(f"🔎 Found {len(content)} matching divs in {file_path}")

    current_position = None
    for i, block in enumerate(content):
        classes = block.get("class", [])
        # print(f"   ▶ Block {i} classes: {classes}")  # optional debug

        if "px_lg" in classes and "pt_lg" in classes:
            span = block.find("span")
            if span:
                current_position = span.text.strip()

        elif "p_xs" in classes:
            a_tag = block.find("a", href=True)
            if a_tag and "/football/player/" in a_tag["href"]:
                parts = a_tag["href"].split("/")
                if len(parts) >= 4:
                    player_id = int(parts[-1])
                    player_name = parts[-2].replace("-", " ").title()
                    players.append({
                        "_id": player_id,
                        "name": player_name,
                        "image": None,
                        "position": (current_position + "s") if current_position else None,
                        "team_id": {"$oid": team_oid},
                        "price": 6.5
                    })
    return players

if __name__ == "__main__":
    all_players = []
    for team in teams:
        sofa_id = team["team_sofa_id"]
        oid = team["oid"]
        slug = team["slug"]

        url = f"https://www.sofascore.com/team/football/{slug}/{sofa_id}"
        referer = "https://www.sofascore.com/tournament/football/tunisia/ligue-1/984"
        file_path = f"players_{sofa_id}.html"

        print(f"\n🔎 Fetching players for team {slug} ({sofa_id})...")
        fetch_sofascore_html(url, referer, file_path)
        players = extract_players(file_path, oid)
        print(f"✅ Found {len(players)} players for team {slug} ({sofa_id})")

        all_players.extend(players)

    with open("players.json", "w", encoding="utf-8") as f:
        json.dump(all_players, f, indent=2, ensure_ascii=False)

    print(f"\n🎉 players.json created with {len(all_players)} players in total")
