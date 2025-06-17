import { Controller, Get, Post, Body, Put, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { KolService } from './kol.service';
import { CreateKolDto } from './dto/create-kol.dto';
import { UpdateKolDto } from './dto/update-kol.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('KOL')
@Controller('kols')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class KolController {
  constructor(private readonly kolService: KolService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new KOL' })
  create(@Body() createKolDto: CreateKolDto) {
    return this.kolService.create(createKolDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all KOLs' })
  findAll(@Query('isActive') isActive?: boolean) {
    return this.kolService.findAll(isActive);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a KOL by ID' })
  findOne(@Param('id') id: string) {
    return this.kolService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a KOL' })
  update(@Param('id') id: string, @Body() updateKolDto: UpdateKolDto) {
    return this.kolService.update(id, updateKolDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a KOL' })
  remove(@Param('id') id: string) {
    return this.kolService.remove(id);
  }

  @Post('batch-import')
  @ApiOperation({ summary: 'Batch import KOLs' })
  batchImport(@Body() kols: CreateKolDto[]) {
    return this.kolService.batchImport(kols);
  }

  @Get(':id/emotions')
  @ApiOperation({ summary: 'Get emotion history for a KOL' })
  async getEmotionHistory(@Param('id') id: string) {
    // This would be implemented to fetch from MongoDB
    return {
      kolId: id,
      history: [],
    };
  }
}