import { BaseRepository } from '../../../base/domain/repositories/base.repository';
import { User } from '../value-objects/user';

export interface UserRepositoryInterface extends BaseRepository<User> {
  findByEmail(email: string): Promise<User>;
  findByUsername(username: string): Promise<User>;
  findActiveUsers(): Promise<User[]>;
}
