import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  Product,
  Product3DConfig,
  ProductVariant,
  ProductHotspot,
  Category,
  Order,
  User,
} from '../../database/entities';

@Injectable()
export class AdminService {
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
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  async getDashboardStats() {
    const products = await this.productRepo.find({
      relations: ['category', 'config3d', 'variants', 'hotspots'],
      order: { id: 'ASC' },
    });
    const orders = await this.orderRepo.find({
      relations: ['items'],
      order: { createdAt: 'DESC' },
    });
    const categories = await this.categoryRepo.find({
      order: { displayOrder: 'ASC' },
    });
    const users = await this.userRepo.find({
      order: { createdAt: 'DESC' },
    });

    const validOrders = orders.filter((o) => o.orderStatus !== 'CANCELLED');
    const totalRevenue = validOrders.reduce(
      (acc, o) => acc + Number(o.totalAmount || 0),
      0,
    );

    const pendingOrdersCount = orders.filter(
      (o) => o.orderStatus === 'PENDING' || o.orderStatus === 'PROCESSING',
    ).length;

    const shippedOrdersCount = orders.filter(
      (o) => o.orderStatus === 'SHIPPED' || o.orderStatus === 'DELIVERED',
    ).length;

    const featuredCount = products.filter((p) => p.isFeatured).length;
    const customGlbCount = products.filter(
      (p) => p.config3d?.modelType === 'GLB_FILE',
    ).length;

    const lowStockProducts = products
      .filter((p) => p.stockQuantity <= 15)
      .map((p) => ({
        id: p.id,
        name: p.name,
        sku: p.sku,
        stockQuantity: p.stockQuantity,
        price: Number(p.salePrice || p.basePrice),
      }));

    return {
      totalRevenue: Number(totalRevenue.toFixed(2)),
      totalOrders: orders.length,
      pendingOrdersCount,
      shippedOrdersCount,
      totalProducts: products.length,
      featuredCount,
      customGlbCount,
      totalCategories: categories.length,
      totalUsers: users.length,
      lowStockCount: lowStockProducts.length,
      lowStockProducts,
      recentOrders: orders.slice(0, 20),
      users: users.map((u) => ({
        id: u.id,
        fullName: u.fullName,
        email: u.email,
        role: u.role,
        phone: u.phone,
        createdAt: u.createdAt,
      })),
    };
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

    return this.orderRepo.save(order);
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
    if (body.sku !== undefined && body.sku.trim()) product.sku = body.sku.trim();
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
        });
      } else if (body.config3d) {
        if (body.config3d.modelType) config.modelType = body.config3d.modelType;
        if (body.config3d.glbFileUrl !== undefined)
          config.glbFileUrl = body.config3d.glbFileUrl;
        if (body.config3d.defaultScale !== undefined)
          config.defaultScale = Number(body.config3d.defaultScale);
        if (body.config3d.defaultEnvPreset)
          config.defaultEnvPreset = body.config3d.defaultEnvPreset;
        if (body.config3d.autoRotate !== undefined)
          config.autoRotate = Boolean(body.config3d.autoRotate);
        if (body.config3d.supportsExplodeView !== undefined)
          config.supportsExplodeView = Boolean(
            body.config3d.supportsExplodeView,
          );
      }
      await this.config3dRepo.save(config);
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

      // Add a default hotspot so new products immediately have a 3D pin
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

    return this.productRepo.findOne({
      where: { id: savedProduct.id },
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
        body.salePrice !== null ? Number(body.salePrice) : null;

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

    return this.variantRepo.save(
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

  async deleteCategory(categoryId: number) {
    const cat = await this.categoryRepo.findOne({ where: { id: categoryId } });
    if (!cat) throw new NotFoundException('Category not found');
    await this.categoryRepo.remove(cat);
    return { deleted: true, id: categoryId };
  }

  async deleteProduct(productId: number) {
    const product = await this.productRepo.findOne({
      where: { id: productId },
    });
    if (!product) throw new NotFoundException('Product not found');
    await this.productRepo.remove(product);
    return { deleted: true, id: productId };
  }
}
