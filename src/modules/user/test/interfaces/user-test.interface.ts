import { UserEntity } from '../../infrastructure/entities/user.entity';
import { CreateUserDto } from '../../presentation/dtos/create-user.dto';

export interface UserTestInterface {
  // Database operations
  clearUsers(): Promise<void>;
  insertTestUsers(count: number): Promise<void>;
  getTestUsers(): Promise<UserEntity[]>;

  // Test data generation
  generateTestUser(overrides?: Partial<CreateUserDto>): CreateUserDto;
  generateTestUsers(count: number, overrides?: Partial<CreateUserDto>): CreateUserDto[];

  // Cleanup operations
  cleanupAfterTest(): Promise<void>;
}

