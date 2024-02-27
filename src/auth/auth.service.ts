import { ForbiddenException, Injectable } from '@nestjs/common';
import { SignUpDto } from './dtos/signup.dto';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UserDocument } from '../users/user.schema';

@Injectable()
export class AuthService {
    constructor(
        private usersService: UsersService,
        private jwtService: JwtService,
        private configService: ConfigService,
    ) {}

    async signup(dto: SignUpDto): Promise<UserDocument> {
        const existingUser = await this.usersService.find(dto.email);
        if (existingUser) throw new ForbiddenException('Email already in use');
        return this.usersService.create(dto);
    }

    async signin(dto: SignUpDto): Promise<{ access_token: string }> {
        const user = await this.usersService.find(dto.email);
        if (!user || !(await this.usersService.comparePasswords(dto.password, user.password))) {
            throw new ForbiddenException('Email or password is wrong');
        }
        return this.signToken(user.id, dto.email);
    }

    async signToken(userId: string, email: string): Promise<{ access_token: string }> {
        const payload = {
            sub: userId,
            email,
        };
        const token = await this.jwtService.signAsync(payload, {
            expiresIn: '15m',
            secret: this.configService.get<string>('JWT_SECRET'),
        });

        return {
            access_token: token,
        };
    }
}
