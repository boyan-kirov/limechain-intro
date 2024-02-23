import { Type } from 'class-transformer';
import { IsArray, ValidateNested } from 'class-validator';
import { SignUpDto } from '../../auth/dtos/signup.dto';

export class BatchDto {
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => SignUpDto)
    users: SignUpDto[];
}
