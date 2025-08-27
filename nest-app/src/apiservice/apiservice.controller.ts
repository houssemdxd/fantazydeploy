import { Controller, Get, Param } from '@nestjs/common';
import { ApiserviceService } from './apiservice.service';

@Controller('apiservice')
export class ApiserviceController {
  constructor(private readonly apiService: ApiserviceService) {}

  // Test endpoint: GET /apiservice/test
  @Get('test')
  async testApi() {

const today = new Date();
const todayStr = today.toISOString().split('T')[0];
const countryId=110
const nextWeek = new Date();
nextWeek.setDate(today.getDate() + 7);
const nextWeekStr = nextWeek.toISOString().split('T')[0];

return await this.apiService.getFixtures(todayStr, nextWeekStr, countryId);

  }




   @Get('round/:roundId')
  async getMatches(@Param('roundId') roundId: string) {
    return this.apiService.getMatchesByRoundSofa(Number(roundId));
  }


  

   @Get('lineup/:matchId')
  async lineup(@Param('matchId') matchId: string) {
    return this.apiService.getLineupsofa(matchId);
  }
}
