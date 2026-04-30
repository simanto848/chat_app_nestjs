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
import { ApiTags, ApiBearerAuth, ApiOperation, ApiProperty } from '@nestjs/swagger';

class CreateRoomDto {
  @ApiProperty({ example: 'general', description: '3-32 characters, alphanumeric and hyphens only' })
  @IsString()
  @Length(3, 32)
  @Matches(/^[a-zA-Z0-9-]+$/, {
    message: 'name must be alphanumeric and hyphens only',
  })
  name: string;
}

@ApiTags('Rooms')
@ApiBearerAuth()
@Controller('rooms')
@UseGuards(AuthGuard)
export class RoomsController {
  constructor(private readonly roomsService: RoomsService) {}

  @Get()
  @ApiOperation({ summary: 'List all rooms' })
  async findAll() {
    return this.roomsService.findAll();
  }

  @Post()
  @ApiOperation({ summary: 'Create a new room' })
  async create(@Body() createRoomDto: CreateRoomDto, @GetUser() user: any) {
    return this.roomsService.create(createRoomDto.name, user.username);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get room details' })
  async findOne(@Param('id') id: string) {
    return this.roomsService.findOne(id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a room and all its messages' })
  async remove(@Param('id') id: string, @GetUser() user: any) {
    return this.roomsService.remove(id, user.username);
  }
}
