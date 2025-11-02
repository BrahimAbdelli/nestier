import { BaseRepository } from '../../../base/domain/repositories/base.repository';
import { UserEntity } from '../../infrastructure/entities/user.entity';
import { User } from '../value-objects/user';

export interface UserRepositoryInterface extends BaseRepository<UserEntity, User> {
  findByEmail(email: string): Promise<User>;
  findByUsername(username: string): Promise<User>;
  findActiveUsers(): Promise<User[]>;
}


