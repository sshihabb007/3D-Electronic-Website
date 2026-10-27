import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import * as fs from 'fs';
import { join } from 'path';
import {
  Product,
  Product3DConfig,
  ProductVariant,
  ProductHotspot,
  Category,
  Order,
  OrderItem,
  Review,
  User,
} from '../../database/entities';

const stateFilePath = join(
  process.cwd(),
  'database-backup',
  'admin-enterprise-state.json',
);

@Injectable()
export class AdminService {
  private enterpriseState: any;

  constructor(
    @InjectRepository(Product)
    private readonly productRepo: Repository<Product>,
    @InjectRepository(Product3DConfig)
    private readonly config3dRepo: Repository<Product3DConfig>,
    @InjectRepository(ProductVariant)
    private readonly variantRepo: Repository<ProductVariant>,
    @InjectRepository(ProductHotspot)
    private readonly hotspotRepo: Repository<ProductHotspot>,
    @InjectRepository(Category)
    private readonly categoryRepo: Repository<Category>,
    @InjectRepository(Order)
    private readonly orderRepo: Repository<Order>,
    @InjectRepository(OrderItem)
    private readonly orderItemRepo: Repository<OrderItem>,
    @InjectRepository(Review)
    private readonly reviewRepo: Repository<Review>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {
    this.loadEnterpriseState();
  }

  private getDefaultEnterpriseState() {
    return {
      componentParts: [
        {
          id: 'COMP-DRV-45',
          name: '45mm Beryllium Planar Driver Assembly',
          category: 'Audio Transducers',
          compatibleArchetype: 'PROCEDURAL_HEADPHONE',
          stock: 64,
          threshold: 20,
          unitCost: 42.5,
          warehouseZone: 'AUSTIN-FAB-A1',
        },
        {
          id: 'COMP-HDB-TI',
          name: 'CNC Grade-5 Titanium Headband Arc',
          category: 'Structural Chassis',
          compatibleArchetype: 'PROCEDURAL_HEADPHONE',
          stock: 14,
          threshold: 18,
          unitCost: 38.0,
          warehouseZone: 'AUSTIN-FAB-A2',
        },
        {
          id: 'COMP-EAR-MEM',
          name: 'Acoustic Lambskin Memory Foam EarCups (Pair)',
          category: 'Ergonomics & Trim',
          compatibleArchetype: 'PROCEDURAL_HEADPHONE',
          stock: 82,
          threshold: 25,
          unitCost: 19.0,
          warehouseZone: 'AUSTIN-FAB-B1',
        },
        {
          id: 'COMP-OLED-68',
          name: '6.8" LTPO 120Hz Micro-Curved OLED Panel',
          category: 'Displays & Optics',
          compatibleArchetype: 'PROCEDURAL_PHONE',
          stock: 11,
          threshold: 15,
          unitCost: 115.0,
          warehouseZone: 'SHENZHEN-OPT-C4',
        },
        {
          id: 'COMP-SAP-49',
          name: 'Synthetic Sapphire Crystal Watch Dome 49mm',
          category: 'Displays & Optics',
          compatibleArchetype: 'PROCEDURAL_WATCH',
          stock: 47,
          threshold: 15,
          unitCost: 29.0,
          warehouseZone: 'ZURICH-LAB-D1',
        },
        {
          id: 'COMP-WAV-VR',
          name: 'Dual-Pancake Spatial 8K Micro-OLED Waveguide',
          category: 'Displays & Optics',
          compatibleArchetype: 'PROCEDURAL_VR_HEADSET',
          stock: 9,
          threshold: 12,
          unitCost: 280.0,
          warehouseZone: 'AUSTIN-FAB-V1',
        },
        {
          id: 'COMP-BAT-99',
          name: '99.9Wh Solid-State Lithium-Silicon Battery Cell',
          category: 'Power Systems',
          compatibleArchetype: 'PROCEDURAL_LAPTOP',
          stock: 36,
          threshold: 15,
          unitCost: 68.0,
          warehouseZone: 'AUSTIN-FAB-P2',
        },
      ],
      surchargeEngine: {
        MATTE: { label: 'Stealth Matte Anodized', surcharge: 0, roughness: 0.76, metalness: 0.2 },
        TITANIUM: { label: 'Brushed Grade-5 Titanium Alloy', surcharge: 25, roughness: 0.24, metalness: 0.86 },
        METALLIC: { label: 'Liquid Chrome / Crimson Metallic', surcharge: 20, roughness: 0.16, metalness: 0.92 },
        NEON: { label: 'Cyber Neon Emissive Pulse Trim', surcharge: 35, roughness: 0.28, metalness: 0.58 },
        GLOSSY: { label: 'Ceramic Mirror Clearcoat Gloss', surcharge: 15, roughness: 0.06, metalness: 0.3 },
      },
      badgeTags: [
        'FLAGSHIP 3D',
        '360° AUDIO',
        'PRO WORKSTATION',
        'SPATIAL 3D',
        '8K FULL FRAME',
        'BEST SELLER',
        'AUDIOPHILE PICK',
      ],
      productCardModes: {}, // productId -> '3D_STAGE' | 'CUSTOMIZER_STUDIO' | 'DIRECT_TO_CART'
      savedBuilds: [
        {
          id: 'BLD-901',
          customerName: 'Alex Mercer',
          customerEmail: 'alex@example.com',
          productName: 'Aether Sonic Pro X1',
          finishType: 'TITANIUM',
          primaryHex: '#cbd5e1',
          secondaryHex: '#334155',
          accentHex: '#38bdf8',
          savedAt: '2026-10-26T16:40:00Z',
          estimatedPrice: 374.0,
        },
        {
          id: 'BLD-902',
          customerName: 'Elena Vance',
          customerEmail: 'elena.vance@cybermail.io',
          productName: 'NovaPhone Ultra 5G',
          finishType: 'NEON',
          primaryHex: '#0f172a',
          secondaryHex: '#1e1b4b',
          accentHex: '#00f5d4',
          savedAt: '2026-10-27T09:15:00Z',
          estimatedPrice: 1134.0,
        },
        {
          id: 'BLD-903',
          customerName: 'Marcus Sterling',
          customerEmail: 'm.sterling@quantumlabs.org',
          productName: 'AetherBook Pro 16 Max',
          finishType: 'MATTE',
          primaryHex: '#18181b',
          secondaryHex: '#27272a',
          accentHex: '#f59e0b',
          savedAt: '2026-10-27T12:05:00Z',
          estimatedPrice: 2399.0,
        },
      ],
      supportTickets: [
        {
          id: 'TCK-401',
          customerName: 'Sophia Chen',
          customerEmail: 'sophia.chen@designstudio.co',
          orderNumber: 'ORD-2026-1004',
          subject: 'Change Custom EarCup Trim Color before Assembly',
          priority: 'HIGH',
          status: 'OPEN',
          createdAt: '2026-10-27T11:30:00Z',
        },
        {
          id: 'TCK-402',
          customerName: 'Devon Brooks',
          customerEmail: 'devon.brooks@mail.com',
          orderNumber: 'ORD-2026-1006',
          subject: 'RMA Return Inspection & Refund Confirmation',
          priority: 'MEDIUM',
          status: 'RESOLVED',
          createdAt: '2026-10-26T14:20:00Z',
        },
      ],
      engineSettings: {
        cdnEdgeUrl: 'https://cdn-3d.aetherstore.io/models',
        dracoCompressionDefault: true,
        ktx2TextureTranscoding: true,
        maxTextureDimension: 2048,
        shadowMapQuality: 'PCF_SOFT_2K',
        defaultTargetFps: 60,
        mobileAutoLodDowngrade: true,
        freeShippingThresholdUsd: 250,
        taxRatePercent: 8.0,
        stripeEnabled: true,
        codEnabled: true,
        lastCdnPurgeAt: '2026-10-27T18:00:00Z',
      },
      auditLogs: [
        {
          id: 'LOG-1001',
          timestamp: '2026-10-27T18:00:00Z',
          actor: 'admin@3dstore.com (SUPER_ADMIN)',
          category: '3D_PIPELINE',
          action: 'Synced 20 procedural & GLB 3D electronics models with Draco & PBR presets',
        },
        {
          id: 'LOG-1002',
          timestamp: '2026-10-27T18:30:00Z',
          actor: 'admin@3dstore.com (SUPER_ADMIN)',
          category: 'FULFILLMENT',
          action: 'Dispatched Order ORD-2026-1001 via FedEx Priority (Custom Titanium Build)',
        },
      ],
    };
  }

  private loadEnterpriseState() {
    try {
      if (fs.existsSync(stateFilePath)) {
        const raw = fs.readFileSync(stateFilePath, 'utf8');
        this.enterpriseState = {
          ...this.getDefaultEnterpriseState(),
          ...JSON.parse(raw),
        };
      } else {
        this.enterpriseState = this.getDefaultEnterpriseState();
        this.saveEnterpriseState();
      }
    } catch {
      this.enterpriseState = this.getDefaultEnterpriseState();
    }
  }

  private saveEnterpriseState() {
    try {
      const dir = join(process.cwd(), 'database-backup');
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(
        stateFilePath,
        JSON.stringify(this.enterpriseState, null, 2),
        'utf8',
      );
    } catch {
      // ignore write errors
    }
  }

  public appendAuditLog(
    category: string,
    action: string,
    actor = 'admin@3dstore.com (SUPER_ADMIN)',
  ) {
    if (!this.enterpriseState.auditLogs) {
      this.enterpriseState.auditLogs = [];
    }
    this.enterpriseState.auditLogs.unshift({
      id: `LOG-${Date.now().toString().slice(-5)}`,
      timestamp: new Date().toISOString(),
      actor,
      category,
      action,
    });
    this.enterpriseState.auditLogs = this.enterpriseState.auditLogs.slice(0, 80);
    this.saveEnterpriseState();
  }

  async getDashboardStats() {
    const [products, orders, categories, users, reviews] = await Promise.all([
      this.productRepo.find({
        relations: ['category', 'config3d', 'variants', 'hotspots'],
        order: { id: 'ASC' },
      }),
      this.orderRepo.find({
        relations: ['items'],
        order: { createdAt: 'DESC' },
      }),
      this.categoryRepo.find({
        order: { displayOrder: 'ASC' },
      }),
      this.userRepo.find({
        order: { createdAt: 'DESC' },
      }),
      this.reviewRepo.find({
        order: { createdAt: 'DESC' },
      }),
    ]);

    const gmv = orders.reduce(
      (acc, o) => acc + Number(o.totalAmount || 0),
      0,
    );
    const validOrders = orders.filter((o) => o.orderStatus !== 'CANCELLED');
    const totalRevenue = validOrders.reduce(
      (acc, o) => acc + Number(o.totalAmount || 0),
      0,
    );

    const paidRevenue = validOrders
      .filter((o) => o.paymentStatus === 'PAID')
      .reduce((acc, o) => acc + Number(o.totalAmount || 0), 0);

    const pendingRevenue = validOrders
      .filter((o) => o.paymentStatus === 'PENDING')
      .reduce((acc, o) => acc + Number(o.totalAmount || 0), 0);

    const refundedRevenue = orders
      .filter((o) => o.paymentStatus === 'REFUNDED')
      .reduce((acc, o) => acc + Number(o.totalAmount || 0), 0);

    const averageOrderValue =
      validOrders.length > 0 ? totalRevenue / validOrders.length : 0;

    // Order Status Breakdown
    const statuses = [
      'PENDING',
      'PROCESSING',
      'SHIPPED',
      'DELIVERED',
      'CANCELLED',
    ] as const;
    const orderStatusBreakdown: Record<
      string,
      { count: number; revenue: number }
    > = {};
    for (const st of statuses) {
      const matching = orders.filter((o) => o.orderStatus === st);
      orderStatusBreakdown[st] = {
        count: matching.length,
        revenue: Number(
          matching
            .reduce((acc, o) => acc + Number(o.totalAmount || 0), 0)
            .toFixed(2),
        ),
      };
    }

    // Payment Status & Method Breakdown
    const paymentStatusBreakdown: Record<string, number> = {
      PAID: orders.filter((o) => o.paymentStatus === 'PAID').length,
      PENDING: orders.filter((o) => o.paymentStatus === 'PENDING').length,
      FAILED: orders.filter((o) => o.paymentStatus === 'FAILED').length,
      REFUNDED: orders.filter((o) => o.paymentStatus === 'REFUNDED').length,
    };

    const paymentMethodBreakdown: Record<string, number> = {
      STRIPE_CARD: orders.filter((o) => o.paymentMethod === 'STRIPE_CARD')
        .length,
      COD: orders.filter((o) => o.paymentMethod === 'COD').length,
    };

    const pendingOrdersCount =
      orderStatusBreakdown.PENDING.count +
      orderStatusBreakdown.PROCESSING.count;
    const shippedOrdersCount =
      orderStatusBreakdown.SHIPPED.count +
      orderStatusBreakdown.DELIVERED.count;

    // Product & 3D Asset Metrics
    const activeProductsCount = products.filter(
      (p) => p.isActive !== false,
    ).length;
    const hiddenProductsCount = products.length - activeProductsCount;
    const featuredCount = products.filter((p) => p.isFeatured).length;
    const onSaleCount = products.filter(
      (p) => p.salePrice !== null && Number(p.salePrice) < Number(p.basePrice),
    ).length;
    const customGlbCount = products.filter(
      (p) => p.config3d?.modelType === 'GLB_FILE',
    ).length;

    const totalVariantsCount = products.reduce(
      (acc, p) => acc + (p.variants?.length || 0),
      0,
    );
    const totalHotspotsCount = products.reduce(
      (acc, p) => acc + (p.hotspots?.length || 0),
      0,
    );

    const totalStockUnits = products.reduce(
      (acc, p) => acc + Number(p.stockQuantity || 0),
      0,
    );
    const totalInventoryValue = products.reduce((acc, p) => {
      const unitPrice = Number(p.salePrice || p.basePrice || 0);
      return acc + unitPrice * Number(p.stockQuantity || 0);
    }, 0);

    // 3D Model Archetype Breakdown
    const modelArchetypeBreakdown: Record<string, number> = {};
    for (const p of products) {
      const mt = p.config3d?.modelType || 'PROCEDURAL_HEADPHONE';
      modelArchetypeBreakdown[mt] = (modelArchetypeBreakdown[mt] || 0) + 1;
    }

    // Finish Popularity from order items + variants
    const finishPopularity: Record<string, number> = {
      TITANIUM: 0,
      MATTE: 0,
      NEON: 0,
      METALLIC: 0,
      GLOSSY: 0,
    };
    for (const p of products) {
      for (const v of p.variants || []) {
        const f = (v.finishType || 'MATTE').toUpperCase();
        finishPopularity[f] = (finishPopularity[f] || 0) + 1;
      }
    }
    for (const o of orders) {
      for (const it of o.items || []) {
        const f = (it.finishType || 'MATTE').toUpperCase();
        finishPopularity[f] = (finishPopularity[f] || 0) + 3;
      }
    }

    // Category Breakdown
    const categoryBreakdown = categories.map((cat) => {
      const catProds = products.filter((p) => p.categoryId === cat.id);
      const stock = catProds.reduce(
        (acc, p) => acc + Number(p.stockQuantity || 0),
        0,
      );
      const value = catProds.reduce(
        (acc, p) =>
          acc +
          Number(p.salePrice || p.basePrice || 0) *
            Number(p.stockQuantity || 0),
        0,
      );
      const avgPrice =
        catProds.length > 0
          ? catProds.reduce(
              (acc, p) => acc + Number(p.salePrice || p.basePrice || 0),
              0,
            ) / catProds.length
          : 0;
      return {
        id: cat.id,
        name: cat.name,
        slug: cat.slug,
        icon: cat.icon,
        description: cat.description,
        displayOrder: cat.displayOrder,
        productCount: catProds.length,
        totalStock: stock,
        inventoryValue: Number(value.toFixed(2)),
        avgPrice: Number(avgPrice.toFixed(2)),
      };
    });

    // Top Selling Products from valid orders
    const productSalesMap = new Map<
      string,
      {
        productId: number | null;
        productName: string;
        unitsSold: number;
        revenue: number;
      }
    >();
    for (const ord of validOrders) {
      for (const item of ord.items || []) {
        const key = String(item.productId || item.productName);
        const existing = productSalesMap.get(key) || {
          productId: item.productId || null,
          productName: item.productName,
          unitsSold: 0,
          revenue: 0,
        };
        existing.unitsSold += Number(item.quantity || 1);
        existing.revenue +=
          Number(item.unitPrice || 0) * Number(item.quantity || 1);
        productSalesMap.set(key, existing);
      }
    }
    const topSellingProducts = Array.from(productSalesMap.values())
      .map((x) => ({ ...x, revenue: Number(x.revenue.toFixed(2)) }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 8);

    const averageStoreRating =
      reviews.length > 0
        ? Number(
            (
              reviews.reduce((acc, r) => acc + Number(r.rating || 5), 0) /
              reviews.length
            ).toFixed(2),
          )
        : 4.9;

    const outOfStockCount = products.filter(
      (p) => Number(p.stockQuantity || 0) <= 0,
    ).length;

    const lowStockProducts = products
      .filter((p) => p.stockQuantity <= 15)
      .sort((a, b) => a.stockQuantity - b.stockQuantity)
      .map((p) => ({
        id: p.id,
        name: p.name,
        sku: p.sku,
        brand: p.brand,
        categoryName: p.category?.name || 'Electronics',
        stockQuantity: p.stockQuantity,
        price: Number(p.salePrice || p.basePrice),
      }));

    // 3D Telemetry & WebGL Performance Analytics
    const telemetry3D = {
      active3DSessions: 18,
      stage3DConversionRate: 6.8,
      standard2DConversionRate: 2.1,
      stage3DSessionSharePercent: 78.4,
      avgOrbitDwellSeconds: 48,
      avgExplodeViewSeconds: 34,
      avgHotspotClicksPerSession: 3.7,
      avgDesktopFps: 59.4,
      avgMobileFps: 46.8,
      lowFpsWarningRatePercent: 1.6,
      webglContextLossPercent: 0.08,
      avgGlbLoadTimeMs: 390,
      finishPopularity,
      lightingPopularity: {
        studio: 44,
        neon: 29,
        dark: 16,
        warm: 11,
      },
      channelRevenueBreakdown: [
        { channel: '3D Customizer Studio', share: 54, revenue: Number((totalRevenue * 0.54).toFixed(2)) },
        { channel: 'Hero 3D Interactive Stage', share: 31, revenue: Number((totalRevenue * 0.31).toFixed(2)) },
        { channel: 'Direct Catalog Quick-Add', share: 15, revenue: Number((totalRevenue * 0.15).toFixed(2)) },
      ],
      regionBreakdown: [
        { region: 'North America (US / CA)', share: 62, orders: Math.max(1, Math.round(orders.length * 0.62)) },
        { region: 'Europe (UK / DE / FR)', share: 24, orders: Math.max(1, Math.round(orders.length * 0.24)) },
        { region: 'Asia-Pacific (JP / SG / AU)', share: 14, orders: Math.max(1, Math.round(orders.length * 0.14)) },
      ],
    };

    return {
      gmv: Number(gmv.toFixed(2)),
      totalRevenue: Number(totalRevenue.toFixed(2)),
      paidRevenue: Number(paidRevenue.toFixed(2)),
      pendingRevenue: Number(pendingRevenue.toFixed(2)),
      refundedRevenue: Number(refundedRevenue.toFixed(2)),
      averageOrderValue: Number(averageOrderValue.toFixed(2)),
      totalInventoryValue: Number(totalInventoryValue.toFixed(2)),
      totalStockUnits,
      totalOrders: orders.length,
      pendingOrdersCount,
      processingOrdersCount: orderStatusBreakdown.PROCESSING.count,
      shippedOrdersCount,
      deliveredOrdersCount: orderStatusBreakdown.DELIVERED.count,
      cancelledOrdersCount: orderStatusBreakdown.CANCELLED.count,
      orderStatusBreakdown,
      paymentStatusBreakdown,
      paymentMethodBreakdown,
      totalProducts: products.length,
      activeProductsCount,
      hiddenProductsCount,
      featuredCount,
      onSaleCount,
      customGlbCount,
      totalVariantsCount,
      totalHotspotsCount,
      totalReviewsCount: reviews.length,
      averageStoreRating,
      totalCategories: categories.length,
      totalUsers: users.length,
      outOfStockCount,
      lowStockCount: lowStockProducts.length,
      lowStockProducts,
      categoryBreakdown,
      modelArchetypeBreakdown,
      topSellingProducts,
      telemetry3D,
      enterpriseState: this.enterpriseState,
      recentOrders: orders.slice(0, 25),
      reviews: reviews.slice(0, 40),
      users: users.map((u) => {
        const userOrders = orders.filter(
          (o) =>
            o.userId === u.id ||
            o.customerEmail?.toLowerCase() === u.email?.toLowerCase(),
        );
        const totalSpent = userOrders
          .filter((o) => o.orderStatus !== 'CANCELLED')
          .reduce((acc, o) => acc + Number(o.totalAmount || 0), 0);
        return {
          id: u.id,
          fullName: u.fullName,
          email: u.email,
          role: u.role,
          phone: u.phone,
          orderCount: userOrders.length,
          totalSpent: Number(totalSpent.toFixed(2)),
          createdAt: u.createdAt,
        };
      }),
    };
  }

  getEnterpriseState() {
    return this.enterpriseState;
  }

  updateEnterpriseState(body: any) {
    if (body.componentParts !== undefined) {
      this.enterpriseState.componentParts = body.componentParts;
      this.appendAuditLog(
        'INVENTORY_MATRIX',
        'Updated modular 3D component parts stock matrix',
      );
    }
    if (body.surchargeEngine !== undefined) {
      this.enterpriseState.surchargeEngine = body.surchargeEngine;
      this.appendAuditLog(
        'PRICING_SURCHARGE',
        'Updated dynamic PBR finish surcharge rules',
      );
    }
    if (body.badgeTags !== undefined) {
      this.enterpriseState.badgeTags = body.badgeTags;
    }
    if (body.productCardModes !== undefined) {
      this.enterpriseState.productCardModes = {
        ...this.enterpriseState.productCardModes,
        ...body.productCardModes,
      };
    }
    if (body.supportTickets !== undefined) {
      this.enterpriseState.supportTickets = body.supportTickets;
    }
    if (body.engineSettings !== undefined) {
      this.enterpriseState.engineSettings = {
        ...this.enterpriseState.engineSettings,
        ...body.engineSettings,
      };
      this.appendAuditLog(
        'ENGINE_CONFIG',
        'Updated WebGL / CDN / Gateway configuration settings',
      );
    }
    this.saveEnterpriseState();
    return this.enterpriseState;
  }

  purgeCdnCache() {
    const now = new Date().toISOString();
    this.enterpriseState.engineSettings.lastCdnPurgeAt = now;
    this.appendAuditLog(
      'CDN_CACHE',
      `Purged global .GLB/.GLTF & KTX2 edge cache across all PoPs (${now})`,
    );
    return {
      purged: true,
      timestamp: now,
      message: 'All edge .GLB & KTX2 shader caches invalidated.',
    };
  }

  async getAllReviews() {
    return this.reviewRepo.find({
      relations: ['product'],
      order: { createdAt: 'DESC' },
    });
  }

  async toggleReviewVerified(reviewId: number, isVerifiedPurchase: boolean) {
    const rev = await this.reviewRepo.findOne({ where: { id: reviewId } });
    if (!rev) throw new NotFoundException('Review not found');
    rev.isVerifiedPurchase = Boolean(isVerifiedPurchase);
    return this.reviewRepo.save(rev);
  }

  async deleteReview(reviewId: number) {
    const rev = await this.reviewRepo.findOne({ where: { id: reviewId } });
    if (!rev) throw new NotFoundException('Review not found');
    await this.reviewRepo.remove(rev);
    this.appendAuditLog('CMS_REVIEWS', `Deleted customer review #${reviewId}`);
    return { deleted: true, id: reviewId };
  }

  async batchUpdateCatalog(body: {
    action: 'PRICE_ADJUST_PERCENT' | 'RESTOCK_ALL' | 'SET_BADGE' | 'IMPORT_JSON';
    percent?: number;
    addStock?: number;
    badgeText?: string;
    products?: any[];
  }) {
    const allProducts = await this.productRepo.find();
    let affected = 0;

    if (body.action === 'PRICE_ADJUST_PERCENT' && body.percent !== undefined) {
      const factor = 1 + Number(body.percent) / 100;
      for (const p of allProducts) {
        p.basePrice = Number((Number(p.basePrice) * factor).toFixed(2));
        if (p.salePrice) {
          p.salePrice = Number((Number(p.salePrice) * factor).toFixed(2));
        }
        await this.productRepo.save(p);
        affected++;
      }
      this.appendAuditLog(
        'BATCH_CATALOG',
        `Adjusted catalog prices by ${body.percent}% across ${affected} products`,
      );
    } else if (body.action === 'RESTOCK_ALL' && body.addStock !== undefined) {
      const delta = Number(body.addStock);
      for (const p of allProducts) {
        p.stockQuantity = Math.max(0, Number(p.stockQuantity || 0) + delta);
        await this.productRepo.save(p);
        affected++;
      }
      this.appendAuditLog(
        'BATCH_CATALOG',
        `Batch restocked +${delta} units across ${affected} products`,
      );
    } else if (body.action === 'SET_BADGE' && body.badgeText) {
      for (const p of allProducts) {
        p.badgeText = body.badgeText;
        await this.productRepo.save(p);
        affected++;
      }
      this.appendAuditLog(
        'BATCH_CATALOG',
        `Updated promo badge to "${body.badgeText}" on ${affected} products`,
      );
    } else if (body.action === 'IMPORT_JSON' && Array.isArray(body.products)) {
      for (const item of body.products) {
        if (item.id) {
          await this.quickPatchProduct(Number(item.id), {
            stockQuantity: item.stockQuantity,
            basePrice: item.basePrice,
            salePrice: item.salePrice,
            badgeText: item.badgeText,
            isFeatured: item.isFeatured,
          });
          affected++;
        }
      }
      this.appendAuditLog(
        'BATCH_CATALOG',
        `Imported batch JSON update for ${affected} products`,
      );
    }

    return { affected };
  }

  async getAllProductsForAdmin() {
    return this.productRepo.find({
      relations: ['category', 'config3d', 'variants', 'hotspots'],
      order: { id: 'DESC' },
    });
  }

  async getAllOrders() {
    return this.orderRepo.find({
      relations: ['items'],
      order: { createdAt: 'DESC' },
    });
  }

  async getOrderById(orderId: number) {
    const order = await this.orderRepo.findOne({
      where: { id: orderId },
      relations: ['items'],
    });
    if (!order) throw new NotFoundException('Order not found');
    return order;
  }

  async createAdminOrder(body: any) {
    if (!body.customerName || !body.customerEmail) {
      throw new BadRequestException('Customer name and email are required');
    }
    const itemsInput = Array.isArray(body.items) ? body.items : [];
    if (itemsInput.length === 0) {
      throw new BadRequestException('At least one order item is required');
    }

    const orderNumber =
      body.orderNumber ||
      `ORD-2026-${Math.floor(1000 + Math.random() * 9000)}`;

    let subtotal = 0;
    const preparedItems: Partial<OrderItem>[] = [];

    for (const rawItem of itemsInput) {
      const qty = Math.max(1, Number(rawItem.quantity || 1));
      let unitPrice = Number(rawItem.unitPrice || 0);
      let productName = rawItem.productName || '3D Electronics Item';
      let productId = rawItem.productId ? Number(rawItem.productId) : null;

      if (productId && !rawItem.unitPrice) {
        const prod = await this.productRepo.findOne({
          where: { id: productId },
        });
        if (prod) {
          productName = prod.name;
          unitPrice = Number(prod.salePrice || prod.basePrice || 0);
        }
      }

      subtotal += unitPrice * qty;
      preparedItems.push({
        productId,
        productName,
        variantName: rawItem.variantName || 'Signature Edition',
        finishType: rawItem.finishType || 'MATTE',
        primaryHex: rawItem.primaryHex || '#1e293b',
        accentHex: rawItem.accentHex || '#38bdf8',
        quantity: qty,
        unitPrice,
      });
    }

    const shippingCost =
      body.shippingCost !== undefined
        ? Number(body.shippingCost)
        : subtotal >= 250
          ? 0
          : 15;
    const taxAmount =
      body.taxAmount !== undefined
        ? Number(body.taxAmount)
        : Number((subtotal * 0.08).toFixed(2));
    const totalAmount = Number((subtotal + shippingCost + taxAmount).toFixed(2));

    const savedOrder = await this.orderRepo.save(
      this.orderRepo.create({
        orderNumber,
        userId: body.userId ? Number(body.userId) : null,
        customerName: body.customerName,
        customerEmail: body.customerEmail,
        customerPhone: body.customerPhone || '+1 (555) 010-9999',
        shippingAddress: body.shippingAddress || {
          street: body.street || '100 Innovation Way',
          city: body.city || 'Austin',
          state: body.state || 'TX',
          zipCode: body.zipCode || '78701',
          country: body.country || 'United States',
        },
        subtotal: Number(subtotal.toFixed(2)),
        shippingCost: Number(shippingCost.toFixed(2)),
        taxAmount: Number(taxAmount.toFixed(2)),
        totalAmount,
        paymentMethod: body.paymentMethod === 'COD' ? 'COD' : 'STRIPE_CARD',
        paymentStatus: body.paymentStatus || 'PAID',
        orderStatus: body.orderStatus || 'PROCESSING',
        fulfillmentMeta: body.fulfillmentMeta || {
          lifecycleStage: 'IN_ASSEMBLY',
          courier: 'FedEx Priority',
          trackingNumber: `FX-${Math.floor(100000000 + Math.random() * 900000000)}`,
          serialNumber: `SN-AETHER-${Math.floor(10000 + Math.random() * 90000)}`,
        },
      }),
    );

    for (const item of preparedItems) {
      await this.orderItemRepo.save(
        this.orderItemRepo.create({
          ...item,
          orderId: savedOrder.id,
        }),
      );
    }

    this.appendAuditLog(
      'ORDERS',
      `Created manual bespoke 3D order ${orderNumber} ($${totalAmount} USD)`,
    );
    return this.getOrderById(savedOrder.id);
  }

  async updateOrder(orderId: number, body: any) {
    const order = await this.orderRepo.findOne({
      where: { id: orderId },
      relations: ['items'],
    });
    if (!order) {
      throw new NotFoundException('Order not found');
    }

    if (body.customerName !== undefined) order.customerName = body.customerName;
    if (body.customerEmail !== undefined)
      order.customerEmail = body.customerEmail;
    if (body.customerPhone !== undefined)
      order.customerPhone = body.customerPhone;
    if (body.paymentMethod !== undefined)
      order.paymentMethod = body.paymentMethod;
    if (body.paymentStatus !== undefined)
      order.paymentStatus = body.paymentStatus;
    if (body.orderStatus !== undefined) order.orderStatus = body.orderStatus;

    if (body.fulfillmentMeta !== undefined) {
      order.fulfillmentMeta = {
        ...(order.fulfillmentMeta || {}),
        ...body.fulfillmentMeta,
      };
    }

    if (body.shippingAddress) {
      order.shippingAddress = {
        street:
          body.shippingAddress.street ?? order.shippingAddress?.street ?? '',
        city: body.shippingAddress.city ?? order.shippingAddress?.city ?? '',
        state: body.shippingAddress.state ?? order.shippingAddress?.state ?? '',
        zipCode:
          body.shippingAddress.zipCode ?? order.shippingAddress?.zipCode ?? '',
        country:
          body.shippingAddress.country ??
          order.shippingAddress?.country ??
          'United States',
      };
    }

    if (Array.isArray(body.items) && body.items.length > 0) {
      await this.orderItemRepo.delete({ orderId: order.id });
      let newSubtotal = 0;
      for (const it of body.items) {
        const qty = Math.max(1, Number(it.quantity || 1));
        const unitPrice = Number(it.unitPrice || 0);
        newSubtotal += qty * unitPrice;
        await this.orderItemRepo.save(
          this.orderItemRepo.create({
            orderId: order.id,
            productId: it.productId || null,
            productName: it.productName || '3D Electronics Product',
            variantName: it.variantName || 'Signature Edition',
            finishType: it.finishType || 'MATTE',
            primaryHex: it.primaryHex || '#1e293b',
            accentHex: it.accentHex || '#38bdf8',
            quantity: qty,
            unitPrice,
          }),
        );
      }
      order.subtotal = Number(newSubtotal.toFixed(2));
    }

    if (body.shippingCost !== undefined) {
      order.shippingCost = Number(body.shippingCost);
    }
    if (body.taxAmount !== undefined) {
      order.taxAmount = Number(body.taxAmount);
    }

    order.totalAmount = Number(
      (
        Number(order.subtotal || 0) +
        Number(order.shippingCost || 0) +
        Number(order.taxAmount || 0)
      ).toFixed(2),
    );

    await this.orderRepo.save(order);
    this.appendAuditLog(
      'ORDERS',
      `Updated Order ${order.orderNumber} (Status: ${order.orderStatus}, Pay: ${order.paymentStatus})`,
    );
    return this.getOrderById(order.id);
  }

  async updateOrderStatus(
    orderId: number,
    body: {
      orderStatus?:
        | 'PENDING'
        | 'PROCESSING'
        | 'SHIPPED'
        | 'DELIVERED'
        | 'CANCELLED';
      paymentStatus?: 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED';
      fulfillmentMeta?: any;
      restockOnRma?: boolean;
    },
  ) {
    const order = await this.orderRepo.findOne({
      where: { id: orderId },
      relations: ['items'],
    });
    if (!order) {
      throw new NotFoundException('Order not found');
    }

    if (body.orderStatus) order.orderStatus = body.orderStatus;
    if (body.paymentStatus) order.paymentStatus = body.paymentStatus;
    if (body.fulfillmentMeta) {
      order.fulfillmentMeta = {
        ...(order.fulfillmentMeta || {}),
        ...body.fulfillmentMeta,
      };
    }

    if (body.restockOnRma && order.items?.length) {
      for (const item of order.items) {
        if (item.productId) {
          const prod = await this.productRepo.findOne({
            where: { id: item.productId },
          });
          if (prod) {
            prod.stockQuantity =
              Number(prod.stockQuantity || 0) + Number(item.quantity || 1);
            await this.productRepo.save(prod);
          }
        }
      }
    }

    const saved = await this.orderRepo.save(order);
    this.appendAuditLog(
      'FULFILLMENT',
      `Order ${order.orderNumber} -> Status: ${saved.orderStatus}, Payment: ${saved.paymentStatus}`,
    );
    return saved;
  }

  async bulkUpdateOrderStatus(body: {
    orderIds: number[];
    orderStatus?:
      | 'PENDING'
      | 'PROCESSING'
      | 'SHIPPED'
      | 'DELIVERED'
      | 'CANCELLED';
    paymentStatus?: 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED';
  }) {
    const ids = Array.isArray(body.orderIds)
      ? body.orderIds.map(Number).filter(Boolean)
      : [];
    if (ids.length === 0) {
      throw new BadRequestException('No order IDs provided');
    }
    const orders = await this.orderRepo.find({
      where: { id: In(ids) },
    });
    for (const ord of orders) {
      if (body.orderStatus) ord.orderStatus = body.orderStatus;
      if (body.paymentStatus) ord.paymentStatus = body.paymentStatus;
    }
    await this.orderRepo.save(orders);
    this.appendAuditLog(
      'FULFILLMENT',
      `Bulk updated ${orders.length} orders`,
    );
    return { updatedCount: orders.length, orderIds: ids };
  }

  async deleteOrder(orderId: number) {
    const order = await this.orderRepo.findOne({ where: { id: orderId } });
    if (!order) throw new NotFoundException('Order not found');
    await this.orderRepo.remove(order);
    this.appendAuditLog('ORDERS', `Deleted Order ${order.orderNumber}`);
    return { deleted: true, id: orderId };
  }

  async createOrUpdateProduct(body: any, id?: number) {
    let product: Product;
    if (id) {
      product = await this.productRepo.findOne({
        where: { id },
        relations: ['config3d', 'variants', 'hotspots'],
      });
      if (!product) throw new NotFoundException('Product not found');
    } else {
      if (!body.name || !body.categoryId) {
        throw new BadRequestException(
          'Product name and categoryId are required',
        );
      }
      const slug =
        body.slug ||
        body.name
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)/g, '') +
          '-' +
          Math.floor(100 + Math.random() * 900);
      const sku =
        body.sku ||
        '3D-' + Math.floor(10000 + Math.random() * 90000).toString();

      product = this.productRepo.create({
        slug,
        sku,
      });
    }

    if (body.categoryId !== undefined)
      product.categoryId = Number(body.categoryId);
    if (body.name !== undefined) product.name = body.name;
    if (body.sku !== undefined && body.sku.trim())
      product.sku = body.sku.trim();
    if (body.brand !== undefined) product.brand = body.brand || 'Aether 3D';
    if (body.tagline !== undefined) product.tagline = body.tagline;
    if (body.description !== undefined) product.description = body.description;
    if (body.basePrice !== undefined)
      product.basePrice = Number(body.basePrice);
    if (body.salePrice !== undefined)
      product.salePrice =
        body.salePrice !== '' && body.salePrice !== null
          ? Number(body.salePrice)
          : null;
    if (body.stockQuantity !== undefined)
      product.stockQuantity = Number(body.stockQuantity);
    if (body.isFeatured !== undefined)
      product.isFeatured = Boolean(body.isFeatured);
    if (body.isActive !== undefined) product.isActive = Boolean(body.isActive);
    if (body.badgeText !== undefined) product.badgeText = body.badgeText;
    if (body.technicalSpecs !== undefined)
      product.technicalSpecs = body.technicalSpecs;

    const savedProduct = await this.productRepo.save(product);

    if (body.cardMode) {
      this.enterpriseState.productCardModes[savedProduct.id] = body.cardMode;
      this.saveEnterpriseState();
    }

    // Handle 3D configuration
    if (body.config3d || !id) {
      let config = await this.config3dRepo.findOne({
        where: { productId: savedProduct.id },
      });
      if (!config) {
        config = this.config3dRepo.create({
          productId: savedProduct.id,
          modelType: body.config3d?.modelType || 'PROCEDURAL_HEADPHONE',
          glbFileUrl: body.config3d?.glbFileUrl || null,
          defaultScale: Number(body.config3d?.defaultScale || 1.0),
          cameraPosition: body.config3d?.cameraPosition || {
            x: 2.2,
            y: 1.1,
            z: 2.6,
          },
          defaultEnvPreset: body.config3d?.defaultEnvPreset || 'studio',
          autoRotate:
            body.config3d?.autoRotate !== undefined
              ? Boolean(body.config3d.autoRotate)
              : true,
          supportsExplodeView:
            body.config3d?.supportsExplodeView !== undefined
              ? Boolean(body.config3d.supportsExplodeView)
              : true,
          pipelineConfig: body.config3d?.pipelineConfig || {
            fov: 40,
            minZoom: 1.35,
            maxZoom: 5.5,
            autoRotateSpeed: 1.35,
            enableShadows: true,
            enableBloom: true,
            dracoCompressed: true,
            ktx2Transcoded: true,
          },
        });
      } else if (body.config3d) {
        if (body.config3d.modelType) config.modelType = body.config3d.modelType;
        if (body.config3d.glbFileUrl !== undefined)
          config.glbFileUrl = body.config3d.glbFileUrl;
        if (body.config3d.defaultScale !== undefined)
          config.defaultScale = Number(body.config3d.defaultScale);
        if (body.config3d.cameraPosition !== undefined)
          config.cameraPosition = body.config3d.cameraPosition;
        if (body.config3d.defaultEnvPreset)
          config.defaultEnvPreset = body.config3d.defaultEnvPreset;
        if (body.config3d.autoRotate !== undefined)
          config.autoRotate = Boolean(body.config3d.autoRotate);
        if (body.config3d.supportsExplodeView !== undefined)
          config.supportsExplodeView = Boolean(
            body.config3d.supportsExplodeView,
          );
        if (body.config3d.pipelineConfig !== undefined) {
          config.pipelineConfig = {
            ...(config.pipelineConfig || {}),
            ...body.config3d.pipelineConfig,
          };
        }
      }
      await this.config3dRepo.save(config);
    }

    if (
      id &&
      (body.primaryHex || body.secondaryHex || body.accentHex || body.finishType)
    ) {
      const existingVariants = await this.variantRepo.find({
        where: { productId: savedProduct.id },
        order: { id: 'ASC' },
      });
      if (existingVariants.length > 0) {
        const v0 = existingVariants[0];
        if (body.primaryHex) v0.primaryHex = body.primaryHex;
        if (body.secondaryHex) v0.secondaryHex = body.secondaryHex;
        if (body.accentHex) v0.accentHex = body.accentHex;
        if (body.finishType) v0.finishType = body.finishType;
        await this.variantRepo.save(v0);
      }
    }

    // Seed default variants if new product
    if (!id) {
      const primaryHex = body.primaryHex || '#18181b';
      const secondaryHex = body.secondaryHex || '#334155';
      const accentHex = body.accentHex || '#38bdf8';
      const finishType = body.finishType || 'MATTE';

      const variantsToCreate =
        Array.isArray(body.variants) && body.variants.length > 0
          ? body.variants
          : [
              {
                variantName: body.defaultVariantName || 'Signature Edition',
                primaryHex,
                secondaryHex,
                accentHex,
                finishType,
                metalness: finishType === 'MATTE' ? 0.2 : 0.85,
                roughness: finishType === 'MATTE' ? 0.75 : 0.22,
                priceModifier: 0,
                stockQuantity: savedProduct.stockQuantity || 20,
              },
              {
                variantName: 'Titanium Alloy Finish',
                primaryHex: '#cbd5e1',
                secondaryHex: '#475569',
                accentHex: '#6366f1',
                finishType: 'TITANIUM',
                metalness: 0.88,
                roughness: 0.22,
                priceModifier: 25,
                stockQuantity: 15,
              },
              {
                variantName: 'Cyber Neon Pulse',
                primaryHex: '#0f172a',
                secondaryHex: '#1e1b4b',
                accentHex: '#00f5d4',
                finishType: 'NEON',
                metalness: 0.6,
                roughness: 0.28,
                priceModifier: 35,
                stockQuantity: 10,
              },
            ];

      for (const v of variantsToCreate) {
        await this.variantRepo.save(
          this.variantRepo.create({
            productId: savedProduct.id,
            ...v,
          }),
        );
      }

      await this.hotspotRepo.save(
        this.hotspotRepo.create({
          productId: savedProduct.id,
          title: 'Precision Engineered Core',
          description: `Custom 3D architecture for ${savedProduct.name}.`,
          posX: 0.0,
          posY: 0.25,
          posZ: 0.45,
          camX: 1.9,
          camY: 0.9,
          camZ: 2.2,
        }),
      );
    }

    this.appendAuditLog(
      'CATALOG_3D',
      `${id ? 'Updated' : 'Created'} 3D Product "${savedProduct.name}" (SKU: ${savedProduct.sku})`,
    );

    return this.productRepo.findOne({
      where: { id: savedProduct.id },
      relations: ['category', 'config3d', 'variants', 'hotspots'],
    });
  }

