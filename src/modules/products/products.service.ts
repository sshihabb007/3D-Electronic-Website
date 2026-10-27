import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  Product,
  Category,
  Review,
} from '../../database/entities';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepo: Repository<Product>,
    @InjectRepository(Category)
    private readonly categoryRepo: Repository<Category>,
    @InjectRepository(Review)
    private readonly reviewRepo: Repository<Review>,
  ) {}

  async getAllCategories() {
    return this.categoryRepo.find({
      order: { displayOrder: 'ASC' },
    });
  }

  async findAllProducts(query: {
    category?: string;
    search?: string;
    featured?: string;
    sort?: string;
    minPrice?: string;
    maxPrice?: string;
  }) {
    const qb = this.productRepo
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.category', 'category')
      .leftJoinAndSelect('product.config3d', 'config3d')
      .leftJoinAndSelect('product.variants', 'variants')
      .leftJoinAndSelect('product.hotspots', 'hotspots')
      .where('product.isActive = :isActive', { isActive: true });

    if (query.category && query.category !== 'all') {
      qb.andWhere('category.slug = :catSlug', { catSlug: query.category });
    }

    if (query.featured === 'true') {
      qb.andWhere('product.isFeatured = :featured', { featured: true });
    }

    if (query.search && query.search.trim()) {
      const s = `%${query.search.trim().toLowerCase()}%`;
      qb.andWhere(
        '(LOWER(product.name) LIKE :s OR LOWER(product.brand) LIKE :s OR LOWER(product.tagline) LIKE :s)',
        { s },
      );
    }

    if (query.minPrice) {
      qb.andWhere('COALESCE(product.salePrice, product.basePrice) >= :minP', {
        minP: Number(query.minPrice),
      });
    }

    if (query.maxPrice) {
      qb.andWhere('COALESCE(product.salePrice, product.basePrice) <= :maxP', {
        maxP: Number(query.maxPrice),
      });
    }

    if (query.sort === 'price_asc') {
      qb.orderBy('product.salePrice', 'ASC');
    } else if (query.sort === 'price_desc') {
      qb.orderBy('product.salePrice', 'DESC');
    } else if (query.sort === 'rating') {
      qb.orderBy('product.ratingAverage', 'DESC');
    } else {
      qb.orderBy('product.isFeatured', 'DESC').addOrderBy('product.id', 'ASC');
    }

    return qb.getMany();
  }

  async findOneBySlugOrId(identifier: string) {
    const isNumeric = /^\d+$/.test(identifier);
    const product = await this.productRepo.findOne({
      where: isNumeric ? { id: Number(identifier) } : { slug: identifier },
      relations: ['category', 'config3d', 'variants', 'hotspots', 'reviews'],
    });

    if (!product) {
      throw new NotFoundException(`Product '${identifier}' not found`);
    }

    return product;
  }

  async addReview(
    productId: number,
    data: {
      reviewerName: string;
      rating: number;
      title?: string;
      comment: string;
      userId?: number;
    },
  ) {
    const product = await this.productRepo.findOne({
      where: { id: productId },
    });
    if (!product) {
      throw new NotFoundException('Product not found');
    }

    const rating = Math.min(5, Math.max(1, Number(data.rating) || 5));
    const review = await this.reviewRepo.save(
      this.reviewRepo.create({
        productId,
        userId: data.userId || null,
        reviewerName: data.reviewerName || 'Verified Shopper',
        rating,
        title: data.title || 'Great 3D product experience!',
        comment: data.comment,
        isVerifiedPurchase: true,
      }),
    );

    const allReviews = await this.reviewRepo.find({ where: { productId } });
    const avg =
      allReviews.reduce((acc, r) => acc + Number(r.rating), 0) /
      allReviews.length;

    product.ratingAverage = Number(avg.toFixed(2));
    product.reviewCount = allReviews.length;
    await this.productRepo.save(product);

    return review;
  }
}
