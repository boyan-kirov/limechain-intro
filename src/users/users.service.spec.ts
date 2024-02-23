import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { getModelToken } from '@nestjs/mongoose';
import { ConfigService } from '@nestjs/config';
import { SignUpDto } from '../auth/dtos/signup.dto';

describe('UsersService', () => {
    let usersService;
    const userModelMock = {
        findOne: jest.fn(),
        find: jest.fn(),
        create: jest.fn(),
    };

    const dto: SignUpDto = {
        email: 'test@test.com',
        password: 'password',
    };

    const mockUser = {
        _id: 123,
        email: 'test@test.com',
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                UsersService,
                {
                    provide: ConfigService,
                    useValue: {
                        get: jest.fn((key: string) => {
                            if (key === 'SALT_ROUNDS') {
                                return '1';
                            }
                        }),
                    },
                },
                {
                    provide: getModelToken('User'),
                    useValue: userModelMock,
                },
            ],
        }).compile();

        usersService = module.get<UsersService>(UsersService);
    });

    describe('Find user by email', () => {
        it('should find user by email', async () => {
            userModelMock.findOne.mockResolvedValue(mockUser);
            const user = await usersService.find(mockUser.email);
            expect(userModelMock.findOne).toHaveBeenCalledWith({ email: mockUser.email });
            expect(user).toEqual(mockUser);
        });

        it('should return null if user is not found', async () => {
            userModelMock.findOne.mockResolvedValue(null);
            const user = await usersService.find(mockUser.email);
            expect(userModelMock.findOne).toHaveBeenCalledWith({ email: mockUser.email });
            expect(user).toBeNull();
        });
    });

    describe('Find all users', () => {
        it('should return all users', async () => {
            userModelMock.find.mockResolvedValue([mockUser, mockUser]);
            const users = await usersService.findAll();
            expect(userModelMock.find).toHaveBeenCalledWith({}, '-password -__v');
            expect(users).toEqual([mockUser, mockUser]);
        });
    });

    describe('hashPassoword', () => {
        it('should hash the password with salt from .env', async () => {
            const password = 'password';
            const hash = await usersService.hashPassword(password);
            expect(hash).not.toEqual(password);
            expect(hash.length).toEqual(60);
        });

        it('should hash the password with salt provided as parameter', async () => {
            const password = 'password';
            const hash = await usersService.hashPassword(password, 10);
            expect(hash).not.toEqual(password);
            expect(hash.length).toEqual(60);
        });
    });

    describe('Create user', () => {
        it('Should create a user', async () => {
            jest.spyOn(usersService, 'hashPassword').mockResolvedValue('hashed_password');
            const createdUser = { ...dto, _id: '123', password: 'password', toObject: () => createdUser };
            userModelMock.create.mockResolvedValue(createdUser);
            const user = await usersService.create(dto);
            expect(usersService.hashPassword).toHaveBeenCalledWith(dto.password, 10);
            expect(user.password).toBeUndefined();
            expect(user.email).toEqual(dto.email);
        });
    });
});
