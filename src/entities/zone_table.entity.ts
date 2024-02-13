import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { restaurant } from './restaurant.entity';
import { table } from './table.entity';

@Entity()
export class zone_table {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  zone_name: string;

  @Column()
  zone_descripe: string;

  @OneToMany(() => table, (table) => table.zone)
  tables: table[];

  @ManyToOne(() => restaurant, (rest) => rest.zones)
  restaurant: restaurant;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
