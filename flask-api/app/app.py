from flask import Flask, request, jsonify
import subprocess
import json
from datetime import datetime

from lineup import get_lineup_json
from live import HEADERS, fetch_data, simplify_incidents

app = Flask(__name__)

def fetch_matches(round_id):
    url = f"https://www.sofascore.com/api/v1/unique-tournament/984/season/78868/events/round/{round_id}"

    curl_command = [
        "curl",
        url,
        "-H", "accept: */*",
        "-H", "accept-language: en-US,en;q=0.9",
        "-H", "cache-control: no-cache",
        "-H", "pragma: no-cache",
        "-H", "referer: https://www.sofascore.com/tournament/football/tunisia/ligue-1/984",
        "-H", "user-agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36 Edg/139.0.0.0",
    ]

    try:
        result = subprocess.run(curl_command, capture_output=True, text=True, check=True)
        data = json.loads(result.stdout)

        events = data.get("events", [])
        matches = []

        for event in events:
            match_id = str(event.get("id", ""))
            timestamp = event.get("startTimestamp", 0)

            # convert timestamp -> readable date & time
            date = datetime.utcfromtimestamp(timestamp).strftime("%Y-%m-%d")
            event_time = datetime.utcfromtimestamp(timestamp).strftime("%H:%M")

            home_team = event.get("homeTeam", {}).get("name", "Unknown")
            away_team = event.get("awayTeam", {}).get("name", "Unknown")
            home_team_code = event.get("homeTeam", {}).get("id", None)
            away_team_code = event.get("awayTeam", {}).get("id", None)

            matches.append({
                "home_team": home_team,
                "home_team_code": home_team_code,
                "away_team": away_team,
                "away_team_code": away_team_code,
                "match_id": match_id,
                "timestamp": str(timestamp),
                "date": date,
                "eventTime": event_time
            })

        return matches

    except Exception as e:
        return {"error": str(e)}

@app.route("/matches", methods=["GET"])
def get_matches():
    round_id = request.args.get("round", default="4", type=str)
    matches = fetch_matches(round_id)
    return jsonify(matches)


@app.route("/lineup/<match_id>", methods=["GET"])
def lineup_endpoint(match_id):
    """
    Flask endpoint to fetch SofaScore lineups for a match.
    Optional query param: referer_path
    """
    referer_path = request.args.get(
        "referer_path", "/football/match/as-soliman-stade-tunisien/LRysXJjc"
    )

    # Call your existing function
    lineup_data = get_lineup_json(match_id, referer_path)
    
    if lineup_data is None:
        return jsonify({"error": "Failed to fetch lineup data"}), 500

    return jsonify(lineup_data)


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
