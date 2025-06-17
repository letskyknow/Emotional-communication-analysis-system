import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { EmotionData } from './emotion-data.entity';
import { CreateEmotionDataDto } from './dto/create-emotion-data.dto';
import { UpdateEmotionDataDto } from './dto/update-emotion-data.dto';

@Injectable()
export class EmotionService {
  constructor(
    @InjectRepository(EmotionData)
    private emotionDataRepository: Repository<EmotionData>,
  ) {}

  async create(createEmotionDataDto: CreateEmotionDataDto): Promise<EmotionData> {
    const emotionData = this.emotionDataRepository.create({
      ...createEmotionDataDto,
      analyzedAt: new Date(),
    });
    return this.emotionDataRepository.save(emotionData);
  }

  async findAll(options?: {
    page?: number;
    limit?: number;
    sentiment?: string;
    startDate?: Date;
    endDate?: Date;
    eventId?: string;
    kolId?: string;
  }): Promise<{ data: EmotionData[]; total: number }> {
    const {
      page = 1,
      limit = 10,
      sentiment,
      startDate,
      endDate,
      eventId,
      kolId,
    } = options || {};

    const where: any = {};

    if (sentiment) {
      where.sentiment = sentiment;
    }

    if (startDate && endDate) {
      where.analyzedAt = Between(startDate, endDate);
    }

    if (eventId) {
      where.event = { id: eventId };
    }

    if (kolId) {
      where.kol = { id: kolId };
    }

    const [data, total] = await this.emotionDataRepository.findAndCount({
      where,
      relations: ['event', 'kol'],
      skip: (page - 1) * limit,
      take: limit,
      order: {
        analyzedAt: 'DESC',
      },
    });

    return { data, total };
  }

  async findOne(id: string): Promise<EmotionData> {
    const emotionData = await this.emotionDataRepository.findOne({
      where: { id },
      relations: ['event', 'kol'],
    });

    if (!emotionData) {
      throw new NotFoundException(`EmotionData with ID ${id} not found`);
    }

    return emotionData;
  }

  async update(id: string, updateEmotionDataDto: UpdateEmotionDataDto): Promise<EmotionData> {
    const emotionData = await this.findOne(id);
    
    Object.assign(emotionData, updateEmotionDataDto);
    
    return this.emotionDataRepository.save(emotionData);
  }

  async remove(id: string): Promise<void> {
    const result = await this.emotionDataRepository.delete(id);
    
    if (result.affected === 0) {
      throw new NotFoundException(`EmotionData with ID ${id} not found`);
    }
  }

  async analyzeText(text: string): Promise<EmotionData> {
    // This is a placeholder for actual emotion analysis logic
    // In a real implementation, this would call an AI service or ML model
    
    const sentimentScore = Math.random();
    let sentiment: string;
    
    if (sentimentScore > 0.6) {
      sentiment = 'positive';
    } else if (sentimentScore < 0.4) {
      sentiment = 'negative';
    } else {
      sentiment = 'neutral';
    }

    const emotionData: CreateEmotionDataDto = {
      text,
      positiveScore: sentimentScore > 0.5 ? sentimentScore : 0.5 - sentimentScore,
      negativeScore: sentimentScore < 0.5 ? 1 - sentimentScore : sentimentScore - 0.5,
      neutralScore: 1 - Math.abs(sentimentScore - 0.5) * 2,
      overallScore: sentimentScore,
      sentiment,
      emotions: {
        joy: Math.random(),
        anger: Math.random(),
        fear: Math.random(),
        sadness: Math.random(),
        surprise: Math.random(),
        disgust: Math.random(),
        trust: Math.random(),
        anticipation: Math.random(),
      },
      confidence: 0.85 + Math.random() * 0.15,
      language: 'en',
      keywords: this.extractKeywords(text),
    };

    return this.create(emotionData);
  }

