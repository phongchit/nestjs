import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { reservation } from './reservation.entity';
import { zone_table } from './zone_table.entity';

@Entity()
export class table {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  table_number: string;

  @Column()
  table_capacity: string;

  @Column()
  table_describe: string;

  @Column({ default: false })
  table_status: boolean;

  @ManyToOne(() => zone_table, (zone_table) => zone_table.tables)
  zone: zone_table;

  @OneToMany(() => reservation, (reservation) => reservation.table)
  reservations: reservation[];

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
