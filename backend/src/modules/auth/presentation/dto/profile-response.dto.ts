import { ApiProperty } from '@nestjs/swagger';
import { User } from '../../domain/user.entity';

export class ProfileResponseDto {
  @ApiProperty() id: string;
  @ApiProperty() name: string;
  @ApiProperty() email: string;
  @ApiProperty({ nullable: true }) phone: string | null;
  @ApiProperty() isActive: boolean;
  @ApiProperty() mustChangePassword: boolean;
  @ApiProperty() createdAt: Date;
  @ApiProperty() updatedAt: Date;

  constructor(user: User) {
    this.id = user.id;
    this.name = user.name;
    this.email = user.email;
    this.phone = user.phone;
    this.isActive = user.isActive;
    this.mustChangePassword = user.mustChangePassword;
    this.createdAt = user.createdAt;
    this.updatedAt = user.updatedAt;
  }
}
