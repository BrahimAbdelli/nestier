import { Controller, Inject } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { BaseServiceInterface } from '../../../base/application/ports/base-service.interface';
import { BaseController } from '../../../base/presentation/controllers/base.controller';
import { BaseDtoMapperInterface } from '../../../base/presentation/dtos/base-dto-mapper.interface';
import { CategoryService } from '../../application/services/category.service';
import { Category } from '../../domain/value-objects/category';
import { CategoryDto, CreateCategoryDto, FindAndSearchCategoryResponseDto, UpdateCategoryDto } from '../dtos';
import { CategoryDtoMapper } from '../mappers/category-dto.mapper';

@Controller('categories')
@ApiTags('categories')
export class CategoryController extends BaseController<Category, CategoryDto, CreateCategoryDto, UpdateCategoryDto, FindAndSearchCategoryResponseDto>(
  CreateCategoryDto,
  UpdateCategoryDto,
) {
  constructor(
    @Inject(BaseServiceInterface) private readonly categoryService: CategoryService,
    @Inject(BaseDtoMapperInterface) private readonly categoryDtoMapper: CategoryDtoMapper
  ) {
    super(categoryService, categoryDtoMapper);
  }


}
