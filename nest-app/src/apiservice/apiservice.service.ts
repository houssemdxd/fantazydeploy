import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom, lastValueFrom } from 'rxjs';

@Injectable()
export class ApiserviceService {

  private readonly baseUrl = 'https://apiv2.allsportsapi.com/football/';
  private readonly apiKey =
    '05aa49318dabb34ba97ed48297bd47ef18b588d66e7b4849b6144b4553152c02';

  constructor(private readonly httpService: HttpService) {}
async getFixtures(from: string, to: string, countryId: number) {



    const params = new URLSearchParams();
  params.append('met', 'Fixtures');
  params.append('APIkey', this.apiKey);
  params.append('from', from);
  params.append('to', to);
  params.append('countryId', countryId.toString());

  const response$ = this.httpService.post(this.baseUrl, params);
  const { data } = await firstValueFrom(response$);

  // Adjust event_time by -1 hour and +15 minutes
  if (data?.result && Array.isArray(data.result)) {
    data.result = data.result.map((event: any) => {
      if (event.event_time) {
        let [hours, minutes] = event.event_time.split(':').map(Number);

        // Apply -1 hour
        hours -= 1;

        // Apply +15 minutes
  

       minutes += 0;

      // Handle overflow
      if (minutes >= 60) {
        minutes -= 60;
        hours = (hours + 1) % 24; // wrap around if > 23
      }

      event.event_time = `${String(hours).padStart(2, '0')}:${String(
        minutes
      ).padStart(2, '0')}`;
    }
    return event;
    });
  }
  console.log(data);
    return data;
  /*return {
    "success": 1,
    "result": [{
        "event_key": 1637721,
        "event_date": "2025-09-03",
        "event_time": "14:14",
        "event_home_team": "Zarzis",
        "home_team_key": 7605,
        "event_away_team": "Ben Guerdane",
        "away_team_key": 7613,
        "event_halftime_result": "0 - 0",
        "event_final_result": "0 - 0",
        "event_ft_result": "0 - 0",
        "event_penalty_result": "",
        "event_status": "Finished",
        "country_name": "Tunisia",
        "league_name": "Ligue 1",
        "league_key": 317,
        "league_round": "Round 4",
        "league_season": "2025\/2026",
        "event_live": "0",
        },
        {
        "event_key": 1637721,
        "event_date": "2025-09-03",
        "event_time": "14:20",
        "event_home_team": "etoile",
        "home_team_key": 7612,
        "event_away_team": "Gabes",
        "away_team_key": 7600,
        "event_halftime_result": "0 - 0",
        "event_final_result": "0 - 0",
        "event_ft_result": "0 - 0",
        "event_penalty_result": "",
        "event_status": "Finished",
        "country_name": "Tunisia",
        "league_name": "Ligue 1",
        "league_key": 317,
        "league_round": "Round 4",
        "league_season": "2025\/2026",
        "event_live": "0",
        },{
        "event_key": 1637721,
        "event_date": "2025-09-03",
        "event_time": "15:55",
        "event_home_team": "etoile",
        "home_team_key": 7612,
        "event_away_team": "Gabes",
        "away_team_key": 7600,
        "event_halftime_result": "0 - 0",
        "event_final_result": "0 - 0",
        "event_ft_result": "0 - 0",
        "event_penalty_result": "",
        "event_status": "Finished",
        "country_name": "Tunisia",
        "league_name": "Ligue 1",
        "league_key": 317,
        "league_round": "Round 4",
        "league_season": "2025\/2026",
        "event_live": "0",
        },

    ]
}*/
}



// Function to fetch matches from API
async  getMatches(): Promise<any[]> {
  const matches: any[] = [];

  try {
    const response = await fetch('http://flask-api:5000/matches');

    if (!response.ok) {
      throw new Error(`API request failed with status: ${response.status}`);
    }

    const data = await response.json(); // parse JSON response
    matches.push(...data); // store matches

    console.log(`Fetched ${matches.length} matches from API`);
  } catch (error) {
    console.error('Failed to fetch matches from API:', error);
  }

  return matches; // return even if empty on error
}



async getMatchesByRoundSofa(roundId: number) {
    try {
      console.log("the round id is"+roundId)
      console.log("falsk1")
      // Replace with your Flask server URL and endpoint
      const url = `http://flask-api:5000/matches?round=${roundId}`;
            console.log("falsk2")

      // Call the Flask API
      const response = await firstValueFrom(this.httpService.get(url));
            console.log("falsk3")

      console.log(response)
      // Return the JSON data from Flask
      return response.data;
   } catch (error: any) {
  console.error('Full error object:', error);
  throw new Error(
    `Error fetching data from Flask API: ${error.response?.status ?? 'NO STATUS'} - ${error.response?.statusText ?? 'NO STATUS TEXT'}`
  );
}

  }














  async getLineupsofa(matchId: string) {
    const baseUrl = 'http://flask-api:5000/lineup'; // Flask API URL
    const url = `${baseUrl}/${matchId}`;

    try {
      const response$ = this.httpService.get(url);
      const response = await lastValueFrom(response$);
      return response.data;
    } catch (error) {
      throw new HttpException(
        `Failed to fetch lineup: ${error.message}`,
        HttpStatus.BAD_GATEWAY,
      );
    }
  }




  async getLiveUpdatefromsofa(matchId: string, homeCode: string, awayCode: string) {
    try {
      const url = 'http://flask-api:5000/events';
      const response = await firstValueFrom(
        this.httpService.get(url, {
          params: {
            match_id: matchId,
            home_code: homeCode,
            away_code: awayCode,
          },
        }),
      );

      return response.data; // JSON returned by Flask
    } catch (error) {
      throw new Error(
        `❌ Failed to fetch live update: ${error.response?.data || error.message}`,
      );
    }
  }

}
