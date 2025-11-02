import { Injectable } from '@nestjs/common';
import { Logger } from '@shared/common/logger/logger.service';
import { Repository } from 'typeorm';
import { UserEntity } from '../../infrastructure/entities/user.entity';
import { CreateUserDto } from '../../presentation/dtos/create-user.dto';
import { UserTestInterface } from '../interfaces/user-test.interface';
import { mockUserArrayFactory, mockUserFactory } from '../mocks/user.mock';
import { ObjectId } from 'mongodb';
// Note: In real implementation, password should be hashed
// For testing purposes, we'll use plain text passwords

@Injectable()
export class UserTestService implements UserTestInterface {
  private testUsers: UserEntity[] = [];

  constructor(
    private readonly userRepository: Repository<UserEntity>,
    private readonly logger: Logger,
  ) { }

  async clearUsers(): Promise<void> {
    try {
      await this.userRepository.clear();
      this.logger.log('Users collection cleared successfully');
    } catch (error: any) {
      if ((error.name === 'MongoError' || error.name === 'MongoServerError') && error.code === 26) {
        this.logger.logQueryError('Collection does not exist. Unable to clear.', error.message);
        return;
      }
      this.logger.logQueryError('An error occurred:', error.toString());
    }
  }

  async insertTestUsers(count: number): Promise<void> {
    const createUserDtos: CreateUserDto[] = mockUserArrayFactory(count);

    const users: UserEntity[] = createUserDtos.map((dto: CreateUserDto) => {
      const entity: UserEntity = new UserEntity({});
      entity.username = dto.username;
      entity.email = dto.email;
      entity.password = dto.password; // In real implementation, this should be hashed
      entity.lastname = dto.lastname;
      entity.address = dto.address;
      entity.phone = dto.phone;
      entity.roles = dto.roles || ['user'];
      entity.image = dto.image;
      entity.about = dto.about;
      entity.isDeleted = false;
      entity.userCreated = new ObjectId('65f9f7dec2cd92ee90d80fa2');
      entity.userUpdated = new ObjectId('65f9f7dec2cd92ee90d80fa2');
      return entity;
    });

    try {
      const savedUsers: UserEntity[] = await this.userRepository.save(users);
      this.testUsers = savedUsers;
      this.logger.logQuery(`${savedUsers.length} test users inserted successfully`);
    } catch (error: unknown) {
      this.logger.logQueryError('Failed to insert test users:', (error as Error).message);
      throw error;
    }
  }

  public getTestUsers(): Promise<UserEntity[]> {
    return this.userRepository.find();
  }

  public generateTestUser(overrides?: Partial<CreateUserDto>): CreateUserDto {
    return mockUserFactory(overrides);
  }

  public generateTestUsers(count: number, overrides?: Partial<CreateUserDto>): CreateUserDto[] {
    return mockUserArrayFactory(count, overrides);
  }

  public async cleanupAfterTest(): Promise<void> {
    if (this.testUsers.length > 0) {
      try {
        await this.userRepository.remove(this.testUsers);
        this.logger.logQuery('Test users cleaned up successfully');
        this.testUsers = [];
      } catch (error: unknown) {
        this.logger.logQueryError('Failed to cleanup test users:', error.toString());
      }
    }
  }
}
