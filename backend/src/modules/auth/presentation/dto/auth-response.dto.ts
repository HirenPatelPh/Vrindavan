import { ApiProperty } from '@nestjs/swagger';
import { AuthResult } from '../../application/auth.service';

class AuthUserDto {
  @ApiProperty() id: string;
  @ApiProperty() name: string;
  @ApiProperty() email: string;
  @ApiProperty({ type: [String] }) roles: string[];
  @ApiProperty() mustChangePassword: boolean;

  constructor(user: AuthResult['user']) {
    this.id = user.id;
    this.name = user.name;
    this.email = user.email;
    this.roles = user.roles;
    this.mustChangePassword = user.mustChangePassword;
  }
}

export class AuthResponseDto {
  @ApiProperty() accessToken: string;
  @ApiProperty() refreshToken: string;
  @ApiProperty({ type: AuthUserDto }) user: AuthUserDto;

  constructor(result: AuthResult) {
    this.accessToken = result.accessToken;
    this.refreshToken = result.refreshToken;
    this.user = new AuthUserDto(result.user);
  }
}
