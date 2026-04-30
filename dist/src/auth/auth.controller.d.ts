import { AuthService } from './auth.service';
declare class LoginDto {
    username: string;
}
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    login(loginDto: LoginDto): Promise<{
        sessionToken: string;
        user: {
            id: string;
            username: string;
            createdAt: Date;
        };
    }>;
}
export {};
