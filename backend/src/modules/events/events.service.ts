import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindManyOptions, Like, Between, In } from 'typeorm';
import { Event } from './event.entity';
import { EventKol } from './event-kol.entity';
import { Kol } from '../kol/entities/kol.entity';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { CollectionService } from '../collection/collection.service';
import { EmotionService } from '../emotion/emotion.service';

@Injectable()
export class EventsService {
  constructor(
    @InjectRepository(Event)
    private eventRepository: Repository<Event>,
    @InjectRepository(EventKol)
    private eventKolRepository: Repository<EventKol>,
    @InjectRepository(Kol)
    private kolRepository: Repository<Kol>,
    private collectionService: CollectionService,
    private emotionService: EmotionService,
  ) {}

  async create(createEventDto: CreateEventDto): Promise<Event> {
    const { kolIds, ...eventData } = createEventDto;
    
    // Set default values
    const event = this.eventRepository.create({
      ...eventData,
      status: 'upcoming',
      emotionScore: 0,
      emotionTrend: 'neutral',
      alertLevel: 'low',
      totalPosts: 0,
    });
    
    const savedEvent = await this.eventRepository.save(event);
    
    // Associate KOLs if provided
    if (kolIds && kolIds.length > 0) {
      const kols = await this.kolRepository.findBy({ id: In(kolIds) });
      
      for (const kol of kols) {
        const eventKol = this.eventKolRepository.create({
          event: savedEvent,
          kol: kol,
        });
        await this.eventKolRepository.save(eventKol);
      }
    }
    
    // Start monitoring tweets if event is active
    if (new Date(savedEvent.startDate) <= new Date() && 
        (!savedEvent.endDate || new Date(savedEvent.endDate) >= new Date())) {
      await this.updateStatus(savedEvent.id, 'active');
      this.startEventMonitoring(savedEvent.id);
    }
    
    return this.findOne(savedEvent.id);
  }

  async findAll(options?: {
    page?: number;
    limit?: number;
    search?: string;
    type?: string;
    status?: string;
    startDate?: Date;
    endDate?: Date;
  }): Promise<{ data: Event[]; total: number }> {
    const {
      page = 1,
      limit = 10,
      search,
      type,
      status,
      startDate,
      endDate,
    } = options || {};

    const where: any = {};

    if (search) {
      where.name = Like(`%${search}%`);
    }

    if (type) {
      where.type = type;
    }

    if (status) {
      where.status = status;
    }

    if (startDate && endDate) {
      where.eventTime = Between(startDate, endDate);
    }

    const [data, total] = await this.eventRepository.findAndCount({
      where,
      relations: ['user', 'emotionData', 'eventKols', 'eventKols.kol'],
      skip: (page - 1) * limit,
      take: limit,
      order: {
        startDate: 'DESC',
      },
    });

    return { data, total };
  }

  async findOne(id: string): Promise<Event> {
    const event = await this.eventRepository.findOne({
      where: { id },
      relations: ['user', 'emotionData', 'eventKols', 'eventKols.kol'],
    });

    if (!event) {
      throw new NotFoundException(`Event with ID ${id} not found`);
    }

    return event;
  }

  async update(id: string, updateEventDto: UpdateEventDto): Promise<Event> {
    const event = await this.findOne(id);
    
    Object.assign(event, updateEventDto);
    
    return this.eventRepository.save(event);
  }

  async remove(id: string): Promise<void> {
    const result = await this.eventRepository.delete(id);
    
    if (result.affected === 0) {
      throw new NotFoundException(`Event with ID ${id} not found`);
    }
  }

  async findByType(type: string): Promise<Event[]> {
    return this.eventRepository.find({
      where: { type },
      relations: ['emotionData', 'eventKols', 'eventKols.kol'],
      order: {
        startDate: 'DESC',
      },
    });
  }

  async findByStatus(status: string): Promise<Event[]> {
    return this.eventRepository.find({
      where: { status },
      relations: ['emotionData'],
      order: {
        createdAt: 'DESC',
      },
    });
  }

  async updateStatus(id: string, status: string): Promise<Event> {
    await this.eventRepository.update(id, { status });
    
    // Stop monitoring if event is completed
    if (status === 'completed') {
      await this.collectionService.stopEventCollection(id);
    }
    
    return this.findOne(id);
  }

  async getEventStats(): Promise<any> {
    const totalEvents = await this.eventRepository.count();
    
    const statusCounts = await this.eventRepository
      .createQueryBuilder('event')
      .select('event.status', 'status')
      .addSelect('COUNT(*)', 'count')
      .groupBy('event.status')
      .getRawMany();

    const typeCounts = await this.eventRepository
      .createQueryBuilder('event')
      .select('event.type', 'type')
      .addSelect('COUNT(*)', 'count')
      .groupBy('event.type')
      .getRawMany();

    const activeEvents = await this.eventRepository.count({
      where: { status: 'active' },
    });

    const highAlertEvents = await this.eventRepository.count({
      where: { alertLevel: 'high' },
    });

    const totalPosts = await this.eventRepository
      .createQueryBuilder('event')
      .select('SUM(event.totalPosts)', 'total')
      .getRawOne();

    return {
      total: totalEvents,
      active: activeEvents,
      highAlerts: highAlertEvents,
      totalPosts: totalPosts?.total || 0,
      byStatus: statusCounts,
      byType: typeCounts,
    };
  }

  async startEventMonitoring(eventId: string): Promise<void> {
    const event = await this.findOne(eventId);
    
    // Get all KOLs associated with the event
    const kolUsernames = event.eventKols?.map(ek => ek.kol.username) || [];
    
    // Combine keywords and KOL usernames for monitoring
    const searchTerms = [
      ...(event.keywords || []),
      ...(event.hashtags?.map(tag => `#${tag}`) || []),
      ...kolUsernames.map(username => `@${username}`),
    ];
    
    if (searchTerms.length > 0) {
      // Start tweet collection for this event
      // This would integrate with your Twitter collection service
      console.log(`Starting monitoring for event ${event.name} with terms:`, searchTerms);
      
      // Start actual tweet collection
      await this.collectionService.startEventCollection(eventId, searchTerms);
    }
  }

  async updateEventMetrics(eventId: string): Promise<void> {
    const event = await this.findOne(eventId);
    
    // Calculate emotion metrics from associated emotion data
    if (event.emotionData && event.emotionData.length > 0) {
      const totalScore = event.emotionData.reduce((sum, data) => sum + data.overallScore, 0);
      const avgScore = totalScore / event.emotionData.length;
      
      // Determine trend
      let trend = 'neutral';
      if (avgScore > 6) trend = 'positive';
      else if (avgScore < 4) trend = 'negative';
      
      // Determine alert level based on negative sentiment
      let alertLevel = 'low';
      const negativeCount = event.emotionData.filter(data => data.sentiment === 'negative').length;
      const negativeRatio = negativeCount / event.emotionData.length;
      
      if (negativeRatio > 0.5) alertLevel = 'high';
      else if (negativeRatio > 0.3) alertLevel = 'medium';
      
      await this.eventRepository.update(eventId, {
        emotionScore: avgScore,
        emotionTrend: trend,
        alertLevel: alertLevel,
        totalPosts: event.emotionData.length,
      });
    }
  }
}