import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/users/entities/user.entity';
import { Repository } from 'typeorm';
import { HashingService } from '../hashing/hashing.service';
import { SignInDto } from './dto/sign-in.dto';

@Injectable()
export class SessionAuthService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    private readonly hashingService: HashingService
  ) {}

  async singIn(signInDto: SignInDto) {
    const user = await this.usersRepository.findOneBy({
      email: signInDto.email,
    });
    if (!user) {
      throw new UnauthorizedException('User does not exist');
    }
    const matchPassword = await this.hashingService.compare(
      signInDto.password,
      user.password
    );
    if (!matchPassword) {
      throw new UnauthorizedException('Password does not match');
    }
    return user;
  }
}
