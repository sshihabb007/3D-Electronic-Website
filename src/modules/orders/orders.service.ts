import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order, OrderItem, Product } from '../../database/entities';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order) private readonly orderRepo: Repository<Order>,
    @InjectRepository(OrderItem)
    private readonly orderItemRepo: Repository<OrderItem>,
    @InjectRepository(Product)
    private readonly productRepo: Repository<Product>,
  ) {}

  async createOrder(body: {
    userId?: number;
    customerName: string;
    customerEmail: string;
    customerPhone: string;
    shippingAddress: {
      street: string;
      city: string;
      state: string;
      zipCode: string;
      country: string;
    };
    paymentMethod: 'COD' | 'STRIPE_CARD';
    items: Array<{
      productId: number;
      productName: string;
      variantName?: string;
      finishType?: string;
      primaryHex?: string;
      accentHex?: string;
      quantity: number;
      unitPrice: number;
    }>;
  }) {
    if (!body.items || body.items.length === 0) {
      throw new BadRequestException('Cart is empty');
    }
    if (!body.customerName || !body.customerEmail) {
      throw new BadRequestException('Customer name and email are required');
    }

    let subtotal = 0;
    for (const item of body.items) {
      const qty = Math.max(1, Number(item.quantity) || 1);
      const price = Number(item.unitPrice) || 0;
      subtotal += qty * price;

      if (item.productId) {
        const product = await this.productRepo.findOne({
          where: { id: item.productId },
        });
        if (product && product.stockQuantity >= qty) {
          product.stockQuantity -= qty;
          await this.productRepo.save(product);
        }
      }
    }

    const shippingCost = subtotal >= 250 ? 0 : 15.0;
    const taxAmount = Number((subtotal * 0.08).toFixed(2));
    const totalAmount = Number((subtotal + shippingCost + taxAmount).toFixed(2));

    const randomCode = Math.floor(1000 + Math.random() * 9000);
    const orderNumber = `ORD-2026-${randomCode}`;

    const savedOrder = await this.orderRepo.save(
      this.orderRepo.create({
        orderNumber,
        userId: body.userId || null,
        customerName: body.customerName,
        customerEmail: body.customerEmail,
        customerPhone: body.customerPhone || '+1 (555) 000-0000',
        shippingAddress: body.shippingAddress || {
          street: '100 Main St',
          city: 'New York',
          state: 'NY',
          zipCode: '10001',
          country: 'United States',
        },
        subtotal: Number(subtotal.toFixed(2)),
        shippingCost,
        taxAmount,
        totalAmount,
        paymentMethod: body.paymentMethod || 'STRIPE_CARD',
        paymentStatus: body.paymentMethod === 'COD' ? 'PENDING' : 'PAID',
        orderStatus: 'PROCESSING',
      }),
    );

    for (const item of body.items) {
      await this.orderItemRepo.save(
        this.orderItemRepo.create({
          orderId: savedOrder.id,
          productId: item.productId || null,
          productName: item.productName,
          variantName: item.variantName || 'Custom 3D Edition',
          finishType: item.finishType || 'MATTE',
          primaryHex: item.primaryHex || '#18181b',
          accentHex: item.accentHex || '#38bdf8',
          quantity: Math.max(1, Number(item.quantity) || 1),
          unitPrice: Number(item.unitPrice) || 0,
        }),
      );
    }

    return this.findOrderByNumber(orderNumber);
  }

  async findOrderByNumber(orderNumber: string) {
    const order = await this.orderRepo.findOne({
      where: { orderNumber: orderNumber.trim().toUpperCase() },
      relations: ['items'],
    });

    if (!order) {
      throw new NotFoundException(`Order ${orderNumber} not found`);
    }
    return order;
  }

  async findOrdersByEmailOrUser(userId?: number, email?: string) {
    if (userId) {
      return this.orderRepo.find({
        where: { userId },
        relations: ['items'],
        order: { createdAt: 'DESC' },
      });
    }
    if (email) {
      return this.orderRepo.find({
        where: { customerEmail: email.trim().toLowerCase() },
        relations: ['items'],
        order: { createdAt: 'DESC' },
      });
    }
    return [];
  }
}
