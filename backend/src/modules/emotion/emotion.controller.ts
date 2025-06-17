import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { EmotionService } from './emotion.service';
import { CreateEmotionDataDto } from './dto/create-emotion-data.dto';
import { UpdateEmotionDataDto } from './dto/update-emotion-data.dto';

@ApiTags('Emotion Analysis')
@Controller('emotion')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class EmotionController {
  constructor(private readonly emotionService: EmotionService) {}

  @Post()
  @ApiOperation({ summary: 'Create emotion data' })
  create(@Body() createEmotionDataDto: CreateEmotionDataDto) {
    return this.emotionService.create(createEmotionDataDto);
  }

  @Post('analyze')
  @ApiOperation({ summary: 'Analyze text for emotions' })
  analyzeText(@Body('text') text: string) {
    return this.emotionService.analyzeText(text);
  }

  @Get()
  @ApiOperation({ summary: 'Get all emotion data' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'sentiment', required: false, type: String })
  @ApiQuery({ name: 'startDate', required: false, type: Date })
  @ApiQuery({ name: 'endDate', required: false, type: Date })
  @ApiQuery({ name: 'eventId', required: false, type: String })
  @ApiQuery({ name: 'kolId', required: false, type: String })
  findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('sentiment') sentiment?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('eventId') eventId?: string,
    @Query('kolId') kolId?: string,
  ) {
    return this.emotionService.findAll({
      page: page ? +page : undefined,
      limit: limit ? +limit : undefined,
      sentiment,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
      eventId,
      kolId,
    });
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get emotion statistics' })
  @ApiQuery({ name: 'startDate', required: false, type: Date })
  @ApiQuery({ name: 'endDate', required: false, type: Date })
  @ApiQuery({ name: 'eventId', required: false, type: String })
  @ApiQuery({ name: 'kolId', required: false, type: String })
  getStats(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('eventId') eventId?: string,
    @Query('kolId') kolId?: string,
  ) {
    return this.emotionService.getEmotionStats({
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
      eventId,
      kolId,
    });
  }

  @Get('trends')
  @ApiOperation({ summary: 'Get emotion trends over time' })
  @ApiQuery({ name: 'granularity', required: false, enum: ['hour', 'day', 'week', 'month'] })
  @ApiQuery({ name: 'startDate', required: false, type: Date })
  @ApiQuery({ name: 'endDate', required: false, type: Date })
  @ApiQuery({ name: 'eventId', required: false, type: String })
  @ApiQuery({ name: 'kolId', required: false, type: String })
  getTrends(
    @Query('granularity') granularity?: 'hour' | 'day' | 'week' | 'month',
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('eventId') eventId?: string,
    @Query('kolId') kolId?: string,
  ) {
    return this.emotionService.getEmotionTrends(
      granularity || 'day',
      startDate ? new Date(startDate) : undefined,
      endDate ? new Date(endDate) : undefined,
      eventId,
      kolId,
    );
  }

  @Get('heatmap')
  @ApiOperation({ summary: 'Get emotion heatmap data' })
  @ApiQuery({ name: 'startDate', required: false, type: Date })
  @ApiQuery({ name: 'endDate', required: false, type: Date })
  @ApiQuery({ name: 'eventId', required: false, type: String })
  @ApiQuery({ name: 'kolId', required: false, type: String })
  getHeatmapData(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('eventId') eventId?: string,
    @Query('kolId') kolId?: string,
  ) {
    return this.emotionService.getEmotionHeatmapData({
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
      eventId,
      kolId,
    });
  }

  @Get('kol-influence')
  @ApiOperation({ summary: 'Get KOL influence distribution' })
  @ApiQuery({ name: 'startDate', required: false, type: Date })
  @ApiQuery({ name: 'endDate', required: false, type: Date })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  getKOLInfluence(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('limit') limit?: number,
  ) {
    return this.emotionService.getKOLInfluenceData({
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
      limit: limit ? +limit : 10,
    });
  }

  @Get('event-comparison')
  @ApiOperation({ summary: 'Get event emotion comparison data' })
  @ApiQuery({ name: 'eventIds', required: false, type: String, isArray: true })
  @ApiQuery({ name: 'startDate', required: false, type: Date })
  @ApiQuery({ name: 'endDate', required: false, type: Date })
  getEventComparison(
    @Query('eventIds') eventIds?: string[],
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.emotionService.getEventComparisonData({
      eventIds: eventIds || [],
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
    });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get emotion data by ID' })
  findOne(@Param('id') id: string) {
    return this.emotionService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update emotion data' })
  update(
    @Param('id') id: string,
    @Body() updateEmotionDataDto: UpdateEmotionDataDto,
  ) {
    return this.emotionService.update(id, updateEmotionDataDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete emotion data' })
  remove(@Param('id') id: string) {
    return this.emotionService.remove(id);
  }
}