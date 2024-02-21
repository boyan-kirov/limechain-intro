import { Type } from 'class-transformer';
import { IsArray, IsEmail, IsString, ValidateNested } from 'class-validator';
import { SignUpDto } from 'src/auth/dtos/signup.dto';

export class BatchDto {
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => SignUpDto)
    users: SignUpDto[];
}
