export interface DatabaseTestInterface {
  // Collection operations
  clearCollection(collectionName: string): Promise<void>;
  backupCollection(collectionName: string): Promise<void>;
  restoreCollection(collectionName: string): Promise<void>;

  // Data operations
  insertData(collectionName: string, data: any[]): Promise<void>;
  deleteData(collectionName: string, criteria: any): Promise<void>;
  getData(collectionName: string, criteria?: any): Promise<any[]>;

  // Batch operations
  batchInsert(collectionName: string, data: any[], batchSize?: number): Promise<void>;
  batchDelete(collectionName: string, criteria: any, batchSize?: number): Promise<void>;
}
