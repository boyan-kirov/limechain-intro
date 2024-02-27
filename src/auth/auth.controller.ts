import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignUpDto } from './dtos/signup.dto';
import { UserDocument } from 'src/users/user.schema';

@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) {}

    @Post('signup')
    signup(@Body() dto: SignUpDto): Promise<UserDocument> {
        return this.authService.signup(dto);
    }

    @Post('signin')
    signin(@Body() dto: SignUpDto): Promise<{ access_token: string }> {
        return this.authService.signin(dto);
    }
}
