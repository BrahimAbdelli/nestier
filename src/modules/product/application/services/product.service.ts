import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { REQUEST } from '@nestjs/core';
import { Logger } from '@shared/common/logger/logger.service';
import { ConfigProductModel } from '@shared/config/models/config-product.model';
import { IGetUserAuthInfoRequest } from '../../../../modules/user/domain/value-objects/user-request.interface';
import { BaseService } from '../../../base/application/services/base.service';
import { BaseRepository } from '../../../base/domain/repositories/base.repository';
import { Product } from '../../domain/value-objects/product';
import { ProductEntity } from '../../infrastructure/entities/product.entity';
import { FindExpensiveProductsUseCase } from '../use-cases/find-expensive-products.use-case';
import { FindProductsByNameUseCase } from '../use-cases/find-products-by-name.use-case';

@Injectable()
export class ProductService extends BaseService<ProductEntity, Product> {
  private readonly productConfig: ConfigProductModel;

  constructor(
    @Inject(BaseRepository) baseRepository: BaseRepository<ProductEntity, Product>,
    @Inject(REQUEST) public readonly request: IGetUserAuthInfoRequest,
    private readonly findExpensiveProductsUseCase: FindExpensiveProductsUseCase,
    private readonly findProductsByNameUseCase: FindProductsByNameUseCase,
    private readonly configService: ConfigService,
    logger: Logger,
  ) {
    super(baseRepository, request, logger);
    this.productConfig = this.configService.get<ConfigProductModel>('product');
  }

  // Enhanced create method with business logic
  public async create(domain: Product): Promise<void> {
    // Apply domain validation and business rules
    domain.validate();
    domain.applyBusinessRules(this.productConfig.restrictedWords);

    // Use the inherited create method from BaseService (which uses the use case)
    await super.create(domain);
  }

  // Enhanced update method with business logic
  public async update(domain: Product): Promise<Product> {
    // Apply domain validation and business rules
    domain.validate();
    domain.applyBusinessRules(this.productConfig.restrictedWords);

    // Use the inherited update method from BaseService
    return await super.update(domain);
  }

  // Product-specific business methods
  public async findExpensiveProducts(threshold: number = 1000): Promise<Product[]> {
    return await this.findExpensiveProductsUseCase.execute(threshold);
  }

  public findProductsByName(name: string): Promise<Product[]> {
    return this.findProductsByNameUseCase.execute(name);
  }
}
