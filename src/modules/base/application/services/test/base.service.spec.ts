import { REQUEST } from '@nestjs/core';
import { Test, TestingModule } from '@nestjs/testing';
import { PaginationConstants } from '@shared/common/constants';
import { Logger } from '@shared/common/logger/logger.service';
import { ComparisonTypeEnum, ComparatorEnum, OrderEnum } from '@shared/common/search';
import { SearchResponse } from '@shared/common/search/domains/search-response';
import { ResponsePaginate } from '@shared/common/types/response-paginate.type';
import { ObjectId } from 'mongodb';
import { IGetUserAuthInfoRequest } from '../../../../user/domain/value-objects/user-request.interface';
import { BaseRepository } from '../../../domain/repositories/base.repository';
import { Base } from '../../../domain/value-objects/base';
import { BaseService } from '../base.service';

class Domain extends Base {
  name: string;
  createdAt?: Date;
  updatedAt?: Date;
}

describe('BaseService', () => {
  let service: BaseService<Domain>;
  let mockRepository: jest.Mocked<BaseRepository<Domain>>;
  let mockLogger: jest.Mocked<Logger>;
  let mockRequest: IGetUserAuthInfoRequest;

  const testId: ObjectId = new ObjectId();
  const testIdString: string = testId.toHexString();
  const testDomain: Domain = {
    _id: testId,
    name: 'Test Item',
    isDeleted: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    mockRepository = {
      findAll: jest.fn(),
      findOneById: jest.fn(),
      findAndCount: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      delete: jest.fn(),
      clear: jest.fn(),
    } as jest.Mocked<BaseRepository<Domain>>;

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
        {
          provide: BaseService,
          useFactory: () => {
            return new BaseService<Domain>(mockRepository, mockRequest, mockLogger);
          },
        },
        { provide: BaseRepository, useValue: mockRepository },
        { provide: REQUEST, useValue: mockRequest },
        { provide: Logger, useValue: mockLogger },
      ],
    }).compile();

    service = module.get<BaseService<Domain>>(BaseService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return all domains', async () => {
      const expectedDomains: Domain[] = [testDomain];
      mockRepository.findAll.mockResolvedValue(expectedDomains);

      const domains: Domain[] = await service.findAll();

      expect(domains).toEqual(expectedDomains);
      expect(mockRepository.findAll).toHaveBeenCalledTimes(1);
    });

    it('should return empty array when no domains exist', async () => {
      mockRepository.findAll.mockResolvedValue([]);

      const domains: Domain[] = await service.findAll();

      expect(domains).toEqual([]);
    });
  });

  describe('findOneById', () => {
    it('should return a domain by id', async () => {
      mockRepository.findOneById.mockResolvedValue(testDomain);

      const domain: Domain = await service.findOneById(testIdString);

      expect(domain).toEqual(testDomain);
      expect(mockRepository.findOneById).toHaveBeenCalledWith(testIdString);
    });

    it('should throw error when entity not found', async () => {
      mockRepository.findOneById.mockResolvedValue(null);

      await expect(service.findOneById(testIdString)).rejects.toThrow('Resource not found');
      expect(mockLogger.error).toHaveBeenCalledWith('Entity not found', { _id: testIdString });
    });
  });

  describe('create', () => {
    it('should create a new domain', async () => {
      const newDomain: Domain = { ...testDomain, _id: undefined };
      mockRepository.create.mockResolvedValue();

      await service.create(newDomain);

      expect(newDomain.isDeleted).toBe(false);
      expect(newDomain.userCreated).toBe(mockRequest.user._id);
      expect(newDomain.userUpdated).toBe(mockRequest.user._id);
      expect(mockRepository.create).toHaveBeenCalledWith(newDomain);
    });

    it('should create domain without user info when no user in request', async () => {
      const serviceWithoutUser: BaseService<Domain> = new BaseService<Domain>(
        mockRepository,
        { user: undefined } as IGetUserAuthInfoRequest,
        mockLogger
      );
      const newDomain: Domain = { name: 'Test' };
      mockRepository.create.mockResolvedValue();

      await serviceWithoutUser.create(newDomain);

      expect(newDomain.isDeleted).toBe(false);
      expect(newDomain.userCreated).toBeUndefined();
    });
  });

  describe('update', () => {
    it('should update an existing domain', async () => {
      mockRepository.findOneById.mockResolvedValue(testDomain);
      mockRepository.save.mockResolvedValue(testDomain);

      const updatedDomain: Domain = { ...testDomain, name: 'Updated' };
      const domain: Domain = await service.update(updatedDomain);

      expect(domain).toBeDefined();
      expect(mockRepository.findOneById).toHaveBeenCalledWith(testIdString);
      expect(mockRepository.save).toHaveBeenCalled();
    });

    it('should throw error when entity to update not found', async () => {
      mockRepository.findOneById.mockResolvedValue(null);

      await expect(service.update(testDomain)).rejects.toThrow('Resource not found');
    });
  });

  describe('delete', () => {
    it('should delete an existing domain', async () => {
      mockRepository.findOneById.mockResolvedValue(testDomain);
      mockRepository.delete.mockResolvedValue();

      await service.delete(testIdString);

      expect(mockRepository.findOneById).toHaveBeenCalledWith(testIdString);
      expect(mockRepository.delete).toHaveBeenCalledWith(testIdString);
    });

    it('should throw error when entity to delete not found', async () => {
      mockRepository.findOneById.mockResolvedValue(null);

      await expect(service.delete(testIdString)).rejects.toThrow('Resource not found');
    });
  });

  describe('softDelete', () => {
    it('should soft delete (archive) an entity', async () => {
      mockRepository.findOneById.mockResolvedValue({ ...testDomain });
      mockRepository.save.mockResolvedValue(testDomain);

      await service.softDelete(testIdString, true);

      expect(mockRepository.save).toHaveBeenCalledWith(expect.objectContaining({ isDeleted: true }));
    });

    it('should unarchive an entity', async () => {
      mockRepository.findOneById.mockResolvedValue({ ...testDomain, isDeleted: true });
      mockRepository.save.mockResolvedValue(testDomain);

      await service.softDelete(testIdString, false);

      expect(mockRepository.save).toHaveBeenCalledWith(expect.objectContaining({ isDeleted: false }));
    });

    it('should throw error when entity not found', async () => {
      mockRepository.findOneById.mockResolvedValue(null);

      await expect(service.softDelete(testIdString, true)).rejects.toThrow('Resource not found');
    });
  });

  describe('paginate', () => {
    it('should return paginated results with default values', async () => {
      mockRepository.findAndCount.mockResolvedValue([[testDomain], 1]);

      const result: ResponsePaginate<Domain> = await service.paginate(undefined, undefined);

      expect(result.data).toEqual([testDomain]);
      expect(result.count).toBe(1);
      expect(mockRepository.findAndCount).toHaveBeenCalledWith(
        expect.objectContaining({
          onlyNotDeleted: true,
          take: PaginationConstants.DEFAULT_TAKE,
          skip: PaginationConstants.DEFAULT_SKIP,
        })
      );
    });

    it('should return paginated results with custom take and skip', async () => {
      mockRepository.findAndCount.mockResolvedValue([[testDomain], 1]);

      await service.paginate(5, 10);

      expect(mockRepository.findAndCount).toHaveBeenCalledWith(
        expect.objectContaining({
          take: 5,
          skip: 10,
        })
      );
    });
  });

  describe('findAndCount', () => {
    it('should return results with count', async () => {
      mockRepository.findAndCount.mockResolvedValue([[testDomain], 1]);

      const result: ResponsePaginate<Domain> = await service.findAndCount({});

      expect(result.data).toEqual([testDomain]);
      expect(result.count).toBe(1);
    });
  });

  describe('clear', () => {
    it('should clear the collection', async () => {
      mockRepository.clear.mockResolvedValue();

      await service.clear();

      expect(mockRepository.clear).toHaveBeenCalled();
    });
  });

  describe('search', () => {
    it('should search with attributes', async () => {
      mockRepository.findAndCount.mockResolvedValue([[testDomain], 1]);

      const result: SearchResponse<Domain> = await service.search({
        attributes: [{ key: 'name', value: 'Test', comparator: ComparatorEnum.EQUALS }],
        orders: {},
        type: ComparisonTypeEnum.AND,
        isPaginable: true,
        take: 10,
        skip: 0,
        enumValidation: [OrderEnum.ASC],
      });

      expect(result.data).toEqual([testDomain]);
      expect(result.count).toBe(1);
      expect(mockRepository.findAndCount).toHaveBeenCalledWith(
        expect.objectContaining({
          attributes: [{ key: 'name', value: 'Test', comparator: ComparatorEnum.EQUALS }],
          comparisonType: ComparisonTypeEnum.AND,
        })
      );
    });
  });
});
