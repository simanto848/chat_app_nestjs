"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatGateway = void 0;
const websockets_1 = require("@nestjs/websockets");
const socket_io_1 = require("socket.io");
const common_1 = require("@nestjs/common");
const redis_module_1 = require("../redis/redis.module");
const ioredis_1 = __importDefault(require("ioredis"));
const auth_service_1 = require("../auth/auth.service");
const rooms_service_1 = require("../rooms/rooms.service");
let ChatGateway = class ChatGateway {
    redis;
    authService;
    roomsService;
    server;
    redisSub;
    constructor(redis, authService, roomsService) {
        this.redis = redis;
        this.authService = authService;
        this.roomsService = roomsService;
        this.redisSub = this.redis.duplicate();
        this.redisSub.subscribe('message:new', 'room:deleted');
        this.redisSub.on('message', (channel, message) => {
            const data = JSON.parse(message);
            if (channel === 'message:new') {
                this.server.to(data.roomId).emit('message:new', {
                    id: data.id,
                    username: data.username,
                    content: data.content,
                    createdAt: data.createdAt,
                });
            }
            else if (channel === 'room:deleted') {
                this.server.to(data.roomId).emit('room:deleted', { roomId: data.roomId });
            }
        });
    }
    async handleConnection(client) {
        const token = client.handshake.query.token;
        const roomId = client.handshake.query.roomId;
        if (!token || !roomId) {
            client.emit('error', { code: 'UNAUTHORIZED', message: 'Missing token or roomId' });
            client.disconnect();
            return;
        }
        const user = await this.authService.validateSession(token);
        if (!user) {
            client.emit('error', { code: 'UNAUTHORIZED', message: 'Invalid or expired session token' });
            client.disconnect();
            return;
        }
        try {
            await this.roomsService.findOne(roomId);
        }
        catch (e) {
            client.emit('error', { code: 'ROOM_NOT_FOUND', message: 'Room not found' });
            client.disconnect();
            return;
        }
        client.join(roomId);
        client.data.user = user;
        client.data.roomId = roomId;
        await this.redis.sadd(`room:active_users:${roomId}`, user.username);
        const activeUsers = await this.redis.smembers(`room:active_users:${roomId}`);
        client.emit('room:joined', { activeUsers });
        client.to(roomId).emit('room:user_joined', {
            username: user.username,
            activeUsers,
        });
    }
    async handleDisconnect(client) {
        const user = client.data.user;
        const roomId = client.data.roomId;
        if (user && roomId) {
            await this.leaveRoom(user.username, roomId);
        }
    }
    async handleLeave(client) {
        const user = client.data.user;
        const roomId = client.data.roomId;
        if (user && roomId) {
            await this.leaveRoom(user.username, roomId);
            client.leave(roomId);
        }
    }
    async leaveRoom(username, roomId) {
        await this.redis.srem(`room:active_users:${roomId}`, username);
        const activeUsers = await this.redis.smembers(`room:active_users:${roomId}`);
        this.server.to(roomId).emit('room:user_left', {
            username,
            activeUsers,
        });
    }
};
exports.ChatGateway = ChatGateway;
__decorate([
    (0, websockets_1.WebSocketServer)(),
    __metadata("design:type", socket_io_1.Server)
], ChatGateway.prototype, "server", void 0);
__decorate([
    (0, websockets_1.SubscribeMessage)('room:leave'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket]),
    __metadata("design:returntype", Promise)
], ChatGateway.prototype, "handleLeave", null);
exports.ChatGateway = ChatGateway = __decorate([
    (0, websockets_1.WebSocketGateway)({
        namespace: '/chat',
        cors: { origin: '*' },
    }),
    __param(0, (0, common_1.Inject)(redis_module_1.REDIS)),
    __metadata("design:paramtypes", [ioredis_1.default,
        auth_service_1.AuthService,
        rooms_service_1.RoomsService])
], ChatGateway);
//# sourceMappingURL=chat.gateway.js.map