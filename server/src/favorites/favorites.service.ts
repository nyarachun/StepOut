import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Favorite } from './entities/favorite.entity.js';
import { User } from '../users/entities/user.entity.js';
import { Event } from '../events/entities/event.entity.js';
import { CreateFavoriteDto } from './dto/create-favorite.dto.js';

@Injectable()
export class FavoritesService {
  constructor(
    @InjectRepository(Favorite)
    private readonly favoriteRepository: Repository<Favorite>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Event)
    private readonly eventRepository: Repository<Event>,
  ) {}

  async create(userId: number, createFavoriteDto: CreateFavoriteDto) {
    const { eventId } = createFavoriteDto;

    const user = await this.userRepository.findOneBy({ id: userId });
    if (!user) {
      throw new NotFoundException(`User with id ${userId} not found`);
    }

    const event = await this.eventRepository.findOneBy({ id: eventId });
    if (!event) {
      throw new NotFoundException(`Event with id ${eventId} not found`);
    }

    try {
      const existingFavorite = await this.favoriteRepository.findOne({
        where: { user: { id: userId }, event: { id: eventId } },
      });

      if (existingFavorite) {
        throw new ConflictException('Event is already in favorites');
      }

      const favorite = this.favoriteRepository.create({ user, event });
      return await this.favoriteRepository.save(favorite);
    } catch (error) {
      if (error instanceof ConflictException) throw error;
      throw new InternalServerErrorException('Failed to add to favorites');
    }
  }

  async findUserFavorites(userId: number) {
    try {
      return await this.favoriteRepository
        .createQueryBuilder('favorite')
        .leftJoinAndSelect('favorite.event', 'event')
        .leftJoinAndSelect('event.city', 'city')
        .leftJoinAndSelect('event.category', 'category')
        .where('favorite.userId = :userId', { userId })
        .getMany();
    } catch (error) {
      throw new InternalServerErrorException('Failed to fetch user favorites');
    }
  }

  async remove(userId: number, eventId: number) {
    try {
      const favorite = await this.favoriteRepository.findOne({
        where: { user: { id: userId }, event: { id: eventId } },
      });

      if (!favorite) {
        throw new NotFoundException('Favorite not found');
      }

      await this.favoriteRepository.remove(favorite);
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException('Failed to remove from favorites');
    }
  }
}