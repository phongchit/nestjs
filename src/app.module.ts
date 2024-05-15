import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from './users/users.module';
import { UserRestaurantsModule } from './user_restaurants/user_restaurants.module';
import entities from './entities';
import { ScheduleModule } from '@nestjs/schedule';
import { TableModule } from './table/table.module';

@Module({
  imports: [
    AuthModule,
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('POSTGRES_HOST'),
        port: configService.get<number>('DB_PORT'),
        username: configService.get('POSTGRES_USER'),
        password: configService.get('POSTGRES_PASSWORD'),
        database: configService.get('POSTGRES_DATABASE'),
        entities: entities,
        synchronize: true,
        ssl: true,
      }),
      inject: [ConfigService],
    }),
    ScheduleModule.forRoot(),
    UsersModule,
    UserRestaurantsModule,
    TableModule,
    AuthModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
