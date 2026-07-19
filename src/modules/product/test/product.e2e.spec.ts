import { HttpStatus, INestApplication } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Logger } from '@shared/common/logger/logger.service';
import { QueryDto } from '@shared/common/search/dtos/query.dto';
import { SearchResponseDto } from '@shared/common/search/dtos/search-response.dto';
import { ComparisonTypeEnum } from '@shared/common/search/enums/comparison.enum';
import { ComparatorEnum } from '@shared/common/search/enums/comparator.enum';
import { OrderEnum } from '@shared/common/search/enums/order.enum';
import { TestAppModule } from '@shared/common/test/test-app.module';
import * as jwt from 'jsonwebtoken';
import { ObjectId } from 'mongodb';
import request from 'supertest';
import { DataSource, Repository } from 'typeorm';
import { DatabaseTestService } from '../../base/test/services/database-test.service';
import { UserEntity } from '../../user/infrastructure/entities/user.entity';
import { ProductEntity } from '../infrastructure/entities/product.entity';
import { CreateProductDto, ProductDto, UpdateProductDto } from '../presentation/dtos';
import { mockProductFactory, mockProductSearchCriteriaFactory } from './mocks/product.mock';
import { ProductTestService } from './services/product-test.service';
import { ProductErrors } from '../domain/errors/product.errors';

type SupertestResponse = import('supertest').Response;

