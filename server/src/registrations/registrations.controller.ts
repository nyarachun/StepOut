import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../auth/decorator/current-user.decorator.js';
import { CreateRegistrationDto } from './dto/create-registration.dto.js';
import { RegistrationsService } from './registrations.service.js';

type CurrentUserData = { id: number };

@ApiTags('Registrations')
@ApiBearerAuth()
@Controller('registrations')
@UseGuards(AuthGuard('jwt'))
export class RegistrationsController {
  constructor(private readonly registrationsService: RegistrationsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a registration for an event' })
  @ApiResponse({ status: 201, description: 'Registration created successfully.' })
  create(
    @CurrentUser() user: CurrentUserData,
    @Body() createRegistrationDto: CreateRegistrationDto,
  ) {
    return this.registrationsService.create(user.id, createRegistrationDto);
  }

  @Get('my')
  @ApiOperation({ summary: 'Get current user registrations' })
  @ApiResponse({ status: 200, description: 'User registrations retrieved successfully.' })
  findMyRegistrations(@CurrentUser() user: CurrentUserData) {
    return this.registrationsService.findMyRegistrations(user.id);
  }

  @Get('event/:eventId')
  @ApiOperation({ summary: 'Get registration for a specific event' })
  @ApiResponse({ status: 200, description: 'Registration retrieved successfully.' })
  findMyRegistrationForEvent(
    @CurrentUser() user: CurrentUserData,
    @Param('eventId', ParseIntPipe) eventId: number,
  ) {
    return this.registrationsService.findMyRegistrationForEvent(user.id, eventId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Cancel a registration' })
  @ApiResponse({ status: 200, description: 'Registration cancelled successfully.' })
  remove(
    @CurrentUser() user: CurrentUserData,
    @Param('id', ParseIntPipe) registrationId: number,
  ) {
    return this.registrationsService.remove(user.id, registrationId);
  }
}