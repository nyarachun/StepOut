import { Controller, Get, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AchievementsService } from './achievements.service.js';
import { CurrentUser } from '../auth/decorator/current-user.decorator.js';

type CurrentUserData = { id: number };

@ApiTags('Achievements')
@Controller('achievements')
export class AchievementsController {
  constructor(private readonly achievementsService: AchievementsService) {}

  @Get('me')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user achievements' })
  @ApiResponse({ status: 200, description: 'Achievements retrieved successfully.' })
  getMyAchievements(@CurrentUser() user: CurrentUserData) {
    return this.achievementsService.getUserAchievements(user.id);
  }
}