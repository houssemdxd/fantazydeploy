import subprocess
import json
import sys
import shlex

def get_sofascore_lineups_curl(match_id, referer_path="/football/match/as-soliman-stade-tunisien/LRysXJjc"):
    """
    Fetch lineups using curl subprocess (since curl works but requests doesn't)
    
    Args:
        match_id (str): The match ID (e.g., "14428031")
        referer_path (str): The referer path for the match
    
    Returns:
        dict: JSON response from the API or None if failed
    """
    url = f"https://www.sofascore.com/api/v1/event/{match_id}/lineups"
    referer = f"https://www.sofascore.com{referer_path}"
    
    # Build curl command exactly as your working version
    curl_command = [
        "curl",
        url,
        "-H", "accept: */*",
        "-H", "accept-language: en-US,en;q=0.9",
        "-H", "cache-control: no-cache",
        "-H", "pragma: no-cache",
        "-H", "priority: u=1, i",
        "-H", f"referer: {referer}",
        "-H", 'sec-ch-ua: "Not;A=Brand";v="99", "Microsoft Edge";v="139", "Chromium";v="139"',
        "-H", "sec-ch-ua-mobile: ?0",
        "-H", 'sec-ch-ua-platform: "Windows"',
        "-H", "sec-fetch-dest: empty",
        "-H", "sec-fetch-mode: cors",
        "-H", "sec-fetch-site: same-origin",
        "-H", "user-agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36 Edg/139.0.0.0",
        "-H", "x-requested-with: 50ff8c"
    ]
    
    try:
        print(f"🔄 Fetching lineup data for match ID: {match_id}")
        print(f"📡 URL: {url}")
        print(f"🔗 Referer: {referer}")
        print("-" * 60)
        
        # Execute curl command
        result = subprocess.run(
            curl_command,
            capture_output=True,
            text=True,
            timeout=30,
            check=False  # Don't raise exception on non-zero exit codes
        )
        
        print(f"Exit Code: {result.returncode}")
        
        if result.returncode == 0:
            try:
                # Parse JSON response
                data = json.loads(result.stdout)
                print("✅ Successfully retrieved lineup data!")
                for side in ["home", "away"]:
                    if side in data and "players" in data[side]:
                        data[side]["players"] = [
                            p for p in data[side]["players"] if not p.get("substitute", False)
                        ]
                return data
            except json.JSONDecodeError as e:
                print(f"❌ Failed to parse JSON response: {e}")
                print(f"Raw output: {result.stdout[:500]}...")
                return None
        else:
            print(f"❌ Curl command failed with exit code: {result.returncode}")
            print(f"Error output: {result.stderr}")
            print(f"Standard output: {result.stdout}")
            return None
            
    except subprocess.TimeoutExpired:
        print("❌ Request timed out")
        return None
    except FileNotFoundError:
        print("❌ curl command not found. Please make sure curl is installed and in your PATH.")
        return None
    except Exception as e:
        print(f"❌ Unexpected error: {e}")
        return None

def format_lineup_json(data):
    """
    Convert raw SofaScore data to clean JSON format
    
    Returns:
        dict: Clean JSON with homeTeam and awayTeam arrays containing player info
    """
    if not data:
        return None
    
    def extract_player_info(players_data):
        """Extract clean player information"""
        players = []
        
        for player_data in players_data:
            player_info = player_data.get("player", {})
            statistics = player_data.get("statistics", {})
            market_value = player_info.get("proposedMarketValueRaw", {})
            
            player = {
                "id": player_info.get("id"),
                "name": player_info.get("name"),
                "shortName": player_info.get("shortName"),
                "shirtNumber": player_data.get("shirtNumber"),
                "position": player_data.get("position"),
                "substitute": player_data.get("substitute", True),
                "jerseyNumber": player_data.get("jerseyNumber"),
                "height": player_info.get("height"),
                "dateOfBirth": player_info.get("dateOfBirthTimestamp"),
                "country": {
                    "name": player_info.get("country", {}).get("name"),
                    "alpha2": player_info.get("country", {}).get("alpha2"),
                    "alpha3": player_info.get("country", {}).get("alpha3")
                } if player_info.get("country") else None,
                "marketValue": {
                    "value": market_value.get("value"),
                    "currency": market_value.get("currency")
                } if market_value else None,
                "statistics": {
                    "goals": statistics.get("goals", 0),
                    "assists": statistics.get("goalAssist", 0),
                    "minutesPlayed": statistics.get("minutesPlayed", 0),
                    "ownGoals": statistics.get("ownGoals", 0)
                } if statistics else None
            }
            
            # Remove None values to keep JSON clean
            player = {k: v for k, v in player.items() if v is not None}
            if player.get("country") and not any(player["country"].values()):
                player.pop("country", None)
            if player.get("marketValue") and not any(player["marketValue"].values()):
                player.pop("marketValue", None)
            if player.get("statistics") and not any(player["statistics"].values()):
                player.pop("statistics", None)
            
            players.append(player)
        
        return players
    
    # Build the clean response
    result = {
        "matchId": None,  # Will be set externally
        "confirmed": data.get("confirmed", False),
        "homeTeam": [],
        "awayTeam": []
    }
    
    # Process home team
    if "home" in data:
        home_data = data["home"]
        result["homeTeamId"] = home_data.get("teamId")
        result["homeFormation"] = home_data.get("formation")
        result["homeTeam"] = extract_player_info(home_data.get("players", []))
    
    # Process away team
    if "away" in data:
        away_data = data["away"]
        result["awayTeamId"] = away_data.get("teamId")
        result["awayFormation"] = away_data.get("formation")
        result["awayTeam"] = extract_player_info(away_data.get("players", []))
    
    return result

