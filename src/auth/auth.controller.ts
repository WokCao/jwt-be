import { Body, Request, ConflictException, Controller, Get, HttpCode, HttpStatus, InternalServerErrorException, Post, UnauthorizedException, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthGuard } from './auth.guard';

@Controller('api/v1/auth')
export class AuthController {
    constructor(private authService: AuthService) { }

    @HttpCode(HttpStatus.OK)
    @Post('login')
    async login(@Body() signInDto: Record<string, any>) {
        try {
            const user = await this.authService.login(signInDto.email, signInDto.password);
            return { username: user.result.username, email: user.result.email, access_token: user.access_token, message: 'Success', statusCode: HttpStatus.OK };
        } catch (error) {
            if (error.status === 401) {
                throw new UnauthorizedException(error.message);
            } else {
                throw new InternalServerErrorException(error.message);
            }
        }
    }

    @HttpCode(HttpStatus.CREATED)
    @Post('register')
    async register(@Body() registerDto: Record<string, any>): Promise<{ user: any, message: string, statusCode: HttpStatus }> {
        try {
            const user = await this.authService.register(registerDto.username, registerDto.email, registerDto.password);
            return { user, message: 'User registered successfully', statusCode: HttpStatus.CREATED };
        } catch (error) {
            if (error.status === 409) {
                throw new ConflictException(error.message);
            } else {
                throw new InternalServerErrorException(error.message);
            }
        }
    }

    @UseGuards(AuthGuard)
    @Get('profile')
    getProfile(@Request() req) {
        try {
            return req.user;
        } catch (error) {
            throw new UnauthorizedException(error.message);
        }
    }

    @UseGuards(AuthGuard)
    @Post('logout')
    async logout(@Request() req) {
        const accessToken = req.headers['authorization']?.split(' ')[1];
        if (accessToken) {
            // Add the access token to a blacklist
            await this.authService.logout(accessToken);
        } else {
            throw new Error('No token provided');
        }
    }
}
