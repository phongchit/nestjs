import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { table } from './table.entity';
import { user_restaurant } from './user_restaurant.entity';

@Entity()
export class restaurant {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @OneToMany(() => table, (table) => table.restaurant)
  tables: table[];

  @OneToMany(() => user_restaurant, (userRestaurant) => userRestaurant.managedRestaurant)
  managers: user_restaurant[];

  @Column()
  rest_name: string;

  @Column()
  rest_description: string;

  @Column()
  rest_phone_number: string;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
