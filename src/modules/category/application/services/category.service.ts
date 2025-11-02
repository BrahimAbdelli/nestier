import { Inject, Injectable } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { Logger } from '@shared/common/logger/logger.service';
import { IGetUserAuthInfoRequest } from '../../../../modules/user/domain/value-objects/user-request.interface';
import { BaseService } from '../../../base/application/services/base.service';
import { BASE_REPOSITORY, BaseRepository } from '../../../base/domain/repositories/base.repository';
import { Category } from '../../domain/value-objects/category';
import { CategoryEntity } from '../../infrastructure/entities/category.entity';

@Injectable()
export class CategoryService extends BaseService<CategoryEntity, Category> {
  constructor(
    @Inject(BASE_REPOSITORY) baseRepository: BaseRepository<CategoryEntity, Category>,
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
  public update(domain: Category): Promise<Category> {
    // Apply domain validation and business rules
    domain.validate();
    domain.applyBusinessRules();

    // Use the inherited update method from BaseService
    return super.update(domain);
  }
}