describe('Product E2E', () => {
  let productTestService: ProductTestService;
  let databaseTestService: DatabaseTestService;
  let productRepository: Repository<ProductEntity>;
  let userRepository: Repository<UserEntity>;
  let app: INestApplication;
  let testToken: string;
  let configService: ConfigService;
  let logger: Logger;
  let loggerErrorSpy: jest.SpyInstance;
  let loggerWarnSpy: jest.SpyInstance;

  const nonExistentId: ObjectId = new ObjectId('645ead8b586d13a6932d46dd');
  const testUserId: string = '65f9f7dec2cd92ee90d80fa4';

  afterAll(async () => {
    await app.close();
  });

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [TestAppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    const dataSource: DataSource = moduleFixture.get<DataSource>(DataSource);
    logger = moduleFixture.get<Logger>(Logger);

    configService = moduleFixture.get<ConfigService>(ConfigService);
    productRepository = moduleFixture.get<Repository<ProductEntity>>(getRepositoryToken(ProductEntity));
    userRepository = moduleFixture.get<Repository<UserEntity>>(getRepositoryToken(UserEntity));
    productTestService = new ProductTestService(productRepository, logger);
    databaseTestService = new DatabaseTestService(dataSource, logger);

    loggerErrorSpy = jest.spyOn(logger, 'error');
    loggerWarnSpy = jest.spyOn(logger, 'warn');

    await createTestUser();
    testToken = generateTestToken();
  });

  beforeEach(async () => {
    await resetTestData();
    await setupProductTestData(4);
    loggerErrorSpy.mockClear();
    loggerWarnSpy.mockClear();
  });

  afterEach(async () => {
    await cleanupProductTestData();
  });

  describe('GET /products', () => {
    it('200 OK - should return an array of products', async () => {
      const response: SupertestResponse = await request(app.getHttpServer())
        .get('/products')
        .set('Authorization', `Bearer ${testToken}`)
        .expect(HttpStatus.OK);

      expect(response.body).toBeInstanceOf(Array);
      expect(response.body.length).toBe(4);
    });
  });

  describe('DELETE /products', () => {
    it('200 OK - should clear all products', async () => {
      await request(app.getHttpServer())
        .delete('/products')
        .set('Authorization', `Bearer ${testToken}`)
        .expect(HttpStatus.OK);

      const existingProducts: ProductEntity[] = await productTestService.getTestProducts();
      expect(existingProducts).toHaveLength(0);
    });
  });

  describe('GET /products/search', () => {
    it('200 OK - should return products matching search criteria', async () => {
      const createProductDto: CreateProductDto = mockProductFactory({
        name: 'Test Search Product',
        price: 100,
        description: 'Product for search testing'
      });

      await postProduct(createProductDto);

      const searchCriteria: QueryDto<ProductEntity> = mockProductSearchCriteriaFactory({
        attributes: [{ key: 'name', value: 'Test', comparator: ComparatorEnum.LIKE }],
        type: ComparisonTypeEnum.AND,
        isPaginable: true,
        take: 10,
        skip: 0,
      });

      const response: SupertestResponse = await searchProducts(searchCriteria)
        .expect(HttpStatus.OK);

      const searchResponseProducts: SearchResponseDto<ProductDto> = response.body;
      expect(searchResponseProducts.data).toBeInstanceOf(Array);
      expect(searchResponseProducts.count).toBeGreaterThan(0);
      expect(searchResponseProducts.data.some((product: ProductDto) => product.name.toLowerCase().includes('test'))).toBe(true);
    });

    it('200 OK - should search products by price range', async () => {
      const createProductDto: CreateProductDto = mockProductFactory({
        name: 'Price Test Product',
        price: 10,
        description: 'Product for price search testing'
      });

      await postProduct(createProductDto);

      const searchCriteria: QueryDto<ProductDto> = mockProductSearchCriteriaFactory({
        attributes: [{ key: 'price', value: 10, comparator: ComparatorEnum.EQUALS }],
        type: ComparisonTypeEnum.AND,
        isPaginable: false,
      });

      const response: SupertestResponse = await searchProducts(searchCriteria)
        .expect(HttpStatus.OK);

      const products: ProductDto[] = response.body.data;
      expect(products).toBeInstanceOf(Array);
      expect(products.every((product: ProductDto) => product.price === 10)).toBe(true);
    });

    it('200 OK - should search products with multiple criteria', async () => {
      const createProductDto: CreateProductDto = mockProductFactory({
        name: 'Test Multi Criteria Product',
        price: 10,
        description: 'Product for multiple criteria search testing'
      });

      await postProduct(createProductDto);

      const searchCriteria: QueryDto<ProductEntity> = mockProductSearchCriteriaFactory({
        attributes: [
          { key: 'name', value: 'Test', comparator: ComparatorEnum.LIKE },
          { key: 'price', value: 10, comparator: ComparatorEnum.EQUALS }
        ],
        type: ComparisonTypeEnum.AND,
        isPaginable: true,
        take: 5,
        skip: 0,
        orders: { name: OrderEnum.ASC }
      });

      const response: SupertestResponse = await searchProducts(searchCriteria)
        .expect(HttpStatus.OK);

      const searchResponseProducts: SearchResponseDto<ProductDto> = response.body;
      expect(searchResponseProducts.data).toBeInstanceOf(Array);
      expect(searchResponseProducts.data.length).toBeLessThanOrEqual(5);
      expect(searchResponseProducts.data.every((product: ProductDto) =>
        product.name.toLowerCase().includes('test') && product.price === 10
      )).toBe(true);
    });
  });

  describe('GET /products/paginate', () => {
    it('200 OK - should paginate products', async () => {
      const take: number = 10;
      const skip: number = 0;

      const response: SupertestResponse = await request(app.getHttpServer())
        .get(`/products/paginate?take=${take}&skip=${skip}`)
        .set('Authorization', `Bearer ${testToken}`)
        .expect(HttpStatus.OK);

      const searchResponseProducts: SearchResponseDto<ProductDto> = response.body;
      expect(searchResponseProducts).toHaveProperty('data');
      expect(searchResponseProducts).toHaveProperty('count');
      expect(searchResponseProducts.count).toBe(4);
      expect(searchResponseProducts.data.length).toBeLessThanOrEqual(take);
    });
  });

  describe('POST /products', () => {
    it('201 CREATED - should create a new product', async () => {
      const createProductDto: CreateProductDto = mockProductFactory();

      await request(app.getHttpServer())
        .post('/products')
        .set('Authorization', `Bearer ${testToken}`)
        .send(createProductDto)
        .expect(HttpStatus.CREATED);

      const existingProducts: ProductEntity[] = await productTestService.getTestProducts();
      expect(existingProducts.length).toBe(5);

      const existingProduct: ProductEntity = existingProducts[4];
      expect(existingProduct._id).toBeDefined();
      expect(existingProduct.name).toBe(createProductDto.name);
      expect(existingProduct.price).toBe(createProductDto.price);
      expect(existingProduct.description).toBe(createProductDto.description);
    });

    it('400 BAD REQUEST - should reject product with missing required fields', async () => {
      const invalidProduct: any = { price: 100 };

      const response: SupertestResponse = await request(app.getHttpServer())
        .post('/products')
        .set('Authorization', `Bearer ${testToken}`)
        .send(invalidProduct)
        .expect(HttpStatus.BAD_REQUEST);

      expect(response.body.message).toEqual(expect.arrayContaining([
        expect.stringContaining('name')
      ]));
    });

    it('400 BAD REQUEST - should reject product with negative price', async () => {
      const invalidProduct: CreateProductDto = {
        name: 'Test Product',
        price: -100,
        description: 'Test description'
      };

      const response: SupertestResponse = await request(app.getHttpServer())
        .post('/products')
        .set('Authorization', `Bearer ${testToken}`)
        .send(invalidProduct)
        .expect(HttpStatus.BAD_REQUEST);

      expect(response.body.code).toBe(ProductErrors.PRODUCT_PRICE_NEGATIVE(invalidProduct.price).code);
      expect(response.body.message).toBe(ProductErrors.PRODUCT_PRICE_NEGATIVE(invalidProduct.price).message);
    });

    it('400 BAD REQUEST - should reject product with price exceeding maximum', async () => {
      const invalidProduct: CreateProductDto = {
        name: 'Test Product',
        price: 100001,
        description: 'Test description'
      };

      const response: SupertestResponse = await request(app.getHttpServer())
        .post('/products')
        .set('Authorization', `Bearer ${testToken}`)
        .send(invalidProduct)
        .expect(HttpStatus.BAD_REQUEST);

      expect(response.body.code).toBe(ProductErrors.PRODUCT_HIGH_VALUE_REQUIRES_APPROVAL(invalidProduct.name, invalidProduct.price).code);
      expect(response.body.message).toBe(ProductErrors.PRODUCT_HIGH_VALUE_REQUIRES_APPROVAL(invalidProduct.name, invalidProduct.price).message);
    });

    it('400 BAD REQUEST - should reject product with restricted word in name', async () => {
      const invalidProduct: CreateProductDto = {
        name: 'Replica Watch',
        price: 100,
        description: 'Test description'
      };

      const response: SupertestResponse = await request(app.getHttpServer())
        .post('/products')
        .set('Authorization', `Bearer ${testToken}`)
        .send(invalidProduct)
        .expect(HttpStatus.BAD_REQUEST);

      expect(response.body.code).toBe(ProductErrors.PRODUCT_NAME_CONTAINS_RESTRICTED_WORD(invalidProduct.name, 'replica').code);
      expect(response.body.message).toBe(ProductErrors.PRODUCT_NAME_CONTAINS_RESTRICTED_WORD(invalidProduct.name, 'replica').message);
    });

    it('400 BAD REQUEST - should reject high-value product requiring approval', async () => {
      const invalidProduct: CreateProductDto = {
        name: 'Expensive Product',
        price: 15000,
        description: 'High-value product'
      };

      const response: SupertestResponse = await request(app.getHttpServer())
        .post('/products')
        .set('Authorization', `Bearer ${testToken}`)
        .send(invalidProduct)
        .expect(HttpStatus.BAD_REQUEST);

      expect(response.body.code).toBe(ProductErrors.PRODUCT_HIGH_VALUE_REQUIRES_APPROVAL(invalidProduct.name, invalidProduct.price).code);
      expect(response.body.message).toBe(ProductErrors.PRODUCT_HIGH_VALUE_REQUIRES_APPROVAL(invalidProduct.name, invalidProduct.price).message);
    });

    it('400 BAD REQUEST - should reject product with price too low', async () => {
      const invalidProduct: CreateProductDto = {
        name: 'Cheap Product',
        price: 0.5,
        description: 'Very cheap product'
      };

      const response: SupertestResponse = await request(app.getHttpServer())
        .post('/products')
        .set('Authorization', `Bearer ${testToken}`)
        .send(invalidProduct)
        .expect(HttpStatus.BAD_REQUEST);

      expect(response.body.code).toBe(ProductErrors.PRODUCT_PRICE_TOO_LOW(invalidProduct.price).code);
      expect(response.body.message).toBe(ProductErrors.PRODUCT_PRICE_TOO_LOW(invalidProduct.price).message);
    });
  });

  describe('GET /products/find/:id', () => {
    it('200 OK - should return a product by ID', async () => {
      const existingProducts: ProductEntity[] = await productTestService.getTestProducts();
      expect(existingProducts.length).toBeGreaterThan(0);

      const existingProduct: ProductEntity = existingProducts[0];
      const productId: string = existingProduct._id.toString();

      const response: SupertestResponse = await getProductById(productId)
        .expect(HttpStatus.OK);

      expect(response.body._id).toBe(productId);
      expect(response.body.name).toBe(existingProduct.name);
      expect(response.body.price).toBe(existingProduct.price);
      expect(response.body.description).toBe(existingProduct.description);
    });

    it('404 NOT FOUND - should return 404 if product not found', async () => {
      const response: SupertestResponse = await getProductById(nonExistentId.toString())
        .expect(HttpStatus.NOT_FOUND);

      expect(response.body).toEqual(
        expect.objectContaining({
          message: 'Resource not found',
          code: 'NOT_FOUND',
          timestamp: expect.any(String),
          path: `/products/find/${nonExistentId}`,
          method: 'GET'
        })
      );

      expect(loggerErrorSpy).toHaveBeenCalledWith(
        'Entity not found',
        expect.objectContaining({ _id: nonExistentId })
      );
    });
  });

  describe('PUT /products/:id', () => {
    it('200 OK - should update a product', async () => {
      const existingProducts: ProductEntity[] = await productTestService.getTestProducts();
      expect(existingProducts.length).toBeGreaterThan(0);

      const existingProduct: ProductEntity = existingProducts[0];
      const productId: string = existingProduct._id.toString();

      const updateProductDto: UpdateProductDto = {
        name: 'Updated Product',
        price: 19.99,
        description: 'Updated Product description',
      };

      const response: SupertestResponse = await updateProduct(productId, updateProductDto)
        .expect(HttpStatus.OK);

      expect(response.body._id).toBe(productId);
      expect(response.body.name).toBe(updateProductDto.name);
      expect(response.body.price).toBe(updateProductDto.price);
      expect(response.body.description).toBe(updateProductDto.description);
    });

    it('404 NOT FOUND - should return 404 if product not found', async () => {
      const updateProductDto: UpdateProductDto = {
        name: 'Updated Product',
        price: 19.99,
        description: 'Updated Product description',
      };

      const response: SupertestResponse = await updateProduct(nonExistentId.toString(), updateProductDto)
        .expect(HttpStatus.NOT_FOUND);

      expect(response.body).toEqual(
        expect.objectContaining({
          message: 'Resource not found',
          code: 'NOT_FOUND',
          timestamp: expect.any(String),
          path: `/products/${nonExistentId}`,
          method: 'PUT'
        })
      );
    });
  });

  describe('PATCH /products/archive/:id', () => {
    it('should archive a product', async () => {
      const existingProducts: ProductEntity[] = await productTestService.getTestProducts();
      expect(existingProducts.length).toBeGreaterThan(0);

      const existingProduct: ProductEntity = existingProducts[0];
      const productId: string = existingProduct._id.toString();

      await archiveProduct(productId)
        .expect(HttpStatus.OK);
    });

    it('should return 404 if product not found', async () => {
      const response: SupertestResponse = await archiveProduct(nonExistentId.toString())
        .expect(HttpStatus.NOT_FOUND);

      expect(response.body).toEqual(
        expect.objectContaining({
          message: 'Resource not found',
          code: 'NOT_FOUND',
          timestamp: expect.any(String),
          path: `/products/archive/${nonExistentId}`,
          method: 'PATCH'
        })
      );
    });
  });

  describe('PATCH /products/unarchive/:id', () => {
    it('should unarchive a product', async () => {
      const existingProducts: ProductEntity[] = await productTestService.getTestProducts();
      expect(existingProducts.length).toBeGreaterThan(0);

      const existingProduct: ProductEntity = existingProducts[0];
      const productId: string = existingProduct._id.toString();

      await unarchiveProduct(productId)
        .expect(HttpStatus.OK);
    });

    it('should return 404 if product not found', async () => {
      const response: SupertestResponse = await unarchiveProduct(nonExistentId.toString())
        .expect(HttpStatus.NOT_FOUND);

      expect(response.body).toEqual(
        expect.objectContaining({
          message: 'Resource not found',
          code: 'NOT_FOUND',
          timestamp: expect.any(String),
          path: `/products/unarchive/${nonExistentId}`,
          method: 'PATCH'
        })
      );
    });
  });

  describe('DELETE /products/:id', () => {
    it('should delete a product', async () => {
      const existingProducts: ProductEntity[] = await productTestService.getTestProducts();
      expect(existingProducts.length).toBeGreaterThan(0);

      const existingProduct: ProductEntity = existingProducts[0];
      const productId: string = existingProduct._id.toString();

      const response: SupertestResponse = await deleteProduct(productId)
        .expect(HttpStatus.OK);

      expect(response.body).toBeDefined();
    });

    it('should return 404 if product not found', async () => {
      const response: SupertestResponse = await deleteProduct(nonExistentId.toString())
        .expect(HttpStatus.NOT_FOUND);

      expect(response.body).toEqual(
        expect.objectContaining({
          message: 'Resource not found',
          code: 'NOT_FOUND',
          timestamp: expect.any(String),
          path: `/products/${nonExistentId}`,
          method: 'DELETE'
        })
      );
    });
  });

  describe('Edge Cases', () => {
    it('should reject requests without token', async () => {
      const createProductDto: CreateProductDto = mockProductFactory();

      await request(app.getHttpServer())
        .post('/products')
        .send(createProductDto)
        .expect(HttpStatus.UNAUTHORIZED);

      expect(loggerWarnSpy).toHaveBeenCalledWith(
        'Authentication failed: No token provided'
      );
    });

    it('should handle non-existent product ID', async () => {
      await getProductById(nonExistentId.toString())
        .expect(HttpStatus.NOT_FOUND);
    });
  });

  async function createTestUser(): Promise<void> {
    const existingUser: UserEntity = await userRepository.findOne({ where: { email: 'test@maildrop.com' } });
    if (!existingUser) {
      const testUser: UserEntity = new UserEntity({
        _id: testUserId,
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
      await userRepository.save(testUser);
    }
  }

  function generateTestToken(): string {
    const payload: { id: string; username: string; email: string } = {
      id: testUserId,
      username: 'test',
      email: 'test@maildrop.com',
    };
    const secret: string = configService.get<string>('auth.secret');
    return jwt.sign(payload, secret, { expiresIn: '1h' });
  }

  async function resetTestData(): Promise<void> {
    try {
      await productTestService.clearProducts();
      await createTestUser();
    } catch (error: unknown) {
      const errorMessage: string = error instanceof Error ? error.message : String(error);
      logger.logQueryError(errorMessage, 'Error resetting test data:');
    }
  }

  async function setupProductTestData(count: number = 4): Promise<void> {
    await productTestService.clearProducts();
    await productTestService.insertTestProducts(count);
  }

  async function cleanupProductTestData(): Promise<void> {
    await productTestService.cleanupAfterTest();
  }

  async function postProduct(productData: CreateProductDto): Promise<ProductEntity> {
    await request(app.getHttpServer())
      .post('/products')
      .set('Authorization', `Bearer ${testToken}`)
      .send(productData)
      .expect(HttpStatus.CREATED);

    const createdProduct: ProductEntity = await productRepository.findOne({ where: { name: productData.name } });
    expect(createdProduct).toBeDefined();
    return createdProduct;
  }

  function getProductById(id: string) {
    return request(app.getHttpServer())
      .get(`/products/find/${id}`)
      .set('Authorization', `Bearer ${testToken}`);
  }

  function updateProduct(id: string, updateData: UpdateProductDto) {
    return request(app.getHttpServer())
      .put(`/products/${id}`)
      .set('Authorization', `Bearer ${testToken}`)
      .send(updateData);
  }

  function archiveProduct(id: string) {
    return request(app.getHttpServer())
      .patch(`/products/archive/${id}`)
      .set('Authorization', `Bearer ${testToken}`);
  }

  function unarchiveProduct(id: string) {
    return request(app.getHttpServer())
      .patch(`/products/unarchive/${id}`)
      .set('Authorization', `Bearer ${testToken}`);
  }

  function deleteProduct(id: string) {
    return request(app.getHttpServer())
      .delete(`/products/${id}`)
      .set('Authorization', `Bearer ${testToken}`);
  }

  function searchProducts(searchCriteria: QueryDto<ProductDto>) {
    return request(app.getHttpServer())
      .get('/products/search')
      .set('Authorization', `Bearer ${testToken}`)
      .send(searchCriteria);
  }
});
