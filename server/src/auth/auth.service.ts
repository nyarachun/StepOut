import {
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
  HttpException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

import { CreateUserDto } from '../users/dto/create-user.dto.js';
import { UserRole } from '../users/entities/user.entity.js';
import { UsersService } from '../users/users.service.js';
import { LoginDto } from './dto/login.dto.js';
import { RegisterDto, RegistrationRole } from './dto/register.dto.js';

@Injectable()
export class AuthService {
  // Timing Attacks
  private readonly DUMMY_HASH = '$2b$10$X0.9yN82H/A3J61H7r4Cee3.UuV15tY17tV2sH2Yk8v6.mO7Kz30i';

  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterDto) {
    try {
      const userData: CreateUserDto = {
        email: registerDto.email,
        password: registerDto.password,
        name: registerDto.name,
        role:
          registerDto.role === RegistrationRole.ORGANIZER
            ? UserRole.ORGANIZER
            : UserRole.USER,
      };

      const user = await this.usersService.create(userData);

      return {
        message: 'Registration successful.',
        email: user.email,
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to register user');
    }
  }

  async login(loginDto: LoginDto) {
    try {
      const user = await this.usersService.findByEmail(loginDto.email);

      if (!user) {
        await bcrypt.compare(loginDto.password, this.DUMMY_HASH);
        throw new UnauthorizedException('Invalid email or password');
      }

      const isPasswordCorrect = await bcrypt.compare(
        loginDto.password,
        user.password,
      );

      if (!isPasswordCorrect) {
        throw new UnauthorizedException('Invalid email or password');
      }

      const payload = {
        sub: user.id,
        email: user.email,
        role: user.role,
      };

      return {
        access_token: await this.jwtService.signAsync(payload),
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to process login');
    }
  }
}