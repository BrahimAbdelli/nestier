export interface TestDataGeneratorInterface {
  // Product generation
  generateProduct(overrides?: Partial<any>): any;
  generateProducts(count: number, overrides?: Partial<any>): any[];

  // Data cleanup
  cleanupGeneratedData(): void;
}
