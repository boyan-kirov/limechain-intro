import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignUpDto } from './dtos/signup.dto';

@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) {}

    @Post('signup')
    async signup(@Body() dto: SignUpDto) {
        return await this.authService.signup(dto);
        // const user = await this.authService.signup(signUpDto);
        // return {
        //     user: user.id,
        // };
    }

    @Post('signin')
    async signin(@Body() dto: SignUpDto) {
        return await this.authService.signin(dto);
    }
}
