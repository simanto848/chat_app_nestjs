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
import { ApiTags, ApiBearerAuth, ApiOperation, ApiProperty, ApiQuery } from '@nestjs/swagger';

class MessageQueryDto {
  @ApiProperty({ required: false, default: 50, maximum: 100 })
  @IsOptional()
  @Type(() => Number)
  @Min(1)
  @Max(100)
  limit?: number;

  @ApiProperty({ required: false, description: 'Message ID cursor — returns messages older than this' })
  @IsOptional()
  @IsString()
  before?: string;
}

class CreateMessageDto {
  @ApiProperty({ example: 'hello everyone', description: '1–1000 characters' })
  @IsString()
  content: string;
}

@ApiTags('Messages')
@ApiBearerAuth()
@Controller('rooms/:id/messages')
@UseGuards(AuthGuard)
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

  @Get()
  @ApiOperation({ summary: 'Paginated message history' })
  async findAll(
    @Param('id') roomId: string,
    @Query() query: MessageQueryDto,
  ) {
    return this.messagesService.findAll(roomId, query.limit, query.before);
  }

  @Post()
  @ApiOperation({ summary: 'Send a message' })
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
