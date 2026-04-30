import { OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import Redis from 'ioredis';
import { AuthService } from '../auth/auth.service';
import { RoomsService } from '../rooms/rooms.service';
export declare class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
    private redis;
    private authService;
    private roomsService;
    server: Server;
    private redisSub;
    constructor(redis: Redis, authService: AuthService, roomsService: RoomsService);
    handleConnection(client: Socket): Promise<void>;
    handleDisconnect(client: Socket): Promise<void>;
    handleLeave(client: Socket): Promise<void>;
    private leaveRoom;
}
