import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import * as dotenv from 'dotenv';
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
} from './database/entities';
import { DatabaseModule } from './database/database.module';
import { AuthModule } from './modules/auth/auth.module';
import { ProductsModule } from './modules/products/products.module';
import { OrdersModule } from './modules/orders/orders.module';
import { AdminModule } from './modules/admin/admin.module';

dotenv.config();

@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: join(process.cwd(), 'public'),
      exclude: ['/api/(.*)'],
    }),
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.DB_HOST || '127.0.0.1',
      port: Number(process.env.DB_PORT) || 3306,
      username: process.env.DB_USER || 'root',
      password: process.env.DB_PASS || '',
      database: process.env.DB_NAME || '3d_electronics_db',
      entities: [
        User,
        Category,
        Product,
        Product3DConfig,
        ProductVariant,
        ProductHotspot,
        Order,
        OrderItem,
        Review,
      ],
      synchronize: true,
      logging: false,
    }),
    DatabaseModule,
    AuthModule,
    ProductsModule,
    OrdersModule,
    AdminModule,
  ],
})
export class AppModule {}
