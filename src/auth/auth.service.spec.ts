import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { ForbiddenException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { SignUpDto } from './dtos/signup.dto';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

describe('AuthService', () => {
    let authService;
    let usersService;

    const dto: SignUpDto = {
        email: 'test@test.com',
        password: 'password',
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                AuthService,
                JwtService,
                {
                    provide: UsersService,
                    useValue: {
                        find: jest.fn(),
                        create: jest.fn(),
                        comparePasswords: jest.fn(),
                    },
                },
                {
                    provide: ConfigService,
                    useValue: {
                        get: jest.fn((key: string) => {
                            if (key === 'JWT_SECRET') {
                                return 'JWT_SECRET';
                            }
                        }),
                    },
                },
            ],
        }).compile();

        authService = module.get<AuthService>(AuthService);
        usersService = module.get<UsersService>(UsersService);
    });

    describe('Signup', () => {
        it('should throw ForbiddenException if email is already in use', async () => {
            usersService.find.mockResolvedValue('user');
            await expect(authService.signup(dto)).rejects.toThrowError(ForbiddenException);
            expect(usersService.find).toHaveBeenCalled();
            expect(usersService.create).not.toHaveBeenCalled();
        });

        it('should create a new user if email is not in use', async () => {
            usersService.find.mockResolvedValue(null);
            usersService.create.mockResolvedValue({ email: dto.email, _id: 123 });

            const result = await authService.signup(dto);
            expect(usersService.find).toHaveBeenCalledWith(dto.email);
            expect(usersService.create).toHaveBeenCalledWith(dto);
            expect(result).toEqual({ email: dto.email, _id: 123 });
        });
    });

    describe('Signin', () => {
        it('should throw ForbiddenException if user is not found', async () => {
            usersService.find.mockResolvedValue(null);
            expect(authService.signin(dto)).rejects.toThrowError(ForbiddenException);
            expect(usersService.find).toHaveBeenCalledWith(dto.email);
        });

        it('should throw ForbiddenException if passwords dont match', async () => {
            usersService.find.mockResolvedValue({ id: 123, email: dto.email });
            usersService.comparePasswords.mockResolvedValue(false);
            expect(authService.signin(dto)).rejects.toThrowError(ForbiddenException);
            expect(usersService.find).toHaveBeenCalledWith(dto.email);
        });

        it('should return access token on successful login', async () => {
            usersService.find.mockResolvedValue({ id: 123, email: dto.email });
            usersService.comparePasswords.mockResolvedValue(true);
            jest.spyOn(authService, 'signToken');
            const result = await authService.signin(dto);

            expect(authService.signToken).toHaveBeenCalledWith(123, dto.email);
            expect(result).toHaveProperty('access_token');
            expect(typeof result.access_token).toBe('string');
        });
    });
});
