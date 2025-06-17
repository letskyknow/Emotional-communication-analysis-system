import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EmotionData } from './emotion-data.entity';
import { EmotionService } from './emotion.service';
import { EmotionController } from './emotion.controller';

@Module({
  imports: [TypeOrmModule.forFeature([EmotionData])],
  providers: [EmotionService],
  controllers: [EmotionController],
  exports: [EmotionService],
})
export class EmotionModule {}