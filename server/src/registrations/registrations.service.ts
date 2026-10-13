import {
  ConflictException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';

import { Event } from '../events/entities/event.entity.js';
import { User } from '../users/entities/user.entity.js';
import { CreateRegistrationDto } from './dto/create-registration.dto.js';
import { Registration } from './entities/registration.entity.js';

@Injectable()
export class RegistrationsService {
  constructor(
    @InjectRepository(Registration)
    private readonly registrationRepository: Repository<Registration>,
    @InjectRepository(Event)
    private readonly eventRepository: Repository<Event>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly dataSource: DataSource,
  ) {}

  async create(userId: number, createRegistrationDto: CreateRegistrationDto) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const user = await queryRunner.manager.findOneBy(User, { id: userId });
      if (!user) {
        throw new NotFoundException('User not found');
      }

      const event = await queryRunner.manager.findOne(Event, {
        where: { id: createRegistrationDto.eventId },
        relations: { organizer: true },
        lock: { mode: 'pessimistic_write' },
      });

      if (!event) {
        throw new NotFoundException('Event not found');
      }

      if (event.organizer.id === userId) {
        throw new ForbiddenException('Organizer cannot register for their own event');
      }

      const existingRegistration = await queryRunner.manager.findOne(Registration, {
        where: {
          user: { id: userId },
          event: { id: event.id },
        },
      });

      if (existingRegistration) {
        throw new ConflictException('You are already registered for this event');
      }

      const registeredCount = await queryRunner.manager.count(Registration, {
        where: { event: { id: event.id } },
      });

      if (registeredCount >= event.capacity) {
        throw new ConflictException('This event is full');
      }

      const registration = queryRunner.manager.create(Registration, {
        user,
        event,
      });

      const savedRegistration = await queryRunner.manager.save(Registration, registration);

      await queryRunner.commitTransaction();
      return savedRegistration;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      if (
        error instanceof NotFoundException ||
        error instanceof ForbiddenException ||
        error instanceof ConflictException
      ) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to process registration');
    } finally {
      await queryRunner.release();
    }
  }

  async findMyRegistrations(userId: number) {
    try {
      return await this.registrationRepository.find({
        where: { user: { id: userId } },
        relations: { event: true },
        order: { createdAt: 'DESC' },
      });
    } catch (error) {
      throw new InternalServerErrorException('Failed to fetch registrations');
    }
  }

  async findMyRegistrationForEvent(userId: number, eventId: number) {
    try {
      const registration = await this.registrationRepository.findOne({
        where: {
          user: { id: userId },
          event: { id: eventId },
        },
        relations: { event: true },
      });

      if (!registration) {
        throw new NotFoundException('Registration not found');
      }

      return registration;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to fetch registration');
    }
  }

  async remove(userId: number, registrationId: number) {
    const registration = await this.registrationRepository.findOne({
      where: { id: registrationId },
      relations: { user: true },
    });

    if (!registration) {
      throw new NotFoundException('Registration not found');
    }

    if (registration.user.id !== userId) {
      throw new ForbiddenException('You can only cancel your own registration');
    }

    try {
      await this.registrationRepository.remove(registration);
      return { message: 'Registration cancelled successfully' };
    } catch (error) {
      throw new InternalServerErrorException('Failed to cancel registration');
    }
  }
}