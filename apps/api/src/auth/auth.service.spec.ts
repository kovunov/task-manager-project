import { UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from '../users/users.service';
import { AuthService } from './auth.service';
import { RegisterDto } from './schemas/auth.schemas';

describe('AuthService', () => {
  let service: AuthService;
  let usersService: UsersService;
  let jwtService: JwtService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: {
            findByEmail: jest.fn(),
            validatePassword: jest.fn(),
            create: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn(() => 'test-token'),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    usersService = module.get<UsersService>(UsersService);
    jwtService = module.get<JwtService>(JwtService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('validateUser', () => {
    it('should return user when credentials are valid', async () => {
      const user = {
        id: 1,
        email: 'test@example.com',
        password_hash: 'hashed_password',
        username: 'testuser',
        first_name: 'Test',
        last_name: 'User',
        created_at: new Date(),
        updated_at: new Date(),
      };

      jest.spyOn(usersService, 'findByEmail').mockResolvedValue(user);
      jest.spyOn(usersService, 'validatePassword').mockResolvedValue(true);

      const result = await service.validateUser('test@example.com', 'password');
      expect(result).toEqual({
        id: 1,
        email: 'test@example.com',
        username: 'testuser',
        first_name: 'Test',
        last_name: 'User',
        created_at: expect.any(Date),
        updated_at: expect.any(Date),
      });
    });

    it('should throw UnauthorizedException when user not found', async () => {
      jest.spyOn(usersService, 'findByEmail').mockResolvedValue(null);

      await expect(
        service.validateUser('test@example.com', 'password'),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException when password is invalid', async () => {
      const user = {
        id: 1,
        email: 'test@example.com',
        password_hash: 'hashed_password',
        username: 'testuser',
        first_name: 'Test',
        last_name: 'User',
        created_at: new Date(),
        updated_at: new Date(),
      };

      jest.spyOn(usersService, 'findByEmail').mockResolvedValue(user);
      jest.spyOn(usersService, 'validatePassword').mockResolvedValue(false);

      await expect(
        service.validateUser('test@example.com', 'wrong_password'),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('login', () => {
    it('should return token and user data', async () => {
      const user = {
        id: 1,
        email: 'test@example.com',
        username: 'testuser',
        name: 'Test User',
      };

      const result = await service.login(user);

      expect(result).toEqual({
        accessToken: 'test-token',
        user: {
          id: 1,
          email: 'test@example.com',
          name: 'Test User',
        },
      });

      expect(jwtService.sign).toHaveBeenCalledWith({
        email: 'test@example.com',
        sub: 1,
      });
    });
  });

  describe('register', () => {
    it('should register a new user successfully', async () => {
      const registerDto: RegisterDto = {
        email: 'new@example.com',
        password: 'password',
        name: 'New User',
      };

      const newUser = {
        id: 2,
        email: 'new@example.com',
        password_hash: 'hashed_password',
        username: 'New User',
        first_name: 'New',
        last_name: 'User',
        created_at: new Date(),
        updated_at: new Date(),
      };

      jest.spyOn(usersService, 'findByEmail').mockResolvedValue(null);
      jest.spyOn(usersService, 'create').mockResolvedValue(newUser);

      const result = await service.register(registerDto);

      expect(result).toEqual({
        id: 2,
        email: 'new@example.com',
        username: 'New User',
        first_name: 'New',
        last_name: 'User',
        created_at: expect.any(Date),
        updated_at: expect.any(Date),
      });

      expect(usersService.create).toHaveBeenCalledWith(
        registerDto.email,
        registerDto.password,
        registerDto.name,
      );
    });

    it('should throw UnauthorizedException if email already exists', async () => {
      const registerDto: RegisterDto = {
        email: 'existing@example.com',
        password: 'password',
        name: 'Existing User',
      };

      const existingUser = {
        id: 3,
        email: 'existing@example.com',
        password_hash: 'hashed_password',
        username: 'existing_user',
        first_name: 'Existing',
        last_name: 'User',
        created_at: new Date(),
        updated_at: new Date(),
      };

      jest.spyOn(usersService, 'findByEmail').mockResolvedValue(existingUser);

      await expect(service.register(registerDto)).rejects.toThrow(
        UnauthorizedException,
      );

      expect(usersService.create).not.toHaveBeenCalled();
    });
  });
});
