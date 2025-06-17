import { Injectable, Logger, Inject, forwardRef } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import Redis from 'ioredis';
import { KolService } from '../kol/kol.service';
import { EmotionService } from '../emotion/emotion.service';
import { Kol } from '../kol/entities/kol.entity';
import { CreateEmotionDataDto } from '../emotion/dto/create-emotion-data.dto';

@Injectable()
export class CollectionService {
  private readonly logger = new Logger(CollectionService.name);
  private redis: Redis;

  constructor(
    private readonly httpService: HttpService,
    @Inject(forwardRef(() => KolService))
    private readonly kolService: KolService,
    private readonly emotionService: EmotionService,
  ) {
    this.redis = new Redis({
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT) || 6379,
    });
  }

  /**
   * Trigger data collection for a specific KOL
   */
  async collectKolData(username: string): Promise<void> {
    this.logger.log(`Triggering data collection for KOL: ${username}`);
    
    try {
      // Update active KOLs list in Redis for the scraper
      await this.updateActiveKolsList();
      
      // Trigger scraper via Redis pub/sub
      await this.redis.publish('scrape_kol', JSON.stringify({ username }));
      
      // Fetch latest tweets from MongoDB (via scraper's storage)
      const tweets = await this.fetchKolTweets(username);
      
      if (tweets && tweets.length > 0) {
        // Process tweets for emotion analysis
        await this.processTweetsForEmotionAnalysis(username, tweets);
      }
    } catch (error) {
      this.logger.error(`Error collecting data for KOL ${username}:`, error);
    }
  }

  /**
   * Update active KOLs list in Redis
   */
  async updateActiveKolsList(): Promise<void> {
    try {
      const activeKols = await this.kolService.getActiveKols();
      const kolUsernames = activeKols.map(kol => kol.username);
      
      await this.redis.set('active_kols', JSON.stringify(kolUsernames));
      this.logger.log(`Updated active KOLs list: ${kolUsernames.length} KOLs`);
    } catch (error) {
      this.logger.error('Error updating active KOLs list:', error);
    }
  }

  /**
   * Fetch tweets from MongoDB (populated by scraper)
   */
  async fetchKolTweets(username: string): Promise<any[]> {
    try {
      // In production, this would connect to MongoDB
      // For now, we'll use mock data as a fallback
      const mockTweets = this.generateMockTweets(username);
      return mockTweets;
    } catch (error) {
      this.logger.error(`Error fetching tweets for ${username}:`, error);
      return [];
    }
  }

  /**
   * Process tweets for emotion analysis
   */
  async processTweetsForEmotionAnalysis(username: string, tweets: any[]): Promise<void> {
    try {
      const kol = await this.kolService.findOne(username);
      
      for (const tweet of tweets) {
        // Send tweet to emotion analyzer service
        const emotionData = await this.analyzeEmotions(tweet.content);
        
        if (emotionData) {
          // Create emotion data entry
          const createEmotionDto: CreateEmotionDataDto = {
            sourceId: username,
            sourceType: 'twitter',
            content: tweet.content,
            emotions: emotionData.emotions,
            sentiment: emotionData.sentiment,
            timestamp: new Date(tweet.createdAt),
            // Calculate scores based on sentiment
            positiveScore: emotionData.sentiment === 'positive' ? 0.8 : 0.2,
            negativeScore: emotionData.sentiment === 'negative' ? 0.8 : 0.2,
            neutralScore: emotionData.sentiment === 'neutral' ? 0.8 : 0.2,
            overallScore: emotionData.sentiment === 'positive' ? 0.8 : 
                         emotionData.sentiment === 'negative' ? 0.2 : 0.5,
          };
          
          await this.emotionService.create(createEmotionDto);
        }
      }
      
      // Update KOL's emotion score
      const recentEmotions = await this.emotionService.getRecentBySource(username, 100);
      const avgScore = this.calculateAverageEmotionScore(recentEmotions);
      
      await this.kolService.updateEmotionScore(username, avgScore);
      
      this.logger.log(`Processed ${tweets.length} tweets for ${username}`);
    } catch (error) {
      this.logger.error(`Error processing tweets for emotion analysis:`, error);
    }
  }

  /**
   * Analyze emotions using the emotion analyzer service
   */
  async analyzeEmotions(content: string): Promise<any> {
    try {
      const response = await firstValueFrom(
        this.httpService.post('http://emotion-analyzer:5000/analyze', {
          text: content,
        })
      );
      
      return response.data;
    } catch (error) {
      this.logger.error('Error calling emotion analyzer:', error);
      
      // Fallback to mock data
      return this.generateMockEmotionData();
    }
  }

  /**
   * Calculate average emotion score
   */
  calculateAverageEmotionScore(emotionData: any[]): number {
    if (emotionData.length === 0) return 3;
    
    const totalScore = emotionData.reduce((sum, data) => {
      const score = data.sentiment === 'positive' ? 4 : 
                   data.sentiment === 'negative' ? 2 : 3;
      return sum + score;
    }, 0);
    
    return totalScore / emotionData.length;
  }

  /**
   * Scheduled task to collect data for all active KOLs
   */
  @Cron(CronExpression.EVERY_10_MINUTES)
  async collectAllKolsData(): Promise<void> {
    this.logger.log('Starting scheduled KOL data collection');
    
    try {
      const activeKols = await this.kolService.getActiveKols();
      
      for (const kol of activeKols) {
        await this.collectKolData(kol.username);
        // Add delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
      
      this.logger.log(`Completed data collection for ${activeKols.length} KOLs`);
    } catch (error) {
      this.logger.error('Error in scheduled KOL data collection:', error);
    }
  }

  /**
   * Generate mock tweets for testing
   */
  private generateMockTweets(username: string): any[] {
    const sentiments = ['positive', 'negative', 'neutral'];
    const contents = [
      'Excited about the new AI developments! The future is amazing.',
      'Concerned about market volatility today. Stay cautious.',
      'Just launched our new product. Check it out!',
      'Having a productive day. How is everyone doing?',
      'The innovation in tech never stops. Incredible times!',
    ];
    
    return Array.from({ length: 5 }, (_, i) => ({
      tweetId: `mock_${Date.now()}_${i}`,
      content: contents[i % contents.length],
      createdAt: new Date(Date.now() - i * 3600000),
      authorUsername: username,
      metrics: {
        likes: Math.floor(Math.random() * 1000),
        retweets: Math.floor(Math.random() * 500),
        replies: Math.floor(Math.random() * 100),
      },
    }));
  }

  /**
   * Generate mock emotion data for testing
   */
  private generateMockEmotionData(): any {
    const emotions = {
      joy: Math.random() * 0.5,
      trust: Math.random() * 0.5,
      fear: Math.random() * 0.3,
      surprise: Math.random() * 0.3,
      sadness: Math.random() * 0.3,
      disgust: Math.random() * 0.2,
      anger: Math.random() * 0.2,
      anticipation: Math.random() * 0.4,
    };
    
    const maxEmotion = Object.entries(emotions).reduce((a, b) => 
      emotions[a[0]] > emotions[b[0]] ? a : b
    );
    
    const sentiment = emotions.joy + emotions.trust > 0.6 ? 'positive' :
                     emotions.fear + emotions.sadness + emotions.anger > 0.6 ? 'negative' :
                     'neutral';
    
    return {
      emotions,
      sentiment,
      dominantEmotion: maxEmotion[0],
    };
  }

  /**
   * Start event-based tweet collection
   */
  async startEventCollection(eventId: string, searchTerms: string[]): Promise<void> {
    this.logger.log(`Starting collection for event ${eventId} with terms: ${searchTerms.join(', ')}`);
    
    try {
      // Store event search terms in Redis
      await this.redis.set(`event:${eventId}:terms`, JSON.stringify(searchTerms));
      await this.redis.set(`event:${eventId}:active`, '1');
      
      // Trigger initial collection
      await this.collectEventTweets(eventId, searchTerms);
      
      // Schedule periodic collection
      const intervalId = setInterval(async () => {
        const isActive = await this.redis.get(`event:${eventId}:active`);
        if (isActive === '1') {
          await this.collectEventTweets(eventId, searchTerms);
        } else {
          clearInterval(intervalId);
        }
      }, 300000); // Every 5 minutes
      
    } catch (error) {
      this.logger.error(`Error starting event collection for ${eventId}:`, error);
    }
  }

  /**
   * Stop event-based tweet collection
   */
  async stopEventCollection(eventId: string): Promise<void> {
    await this.redis.set(`event:${eventId}:active`, '0');
    this.logger.log(`Stopped collection for event ${eventId}`);
  }

  /**
   * Collect tweets for an event
   */
  async collectEventTweets(eventId: string, searchTerms: string[]): Promise<void> {
    try {
      // In production, this would search Twitter API
      // For now, generate mock tweets based on search terms
      const tweets = this.generateEventTweets(eventId, searchTerms);
      
      for (const tweet of tweets) {
        const emotionData = await this.analyzeEmotions(tweet.content);
        
        if (emotionData) {
          const createEmotionDto: CreateEmotionDataDto = {
            sourceId: eventId,
            sourceType: 'event',
            content: tweet.content,
            emotions: emotionData.emotions,
            sentiment: emotionData.sentiment,
            timestamp: new Date(tweet.createdAt),
            metadata: {
              eventId,
              authorUsername: tweet.authorUsername,
              metrics: tweet.metrics,
            },
            // Calculate scores based on sentiment
            positiveScore: emotionData.sentiment === 'positive' ? 0.8 : 0.2,
            negativeScore: emotionData.sentiment === 'negative' ? 0.8 : 0.2,
            neutralScore: emotionData.sentiment === 'neutral' ? 0.8 : 0.2,
            overallScore: emotionData.sentiment === 'positive' ? 0.8 : 
                         emotionData.sentiment === 'negative' ? 0.2 : 0.5,
          };
          
          await this.emotionService.create(createEmotionDto);
        }
      }
      
      this.logger.log(`Collected ${tweets.length} tweets for event ${eventId}`);
    } catch (error) {
      this.logger.error(`Error collecting tweets for event ${eventId}:`, error);
    }
  }

  /**
   * Generate mock tweets for events
   */
  private generateEventTweets(eventId: string, searchTerms: string[]): any[] {
    const templates = [
      'Really excited about {term}! This is going to be huge.',
      'Concerned about the impact of {term} on the market.',
      'Just heard about {term}. What are your thoughts?',
      '{term} is trending! Following closely.',
      'The {term} situation is developing rapidly.',
    ];
    
    const tweets = [];
    for (let i = 0; i < 10; i++) {
      const term = searchTerms[i % searchTerms.length];
      const template = templates[i % templates.length];
      const content = template.replace('{term}', term);
      
      tweets.push({
        tweetId: `event_${eventId}_${Date.now()}_${i}`,
        content,
        createdAt: new Date(Date.now() - i * 600000),
        authorUsername: `user_${Math.floor(Math.random() * 1000)}`,
        metrics: {
          likes: Math.floor(Math.random() * 500),
          retweets: Math.floor(Math.random() * 200),
          replies: Math.floor(Math.random() * 50),
        },
      });
    }
    
    return tweets;
  }
}