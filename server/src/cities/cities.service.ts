import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { City } from './entities/city.entity.js';
import { CreateCityDto } from './dto/create-city.dto.js';
import { UpdateCityDto } from './dto/update-city.dto.js';

@Injectable()
export class CitiesService {
  constructor(
    @InjectRepository(City)
    private readonly cityRepository: Repository<City>,
  ) {}

  async create(createCityDto: CreateCityDto) {
    const { name } = createCityDto;

    try {
      const existingCity = await this.cityRepository.findOneBy({ name });

      if (existingCity) {
        throw new ConflictException('City with this name already exists');
      }

      const city = this.cityRepository.create({ name });
      return await this.cityRepository.save(city);
    } catch (error) {
      if (error instanceof ConflictException) throw error;
      throw new InternalServerErrorException('Failed to create city');
    }
  }

  async findAll() {
    try {
      return await this.cityRepository.find({
        order: { name: 'ASC' },
      });
    } catch (error) {
      throw new InternalServerErrorException('Failed to fetch cities');
    }
  }

  async findOne(id: number) {
    try {
      const city = await this.cityRepository.findOneBy({ id });

      if (!city) {
        throw new NotFoundException(`City with id ${id} not found`);
      }

      return city;
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException('Failed to fetch city');
    }
  }

  async update(id: number, updateCityDto: UpdateCityDto) {
    const city = await this.findOne(id);
    const { name } = updateCityDto;

    try {
      if (name !== undefined && name !== city.name) {
        const existingCity = await this.cityRepository.findOneBy({ name });

        if (existingCity) {
          throw new ConflictException('City with this name already exists');
        }

        city.name = name;
      }

      return await this.cityRepository.save(city);
    } catch (error) {
      if (error instanceof ConflictException) throw error;
      throw new InternalServerErrorException('Failed to update city');
    }
  }

  async remove(id: number) {
    const city = await this.findOne(id);

    try {
      await this.cityRepository.remove(city);
      return { message: 'City deleted successfully' };
    } catch (error) {
      throw new InternalServerErrorException('Failed to delete city');
    }
  }
}