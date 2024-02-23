import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { restaurant } from './restaurant.entity';
import { Exclude } from 'class-transformer';

@Entity()
export class restaurantPhotos {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @ManyToOne(() => restaurant, (restaurant) => restaurant.photos, {
    onDelete: 'CASCADE',
  })
  @Exclude()
  restaurant: restaurant;
}
