import { RoomsService } from './rooms.service';
declare class CreateRoomDto {
    name: string;
}
export declare class RoomsController {
    private readonly roomsService;
    constructor(roomsService: RoomsService);
    findAll(): Promise<{
        rooms: {
            activeUsers: number;
            id: string;
            createdAt: Date;
            name: string;
            createdBy: string;
        }[];
    }>;
    create(createRoomDto: CreateRoomDto, user: any): Promise<{
        id: string;
        createdAt: Date;
        name: string;
        createdBy: string;
    }>;
    findOne(id: string): Promise<{
        activeUsers: number;
        id: string;
        createdAt: Date;
        name: string;
        createdBy: string;
    }>;
    remove(id: string, user: any): Promise<{
        deleted: boolean;
    }>;
}
export {};
