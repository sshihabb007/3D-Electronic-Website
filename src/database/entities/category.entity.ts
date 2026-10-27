import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
} from 'typeorm';
import { Product } from './product.entity';

@Entity('categories')
export class Category {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100 })
  name: string;

  @Column({ length: 120, unique: true })
  slug: string;

  @Column({ length: 80, default: 'cube' })
  icon: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ default: 0 })
  displayOrder: number;

  @OneToMany(() => Product, (product) => product.category)
  products: Product[];
}
