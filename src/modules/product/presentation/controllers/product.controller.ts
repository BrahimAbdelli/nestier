import { Controller, Get, Query } from '@nestjs/common';
import { ApiBadRequestResponse, ApiNotFoundResponse, ApiOkResponse, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { BaseController } from '../../../base/presentation/controllers/base.controller';
import { BaseDtoMapperInterface } from '../../../base/presentation/dtos/base-dto-mapper.interface';
import { ProductService } from '../../application/services/product.service';
import { Product } from '../../domain/value-objects/product';
import { CreateProductDto, UpdateProductDto } from '../dtos';
import { FindAndSearchProductResponseDto } from '../dtos/find-and-search-product-response.dto';
import { ProductDto } from '../dtos/product.dto';

@Controller('products')
@ApiTags('products')
@ApiNotFoundResponse({ description: 'Product not found' })
@ApiBadRequestResponse({ description: 'Invalid request data' })
export class ProductController extends BaseController<Product, ProductDto, CreateProductDto, UpdateProductDto, FindAndSearchProductResponseDto>(
  CreateProductDto,
  UpdateProductDto,
) {
  constructor(
    private readonly productService: ProductService,
    private readonly productDtoMapper: BaseDtoMapperInterface<Product, ProductDto, CreateProductDto, UpdateProductDto, FindAndSearchProductResponseDto>
  ) {
    super(productService, productDtoMapper);
  }

  @Get('expensive')
  @ApiOperation({ summary: 'Get expensive products above a price threshold' })
  @ApiQuery({ name: 'threshold', required: false, type: Number, description: 'Price threshold (default: 1000)' })
  @ApiOkResponse({ description: 'List of expensive products', type: [ProductDto] })
  public async findExpensiveProducts(@Query('threshold') threshold?: number): Promise<ProductDto[]> {
    const products: Product[] = await this.productService.findExpensiveProducts(threshold);
    return this.productDtoMapper.domainsToDtos(products);
  }

  @Get('search/name')
  @ApiOperation({ summary: 'Search products by name' })
  @ApiQuery({ name: 'name', required: true, type: String, description: 'Product name to search' })
  @ApiOkResponse({ description: 'List of products matching the name', type: [ProductDto] })
  public async findProductsByName(@Query('name') name: string): Promise<ProductDto[]> {
    const products: Product[] = await this.productService.findProductsByName(name);
    return this.productDtoMapper.domainsToDtos(products);
  }
}