  private extractKeywords(text: string): string[] {
    // Simple keyword extraction - in production, use NLP library
    const words = text.toLowerCase().split(/\W+/);
    const stopWords = ['the', 'is', 'at', 'which', 'on', 'a', 'an', 'and', 'or', 'but'];
    
    return words
      .filter(word => word.length > 3 && !stopWords.includes(word))
      .slice(0, 10);
  }

  async getEmotionStats(options?: {
    startDate?: Date;
    endDate?: Date;
    eventId?: string;
    kolId?: string;
  }): Promise<any> {
    const where: any = {};

    if (options?.startDate && options?.endDate) {
      where.analyzedAt = Between(options.startDate, options.endDate);
    }

    if (options?.eventId) {
      where.event = { id: options.eventId };
    }

    if (options?.kolId) {
      where.kol = { id: options.kolId };
    }

    const data = await this.emotionDataRepository.find({ where });

    const sentimentCounts = data.reduce((acc, item) => {
      acc[item.sentiment] = (acc[item.sentiment] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const avgScores = data.reduce(
      (acc, item) => {
        acc.positive += item.positiveScore;
        acc.negative += item.negativeScore;
        acc.neutral += item.neutralScore;
        acc.overall += item.overallScore;
        return acc;
      },
      { positive: 0, negative: 0, neutral: 0, overall: 0 },
    );

    const count = data.length || 1;

    return {
      total: count,
      sentimentDistribution: sentimentCounts,
      averageScores: {
        positive: avgScores.positive / count,
        negative: avgScores.negative / count,
        neutral: avgScores.neutral / count,
        overall: avgScores.overall / count,
      },
    };
  }

  async getEmotionTrends(
    granularity: 'hour' | 'day' | 'week' | 'month' = 'day',
    startDate?: Date,
    endDate?: Date,
    eventId?: string,
    kolId?: string,
  ): Promise<any[]> {
    const query = this.emotionDataRepository
      .createQueryBuilder('emotion')
      .select(`DATE_TRUNC('${granularity}', emotion.analyzedAt)`, 'period')
      .addSelect('AVG(emotion.positiveScore)', 'avgPositive')
      .addSelect('AVG(emotion.negativeScore)', 'avgNegative')
      .addSelect('AVG(emotion.neutralScore)', 'avgNeutral')
      .addSelect('AVG(emotion.overallScore)', 'avgOverall')
      .addSelect('COUNT(*)', 'count')
      .addSelect('AVG((emotion.emotions->\'joy\')::float)', 'avgJoy')
      .addSelect('AVG((emotion.emotions->\'anger\')::float)', 'avgAnger')
      .addSelect('AVG((emotion.emotions->\'fear\')::float)', 'avgFear')
      .addSelect('AVG((emotion.emotions->\'sadness\')::float)', 'avgSadness')
      .addSelect('AVG((emotion.emotions->\'surprise\')::float)', 'avgSurprise')
      .groupBy('period')
      .orderBy('period', 'ASC');

    if (startDate && endDate) {
      query.where('emotion.analyzedAt BETWEEN :startDate AND :endDate', {
        startDate,
        endDate,
      });
    }

    if (eventId) {
      query.andWhere('emotion.eventId = :eventId', { eventId });
    }

    if (kolId) {
      query.andWhere('emotion.kolId = :kolId', { kolId });
    }

    const rawData = await query.getRawMany();
    
    // Format data for frontend charts
    return rawData.map(item => ({
      time: item.period,
      positive: parseFloat(item.avgpositive) || 0,
      negative: parseFloat(item.avgnegative) || 0,
      neutral: parseFloat(item.avgneutral) || 0,
      overall: parseFloat(item.avgoverall) || 0,
      joy: parseFloat(item.avgjoy) || 0,
      anger: parseFloat(item.avganger) || 0,
      fear: parseFloat(item.avgfear) || 0,
      sadness: parseFloat(item.avgsadness) || 0,
      surprise: parseFloat(item.avgsurprise) || 0,
      count: parseInt(item.count) || 0,
    }));
  }

  async getRecentBySource(sourceId: string, limit: number = 100): Promise<EmotionData[]> {
    return this.emotionDataRepository.find({
      where: { sourceId },
      order: { analyzedAt: 'DESC' },
      take: limit,
    });
  }

  async getEmotionHeatmapData(options: {
    startDate?: Date;
    endDate?: Date;
    eventId?: string;
    kolId?: string;
  }): Promise<any> {
    const query = this.emotionDataRepository
      .createQueryBuilder('emotion')
      .select('EXTRACT(HOUR FROM emotion.analyzedAt)', 'hour')
      .addSelect('emotion.sentiment', 'sentiment')
      .addSelect('COUNT(*)', 'count')
      .addSelect('AVG(emotion.overallScore)', 'avgScore')
      .groupBy('hour')
      .addGroupBy('emotion.sentiment')
      .orderBy('hour', 'ASC');

    if (options.startDate && options.endDate) {
      query.where('emotion.analyzedAt BETWEEN :startDate AND :endDate', {
        startDate: options.startDate,
        endDate: options.endDate,
      });
    }

    if (options.eventId) {
      query.andWhere('emotion.eventId = :eventId', { eventId: options.eventId });
    }

    if (options.kolId) {
      query.andWhere('emotion.kolId = :kolId', { kolId: options.kolId });
    }

    const rawData = await query.getRawMany();
    
    // Transform data for heatmap visualization
    const emotions = ['positive', 'negative', 'neutral'];
    const hours = Array.from({ length: 24 }, (_, i) => i);
    
    const heatmapData = [];
    emotions.forEach(emotion => {
      hours.forEach(hour => {
        const dataPoint = rawData.find(
          item => parseInt(item.hour) === hour && item.sentiment === emotion
        );
        heatmapData.push({
          hour,
          emotion: emotion.charAt(0).toUpperCase() + emotion.slice(1),
          value: dataPoint ? parseFloat(dataPoint.avgscore) * 100 : 0,
          count: dataPoint ? parseInt(dataPoint.count) : 0,
        });
      });
    });

    return {
      data: heatmapData,
      summary: {
        totalAnalyzed: rawData.reduce((sum, item) => sum + parseInt(item.count), 0),
        peakHour: this.findPeakHour(rawData),
        dominantSentiment: this.findDominantSentiment(rawData),
      },
    };
  }

  async getKOLInfluenceData(options: {
    startDate?: Date;
    endDate?: Date;
    limit: number;
  }): Promise<any> {
    const query = this.emotionDataRepository
      .createQueryBuilder('emotion')
      .leftJoinAndSelect('emotion.kol', 'kol')
      .select('kol.id', 'kolId')
      .addSelect('kol.name', 'kolName')
      .addSelect('kol.platform', 'platform')
      .addSelect('COUNT(*)', 'postCount')
      .addSelect('AVG(emotion.overallScore)', 'avgSentiment')
      .addSelect('SUM(CASE WHEN emotion.sentiment = \'positive\' THEN 1 ELSE 0 END)', 'positiveCount')
      .addSelect('SUM(CASE WHEN emotion.sentiment = \'negative\' THEN 1 ELSE 0 END)', 'negativeCount')
      .addSelect('AVG(emotion.confidence)', 'avgConfidence')
      .groupBy('kol.id')
      .addGroupBy('kol.name')
      .addGroupBy('kol.platform')
      .orderBy('postCount', 'DESC')
      .limit(options.limit);

    if (options.startDate && options.endDate) {
      query.where('emotion.analyzedAt BETWEEN :startDate AND :endDate', {
        startDate: options.startDate,
        endDate: options.endDate,
      });
    }

    const rawData = await query.getRawMany();
    
    return {
      data: rawData.map(item => ({
        kolId: item.kolid,
        kolName: item.kolname,
        platform: item.platform,
        postCount: parseInt(item.postcount) || 0,
        avgSentiment: parseFloat(item.avgsentiment) || 0,
        positiveCount: parseInt(item.positivecount) || 0,
        negativeCount: parseInt(item.negativecount) || 0,
        avgConfidence: parseFloat(item.avgconfidence) || 0,
        influenceScore: this.calculateInfluenceScore(item),
      })),
    };
  }

  async getEventComparisonData(options: {
    eventIds: string[];
    startDate?: Date;
    endDate?: Date;
  }): Promise<any> {
    const query = this.emotionDataRepository
      .createQueryBuilder('emotion')
      .leftJoinAndSelect('emotion.event', 'event')
      .select('event.id', 'eventId')
      .addSelect('event.name', 'eventName')
      .addSelect('AVG(emotion.positiveScore)', 'avgPositive')
      .addSelect('AVG(emotion.negativeScore)', 'avgNegative')
      .addSelect('AVG(emotion.neutralScore)', 'avgNeutral')
      .addSelect('COUNT(*)', 'totalPosts')
      .addSelect('AVG((emotion.emotions->\'joy\')::float)', 'avgJoy')
      .addSelect('AVG((emotion.emotions->\'anger\')::float)', 'avgAnger')
      .addSelect('AVG((emotion.emotions->\'fear\')::float)', 'avgFear')
      .addSelect('AVG((emotion.emotions->\'sadness\')::float)', 'avgSadness')
      .addSelect('AVG((emotion.emotions->\'surprise\')::float)', 'avgSurprise')
      .groupBy('event.id')
      .addGroupBy('event.name');

    if (options.eventIds && options.eventIds.length > 0) {
      query.where('event.id IN (:...eventIds)', { eventIds: options.eventIds });
    }

    if (options.startDate && options.endDate) {
      query.andWhere('emotion.analyzedAt BETWEEN :startDate AND :endDate', {
        startDate: options.startDate,
        endDate: options.endDate,
      });
    }

    const rawData = await query.getRawMany();
    
    return {
      data: rawData.map(item => ({
        eventId: item.eventid,
        eventName: item.eventname,
        positive: parseFloat(item.avgpositive) || 0,
        negative: parseFloat(item.avgnegative) || 0,
        neutral: parseFloat(item.avgneutral) || 0,
        totalPosts: parseInt(item.totalposts) || 0,
        emotions: {
          joy: parseFloat(item.avgjoy) || 0,
          anger: parseFloat(item.avganger) || 0,
          fear: parseFloat(item.avgfear) || 0,
          sadness: parseFloat(item.avgsadness) || 0,
          surprise: parseFloat(item.avgsurprise) || 0,
        },
      })),
    };
  }

  private findPeakHour(data: any[]): number {
    let maxCount = 0;
    let peakHour = 0;
    
    data.forEach(item => {
      const count = parseInt(item.count);
      if (count > maxCount) {
        maxCount = count;
        peakHour = parseInt(item.hour);
      }
    });
    
    return peakHour;
  }

  private findDominantSentiment(data: any[]): string {
    const sentimentCounts: Record<string, number> = {};
    
    data.forEach(item => {
      const sentiment = item.sentiment;
      const count = parseInt(item.count);
      sentimentCounts[sentiment] = (sentimentCounts[sentiment] || 0) + count;
    });
    
    let maxCount = 0;
    let dominant = 'neutral';
    
    Object.entries(sentimentCounts).forEach(([sentiment, count]) => {
      if (count > maxCount) {
        maxCount = count;
        dominant = sentiment;
      }
    });
    
    return dominant;
  }

  private calculateInfluenceScore(data: any): number {
    const postCount = parseInt(data.postcount) || 0;
    const avgSentiment = parseFloat(data.avgsentiment) || 0;
    const avgConfidence = parseFloat(data.avgconfidence) || 0;
    
    // Simple influence score calculation
    // Could be made more sophisticated with follower counts, engagement rates, etc.
    return (postCount * 0.3 + avgSentiment * 100 * 0.5 + avgConfidence * 100 * 0.2) / 100;
  }
}