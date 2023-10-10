import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { User } from '../users/user.entity';

describe('AuthService', () => {
  let service: AuthService;
  let fakeUsersService: Partial<UsersService>;

  beforeEach(async () => {
    const users: User[] = [];

    fakeUsersService = {
      find: (email: string) => {
        const user = users.filter((user) => user.email === email);
        return Promise.resolve(user);
      },
      create: (name: string, email: string, password: string) => {
        const user = {
          id: Math.floor(Math.random() * 999999),
          name,
          email,
          password,
        } as User;

        users.push(user);
        return Promise.resolve(user);
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: fakeUsersService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create a new user', async () => {
    const user = await service.register(
      'John Doe',
      'john@example.com',
      'password',
    );

    expect(user.name).toBe('John Doe');
    expect(user.password).not.toEqual('password');
    const [salt, hash] = user.password.split('.');
    expect(salt).toBeDefined();
    expect(hash).toBeDefined();
  });

  it('should fail to create a user with an existing email', async () => {
    await service.register('John Doe', 'john@example.com', 'password');
    await expect(
      service.register('John Doe', 'john@example.com', 'password'),
    ).rejects.toThrow('Email sudah terdaftar');
  });

  it('should fail if user login with an invalid email', async () => {
    await expect(service.login('admin@mail.com', 'password')).rejects.toThrow(
      'Email tidak ditemukan',
    );
  });

  it('should throw BadRequestException if password is incorrect', async () => {
    await service.register('John Doe', 'john@example.com', 'test123');
    await expect(service.login('john@example.com', 'admin')).rejects.toThrow(
      'Password tidak sesuai',
    );
  });

  it('should return the user if login is successful', async () => {
    await service.register('John Doe', 'john@example.com', 'password');
    const user = await service.login('john@example.com', 'password');
    expect(user).toBeDefined();
  });
});
