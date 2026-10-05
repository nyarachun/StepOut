import { Body, Controller, Get, Param, ParseIntPipe, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../auth/decorator/current-user.decorator.js';
import { ChatsService } from './chats.service.js';
import { CreateEventChatDto } from './dto/create-event-chat.dto.js';
import { SendMessageDto } from './dto/send-message.dto.js';

type CurrentUserData = { id: number };

@ApiTags('Chats')
@ApiBearerAuth()
@Controller('chats')
@UseGuards(AuthGuard('jwt'))
export class ChatsController {
  constructor(private readonly chatsService: ChatsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all user chats' })
  @ApiResponse({ status: 200, description: 'User chats retrieved successfully.' })
  getUserChats(@CurrentUser() user: CurrentUserData) {
    return this.chatsService.getUserChats(user.id);
  }

  @Get('unread')
  @ApiOperation({ summary: 'Get total unread messages count' })
  @ApiResponse({ status: 200, description: 'Unread count retrieved successfully.' })
  getUnreadCount(@CurrentUser() user: CurrentUserData) {
    return this.chatsService.getTotalUnreadCount(user.id);
  }

  @Post('events')
  @ApiOperation({ summary: 'Create a chat for an event' })
  @ApiResponse({ status: 201, description: 'Event chat created successfully.' })
  createEventChat(
    @CurrentUser() user: CurrentUserData,
    @Body() createEventChatDto: CreateEventChatDto,
  ) {
    return this.chatsService.createEventChat(user.id, createEventChatDto);
  }

  @Get(':chatId/messages')
  @ApiOperation({ summary: 'Get messages for a specific chat' })
  @ApiResponse({ status: 200, description: 'Messages retrieved successfully.' })
  getMessages(
    @CurrentUser() user: CurrentUserData,
    @Param('chatId', ParseIntPipe) chatId: number,
  ) {
    return this.chatsService.getMessages(user.id, chatId);
  }

  @Post(':chatId/read')
  @ApiOperation({ summary: 'Mark chat as read' })
  @ApiResponse({ status: 201, description: 'Chat marked as read successfully.' })
  markChatAsRead(
    @CurrentUser() user: CurrentUserData,
    @Param('chatId', ParseIntPipe) chatId: number,
  ) {
    return this.chatsService.markChatAsRead(user.id, chatId);
  }

  @Post(':chatId/messages')
  @ApiOperation({ summary: 'Send a message in a chat' })
  @ApiResponse({ status: 201, description: 'Message sent successfully.' })
  sendMessage(
    @CurrentUser() user: CurrentUserData,
    @Param('chatId', ParseIntPipe) chatId: number,
    @Body() sendMessageDto: SendMessageDto,
  ) {
    return this.chatsService.sendMessage(user.id, chatId, sendMessageDto);
  }
}