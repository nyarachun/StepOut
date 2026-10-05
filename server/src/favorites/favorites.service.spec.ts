import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { vi } from 'vitest';
import { FavoritesService } from './favorites.service.js';
import { Favorite } from './entities/favorite.entity.js';
import { User } from '../users/entities/user.entity.js';
import { Event } from '../events/entities/event.entity.js';

const mockRepo: any = {
  create: vi.fn(),
  save: vi.fn(),
  findOne: vi.fn(),
  find: vi.fn(),
  delete: vi.fn(),
};

describe('FavoritesService', () => {
  let service: FavoritesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FavoritesService,
        { provide: getRepositoryToken(Favorite), useValue: mockRepo },
        { provide: getRepositoryToken(User), useValue: mockRepo },
        { provide: getRepositoryToken(Event), useValue: mockRepo },
      ],
    }).compile();

    service = module.get<FavoritesService>(FavoritesService);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('findUserFavorites', () => {
    it('should return user favorite events', async () => {
      const mockFavorites = [{ id: 1, userId: 42, eventId: 10 }];
      mockRepo.find.mockResolvedValue(mockFavorites);

      const result = await service.findUserFavorites(42);

      expect(result).toEqual(mockFavorites);
      expect(mockRepo.find).toHaveBeenCalledWith({
        where: { user: { id: 42 } },
        relations: { event: true },
      });
    });
  });
});