def print_lineup_summary(data):
    """Print a formatted summary of the lineup data"""
    if not data:
        print("No data to display")
        return
    
    print("\n" + "="*80)
    print("LINEUP SUMMARY")
    print("="*80)
    
    # Check if lineups are confirmed
    confirmed = data.get("confirmed", False)
    print(f"🔍 Lineups Confirmed: {'✅ Yes' if confirmed else '❌ No'}")
    
    # Home team
    if "homeTeam" in data:
        print(f"\n🏠 HOME TEAM (ID: {data.get('homeTeamId', 'N/A')})")
        print(f"Formation: {data.get('homeFormation', 'N/A')}")
        
        starters = [p for p in data["homeTeam"] if not p.get("substitute", False)]
        subs = [p for p in data["homeTeam"] if p.get("substitute", False)]
        
        print(f"\n📋 Starting XI ({len(starters)} players):")
        for i, player in enumerate(starters, 1):
            name = player.get("name", "Unknown")
            number = player.get("shirtNumber", "N/A")
            position = player.get("position", "N/A")
            market_value = player.get("marketValue", {})
            
            print(f"  {i:2d}. #{number:2} {name} ({position}) [ID: {player.get('id')}]")
            if market_value:
                value = market_value.get("value", "N/A")
                currency = market_value.get("currency", "")
                if value != "N/A":
                    print(f"      💰 Market Value: {value:,} {currency}")
        
        if subs:
            print(f"\n🔄 Substitutes ({len(subs)} players):")
            for i, player in enumerate(subs, 1):
                name = player.get("name", "Unknown")
                number = player.get("shirtNumber", "N/A")
                position = player.get("position", "N/A")
                print(f"  {i:2d}. #{number:2} {name} ({position}) [ID: {player.get('id')}]")
    
    # Away team
    if "awayTeam" in data:
        print(f"\n✈️ AWAY TEAM (ID: {data.get('awayTeamId', 'N/A')})")
        print(f"Formation: {data.get('awayFormation', 'N/A')}")
        
        starters = [p for p in data["awayTeam"] if not p.get("substitute", False)]
        subs = [p for p in data["awayTeam"] if p.get("substitute", False)]
        
        print(f"\n📋 Starting XI ({len(starters)} players):")
        for i, player in enumerate(starters, 1):
            name = player.get("name", "Unknown")
            number = player.get("shirtNumber", "N/A")
            position = player.get("position", "N/A")
            market_value = player.get("marketValue", {})
            
            print(f"  {i:2d}. #{number:2} {name} ({position}) [ID: {player.get('id')}]")
            if market_value:
                value = market_value.get("value", "N/A")
                currency = market_value.get("currency", "")
                if value != "N/A":
                    print(f"      💰 Market Value: {value:,} {currency}")
        
        if subs:
            print(f"\n🔄 Substitutes ({len(subs)} players):")
            for i, player in enumerate(subs, 1):
                name = player.get("name", "Unknown")
                number = player.get("shirtNumber", "N/A")
                position = player.get("position", "N/A")
                print(f"  {i:2d}. #{number:2} {name} ({position}) [ID: {player.get('id')}]")

def get_lineup_json(match_id, referer_path="/football/match/as-soliman-stade-tunisien/LRysXJjc"):
    """
    Get lineup data and return clean JSON response only
    
    Args:
        match_id (str): The match ID
        referer_path (str): The referer path for the match
    
    Returns:
        dict: Clean JSON response with homeTeam and awayTeam arrays
    """
    # Fetch raw data
    raw_data = get_sofascore_lineups_curl(match_id, referer_path)
    
    if not raw_data:
        return None
    
    # Format to clean JSON
    clean_data = format_lineup_json(raw_data)
    if clean_data:
        clean_data["matchId"] = match_id
    
    return clean_data

def get_player_stats(data):
    """Extract and display player statistics from formatted data"""
    if not data:
        return
    
    print("\n" + "="*80)
    print("PLAYER STATISTICS")
    print("="*80)
    
    for team_type in ["homeTeam", "awayTeam"]:
        if team_type in data and data[team_type]:
            team_name = "HOME" if team_type == "homeTeam" else "AWAY"
            print(f"\n{team_name} TEAM STATS:")
            
            for player in data[team_type]:
                stats = player.get("statistics", {})
                
                if stats and any(stats.values()):  # Only show if there are stats
                    name = player.get("shortName", player.get("name", "Unknown"))
                    goals = stats.get("goals", 0)
                    assists = stats.get("assists", 0)
                    minutes = stats.get("minutesPlayed", 0)
                    own_goals = stats.get("ownGoals", 0)
                    
                    if any([goals, assists, minutes, own_goals]):
                        print(f"  {name} [ID: {player.get('id')}]:")
                        if minutes > 0:
                            print(f"    ⏱️  Minutes Played: {minutes}")
                        if goals > 0:
                            print(f"    ⚽ Goals: {goals}")
                        if assists > 0:
                            print(f"    🅰️  Assists: {assists}")
                        if own_goals > 0:
                            print(f"    😞 Own Goals: {own_goals}")

# Example usage - Simple JSON response
if __name__ == "__main__":
    match_id = "14428031"
    
    print("🏈 Fetching SofaScore Lineup Data...")
    
    # Get clean JSON response
    lineup_json = get_lineup_json(match_id)
    
    if lineup_json:
        print("✅ Success! Returning JSON response:\n")
        print(json.dumps(lineup_json, indent=2, ensure_ascii=False))
    else:
        print("❌ Failed to retrieve lineup data")
        print("Make sure curl is installed and the match ID is valid.")