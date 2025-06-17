import { PartialType } from '@nestjs/swagger';
import { CreateKolDto } from './create-kol.dto';

export class UpdateKolDto extends PartialType(CreateKolDto) {}