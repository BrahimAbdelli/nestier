import { Inject, Injectable, Scope } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { REQUEST } from '@nestjs/core';
import { InjectRepository } from '@nestjs/typeorm';
import { SendPasswordResetEmailUseCase, SendPasswordResetEmailRequest } from '../use-cases/send-password-reset-email.use-case';
import { ApplicationException } from '@shared/common/error-handling/domain/exceptions/application.exception';
import { Logger } from '@shared/common/logger/logger.service';
import { findByField } from '@shared/common/utils/find-by-field.utils';
import { isFieldUnique } from '@shared/common/utils/is-field-unique.utils';
import * as jwt from 'jsonwebtoken';
import { ObjectId } from 'mongodb';
import { createHmac } from 'node:crypto';
import { IGetUserAuthInfoRequest } from '../../domain/value-objects/user-request.interface';
import { Repository } from 'typeorm';
import { BaseService } from '../../../../modules/base/application/services/base.service';
import { ConfigAuthModel } from '@shared/config/models/config-auth.model';
import { UserErrors } from '../../domain/errors/user.errors';
import { USER_REPOSITORY, UserRepository } from '../../domain/repositories/user.repository';
import { User } from '../../domain/value-objects/user';
import { UserLogin } from '../../domain/value-objects/user-login';
import { UserResetPasswordRequestContext } from '../../domain/value-objects/user-reset-password-request-context';
import { UserUpdatePassword } from '../../domain/value-objects/user-update-password';
import { UserEntity } from '../../infrastructure/entities/user.entity';
import { UserResetPasswordRequestContextService } from './user-reset-password-request-context.service';

@Injectable({ scope: Scope.REQUEST })
export class UserService extends BaseService<UserEntity, User> {
  private authConfig: ConfigAuthModel;

  constructor(
    @Inject(USER_REPOSITORY) private readonly userRepository: UserRepository,
    @InjectRepository(UserEntity) private readonly userEntityRepository: Repository<UserEntity>,
    @Inject(REQUEST) public readonly request: IGetUserAuthInfoRequest,
    private readonly configService: ConfigService,
    private readonly sendPasswordResetEmailUseCase: SendPasswordResetEmailUseCase,
    private readonly userResetPasswordRequestContextService: UserResetPasswordRequestContextService,
    logger: Logger,
  ) {
    super(userRepository, request, logger);
    this.authConfig = configService.get<ConfigAuthModel>('auth');
  }

  // Enhanced create method with business logic
  public async create(domain: User): Promise<void> {
    // Apply domain validation and business rules
    domain.validate();
    domain.applyBusinessRules();
    await this.checkIfUsernameAndEmailAreUnique(domain);

    await super.create(domain);
  }

  // Enhanced update method with business logic
  public async update(domain: User): Promise<User> {
    // Apply domain validation and business rules
    domain.validate();
    domain.applyBusinessRules();
    await this.checkIfUsernameAndEmailAreUniqueAndIfUserExists(domain);
    return super.update(domain);
  }

  public findAll(): Promise<User[]> {
    return this.userRepository.findActiveUsers();
  }

  public async login(loginUser: UserLogin): Promise<User> {
    const connectedUser: User = await this.loginAndPasswordManagement(loginUser);
    const token: string = await this.generateJWT(connectedUser);
    connectedUser.token = token;
    return connectedUser;
  }

  private async loginAndPasswordManagement(loginUser: UserLogin): Promise<User> {
    let user: User = await this.findByEmail(loginUser.email);

    const hashedPassword: string = createHmac('sha256', loginUser.password).digest('hex');
    user.validateLogin(hashedPassword);

    if (user.resetPasswordToken) {
      user.resetPasswordToken = undefined;
      user = await this.userRepository.save(user);
    }

    delete user.password;
    return user;
  }

  public async forgotPassword(email: string): Promise<User> {
    const user: User = await this.findByEmail(email);
    const resetPasswordToken: string = this.generateResetPasswordJWT(user);
    user.resetPasswordToken = resetPasswordToken;
    await this.userRepository.save(user);

    await this.sendPasswordResetEmail(user);
    return user;
  }

