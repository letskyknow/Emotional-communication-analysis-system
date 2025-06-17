import { Injectable, NotFoundException, BadRequestException, Inject, forwardRef } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Kol } from './entities/kol.entity';
import { CreateKolDto } from './dto/create-kol.dto';
import { UpdateKolDto } from './dto/update-kol.dto';
import { CollectionService } from '../collection/collection.service';

@Injectable()
export class KolService {
  constructor(
    @InjectRepository(Kol)
    private kolRepository: Repository<Kol>,
    @Inject(forwardRef(() => CollectionService))
    private collectionService: CollectionService,
  ) {}

  async create(createKolDto: CreateKolDto): Promise<Kol> {
    // Check if KOL already exists
    const existing = await this.kolRepository.findOne({
      where: { username: createKolDto.username },
    });

    if (existing) {
      throw new BadRequestException('KOL with this username already exists');
    }

    // Check KOL limit (max 50)
    const count = await this.kolRepository.count({ where: { isActive: true } });
    if (count >= 50) {
      throw new BadRequestException('Maximum KOL limit (50) reached');
    }

    const kol = this.kolRepository.create(createKolDto);
    const savedKol = await this.kolRepository.save(kol);
    
    // Trigger initial data collection for the new KOL
    if (this.collectionService) {
      setImmediate(() => {
        this.collectionService.collectKolData(savedKol.username).catch(err => {
          console.error(`Error collecting initial data for ${savedKol.username}:`, err);
        });
      });
    }
    
    return savedKol;
  }

  async findAll(isActive?: boolean): Promise<Kol[]> {
    const query = this.kolRepository.createQueryBuilder('kol');
    
    if (isActive !== undefined) {
      query.where('kol.isActive = :isActive', { isActive });
    }
    
    return query
      .orderBy('kol.emotionScore', 'DESC')
      .getMany();
  }

  async findOne(id: string): Promise<Kol> {
    const kol = await this.kolRepository.findOne({ where: { id } });
    
    if (!kol) {
      throw new NotFoundException('KOL not found');
    }
    
    return kol;
  }

  async update(id: string, updateKolDto: UpdateKolDto): Promise<Kol> {
    const kol = await this.findOne(id);
    
    Object.assign(kol, updateKolDto);
    
    return this.kolRepository.save(kol);
  }

  async remove(id: string): Promise<void> {
    const kol = await this.findOne(id);
    
    // Soft delete by marking as inactive
    kol.isActive = false;
    await this.kolRepository.save(kol);
  }

  async getActiveKols(): Promise<Kol[]> {
    return this.kolRepository.find({
      where: { isActive: true },
      order: { emotionScore: 'DESC' },
      take: 50,
    });
  }

  async updateEmotionScore(username: string, score: number): Promise<Kol> {
    const kol = await this.kolRepository.findOne({ where: { username } });
    
    if (!kol) {
      throw new NotFoundException('KOL not found');
    }
    
    kol.emotionScore = score;
    
    // Calculate influence score based on the algorithm
    const baseScore = Math.log10(Number(kol.followersCount)) * 2;
    const activityCoefficient = 1; // This would be calculated from tweet frequency
    const emotionCoefficient = score / 5;
    
    kol.influenceScore = baseScore * activityCoefficient * emotionCoefficient;
    
    return this.kolRepository.save(kol);
  }

  async batchImport(kols: CreateKolDto[]): Promise<{ success: number; failed: number }> {
    let success = 0;
    let failed = 0;

    for (const kolDto of kols) {
      try {
        await this.create(kolDto);
        success++;
      } catch (error) {
        failed++;
      }
    }

    return { success, failed };
  }
}