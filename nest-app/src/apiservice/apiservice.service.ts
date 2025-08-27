import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom, lastValueFrom } from 'rxjs';

@Injectable()
export class ApiserviceService {

  private readonly baseUrl = 'https://apiv2.allsportsapi.com/football/';
  private readonly apiKey =
    '4afbfa2169ee0d24ff8c70040f75aca55bc0974fbe6659b625e134a7ce02b77c';

  constructor(private readonly httpService: HttpService) {}
async getFixtures(from: string, to: string, countryId: number) {

console.log("this site called 0000000000000")


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
        hours -= 0;

        // Apply +15 minutes
  

        event.event_time = `${String(hours).padStart(2, '0')}:${String(
          minutes
        ).padStart(2, '0')}`;
      }
      return event;
    });
  }
console.log(data)
  return data;
  return {
    "success": 1,
    "result": [{
        "event_key": 1637721,
        "event_date": "2025-08-28",
        "event_time": "17:30",
        "event_home_team": "Soliman",
        "home_team_key": 7617,
        "event_away_team": "Stade Tunisien",
        "away_team_key": 7618,
        "event_halftime_result": "0 - 0",
        "event_final_result": "0 - 0",
        "event_ft_result": "0 - 0",
        "event_penalty_result": "",
        "event_status": "Finished",
        "country_name": "Tunisia",
        "league_name": "Ligue 1",
        "league_key": 317,
        "league_round": "Round 3",
        "league_season": "2025\/2026",
        "event_live": "0",
        "event_stadium": "Stade de Soliman (Soliman (Sulayman))",
        "event_referee": "",
        "home_team_logo": "https:\/\/apiv2.allsportsapi.com\/logo\/7617_soliman.jpg",
        "away_team_logo": "https:\/\/apiv2.allsportsapi.com\/logo\/7618_stade-tunisien.jpg",
        "event_country_key": 110,
        "league_logo": null,
        "country_logo": "https:\/\/apiv2.allsportsapi.com\/logo\/logo_country\/110_tunisia.png",
        "event_home_formation": "",
        "event_away_formation": "",
        "fk_stage_key": 1653,
        "stage_name": "Current",
        "league_group": null,
        "goalscorers": []},
        {
        "event_key": 1637717,
        "event_date": "2025-08-26",
        "event_time": "17:30",
        "event_home_team": "Bizertin",
        "home_team_key": 7623,
        "event_away_team": "Sfax",
        "away_team_key": 7614,
        "event_halftime_result": "1 - 0",
        "event_final_result": "1 - 1",
        "event_ft_result": "1 - 1",
        "event_penalty_result": "",
        "event_status": "Finished",
        "country_name": "Tunisia",
        "league_name": "Ligue 1",
        "league_key": 317,
        "league_round": "Round 2",
        "league_season": "2025\/2026",
        "event_live": "0",
        "event_stadium": "Stade du 15 Octobre (Bizerte (Banzart))",
        "event_referee": "Khaled Gouider",
        "home_team_logo": "https:\/\/apiv2.allsportsapi.com\/logo\/7623_bizertin.jpg",
        "away_team_logo": "https:\/\/apiv2.allsportsapi.com\/logo\/7614_cs-sfaxien.jpg",
        "event_country_key": 110},
        {
        "event_key": 1637717,
        "event_date": "2025-08-29",
        "event_time": "17:30",
        "event_home_team": "Bizertin",
        "home_team_key": 7623,
        "event_away_team": "Sfax",
        "away_team_key": 7614,
        "event_halftime_result": "1 - 0",
        "event_final_result": "1 - 1",
        "event_ft_result": "1 - 1",
        "event_penalty_result": "",
        "event_status": "Finished",
        "country_name": "Tunisia",
        "league_name": "Ligue 1",
        "league_key": 317,
        "league_round": "Round 4",
        "league_season": "2025\/2026",
        "event_live": "0",
        "event_stadium": "Stade du 15 Octobre (Bizerte (Banzart))",
        "event_referee": "Khaled Gouider",
        "home_team_logo": "https:\/\/apiv2.allsportsapi.com\/logo\/7623_bizertin.jpg",
        "away_team_logo": "https:\/\/apiv2.allsportsapi.com\/logo\/7614_cs-sfaxien.jpg",
        "event_country_key": 110}

    ]
}
}



// Function to fetch matches from API
async  getMatches(): Promise<any[]> {
  const matches: any[] = [];

  try {
    const response = await fetch('http://flask-api:5000matches');

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
      // Replace with your Flask server URL and endpoint
      const url = `http://flask-api:5000/matches?round=${roundId}`;
      
      // Call the Flask API
      const response = await firstValueFrom(this.httpService.get(url));
      
      // Return the JSON data from Flask
      return response.data;
    } catch (error) {
      throw new Error(
        `Error fetching data from Flask API: ${error.response?.status} - ${error.response?.statusText}`,
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
