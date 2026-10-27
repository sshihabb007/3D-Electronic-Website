import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { Product } from './product.entity';

export type ModelArchetype =
  | 'PROCEDURAL_HEADPHONE'
  | 'PROCEDURAL_PHONE'
  | 'PROCEDURAL_WATCH'
  | 'PROCEDURAL_EARBUDS'
  | 'PROCEDURAL_SPEAKER'
  | 'PROCEDURAL_LAPTOP'
  | 'PROCEDURAL_VR_HEADSET'
  | 'PROCEDURAL_CAMERA'
  | 'PROCEDURAL_CONSOLE'
  | 'GLB_FILE';

@Entity('product_3d_configs')
export class Product3DConfig {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  productId: number;

  @OneToOne(() => Product, (product) => product.config3d, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'productId' })
  product: Product;

  @Column({
    type: 'varchar',
    length: 50,
    default: 'PROCEDURAL_HEADPHONE',
  })
  modelType: ModelArchetype;

  @Column({ length: 255, nullable: true })
  glbFileUrl: string;

  @Column({ type: 'float', default: 1.0 })
  defaultScale: number;

  @Column({ type: 'simple-json', nullable: true })
  cameraPosition: { x: number; y: number; z: number };

  @Column({ length: 40, default: 'studio' })
  defaultEnvPreset: 'studio' | 'dark' | 'neon' | 'warm';

  @Column({ default: true })
  autoRotate: boolean;

  @Column({ default: true })
  supportsExplodeView: boolean;

  @Column({ type: 'simple-json', nullable: true })
  pipelineConfig: {
    fov?: number;
    minZoom?: number;
    maxZoom?: number;
    polarAngleMin?: number;
    polarAngleMax?: number;
    autoRotateSpeed?: number;
    enableShadows?: boolean;
    enableBloom?: boolean;
    keyLightIntensity?: number;
    fillLightIntensity?: number;
    rimLightIntensity?: number;
    dracoCompressed?: boolean;
    ktx2Transcoded?: boolean;
    lodConfig?: {
      highPoly?: number;
      medPoly?: number;
      lowPoly?: number;
      activeLod?: 'HIGH' | 'MEDIUM' | 'LOW' | 'AUTO';
    };
    meshNodeMap?: Record<
      string,
      {
        slot: 'PRIMARY' | 'SECONDARY' | 'ACCENT' | 'GLASS' | 'STATIC';
        explodeVec?: { x: number; y: number; z: number };
        visible?: boolean;
      }
    >;
  };
}
