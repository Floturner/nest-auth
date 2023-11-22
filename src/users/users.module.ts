import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ApiKey } from './api-keys/entities/api-key.entity/api-key.entity';
import { User } from './entities/user.entity';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

@Module({
  imports: [TypeOrmModule.forFeature([User, ApiKey])],
  controllers: [UsersController],
  providers: [UsersService],
})
export class UsersModule {}
