import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { User } from '../users/user.entity';

describe('AuthService', () => {
  let service: AuthService;
  let fakeUsersService: Partial<UsersService>;

  beforeEach(async () => {
    fakeUsersService = {
      find: () => Promise.resolve([]),
      create: (name: string, email: string, password: string) => {
        return Promise.resolve({ id: 1, name, email, password } as User);
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
    fakeUsersService.find = () => {
      return Promise.resolve([
        {
          id: 1,
          name: 'John Doe',
          email: 'john@example.com',
          password: 'password',
        } as User,
      ]);
    };
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
    fakeUsersService.find = () => {
      return Promise.resolve([
        {
          id: 1,
          name: 'John Doe',
          email: 'john@example.com',
          password: 'password',
        } as User,
      ]);
    };

    await expect(service.login('john@example.com', 'admin')).rejects.toThrow(
      'Password tidak sesuai',
    );
  });

  it('should return the user if login is successful', async () => {
    fakeUsersService.find = () => {
      return Promise.resolve([
        {
          id: 1,
          name: 'John Doe',
          email: 'john@example.com',
          password:
            '641e1ff187354521.a6fee14302692611501f0a726d4546bc8dddcff7516c3413f3ccd2151bba551186414fda276a840632b141de2cd72ccc4a95d7cbbc9415af36c8150f8962de0c',
        } as User,
      ]);
    };

    const user = await service.login('john@example.com', 'password');
    expect(user).toBeDefined();
  });
});
