import {
    Column,
    CreateDateColumn,
    Entity,
    ManyToOne,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
  } from 'typeorm';
import { user_clients } from './user_client.entity';
import { table } from './table.entity';
  
  @Entity()
  export class reservation {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ManyToOne(() => user_clients, (userClient) => userClient.reservations)
    userClient: user_clients;
  
    @ManyToOne(() => table, (table) => table.reservations)
    table: table;

    @Column({ type: 'time' })
    reser_time: string;
  
    @Column({ type: 'date' })
    reser_date: string;

    @Column({ default: true })
    reser_status: boolean;

    @CreateDateColumn({ type: 'timestamptz' })
    createdAt: Date;
  
    @UpdateDateColumn({ type: 'timestamptz' })
    updatedAt: Date;
  }
  