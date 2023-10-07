import { Injectable, NotFoundException } from '@nestjs/common';
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

  async findOneBy(id: number) {
    const user = await this.usersRepository.findOneBy({ id });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async update(id: number, attrs: Partial<User>) {
    const user = await this.findOneBy(id);
    Object.assign(user, attrs);
    return this.usersRepository.save(user);
  }

  async remove(id: number) {
    const user = await this.findOneBy(id);
    return this.usersRepository.remove(user);
  }
}
