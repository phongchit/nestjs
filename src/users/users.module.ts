import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { user_clients } from 'src/entities';

@Module({
  imports: [TypeOrmModule.forFeature([user_clients])],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
