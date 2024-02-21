import { Injectable } from '@nestjs/common';
import { User, UserDocument } from './user.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BatchDto } from './dtos/batch.dto';
import * as bcrypt from 'bcrypt';
import { SignUpDto } from 'src/auth/dtos/signup.dto';
import { AuthService } from 'src/auth/auth.service';

@Injectable()
export class UsersService {
    constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

    async hashPassword(password: string): Promise<string> {
        return await bcrypt.hash(password, 1);
    }

    async comparePasswords(password: string, hash: string) {
        return await bcrypt.compare(password, hash);
    }

    async create(dto: SignUpDto): Promise<UserDocument> {
        const hash = await this.hashPassword(dto.password);
        const user = new this.userModel({ email: dto.email, password: hash });
        return await user.save();
    }

    async batchRegister(dto: BatchDto) {
        const allUsers = await this.findAll();
        const allEmails = allUsers.map((user) => user.email);
        // const newUsers = dto.users.filter((user) => !allEmails.includes(user.email));
        const newUsers = [];
        for (let i = 0; i < 100; i++)
            newUsers.push({
                email: `user-${i}@gmail.com`,
                password: '123',
            });
        // await this.userModel.insertMany(newUsers);
        for (const user of newUsers) {
            user.password = await this.hashPassword(user.password);
            // console.log(user);
        }

        return 'DONE';

        // const user = new this.userModel({ email, password });
        // return await user.save();
    }

    async find(email: string): Promise<UserDocument> {
        return await this.userModel.findOne({ email });
    }

    async findAll(): Promise<UserDocument[]> {
        return await this.userModel.find({}, '-password -__v');
    }
}
