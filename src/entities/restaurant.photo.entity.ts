import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { restaurant } from './restaurant.entity';

@Entity()
export class restaurantPhotos {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  photo_name: string;

  @ManyToOne(() => restaurant, (restaurant) => restaurant.photos, {
    onDelete: 'CASCADE',
  })
  restaurant: restaurant;
}
