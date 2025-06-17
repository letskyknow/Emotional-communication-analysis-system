import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany } from 'typeorm';
import { User } from '../auth/user.entity';
import { EmotionData } from '../emotion/emotion-data.entity';
import { EventKol } from './event-kol.entity';

@Entity('events')
export class Event {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ nullable: true })
  type: string; // 'monitoring', 'campaign', 'crisis', 'research'

  @Column({ nullable: true })
  source: string; // 数据来源

  @Column({ type: 'jsonb', nullable: true })
  data: Record<string, any>; // 原始事件数据

  @Column({ default: 'upcoming' })
  status: string; // upcoming, active, completed

  @Column({ nullable: true })
  sourceId: string; // 外部系统的ID引用

  @Column({ type: 'timestamp' })
  startDate: Date; // 事件开始时间

  @Column({ type: 'timestamp', nullable: true })
  endDate: Date; // 事件结束时间

  @Column({ type: 'float', default: 0 })
  emotionScore: number; // 综合情感分数

  @Column({ default: 'neutral' })
  emotionTrend: string; // positive, negative, neutral

  @Column({ default: 'low' })
  alertLevel: string; // low, medium, high

  @Column({ type: 'int', default: 0 })
  totalPosts: number; // 相关推文总数

  @Column({ type: 'jsonb', nullable: true })
  keywords: string[]; // 监控关键词

  @Column({ type: 'jsonb', nullable: true })
  hashtags: string[]; // 监控标签

  @ManyToOne(() => User, user => user.events, { nullable: true })
  user: User;

  @OneToMany(() => EmotionData, emotionData => emotionData.event)
  emotionData: EmotionData[];

  @OneToMany(() => EventKol, eventKol => eventKol.event)
  eventKols: EventKol[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}