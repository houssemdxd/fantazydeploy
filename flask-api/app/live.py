from flask import Flask, request, jsonify
import json
import requests
import subprocess

app = Flask(__name__)

TEAM_MAP = {
    7594: "AS Gabès",
    7600: "Gabes",
    7605: "ES Zarzis",
    7611: "Esperance Tunis",
    7612: "Etoile Sahel",
    7613: "Ben Guerdane",
    7614: "CS Sfaxien",
    7616: "Monastir",
    7617: "Soliman",
    7618: "Stade Tunisien",
    7623: "CA Bizertin",
    7621: "Tataouine",
    7622: "Club Africain",
    23839: "JS Omrane",
    9985: "Marsa",
    7620: "Metlaoui",
    7624: "JS Kairouanaise",
    7619: "Olympique Beja"
}

HEADERS = {
    "accept": "*/*",
    "accept-language": "en-US,en;q=0.9",
    "cache-control": "no-cache",
    "pragma": "no-cache",
    "referer": "https://www.sofascore.com",
    "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139 Safari/537.36 Edg/139"
}

def fetch_data(url, headers):
    try:
        r = requests.get(url, headers=headers, timeout=5)
        r.raise_for_status()
        return r.json()
    except Exception as e:
        print(f"[⚠️ Requests failed: {e}] Falling back to curl...")
        curl_cmd = ["curl", "-s", url]
        for k, v in headers.items():
            curl_cmd += ["-H", f"{k}: {v}"]
        result = subprocess.run(curl_cmd, capture_output=True, text=True)
        return json.loads(result.stdout)

def simplify_incidents(data, home_id, away_id):
    halves = {"1": {"events": [], "home_goals": 0, "away_goals": 0},
              "2": {"events": [], "home_goals": 0, "away_goals": 0}}

    for inc in data.get("incidents", []):
        minute = f"{inc.get('time', 0)}'"
        etype = inc.get("incidentType")
        team_side = "home" if inc.get("isHome") else "away"
        half = "1" if inc.get("time", 0) <= 45 else "2"

        # Goal (normal or penalty)
        if etype == "goal":
            player = inc.get("player", {}).get("name")
            pid = inc.get("player", {}).get("id")

            event_type = "Penalty" if inc.get("shotType") == "penalty" else "Goal"

            event = {
                "event_type": event_type,
                "minute": minute,
                "player_name": player,
                "player_id": pid,
                "team": team_side
            }
            halves[half]["events"].append(event)
            halves[half][f"{team_side}_goals"] += 1

            assist = inc.get("assist1")
            if assist:
                halves[half]["events"].append({
                    "event_type": "Assistance",
                    "minute": minute,
                    "player_name": assist.get("name"),
                    "player_id": assist.get("id"),
                    "team": team_side
                })

        # Card
        elif etype == "card":
            player = inc.get("player", {}).get("name")
            pid = inc.get("player", {}).get("id")
            color = inc.get("incidentClass")
            halves[half]["events"].append({
                "event_type": f"{color.capitalize()} Card",
                "minute": minute,
                "player_name": player,
                "player_id": pid,
                "team": team_side
            })

        # Substitution
        elif etype == "substitution":
            pin = inc.get("playerIn", {})
            pout = inc.get("playerOut", {})
            halves[half]["events"].append({
                "event_type": "Substitution - In",
                "minute": minute,
                "player_name": pin.get("name"),
                "player_id": pin.get("id"),
                "team": team_side
            })
            halves[half]["events"].append({
                "event_type": "Substitution - Out",
                "minute": minute,
                "player_name": pout.get("name"),
                "player_id": pout.get("id"),
                "team": team_side
            })

        # Missed penalty
        elif etype == "inGamePenalty" and inc.get("incidentClass") == "missed":
            player = inc.get("player", {}).get("name")
            pid = inc.get("player", {}).get("id")
            halves[half]["events"].append({
                "event_type": "Missed Penalty",
                "minute": minute,
                "player_name": player,
                "player_id": pid,
                "team": team_side
            })

    home_goals = halves["1"]["home_goals"] + halves["2"]["home_goals"]
    away_goals = halves["1"]["away_goals"] + halves["2"]["away_goals"]

    return {
        "halves": [
            {"half_name": "1st Half", **halves["1"]},
            {"half_name": "2nd Half", **halves["2"]}
        ],
        "match_info": {
            "score": f"{home_goals} - {away_goals}",
            "teams": {
                "home_id": home_id,
                "home_name": TEAM_MAP.get(home_id, "Unknown"),
                "home_cleancheat": away_goals == 0,
                "away_id": away_id,
                "away_name": TEAM_MAP.get(away_id, "Unknown"),
                "away_cleancheat": home_goals == 0
            }
        }
    }

@app.route("/events", methods=["GET"])
def get_events():
    match_id = request.args.get("match_id")
    home_code = int(request.args.get("home_code"))
    away_code = int(request.args.get("away_code"))

    url = f"https://www.sofascore.com/api/v1/event/{match_id}/incidents"
    data = fetch_data(url, HEADERS)
    simple = simplify_incidents(data, home_code, away_code)
    return jsonify(simple)

if __name__ == "__main__":
    app.run(debug=True)
