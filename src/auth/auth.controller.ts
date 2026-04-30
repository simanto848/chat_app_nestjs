import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ApiTags, ApiOperation, ApiProperty } from '@nestjs/swagger';
import { IsString, Length, Matches } from 'class-validator';

class LoginDto {
  @ApiProperty({ example: 'ali_123', description: '2-24 characters, alphanumeric and underscores only' })
  @IsString()
  @Length(2, 24)
  @Matches(/^[a-zA-Z0-9_]+$/, {
    message: 'username must be alphanumeric and underscores only',
  })
  username: string;
}

@ApiTags('Authentication')
@Controller('login')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  @Post()
  @ApiOperation({ summary: 'Get or create a user and return a session token' })
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto.username);
  }
}
