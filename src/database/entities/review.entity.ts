import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  JoinColumn,
} from 'typeorm';
import { Product } from './product.entity';
import { User } from './user.entity';

@Entity('reviews')
export class Review {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  productId: number;

  @ManyToOne(() => Product, (product) => product.reviews, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'productId' })
  product: Product;

  @Column({ nullable: true })
  userId: number;

  @ManyToOne(() => User, (user) => user.reviews, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ length: 120 })
  reviewerName: string;

  @Column({ default: 5 })
  rating: number;

  @Column({ length: 150, nullable: true })
  title: string;

  @Column({ type: 'text' })
  comment: string;

  @Column({ default: true })
  isVerifiedPurchase: boolean;

  @CreateDateColumn()
  createdAt: Date;
}
