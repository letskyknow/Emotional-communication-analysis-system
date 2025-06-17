import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength, IsOptional } from 'class-validator';

export class RegisterDto {
  @ApiProperty({ description: 'Username' })
  @IsString()
  @MinLength(3)
  username: string;

  @ApiProperty({ description: 'Email address' })
  @IsEmail()
  email: string;

  @ApiProperty({ description: 'Password', minimum: 6 })
  @IsString()
  @MinLength(6)
  password: string;

  @ApiProperty({ description: 'First name', required: false })
  @IsString()
  @IsOptional()
  firstName?: string;

  @ApiProperty({ description: 'Last name', required: false })
  @IsString()
  @IsOptional()
  lastName?: string;
}