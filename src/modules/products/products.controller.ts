import {
  Controller,
  Get,
  Post,
  Param,
  Query,
  Body,
  ParseIntPipe,
} from '@nestjs/common';
import { ProductsService } from './products.service';

@Controller('api')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get('categories')
  getCategories() {
    return this.productsService.getAllCategories();
  }

  @Get('products')
  getProducts(
    @Query('category') category?: string,
    @Query('search') search?: string,
    @Query('featured') featured?: string,
    @Query('sort') sort?: string,
    @Query('minPrice') minPrice?: string,
    @Query('maxPrice') maxPrice?: string,
  ) {
    return this.productsService.findAllProducts({
      category,
      search,
      featured,
      sort,
      minPrice,
      maxPrice,
    });
  }

  @Get('products/:identifier')
  getProduct(@Param('identifier') identifier: string) {
    return this.productsService.findOneBySlugOrId(identifier);
  }

  @Post('products/:id/reviews')
  addReview(
    @Param('id', ParseIntPipe) id: number,
    @Body()
    body: {
      reviewerName: string;
      rating: number;
      title?: string;
      comment: string;
    },
  ) {
    return this.productsService.addReview(id, body);
  }
}
