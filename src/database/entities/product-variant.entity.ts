import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Product } from './product.entity';

export type FinishType = 'MATTE' | 'METALLIC' | 'TITANIUM' | 'GLOSSY' | 'NEON';

@Entity('product_variants')
export class ProductVariant {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  productId: number;

  @ManyToOne(() => Product, (product) => product.variants, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'productId' })
  product: Product;

  @Column({ length: 100 })
  variantName: string;

  @Column({ length: 20, default: '#1e293b' })
  primaryHex: string;

  @Column({ length: 20, default: '#334155' })
  secondaryHex: string;

  @Column({ length: 20, default: '#38bdf8' })
  accentHex: string;

  @Column({
    type: 'varchar',
    length: 30,
    default: 'MATTE',
  })
  finishType: FinishType;

  @Column({ type: 'float', default: 0.25 })
  metalness: number;

  @Column({ type: 'float', default: 0.65 })
  roughness: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  priceModifier: number;

  @Column({ default: 15 })
  stockQuantity: number;
}
