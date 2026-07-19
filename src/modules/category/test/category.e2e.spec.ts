import { HttpStatus, INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Logger } from '@shared/common/logger/logger.service';
import { QueryDto } from '@shared/common/search/dtos/query.dto';
import { SearchResponseDto } from '@shared/common/search/dtos/search-response.dto';
import { ComparisonTypeEnum } from '@shared/common/search/enums/comparison.enum';
import { ComparatorEnum } from '@shared/common/search/enums/comparator.enum';
import { TestAppModule } from '@shared/common/test/test-app.module';
import * as jwt from 'jsonwebtoken';
import { ObjectId } from 'mongodb';
import request from 'supertest';
import { DataSource, Repository } from 'typeorm';
import { DatabaseTestService } from '../../base/test/services/database-test.service';
import { UserEntity } from '../../user/infrastructure/entities/user.entity';
import { CategoryEntity } from '../infrastructure/entities/category.entity';
import { CategoryDto, CreateCategoryDto, UpdateCategoryDto } from '../presentation/dtos';
import { mockCategoryFactory, mockCategorySearchCriteriaFactory } from './mocks/category.mock';
import { CategoryTestService } from './services/category-test.service';
import { CategoryErrors } from '../domain/errors/category.errors';

type SupertestResponse = import('supertest').Response;

