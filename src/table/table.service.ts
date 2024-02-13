import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { table } from 'src/entities'; // Adjust the import path as per your project structure
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class TableService {
  constructor(
    @InjectRepository(table) private tableRepository: Repository<table>,
  ) {}

  @Cron('59 23 * * * ', {
    timeZone: 'Asia/Bangkok',
  })
  async resetTableStatus(): Promise<void> {
    // Find all tables and reset their status to false
    const tables = await this.tableRepository.find();
    tables.forEach(async (table) => {
      table.table_status = false;
      await this.tableRepository.save(table);
    });
  }
}
