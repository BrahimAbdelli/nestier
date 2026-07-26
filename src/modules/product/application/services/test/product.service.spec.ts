import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { REQUEST } from '@nestjs/core';
import { ObjectId } from 'mongodb';
import { IGetUserAuthInfoRequest } from '../../../../user/domain/value-objects/user-request.interface';
import { ProductService } from '../product.service';
import { BaseRepository } from '../../../../base/domain/repositories/base.repository';
import { Product } from '../../../domain/value-objects/product';
import { FindExpensiveProductsUseCase } from '../../use-cases/find-expensive-products.use-case';
import { FindProductsByNameUseCase } from '../../use-cases/find-products-by-name.use-case';
import { Logger } from '@shared/common/logger/logger.service';
import { ConfigProductModel } from '@shared/config/models/config-product.model';

describe('ProductService', () => {
  let service: ProductService;
  let mockRepository: jest.Mocked<BaseRepository<Product>>;
  let mockLogger: jest.Mocked<Logger>;
  let mockConfigService: jest.Mocked<ConfigService>;
  let mockFindExpensiveUseCase: jest.Mocked<FindExpensiveProductsUseCase>;
  let mockFindByNameUseCase: jest.Mocked<FindProductsByNameUseCase>;
  let mockRequest: IGetUserAuthInfoRequest;

  const testId: ObjectId = new ObjectId();
  const testProduct: Product = {
    _id: testId,
    name: 'Test Product',
    price: 100,
    description: 'Test Product Description',
    isDeleted: false,
    createdAt: new Date(),
    updatedAt: new Date(),
    validate: jest.fn(),
    applyBusinessRules: jest.fn(),
  } as Product;

  const expensiveProduct: Product = {
    ...testProduct,
    _id: new ObjectId(),
    name: 'Expensive Product',
    price: 5000,
  } as Product;

  beforeEach(async () => {
    mockRepository = {
      findAll: jest.fn(),
      findOneById: jest.fn(),
      findAndCount: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      delete: jest.fn(),
      clear: jest.fn(),
    } as jest.Mocked<BaseRepository<Product>>;

    mockLogger = {
      log: jest.fn(),
      error: jest.fn(),
      warn: jest.fn(),
      debug: jest.fn(),
      logQueryError: jest.fn(),
    } as unknown as jest.Mocked<Logger>;

    mockConfigService = {
      get: jest.fn((key: string) => {
        if (key === 'product') {
          const config: ConfigProductModel = {
            restrictedWords: ['replica', 'knockoff', 'counterfeit', 'imitation'],
          };
          return config;
        }
        return null;
      }),
    } as unknown as jest.Mocked<ConfigService>;

    mockFindExpensiveUseCase = {
      execute: jest.fn(),
    } as unknown as jest.Mocked<FindExpensiveProductsUseCase>;

    mockFindByNameUseCase = {
      execute: jest.fn(),
    } as unknown as jest.Mocked<FindProductsByNameUseCase>;

    mockRequest = {
      user: {
        _id: new ObjectId(),
        username: 'testuser',
        email: 'test@example.com',
      },
    } as IGetUserAuthInfoRequest;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductService,
        { provide: BaseRepository, useValue: mockRepository },
        { provide: REQUEST, useValue: mockRequest },
        { provide: FindExpensiveProductsUseCase, useValue: mockFindExpensiveUseCase },
        { provide: FindProductsByNameUseCase, useValue: mockFindByNameUseCase },
        { provide: ConfigService, useValue: mockConfigService },
        { provide: Logger, useValue: mockLogger },
      ],
    }).compile();

    service = await module.resolve<ProductService>(ProductService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return all products from repository', async () => {
      const products: Product[] = [testProduct];
      mockRepository.findAll.mockResolvedValue(products);

      const result: Product[] = await service.findAll();

      expect(result).toEqual(products);
      expect(mockRepository.findAll).toHaveBeenCalled();
    });
  });

  describe('create', () => {
    it('should create a product', async () => {
      const newProduct: Product = {
        name: 'New Product',
        price: 50,
        description: 'New Product Description',
        validate: jest.fn(),
        applyBusinessRules: jest.fn(),
      };
      mockRepository.create.mockResolvedValue();

      await service.create(newProduct);

      expect(newProduct.validate).toHaveBeenCalled();
      expect(newProduct.applyBusinessRules).toHaveBeenCalled();
      expect(mockRepository.create).toHaveBeenCalledWith(newProduct);
    });
  });

  describe('update', () => {
    it('should update a product', async () => {
      const productToUpdate: Product = {
        ...testProduct,
        name: 'Updated Product',
        validate: jest.fn(),
        applyBusinessRules: jest.fn(),
      };

      mockRepository.findOneById.mockResolvedValue(testProduct);
      mockRepository.save.mockResolvedValue(productToUpdate);

      const result: Product = await service.update(productToUpdate);

      expect(productToUpdate.validate).toHaveBeenCalled();
      expect(productToUpdate.applyBusinessRules).toHaveBeenCalled();
      expect(result).toBeDefined();
    });
  });

  describe('delete', () => {
    it('should delete a product', async () => {
      mockRepository.findOneById.mockResolvedValue(testProduct);
      mockRepository.delete.mockResolvedValue();

      await service.delete(testId.toHexString());

      expect(mockRepository.delete).toHaveBeenCalledWith(testId.toHexString());
    });
  });

  describe('findExpensiveProducts', () => {
    it('should fetch expensive products from use case', async () => {
      const threshold: number = 1000;
      const products: Product[] = [expensiveProduct];
      mockFindExpensiveUseCase.execute.mockResolvedValue(products);

      const result: Product[] = await service.findExpensiveProducts(threshold);

      expect(result).toEqual(products);
      expect(mockFindExpensiveUseCase.execute).toHaveBeenCalledWith(threshold);
    });

    it('should use default threshold of 1000', async () => {
      mockFindExpensiveUseCase.execute.mockResolvedValue([]);

      await service.findExpensiveProducts();

      expect(mockFindExpensiveUseCase.execute).toHaveBeenCalledWith(1000);
    });
  });

  describe('findProductsByName', () => {
    it('should find products by name using use case', async () => {
      const searchName: string = 'Test';
      const products: Product[] = [testProduct];
      mockFindByNameUseCase.execute.mockResolvedValue(products);

      const result: Product[] = await service.findProductsByName(searchName);

      expect(result).toEqual(products);
      expect(mockFindByNameUseCase.execute).toHaveBeenCalledWith(searchName);
    });
  });
});
