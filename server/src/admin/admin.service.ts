import {
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, IsNull, Repository } from 'typeorm';

import { ChatParticipant } from '../chats/entities/chat-participant.entity.js';
import { Chat, ChatType } from '../chats/entities/chat.entity.js';
import { Message } from '../chats/entities/message.entity.js';
import { Event } from '../events/entities/event.entity.js';
import { User, UserRole } from '../users/entities/user.entity.js';

import { BanEventDto } from './dto/ban-event.dto.js';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(Event)
    private readonly eventRepository: Repository<Event>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Chat)
    private readonly chatRepository: Repository<Chat>,
    private readonly dataSource: DataSource,
  ) {}

  async findAllEvents(userRole: UserRole) {
    this.checkAdmin(userRole);

    try {
      return await this.eventRepository.find({
        relations: {
          organizer: true,
          category: true,
          city: true,
        },
        order: {
          createdAt: 'DESC',
        },
      });
    } catch (error) {
      throw new InternalServerErrorException('Failed to fetch events');
    }
  }

  async banEvent(eventId: number, userRole: UserRole, banEventDto: BanEventDto) {
    this.checkAdmin(userRole);

    const event = await this.eventRepository.findOne({
      where: { id: eventId },
      relations: { organizer: true },
    });

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    const organizer = await this.userRepository.findOneBy({ id: event.organizer.id });

    if (!organizer) {
      throw new NotFoundException('Event organizer not found');
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const existingAdminChat = await queryRunner.manager.findOne(Chat, {
        where: {
          type: ChatType.ADMIN,
          event: IsNull(),
          participants: { user: { id: organizer.id } },
        },
        relations: { participants: { user: true } },
      });

      let chat = existingAdminChat;

      if (!chat) {
        chat = queryRunner.manager.create(Chat, {
          type: ChatType.ADMIN,
          event: null,
        });
        chat = await queryRunner.manager.save(Chat, chat);

        const participant = queryRunner.manager.create(ChatParticipant, {
          chat,
          user: organizer,
          lastReadAt: null,
        });
        await queryRunner.manager.save(ChatParticipant, participant);
      }

      const message = queryRunner.manager.create(Message, {
        chat,
        sender: null,
        isSystem: true,
        text: `Your event "${event.title}" was removed by an administrator.\n\nReason: ${banEventDto.reason}`,
      });
      await queryRunner.manager.save(Message, message);

      await queryRunner.manager.remove(Event, event);

      await queryRunner.commitTransaction();

      return { message: 'Event banned and removed successfully' };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw new InternalServerErrorException('Failed to ban event');
    } finally {
      await queryRunner.release();
    }
  }

  private checkAdmin(userRole: UserRole) {
    if (userRole !== UserRole.ADMIN) {
      throw new ForbiddenException('Admin access required');
    }
  }
}