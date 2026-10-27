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
    @InjectRepository(Category)
    private readonly categoryRepo: Repository<Category>,
    @InjectRepository(Product)
    private readonly productRepo: Repository<Product>,
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
    this.logger.log('Checking & syncing 3D Interactive Electronics Catalog...');

    // 1. Ensure Default Users
    let adminUser = await this.userRepo.findOne({
      where: { email: 'admin@3dstore.com' },
    });
    if (!adminUser) {
      const adminPassword = await bcrypt.hash('admin123', 10);
      adminUser = await this.userRepo.save(
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
    }

    let demoCustomer = await this.userRepo.findOne({
      where: { email: 'alex@example.com' },
    });
    if (!demoCustomer) {
      const customerPassword = await bcrypt.hash('customer123', 10);
      demoCustomer = await this.userRepo.save(
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
    }

    // 2. Ensure All 8 Categories
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
      {
        name: 'Gaming Laptops',
        slug: 'laptops',
        icon: 'laptop',
        description:
          'Ultra-thin OLED creator workstations and liquid-cooled gaming laptops.',
        displayOrder: 6,
      },
      {
        name: 'VR & Spatial Headsets',
        slug: 'vr-headsets',
        icon: 'vr',
        description:
          'Dual 4K micro-OLED spatial computers and mixed-reality headsets.',
        displayOrder: 7,
      },
      {
        name: 'Cameras & Gaming',
        slug: 'cameras-gaming',
        icon: 'camera',
        description:
          '8K full-frame mirrorless cinema cameras and OLED handheld gaming consoles.',
        displayOrder: 8,
      },
    ];

    const savedCategories: Record<string, Category> = {};
    for (const cat of categoriesData) {
      let existingCat = await this.categoryRepo.findOne({
        where: { slug: cat.slug },
      });
      if (!existingCat) {
        existingCat = await this.categoryRepo.save(
          this.categoryRepo.create(cat),
        );
      }
      savedCategories[cat.slug] = existingCat;
    }

    // 3. Full Catalog of 20 Flagship 3D Electronics Products
    const productsCatalog = [
      // --- 1 ---
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
      // --- 2 ---
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
        ],
      },
      // --- 3 ---
      {
        category: savedCategories['smartwatches'],
        name: 'Chronos Titan S9 Ultra',
        slug: 'chronos-titan-s9-ultra',
        sku: 'CHRO-SW-003',
        brand: 'Chronos Wear',
        tagline:
          'Sapphire Dual-Frequency GPS Watch with Bio-Optical Sensor Array',
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
        ],
      },
      // --- 4 ---
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
        ],
      },
      // --- 5 ---
      {
        category: savedCategories['speakers'],
        name: 'PulseSphere 360 Spatial',
        slug: 'pulsesphere-360-spatial',
        sku: 'PULS-SP-005',
        brand: 'Pulse Acoustics',
        tagline:
          '360° Omnidirectional Acoustic Core with Reactive Halo Lighting',
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
        ],
      },
      // --- 6 ---
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
      // --- 7 ---
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
      // --- 8 ---
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
      // --- 9 (NEW: LAPTOP) ---
      {
        category: savedCategories['laptops'],
        name: 'AetherBook Pro 16 M4 Max',
        slug: 'aetherbook-pro-16-m4-max',
        sku: 'AETH-LP-009',
        brand: 'Aether Computing',
        tagline: '16.2" Tandem OLED 240Hz • 40-Core Raytracing GPU • 128GB Unified',
        description:
          'Precision CNC-milled unibody workstation engineered for 3D artists, AI researchers, and pro editors. Rotate in 360° or trigger the Exploded View to inspect the dual copper vapor-chamber cooling fans and motherboard.',
        basePrice: 2499.0,
        salePrice: 2299.0,
        stockQuantity: 22,
        isFeatured: true,
        badgeText: 'PRO WORKSTATION',
        ratingAverage: 4.98,
        reviewCount: 164,
        technicalSpecs: {
          Display: '16.2" 4K Tandem OLED (240Hz, 1600 nits HDR)',
          Processor: '16-Core Quantum M4 Max + 40-Core GPU',
          Memory: '128GB Unified LPDDR5X (800GB/s Bandwidth)',
          Storage: '4TB PCIe Gen5 NVMe SSD',
          Cooling: 'Dual Copper Vapor-Chamber Liquid Metal Array',
          Ports: '3x Thunderbolt 5, HDMI 2.1, SD Express, MagCharge',
        },
        config3d: {
          modelType: 'PROCEDURAL_LAPTOP' as const,
          defaultScale: 0.95,
          cameraPosition: { x: 2.4, y: 1.3, z: 2.8 },
          defaultEnvPreset: 'studio' as const,
          autoRotate: true,
          supportsExplodeView: true,
        },
        variants: [
          {
            variantName: 'Space Black Anodized Matte',
            primaryHex: '#18181b',
            secondaryHex: '#27272a',
            accentHex: '#38bdf8',
            finishType: 'MATTE' as const,
            metalness: 0.3,
            roughness: 0.65,
            priceModifier: 0,
            stockQuantity: 12,
          },
          {
            variantName: 'Raw Aerospace Titanium',
            primaryHex: '#cbd5e1',
            secondaryHex: '#64748b',
            accentHex: '#6366f1',
            finishType: 'TITANIUM' as const,
            metalness: 0.9,
            roughness: 0.2,
            priceModifier: 100,
            stockQuantity: 10,
          },
          {
            variantName: 'Cyber Overclock Neon',
            primaryHex: '#09090b',
            secondaryHex: '#1e1b4b',
            accentHex: '#00f5d4',
            finishType: 'NEON' as const,
            metalness: 0.6,
            roughness: 0.25,
            priceModifier: 120,
            stockQuantity: 6,
          },
        ],
        hotspots: [
          {
            title: '16.2" Tandem OLED 240Hz Display',
            description:
              'Dual-layer OLED panel delivers 100% DCI-P3 color accuracy and sub-0.1ms pixel response.',
            posX: 0.0,
            posY: 0.45,
            posZ: -0.6,
            camX: 0.0,
            camY: 0.8,
            camZ: 2.2,
          },
          {
            title: 'Haptic Force-Touch Glass Trackpad',
            description:
              'Pressure-sensitive multi-touch surface with per-key RGB backlit mechanical switches.',
            posX: 0.0,
            posY: -0.5,
            posZ: 0.55,
            camX: 1.5,
            camY: 0.8,
            camZ: 2.1,
          },
        ],
      },
      // --- 10 (NEW: LAPTOP) ---
      {
        category: savedCategories['laptops'],
        name: 'RazerBlade Nebula X18 RTX',
        slug: 'razerblade-nebula-x18-rtx',
        sku: 'RAZR-LP-010',
        brand: 'HyperWave Gaming',
        tagline: 'RTX 5090 24GB Mobile • 18" Mini-LED 300Hz • Chroma RGB Deck',
        description:
          'Desktop replacement gaming titan milled from a single block of T6 aluminum. Equipped with per-key RGB lighting, front neon underglow bar, and full-wattage GPU performance.',
        basePrice: 2899.0,
        salePrice: 2699.0,
        stockQuantity: 14,
        isFeatured: false,
        badgeText: 'RTX 5090 3D',
        ratingAverage: 4.94,
        reviewCount: 88,
        technicalSpecs: {
          GPU: 'NVIDIA GeForce RTX 5090 Laptop GPU (200W TGP)',
          Display: '18" QHD+ 300Hz Mini-LED (2000 Local Dimming Zones)',
          Keyboard: 'Optical-Mechanical Per-Key RGB Switches',
          RAM: '64GB DDR5-6400MHz Dual-Channel',
        },
        config3d: {
          modelType: 'PROCEDURAL_LAPTOP' as const,
          defaultScale: 0.98,
          cameraPosition: { x: 2.5, y: 1.35, z: 2.8 },
          defaultEnvPreset: 'neon' as const,
          autoRotate: true,
          supportsExplodeView: true,
        },
        variants: [
          {
            variantName: 'Venom Acid Neon Green',
            primaryHex: '#09090b',
            secondaryHex: '#18181b',
            accentHex: '#22c55e',
            finishType: 'NEON' as const,
            metalness: 0.55,
            roughness: 0.3,
            priceModifier: 0,
            stockQuantity: 8,
          },
          {
            variantName: 'Mercury Metallic Silver',
            primaryHex: '#e2e8f0',
            secondaryHex: '#475569',
            accentHex: '#38bdf8',
            finishType: 'METALLIC' as const,
            metalness: 0.92,
            roughness: 0.16,
            priceModifier: 50,
            stockQuantity: 6,
          },
        ],
        hotspots: [
          {
            title: 'Dual Vapor-Chamber Cryo Fans',
            description:
              'Ultra-thin 0.05mm exhaust fins dissipate 260W combined CPU+GPU thermal load silently.',
            posX: 0.55,
            posY: -0.5,
            posZ: -0.15,
            camX: 2.1,
            camY: 0.7,
            camZ: 1.8,
          },
        ],
      },
      // --- 11 (NEW: VR HEADSET) ---
      {
        category: savedCategories['vr-headsets'],
        name: 'VisionSphere Pro Spatial',
        slug: 'visionsphere-pro-spatial',
        sku: 'VISN-VR-011',
        brand: 'Aether Computing',
        tagline: 'Dual 8K Micro-OLED • Eye & Hand Tracking • Laminated Spatial Glass',
        description:
          'Seamlessly blend digital 3D workspaces with your physical room. Features a curved laminated glass front visor, 12ms photon-to-photon passthrough cameras, and dual pancake optics.',
        basePrice: 1799.0,
        salePrice: 1599.0,
        stockQuantity: 19,
        isFeatured: true,
        badgeText: 'SPATIAL 3D',
        ratingAverage: 4.96,
        reviewCount: 112,
        technicalSpecs: {
          Displays: 'Dual 4K-per-eye Micro-OLED (23 Million Pixels)',
          Optics: 'Custom 3-Element Pancake Lenses + Motorized IPD',
          Tracking: '4x High-Speed IR Eye Trackers + 6-DoF Hand LiDAR',
          Audio: 'Dual-Driver Raytraced Spatial Audio Pods',
          Frame: 'Curved Aerospace Aluminum + 3D Knitted Solo Band',
        },
        config3d: {
          modelType: 'PROCEDURAL_VR_HEADSET' as const,
          defaultScale: 1.05,
          cameraPosition: { x: 2.2, y: 1.0, z: 2.6 },
          defaultEnvPreset: 'studio' as const,
          autoRotate: true,
          supportsExplodeView: true,
        },
        variants: [
          {
            variantName: 'Silver Titanium & Pearl Knit',
            primaryHex: '#cbd5e1',
            secondaryHex: '#475569',
            accentHex: '#38bdf8',
            finishType: 'TITANIUM' as const,
            metalness: 0.88,
            roughness: 0.22,
            priceModifier: 0,
            stockQuantity: 10,
          },
          {
            variantName: 'Cyberpunk Obsidian Neon',
            primaryHex: '#0f172a',
            secondaryHex: '#1e293b',
            accentHex: '#00f5d4',
            finishType: 'NEON' as const,
            metalness: 0.62,
            roughness: 0.26,
            priceModifier: 50,
            stockQuantity: 9,
          },
        ],
        hotspots: [
          {
            title: 'Laminated Spatial Front Glass Visor',
            description:
              'Optically polished curved glass houses 12 passthrough cameras and a depth LiDAR scanner.',
            posX: 0.0,
            posY: 0.05,
            posZ: 0.55,
            camX: 0.0,
            camY: 0.3,
            camZ: 2.3,
          },
          {
            title: 'Digital Immersion Crown',
            description:
              'Turn the dial to dial in how immersed you are in a virtual 3D environment vs passthrough reality.',
            posX: 0.52,
            posY: 0.39,
            posZ: 0.28,
            camX: 1.8,
            camY: 0.9,
            camZ: 1.8,
          },
        ],
      },
      // --- 12 (NEW: VR HEADSET) ---
      {
        category: savedCategories['vr-headsets'],
        name: 'MetaVerse Quest X3 Carbon',
        slug: 'metaverse-quest-x3-carbon',
        sku: 'META-VR-012',
        brand: 'Vertex Labs',
        tagline: 'Wireless Standalone Mixed Reality • 120Hz Pancake Optics',
        description:
          'Untethered mixed-reality gaming and fitness headset with ultra-slim pancake lenses, full-color passthrough, and Wi-Fi 7 PCVR streaming.',
        basePrice: 649.0,
        salePrice: 599.0,
        stockQuantity: 32,
        isFeatured: false,
        badgeText: 'MIXED REALITY',
        ratingAverage: 4.88,
        reviewCount: 74,
        technicalSpecs: {
          Chipset: 'Snapdragon XR2 Gen 3 Spatial Platform',
          RefreshRate: '90Hz / 120Hz Wireless PCVR & Standalone',
          Storage: '512GB Internal UFS 4.0',
          Weight: '465g Balanced Ergonomic Strap',
        },
        config3d: {
          modelType: 'PROCEDURAL_VR_HEADSET' as const,
          defaultScale: 1.0,
          cameraPosition: { x: 2.2, y: 1.0, z: 2.5 },
          defaultEnvPreset: 'neon' as const,
          autoRotate: true,
          supportsExplodeView: true,
        },
        variants: [
          {
            variantName: 'Stealth Matte Carbon',
            primaryHex: '#18181b',
            secondaryHex: '#27272a',
            accentHex: '#a855f7',
            finishType: 'MATTE' as const,
            metalness: 0.2,
            roughness: 0.76,
            priceModifier: 0,
            stockQuantity: 20,
          },
          {
            variantName: 'Frost White & Cyan',
            primaryHex: '#f8fafc',
            secondaryHex: '#94a3b8',
            accentHex: '#06b6d4',
            finishType: 'GLOSSY' as const,
            metalness: 0.3,
            roughness: 0.1,
            priceModifier: 0,
            stockQuantity: 12,
          },
        ],
        hotspots: [
          {
            title: 'Dual Pancake Optical Stack',
            description:
              'Reduces visor profile by 45% while delivering edge-to-edge optical clarity.',
            posX: 0.0,
            posY: 0.0,
            posZ: 0.2,
            camX: 1.6,
            camY: 0.5,
            camZ: 1.9,
          },
        ],
      },
      // --- 13 (NEW: CAMERA) ---
      {
        category: savedCategories['cameras-gaming'],
        name: 'Lumix Alpha S1R 8K Cinema',
        slug: 'lumix-alpha-s1r-8k-cinema',
        sku: 'LUMI-CM-013',
        brand: 'Lumix Optics',
        tagline: '61MP Full-Frame Exmor Sensor • 8K 60fps RAW • 50mm f/1.2 Master Lens',
        description:
          'Professional full-frame mirrorless cinema camera paired with a razor-sharp 50mm f/1.2 prime lens. Features 8-stop in-body image stabilization (IBIS) and dual CFexpress Type-B slots.',
        basePrice: 3199.0,
        salePrice: 2949.0,
        stockQuantity: 12,
        isFeatured: true,
        badgeText: '8K FULL FRAME',
        ratingAverage: 4.97,
        reviewCount: 83,
        technicalSpecs: {
          Sensor: '61MP Back-Illuminated Full-Frame CMOS (15+ Stops DR)',
          Video: '8K 60p 12-Bit Internal ProRes RAW + 4K 120p',
          Stabilization: '8.0-Stop 5-Axis In-Body Sensor Shift IBIS',
          Autofocus: '759-Point Real-Time AI Subject Recognition',
          Viewfinder: '9.44M-Dot Quad-XGA OLED EVF (120fps)',
        },
        config3d: {
          modelType: 'PROCEDURAL_CAMERA' as const,
          defaultScale: 1.0,
          cameraPosition: { x: 2.3, y: 1.1, z: 2.7 },
          defaultEnvPreset: 'studio' as const,
          autoRotate: true,
          supportsExplodeView: true,
        },
        variants: [
          {
            variantName: 'Magnesium Matte Black & Cinnabar Ring',
            primaryHex: '#18181b',
            secondaryHex: '#27272a',
            accentHex: '#ef4444',
            finishType: 'MATTE' as const,
            metalness: 0.25,
            roughness: 0.72,
            priceModifier: 0,
            stockQuantity: 7,
          },
          {
            variantName: 'Vintage Silver Titanium Edition',
            primaryHex: '#cbd5e1',
            secondaryHex: '#18181b',
            accentHex: '#f59e0b',
            finishType: 'TITANIUM' as const,
            metalness: 0.88,
            roughness: 0.22,
            priceModifier: 100,
            stockQuantity: 5,
          },
        ],
        hotspots: [
          {
            title: '50mm f/1.2 Sapphire Prime Barrel',
            description:
              'Dual XD linear motors provide silent, instantaneous focus breathing compensation.',
            posX: 0.08,
            posY: -0.05,
            posZ: 0.88,
            camX: 1.5,
            camY: 0.3,
            camZ: 2.2,
          },
          {
            title: '9.44M-Dot OLED Electronic Viewfinder',
            description:
              'Zero-blackout high-magnification optical viewfinder with anti-reflective fluorine coating.',
            posX: 0.0,
            posY: 0.62,
            posZ: -0.18,
            camX: 0.0,
            camY: 1.6,
            camZ: 1.9,
          },
        ],
      },
      // --- 14 (NEW: HANDHELD CONSOLE) ---
      {
        category: savedCategories['cameras-gaming'],
        name: 'CyberDeck Ally Z1 OLED',
        slug: 'cyberdeck-ally-z1-oled',
        sku: 'CYBR-CN-014',
        brand: 'HyperWave Gaming',
        tagline: '8" 144Hz VRR OLED Handheld • Ryzen Z1 Extreme • Hall-Effect RGB Sticks',
        description:
          'Play AAA PC and console titles anywhere. Features drift-free Hall-effect magnetic thumbsticks with customizable RGB halo rings, dual cryo-cooling fans, and an 80Wh marathon battery.',
        basePrice: 799.0,
        salePrice: 729.0,
        stockQuantity: 29,
        isFeatured: true,
        badgeText: 'HANDHELD 3D',
        ratingAverage: 4.93,
        reviewCount: 141,
        technicalSpecs: {
          APU: 'AMD Ryzen Z1 Extreme 8-Core / 16-Thread + RDNA 3.5',
          Display: '8.0" 1920x1200 144Hz OLED with FreeSync Premium VRR',
          Controls: 'Hall-Effect Analog Joysticks + Linear Hair-Trigger Bumpers',
          Storage: '1TB PCIe 4.0 NVMe M.2 + UHS-II MicroSD',
          Battery: '80Wh High-Density Cell + 65W USB4 PD',
        },
        config3d: {
          modelType: 'PROCEDURAL_CONSOLE' as const,
          defaultScale: 1.0,
          cameraPosition: { x: 2.2, y: 1.0, z: 2.6 },
          defaultEnvPreset: 'neon' as const,
          autoRotate: true,
          supportsExplodeView: true,
        },
        variants: [
          {
            variantName: 'Cyber Black & Cyan Halo',
            primaryHex: '#0f172a',
            secondaryHex: '#1e293b',
            accentHex: '#00f5d4',
            finishType: 'NEON' as const,
            metalness: 0.55,
            roughness: 0.28,
            priceModifier: 0,
            stockQuantity: 16,
          },
          {
            variantName: 'Glacier Matte White & Purple',
            primaryHex: '#f8fafc',
            secondaryHex: '#cbd5e1',
            accentHex: '#a855f7',
            finishType: 'MATTE' as const,
            metalness: 0.18,
            roughness: 0.72,
            priceModifier: 0,
            stockQuantity: 13,
          },
        ],
        hotspots: [
          {
            title: 'Hall-Effect RGB Thumbsticks',
            description:
              'Zero-stick-drift magnetic sensors surrounded by 16.8M-color Aura Sync LED rings.',
            posX: -0.96,
            posY: 0.18,
            posZ: 0.16,
            camX: -1.8,
            camY: 0.4,
            camZ: 1.8,
          },
          {
            title: '8-Inch 144Hz HDR OLED Touchscreen',
            description:
              'Corning Gorilla Glass Victus DXC coating reduces surface reflections by 75%.',
            posX: 0.0,
            posY: 0.0,
            posZ: 0.12,
            camX: 0.0,
            camY: 0.2,
            camZ: 2.2,
          },
        ],
      },
      // --- 15 (NEW: HEADPHONES) ---
      {
        category: savedCategories['headphones'],
        name: 'Senna HD-900 Electrostatic',
        slug: 'senna-hd-900-electrostatic',
        sku: 'SENN-HP-015',
        brand: 'Aether Audio',
        tagline: 'Open-Back Reference Audiophile Headphones • Gold-Vapor Diaphragm',
        description:
          'Hand-assembled reference studio headphones featuring acoustic open-back titanium mesh grilles and ultra-low distortion planar drivers for mastering engineers.',
        basePrice: 549.0,
        salePrice: 499.0,
        stockQuantity: 16,
        isFeatured: false,
        badgeText: 'REFERENCE HI-FI',
        ratingAverage: 4.94,
        reviewCount: 41,
        technicalSpecs: {
          Transducer: 'Open-Back Planar Electrostatic (5Hz – 52,000Hz)',
          Impedance: '64 Ohms Studio Reference',
          Cushions: 'Velour & Perforated Sheepskin Memory Foam',
        },
        config3d: {
          modelType: 'PROCEDURAL_HEADPHONE' as const,
          defaultScale: 1.0,
          cameraPosition: { x: 2.3, y: 1.1, z: 2.7 },
          defaultEnvPreset: 'warm' as const,
          autoRotate: true,
          supportsExplodeView: true,
        },
        variants: [
          {
            variantName: 'Champagne Gold & Titanium',
            primaryHex: '#334155',
            secondaryHex: '#1e293b',
            accentHex: '#f59e0b',
            finishType: 'TITANIUM' as const,
            metalness: 0.88,
            roughness: 0.22,
            priceModifier: 0,
            stockQuantity: 16,
          },
        ],
        hotspots: [
          {
            title: 'Open-Back Acoustic Grille',
            description:
              'Eliminates internal standing waves for a holographic concert-hall soundstage.',
            posX: 0.95,
            posY: -0.35,
            posZ: 0.25,
            camX: 2.1,
            camY: -0.2,
            camZ: 1.5,
          },
        ],
      },
      // --- 16 (NEW: SMARTPHONE) ---
      {
        category: savedCategories['smartphones'],
        name: 'Nothing Phone (3) Glyph Neon',
        slug: 'nothing-phone-3-glyph-neon',
        sku: 'NOTH-PH-016',
        brand: 'Nova Mobile',
        tagline: 'Transparent Cyber Interface • Programmable LED Glyph Matrix',
        description:
          'Semi-transparent industrial aesthetic with interactive rear LED Glyph strips that synchronize with ringtones, timers, ride-share progress, and volume levels.',
        basePrice: 699.0,
        salePrice: 649.0,
        stockQuantity: 40,
        isFeatured: false,
        badgeText: 'GLYPH LED',
        ratingAverage: 4.88,
        reviewCount: 91,
        technicalSpecs: {
          Interface: '24-Zone Addressable Mini-LED Glyph Backplate',
          Display: '6.7" 120Hz Flexible LTPO OLED',
          Camera: 'Dual 50MP Sony IMX890 OIS Sensors',
        },
        config3d: {
          modelType: 'PROCEDURAL_PHONE' as const,
          defaultScale: 1.02,
          cameraPosition: { x: 1.9, y: 0.8, z: 2.5 },
          defaultEnvPreset: 'neon' as const,
          autoRotate: true,
          supportsExplodeView: true,
        },
        variants: [
          {
            variantName: 'Smoke Dark Glyph Cyan',
            primaryHex: '#18181b',
            secondaryHex: '#27272a',
            accentHex: '#00f5d4',
            finishType: 'NEON' as const,
            metalness: 0.6,
            roughness: 0.25,
            priceModifier: 0,
            stockQuantity: 25,
          },
          {
            variantName: 'Cryo White Glyph Edition',
            primaryHex: '#f1f5f9',
            secondaryHex: '#cbd5e1',
            accentHex: '#38bdf8',
            finishType: 'GLOSSY' as const,
            metalness: 0.3,
            roughness: 0.08,
            priceModifier: 0,
            stockQuantity: 15,
          },
        ],
        hotspots: [
          {
            title: 'Glyph Telemetry Interface',
            description:
              'Visual countdown timers and notification patterns built right into the rear glass.',
            posX: 0.18,
            posY: 0.65,
            posZ: -0.08,
            camX: 1.4,
            camY: 0.8,
            camZ: -1.9,
          },
        ],
      },
      // --- 17 (NEW: SMARTPHONE) ---
      {
        category: savedCategories['smartphones'],
        name: 'Galaxy Fold Titanium Z7 5G',
        slug: 'galaxy-fold-titanium-z7-5g',
        sku: 'GALX-PH-017',
        brand: 'Vertex Labs',
        tagline: 'Zero-Gap Armor FlexHinge • Stylus Ready • Under-Display Camera',
        description:
          'Crafted with Armor Titanium rails and ultra-thin foldable glass. Multitask up to 4 desktop-class apps simultaneously with S-Pen precision.',
        basePrice: 1599.0,
        salePrice: 1449.0,
        stockQuantity: 18,
        isFeatured: false,
        badgeText: 'FOLDABLE 5G',
        ratingAverage: 4.91,
        reviewCount: 68,
        technicalSpecs: {
          Hinge: 'Dual-Rail Zero-Gap Titanium FlexHinge',
          Storage: '1TB UFS 4.0 + 16GB RAM',
          Waterproof: 'IP48 Water & Dust Certified',
        },
        config3d: {
          modelType: 'PROCEDURAL_PHONE' as const,
          defaultScale: 1.08,
          cameraPosition: { x: 2.0, y: 0.9, z: 2.6 },
          defaultEnvPreset: 'studio' as const,
          autoRotate: true,
          supportsExplodeView: true,
        },
        variants: [
          {
            variantName: 'Crafted Titanium Shadow',
            primaryHex: '#334155',
            secondaryHex: '#0f172a',
            accentHex: '#6366f1',
            finishType: 'TITANIUM' as const,
            metalness: 0.88,
            roughness: 0.24,
            priceModifier: 0,
            stockQuantity: 18,
          },
        ],
        hotspots: [],
      },
      // --- 18 (NEW: SMARTWATCH) ---
      {
        category: savedCategories['smartwatches'],
        name: 'Garmin Fenix 8 Sapphire Solar',
        slug: 'garmin-fenix-8-sapphire-solar',
        sku: 'GARM-SW-018',
        brand: 'Chronos Wear',
        tagline: 'Built-In LED Flashlight • 30-Day Solar Expedition Watch',
        description:
          'Tactical expedition multisport GPS watch featuring a scratch-resistant power sapphire lens, leakproof inductive metal buttons, and global topographical maps.',
        basePrice: 799.0,
        salePrice: 749.0,
        stockQuantity: 24,
        isFeatured: false,
        badgeText: 'EXPEDITION GPS',
        ratingAverage: 4.95,
        reviewCount: 105,
        technicalSpecs: {
          Lens: 'Power Sapphire Solar Charging Crystal',
          Battery: 'Up to 30 Days with Solar Harvesting',
          Torch: 'Integrated Multi-LED Variable Strobe Flashlight',
        },
        config3d: {
          modelType: 'PROCEDURAL_WATCH' as const,
          defaultScale: 1.12,
          cameraPosition: { x: 2.0, y: 1.2, z: 2.4 },
          defaultEnvPreset: 'dark' as const,
          autoRotate: true,
          supportsExplodeView: true,
        },
        variants: [
          {
            variantName: 'DLC Carbon Gray & Amber',
            primaryHex: '#1f2937',
            secondaryHex: '#111827',
            accentHex: '#f59e0b',
            finishType: 'TITANIUM' as const,
            metalness: 0.85,
            roughness: 0.26,
            priceModifier: 0,
            stockQuantity: 24,
          },
        ],
        hotspots: [],
      },
      // --- 19 (NEW: EARBUDS) ---
      {
        category: savedCategories['earbuds'],
        name: 'Bose QuietPods Ultra II TWS',
        slug: 'bose-quietpods-ultra-ii-tws',
        sku: 'BOSE-EB-019',
        brand: 'Pulse Acoustics',
        tagline: 'World-Class CustomTune ANC • Immersive Spatial Audio',
        description:
          'CustomTune sound calibration analyzes your ear canal shape in 0.5 seconds to personalize active noise cancellation and deep, balanced bass.',
        basePrice: 299.0,
        salePrice: 279.0,
        stockQuantity: 48,
        isFeatured: false,
        badgeText: 'ULTRA ANC',
        ratingAverage: 4.9,
        reviewCount: 82,
        technicalSpecs: {
          Calibration: 'CustomTune Acoustic Shape Sonar',
          Stability: '3x Interlocking Silicone Stability Bands',
          Battery: '8.5 Hours Single Charge / 32 Hours Total',
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
            variantName: 'Moonstone Metallic Blue',
            primaryHex: '#334155',
            secondaryHex: '#1e293b',
            accentHex: '#38bdf8',
            finishType: 'METALLIC' as const,
            metalness: 0.88,
            roughness: 0.2,
            priceModifier: 0,
            stockQuantity: 48,
          },
        ],
        hotspots: [],
      },
      // --- 20 (NEW: SPEAKER) ---
      {
        category: savedCategories['speakers'],
        name: 'Devialet Phantom Reactor 900W',
        slug: 'devialet-phantom-reactor-900w',
        sku: 'DEVI-SP-020',
        brand: 'Pulse Acoustics',
        tagline: '900W Implosive Sound Center • Dual Push-Push Woofers • 18Hz Infra-Bass',
        description:
          'Ultra-dense acoustic sphere delivering 98dB SPL with zero distortion, zero saturation, and zero background noise down to 18Hz sub-bass frequencies you can feel.',
        basePrice: 1199.0,
        salePrice: 1099.0,
        stockQuantity: 11,
        isFeatured: false,
        badgeText: '900W HI-END',
        ratingAverage: 4.96,
        reviewCount: 59,
        technicalSpecs: {
          Power: '900 Watts RMS ADH Analog-Digital Hybrid Amplification',
          Bass: '18Hz – 21kHz (-6dB) Hermetic Push-Push Woofers',
          DAC: 'Devialet Intelligence Processor 24bits/192kHz',
        },
        config3d: {
          modelType: 'PROCEDURAL_SPEAKER' as const,
          defaultScale: 1.05,
          cameraPosition: { x: 2.2, y: 1.3, z: 2.6 },
          defaultEnvPreset: 'warm' as const,
          autoRotate: true,
          supportsExplodeView: true,
        },
        variants: [
          {
            variantName: 'Opera de Paris 22k Gold Leaf',
            primaryHex: '#f8fafc',
            secondaryHex: '#cbd5e1',
            accentHex: '#f59e0b',
            finishType: 'METALLIC' as const,
            metalness: 0.92,
            roughness: 0.14,
            priceModifier: 0,
            stockQuantity: 6,
          },
          {
            variantName: 'Matte Black Iconic',
            primaryHex: '#18181b',
            secondaryHex: '#09090b',
            accentHex: '#38bdf8',
            finishType: 'MATTE' as const,
            metalness: 0.22,
            roughness: 0.78,
            priceModifier: 0,
            stockQuantity: 5,
          },
        ],
        hotspots: [],
      },
    ];

    let newlyAddedCount = 0;
    let firstProduct: Product | null = null;

    for (const item of productsCatalog) {
      const existing = await this.productRepo.findOne({
        where: { slug: item.slug },
      });
      if (existing) {
        if (!firstProduct) firstProduct = existing;
        continue;
      }

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

      if (!firstProduct) firstProduct = product;

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
            'Being able to rotate the 3D model, test the Titanium vs Matte finish, and inspect the internal components in Exploded View is awesome.',
          isVerifiedPurchase: true,
        }),
      ]);

      newlyAddedCount++;
    }

    // 4. Ensure Demo Order ORD-2026-1001 exists
    const existingOrder = await this.orderRepo.findOne({
      where: { orderNumber: 'ORD-2026-1001' },
    });
    if (!existingOrder && firstProduct) {
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
          productId: firstProduct.id,
          productName: firstProduct.name,
          variantName: 'Titanium Silver Alloy',
          finishType: 'TITANIUM',
          primaryHex: '#cbd5e1',
          accentHex: '#6366f1',
          quantity: 1,
          unitPrice: 349.0,
        }),
      );
    }

    const totalNow = await this.productRepo.count();
    this.logger.log(
      `Catalog sync complete! Added ${newlyAddedCount} new 3D products (Total in MySQL: ${totalNow} products across 8 categories).`,
    );
  }
}
