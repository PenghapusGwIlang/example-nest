import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private usersRepository: Repository<User>,
  ) {}

  find() {
    return this.usersRepository.find();
  }

  create(name: string, email: string, password: string) {
    const user = this.usersRepository.create({ name, email });
    return this.usersRepository.save(user);
  }

  findOneBy(id: number) {
    return this.usersRepository.findOneBy({ id });
  }

  async update(id: number, attrs: Partial<User>) {
    const user = await this.findOneBy(id);
    if (!user) throw new Error('User not found');
    Object.assign(user, attrs);
    return this.usersRepository.save(user);
  }

  async remove(id: number) {
    const user = await this.findOneBy(id);
    if (!user) throw new Error('User not found');
    return this.usersRepository.remove(user);
  }
}
