import { HttpStatus, INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { EmailService } from '@shared/common/email/infrastructure/services/email.service';
import { Logger } from '@shared/common/logger/logger.service';
import { MockEmailService } from '@shared/common/test/mocks/mock-email.service';
import { TestAppModule } from '@shared/common/test/test-app.module';
import * as jwt from 'jsonwebtoken';
import { ObjectId } from 'mongodb';
import * as request from 'supertest';
import { DataSource, Repository } from 'typeorm';
import { DatabaseTestService } from '../../base/test/services/database-test.service';
import { UserEntity } from '../infrastructure/entities/user.entity';
import { CreateUserDto, UpdateNewPasswordDto, UpdateUserDto, UserLoginDto } from '../presentation/dtos';
import { UserTestService } from './services/user-test.service';
import { ConfigService } from '@nestjs/config';
import { ConfigAuthModel } from '@shared/config';
import { UserErrors } from '../domain/errors/user.errors';
import { BaseErrors } from '@shared/common/error-handling/domain/errors/base.errors';
import { mockUserFactory } from './mocks/user.mock';

describe('User E2E', () => {
  let userTestService: UserTestService;
  let databaseTestService: DatabaseTestService;
  let userRepository: Repository<UserEntity>;
  let app: INestApplication;
  let testToken: string;
  let configService: ConfigService;
  let logger: Logger;
  let loggerErrorSpy: jest.SpyInstance;
  let loggerWarnSpy: jest.SpyInstance;

  const nonExistentId: ObjectId = new ObjectId('645ead8b586d13a6932d46dd');
  const id: string = '65f9f7dec2cd92ee90d80fa2';

  afterAll(async () => {
    await app.close();
  });

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [TestAppModule], providers: [{
        provide: ConfigService,
        useValue: {
          get: jest.fn((key: string) => {
            const config: ConfigAuthModel = {
              'secret': 'secret-key-for-tests',
              'resetPasswordExpiration': '1h',
              'resetPasswordUrl': 'http://localhost:3000/reset-password',
              'tokenExpiration': '1h',
              'supportEmail': 'test@example.com',
            };
            return config[key];
          }),
        },
      }]
    })
      .overrideProvider(EmailService)
      .useClass(MockEmailService)
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    const dataSource: DataSource = moduleFixture.get<DataSource>(DataSource);
    logger = moduleFixture.get<Logger>(Logger);
    configService = moduleFixture.get<ConfigService>(ConfigService);

    userRepository = moduleFixture.get<Repository<UserEntity>>(getRepositoryToken(UserEntity));
    userTestService = new UserTestService(userRepository, logger);
    databaseTestService = new DatabaseTestService(dataSource, logger);

    loggerErrorSpy = jest.spyOn(logger, 'error');
    loggerWarnSpy = jest.spyOn(logger, 'warn');

    await createTestUser();
    testToken = generateTestToken();
  });

  beforeEach(async () => {
    await resetTestData();
    await setupUserTestData(4);
    loggerErrorSpy.mockClear();
    loggerWarnSpy.mockClear();
  });

  afterEach(async () => {
    await cleanupUserTestData();
  });

  describe('GET /users', () => {
    it('200 OK - should return an array of users', async () => {
      const response: request.Response = await request(app.getHttpServer())
        .get('/users')
        .set('Authorization', `Bearer ${testToken}`)
        .expect(HttpStatus.OK);

      expect(response.body).toBeInstanceOf(Array);
      expect(response.body.length).toBeGreaterThan(0);
    });

    it('401 UNAUTHORIZED - should reject request without token', async () => {
      await request(app.getHttpServer())
        .get('/users')
        .expect(HttpStatus.UNAUTHORIZED);

      expect(loggerWarnSpy).toHaveBeenCalledWith(
        'Authentication failed: No token provided'
      );
    });

    it('401 UNAUTHORIZED - should reject request with invalid token', async () => {
      await request(app.getHttpServer())
        .get('/users')
        .set('Authorization', 'Bearer invalid-token-12345')
        .expect(HttpStatus.UNAUTHORIZED);

      expect(loggerErrorSpy).toHaveBeenCalledWith(
        'Invalid token',
        expect.objectContaining({ error: expect.any(Object) })
      );
    });
  });

  describe('POST /users/signup', () => {
    it('201 CREATED - should create a new user', async () => {
      const timestamp: string = Date.now().toString();
      const createUserDto: CreateUserDto = {
        username: `testuser${timestamp}`,
        email: `testuser${timestamp}@example.com`,
        password: 'password123',
        lastname: 'TestUser',
        address: '123 Test Street',
        phone: '+1234567890',
        roles: ['user'],
        image: 'https://example.com/image.jpg',
        about: 'Test user description'
      };

      const response: request.Response = await request(app.getHttpServer())
        .post('/users/signup')
        .send(createUserDto);

      expect(response.status).toBe(HttpStatus.CREATED);

      const existingUser: UserEntity = await userRepository.findOne({
        where: { username: createUserDto.username }
      });
      expect(existingUser).toBeDefined();
      expect(existingUser._id).toBeDefined();
      expect(existingUser.username).toBe(createUserDto.username);
      expect(existingUser.email).toBe(createUserDto.email);
      expect(existingUser.lastname).toBe(createUserDto.lastname);
    });

    it('400 BAD REQUEST - should reject user with empty username', async () => {
      const createUserDto: CreateUserDto = {
        username: '',
        email: 'test@example.com',
        password: 'password123',
        lastname: 'TestUser'
      };

      const response: request.Response = await request(app.getHttpServer())
        .post('/users/signup')
        .send(createUserDto)
        .expect(HttpStatus.BAD_REQUEST);

      expect(response.body.code).toBe(UserErrors.USER_USERNAME_REQUIRED().code);
      expect(response.body.message).toBe(UserErrors.USER_USERNAME_REQUIRED().message);
    });

    it('400 BAD REQUEST - should reject user with invalid email', async () => {
      const createUserDto: CreateUserDto = {
        username: 'testuser',
        email: 'invalid-email',
        password: 'password123',
        lastname: 'TestUser'
      };

      const response: request.Response = await request(app.getHttpServer())
        .post('/users/signup')
        .send(createUserDto)
        .expect(HttpStatus.BAD_REQUEST);

      expect(response.body.code).toBe(UserErrors.USER_EMAIL_INVALID_FORMAT(createUserDto.email).code);
      expect(response.body.message).toBe(UserErrors.USER_EMAIL_INVALID_FORMAT(createUserDto.email).message);
    });

    it('400 BAD REQUEST - should reject user with short password', async () => {
      const createUserDto: CreateUserDto = {
        username: 'testuser',
        email: 'test@example.com',
        password: '123',
        lastname: 'TestUser'
      };

      const response: request.Response = await request(app.getHttpServer())
        .post('/users/signup')
        .send(createUserDto)
        .expect(HttpStatus.BAD_REQUEST);

      expect(response.body.code).toBe(UserErrors.USER_PASSWORD_TOO_SHORT().code);
      expect(response.body.message).toBe(UserErrors.USER_PASSWORD_TOO_SHORT().message);
    });

    it('400 BAD REQUEST - should reject user with short username', async () => {
      const createUserDto: CreateUserDto = {
        username: 'ab',
        email: 'test@example.com',
        password: 'password123',
        lastname: 'TestUser'
      };

      const response: request.Response = await request(app.getHttpServer())
        .post('/users/signup')
        .send(createUserDto)
        .expect(HttpStatus.BAD_REQUEST);

      expect(response.body.code).toBe(UserErrors.USER_USERNAME_INVALID_LENGTH(createUserDto.username).code);
      expect(response.body.message).toBe(UserErrors.USER_USERNAME_INVALID_LENGTH(createUserDto.username).message);
    });

    it('400 BAD REQUEST - should reject user with username too long', async () => {
      const longUsername: string = 'a'.repeat(31);
      const createUserDto: CreateUserDto = {
        username: longUsername,
        email: 'test@example.com',
        password: 'password123',
        lastname: 'TestUser'
      };

      const response: request.Response = await request(app.getHttpServer())
        .post('/users/signup')
        .send(createUserDto)
        .expect(HttpStatus.BAD_REQUEST);

      expect(response.body.code).toBe(UserErrors.USER_USERNAME_INVALID_LENGTH(createUserDto.username).code);
      expect(response.body.message).toBe(UserErrors.USER_USERNAME_INVALID_LENGTH(createUserDto.username).message);
    });

    it('400 BAD REQUEST - should reject user with username containing special characters', async () => {
      const createUserDto: CreateUserDto = {
        username: 'test@user!',
        email: 'test@example.com',
        password: 'password123',
        lastname: 'TestUser'
      };

      const response: request.Response = await request(app.getHttpServer())
        .post('/users/signup')
        .send(createUserDto)
        .expect(HttpStatus.BAD_REQUEST);

      expect(response.body.code).toBe(UserErrors.USER_USERNAME_INVALID_CHARACTERS(createUserDto.username).code);
      expect(response.body.message).toBe(UserErrors.USER_USERNAME_INVALID_CHARACTERS(createUserDto.username).message);
    });

    it('400 BAD REQUEST - should reject duplicate username', async () => {
      const timestamp: string = Date.now().toString();
      const createUserDto: CreateUserDto = {
        username: `duplicateuser${timestamp}`,
        email: `duplicateuser${timestamp}@example.com`,
        password: 'password123',
        lastname: 'DuplicateUser'
      };

      await request(app.getHttpServer())
        .post('/users/signup')
        .send(createUserDto)
        .expect(HttpStatus.CREATED);

      const duplicateCreateUserDto: CreateUserDto = {
        username: `duplicateuser${timestamp}`,
        email: `different${timestamp}@example.com`,
        password: 'password123',
        lastname: 'DuplicateUser'
      };

      const response: request.Response = await request(app.getHttpServer())
        .post('/users/signup')
        .send(duplicateCreateUserDto)
        .expect(HttpStatus.BAD_REQUEST);

      expect(response.body.code).toBe(BaseErrors.FIELD_NOT_UNIQUE('username', `duplicateuser${timestamp}`).code);
      expect(response.body.message).toBe(BaseErrors.FIELD_NOT_UNIQUE('username', `duplicateuser${timestamp}`).message);
    });

    it('400 BAD REQUEST - should reject duplicate email', async () => {
      const timestamp: string = Date.now().toString();
      const createUserDto: CreateUserDto = {
        username: `uniqueuser${timestamp}`,
        email: `duplicateemail${timestamp}@example.com`,
        password: 'password123',
        lastname: 'DuplicateEmail'
      };

      await request(app.getHttpServer())
        .post('/users/signup')
        .send(createUserDto)
        .expect(HttpStatus.CREATED);

      const duplicateEmail: CreateUserDto = {
        username: `differentuser${timestamp}`,
        email: `duplicateemail${timestamp}@example.com`,
        password: 'password123',
        lastname: 'DuplicateEmail'
      };

      const response: request.Response = await request(app.getHttpServer())
        .post('/users/signup')
        .send(duplicateEmail)
        .expect(HttpStatus.BAD_REQUEST);

      expect(response.body.code).toBe(BaseErrors.FIELD_NOT_UNIQUE('email', `duplicateemail${timestamp}@example.com`).code);
      expect(response.body.message).toBe(BaseErrors.FIELD_NOT_UNIQUE('email', `duplicateemail${timestamp}@example.com`).message);
    });
  });

  describe('GET /users/user/:id', () => {
    let createdUser: UserEntity;

    beforeEach(async () => {
      const createUserDto: CreateUserDto = {
        username: 'findtest',
        email: 'findtest@example.com',
        password: 'password123',
        lastname: 'FindTest'
      };
      createdUser = await postUser(createUserDto);
    });

    it('200 OK - should return a specific user', async () => {
      const response: request.Response = await getUserById(createdUser._id.toString())
        .expect(HttpStatus.OK);

      expect(response.body._id).toBe(createdUser._id.toString());
      expect(response.body.username).toBe(createdUser.username);
      expect(response.body.email).toBe(createdUser.email);
      expect(response.body.lastname).toBe(createdUser.lastname);
    });

    it('404 NOT FOUND - should handle non-existent user ID', async () => {
      const response: request.Response = await getUserById(nonExistentId.toString())
        .expect(HttpStatus.NOT_FOUND);

      expect(response.body.code).toBe('NOT_FOUND');
      expect(loggerErrorSpy).toHaveBeenCalledWith('Entity not found', expect.any(Object));
    });
  });

  describe('GET /users/email/:email', () => {
    let createdUser: UserEntity;

    beforeEach(async () => {
      const createUserDto: CreateUserDto = {
        username: 'emailtest',
        email: 'emailtest@example.com',
        password: 'password123',
        lastname: 'EmailTest'
      };
      createdUser = await postUser(createUserDto);
    });

    it('200 OK - should return user by email', async () => {
      const response: request.Response = await getUserByEmail(createdUser.email)
        .expect(HttpStatus.OK);

      expect(response.body.email).toBe(createdUser.email);
      expect(response.body.username).toBe(createdUser.username);
    });

    it('404 NOT FOUND - should handle non-existent email', async () => {
      await getUserByEmail('nonexistent@example.com')
        .expect(HttpStatus.NOT_FOUND);

      expect(loggerErrorSpy).toHaveBeenCalledWith(
        'User not found',
        expect.objectContaining({ email: 'nonexistent@example.com' })
      );
    });
  });

  describe('GET /users/username/:username', () => {
    let createdUser: UserEntity;

    beforeEach(async () => {
      const createUserDto: CreateUserDto = {
        username: 'usernametest',
        email: 'usernametest@example.com',
        password: 'password123',
        lastname: 'UsernameTest'
      };
      createdUser = await postUser(createUserDto);
    });

    it('200 OK - should return user by username', async () => {
      const response: request.Response = await getUserByUsername(createdUser.username)
        .expect(HttpStatus.OK);

      expect(response.body.username).toBe(createdUser.username);
      expect(response.body.email).toBe(createdUser.email);
    });

    it('404 NOT FOUND - should handle non-existent username', async () => {
      await getUserByUsername('nonexistentuser')
        .expect(HttpStatus.NOT_FOUND);

      expect(loggerErrorSpy).toHaveBeenCalledWith(
        'User not found',
        expect.objectContaining({ username: 'nonexistentuser' })
      );
    });
  });

  describe('POST /users/login', () => {
    let createdUser: UserEntity;

    beforeEach(async () => {
      const createUserDto: CreateUserDto = {
        username: 'logintest',
        email: 'logintest@example.com',
        password: 'password123',
        lastname: 'LoginTest'
      };
      createdUser = await postUser(createUserDto);
    });

    it('201 CREATED - should login with valid credentials', async () => {
      const loginUserDto: UserLoginDto = {
        email: createdUser.email,
        password: 'password123'
      };

      const response: request.Response = await request(app.getHttpServer())
        .post('/users/login')
        .send(loginUserDto)
        .expect(HttpStatus.CREATED);

      expect(response.body).toHaveProperty('token');
      expect(response.body.token).toBeDefined();
      expect(typeof response.body.token).toBe('string');
      expect(response.body).toHaveProperty('_id');
      expect(response.body).toHaveProperty('email', createdUser.email);
      expect(response.body).toHaveProperty('username', createdUser.username);
      expect(response.body).not.toHaveProperty('password');
    });

    it('404 NOT FOUND - should reject login with non-existent email', async () => {
      const loginUserDto: UserLoginDto = {
        email: 'nonexistent@example.com',
        password: 'password123'
      };

      const response: request.Response = await request(app.getHttpServer())
        .post('/users/login')
        .send(loginUserDto)
        .expect(HttpStatus.NOT_FOUND);

      expect(response.body.code).toBe(UserErrors.USER_NOT_FOUND(loginUserDto.email).code);
      expect(loggerErrorSpy).toHaveBeenCalledWith(
        'User not found',
        expect.objectContaining({ email: loginUserDto.email })
      );
    });

    it('401 UNAUTHORIZED - should reject login with invalid password', async () => {
      const loginUserDto: UserLoginDto = {
        email: createdUser.email,
        password: 'wrongpassword'
      };

      const response: request.Response = await request(app.getHttpServer())
        .post('/users/login')
        .send(loginUserDto)
        .expect(HttpStatus.UNAUTHORIZED);

      expect(response.body.code).toBe(UserErrors.USER_AUTHENTICATION_FAILED().code);
      expect(response.body.message).toBe(UserErrors.USER_AUTHENTICATION_FAILED().message);
    });

    it('404 NOT FOUND - should reject login with empty email', async () => {
      const loginUserDto: UserLoginDto = {
        email: '',
        password: 'password123'
      };

      const response: request.Response = await request(app.getHttpServer())
        .post('/users/login')
        .send(loginUserDto)
        .expect(HttpStatus.NOT_FOUND);

      expect(response.body.code).toBe(UserErrors.USER_NOT_FOUND('').code);
    });

    it('401 UNAUTHORIZED - should reject login with empty password', async () => {
      const loginUserDto: UserLoginDto = {
        email: createdUser.email,
        password: ''
      };

      const response: request.Response = await request(app.getHttpServer())
        .post('/users/login')
        .send(loginUserDto)
        .expect(HttpStatus.UNAUTHORIZED);

      expect(response.body.code).toBe(UserErrors.USER_AUTHENTICATION_FAILED().code);
      expect(response.body.message).toBe(UserErrors.USER_AUTHENTICATION_FAILED().message);
    });
  });

  describe('PUT /users/user/:id', () => {
    let createdUser: UserEntity;

    beforeEach(async () => {
      const createUserDto: CreateUserDto = {
        username: 'updatetest',
        email: 'updatetest@example.com',
        password: 'password123',
        lastname: 'UpdateTest'
      };
      createdUser = await postUser(createUserDto);
    });

    it('200 OK - should update an existing user', async () => {
      const updateUserDto: UpdateUserDto = {
        lastname: 'Updated Lastname',
        address: 'Updated Address',
        phone: '+1234567890',
        about: 'Updated about information',
        username: createdUser.username,
        email: createdUser.email,
        password: 'password123'
      };

      const response: request.Response = await updateUser(createdUser._id.toString(), updateUserDto)
        .expect(HttpStatus.OK);
      expect(response.body.lastname).toBe(updateUserDto.lastname);
      expect(response.body.address).toBe(updateUserDto.address);
      expect(response.body.phone).toBe(updateUserDto.phone);
      expect(response.body.about).toBe(updateUserDto.about);
    });

    it('200 OK - should handle partial updates', async () => {
      const updateUserDto: UpdateUserDto = {
        lastname: 'Partially Updated',
        username: createdUser.username,
        email: createdUser.email,
        password: 'password123'
      };

      const response: request.Response = await updateUser(createdUser._id.toString(), updateUserDto)
        .expect(HttpStatus.OK);

      expect(response.body).toHaveProperty('_id');
      expect(response.body).toHaveProperty('username', createdUser.username);
      expect(response.body).toHaveProperty('email', createdUser.email);
      expect(response.body).toHaveProperty('lastname', updateUserDto.lastname);
      expect(response.body).not.toHaveProperty('password');

      const updatedEntity: UserEntity = await userRepository.findOne({
        where: { _id: new ObjectId(createdUser._id.toString()) }
      });
      expect(updatedEntity?.email).toBe(createdUser.email);
      expect(updatedEntity?.username).toBe(createdUser.username);
    });

    it('404 NOT FOUND - should handle updating non-existent user', async () => {
      const updateUserDto: UpdateUserDto = {
        lastname: 'Updated',
        username: 'test',
        email: 'test@example.com',
        password: 'password123'
      };

      const response: request.Response = await updateUser(nonExistentId.toString(), updateUserDto)
        .expect(HttpStatus.NOT_FOUND);

      expect(response.body.message).toContain('Entity not found');
    });
  });

  describe('PATCH /users/archive/:id', () => {
    it('200 OK - should archive a user', async () => {
      const createdUser: UserEntity = await createTestUserEntity({
        username: `archivetest${Date.now()}`,
        email: `archivetest${Date.now()}@example.com`
      });
      const archiveId: string = createdUser._id.toString();

      await archiveUser(archiveId)
        .expect(HttpStatus.OK);

      const archivedUser: UserEntity = await userRepository.findOne({
        where: { _id: new ObjectId(archiveId) }
      });
      expect(archivedUser?.isDeleted).toBe(true);
    });

    it('404 NOT FOUND - should handle archiving non-existent user', async () => {
      await archiveUser(nonExistentId.toString())
        .expect(HttpStatus.NOT_FOUND);

      expect(loggerErrorSpy).toHaveBeenCalledWith(
        'User not found',
        expect.objectContaining({ id: nonExistentId })
      );
    });
  });

  describe('PATCH /users/unarchive/:id', () => {
    it('200 OK - should unarchive a user', async () => {
      const createdUser: UserEntity = await createTestUserEntity({
        username: `unarchivetest${Date.now()}`,
        email: `unarchivetest${Date.now()}@example.com`
      });
      const unarchiveId: string = createdUser._id.toString();

      await archiveUser(unarchiveId)
        .expect(HttpStatus.OK);

      const archivedUser: UserEntity = await userRepository.findOne({
        where: { _id: new ObjectId(unarchiveId) }
      });
      expect(archivedUser?.isDeleted).toBe(true);

      await unarchiveUser(unarchiveId)
        .expect(HttpStatus.OK);

      const unarchivedUser: UserEntity = await userRepository.findOne({
        where: { _id: new ObjectId(unarchiveId) }
      });
      expect(unarchivedUser?.isDeleted).toBe(false);
    });

    it('404 NOT FOUND - should handle unarchiving non-existent user', async () => {
      await unarchiveUser(nonExistentId.toString())
        .expect(HttpStatus.NOT_FOUND);

      expect(loggerErrorSpy).toHaveBeenCalledWith(
        'User not found',
        expect.objectContaining({ id: nonExistentId })
      );
    });
  });

  describe('POST /users/forgot-password/:email', () => {
    let createdUser: UserEntity;
    let testCounter: number = 0;

    beforeEach(async () => {
      testCounter++;
      const uniqueId: string = `${testCounter}${Math.random().toString(36).substring(2, 8)}`;
      const createUserDto: CreateUserDto = {
        username: `fptest${uniqueId}`,
        email: `fptest${uniqueId}@example.com`,
        password: 'password123',
        lastname: 'ForgotPasswordTest'
      };

      await request(app.getHttpServer())
        .post('/users/signup')
        .send(createUserDto)
        .expect(HttpStatus.CREATED);

      createdUser = await userRepository.findOne({
        where: { username: createUserDto.username }
      });
    });

    afterEach(async () => {
      await userTestService.clearUsers();
    });

    it('201 CREATED - should send password reset email', async () => {
      const response: request.Response = await request(app.getHttpServer())
        .post(`/users/forgot-password/${createdUser.email}`)
        .expect(HttpStatus.CREATED);

      expect(response.body).toHaveProperty('resetPasswordToken');
    });

    it('404 NOT FOUND - should handle non-existent email', async () => {
      await request(app.getHttpServer())
        .post('/users/forgot-password/nonexistent@example.com')
        .expect(HttpStatus.NOT_FOUND);

      expect(loggerErrorSpy).toHaveBeenCalledWith(
        'User not found',
        expect.objectContaining({ email: 'nonexistent@example.com' })
      );
    });
  });

  describe('POST /users/reset-password', () => {
    let createdUser: UserEntity;
    let resetToken: string;
    let testCounter: number = 0;

    beforeEach(async () => {
      testCounter++;
      const uniqueId: string = `${testCounter}${Math.random().toString(36).substring(2, 8)}`;
      const userData: CreateUserDto = {
        username: `rptest${uniqueId}`,
        email: `rptest${uniqueId}@example.com`,
        password: 'oldpassword123',
        lastname: 'ResetPasswordTest'
      };

      await request(app.getHttpServer())
        .post('/users/signup')
        .send(userData)
        .expect(HttpStatus.CREATED);

      createdUser = await userRepository.findOne({
        where: { username: userData.username }
      });

      const forgotPasswordResponse: request.Response = await request(app.getHttpServer())
        .post(`/users/forgot-password/${createdUser.email}`);
      resetToken = forgotPasswordResponse.body.resetPasswordToken;
    });

    afterEach(async () => {
      await userTestService.clearUsers();
    });

    it('201 CREATED - should reset password with valid token', async () => {
      const updateNewPasswordDto: UpdateNewPasswordDto = {
        token: resetToken,
        password: 'newpassword123'
      };

      const response: request.Response = await request(app.getHttpServer())
        .post('/users/reset-password')
        .send(updateNewPasswordDto)
        .expect(HttpStatus.CREATED);

      expect(response.body).toHaveProperty('_id');
      expect(response.body._id).toBeDefined();
      expect(response.body).toHaveProperty('username', createdUser.username);
      expect(response.body).toHaveProperty('email', createdUser.email);
      expect(response.body).not.toHaveProperty('password');

      const loginUserDto: UserLoginDto = {
        email: createdUser.email,
        password: 'newpassword123'
      };

      const loginResponse: request.Response = await request(app.getHttpServer())
        .post('/users/login')
        .send(loginUserDto);

      expect(loginResponse.status).toBe(HttpStatus.CREATED);
      expect(loginResponse.body).toHaveProperty('token');
      expect(loginResponse.body.token).toBeDefined();
      expect(typeof loginResponse.body.token).toBe('string');
    });

    it('401 UNAUTHORIZED - should reject invalid reset token', async () => {
      const updateNewPasswordDto: UpdateNewPasswordDto = {
        token: 'invalid-token-12345',
        password: 'newpassword123'
      };

      const response: request.Response = await request(app.getHttpServer())
        .post('/users/reset-password')
        .send(updateNewPasswordDto)
        .expect(HttpStatus.UNAUTHORIZED);

      expect(response.body.code).toBeDefined();
      expect(loggerErrorSpy).toHaveBeenCalledWith(
        'Error updating new password',
        expect.objectContaining({ error: expect.any(Object) })
      );
    });

    it('401 UNAUTHORIZED - should reject expired reset token', async () => {
      const secret: string = configService.get<string>('secret');
      const expiredToken: string = jwt.sign(
        {
          email: createdUser.email,
          username: createdUser.username
        },
        secret,
        { expiresIn: '-1s' }
      );

      const updateNewPasswordDto: UpdateNewPasswordDto = {
        token: expiredToken,
        password: 'newpassword123'
      };

      const response: request.Response = await request(app.getHttpServer())
        .post('/users/reset-password')
        .send(updateNewPasswordDto)
        .expect(HttpStatus.UNAUTHORIZED);

      expect(response.body.code).toBeDefined();
      expect(loggerErrorSpy).toHaveBeenCalledWith(
        'Error updating new password',
        expect.objectContaining({ error: expect.any(Object) })
      );
    });
  });

  async function createTestUser(): Promise<void> {
    const existingUser: UserEntity = await userRepository.findOne({ where: { email: 'test@maildrop.com' } });
    if (!existingUser) {
      const existingUser: UserEntity = new UserEntity({
        _id: id,
        username: 'test',
        email: 'test@maildrop.com',
        password: 'testpassword',
        lastname: 'Test',
        address: 'Test Address',
        phone: '123456789',
        roles: ['user'],
        image: '',
        about: 'Test user for e2e tests',
        isDeleted: false
      });
      await userRepository.save(existingUser);
    }
  }

  function generateTestToken(): string {
    const payload: any = {
      id: id,
      username: 'test',
      email: 'test@maildrop.com',
      roles: ['admin']
    };
    const secret: string = configService.get<string>('auth.secret');
    return jwt.sign(payload, secret, { expiresIn: '1h' });
  }

  async function resetTestData(): Promise<void> {
    try {
      await userTestService.clearUsers();
      await createTestUser();
    } catch (error: unknown) {
      logger.error('Error resetting test data:', { error });
    }
  }

  async function setupUserTestData(count: number = 4): Promise<void> {
    await userTestService.clearUsers();
    await userTestService.insertTestUsers(count);
  }

  async function cleanupUserTestData(): Promise<void> {
    await userTestService.cleanupAfterTest();
  }

  async function createTestUserEntity(overrides: Partial<CreateUserDto> = {}): Promise<UserEntity> {
    const mockUser: CreateUserDto = mockUserFactory({
      username: `testuser${Date.now()}`,
      email: `testuser${Date.now()}@example.com`,
      ...overrides
    });

    const userEntity: UserEntity = new UserEntity({});
    userEntity._id = new ObjectId();
    userEntity.username = mockUser.username;
    userEntity.email = mockUser.email;
    userEntity.password = mockUser.password;
    userEntity.lastname = mockUser.lastname;
    userEntity.address = mockUser.address;
    userEntity.phone = mockUser.phone;
    userEntity.roles = mockUser.roles;
    userEntity.image = mockUser.image || '';
    userEntity.status = true;
    userEntity.about = mockUser.about || '';
    userEntity.isDeleted = false;
    userEntity.userCreated = new ObjectId(id);
    userEntity.userUpdated = new ObjectId(id);

    return await userRepository.save(userEntity);
  }

  async function postUser(userData: CreateUserDto): Promise<UserEntity> {
    const timestamp: string = Date.now().toString();
    const uniqueUserData: CreateUserDto = {
      ...userData,
      username: `${userData.username}${timestamp}`,
      email: userData.email.includes('@') ? userData.email.replace('@', `${timestamp}@`) : `${userData.email}${timestamp}@example.com`
    };

    await request(app.getHttpServer())
      .post('/users/signup')
      .send(uniqueUserData)
      .expect(HttpStatus.CREATED);

    const createdUser: UserEntity = await userRepository.findOne({
      where: { username: uniqueUserData.username }
    });
    expect(createdUser).toBeDefined();
    return createdUser;
  }

  function getUserById(id: string) {
    return request(app.getHttpServer())
      .get(`/users/user/${id}`)
      .set('Authorization', `Bearer ${testToken}`);
  }

  function getUserByEmail(email: string) {
    return request(app.getHttpServer())
      .get(`/users/email/${email}`)
      .set('Authorization', `Bearer ${testToken}`);
  }

  function getUserByUsername(username: string) {
    return request(app.getHttpServer())
      .get(`/users/username/${username}`)
      .set('Authorization', `Bearer ${testToken}`);
  }

  function updateUser(id: string, updateUserDto: UpdateUserDto) {
    return request(app.getHttpServer())
      .put(`/users/user/${id}`)
      .set('Authorization', `Bearer ${testToken}`)
      .send(updateUserDto);
  }

  function archiveUser(id: string) {
    return request(app.getHttpServer())
      .patch(`/users/archive/${id}`)
      .set('Authorization', `Bearer ${testToken}`);
  }

  function unarchiveUser(id: string) {
    return request(app.getHttpServer())
      .patch(`/users/unarchive/${id}`)
      .set('Authorization', `Bearer ${testToken}`);
  }

});
