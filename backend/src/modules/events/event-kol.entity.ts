import { Entity, PrimaryGeneratedColumn, ManyToOne, CreateDateColumn } from 'typeorm';
import { Event } from './event.entity';
import { Kol } from '../kol/entities/kol.entity';

@Entity('event_kols')
export class EventKol {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Event, event => event.eventKols)
  event: Event;

  @ManyToOne(() => Kol, kol => kol.eventKols)
  kol: Kol;

  @CreateDateColumn()
  createdAt: Date;
}