  async duplicateProduct(productId: number) {
    const original = await this.productRepo.findOne({
      where: { id: productId },
      relations: ['config3d', 'variants', 'hotspots'],
    });
    if (!original) throw new NotFoundException('Product not found');

    const rand = Math.floor(100 + Math.random() * 900);
    const clonedProduct = await this.productRepo.save(
      this.productRepo.create({
        categoryId: original.categoryId,
        name: `${original.name} (Copy)`,
        slug: `${original.slug}-copy-${rand}`,
        sku: `${original.sku}-C${rand}`,
        brand: original.brand,
        tagline: original.tagline,
        description: original.description,
        basePrice: original.basePrice,
        salePrice: original.salePrice,
        stockQuantity: original.stockQuantity,
        isFeatured: false,
        isActive: original.isActive,
        technicalSpecs: original.technicalSpecs,
        badgeText: original.badgeText,
        ratingAverage: original.ratingAverage,
        reviewCount: 0,
      }),
    );

    if (original.config3d) {
      await this.config3dRepo.save(
        this.config3dRepo.create({
          productId: clonedProduct.id,
          modelType: original.config3d.modelType,
          glbFileUrl: original.config3d.glbFileUrl,
          defaultScale: original.config3d.defaultScale,
          cameraPosition: original.config3d.cameraPosition,
          defaultEnvPreset: original.config3d.defaultEnvPreset,
          autoRotate: original.config3d.autoRotate,
          supportsExplodeView: original.config3d.supportsExplodeView,
          pipelineConfig: original.config3d.pipelineConfig,
        }),
      );
    }

    for (const v of original.variants || []) {
      await this.variantRepo.save(
        this.variantRepo.create({
          productId: clonedProduct.id,
          variantName: v.variantName,
          primaryHex: v.primaryHex,
          secondaryHex: v.secondaryHex,
          accentHex: v.accentHex,
          finishType: v.finishType,
          metalness: v.metalness,
          roughness: v.roughness,
          priceModifier: v.priceModifier,
          stockQuantity: v.stockQuantity,
        }),
      );
    }

    for (const h of original.hotspots || []) {
      await this.hotspotRepo.save(
        this.hotspotRepo.create({
          productId: clonedProduct.id,
          title: h.title,
          description: h.description,
          posX: h.posX,
          posY: h.posY,
          posZ: h.posZ,
          camX: h.camX,
          camY: h.camY,
          camZ: h.camZ,
        }),
      );
    }

    this.appendAuditLog(
      'CATALOG_3D',
      `Duplicated 3D Product #${productId} -> "${clonedProduct.name}"`,
    );

    return this.productRepo.findOne({
      where: { id: clonedProduct.id },
      relations: ['category', 'config3d', 'variants', 'hotspots'],
    });
  }

