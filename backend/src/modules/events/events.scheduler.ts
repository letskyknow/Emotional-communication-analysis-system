import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { EventsService } from './events.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThanOrEqual, MoreThanOrEqual } from 'typeorm';
import { Event } from './event.entity';

@Injectable()
export class EventsScheduler {
  private readonly logger = new Logger(EventsScheduler.name);

  constructor(
    private eventsService: EventsService,
    @InjectRepository(Event)
    private eventRepository: Repository<Event>,
  ) {}

  @Cron(CronExpression.EVERY_5_MINUTES)
  async checkEventStatus() {
    this.logger.debug('Checking event status...');
    
    const now = new Date();
    
    // Find events that should be activated
    const eventsToActivate = await this.eventRepository.find({
      where: {
        status: 'upcoming',
        startDate: LessThanOrEqual(now),
      },
    });
    
    for (const event of eventsToActivate) {
      if (!event.endDate || event.endDate >= now) {
        await this.eventsService.updateStatus(event.id, 'active');
        await this.eventsService.startEventMonitoring(event.id);
        this.logger.log(`Activated event: ${event.name}`);
      }
    }
    
    // Find events that should be completed
    const eventsToComplete = await this.eventRepository.find({
      where: {
        status: 'active',
        endDate: LessThanOrEqual(now),
      },
    });
    
    for (const event of eventsToComplete) {
      await this.eventsService.updateStatus(event.id, 'completed');
      this.logger.log(`Completed event: ${event.name}`);
    }
  }

  @Cron(CronExpression.EVERY_30_MINUTES)
  async updateEventMetrics() {
    this.logger.debug('Updating event metrics...');
    
    const activeEvents = await this.eventRepository.find({
      where: { status: 'active' },
    });
    
    for (const event of activeEvents) {
      try {
        await this.eventsService.updateEventMetrics(event.id);
        this.logger.debug(`Updated metrics for event: ${event.name}`);
      } catch (error) {
        this.logger.error(`Failed to update metrics for event ${event.name}:`, error);
      }
    }
  }
}