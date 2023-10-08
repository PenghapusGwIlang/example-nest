import { BadRequestException, Injectable } from '@nestjs/common';
import { UsersService } from './users.service';
import { randomBytes, scrypt as _scrypt } from 'crypto';
import { promisify } from 'util';

const scrypt = promisify(_scrypt);
@Injectable()
export class AuthService {
  constructor(private usersService: UsersService) {}

  async register(name: string, email: string, password: string) {
    const users = await this.usersService.find(email);
    if (users.length) {
      throw new BadRequestException('Email sudah terdaftar');
    }

    const salt = randomBytes(8).toString('hex');
    const hash = (await scrypt(password, salt, 64)) as Buffer;
    const hashedPassword = salt + '.' + hash.toString('hex');

    const user = await this.usersService.create(name, email, hashedPassword);

    return user;
  }
}
