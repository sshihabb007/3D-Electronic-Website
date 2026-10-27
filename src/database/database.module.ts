import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  User,
  Category,
  Product,
  Product3DConfig,
  ProductVariant,
  ProductHotspot,
  Order,
  OrderItem,
  Review,
} from './entities';
import { SeedService } from './seed.service';

const ENTITIES = [
  User,
  Category,
  Product,
  Product3DConfig,
  ProductVariant,
  ProductHotspot,
  Order,
  OrderItem,
  Review,
];

@Module({
  imports: [TypeOrmModule.forFeature(ENTITIES)],
  providers: [SeedService],
  exports: [TypeOrmModule, SeedService],
})
export class DatabaseModule {}
