import { createMap, Mapper } from "@automapper/core";
import { AutomapperProfile, InjectMapper } from "@automapper/nestjs";
import { Injectable } from "@nestjs/common";
import { Category } from "../../../domain/value-objects/category";
import { CategoryEntity } from "../../entities/category.entity";

@Injectable()
export class CategoryEntityMapperProfile extends AutomapperProfile {
  constructor(@InjectMapper() mapper: Mapper) {
    super(mapper);
  }

  get profile() {
    return (mapper: Mapper): void => {
      createMap(mapper, Category, CategoryEntity);
      createMap(mapper, CategoryEntity, Category);
    };
  }
}
