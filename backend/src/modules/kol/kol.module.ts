import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { KolController } from './kol.controller';
import { KolService } from './kol.service';
import { Kol } from './entities/kol.entity';
import { CollectionModule } from '../collection/collection.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Kol]),
    forwardRef(() => CollectionModule),
  ],
  controllers: [KolController],
  providers: [KolService],
  exports: [KolService],
})
export class KolModule {}