import { Test, TestingModule } from '@nestjs/testing';
import { REQUEST } from '@nestjs/core';
import { ObjectId } from 'mongodb';
import { IGetUserAuthInfoRequest } from '../../../../user/domain/value-objects/user-request.interface';
import { CategoryService } from '../category.service';
import { BaseRepository } from '../../../../base/domain/repositories/base.repository';
import { Category } from '../../../domain/value-objects/category';
import { Logger } from '@shared/common/logger/logger.service';

describe('CategoryService', () => {
  let service: CategoryService;
  let mockRepository: jest.Mocked<BaseRepository<Category>>;
  let mockLogger: jest.Mocked<Logger>;
  let mockRequest: IGetUserAuthInfoRequest;

  const testId: ObjectId = new ObjectId();
  const testCategory: Category = {
    _id: testId,
    name: 'Test Category',
    quantity: 10,
    isDeleted: false,
    createdAt: new Date(),
    updatedAt: new Date(),
    validate: jest.fn(),
    applyBusinessRules: jest.fn(),
  } as Category;

  beforeEach(async () => {
    mockRepository = {
      findAll: jest.fn(),
      findOneById: jest.fn(),
      findAndCount: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      delete: jest.fn(),
      clear: jest.fn(),
    } as jest.Mocked<BaseRepository<Category>>;

    mockLogger = {
      log: jest.fn(),
      error: jest.fn(),
      warn: jest.fn(),
      debug: jest.fn(),
      logQueryError: jest.fn(),
    } as unknown as jest.Mocked<Logger>;

    mockRequest = {
      user: {
        _id: new ObjectId(),
        username: 'testuser',
        email: 'test@example.com',
      },
    } as IGetUserAuthInfoRequest;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CategoryService,
        { provide: BaseRepository, useValue: mockRepository },
        { provide: REQUEST, useValue: mockRequest },
        { provide: Logger, useValue: mockLogger },
      ],
    }).compile();

    service = await module.resolve<CategoryService>(CategoryService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return all categories from repository', async () => {
      const categories: Category[] = [testCategory];
      mockRepository.findAll.mockResolvedValue(categories);

      const result: Category[] = await service.findAll();

      expect(result).toEqual(categories);
      expect(mockRepository.findAll).toHaveBeenCalled();
    });
  });

  describe('create', () => {
    it('should create a category', async () => {
      const newCategory: Category = {
        name: 'New Category',
        quantity: 5,
        validate: jest.fn(),
        applyBusinessRules: jest.fn(),
      };
      mockRepository.create.mockResolvedValue();

      await service.create(newCategory);

      expect(newCategory.validate).toHaveBeenCalled();
      expect(newCategory.applyBusinessRules).toHaveBeenCalled();
      expect(mockRepository.create).toHaveBeenCalledWith(newCategory);
    });
  });

  describe('update', () => {
    it('should update a category', async () => {
      const categoryToUpdate: Category = {
        ...testCategory,
        name: 'Updated Category',
        validate: jest.fn(),
        applyBusinessRules: jest.fn(),
      };

      mockRepository.findOneById.mockResolvedValue(testCategory);
      mockRepository.save.mockResolvedValue(categoryToUpdate);

      const result: Category = await service.update(categoryToUpdate);

      expect(categoryToUpdate.validate).toHaveBeenCalled();
      expect(categoryToUpdate.applyBusinessRules).toHaveBeenCalled();
      expect(result).toBeDefined();
    });
  });

  describe('delete', () => {
    it('should delete a category', async () => {
      mockRepository.findOneById.mockResolvedValue(testCategory);
      mockRepository.delete.mockResolvedValue();

      await service.delete(testId.toHexString());

      expect(mockRepository.delete).toHaveBeenCalledWith(testId.toHexString());
    });
  });
});
