import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsEmail, IsString, Length, Matches, MinLength } from 'class-validator';

export class SignupDto {
  @ApiProperty({ example: 'acme', description: 'Lowercase letters, numbers, underscores only. Becomes the login company code.' })
  @Transform(({ value }) => (typeof value === 'string' ? value.toLowerCase().trim() : value))
  @IsString()
  @Matches(/^[a-z0-9_]{3,30}$/, {
    message: 'companyCode must be 3-30 characters: lowercase letters, numbers, and underscores only',
  })
  companyCode!: string;

  @ApiProperty({ example: 'Acme Traders Pvt Ltd' })
  @IsString()
  @Length(1, 200)
  companyName!: string;

  @ApiProperty({ example: 'contact@acme.example' })
  @IsEmail()
  companyEmail!: string;

  @ApiProperty({ example: 'Priya Sharma' })
  @IsString()
  @Length(1, 150)
  adminName!: string;

  @ApiProperty({ example: 'priya@acme.example' })
  @IsEmail()
  adminEmail!: string;

  @ApiProperty()
  @IsString()
  @MinLength(8)
  adminPassword!: string;
}
