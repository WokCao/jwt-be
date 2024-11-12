import { ConflictException, Injectable, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './users.entity';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UsersService {
    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
    ) { }

    async login(email: string, password: string) {
        // Check valid email and correct password, if there is no user -> login failed
        try {
            const user = await this.userRepository.findOne({ where: { email } });

            if (user === null) {
                throw new UnauthorizedException('Email doesn\'t exist');
            }

            if (user && await bcrypt.compare(password, user.password)) {
                return user;
            }

            throw new UnauthorizedException('Password is wrong');
        } catch (error) {
            if (error.status === 401) throw new UnauthorizedException(error.message);
            throw new InternalServerErrorException('Database errors occur. Please try again...');
        }
    }

    async register(username: string, email: string, password: string): Promise<User> {
        // Hash password before saving to postgresql
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = this.userRepository.create({ username, email, password: hashedPassword });

        try {
            return await this.userRepository.save(user);
        } catch (error) {
            if (error.code === '23505') {
                // Duplicate username or email error code in PostgreSQL
                throw new ConflictException(error);
            } else {
                throw new InternalServerErrorException('Database errors occur. Please try again...');
            }
        }
    }
}
