import { Injectable } from '@nestjs/common';
import { User, UserDocument } from './user.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class UsersService {
    constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

    async create(email: string, password: string): Promise<UserDocument> {
        const user = new this.userModel({ email, password });
        return await user.save();
    }

    async find(email: string): Promise<UserDocument> {
        return await this.userModel.findOne({ email });
    }
}
