import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Event } from './event.entity';
import { EventKol } from './event-kol.entity';
import { EventsService } from './events.service';
import { EventsController } from './events.controller';
import { EventsScheduler } from './events.scheduler';
import { Kol } from '../kol/entities/kol.entity';
import { CollectionModule } from '../collection/collection.module';
import { EmotionModule } from '../emotion/emotion.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Event, EventKol, Kol]),
    CollectionModule,
    EmotionModule,
  ],
  providers: [EventsService, EventsScheduler],
  controllers: [EventsController],
  exports: [EventsService],
})
export class EventsModule {}