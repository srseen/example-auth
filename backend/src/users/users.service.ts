import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  async create(createUserDto: Partial<User>): Promise<User> {
    const user = this.usersRepository.create(createUserDto);
    return this.usersRepository.save(user);
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { email } });
  }

  async findById(id: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { id } });
  }

  async findByGoogleId(googleId: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { googleId } });
  }

  async findByFacebookId(facebookId: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { facebookId } });
  }

  async update(id: string, updateData: Partial<User>): Promise<void> {
    await this.usersRepository.update(id, updateData);
  }

  async updatePassword(
    id: string,
    currentPassword: string,
    newPassword: string,
  ): Promise<void> {
    const user = await this.usersRepository.findOne({
      where: { id },
      select: ['id', 'password'],
    });
    if (!user || !user.password) {
      throw new UnauthorizedException('Invalid credentials');
    }
    const isValid = await bcrypt.compare(currentPassword, user.password);
    if (!isValid) {
      throw new UnauthorizedException('Invalid credentials');
    }
    const hashed = await bcrypt.hash(newPassword, 10);
    await this.usersRepository.update(id, { password: hashed });
  }

  async remove(id: string): Promise<void> {
    await this.usersRepository.delete(id);
  }
}
