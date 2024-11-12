import {
    CanActivate,
    ExecutionContext,
    Injectable,
    UnauthorizedException,
} from '@nestjs/common';
import { JwtService, TokenExpiredError } from '@nestjs/jwt';
import { Request } from 'express';
import { AuthService } from './auth.service';

@Injectable()
export class AuthGuard implements CanActivate {
    constructor(private jwtService: JwtService, private authService: AuthService) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        const token = this.extractTokenFromHeader(request);
        if (!token) {
            throw new UnauthorizedException('Token has expired');
        }

        try {
            const payload = await this.jwtService.verifyAsync(
                token,
                {
                    secret: process.env.JWT_CONSTANT
                }
            );

            // Check if the token is in the blacklist (user has logged out)
            const isBlacklisted = this.authService.isBlacklisted(token);
            if (isBlacklisted) {
                throw new UnauthorizedException('Token is no longer valid');
            }

            // 💡 We're assigning the payload to the request object here
            // so that we can access it in our route handlers
            request['user'] = payload;
        } catch (error: any) {
            // Handle expired token
            if (error instanceof TokenExpiredError) {
                throw new UnauthorizedException('Token expired');
            }
            throw new UnauthorizedException(error.message);
        }
        return true;
    }

    private extractTokenFromHeader(request: Request): string | undefined {
        const [type, token] = request.headers.authorization?.split(' ') ?? [];
        return type === 'Bearer' ? token : undefined;
    }
}