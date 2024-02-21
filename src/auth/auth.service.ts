import { BadRequestException, ForbiddenException, Injectable } from '@nestjs/common';
import { SignUpDto } from './dtos/signup.dto';
import { User, UserDocument } from '../users/user.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
    constructor(
        private usersService: UsersService,
        private jwtService: JwtService,
        private configService: ConfigService,
    ) {}

    async signup(dto: SignUpDto) {
        const existingUser = await this.usersService.find(dto.email);
        if (existingUser) throw new ForbiddenException('Email already in use');
        const hash = await bcrypt.hash(dto.password, 10);
        return this.usersService.create(dto.email, hash);
    }

    async signin(dto: SignUpDto) {
        const user = await this.usersService.find(dto.email);
        if (!user || !(await bcrypt.compare(dto.password, user.password))) {
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
