import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne } from 'typeorm';
import { Event } from '../events/event.entity';
import { Kol } from '../kol/entities/kol.entity';

@Entity('emotion_data')
export class EmotionData {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'float' })
  positiveScore: number; // 正面情绪分数

  @Column({ type: 'float' })
  negativeScore: number; // 负面情绪分数

  @Column({ type: 'float' })
  neutralScore: number; // 中性情绪分数

  @Column({ type: 'float' })
  overallScore: number; // 综合情绪分数

  @Column()
  sentiment: string; // positive, negative, neutral, mixed

  @Column({ type: 'jsonb', nullable: true })
  emotions: {
    joy?: number;
    anger?: number;
    fear?: number;
    sadness?: number;
    surprise?: number;
    disgust?: number;
    trust?: number;
    anticipation?: number;
  };

  @Column({ type: 'text', nullable: true })
  text: string; // 分析的原始文本

  @Column({ nullable: true })
  language: string; // 语言代码

  @Column({ type: 'float', nullable: true })
  confidence: number; // 置信度

  @Column({ type: 'jsonb', nullable: true })
  keywords: string[]; // 关键词

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>; // 其他元数据

  @Column({ nullable: true })
  sourceId: string; // Source identifier (e.g., KOL username, event ID)

  @Column({ nullable: true })
  sourceType: string; // Type of source (e.g., 'twitter', 'event')

  @ManyToOne(() => Event, event => event.emotionData, { nullable: true })
  event: Event;

  @ManyToOne(() => Kol, { nullable: true })
  kol: Kol;

  @Column({ type: 'timestamp' })
  analyzedAt: Date; // 分析时间

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}