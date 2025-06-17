import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsArray, IsDateString, IsEnum } from 'class-validator';

export class CreateEventDto {
  @ApiProperty({ description: 'Event name' })
  @IsString()
  name: string;

  @ApiProperty({ description: 'Event description', required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ description: 'Event type', enum: ['monitoring', 'campaign', 'crisis', 'research'], required: false })
  @IsEnum(['monitoring', 'campaign', 'crisis', 'research'])
  @IsOptional()
  type?: string;

  @ApiProperty({ description: 'Event start date' })
  @IsDateString()
  startDate: Date;

  @ApiProperty({ description: 'Event end date', required: false })
  @IsDateString()
  @IsOptional()
  endDate?: Date;

  @ApiProperty({ description: 'Associated KOL IDs', required: false })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  kolIds?: string[];

  @ApiProperty({ description: 'Keywords to monitor', required: false })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  keywords?: string[];

  @ApiProperty({ description: 'Hashtags to monitor', required: false })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  hashtags?: string[];

  @ApiProperty({ description: 'User ID', required: false })
  @IsString()
  @IsOptional()
  userId?: string;
}