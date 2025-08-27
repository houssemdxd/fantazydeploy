import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { FantasyTeamService } from './fantasy-team.service';
import { CreateFantasyTeamDto } from './dto/create-fantasy-team.dto';
import { UpdateFantasyTeamDto } from './dto/update-fantasy-team.dto';
import { Types } from 'mongoose';
import { FixtureService } from 'src/fixture/fixture.service';

@Controller('fantasy-team')
export class FantasyTeamController {
  constructor(private readonly fantasyTeamService: FantasyTeamService,
  ) {}

@Post(':userId/update')
  async updateFantasyTeam(
    @Param('userId') userId: string,
    @Body() body: {
      players: {
        player_id: number;
        isCaptain: boolean;
        isViceCaptain: boolean;
        isBench: boolean;
      }[];
    },
  ) {
    await this.fantasyTeamService.updateFantasyTeam(userId, body.players);
    return { message: 'Fantasy team updated or created successfully.' };
  }


@Get('liveupdates')
  async liveupdates() {
   
    return this.fantasyTeamService.updateLivePlayerStatsFromApi(3);
  }





@Get('weeklyscore/:userId')
  async calculateweekyscores(@Param('userId') userId: string) {
   
    return this.fantasyTeamService.calculateScore(userId);
  }





// GET LIST ROUNDS WITH PLAYERSTATS OF A USER 
@Get('user-scores/:userId')
  async getUserFantasyTeamWithScores(@Param('userId') userId: string) {
    const userObjectId = new Types.ObjectId(userId);
    return this.fantasyTeamService.getPlayerStatsByUser(userId);
  }

@Get('user/:userId')
async getByUserId(@Param('userId') userId: string) {
  return this.fantasyTeamService.getLatestFantasyTeamWithAdversaryInfo(userId);
}

 @Post()
  async saveFantasyTeam(
    @Body()
    body: {
      userId: string;
      players: {
        player_id: number;
        isCaptain: boolean;
        isViceCaptain: boolean;
        isBench: boolean;
      }[];
    },
  ) {
    return this.fantasyTeamService.saveFantasyTeam(body.userId, body.players);
  }

// fixture.controller.ts
@Get('round/:roundId/fixtures-with-stats')
async getFixturesWithStats(@Param('roundId') roundId: string) {
  return this.fantasyTeamService.getFixturesWithPlayerStatsByRound(roundId);
}


  /*@Post()
  create(@Body() createFantasyTeamDto: CreateFantasyTeamDto) {
    return this.fantasyTeamService.create(createFantasyTeamDto);
  }*/

  @Get()
  findAll() {
    return this.fantasyTeamService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.fantasyTeamService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateFantasyTeamDto: UpdateFantasyTeamDto) {
    return this.fantasyTeamService.update(+id, updateFantasyTeamDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.fantasyTeamService.remove(+id);
  }
}
