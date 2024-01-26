import { Module } from '@nestjs/common';
import { ManagersService } from './managers.service';
import { user_restaurant } from 'src/entities';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ManagersController } from './managers.controller';

@Module({
  imports: [TypeOrmModule.forFeature([user_restaurant])],
  exports: [ManagersService],
  providers: [ManagersService],
  controllers: [ManagersController]
})
export class ManagersModule {}