describe('Category E2E', () => {
  let categoryTestService: CategoryTestService;
  let databaseTestService: DatabaseTestService;
  let categoryRepository: Repository<CategoryEntity>;
  let userRepository: Repository<UserEntity>;
  let app: INestApplication;
  let testToken: string;
  let logger: Logger;
  let loggerErrorSpy: jest.SpyInstance;
  let loggerWarnSpy: jest.SpyInstance;

  const nonExistentId: ObjectId = new ObjectId('645ead8b586d13a6932d46dd');
  const testUserId: string = '65f9f7dec2cd92ee90d80fa3';

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

    categoryRepository = moduleFixture.get<Repository<CategoryEntity>>(getRepositoryToken(CategoryEntity));
    userRepository = moduleFixture.get<Repository<UserEntity>>(getRepositoryToken(UserEntity));
    categoryTestService = new CategoryTestService(categoryRepository, logger);
    databaseTestService = new DatabaseTestService(dataSource, logger);

    loggerErrorSpy = jest.spyOn(logger, 'error');
    loggerWarnSpy = jest.spyOn(logger, 'warn');

    await createTestUser();
    testToken = generateTestToken();
  });

  beforeEach(async () => {
    await resetTestData();
    await setupCategoryTestData(4);
    loggerErrorSpy.mockClear();
    loggerWarnSpy.mockClear();
  });

  afterEach(async () => {
    await cleanupCategoryTestData();
  });

  describe('GET /categories', () => {
    it('200 OK - should return an array of categories', async () => {
      const response: SupertestResponse = await request(app.getHttpServer())
        .get('/categories')
        .set('Authorization', `Bearer ${testToken}`)
        .expect(HttpStatus.OK);

      expect(response.body).toBeInstanceOf(Array);
      expect(response.body.length).toBe(4);
    });
  });

  describe('DELETE /categories', () => {
    it('200 OK - should clear all categories', async () => {
      await request(app.getHttpServer())
        .delete('/categories')
        .set('Authorization', `Bearer ${testToken}`)
        .expect(HttpStatus.OK);

      const existingCategories: CategoryEntity[] = await categoryTestService.getTestCategories();
      expect(existingCategories).toHaveLength(0);
    });
  });

  describe('GET /categories/search', () => {
    it('200 OK - should return categories matching search criteria', async () => {
      const testCategory: CreateCategoryDto = mockCategoryFactory({
        name: 'Test Search Category',
        quantity: 100,
        description: 'Category for search testing'
      });

      await postCategory(testCategory);

      const searchCriteria: QueryDto<CategoryEntity> = mockCategorySearchCriteriaFactory({
        attributes: [{ key: 'name', value: 'Test', comparator: ComparatorEnum.LIKE }],
        type: ComparisonTypeEnum.AND,
        isPaginable: true,
        take: 10,
        skip: 0,
      });

      const response: SupertestResponse = await searchCategories(searchCriteria)
        .expect(HttpStatus.OK);

      const searchResponseCategories: SearchResponseDto<CategoryDto> = response.body;
      expect(searchResponseCategories.data).toBeInstanceOf(Array);
      expect(searchResponseCategories.count).toBeGreaterThan(0);
      expect(searchResponseCategories.data.some((category: CategoryDto) => category.name.toLowerCase().includes('test'))).toBe(true);
    });

    it('200 OK - should search categories by quantity range', async () => {
      const testCategory: CreateCategoryDto = mockCategoryFactory({
        name: 'Quantity Test Category',
        quantity: 50,
        description: 'Category for quantity search testing'
      });

      await postCategory(testCategory);

      const searchCriteria: QueryDto<CategoryDto> = mockCategorySearchCriteriaFactory({
        attributes: [{ key: 'quantity', value: 50, comparator: ComparatorEnum.EQUALS }],
        type: ComparisonTypeEnum.AND,
        isPaginable: false,
      });

      const response: SupertestResponse = await searchCategories(searchCriteria)
        .expect(HttpStatus.OK);

      const searchResponseCategories: SearchResponseDto<CategoryDto> = response.body;
      expect(searchResponseCategories.data).toBeInstanceOf(Array);
      expect(searchResponseCategories.data.every((category: CategoryDto) => category.quantity === 50)).toBe(true);
    });

    it('200 OK - should search categories with multiple criteria', async () => {
      const testCategory: CreateCategoryDto = mockCategoryFactory({
        name: 'Multi Test Category',
        quantity: 25,
        description: 'Multi criteria test'
      });

      await postCategory(testCategory);

      const searchCriteria: QueryDto<CategoryEntity> = mockCategorySearchCriteriaFactory({
        attributes: [
          { key: 'name', value: 'Multi', comparator: ComparatorEnum.LIKE },
          { key: 'quantity', value: 25, comparator: ComparatorEnum.EQUALS }
        ],
        type: ComparisonTypeEnum.AND,
        isPaginable: false,
      });

      const response: SupertestResponse = await searchCategories(searchCriteria)
        .expect(HttpStatus.OK);

      const searchResponseCategories: SearchResponseDto<CategoryDto> = response.body;
      expect(searchResponseCategories.data).toBeInstanceOf(Array);
      expect(searchResponseCategories.data.every((category: CategoryDto) =>
        category.name.toLowerCase().includes('multi') && category.quantity === 25
      )).toBe(true);
    });

    it('200 OK - should return empty array when no categories match criteria', async () => {
      const searchCriteria: QueryDto<CategoryEntity> = mockCategorySearchCriteriaFactory({
        attributes: [{ key: 'name', value: 'NonExistentCategory', comparator: ComparatorEnum.EQUALS }],
        type: ComparisonTypeEnum.AND,
        isPaginable: false,
      });

      const response: SupertestResponse = await searchCategories(searchCriteria)
        .expect(HttpStatus.OK);

      const categories: CategoryDto[] = response.body.data;
      expect(categories).toBeInstanceOf(Array);
      expect(categories.length).toBe(0);
    });
  });

  describe('GET /categories/paginate', () => {
    it('200 OK - should return paginated categories', async () => {
      const take: number = 2;
      const skip: number = 0;

      const response: SupertestResponse = await request(app.getHttpServer())
        .get(`/categories/paginate?take=${take}&skip=${skip}`)
        .set('Authorization', `Bearer ${testToken}`)
        .expect(HttpStatus.OK);

      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('count');
      expect(response.body.count).toBe(4);
      expect(response.body.data.length).toBeLessThanOrEqual(take);
    });

    it('200 OK - should handle pagination with different page sizes', async () => {
      const take: number = 3;
      const skip: number = 1;

      const response: SupertestResponse = await request(app.getHttpServer())
        .get(`/categories/paginate?take=${take}&skip=${skip}`)
        .set('Authorization', `Bearer ${testToken}`)
        .expect(HttpStatus.OK);

      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('count');
      expect(response.body.data.length).toBeLessThanOrEqual(take);
    });
  });

  describe('POST /categories', () => {
    it('201 CREATED - should create a new category', async () => {
      const createCategoryDto: CreateCategoryDto = mockCategoryFactory();

      await request(app.getHttpServer())
        .post('/categories')
        .set('Authorization', `Bearer ${testToken}`)
        .send(createCategoryDto)
        .expect(HttpStatus.CREATED);

      const existingCategories: CategoryEntity[] = await categoryTestService.getTestCategories();
      expect(existingCategories.length).toBe(5);

      const testCategory: CategoryEntity = existingCategories[4];
      expect(testCategory._id).toBeDefined();
      expect(testCategory.name).toBe(createCategoryDto.name);
      expect(testCategory.quantity).toBe(createCategoryDto.quantity);
      expect(testCategory.description).toBe(createCategoryDto.description);
    });

    it('400 BAD REQUEST - should reject category with empty name', async () => {
      const invalidCategory: CreateCategoryDto = mockCategoryFactory({ name: '' });

      const response: SupertestResponse = await request(app.getHttpServer())
        .post('/categories')
        .set('Authorization', `Bearer ${testToken}`)
        .send(invalidCategory)
        .expect(HttpStatus.BAD_REQUEST);

      expect(response.body.code).toBe(CategoryErrors.CATEGORY_NAME_REQUIRED().code);
      expect(response.body.message).toBe(CategoryErrors.CATEGORY_NAME_REQUIRED().message);
    });

    it('400 BAD REQUEST - should reject category with negative quantity', async () => {
      const invalidCategory: CreateCategoryDto = mockCategoryFactory({ quantity: -1 });

      const response: SupertestResponse = await request(app.getHttpServer())
        .post('/categories')
        .set('Authorization', `Bearer ${testToken}`)
        .send(invalidCategory)
        .expect(HttpStatus.BAD_REQUEST);

      expect(response.body.code).toBe(CategoryErrors.CATEGORY_QUANTITY_NEGATIVE(invalidCategory.quantity).code);
      expect(response.body.message).toBe(CategoryErrors.CATEGORY_QUANTITY_NEGATIVE(invalidCategory.quantity).message);
    });

    it('400 BAD REQUEST - should reject category with name too long', async () => {
      const longName: string = 'a'.repeat(101);
      const invalidCategory: CreateCategoryDto = mockCategoryFactory({ name: longName });

      const response: SupertestResponse = await request(app.getHttpServer())
        .post('/categories')
        .set('Authorization', `Bearer ${testToken}`)
        .send(invalidCategory)
        .expect(HttpStatus.BAD_REQUEST);

      expect(response.body.code).toBe(CategoryErrors.CATEGORY_NAME_TOO_LONG(longName).code);
      expect(response.body.message).toBe(CategoryErrors.CATEGORY_NAME_TOO_LONG(longName).message);
    });

    it('400 BAD REQUEST - should reject category with description too long', async () => {
      const longDescription: string = 'a'.repeat(501);
      const invalidCategory: CreateCategoryDto = mockCategoryFactory({ description: longDescription });

      const response: SupertestResponse = await request(app.getHttpServer())
        .post('/categories')
        .set('Authorization', `Bearer ${testToken}`)
        .send(invalidCategory)
        .expect(HttpStatus.BAD_REQUEST);

      expect(response.body.code).toBe(CategoryErrors.CATEGORY_DESCRIPTION_TOO_LONG(longDescription).code);
      expect(response.body.message).toBe(CategoryErrors.CATEGORY_DESCRIPTION_TOO_LONG(longDescription).message);
    });
  });

  describe('PUT /categories/:id', () => {
    let createdCategoryEntity: CategoryEntity;

    beforeEach(async () => {
      const createCategoryDto: CreateCategoryDto = mockCategoryFactory();
      createdCategoryEntity = await postCategory(createCategoryDto);
    });

    it('200 OK - should update an existing category', async () => {
      const updateData: UpdateCategoryDto = {
        name: 'Updated Category Name',
        quantity: 150,
        description: 'Updated description'
      };

      const response: SupertestResponse = await updateCategory(createdCategoryEntity._id.toString(), updateData)
        .expect(HttpStatus.OK);

      expect(response.body.name).toBe(updateData.name);
      expect(response.body.quantity).toBe(updateData.quantity);
      expect(response.body.description).toBe(updateData.description);
    });

    it('400 BAD REQUEST - should reject update with empty name', async () => {
      const invalidUpdate: UpdateCategoryDto = { name: '' };

      const response: SupertestResponse = await updateCategory(createdCategoryEntity._id.toString(), invalidUpdate)
        .expect(HttpStatus.BAD_REQUEST);

      expect(response.body.code).toBe(CategoryErrors.CATEGORY_NAME_REQUIRED().code);
      expect(response.body.message).toBe(CategoryErrors.CATEGORY_NAME_REQUIRED().message);
    });

    it('400 BAD REQUEST - should reject update with negative quantity', async () => {
      const invalidUpdate: UpdateCategoryDto = {
        name: createdCategoryEntity.name,
        quantity: -5
      };

      const response: SupertestResponse = await updateCategory(createdCategoryEntity._id.toString(), invalidUpdate)
        .expect(HttpStatus.BAD_REQUEST);

      expect(response.body.code).toBe(CategoryErrors.CATEGORY_QUANTITY_NEGATIVE(invalidUpdate.quantity).code);
      expect(response.body.message).toBe(CategoryErrors.CATEGORY_QUANTITY_NEGATIVE(invalidUpdate.quantity).message);
    });

    it('200 OK - should handle partial updates', async () => {
      const updateCategoryDto: UpdateCategoryDto = { name: 'Partially Updated' };

      const response: SupertestResponse = await updateCategory(createdCategoryEntity._id.toString(), updateCategoryDto)
        .expect(HttpStatus.OK);

      expect(response.body.name).toBe(updateCategoryDto.name);
      const updatedEntity: CategoryEntity = await categoryRepository.findOne({
        where: { _id: new ObjectId(createdCategoryEntity._id.toString()) }
      });
      expect(updatedEntity?.quantity).toBe(createdCategoryEntity.quantity);
      expect(updatedEntity?.description).toBe(createdCategoryEntity.description);
    });
  });

  describe('PATCH /categories/archive/:id', () => {
    let createdCategoryEntity: CategoryEntity;

    beforeEach(async () => {
      const categoryData: CreateCategoryDto = mockCategoryFactory();
      createdCategoryEntity = await postCategory(categoryData);
    });

    it('200 OK - should archive a category', async () => {
      await archiveCategory(createdCategoryEntity._id.toString())
        .expect(HttpStatus.OK);

      const archivedCategory: CategoryEntity = await categoryRepository.findOne({
        where: { _id: new ObjectId(createdCategoryEntity._id.toString()) }
      });
      expect(archivedCategory?.isDeleted).toBe(true);
    });

    it('404 NOT FOUND - should handle archiving non-existent category', async () => {
      await archiveCategory(nonExistentId.toString())
        .expect(HttpStatus.NOT_FOUND);

      expect(loggerErrorSpy).toHaveBeenCalledWith(
        'Entity not found',
        expect.objectContaining({ _id: nonExistentId })
      );
    });
  });

  describe('PATCH /categories/unarchive/:id', () => {
    let createdCategoryEntity: CategoryEntity;

    beforeEach(async () => {
      const createCategoryDto: CreateCategoryDto = mockCategoryFactory();
      createdCategoryEntity = await postCategory(createCategoryDto);
      await archiveCategory(createdCategoryEntity._id.toString());
    });

    it('200 OK - should unarchive a category', async () => {
      await unarchiveCategory(createdCategoryEntity._id.toString())
        .expect(HttpStatus.OK);

      const unarchivedCategory: CategoryEntity = await categoryRepository.findOne({
        where: { _id: new ObjectId(createdCategoryEntity._id.toString()) }
      });
      expect(unarchivedCategory?.isDeleted).toBe(false);
    });

    it('404 NOT FOUND - should handle unarchiving non-existent category', async () => {
      await unarchiveCategory(nonExistentId.toString())
        .expect(HttpStatus.NOT_FOUND);

      expect(loggerErrorSpy).toHaveBeenCalledWith(
        'Entity not found',
        expect.objectContaining({ _id: nonExistentId })
      );
    });
  });

  describe('DELETE /categories/:id', () => {
    let createdCategoryEntity: CategoryEntity;

    beforeEach(async () => {
      const createCategoryDto: CreateCategoryDto = mockCategoryFactory();
      createdCategoryEntity = await postCategory(createCategoryDto);
    });

    it('200 OK - should delete a category', async () => {
      await deleteCategory(createdCategoryEntity._id.toString())
        .expect(HttpStatus.OK);

      const deletedCategory: CategoryEntity = await categoryRepository.findOne({
        where: { _id: new ObjectId(createdCategoryEntity._id.toString()) }
      });
      expect(deletedCategory).toBeNull();
    });

    it('404 NOT FOUND - should handle deleting non-existent category', async () => {
      await deleteCategory(nonExistentId.toString())
        .expect(HttpStatus.NOT_FOUND);

      expect(loggerErrorSpy).toHaveBeenCalledWith(
        'Entity not found',
        expect.objectContaining({ _id: nonExistentId })
      );
    });
  });

  describe('GET /categories/find/:id', () => {
    let createdCategoryEntity: CategoryEntity;

    beforeEach(async () => {
      const categoryData: CreateCategoryDto = mockCategoryFactory();
      createdCategoryEntity = await postCategory(categoryData);
    });

    it('200 OK - should return a specific category', async () => {
      const response: SupertestResponse = await getCategoryById(createdCategoryEntity._id.toString())
        .expect(HttpStatus.OK);

      expect(response.body._id).toBe(createdCategoryEntity._id.toString());
      expect(response.body.name).toBe(createdCategoryEntity.name);
      expect(response.body.quantity).toBe(createdCategoryEntity.quantity);
      expect(response.body.description).toBe(createdCategoryEntity.description);
    });

    it('404 NOT FOUND - should handle non-existent category ID', async () => {
      await getCategoryById(nonExistentId.toString())
        .expect(HttpStatus.NOT_FOUND);

      expect(loggerErrorSpy).toHaveBeenCalledWith(
        'Entity not found',
        expect.objectContaining({ _id: nonExistentId })
      );
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
    const payload: any = {
      id: testUserId,
      username: 'test',
      email: 'test@maildrop.com',
    };
    const secret: string = 'secret-key-for-tests';
    return jwt.sign(payload, secret, { expiresIn: '1h' });
  }

  async function resetTestData(): Promise<void> {
    try {
      await categoryTestService.clearCategories();
      await createTestUser();
    } catch (error: unknown) {
      const errorMessage: string = error instanceof Error ? error.message : String(error);
      logger.logQueryError(errorMessage, 'Error resetting test data:');
    }
  }

  async function setupCategoryTestData(count: number = 4): Promise<void> {
    await categoryTestService.clearCategories();
    await categoryTestService.insertTestCategories(count);
  }

  async function cleanupCategoryTestData(): Promise<void> {
    await categoryTestService.cleanupAfterTest();
  }

  async function postCategory(categoryData: CreateCategoryDto): Promise<CategoryEntity> {
    await request(app.getHttpServer())
      .post('/categories')
      .set('Authorization', `Bearer ${testToken}`)
      .send(categoryData)
      .expect(HttpStatus.CREATED);

    const createdCategoryEntity: CategoryEntity = await categoryRepository.findOne({
      where: { name: categoryData.name }
    });
    expect(createdCategoryEntity).toBeDefined();
    return createdCategoryEntity;
  }

  function getCategoryById(id: string) {
    return request(app.getHttpServer())
      .get(`/categories/find/${id}`)
      .set('Authorization', `Bearer ${testToken}`);
  }

  function updateCategory(id: string, updateData: UpdateCategoryDto) {
    return request(app.getHttpServer())
      .put(`/categories/${id}`)
      .set('Authorization', `Bearer ${testToken}`)
      .send(updateData);
  }

  function archiveCategory(id: string) {
    return request(app.getHttpServer())
      .patch(`/categories/archive/${id}`)
      .set('Authorization', `Bearer ${testToken}`);
  }

  function unarchiveCategory(id: string) {
    return request(app.getHttpServer())
      .patch(`/categories/unarchive/${id}`)
      .set('Authorization', `Bearer ${testToken}`);
  }

  function deleteCategory(id: string) {
    return request(app.getHttpServer())
      .delete(`/categories/${id}`)
      .set('Authorization', `Bearer ${testToken}`);
  }

  function searchCategories(searchCriteria: QueryDto<CategoryDto>) {
    return request(app.getHttpServer())
      .get('/categories/search')
      .set('Authorization', `Bearer ${testToken}`)
      .send(searchCriteria);
  }
});