  public async updateNewPassword(updateNewPassword: UserUpdatePassword): Promise<User> {
    try {
      const { email, username } = jwt.verify(updateNewPassword.token, this.authConfig.secret);
      const user: User = await this.findByEmail(email);
      this.validateResetPasswordToken(user, email, username, updateNewPassword.token);
      user.password = updateNewPassword.password;
      user.resetPasswordToken = undefined;

      await this.userRepository.save(user);
      return user;
    } catch (error: unknown) {
      this.logger.error('Error updating new password', { error });
      if ((error as Error).name === 'TokenExpiredError') {
        throw new ApplicationException(UserErrors.USER_RESET_TOKEN_EXPIRED());
      }
      throw new ApplicationException(UserErrors.USER_INVALID_RESET_TOKEN());
    }
  }

  private validateResetPasswordToken(user: User, email: string, username: string, token: string): void {
    if (user.email !== email || user.username !== username || user.resetPasswordToken !== token) {
      throw new ApplicationException(UserErrors.USER_INVALID_RESET_TOKEN());
    }
  }


  public async archive(id: ObjectId): Promise<void> {
    const user: User = await this.userRepository.findOneById(id);
    if (!user) {
      this.logger.error('User not found', { id });
      throw new ApplicationException(UserErrors.USER_NOT_FOUND(id.toString()));
    }

    user.status = false;
    user.isDeleted = true;
    if (this.request.user) {
      user.userUpdated = this.request.user._id;
    }
    await this.userRepository.save(user);
  }

  public async unarchive(id: ObjectId): Promise<void> {
    const user: User = await this.userRepository.findOneById(id);
    if (!user) {
      this.logger.error('User not found', { id });
      throw new ApplicationException(UserErrors.USER_NOT_FOUND(id.toString()));
    }

    user.status = true;
    user.isDeleted = false;
    if (this.request.user) {
      user.userUpdated = this.request.user._id;
    }
    await this.userRepository.save(user);
  }

  public async findByEmail(email: string): Promise<User> {
    const user: User = await this.userRepository.findByEmail(email);
    if (!user) {
      this.logger.error('User not found', { email });
      throw new ApplicationException(UserErrors.USER_NOT_FOUND(email));
    }
    return user;
  }

  public async findByUsername(username: string): Promise<User> {
    const user: User = await this.userRepository.findByUsername(username);
    if (!user) {
      this.logger.error('User not found', { username });
      throw new ApplicationException(UserErrors.USER_NOT_FOUND(username));
    }
    return user;
  }

  private async checkIfUsernameAndEmailAreUnique(domain: User): Promise<void> {
    await isFieldUnique(this.userEntityRepository, { username: domain.username });
    await isFieldUnique(this.userEntityRepository, { email: domain.email });
  }

  private async checkIfUsernameAndEmailAreUniqueAndIfUserExists(domain: User): Promise<void> {
    await findByField(this.userEntityRepository, { id: domain._id.toString() }, true);
    await isFieldUnique(this.userEntityRepository, { username: domain.username }, domain._id.toString());
    await isFieldUnique(this.userEntityRepository, { email: domain.email }, domain._id.toString());
  }

  private generateJWT(user: User): Promise<string> {
    return jwt.sign(
      {
        id: user._id,
        username: user.username,
        email: user.email,
        roles: user.roles,
      },
      this.authConfig.secret,
      { expiresIn: this.authConfig.tokenExpiration || '15d' }
    );
  }

  private generateResetPasswordJWT(user: User): string {
    return jwt.sign(
      {
        email: user.email,
        username: user.username,
      },
      this.authConfig.secret,
      { expiresIn: this.authConfig.resetPasswordExpiration || '24h' }
    );
  }

  private async sendPasswordResetEmail(user: User): Promise<void> {
    const context: UserResetPasswordRequestContext = this.userResetPasswordRequestContextService.getRequestContext(user.resetPasswordToken);

    const request: SendPasswordResetEmailRequest = SendPasswordResetEmailRequest.create()
      .withUser(user)
      .withResetToken(user.resetPasswordToken)
      .withContext(context)
      .build();

    await this.sendPasswordResetEmailUseCase.execute(request);
  }
}
