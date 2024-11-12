import { ConflictException, Injectable, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class AuthService {
    private blacklist: string[] = [];

    constructor(private usersService: UsersService, private jwtService: JwtService) { }

    async login(email: string, pass: string): Promise<{ result: any, access_token: string }> {
        try {
            const user = await this.usersService.login(email, pass);

            if (!user) {
                throw new UnauthorizedException('Invalid email or password');
            }

            const { password, ...result } = user;
            const payload = { sub: result.id, email: result.email, username: result.username };
            return {
                result,
                access_token: await this.jwtService.signAsync(payload)
            };
        } catch (error: any) {
            if (error instanceof UnauthorizedException) {
                throw new UnauthorizedException(error.message);
            }
            throw new InternalServerErrorException(error);
        }
    }

    async register(username: string, email: string, pass: string): Promise<any> {
        try {
            const registeredUser = await this.usersService.register(username, email, pass);
            const { password, ...result } = registeredUser;
            return result;
        } catch (error) {
            if (error.status === 409) {
                throw new ConflictException(error.response.detail.slice(4));
            } else {
                throw new InternalServerErrorException(error);
            }
        }
    }

    async logout(accessToken: string): Promise<void> {
        this.addToBlacklist(accessToken);
    }

    addToBlacklist(token: string): void {
        this.blacklist.push(token);
    }

    isBlacklisted(token: string): boolean {
        return this.blacklist.includes(token);
    }
}