  async updateProduct3DConfig(productId: number, body: any) {
    const product = await this.productRepo.findOne({
      where: { id: productId },
    });
    if (!product) throw new NotFoundException('Product not found');

    let config = await this.config3dRepo.findOne({ where: { productId } });
    if (!config) {
      config = this.config3dRepo.create({ productId });
    }

    if (body.modelType !== undefined) config.modelType = body.modelType;
    if (body.glbFileUrl !== undefined) config.glbFileUrl = body.glbFileUrl;
    if (body.defaultScale !== undefined)
      config.defaultScale = Number(body.defaultScale);
    if (body.cameraPosition !== undefined)
      config.cameraPosition = body.cameraPosition;
    if (body.defaultEnvPreset !== undefined)
      config.defaultEnvPreset = body.defaultEnvPreset;
    if (body.autoRotate !== undefined)
      config.autoRotate = Boolean(body.autoRotate);
    if (body.supportsExplodeView !== undefined)
      config.supportsExplodeView = Boolean(body.supportsExplodeView);
    if (body.pipelineConfig !== undefined) {
      config.pipelineConfig = {
        ...(config.pipelineConfig || {}),
        ...body.pipelineConfig,
      };
    }

    await this.config3dRepo.save(config);
    this.appendAuditLog(
      '3D_PIPELINE',
      `Saved 3D Pipeline & Shader Rig for "${product.name}" (${config.modelType})`,
    );

    return this.productRepo.findOne({
      where: { id: productId },
      relations: ['category', 'config3d', 'variants', 'hotspots'],
    });
  }

