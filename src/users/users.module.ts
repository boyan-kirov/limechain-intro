import { Global, Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './user.schema';

@Global()
@Module({
    controllers: [UsersController],
    providers: [UsersService],
    imports: [MongooseModule.forFeature([{ name: User.name, schema: UserSchema }])],
    exports: [UsersService],
})
export class UsersModule {}
