export class FindAndCountCriteria {
  public take?: number;

  public skip?: number;

  public order?: Record<string, string>;

  public onlyNotDeleted?: boolean;

  public attributes?: FindAndCountAttribute[];

  public comparisonType?: string;
}

export class FindAndCountAttribute {
  public key: string;

  public value: unknown;

  public comparator: string;
}
