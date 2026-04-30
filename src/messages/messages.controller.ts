import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  Query,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { MessagesService } from './messages.service';
import { AuthGuard } from '../auth/auth.guard';
import { GetUser } from '../common/decorators/get-user.decorator';
import { IsString, IsOptional, Max, Min } from 'class-validator';
import { Type } from 'class-transformer';

class MessageQueryDto {
  @IsOptional()
  @Type(() => Number)
  @Min(1)
  @Max(100)
  limit?: number;

  @IsOptional()
  @IsString()
  before?: string;
}

class CreateMessageDto {
  @IsString()
  content: string;
}

@Controller('rooms/:id/messages')
@UseGuards(AuthGuard)
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

  @Get()
  async findAll(
    @Param('id') roomId: string,
    @Query() query: MessageQueryDto,
  ) {
    return this.messagesService.findAll(roomId, query.limit, query.before);
  }

  @Post()
  async create(
    @Param('id') roomId: string,
    @Body() createMessageDto: CreateMessageDto,
    @GetUser() user: any,
  ) {
    return this.messagesService.create(
      roomId,
      createMessageDto.content,
      user.username,
    );
  }
}