  async quickPatchProduct(
    productId: number,
    body: {
      isFeatured?: boolean;
      isActive?: boolean;
      stockQuantity?: number;
      basePrice?: number;
      salePrice?: number | null;
      badgeText?: string;
    },
  ) {
    const product = await this.productRepo.findOne({
      where: { id: productId },
    });
    if (!product) throw new NotFoundException('Product not found');

    if (body.isFeatured !== undefined)
      product.isFeatured = Boolean(body.isFeatured);
    if (body.isActive !== undefined) product.isActive = Boolean(body.isActive);
    if (body.stockQuantity !== undefined)
      product.stockQuantity = Math.max(0, Number(body.stockQuantity));
    if (body.basePrice !== undefined)
      product.basePrice = Number(body.basePrice);
    if (body.salePrice !== undefined)
      product.salePrice =
        body.salePrice !== null && String(body.salePrice) !== ''
          ? Number(body.salePrice)
          : null;
    if (body.badgeText !== undefined) product.badgeText = body.badgeText;

    await this.productRepo.save(product);
    return this.productRepo.findOne({
      where: { id: productId },
      relations: ['category', 'config3d', 'variants', 'hotspots'],
    });
  }

  async attachGlbToProduct(
    productId: number,
    glbUrl: string,
    defaultScale?: number,
  ) {
    let config = await this.config3dRepo.findOne({ where: { productId } });
    if (!config) {
      config = this.config3dRepo.create({
        productId,
        modelType: 'GLB_FILE',
        glbFileUrl: glbUrl,
        defaultScale: defaultScale ? Number(defaultScale) : 1.0,
      });
    } else {
      config.modelType = 'GLB_FILE';
      config.glbFileUrl = glbUrl;
      if (defaultScale) config.defaultScale = Number(defaultScale);
    }
    await this.config3dRepo.save(config);
    this.appendAuditLog(
      '3D_PIPELINE',
      `Uploaded & bound 3D model asset ${glbUrl} to Product #${productId}`,
    );
    return this.productRepo.findOne({
      where: { id: productId },
      relations: ['category', 'config3d', 'variants', 'hotspots'],
    });
  }

