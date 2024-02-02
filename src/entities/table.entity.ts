import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { restaurant } from './restaurant.entity';
import { reservation } from './reservation.entity';
import { zone_table } from './zone_table.entity';

@Entity()
export class table {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  table_capacity: number;

  @Column()
  table_describe: number;

  @ManyToOne(() => zone_table, (zone_table) => zone_table.tables)
  zone: zone_table;

  @OneToMany(() => reservation, (reservation) => reservation.table)
  reservations: reservation[];

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
