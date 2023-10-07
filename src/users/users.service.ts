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

  update() {}

  remove() {}
}
