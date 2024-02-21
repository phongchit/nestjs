import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { user_restaurant } from './user_restaurant.entity';
import { zone_table } from './zone_table.entity';
import { restaurantPhotos } from './restaurant.photo.entity';

@Entity()
export class restaurant {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @OneToMany(() => zone_table, (zone_table) => zone_table.restaurant)
  zones: zone_table[];

  @OneToMany(
    () => user_restaurant,
    (userRestaurant) => userRestaurant.adminRestaurant,
  )
  admins: user_restaurant[];

  @OneToMany(() => restaurantPhotos, (photo) => photo.restaurant ,{ cascade: true ,eager: true })
  photos: restaurantPhotos[]

  @Column()
  rest_name: string;

  @Column()
  rest_description: string;

  @Column()
  rest_phone_number: string;

  @Column({ default: false })
  rest_status: boolean;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
