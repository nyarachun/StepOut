import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { vi } from 'vitest';
import { CitiesService } from './cities.service.js';
import { City } from './entities/city.entity.js';

const mockCityRepository: any = {
  create: vi.fn(),
  save: vi.fn(),
  findOne: vi.fn(),
  find: vi.fn(),
};

describe('CitiesService', () => {
  let service: CitiesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CitiesService,
        {
          provide: getRepositoryToken(City),
          useValue: mockCityRepository,
        },
      ],
    }).compile();

    service = module.get<CitiesService>(CitiesService);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return an array of cities', async () => {
      const mockCities = [{ id: 1, name: 'Lviv' }];
      mockCityRepository.find.mockResolvedValue(mockCities);

      const result = await service.findAll();

      expect(result).toEqual(mockCities);
      expect(mockCityRepository.find).toHaveBeenCalled();
    });
  });
});