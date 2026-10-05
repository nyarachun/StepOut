import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { vi } from 'vitest';
import { EventsService } from './events.service.js';
import { Event } from './entities/event.entity.js';
import { Category } from '../categories/entities/category.entity.js';
import { City } from '../cities/entities/city.entity.js';
import { Registration } from '../registrations/entities/registration.entity.js';
import { User } from '../users/entities/user.entity.js';

const mockRepo: any = {
  create: vi.fn(),
  save: vi.fn(),
  findOne: vi.fn(),
  findOneBy: vi.fn(),
  find: vi.fn(),
  count: vi.fn(),
};

describe('EventsService', () => {
  let service: EventsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EventsService,
        { provide: getRepositoryToken(Event), useValue: mockRepo },
        { provide: getRepositoryToken(User), useValue: mockRepo },
        { provide: getRepositoryToken(Category), useValue: mockRepo },
        { provide: getRepositoryToken(City), useValue: mockRepo },
        { provide: getRepositoryToken(Registration), useValue: mockRepo },
      ],
    }).compile();

    service = module.get<EventsService>(EventsService);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('findOne', () => {
    it('should return an event if it is found', async () => {
      const mockEvent = { id: 1, title: 'Test Event', isPublished: true, capacity: 10 };
      mockRepo.findOne.mockResolvedValue(mockEvent);
      mockRepo.count.mockResolvedValue(5);

      const result = await service.findOne(1);

      expect(result).toEqual({
        ...mockEvent,
        registeredCount: 5,
        availableSpots: 5,
      });
      expect(mockRepo.findOne).toHaveBeenCalledWith({ where: { id: 1 }, relations: expect.any(Object) });
    });

    it('should throw an error if the event is not found', async () => {
      mockRepo.findOne.mockResolvedValue(null);

      await expect(service.findOne(999)).rejects.toThrow();
    });
  });

  describe('create', () => {
    it('should successfully create and save an event', async () => {
      const createDto = { title: 'New Event', description: 'Description' };
      const expectedEvent = { id: 1, ...createDto, organizerId: 42 };
      
      mockRepo.findOneBy.mockResolvedValue({ id: 42, role: 'organizer' });
      mockRepo.create.mockReturnValue(expectedEvent);
      mockRepo.save.mockResolvedValue(expectedEvent);

      const result = await service.create(42, 'organizer', createDto as any);

      expect(result).toEqual(expectedEvent);
      expect(mockRepo.create).toHaveBeenCalled();
      expect(mockRepo.save).toHaveBeenCalledWith(expectedEvent);
    });
  });
});