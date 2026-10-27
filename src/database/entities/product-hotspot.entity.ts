import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Product } from './product.entity';

@Entity('product_hotspots')
export class ProductHotspot {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  productId: number;

  @ManyToOne(() => Product, (product) => product.hotspots, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'productId' })
  product: Product;

  @Column({ length: 120 })
  title: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'float', default: 0 })
  posX: number;

  @Column({ type: 'float', default: 0.5 })
  posY: number;

  @Column({ type: 'float', default: 0.5 })
  posZ: number;

  @Column({ type: 'float', default: 1.8 })
  camX: number;

  @Column({ type: 'float', default: 1.2 })
  camY: number;

  @Column({ type: 'float', default: 2.2 })
  camZ: number;
}
