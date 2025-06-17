import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { EventKol } from '../../events/event-kol.entity';

@Entity('kols')
export class Kol {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  username: string;

  @Column({ nullable: true })
  twitterId: string;

  @Column({ type: 'bigint', default: 0 })
  followersCount: number;

  @Column({ type: 'float', default: 0 })
  emotionScore: number;

  @Column({ type: 'float', default: 0 })
  influenceScore: number;

  @Column({ default: true })
  isActive: boolean;

  @Column({ nullable: true })
  category: string;

  @Column({ nullable: true })
  avatar: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  @OneToMany(() => EventKol, eventKol => eventKol.kol)
  eventKols: EventKol[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}