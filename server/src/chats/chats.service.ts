import {
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';

import { EventsService } from '../events/events.service.js';
import { User } from '../users/entities/user.entity.js';

import { ChatGateway } from './chat.gateway.js';
import { CreateEventChatDto } from './dto/create-event-chat.dto.js';
import { SendMessageDto } from './dto/send-message.dto.js';
import { ChatParticipant } from './entities/chat-participant.entity.js';
import {
  Chat,
  ChatType,
} from './entities/chat.entity.js';
import { Message } from './entities/message.entity.js';

@Injectable()
export class ChatsService {
  constructor(
    @InjectRepository(Chat)
    private readonly chatRepository: Repository<Chat>,
    @InjectRepository(ChatParticipant)
    private readonly chatParticipantRepository: Repository<ChatParticipant>,
    @InjectRepository(Message)
    private readonly messageRepository: Repository<Message>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly eventsService: EventsService,
    private readonly chatGateway: ChatGateway,
    private readonly dataSource: DataSource,
  ) {}

  async createEventChat(userId: number, dto: CreateEventChatDto) {
    const event = await this.eventsService.findOne(dto.eventId);
    const organizerId = event.organizer.id;

    if (organizerId === userId) {
      throw new ForbiddenException('You cannot ask yourself a question');
    }

    const existingChats = await this.chatRepository.find({
      where: {
        type: ChatType.EVENT,
        event: { id: event.id },
      },
      relations: {
        participants: { user: true },
      },
    });

    let chat = existingChats.find(
      (currentChat) =>
        currentChat.participants.some(
          (participant) => participant.user.id === userId,
        ) &&
        currentChat.participants.some(
          (participant) => participant.user.id === organizerId,
        ),
    );

    if (chat) {
      return this.chatRepository.findOne({
        where: { id: chat.id },
        relations: {
          event: true,
          participants: { user: true },
        },
      });
    }

    const sender = await this.userRepository.findOneBy({ id: userId });
    if (!sender) {
      throw new NotFoundException('User not found');
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      chat = queryRunner.manager.create(Chat, {
        type: ChatType.EVENT,
        event,
      });
      chat = await queryRunner.manager.save(chat);

      const participants = queryRunner.manager.create(ChatParticipant, [
        {
          chat,
          user: { id: userId } as User,
          lastReadAt: null,
        },
        {
          chat,
          user: { id: organizerId } as User,
          lastReadAt: null,
        },
      ]);
      await queryRunner.manager.save(participants);

      const message = queryRunner.manager.create(Message, {
        chat,
        sender,
        text: dto.message,
        isSystem: false,
      });
      await queryRunner.manager.save(message);

      await queryRunner.commitTransaction();

      return this.chatRepository.findOne({
        where: { id: chat.id },
        relations: {
          event: true,
          participants: { user: true },
        },
      });
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw new InternalServerErrorException('Failed to create chat');
    } finally {
      await queryRunner.release();
    }
  }

  async getUserChats(userId: number) {
    try {
      const participants = await this.chatParticipantRepository.find({
        where: {
          user: { id: userId },
        },
        relations: {
          chat: {
            event: {
              organizer: true,
              category: true,
              city: true,
            },
            participants: {
              user: true,
            },
          },
        },
        order: {
          id: 'DESC',
        },
      });

      return participants.map((participant) => participant.chat);
    } catch (error) {
      throw new InternalServerErrorException('Failed to fetch user chats');
    }
  }

  async getMessages(userId: number, chatId: number) {
    await this.checkParticipant(userId, chatId);

    try {
      return await this.messageRepository.find({
        where: {
          chat: { id: chatId },
        },
        relations: {
          sender: true,
        },
        order: {
          createdAt: 'ASC',
        },
      });
    } catch (error) {
      throw new InternalServerErrorException('Failed to fetch messages');
    }
  }

  async sendMessage(userId: number, chatId: number, dto: SendMessageDto) {
    await this.checkParticipant(userId, chatId);

    const sender = await this.userRepository.findOneBy({ id: userId });
    if (!sender) {
      throw new NotFoundException('User not found');
    }

    const chat = await this.chatRepository.findOneBy({ id: chatId });
    if (!chat) {
      throw new NotFoundException('Chat not found');
    }

    if (chat.type === ChatType.ADMIN) {
      throw new ForbiddenException('You cannot send messages to this chat');
    }

    try {
      const message = this.messageRepository.create({
        chat,
        sender,
        text: dto.text,
        isSystem: false,
      });

      const savedMessage = await this.messageRepository.save(message);

      const participants = await this.chatParticipantRepository.find({
        where: { chat: { id: chatId } },
        relations: { user: true },
      });

      this.chatGateway.notifyChatMessage(chatId, {
        ...savedMessage,
        sender: sender,
      });

      return savedMessage;
    } catch (error) {
      throw new InternalServerErrorException('Failed to send message');
    }
  }

  private async checkParticipant(userId: number, chatId: number) {
    const participant = await this.chatParticipantRepository.findOne({
      where: {
        chat: { id: chatId },
        user: { id: userId },
      },
    });

    if (!participant) {
      throw new ForbiddenException('You are not a participant of this chat');
    }
  }
  
  async getTotalUnreadCount(userId: number) {
      return 0;
  }
  
  async markChatAsRead(userId: number, chatId: number) {
      return { success: true };
  }
}