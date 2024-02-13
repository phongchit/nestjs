import { Module } from '@nestjs/common';
import { TableService } from './table.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { table } from 'src/entities';

@Module({
  imports: [TypeOrmModule.forFeature([table])],
  providers: [TableService],
})
export class TableModule {}
