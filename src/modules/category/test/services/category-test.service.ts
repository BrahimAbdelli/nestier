import { Injectable } from '@nestjs/common';
import { Logger } from '@shared/common/logger/logger.service';
import { Repository } from 'typeorm';
import { CategoryEntity } from '../../infrastructure/entities/category.entity';
import { CreateCategoryDto } from '../../presentation/dtos/create-category.dto';
import { CategoryTestInterface } from '../interfaces/category-test.interface';
import { mockCategoryArrayFactory, mockCategoryFactory } from '../mocks/category.mock';
import { ObjectId } from 'mongodb';

@Injectable()
export class CategoryTestService implements CategoryTestInterface {
  private testCategories: CategoryEntity[] = [];

  constructor(
    private readonly categoryRepository: Repository<CategoryEntity>,
    private readonly logger: Logger,
  ) { }

  async clearCategories(): Promise<void> {
    try {
      await this.categoryRepository.clear();
      this.logger.log('Categories collection cleared successfully');
    } catch (error: any) {
      if ((error.name === 'MongoError' || error.name === 'MongoServerError') && error.code === 26) {
        this.logger.logQueryError('Collection does not exist. Unable to clear.', error.message);
        return;
      }
      this.logger.logQueryError('An error occurred:', error.toString());
    }
  }

  async insertTestCategories(count: number): Promise<void> {
    const categoryDtos: CreateCategoryDto[] = mockCategoryArrayFactory(count);

    const categories: CategoryEntity[] = categoryDtos.map((dto: CreateCategoryDto): CategoryEntity => {
      const entity: CategoryEntity = new CategoryEntity();
      entity.name = dto.name;
      entity.quantity = dto.quantity;
      entity.description = dto.description;
      entity.isDeleted = false;
      entity.userCreated = new ObjectId('65f9f7dec2cd92ee90d80fa3');
      entity.userUpdated = new ObjectId('65f9f7dec2cd92ee90d80fa3');
      return entity;
    });

    try {
      const savedCategories: CategoryEntity[] = await this.categoryRepository.save(categories);
      this.testCategories = savedCategories;
      this.logger.logQuery(`${savedCategories.length} test categories inserted successfully`);
    } catch (error: unknown) {
      this.logger.logQueryError('Failed to insert test categories:', (error as Error).message);
      throw error;
    }
  }

  public getTestCategories(): Promise<CategoryEntity[]> {
    return this.categoryRepository.find();
  }

  public generateTestCategory(overrides?: Partial<CreateCategoryDto>): CreateCategoryDto {
    return mockCategoryFactory(overrides);
  }

  public generateTestCategories(count: number, overrides?: Partial<CreateCategoryDto>): CreateCategoryDto[] {
    return mockCategoryArrayFactory(count, overrides);
  }

  public async cleanupAfterTest(): Promise<void> {
    if (this.testCategories.length > 0) {
      try {
        await this.categoryRepository.remove(this.testCategories);
        this.logger.logQuery('Test categories cleaned up successfully');
        this.testCategories = [];
      } catch (error: unknown) {
        this.logger.logQueryError('Failed to cleanup test categories:', error.toString());
      }
    }
  }
}

