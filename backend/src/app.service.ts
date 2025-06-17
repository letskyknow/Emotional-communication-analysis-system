import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return 'Emotion Analysis System API v1.0';
  }

  getHealth() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      services: {
        database: 'connected',
        redis: 'connected',
        scraper: 'active',
        emotion: 'ready',
      },
    };
  }
}