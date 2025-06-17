import { PartialType } from '@nestjs/swagger';
import { CreateEmotionDataDto } from './create-emotion-data.dto';

export class UpdateEmotionDataDto extends PartialType(CreateEmotionDataDto) {}