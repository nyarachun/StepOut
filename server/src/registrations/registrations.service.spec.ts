import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { vi } from 'vitest';
import { RegistrationsService } from './registrations.service.js';
import { Registration } from './entities/registration.entity.js';
import { User } from '../users/entities/user.entity.js';
import { Event } from '../events/entities/event.entity.js';

const mockRepo: any = {
  create: vi.fn(),
  save: vi.fn(),
  findOne: vi.fn(),
  find: vi.fn(),
  delete: vi.fn(),
};

describe('RegistrationsService', () => {
  let service: RegistrationsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RegistrationsService,
        { provide: getRepositoryToken(Registration), useValue: mockRepo },
        { provide: getRepositoryToken(User), useValue: mockRepo },
        { provide: getRepositoryToken(Event), useValue: mockRepo },
      ],
    }).compile();

    service = module.get<RegistrationsService>(RegistrationsService);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('findMyRegistrations', () => {
    it('should return user registrations', async () => {
      const mockRegs = [{ id: 1, userId: 42, eventId: 10 }];
      mockRepo.find.mockResolvedValue(mockRegs);

      const result = await service.findMyRegistrations(42);

      expect(result).toEqual(mockRegs);
      expect(mockRepo.find).toHaveBeenCalledWith({
        where: { user: { id: 42 } },
        relations: { event: true },
        order: { createdAt: 'DESC' },
      });
    });
  });
});