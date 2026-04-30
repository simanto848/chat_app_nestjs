import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';
import { RoomsService } from './rooms.service';
import { AuthGuard } from '../auth/auth.guard';
import { GetUser } from '../common/decorators/get-user.decorator';
import { IsString, Matches, Length } from 'class-validator';

class CreateRoomDto {
  @IsString()
  @Length(3, 32)
  @Matches(/^[a-zA-Z0-9-]+$/, {
    message: 'name must be alphanumeric and hyphens only',
  })
  name: string;
}

@Controller('rooms')
@UseGuards(AuthGuard)
export class RoomsController {
  constructor(private readonly roomsService: RoomsService) {}

  @Get()
  async findAll() {
    return this.roomsService.findAll();
  }

  @Post()
  async create(@Body() createRoomDto: CreateRoomDto, @GetUser() user: any) {
    return this.roomsService.create(createRoomDto.name, user.username);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.roomsService.findOne(id);
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @GetUser() user: any) {
    return this.roomsService.remove(id, user.username);
  }
}
