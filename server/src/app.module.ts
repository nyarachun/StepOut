import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { CategoriesModule } from './categories/categories.module.js';
import { RegistrationsModule } from './registrations/registrations.module.js';
import { FavoritesModule } from './favorites/favorites.module.js';
import { EventsModule } from './events/events.module.js';
import { UsersModule } from './users/users.module.js';
import { CitiesModule } from './cities/cities.module.js';
import { AuthModule } from './auth/auth.module.js';
import { AchievementsModule } from './achievements/achievements.module.js';
import { ChatsModule } from './chats/chats.module.js';
import { AdminModule } from './admin/admin.module.js';
import { RemoveSquadsMigration20260914000000 } from './db/migrations/remove-squads.migration.js';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    TypeOrmModule.forRoot({
      type: 'postgres',
      url: process.env.DATABASE_URL,
      autoLoadEntities: true,
      synchronize: true,
      migrations: [RemoveSquadsMigration20260914000000],
      migrationsRun: true,
    }),

    UsersModule,

    CitiesModule,

    CategoriesModule,

    RegistrationsModule,

    FavoritesModule,

    EventsModule,

    AuthModule,
    AchievementsModule,
    ChatsModule,
    AdminModule,
  ],
})
export class AppModule {}
