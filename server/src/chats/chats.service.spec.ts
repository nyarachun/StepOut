import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { vi } from 'vitest';
import { ChatsService } from './chats.service.js';
import { Chat } from './entities/chat.entity.js';
import { ChatParticipant } from './entities/chat-participant.entity.js';
import { Message } from './entities/message.entity.js';
import { User } from '../users/entities/user.entity.js';
import { EventsService } from '../events/events.service.js';
import { ChatGateway } from './chat.gateway.js';

const mockRepo: any = {
  create: vi.fn(),
  save: vi.fn(),
  findOne: vi.fn(),
  find: vi.fn(),
};

const mockEventsService = {
  findOne: vi.fn(),
};

const mockChatGateway = {
  server: { emit: vi.fn() },
  notifyChatMessage: vi.fn(),
  notifyUnreadCount: vi.fn(),
};

describe('ChatsService', () => {
  let service: ChatsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ChatsService,
        { provide: getRepositoryToken(Chat), useValue: mockRepo },
        { provide: getRepositoryToken(ChatParticipant), useValue: mockRepo },
        { provide: getRepositoryToken(Message), useValue: mockRepo },
        { provide: getRepositoryToken(User), useValue: mockRepo },
        { provide: EventsService, useValue: mockEventsService },
        { provide: ChatGateway, useValue: mockChatGateway },
      ],
    }).compile();

    service = module.get<ChatsService>(ChatsService);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('getUserChats', () => {
    it('should return chats for user', async () => {
      const mockChat = { id: 1, eventId: 5 };
      const mockParticipants = [{ id: 1, chat: mockChat }];
      
      mockRepo.find.mockResolvedValue(mockParticipants);

      const result = await service.getUserChats(42);

      expect(result).toEqual([mockChat]);
      expect(mockRepo.find).toHaveBeenCalled();
    });
  });
});