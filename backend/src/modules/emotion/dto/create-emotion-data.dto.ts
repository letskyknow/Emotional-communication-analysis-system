import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString, IsOptional, IsObject, IsArray, Min, Max } from 'class-validator';

export class CreateEmotionDataDto {
  @ApiProperty({ description: 'Positive emotion score', minimum: 0, maximum: 1 })
  @IsNumber()
  @Min(0)
  @Max(1)
  positiveScore: number;

  @ApiProperty({ description: 'Negative emotion score', minimum: 0, maximum: 1 })
  @IsNumber()
  @Min(0)
  @Max(1)
  negativeScore: number;

  @ApiProperty({ description: 'Neutral emotion score', minimum: 0, maximum: 1 })
  @IsNumber()
  @Min(0)
  @Max(1)
  neutralScore: number;

  @ApiProperty({ description: 'Overall emotion score', minimum: 0, maximum: 1 })
  @IsNumber()
  @Min(0)
  @Max(1)
  overallScore: number;

  @ApiProperty({ description: 'Sentiment classification', enum: ['positive', 'negative', 'neutral', 'mixed'] })
  @IsString()
  sentiment: string;

  @ApiProperty({ description: 'Detailed emotion scores', required: false })
  @IsObject()
  @IsOptional()
  emotions?: {
    joy?: number;
    anger?: number;
    fear?: number;
    sadness?: number;
    surprise?: number;
    disgust?: number;
    trust?: number;
    anticipation?: number;
  };

  @ApiProperty({ description: 'Analyzed text', required: false })
  @IsString()
  @IsOptional()
  text?: string;

  @ApiProperty({ description: 'Language code', required: false })
  @IsString()
  @IsOptional()
  language?: string;

  @ApiProperty({ description: 'Analysis confidence score', minimum: 0, maximum: 1, required: false })
  @IsNumber()
  @Min(0)
  @Max(1)
  @IsOptional()
  confidence?: number;

  @ApiProperty({ description: 'Extracted keywords', required: false })
  @IsArray()
  @IsOptional()
  keywords?: string[];

  @ApiProperty({ description: 'Additional metadata', required: false })
  @IsObject()
  @IsOptional()
  metadata?: Record<string, any>;

  @ApiProperty({ description: 'Associated event ID', required: false })
  @IsString()
  @IsOptional()
  eventId?: string;

  @ApiProperty({ description: 'Associated KOL ID', required: false })
  @IsString()
  @IsOptional()
  kolId?: string;

  @ApiProperty({ description: 'Source identifier', required: false })
  @IsString()
  @IsOptional()
  sourceId?: string;

  @ApiProperty({ description: 'Source type', required: false })
  @IsString()
  @IsOptional()
  sourceType?: string;

  @ApiProperty({ description: 'Content to analyze', required: false })
  @IsString()
  @IsOptional()
  content?: string;

  @ApiProperty({ description: 'Timestamp of the content', required: false })
  @IsOptional()
  timestamp?: Date;
}