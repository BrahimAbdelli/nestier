import { Inject, Injectable } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { Logger } from '@shared/common/logger/logger.service';
import { IGetUserAuthInfoRequest } from '../../../../modules/user/domain/value-objects/user-request.interface';
import { BaseService } from '../../../base/application/services/base.service';
import { BaseRepository } from '../../../base/domain/repositories/base.repository';
import { Category } from '../../domain/value-objects/category';

@Injectable()
export class CategoryService extends BaseService<Category> {
  constructor(
    @Inject(BaseRepository) baseRepository: BaseRepository<Category>,
    @Inject(REQUEST) public readonly request: IGetUserAuthInfoRequest,
    logger: Logger,
  ) {
    super(baseRepository, request, logger);
  }

  // Enhanced create method with business logic
  public async create(domain: Category): Promise<void> {
    // Apply domain validation and business rules
    domain.validate();
    domain.applyBusinessRules();

    // Use the inherited create method from BaseService
    await super.create(domain);
  }

  // Enhanced update method with business logic
  public async update(domain: Category): Promise<Category> {
    // Apply domain validation and business rules
    domain.validate();
    domain.applyBusinessRules();

    // Use the inherited update method from BaseService
    return await super.update(domain);
  }
}
