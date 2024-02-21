import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignUpDto } from './dtos/signup.dto';

@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) {}

    @Post('signup')
    signup(@Body() dto: SignUpDto) {
        return this.authService.signup(dto);
        // const user = await this.authService.signup(signUpDto);
        // return {
        //     user: user.id,
        // };
    }

    @Post('signin')
    signin(@Body() dto: SignUpDto) {
        return this.authService.signin(dto);
    }
}
