import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from "typeorm"
import { restaurant } from "./restaurant.entity";

@Entity()
export class restaurantPhotos {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    url: string

    @ManyToOne(() => restaurant, (restaurant) => restaurant.photos)
    restaurant: restaurant
}