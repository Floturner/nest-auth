import { Module } from '@nestjs/common';
import { ConfigModule, ConfigType } from '@nestjs/config';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { CoffeesModule } from './coffees/coffees.module';
import databaseConfig from './config/database.config';
import { IamModule } from './iam/iam.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [databaseConfig],
    }),
    TypeOrmModule.forRootAsync({
      inject: [databaseConfig.KEY],
      useFactory: (dbConfig: ConfigType<typeof databaseConfig>) =>
        dbConfig as TypeOrmModuleOptions,
    }),
    CoffeesModule,
    UsersModule,
    IamModule,
  ],
})
export class AppModule {}
