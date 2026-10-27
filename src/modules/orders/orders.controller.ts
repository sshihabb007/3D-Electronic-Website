import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  Query,
} from '@nestjs/common';
import { OrdersService } from './orders.service';

@Controller('api/orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  createOrder(@Body() body: any) {
    return this.ordersService.createOrder(body);
  }

  @Get('track/:orderNumber')
  trackOrder(@Param('orderNumber') orderNumber: string) {
    return this.ordersService.findOrderByNumber(orderNumber);
  }

  @Get('lookup')
  lookupOrders(
    @Query('userId') userId?: string,
    @Query('email') email?: string,
  ) {
    return this.ordersService.findOrdersByEmailOrUser(
      userId ? Number(userId) : undefined,
      email,
    );
  }
}
