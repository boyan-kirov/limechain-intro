import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtGuard } from 'src/auth/guards/jwt.guard';
import { BatchDto } from './dtos/batch.dto';

@Controller('users')
export class UsersController {
    constructor(private usersService: UsersService) {}

    @UseGuards(JwtGuard)
    @Get('')
    findAll() {
        return this.usersService.findAll();
    }

    @UseGuards(JwtGuard)
    @Post('')
    batchRegister(@Body() dto: BatchDto) {
        return this.usersService.batchRegister(dto);
    }
}