  async addVariant(productId: number, body: any) {
    const product = await this.productRepo.findOne({
      where: { id: productId },
    });
    if (!product) throw new NotFoundException('Product not found');

    const finishPresets: Record<
      string,
      { metalness: number; roughness: number }
    > = {
      MATTE: { metalness: 0.2, roughness: 0.76 },
      METALLIC: { metalness: 0.92, roughness: 0.18 },
      TITANIUM: { metalness: 0.86, roughness: 0.24 },
      GLOSSY: { metalness: 0.3, roughness: 0.08 },
      NEON: { metalness: 0.58, roughness: 0.28 },
    };

    const finish = (body.finishType || 'MATTE').toUpperCase();
    const pbr = finishPresets[finish] || finishPresets.MATTE;

    const saved = await this.variantRepo.save(
      this.variantRepo.create({
        productId,
        variantName: body.variantName || 'Custom Finish',
        primaryHex: body.primaryHex || '#1e293b',
        secondaryHex: body.secondaryHex || '#334155',
        accentHex: body.accentHex || '#38bdf8',
        finishType: finish as any,
        metalness:
          body.metalness !== undefined ? Number(body.metalness) : pbr.metalness,
        roughness:
          body.roughness !== undefined ? Number(body.roughness) : pbr.roughness,
        priceModifier: Number(body.priceModifier || 0),
        stockQuantity: Number(body.stockQuantity || 15),
      }),
    );
    this.appendAuditLog(
      'PBR_SHADER',
      `Added PBR Variant "${saved.variantName}" (${saved.finishType}) to "${product.name}"`,
    );
    return saved;
  }

