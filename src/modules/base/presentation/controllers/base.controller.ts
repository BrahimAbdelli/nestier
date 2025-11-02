import { Body, Delete, Get, Inject, Param, Patch, Post, Put, Query, Type, UsePipes } from '@nestjs/common';
import { ApiBody, ApiQuery, ApiResponse } from '@nestjs/swagger';
import { AbstractValidationPipe } from '@shared/common/pipes';
import { ValidateObjectIdPipe } from '@shared/common/pipes/validate-object-id.pipe';
import { SearchResponse } from '@shared/common/search/domains/search-response';
import { QueryDto } from '@shared/common/search/dtos/query.dto';
import { SearchResponseDto } from '@shared/common/search/dtos/search-response.dto';
import { ResponsePaginate } from '@shared/common/types/response-paginate.type';
import { ResponsePaginateDto } from '@shared/common/types/response-paginate.type.dto';
import { BaseControllerInterface } from '../../application/ports/base-controller.interface';
import { BaseServiceInterface } from '../../application/ports/base-service.interface';
import { Base } from '../../domain/value-objects/base';
import { BaseDtoMapperInterface } from '../../presentation/dtos/base-dto-mapper.interface';
import { BaseDto } from '../../presentation/dtos/dtos/base.dto';

export function BaseController<T extends Base, B extends BaseDto, CreateDtoType, UpdateDtoType, FindAndSearchDto>(
  CreateDto: Type<CreateDtoType>,
  UpdateDto: Type<UpdateDtoType>,
): Type<BaseControllerInterface<T, B, CreateDtoType, UpdateDtoType, FindAndSearchDto>> {
  const createPipe: AbstractValidationPipe = new AbstractValidationPipe(
    { whitelist: true, transform: true },
    { body: CreateDto }
  );
  const updatePipe: AbstractValidationPipe = new AbstractValidationPipe(
    { whitelist: true, transform: true },
    { body: UpdateDto }
  );

  class GenericsController<T extends Base, B extends BaseDto, CreateDtoType, UpdateDtoType, FindAndSearchDto>
    implements BaseControllerInterface<T, B, CreateDtoType, UpdateDtoType, FindAndSearchDto> {
    protected readonly mapper: BaseDtoMapperInterface<T, B, CreateDtoType, UpdateDtoType, FindAndSearchDto>;

    constructor(
      @Inject(BaseServiceInterface) private readonly service: BaseServiceInterface<T>,
      mapper: BaseDtoMapperInterface<T, B, CreateDtoType, UpdateDtoType, FindAndSearchDto>
    ) {
      this.mapper = mapper;
    }

    @Get()
    public async findAll(): Promise<FindAndSearchDto[]> {
      const domains: T[] = await this.service.findAll();
      return this.mapper.domainsToFindAndSearchDtos(domains);
    }

    @Get('paginate')
    @ApiQuery({ allowEmptyValue: true, name: 'take' })
    @ApiQuery({ allowEmptyValue: true, name: 'skip' })
    @ApiResponse({ description: 'returns results of pagination' })
    public async paginate(@Query('take') take: number, @Query('skip') skip: number): Promise<ResponsePaginateDto<B>> {
      const response: ResponsePaginate<T> = await this.service.paginate(+take, +skip);
      return this.mapper.domainToResponsePaginateDto(response);
    }

    @Get('find/:id')
    @ApiQuery({
      name: '_id',
      type: 'string',
      allowEmptyValue: false,
      description: 'used to update an object inside our database',
      required: true,
    })
    public findOne(@Param(new ValidateObjectIdPipe('')) id): Promise<T> {
      return this.service.findOneById(id);
    }

    @Post()
    @UsePipes(createPipe)
    @ApiBody({ type: [CreateDto], required: true, description: 'used to create an object inside our database' })
    @ApiResponse({ description: 'returns the created entity' })
    public async create(@Body() dto: CreateDtoType): Promise<void> {
      const domain: T = this.mapper.createDtoToDomain(dto);
      await this.service.create(domain);
    }

    @Put(':id')
    @UsePipes(updatePipe)
    @ApiBody({ type: [UpdateDto] })
    @ApiQuery({
      name: '_id',
      type: 'string',
      allowEmptyValue: false,
      description: 'used to update an object inside our database',
      required: true,
    })
    public async update(@Param(new ValidateObjectIdPipe('')) id, @Body() dto: UpdateDtoType): Promise<B> {
      const domain: T = this.mapper.updateDtoToDomain(dto);
      domain._id = id;
      const updatedDomain: T = await this.service.update(domain);
      return this.mapper.domainToDto(updatedDomain);
    }

    @Patch('archive/:id')
    @ApiQuery({
      name: '_id',
      type: 'string',
      allowEmptyValue: false,
      description: 'used to archive an object inside our database',
      required: true,
    })
    public async archive(@Param(new ValidateObjectIdPipe('')) id): Promise<void> {
      await this.service.softDelete(id, true);
    }

    @Patch('unarchive/:id')
    @ApiQuery({
      name: '_id',
      type: 'string',
      allowEmptyValue: false,
      description: 'used to unarchive an object inside our database',
      required: true,
    })
    public async unarchive(@Param(new ValidateObjectIdPipe('')) id): Promise<void> {
      await this.service.softDelete(id, false);
    }

    @Delete(':id')
    @ApiQuery({
      name: '_id',
      type: 'string',
      allowEmptyValue: false,
      description: 'used to delete an object inside our database',
      required: true,
    })
    public delete(@Param(new ValidateObjectIdPipe('')) id): Promise<void> {
      return this.service.delete(id);
    }

    @Delete()
    @ApiQuery({
      description: 'This api clears the collections',
    })
    public clear(): Promise<void> {
      return this.service.clear();
    }

    @Get('search')
    @ApiBody({
      type: [QueryDto],
      description: 'This api returns results after querying from the database',
      required: true,
      examples: {
        searchExample: {
          summary: 'Search with multiple criteria',
          description: 'Example of a search query with filters, sorting, and pagination',
          value: {
            take: 5,
            skip: 0,
            attributes: [
              {
                key: "name",
                value: "p",
                comparator: "LIKE"
              },
              {
                key: "isDeleted",
                value: false,
                comparator: "EQUALS"
              }
            ],
            orders: {
              name: "ASC",
              price: "DESC"
            },
            type: "AND",
            isPaginable: false
          }
        }
      }
    })
    public async search(@Body() queryDto: QueryDto<B>): Promise<SearchResponseDto<B>> {
      const queryDomain = this.mapper.queryDtoToDomain(queryDto);
      const searchResult: SearchResponse<T> = await this.service.search(queryDomain);
      return this.mapper.domainToResponsePaginateDto(searchResult);
    }
  }
  return GenericsController;
}
