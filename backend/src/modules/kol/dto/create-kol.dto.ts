import { IsString, IsNumber, IsOptional, IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateKolDto {
  @ApiProperty({ example: '@elonmusk' })
  @IsString()
  username: string;

  @ApiProperty({ example: '44196397', required: false })
  @IsString()
  @IsOptional()
  twitterId?: string;

  @ApiProperty({ example: 150000000, required: false })
  @IsNumber()
  @IsOptional()
  followersCount?: number;

  @ApiProperty({ example: 'tech', required: false })
  @IsString()
  @IsOptional()
  category?: string;

  @ApiProperty({ example: 'https://pbs.twimg.com/profile_images/...jpg', required: false })
  @IsString()
  @IsOptional()
  avatar?: string;

  @ApiProperty({ example: true, required: false })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}