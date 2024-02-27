import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtGuard } from '../auth/guards/jwt.guard';
import { BatchDto } from './dtos/batch.dto';
import { UserDocument } from './user.schema';

@Controller('users')
export class UsersController {
    constructor(private usersService: UsersService) {}

    @UseGuards(JwtGuard)
    @Get('')
    findAll(): Promise<UserDocument[]> {
        return this.usersService.findAll();
    }

    @UseGuards(JwtGuard)
    @Post('')
    batchRegister(@Body() dto: BatchDto): Promise<string[]> {
        return this.usersService.batchRegister(dto);
    }
}
