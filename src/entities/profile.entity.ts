import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { user_clients } from './user_client.entity';

@Entity()
export class profile {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @OneToOne(() => user_clients)
  @JoinColumn()
  user: user_clients;

  @Column({ unique: true })
  first_name: string;

  @Column({ unique: true })
  lastname: string;

  @Column()
  phone_number: string;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
