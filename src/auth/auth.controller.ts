import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';
import { IsString, Matches, Length } from 'class-validator';

class LoginDto {
  @IsString()
  @Length(2, 24)
  @Matches(/^[a-zA-Z0-9_]+$/, {
    message: 'username must be alphanumeric and underscores only',
  })
  username: string;
}

@Controller('login')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post()
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto.username);
  }
}
