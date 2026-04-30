import { MessagesService } from './messages.service';
declare class MessageQueryDto {
    limit?: number;
    before?: string;
}
declare class CreateMessageDto {
    content: string;
}
export declare class MessagesController {
    private readonly messagesService;
    constructor(messagesService: MessagesService);
    findAll(roomId: string, query: MessageQueryDto): Promise<{
        messages: {
            id: string;
            username: string;
            createdAt: Date;
            roomId: string;
            content: string;
        }[];
        hasMore: boolean;
        nextCursor: string | null;
    }>;
    create(roomId: string, createMessageDto: CreateMessageDto, user: any): Promise<{
        id: string;
        username: string;
        createdAt: Date;
        roomId: string;
        content: string;
    }>;
}
export {};
