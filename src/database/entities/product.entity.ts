import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToOne,
  OneToMany,
  CreateDateColumn,
  JoinColumn,
} from 'typeorm';
import { Category } from './category.entity';
import { Product3DConfig } from './product-3d-config.entity';
import { ProductVariant } from './product-variant.entity';
import { ProductHotspot } from './product-hotspot.entity';
import { Review } from './review.entity';

@Entity('products')
export class Product {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  categoryId: number;

  @ManyToOne(() => Category, (category) => category.products, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'categoryId' })
  category: Category;

  @Column({ length: 160 })
  name: string;

  @Column({ length: 180, unique: true })
  slug: string;

  @Column({ length: 80, unique: true })
  sku: string;

  @Column({ length: 100 })
  brand: string;

  @Column({ length: 255, nullable: true })
  tagline: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  basePrice: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  salePrice: number;

  @Column({ default: 25 })
  stockQuantity: number;

  @Column({ default: false })
  isFeatured: boolean;

  @Column({ default: true })
  isActive: boolean;

  @Column({ type: 'simple-json', nullable: true })
  technicalSpecs: Record<string, string>;

  @Column({ length: 255, nullable: true })
  badgeText: string;

  @Column({ type: 'decimal', precision: 3, scale: 2, default: 4.8 })
  ratingAverage: number;

  @Column({ default: 0 })
  reviewCount: number;

  @OneToOne(() => Product3DConfig, (config) => config.product, {
    cascade: true,
    eager: true,
  })
  config3d: Product3DConfig;

  @OneToMany(() => ProductVariant, (variant) => variant.product, {
    cascade: true,
    eager: true,
  })
  variants: ProductVariant[];

  @OneToMany(() => ProductHotspot, (hotspot) => hotspot.product, {
    cascade: true,
    eager: true,
  })
  hotspots: ProductHotspot[];

  @OneToMany(() => Review, (review) => review.product, {
    cascade: true,
  })
  reviews: Review[];

  @CreateDateColumn()
  createdAt: Date;
}
