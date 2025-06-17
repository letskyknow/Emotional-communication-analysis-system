import { Module, forwardRef } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ScheduleModule } from '@nestjs/schedule';
import { CollectionService } from './collection.service';
import { KolModule } from '../kol/kol.module';
import { EmotionModule } from '../emotion/emotion.module';

@Module({
  imports: [
    HttpModule,
    ScheduleModule.forRoot(),
    forwardRef(() => KolModule),
    EmotionModule,
  ],
  providers: [CollectionService],
  exports: [CollectionService],
})
export class CollectionModule {}