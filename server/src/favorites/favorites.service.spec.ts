import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { vi } from 'vitest';
import { FavoritesService } from './favorites.service.js';
import { Favorite } from './entities/favorite.entity.js';
import { User } from '../users/entities/user.entity.js';
import { Event } from '../events/entities/event.entity.js';

const mockQueryBuilder = {
    leftJoinAndSelect: vi.fn().mockReturnThis(),
    where: vi.fn().mockReturnThis(),
    getMany: vi.fn().mockResolvedValue([]),
};

const mockRepo: any = {
    create: vi.fn(),
    save: vi.fn(),
    findOne: vi.fn(),
    delete: vi.fn(),
    createQueryBuilder: vi.fn(() => mockQueryBuilder),
};

const mockDataSource = {
    transaction: vi.fn((cb) => cb()),
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
                { provide: DataSource, useValue: mockDataSource },
            ],
        }).compile();

        service = module.get<FavoritesService>(FavoritesService);
    });

    afterEach(() => {
        vi.clearAllMocks();
    });

    describe('findUserFavorites', () => {
        it('should return user favorite events', async () => {
            const mockFavorites = [{ id: 1, userId: 42, eventId: 5 }];
            mockQueryBuilder.getMany.mockResolvedValue(mockFavorites);

            const result = await service.findUserFavorites(42);

            expect(result).toEqual(mockFavorites);
            expect(mockRepo.createQueryBuilder).toHaveBeenCalledWith('favorite');
        });
    });
});