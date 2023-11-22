import { User } from 'src/users/entities/user.entity';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class ApiKey {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  key: string;

  @Column()
  uuid: string;

  @ManyToOne(() => User, (user) => user.apiKeys)
  user: User;

  // @Column()
  // scopes: Scope[]
}
