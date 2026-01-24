import { Injectable, Inject } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { IGetUserAuthInfoRequest } from '../../domain/value-objects/user-request.interface';
import { ConfigAuthModel } from '@shared/config/models/config-auth.model';
import { UserResetPasswordRequestContext } from '../../domain/value-objects/user-reset-password-request-context';

@Injectable()
export class UserResetPasswordRequestContextService {
  private authConfig: ConfigAuthModel;

  constructor(
    @Inject(REQUEST) private readonly request: IGetUserAuthInfoRequest,
    private readonly configService: ConfigService,
  ) {
    this.authConfig = configService.get<ConfigAuthModel>('auth');
  }

  public getRequestContext(resetToken?: string): UserResetPasswordRequestContext {
    return UserResetPasswordRequestContext.create()
      .withBrowserName(this.request.headers['user-agent'] ?? 'Unknown Device')
      .withIp(this.request.ip ?? 'Unknown IP')
      .withActionUrl(resetToken ? this.authConfig.resetPasswordUrl + resetToken : '')
      .withSupportEmail(this.authConfig.supportEmail)
      .withResetPasswordExpiration(this.authConfig.resetPasswordExpiration || '24h')
      .build();
  }
}
