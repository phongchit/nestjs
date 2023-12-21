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

@Entity()
export class table {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  table_capacity: number;

  @ManyToOne(() => restaurant, (rest) => rest.tables)
  restaurant: restaurant;

  @OneToMany(() => reservation, (reservation) => reservation.table)
  reservations: reservation[];

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