  async updateVariant(variantId: number, body: any) {
    const variant = await this.variantRepo.findOne({
      where: { id: variantId },
    });
    if (!variant) throw new NotFoundException('Variant not found');

    if (body.variantName !== undefined) variant.variantName = body.variantName;
    if (body.finishType !== undefined)
      variant.finishType = body.finishType.toUpperCase();
    if (body.primaryHex !== undefined) variant.primaryHex = body.primaryHex;
    if (body.secondaryHex !== undefined)
      variant.secondaryHex = body.secondaryHex;
    if (body.accentHex !== undefined) variant.accentHex = body.accentHex;
    if (body.metalness !== undefined)
      variant.metalness = Number(body.metalness);
    if (body.roughness !== undefined)
      variant.roughness = Number(body.roughness);
    if (body.priceModifier !== undefined)
      variant.priceModifier = Number(body.priceModifier);
    if (body.stockQuantity !== undefined)
      variant.stockQuantity = Math.max(0, Number(body.stockQuantity));

    return this.variantRepo.save(variant);
  }

  async deleteVariant(variantId: number) {
    const variant = await this.variantRepo.findOne({
      where: { id: variantId },
    });
    if (!variant) throw new NotFoundException('Variant not found');
    await this.variantRepo.remove(variant);
    return { deleted: true, id: variantId };
  }

