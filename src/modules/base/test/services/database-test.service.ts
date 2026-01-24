import { Injectable } from '@nestjs/common';
import { DataSource, ObjectLiteral, Repository } from 'typeorm';
import { DatabaseTestInterface } from '../interfaces/database-test.interface';
import { Logger } from '@shared/common/logger/logger.service';

@Injectable()
export class DatabaseTestService implements DatabaseTestInterface {
  private collectionBackups: Map<string, any[]> = new Map();

  constructor(private readonly dataSource: DataSource, private readonly logger: Logger) { }

  async clearCollection(collectionName: string): Promise<void> {
    try {
      const repository: Repository<ObjectLiteral> = this.dataSource.getRepository(collectionName);
      await repository.clear();
      this.logger.logQuery(`Collection ${collectionName} cleared successfully`);
    } catch (error: unknown) {
      this.logger.logQueryError(`Failed to clear collection ${collectionName}:`, error.toString());
      try {
        const repository: Repository<ObjectLiteral> = this.dataSource.getRepository(collectionName);
        await repository.delete({});
        this.logger.logQuery(`Collection ${collectionName} cleared using delete method`);
      } catch (error: unknown) {
        this.logger.logQueryError(`Collection ${collectionName} does not exist or cannot be cleared`, error.toString());
      }
    }
  }

  async backupCollection(collectionName: string): Promise<void> {
    try {
      const repository: Repository<ObjectLiteral> = this.dataSource.getRepository(collectionName);
      const data: ObjectLiteral[] = await repository.find();
      this.collectionBackups.set(collectionName, data);
      this.logger.logQuery(`Collection ${collectionName} backed up with ${data.length} records`);
    } catch (error: unknown) {
      this.logger.logQueryError(`Failed to backup collection ${collectionName}:`, error.toString());
    }
  }

  async restoreCollection(collectionName: string): Promise<void> {
    const backup = this.collectionBackups.get(collectionName);
    if (backup) {
      try {
        const repository: Repository<ObjectLiteral> = this.dataSource.getRepository(collectionName);
        await repository.save(backup);
        this.logger.logQuery(`Collection ${collectionName} restored with ${backup.length} records`);
        this.collectionBackups.delete(collectionName);
      } catch (error: unknown) {
        this.logger.logQueryError(`Failed to restore collection ${collectionName}:`, error.toString());
      }
    }
  }

  async insertData(collectionName: string, data: any[]): Promise<void> {
    try {
      const repository: Repository<ObjectLiteral> = this.dataSource.getRepository(collectionName);
      await repository.save(data);
      this.logger.logQuery(`${data.length} records inserted into ${collectionName}`);
    } catch (error: unknown) {
      this.logger.logQueryError(`Failed to insert data into collection ${collectionName}:`, error.toString());
      throw error;
    }
  }

  async deleteData(collectionName: string, criteria: any): Promise<void> {
    try {
      const repository: Repository<ObjectLiteral> = this.dataSource.getRepository(collectionName);
      await repository.delete(criteria);
      this.logger.logQuery(`Data deleted from ${collectionName} based on criteria`);
    } catch (error: unknown) {
      this.logger.logQueryError(`Failed to delete data from ${collectionName}:`, error.toString());
      throw error;
    }
  }

  async getData(collectionName: string, criteria?: any): Promise<any[]> {
    try {
      const repository: Repository<ObjectLiteral> = this.dataSource.getRepository(collectionName);
      if (criteria) {
        return await repository.find({ where: criteria });
      }
      return await repository.find();
    } catch (error: unknown) {
      this.logger.logQueryError(`Failed to get data from ${collectionName}:`, error.toString());
      return [];
    }
  }

  async batchInsert(collectionName: string, data: any[], batchSize: number = 1000): Promise<void> {
    try {
      const repository: Repository<ObjectLiteral> = this.dataSource.getRepository(collectionName);

      for (let i = 0; i < data.length; i += batchSize) {
        const batch: any[] = data.slice(i, i + batchSize);
        // eslint-disable-next-line no-await-in-loop
        await repository.save(batch);
        this.logger.logQuery(`Batch ${Math.floor(i / batchSize) + 1} inserted into ${collectionName}`);
      }

      this.logger.logQuery(`All ${data.length} records inserted into ${collectionName} in batches`);
    } catch (error: unknown) {
      this.logger.logQueryError(`Failed to batch insert into ${collectionName}:`, error.toString());
      throw error;
    }
  }

  async batchDelete(collectionName: string, criteria: any, batchSize: number = 1000): Promise<void> {
    try {
      const repository: Repository<ObjectLiteral> = this.dataSource.getRepository(collectionName);
      const records: ObjectLiteral[] = await repository.find({ where: criteria, select: ['id'] });
      const ids: any[] = records.map(r => r.id);

      for (let i = 0; i < ids.length; i += batchSize) {
        const batchIds = ids.slice(i, i + batchSize);
        // eslint-disable-next-line no-await-in-loop
        await repository.delete(batchIds);
        this.logger.logQuery(`Batch ${Math.floor(i / batchSize) + 1} deleted from ${collectionName}`);
      }

      this.logger.logQuery(`All ${ids.length} records deleted from ${collectionName} in batches`);
    } catch (error: unknown) {
      this.logger.logQueryError(`Failed to batch delete from ${collectionName}:`, error.toString());
      throw error;
    }
  }
}

