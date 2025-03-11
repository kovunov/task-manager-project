import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { RegisterDto } from './schemas/auth.schemas';

describe('AuthController', () => {
  let controller: AuthController;
  let service: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: {
            login: jest.fn(),
            register: jest.fn(),
          },
        },
      ],
    })
      .overrideGuard(LocalAuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<AuthController>(AuthController);
    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('login', () => {
    it('should call AuthService.login with the user from the request', async () => {
      const req = {
        user: { id: 1, email: 'test@example.com', name: 'Test User' },
      };
      const loginResponse = {
        accessToken: 'test-token',
        user: { id: 1, email: 'test@example.com', name: 'Test User' },
      };

      jest.spyOn(service, 'login').mockResolvedValue(loginResponse);

      const result = await controller.login(req);

      expect(result).toBe(loginResponse);
      expect(service.login).toHaveBeenCalledWith(req.user);
    });
  });

  describe('register', () => {
    it('should call AuthService.register with the registration data', async () => {
      const registerDto: RegisterDto = {
        email: 'new@example.com',
        password: 'password',
        name: 'New User',
      };

      const registerResponse = {
        id: 1,
        email: 'new@example.com',
        username: 'New User',
        first_name: 'New',
        last_name: 'User',
        created_at: new Date(),
        updated_at: new Date(),
      };

      jest.spyOn(service, 'register').mockResolvedValue(registerResponse);

      const result = await controller.register(registerDto);

      expect(result).toBe(registerResponse);
      expect(service.register).toHaveBeenCalledWith(registerDto);
    });
  });
});