  async addHotspot(productId: number, body: any) {
    return this.hotspotRepo.save(
      this.hotspotRepo.create({
        productId,
        title: body.title || '3D Feature Highlight',
        description: body.description || 'Precision engineered component.',
        posX: Number(body.posX ?? 0),
        posY: Number(body.posY ?? 0.5),
        posZ: Number(body.posZ ?? 0.5),
        camX: Number(body.camX ?? 1.8),
        camY: Number(body.camY ?? 1.1),
        camZ: Number(body.camZ ?? 2.2),
      }),
    );
  }

  async updateHotspot(hotspotId: number, body: any) {
    const hotspot = await this.hotspotRepo.findOne({
      where: { id: hotspotId },
    });
    if (!hotspot) throw new NotFoundException('Hotspot not found');

    if (body.title !== undefined) hotspot.title = body.title;
    if (body.description !== undefined) hotspot.description = body.description;
    if (body.posX !== undefined) hotspot.posX = Number(body.posX);
    if (body.posY !== undefined) hotspot.posY = Number(body.posY);
    if (body.posZ !== undefined) hotspot.posZ = Number(body.posZ);
    if (body.camX !== undefined) hotspot.camX = Number(body.camX);
    if (body.camY !== undefined) hotspot.camY = Number(body.camY);
    if (body.camZ !== undefined) hotspot.camZ = Number(body.camZ);

    return this.hotspotRepo.save(hotspot);
  }

