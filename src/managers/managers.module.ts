import { Module } from '@nestjs/common';
import { ManagersService } from './managers.service';
import { user_restaurant } from 'src/entities';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([user_restaurant])],
  exports: [ManagersService],
  providers: [ManagersService]
})
export class ManagersModule {}
