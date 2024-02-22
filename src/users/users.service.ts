import { Injectable } from '@nestjs/common';
import { User, UserDocument } from './user.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model, UpdateWriteOpResult } from 'mongoose';
import { BatchDto } from './dtos/batch.dto';
import * as bcrypt from 'bcrypt';
import { SignUpDto } from 'src/auth/dtos/signup.dto';

import { promisify } from 'util';
import { ConfigService } from '@nestjs/config';
import { spawn } from 'child_process';
import internal from 'stream';

type EmailPasswordPair = {
    email: string;
    password: string;
};

@Injectable()
export class UsersService {
    constructor(@InjectModel(User.name) private userModel: Model<UserDocument>, private configService: ConfigService) {}

    async hashPassword(
        password: string,
        saltRounds: number = parseInt(this.configService.get<string>('SALT_ROUNDS')),
    ): Promise<string> {
        return await bcrypt.hash(password, saltRounds);
    }

    async comparePasswords(password: string, hash: string) {
        return await bcrypt.compare(password, hash);
    }

    async create(dto: SignUpDto): Promise<UserDocument> {
        const hash = await this.hashPassword(dto.password, 10);
        const user = new this.userModel({ email: dto.email, password: hash });
        await user.save();

        const userObject = user.toObject();
        delete userObject.password;
        return userObject;
    }

    async batchRegister(dto: BatchDto) {
        const allUsers = await this.findAll();
        const allEmails = allUsers.map((user) => user.email);
        const newUsers = dto.users.filter((user) => !allEmails.includes(user.email));

        const hashedPairs = await Promise.all(
            newUsers.map(async (pair) => ({
                email: pair.email,
                password: await this.hashPassword(pair.password),
            })),
        );

        await this.userModel.insertMany(hashedPairs);

        const serializedData = JSON.stringify(newUsers);

        // Spawn a child process to handle rehashing the passwords with higher round count
        const childProcess = spawn('node', ['./src/scripts/rehashPasswords.js'], {
            detached: true,
            stdio: ['pipe', 'pipe', 'pipe'],
        });

        childProcess.stdin.write(serializedData);
        childProcess.stdin.end();

        let hashedPairsJson = '';
        childProcess.stdout.on('data', (data) => {
            hashedPairsJson += data;
        });

        childProcess.on('close', async (code) => {
            if (code === 0) {
                try {
                    const hashedPairs = JSON.parse(hashedPairsJson);
                    const bulkUpdate = hashedPairs.map((pair) => ({
                        updateOne: {
                            filter: { email: pair.email },
                            update: { $set: { password: pair.password } },
                        },
                    }));

                    await this.userModel.bulkWrite(bulkUpdate);
                } catch (error) {
                    console.error('Error parsing hashed passwords:', error);
                }
            } else {
                console.error(`Child process exited with code ${code}`);
            }
        });

        return hashedPairs.map((pair) => pair.email);
    }

    async find(email: string): Promise<UserDocument> {
        return await this.userModel.findOne({ email });
    }

    async findAll(): Promise<UserDocument[]> {
        return await this.userModel.find({}, '-password -__v');
    }
}
