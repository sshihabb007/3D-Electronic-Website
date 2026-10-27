import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import {
  User,
  Category,
  Product,
  Product3DConfig,
  ProductVariant,
  ProductHotspot,
  Review,
  Order,
  OrderItem,
} from './entities';

@Injectable()
export class SeedService implements OnModuleInit {
  private readonly logger = new Logger(SeedService.name);

  constructor(
    @InjectRepository(User) private readonly userRepo: Repository<User>,
    @InjectRepository(Category) private readonly categoryRepo: Repository<Category>,
    @InjectRepository(Product) private readonly productRepo: Repository<Product>,
    @InjectRepository(Product3DConfig)
    private readonly config3dRepo: Repository<Product3DConfig>,
    @InjectRepository(ProductVariant)
    private readonly variantRepo: Repository<ProductVariant>,
    @InjectRepository(ProductHotspot)
    private readonly hotspotRepo: Repository<ProductHotspot>,
    @InjectRepository(Review) private readonly reviewRepo: Repository<Review>,
    @InjectRepository(Order) private readonly orderRepo: Repository<Order>,
    @InjectRepository(OrderItem)
    private readonly orderItemRepo: Repository<OrderItem>,
  ) {}

  async onModuleInit() {
    await this.seedDatabase();
  }

  async seedDatabase() {
    const existingProducts = await this.productRepo.count();
    if (existingProducts > 0) {
      this.logger.log(
        `Database already contains ${existingProducts} products. Skipping initial seed.`,
      );
      return;
    }

    this.logger.log('Seeding 3D Interactive Electronics Database...');

    // 1. Seed Users
    const adminPassword = await bcrypt.hash('admin123', 10);
    const customerPassword = await bcrypt.hash('customer123', 10);

    const adminUser = await this.userRepo.save(
      this.userRepo.create({
        fullName: 'Store Administrator',
        email: 'admin@3dstore.com',
        passwordHash: adminPassword,
        role: 'ADMIN',
        phone: '+1 (555) 010-9999',
        shippingAddress: {
          street: '742 Innovation Way',
          city: 'San Francisco',
          state: 'CA',
          zipCode: '94107',
          country: 'United States',
        },
      }),
    );

    const demoCustomer = await this.userRepo.save(
      this.userRepo.create({
        fullName: 'Alex Mercer',
        email: 'alex@example.com',
        passwordHash: customerPassword,
        role: 'CUSTOMER',
        phone: '+1 (555) 234-5678',
        shippingAddress: {
          street: '1200 Tech Plaza Apt 4B',
          city: 'Austin',
          state: 'TX',
          zipCode: '78701',
          country: 'United States',
        },
      }),
    );

    // 2. Seed Categories
    const categoriesData = [
      {
        name: 'Headphones',
        slug: 'headphones',
        icon: 'headphones',
        description:
          'Studio-grade over-ear ANC headphones with spatial audio and custom 3D finishes.',
        displayOrder: 1,
      },
      {
        name: 'Smartphones',
        slug: 'smartphones',
        icon: 'smartphone',
        description:
          'Flagship 5G smartphones crafted with aerospace titanium and pro camera systems.',
        displayOrder: 2,
      },
      {
        name: 'Smartwatches',
        slug: 'smartwatches',
        icon: 'watch',
        description:
          'Precision biometric smartwatches with sapphire crystal AMOLED displays.',
        displayOrder: 3,
      },
      {
        name: 'Wireless Earbuds',
        slug: 'earbuds',
        icon: 'earbuds',
        description:
          'Ultra-low latency true wireless earbuds with adaptive noise cancellation.',
        displayOrder: 4,
      },
      {
        name: 'Spatial Speakers',
        slug: 'speakers',
        icon: 'speaker',
        description:
          '360-degree omnidirectional acoustic speakers with reactive ambient lighting.',
        displayOrder: 5,
      },
    ];

    const savedCategories: Record<string, Category> = {};
    for (const cat of categoriesData) {
      savedCategories[cat.slug] = await this.categoryRepo.save(
        this.categoryRepo.create(cat),
      );
    }

    // 3. Seed Flagship 3D Products
    const productsCatalog = [
      {
        category: savedCategories['headphones'],
        name: 'Aether Pro Max ANC',
        slug: 'aether-pro-max-anc',
        sku: 'AETH-HP-001',
        brand: 'Aether Audio',
        tagline: '45mm Beryllium Planar Drivers with 60-Hour Adaptive ANC',
        description:
          'Engineered with CNC-machined aluminum earcups, memory-foam acoustic seals, and dual-chip active noise cancellation. Rotate in 360° and customize the anodized shell, headband arch, and neon acoustic ring in real time.',
        basePrice: 399.0,
        salePrice: 349.0,
        stockQuantity: 42,
        isFeatured: true,
        badgeText: 'FLAGSHIP 3D',
        ratingAverage: 4.95,
        reviewCount: 128,
        technicalSpecs: {
          Driver: '45mm Custom Beryllium Planar Magnetic',
          'Noise Cancellation': 'Hybrid 8-Mic Adaptive ANC (-48dB)',
          'Battery Life': '60 Hours (ANC On) / 80 Hours (Standard)',
          Connectivity: 'Bluetooth 5.4 Ultra-Lossless + USB-C DAC',
          Weight: '312g Aerospace Alloy Frame',
          Audio: 'Dolby Atmos Spatial Audio + Head Tracking',
        },
        config3d: {
          modelType: 'PROCEDURAL_HEADPHONE' as const,
          defaultScale: 1.0,
          cameraPosition: { x: 2.3, y: 1.1, z: 2.8 },
          defaultEnvPreset: 'studio' as const,
          autoRotate: true,
          supportsExplodeView: true,
        },
        variants: [
          {
            variantName: 'Obsidian Matte Black',
            primaryHex: '#18181b',
            secondaryHex: '#27272a',
            accentHex: '#38bdf8',
            finishType: 'MATTE' as const,
            metalness: 0.2,
            roughness: 0.78,
            priceModifier: 0,
            stockQuantity: 18,
          },
          {
            variantName: 'Titanium Silver Alloy',
            primaryHex: '#cbd5e1',
            secondaryHex: '#475569',
            accentHex: '#6366f1',
            finishType: 'TITANIUM' as const,
            metalness: 0.88,
            roughness: 0.22,
            priceModifier: 20,
            stockQuantity: 12,
          },
          {
            variantName: 'Cyber Neon Pulse',
            primaryHex: '#0f172a',
            secondaryHex: '#1e1b4b',
            accentHex: '#00f5d4',
            finishType: 'NEON' as const,
            metalness: 0.55,
            roughness: 0.3,
            priceModifier: 30,
            stockQuantity: 8,
          },
          {
            variantName: 'Crimson Metallic Edition',
            primaryHex: '#991b1b',
            secondaryHex: '#1f2937',
            accentHex: '#f59e0b',
            finishType: 'METALLIC' as const,
            metalness: 0.92,
            roughness: 0.18,
            priceModifier: 25,
            stockQuantity: 10,
          },
        ],
        hotspots: [
          {
            title: '45mm Beryllium Acoustic Chamber',
            description:
              'Ultra-rigid acoustic driver dome eliminates distortion even at 115dB studio reference volume.',
            posX: 0.95,
            posY: -0.35,
            posZ: 0.25,
            camX: 2.1,
            camY: -0.2,
            camZ: 1.5,
          },
          {
            title: 'Zero-Gravity Spring Steel Headband',
            description:
              'Breathable micro-mesh suspension canopy distributes weight evenly for all-day comfort.',
            posX: 0.0,
            posY: 1.25,
            posZ: 0.0,
            camX: 0.0,
            camY: 2.2,
            camZ: 2.0,
          },
          {
            title: 'Tactile Digital Crown & ANC Toggle',
            description:
              'Precision-milled rotary dial for granular volume control and instant transparency mode switching.',
            posX: -0.95,
            posY: -0.55,
            posZ: 0.35,
            camX: -2.1,
            camY: -0.4,
            camZ: 1.6,
          },
        ],
      },
      {
        category: savedCategories['smartphones'],
        name: 'Nova X1 Ultra 5G',
        slug: 'nova-x1-ultra-5g',
        sku: 'NOVA-PH-002',
        brand: 'Nova Mobile',
        tagline: 'Grade-5 Titanium Unibody • 200MP Periscope Quad Camera',
        description:
          'Experience desktop-class raytracing and AI photography in a Grade-5 Titanium enclosure. Features a 6.85" 3000-nit LTPO OLED borderless display, periscope 10x optical zoom, and customizable matte/titanium back glass.',
        basePrice: 1099.0,
        salePrice: 999.0,
        stockQuantity: 35,
        isFeatured: true,
        badgeText: 'BEST SELLER',
        ratingAverage: 4.92,
        reviewCount: 214,
        technicalSpecs: {
          Display: '6.85" 144Hz LTPO AMOLED (3200 x 1440, 3000 nits)',
          Processor: '3nm Quantum Core X4 Octa-Core + Neural NPU',
          Camera: '200MP Main OIS + 50MP 10x Periscope + 50MP Ultrawide',
          Battery: '5600mAh Silicon-Carbon • 100W HyperCharge',
          Storage: '512GB UFS 4.0 + 16GB LPDDR5X RAM',
          Protection: 'IP68 Water Resistant • Ceramic Shield Pro',
        },
        config3d: {
          modelType: 'PROCEDURAL_PHONE' as const,
          defaultScale: 1.05,
          cameraPosition: { x: 1.9, y: 0.8, z: 2.6 },
          defaultEnvPreset: 'studio' as const,
          autoRotate: true,
          supportsExplodeView: true,
        },
        variants: [
          {
            variantName: 'Natural Grade-5 Titanium',
            primaryHex: '#94a3b8',
            secondaryHex: '#334155',
            accentHex: '#38bdf8',
            finishType: 'TITANIUM' as const,
            metalness: 0.9,
            roughness: 0.24,
            priceModifier: 0,
            stockQuantity: 15,
          },
          {
            variantName: 'Stealth Matte Phantom',
            primaryHex: '#0f172a',
            secondaryHex: '#1e293b',
            accentHex: '#a855f7',
            finishType: 'MATTE' as const,
            metalness: 0.18,
            roughness: 0.8,
            priceModifier: 0,
            stockQuantity: 10,
          },
          {
            variantName: 'Aurora Cyber Matrix',
            primaryHex: '#111827',
            secondaryHex: '#064e3b',
            accentHex: '#10b981',
            finishType: 'NEON' as const,
            metalness: 0.65,
            roughness: 0.25,
            priceModifier: 50,
            stockQuantity: 6,
          },
          {
            variantName: 'Desert Gold Metallic',
            primaryHex: '#d4af37',
            secondaryHex: '#451a03',
            accentHex: '#fbbf24',
            finishType: 'METALLIC' as const,
            metalness: 0.95,
            roughness: 0.15,
            priceModifier: 40,
            stockQuantity: 8,
          },
        ],
        hotspots: [
          {
            title: '200MP Periscope Camera Array',
            description:
              'Laser autofocus, sapphire lens rings, and 10x lossless optical zoom with gimbal OIS.',
            posX: -0.28,
            posY: 0.72,
            posZ: -0.12,
            camX: -1.2,
            camY: 1.1,
            camZ: -1.8,
          },
          {
            title: '3000-Nit LTPO Infinity Display',
            description:
              '1Hz–144Hz adaptive refresh rate with ultrasonic under-display fingerprint scanner.',
            posX: 0.0,
            posY: 0.1,
            posZ: 0.12,
            camX: 0.0,
            camY: 0.2,
            camZ: 2.3,
          },
          {
            title: 'Aerospace Titanium Rail & Action Key',
            description:
              'Programmable tactile shortcut button for instant camera shutter or AI voice assistant.',
            posX: 0.65,
            posY: 0.3,
            posZ: 0.0,
            camX: 2.0,
            camY: 0.4,
            camZ: 1.2,
          },
        ],
      },
      {
        category: savedCategories['smartwatches'],
        name: 'Chronos Titan S9 Ultra',
        slug: 'chronos-titan-s9-ultra',
        sku: 'CHRO-SW-003',
        brand: 'Chronos Wear',
        tagline: 'Sapphire Dual-Frequency GPS Watch with Bio-Optical Sensor Array',
        description:
          'Built for endurance athletes and executives alike. Features a flat sapphire crystal front, precision haptics digital crown, ECG + SpO2 health suite, and interchangeable fluoroelastomer or titanium link bands.',
        basePrice: 449.0,
        salePrice: 429.0,
        stockQuantity: 50,
        isFeatured: true,
        badgeText: 'NEW RELEASE',
        ratingAverage: 4.89,
        reviewCount: 94,
        technicalSpecs: {
          Case: '49mm Aerospace Titanium • 100m Dive Rated (EN13319)',
          Display: 'Sapphire Always-On Retina OLED (2500 nits)',
          Sensors: 'ECG, Blood Oxygen, Skin Temp, Depth Gauge, Altimeter',
          GPS: 'Precision Dual-Frequency L1 + L5 Satellite Navigation',
          Battery: '72 Hours Normal Use / 140 Hours Low Power',
          Strap: 'Quick-Release Tactical Fluoroelastomer',
        },
        config3d: {
          modelType: 'PROCEDURAL_WATCH' as const,
          defaultScale: 1.1,
          cameraPosition: { x: 2.0, y: 1.2, z: 2.4 },
          defaultEnvPreset: 'studio' as const,
          autoRotate: true,
          supportsExplodeView: true,
        },
        variants: [
          {
            variantName: 'Titanium Case / International Orange',
            primaryHex: '#94a3b8',
            secondaryHex: '#ea580c',
            accentHex: '#f97316',
            finishType: 'TITANIUM' as const,
            metalness: 0.85,
            roughness: 0.25,
            priceModifier: 0,
            stockQuantity: 20,
          },
          {
            variantName: 'Carbon Black Matte / Stealth Band',
            primaryHex: '#18181b',
            secondaryHex: '#09090b',
            accentHex: '#22d3ee',
            finishType: 'MATTE' as const,
            metalness: 0.22,
            roughness: 0.75,
            priceModifier: 0,
            stockQuantity: 15,
          },
          {
            variantName: 'Cyber Pulse Neon / Electric Blue',
            primaryHex: '#1e293b',
            secondaryHex: '#1d4ed8',
            accentHex: '#00f5d4',
            finishType: 'NEON' as const,
            metalness: 0.6,
            roughness: 0.3,
            priceModifier: 20,
            stockQuantity: 10,
          },
        ],
        hotspots: [
          {
            title: 'Sapphire Telemetry Watch Face',
            description:
              'Scratch-proof sapphire crystal with real-time compass, heart-rate zone, and elevation rings.',
            posX: 0.0,
            posY: 0.1,
            posZ: 0.32,
            camX: 0.0,
            camY: 0.3,
            camZ: 2.1,
          },
          {
            title: 'Haptic Guarded Digital Crown',
            description:
              'Machined titanium ridges allow easy rotation even while wearing diving or winter gloves.',
            posX: 0.72,
            posY: 0.15,
            posZ: 0.05,
            camX: 1.9,
            camY: 0.3,
            camZ: 1.1,
          },
          {
            title: 'Bio-Optical Ceramic Back Array',
            description:
              '8-photodiode array measures SpO2, heart rate variability, and arterial stiffness continuously.',
            posX: 0.0,
            posY: -0.05,
            posZ: -0.28,
            camX: 0.3,
            camY: -0.2,
            camZ: -2.2,
          },
        ],
      },
      {
        category: savedCategories['earbuds'],
        name: 'SonicPods Pro 3 ANC',
        slug: 'sonicpods-pro-3-anc',
        sku: 'SONI-EB-004',
        brand: 'Aether Audio',
        tagline: 'Dual-Driver Lossless TWS Earbuds with MagSafe Display Case',
        description:
          'Pocket-sized audiophile precision. Dual coaxial drivers (11mm woofer + planar tweeter) inside ergonomic acoustic pods, paired with a wireless MagSafe charging case featuring an LED battery telemetry bar.',
        basePrice: 269.0,
        salePrice: 249.0,
        stockQuantity: 64,
        isFeatured: true,
        badgeText: 'AUDIOPHILE PICK',
        ratingAverage: 4.87,
        reviewCount: 76,
        technicalSpecs: {
          Drivers: '11mm Dynamic Woofer + 6mm Planar Micro-Tweeter',
          ANC: 'Real-Time Ear Canal Calibration ANC (-45dB)',
          Codec: 'LDAC, aptX Lossless, AAC (24-bit/96kHz)',
          Battery: '9 Hours Buds / 38 Hours with MagSafe Case',
          Latency: '28ms Ultra-Low Gaming Mode',
          Resistance: 'IP55 Sweat & Dust Resistant (Buds & Case)',
        },
        config3d: {
          modelType: 'PROCEDURAL_EARBUDS' as const,
          defaultScale: 1.1,
          cameraPosition: { x: 2.1, y: 1.2, z: 2.5 },
          defaultEnvPreset: 'studio' as const,
          autoRotate: true,
          supportsExplodeView: true,
        },
        variants: [
          {
            variantName: 'Graphite Matte Stealth',
            primaryHex: '#1e293b',
            secondaryHex: '#0f172a',
            accentHex: '#38bdf8',
            finishType: 'MATTE' as const,
            metalness: 0.25,
            roughness: 0.7,
            priceModifier: 0,
            stockQuantity: 25,
          },
          {
            variantName: 'Glacier Metallic Pearl',
            primaryHex: '#f1f5f9',
            secondaryHex: '#cbd5e1',
            accentHex: '#06b6d4',
            finishType: 'METALLIC' as const,
            metalness: 0.8,
            roughness: 0.2,
            priceModifier: 0,
            stockQuantity: 20,
          },
          {
            variantName: 'Neon Violet Synth',
            primaryHex: '#2e1065',
            secondaryHex: '#09090b',
            accentHex: '#e879f9',
            finishType: 'NEON' as const,
            metalness: 0.6,
            roughness: 0.28,
            priceModifier: 15,
            stockQuantity: 12,
          },
        ],
        hotspots: [
          {
            title: 'Ergonomic Acoustic Stems',
            description:
              'Capacitive force sensors let you pinch to switch ANC modes and swipe to adjust volume.',
            posX: -0.45,
            posY: 0.65,
            posZ: 0.15,
            camX: -1.6,
            camY: 1.2,
            camZ: 1.6,
          },
          {
            title: 'MagSafe Telemetry Charging Case',
            description:
              'Precision-hinged anodized cradle with built-in UWB Find My speaker and status light bar.',
            posX: 0.0,
            posY: -0.35,
            posZ: 0.45,
            camX: 0.0,
            camY: -0.2,
            camZ: 2.1,
          },
        ],
      },
      {
        category: savedCategories['speakers'],
        name: 'PulseSphere 360 Spatial',
        slug: 'pulsesphere-360-spatial',
        sku: 'PULS-SP-005',
        brand: 'Pulse Acoustics',
        tagline: '360° Omnidirectional Acoustic Core with Reactive Halo Lighting',
        description:
          'Fill any room with holographic 3D sound. PulseSphere combines a downward-firing 120W neodymium subwoofer with six radial array tweeters and a customizable RGBW acoustic levitation light ring.',
        basePrice: 329.0,
        salePrice: 299.0,
        stockQuantity: 28,
        isFeatured: true,
        badgeText: '360° AUDIO',
        ratingAverage: 4.91,
        reviewCount: 63,
        technicalSpecs: {
          Output: '180W Peak Class-D Bi-Amplified Architecture',
          Frequency: '28Hz – 40,000Hz Hi-Res Certified',
          Acoustic: '6x Radial Horn Tweeters + 5.25" High-Excursion Woofer',
          Wireless: 'Wi-Fi 6E AirPlay 2, Spotify Connect, Bluetooth 5.4',
          Lighting: 'Synchronized 64-LED Ambient Acoustic Halo',
          Calibration: 'Automatic Room Sonar EQ Tuning',
        },
        config3d: {
          modelType: 'PROCEDURAL_SPEAKER' as const,
          defaultScale: 1.0,
          cameraPosition: { x: 2.2, y: 1.3, z: 2.6 },
          defaultEnvPreset: 'neon' as const,
          autoRotate: true,
          supportsExplodeView: true,
        },
        variants: [
          {
            variantName: 'Dark Matter Neon Cyan',
            primaryHex: '#111827',
            secondaryHex: '#1f2937',
            accentHex: '#00f5d4',
            finishType: 'NEON' as const,
            metalness: 0.5,
            roughness: 0.35,
            priceModifier: 0,
            stockQuantity: 14,
          },
          {
            variantName: 'Brushed Bronze Titanium',
            primaryHex: '#78350f',
            secondaryHex: '#27272a',
            accentHex: '#f59e0b',
            finishType: 'TITANIUM' as const,
            metalness: 0.88,
            roughness: 0.24,
            priceModifier: 20,
            stockQuantity: 8,
          },
          {
            variantName: 'Studio Matte Charcoal',
            primaryHex: '#27272a',
            secondaryHex: '#3f3f46',
            accentHex: '#818cf8',
            finishType: 'MATTE' as const,
            metalness: 0.2,
            roughness: 0.78,
            priceModifier: 0,
            stockQuantity: 10,
          },
        ],
        hotspots: [
          {
            title: '360° Acoustic Waveguide Grille',
            description:
              'Laser-perforated acoustic mesh projects uniform sound dispersion across every corner of your room.',
            posX: 0.0,
            posY: 0.2,
            posZ: 0.75,
            camX: 0.0,
            camY: 0.4,
            camZ: 2.2,
          },
          {
            title: 'Reactive Sub-Bass Levitation Ring',
            description:
              'Iso-acoustic dampened base with synchronized LED halo that pulses to low-frequency bass lines.',
            posX: 0.0,
            posY: -0.75,
            posZ: 0.55,
            camX: 1.2,
            camY: -0.6,
            camZ: 1.9,
          },
        ],
      },
      {
        category: savedCategories['headphones'],
        name: 'HyperWave Cyber Pro Headset',
        slug: 'hyperwave-cyber-pro-headset',
        sku: 'HYPR-HP-006',
        brand: 'HyperWave Gaming',
        tagline: '7.1.4 Spatial Gaming & Studio Monitoring Headset',
        description:
          'Built for esports pros and 3D audio creators. Features ultra-light carbon-infused earcups, dual wireless 2.4GHz + Bluetooth simultaneous mixing, and customizable neon edge lighting.',
        basePrice: 229.0,
        salePrice: 199.0,
        stockQuantity: 38,
        isFeatured: false,
        badgeText: 'LOW LATENCY',
        ratingAverage: 4.84,
        reviewCount: 52,
        technicalSpecs: {
          Driver: '50mm Graphene Diaphragm Drivers',
          Wireless: '10ms 2.4GHz Quantum Dongle + Bluetooth 5.3',
          Microphone: 'Detachable Broadcast Cardioid AI Boom Mic',
          Battery: '50 Hours Continuous Play',
          Weight: '285g Ultra-Light Frame',
        },
        config3d: {
          modelType: 'PROCEDURAL_HEADPHONE' as const,
          defaultScale: 1.0,
          cameraPosition: { x: 2.3, y: 1.0, z: 2.7 },
          defaultEnvPreset: 'neon' as const,
          autoRotate: true,
          supportsExplodeView: true,
        },
        variants: [
          {
            variantName: 'Cyber Magenta Neon',
            primaryHex: '#09090b',
            secondaryHex: '#18181b',
            accentHex: '#f43f5e',
            finishType: 'NEON' as const,
            metalness: 0.6,
            roughness: 0.28,
            priceModifier: 0,
            stockQuantity: 20,
          },
          {
            variantName: 'Arctic Matte White',
            primaryHex: '#f8fafc',
            secondaryHex: '#cbd5e1',
            accentHex: '#0ea5e9',
            finishType: 'MATTE' as const,
            metalness: 0.15,
            roughness: 0.72,
            priceModifier: 0,
            stockQuantity: 18,
          },
        ],
        hotspots: [
          {
            title: '50mm Graphene Chamber',
            description:
              'Pinpoint directional footsteps and cinematic sub-bass with zero harmonic crossover.',
            posX: 0.95,
            posY: -0.35,
            posZ: 0.25,
            camX: 2.0,
            camY: -0.2,
            camZ: 1.5,
          },
        ],
      },
      {
        category: savedCategories['smartphones'],
        name: 'Vertex Quantum Pro 16',
        slug: 'vertex-quantum-pro-16',
        sku: 'VERT-PH-007',
        brand: 'Vertex Labs',
        tagline: 'Sapphire Ceramic Chassis • Holographic AI Camera System',
        description:
          'A minimalist masterpiece combining a vapor-chamber cooled processor, under-screen front camera for a 100% uninterrupted bezel-free display, and studio-grade 8K ProRes video recording.',
        basePrice: 899.0,
        salePrice: 849.0,
        stockQuantity: 30,
        isFeatured: false,
        badgeText: 'AI FLAGSHIP',
        ratingAverage: 4.86,
        reviewCount: 47,
        technicalSpecs: {
          Display: '6.7" True Full-Screen AMOLED (No Notch/Cutout)',
          Chipset: 'Vertex Tensor G9 3nm Processor',
          Camera: '50MP 1-Inch Sensor + 64MP 5x Telephoto',
          Charging: '80W Wired + 50W Magnetic Wireless',
          Material: 'Micro-Crystalline Ceramic Back + Titanium Frame',
        },
        config3d: {
          modelType: 'PROCEDURAL_PHONE' as const,
          defaultScale: 1.0,
          cameraPosition: { x: 1.9, y: 0.8, z: 2.5 },
          defaultEnvPreset: 'dark' as const,
          autoRotate: true,
          supportsExplodeView: true,
        },
        variants: [
          {
            variantName: 'Cobalt Metallic Blue',
            primaryHex: '#1e3a8a',
            secondaryHex: '#0f172a',
            accentHex: '#38bdf8',
            finishType: 'METALLIC' as const,
            metalness: 0.9,
            roughness: 0.18,
            priceModifier: 0,
            stockQuantity: 15,
          },
          {
            variantName: 'Emerald Titanium',
            primaryHex: '#065f46',
            secondaryHex: '#111827',
            accentHex: '#34d399',
            finishType: 'TITANIUM' as const,
            metalness: 0.85,
            roughness: 0.24,
            priceModifier: 20,
            stockQuantity: 15,
          },
        ],
        hotspots: [
          {
            title: '1-Inch Cinema Sensor Module',
            description:
              'Captures 400% more light in night mode with variable mechanical aperture f/1.4–f/4.0.',
            posX: -0.28,
            posY: 0.72,
            posZ: -0.12,
            camX: -1.2,
            camY: 1.1,
            camZ: -1.8,
          },
        ],
      },
      {
        category: savedCategories['smartwatches'],
        name: 'AeroFit Pulse Carbon GPS',
        slug: 'aerofit-pulse-carbon-gps',
        sku: 'AERO-SW-008',
        brand: 'Chronos Wear',
        tagline: 'Forged Carbon Fiber Bezel • 21-Day Solar Assisted Battery',
        description:
          'Featherweight 38g forged carbon smartwatch engineered for marathoners and triathletes. Includes offline topographic maps, VO2 Max recovery coaching, and customizable anodized accents.',
        basePrice: 349.0,
        salePrice: 319.0,
        stockQuantity: 45,
        isFeatured: false,
        badgeText: '21-DAY BATTERY',
        ratingAverage: 4.82,
        reviewCount: 39,
        technicalSpecs: {
          Bezel: 'Forged Carbon Fiber + DLC Titanium Crown',
          Battery: '21 Days Smartwatch Mode / 60 Hours Dual-Band GPS',
          Weight: '38g Ultra-Light Chassis',
          Waterproof: '10 ATM Swimming & Surfing Ready',
        },
        config3d: {
          modelType: 'PROCEDURAL_WATCH' as const,
          defaultScale: 1.05,
          cameraPosition: { x: 2.0, y: 1.1, z: 2.3 },
          defaultEnvPreset: 'studio' as const,
          autoRotate: true,
          supportsExplodeView: true,
        },
        variants: [
          {
            variantName: 'Forged Matte Carbon / Volt Lime',
            primaryHex: '#18181b',
            secondaryHex: '#3f6212',
            accentHex: '#a3e635',
            finishType: 'MATTE' as const,
            metalness: 0.2,
            roughness: 0.75,
            priceModifier: 0,
            stockQuantity: 25,
          },
          {
            variantName: 'Silver Titanium / Sky Cyan',
            primaryHex: '#94a3b8',
            secondaryHex: '#0369a1',
            accentHex: '#38bdf8',
            finishType: 'TITANIUM' as const,
            metalness: 0.85,
            roughness: 0.25,
            priceModifier: 15,
            stockQuantity: 20,
          },
        ],
        hotspots: [
          {
            title: 'Solar Sapphire Ring',
            description:
              'Photovoltaic perimeter ring harvests ambient sunlight to extend battery life by up to 35%.',
            posX: 0.0,
            posY: 0.1,
            posZ: 0.32,
            camX: 0.0,
            camY: 0.3,
            camZ: 2.1,
          },
        ],
      },
    ];

    const savedProducts: Product[] = [];

    for (const item of productsCatalog) {
      const product = await this.productRepo.save(
        this.productRepo.create({
          categoryId: item.category.id,
          name: item.name,
          slug: item.slug,
          sku: item.sku,
          brand: item.brand,
          tagline: item.tagline,
          description: item.description,
          basePrice: item.basePrice,
          salePrice: item.salePrice,
          stockQuantity: item.stockQuantity,
          isFeatured: item.isFeatured,
          isActive: true,
          badgeText: item.badgeText,
          ratingAverage: item.ratingAverage,
          reviewCount: item.reviewCount,
          technicalSpecs: item.technicalSpecs,
        }),
      );

      await this.config3dRepo.save(
        this.config3dRepo.create({
          productId: product.id,
          ...item.config3d,
        }),
      );

      for (const v of item.variants) {
        await this.variantRepo.save(
          this.variantRepo.create({
            productId: product.id,
            ...v,
          }),
        );
      }

      for (const h of item.hotspots) {
        await this.hotspotRepo.save(
          this.hotspotRepo.create({
            productId: product.id,
            ...h,
          }),
        );
      }

      await this.reviewRepo.save([
        this.reviewRepo.create({
          productId: product.id,
          userId: demoCustomer.id,
          reviewerName: 'Alex Mercer',
          rating: 5,
          title: 'The 3D customization matched the exact finish I received!',
          comment:
            'Being able to rotate the 3D model, test the Titanium vs Matte finish, and inspect the ports before buying is a game changer. Build quality is 10/10.',
          isVerifiedPurchase: true,
        }),
        this.reviewRepo.create({
          productId: product.id,
          reviewerName: 'Elena Vance',
          rating: 5,
          title: 'Incredible hardware & super fast delivery',
          comment:
            'Ordered the Cyber Neon edition and it looks even better in person. Battery life and build quality exceed expectations.',
          isVerifiedPurchase: true,
        }),
      ]);

      savedProducts.push(product);
    }

    // 4. Seed a Sample Order for Instant Order Tracking Demo (ORD-2026-1001)
    const sampleOrder = await this.orderRepo.save(
      this.orderRepo.create({
        orderNumber: 'ORD-2026-1001',
        userId: demoCustomer.id,
        customerName: 'Alex Mercer',
        customerEmail: 'alex@example.com',
        customerPhone: '+1 (555) 234-5678',
        shippingAddress: {
          street: '1200 Tech Plaza Apt 4B',
          city: 'Austin',
          state: 'TX',
          zipCode: '78701',
          country: 'United States',
        },
        subtotal: 349.0,
        shippingCost: 0.0,
        taxAmount: 27.92,
        totalAmount: 376.92,
        paymentMethod: 'STRIPE_CARD',
        paymentStatus: 'PAID',
        orderStatus: 'SHIPPED',
      }),
    );

    await this.orderItemRepo.save(
      this.orderItemRepo.create({
        orderId: sampleOrder.id,
        productId: savedProducts[0].id,
        productName: savedProducts[0].name,
        variantName: 'Titanium Silver Alloy',
        finishType: 'TITANIUM',
        primaryHex: '#cbd5e1',
        accentHex: '#6366f1',
        quantity: 1,
        unitPrice: 349.0,
      }),
    );

    this.logger.log(
      `Seed complete! Created ${savedProducts.length} 3D products, Admin (admin@3dstore.com / admin123), and Demo Order (ORD-2026-1001).`,
    );
  }
}