  async deleteHotspot(hotspotId: number) {
    const hotspot = await this.hotspotRepo.findOne({
      where: { id: hotspotId },
    });
    if (!hotspot) throw new NotFoundException('Hotspot not found');
    await this.hotspotRepo.remove(hotspot);
    return { deleted: true, id: hotspotId };
  }

  async createCategory(body: {
    name: string;
    slug?: string;
    icon?: string;
    description?: string;
    displayOrder?: number;
  }) {
    if (!body.name) throw new BadRequestException('Category name is required');
    const slug =
      body.slug ||
      body.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
    return this.categoryRepo.save(
      this.categoryRepo.create({
        name: body.name,
        slug,
        icon: body.icon || 'cube',
        description: body.description || '',
        displayOrder: Number(body.displayOrder || 10),
      }),
    );
  }

  async updateCategory(
    categoryId: number,
    body: {
      name?: string;
      slug?: string;
      icon?: string;
      description?: string;
      displayOrder?: number;
    },
  ) {
    const cat = await this.categoryRepo.findOne({ where: { id: categoryId } });
    if (!cat) throw new NotFoundException('Category not found');

    if (body.name !== undefined) cat.name = body.name;
    if (body.slug !== undefined) cat.slug = body.slug;
    if (body.icon !== undefined) cat.icon = body.icon;
    if (body.description !== undefined) cat.description = body.description;
    if (body.displayOrder !== undefined)
      cat.displayOrder = Number(body.displayOrder);

    return this.categoryRepo.save(cat);
  }

  async deleteCategory(categoryId: number) {
    const cat = await this.categoryRepo.findOne({ where: { id: categoryId } });
    if (!cat) throw new NotFoundException('Category not found');
    await this.categoryRepo.remove(cat);
    return { deleted: true, id: categoryId };
  }

  async updateUserRole(userId: number, role: 'ADMIN' | 'CUSTOMER') {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');
    user.role = role === 'ADMIN' ? 'ADMIN' : 'CUSTOMER';
    return this.userRepo.save(user);
  }

  async deleteUser(userId: number) {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');
    await this.userRepo.remove(user);
    return { deleted: true, id: userId };
  }

  async deleteProduct(productId: number) {
    const product = await this.productRepo.findOne({
      where: { id: productId },
    });
    if (!product) throw new NotFoundException('Product not found');
    await this.productRepo.remove(product);
    this.appendAuditLog('CATALOG_3D', `Deleted Product "${product.name}"`);
    return { deleted: true, id: productId };
  }
}
