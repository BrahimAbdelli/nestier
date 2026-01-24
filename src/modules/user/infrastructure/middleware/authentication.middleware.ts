import { Injectable, NestMiddleware } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IGetUserAuthInfoRequest } from '../../domain/value-objects/user-request.interface';
import { NextFunction, Response } from 'express';
import * as jwt from 'jsonwebtoken';
import { ConfigAuthModel } from '@shared/config/models/config-auth.model';
import { Logger } from '@shared/common/logger/logger.service';

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  private authConfig: ConfigAuthModel;

  constructor(private readonly configService: ConfigService, private logger: Logger) {
    this.authConfig = configService.get<ConfigAuthModel>('auth');
  }

  public use(req: IGetUserAuthInfoRequest, res: Response, next: NextFunction): Response<any, Record<string, any>> {
    const token: string = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      this.logger.warn('Authentication failed: No token provided');
      return res.status(401).json({ message: 'No token provided' });
    }
    try {
      const decoded: any = jwt.verify(token, this.authConfig.secret);
      req.user = {
        _id: decoded.id,
        username: decoded.username,
        email: decoded.email,
        roles: decoded.roles,
      };
      next();
    } catch (error: unknown) {
      this.logger.error('Invalid token', { error });
      return res.status(401).json({ message: 'Invalid token' });
    }
  }
}
