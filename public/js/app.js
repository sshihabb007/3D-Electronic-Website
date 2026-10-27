import { SceneManager } from './three/SceneManager.js';

class Aether3DStoreApp {
  constructor() {
    this.categories = [];
    this.products = [];
    this.adminProducts = [];
    this.adminOrders = [];
    this.featuredProducts = [];

    this.activeHeroProduct = null;
    this.activeHeroVariant = null;

    this.activeStudioProduct = null;
    this.activeStudioVariant = null;

    this.adminSelectedSubProduct = null;
    this.adminOrderFilter = 'ALL';
    this.adminCatalogSearch = '';
    this.adminPreviewExploded = false;

    this.selectedCategory = 'all';
    this.searchQuery = '';
    this.sortBy = 'featured';

    this.cart = JSON.parse(localStorage.getItem('aether_3d_cart') || '[]');
    this.authUser = JSON.parse(localStorage.getItem('aether_3d_user') || 'null');
    this.authToken = localStorage.getItem('aether_3d_token') || null;
    this.isRegisterMode = false;

    this.heroScene = null;
    this.studioScene = null;
    this.adminPreviewScene = null;

    this.init();
  }

  async init() {
    this.initHero3DStage();
    this.resetAdminSpecRows({
      Driver: '45mm Custom Beryllium Planar',
      Battery: '60 Hours Adaptive ANC',
      Connectivity: 'Bluetooth 5.4 + USB-C Lossless',
    });
    this.bindUIEvents();
    this.updateAuthUI();
    this.renderCart();

    await Promise.all([this.loadCategories(), this.loadProducts()]);
  }

  showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    if (!container) return;
    const toast = document.createElement('div');
    const borderCol =
      type === 'success'
        ? 'border-emerald-400/60 text-emerald-200'
        : type === 'error'
          ? 'border-rose-400/60 text-rose-200'
          : 'border-cyan-400/60 text-cyan-200';
    toast.className = `glass-panel px-4 py-3 rounded-2xl border ${borderCol} text-xs font-semibold shadow-xl transition-all duration-300`;
    toast.textContent = message;
    container.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = '0';
      setTimeout(() => toast.remove(), 300);
    }, 3400);
  }

  initHero3DStage() {
    const container = document.getElementById('hero-3d-canvas-container');
    const hotspotLayer = document.getElementById('hero-hotspot-layer');
    if (!container) return;

    this.heroScene = new SceneManager(container, {
      hotspotLayer,
      autoRotate: true,
      onHotspotSelect: (hotspot) => {
        const card = document.getElementById('hero-hotspot-card');
        const titleEl = document.getElementById('hotspot-card-title');
        const descEl = document.getElementById('hotspot-card-desc');
        if (card && titleEl && descEl) {
          titleEl.textContent = hotspot.title;
          descEl.textContent = hotspot.description;
          card.classList.remove('hidden');
        }
      },
    });
  }

  ensureStudio3DStage() {
    if (this.studioScene) {
      setTimeout(() => this.studioScene.handleResize(), 60);
      return;
    }
    const container = document.getElementById('studio-3d-canvas');
    const hotspotLayer = document.getElementById('studio-hotspot-layer');
    if (!container) return;

    this.studioScene = new SceneManager(container, {
      hotspotLayer,
      autoRotate: true,
    });
  }

  ensureAdminPreview3DStage() {
    const container = document.getElementById('admin-preview-3d-canvas');
    if (!container) return;
    if (!this.adminPreviewScene) {
      this.adminPreviewScene = new SceneManager(container, {
        autoRotate: true,
      });
    } else {
      setTimeout(() => this.adminPreviewScene.handleResize(), 60);
    }
    this.syncAdminLive3DPreview();
  }

  async syncAdminLive3DPreview() {
    if (!this.adminPreviewScene) return;
    const uploadedGlbUrl =
      document.getElementById('adm-uploaded-glb-url')?.value || '';
    const selectedType =
      document.getElementById('adm-model-type')?.value ||
      'PROCEDURAL_HEADPHONE';
    const modelType = uploadedGlbUrl ? 'GLB_FILE' : selectedType;
    const defaultScale = Number(
      document.getElementById('adm-default-scale')?.value || 1.0,
    );
    const defaultEnvPreset =
      document.getElementById('adm-env-preset')?.value || 'studio';

    const previewProduct = {
      name: document.getElementById('adm-prod-name')?.value || 'Preview Device',
      config3d: {
        modelType,
        glbFileUrl: uploadedGlbUrl || null,
        defaultScale,
        defaultEnvPreset,
        cameraPosition: { x: 2.2, y: 1.1, z: 2.6 },
      },
      hotspots: [],
    };

    const previewVariant = {
      variantName: 'Admin Preview Edition',
      finishType: document.getElementById('adm-default-finish')?.value || 'MATTE',
      primaryHex: document.getElementById('adm-primary-hex')?.value || '#18181b',
      secondaryHex:
        document.getElementById('adm-secondary-hex')?.value || '#334155',
      accentHex: document.getElementById('adm-accent-hex')?.value || '#38bdf8',
    };

    await this.adminPreviewScene.loadProduct(previewProduct, previewVariant);
  }

  async loadCategories() {
    try {
      const res = await fetch('/api/categories');
      this.categories = await res.json();
      this.renderCategoryFilters();
      this.populateAdminCategories();
    } catch (err) {
      console.error('Failed to load categories:', err);
    }
  }

  async loadProducts(refreshHero = false) {
    try {
      const params = new URLSearchParams();
      if (this.selectedCategory && this.selectedCategory !== 'all') {
        params.set('category', this.selectedCategory);
      }
      if (this.searchQuery) {
        params.set('search', this.searchQuery);
      }
      if (this.sortBy) {
        params.set('sort', this.sortBy);
      }

      const res = await fetch(`/api/products?${params.toString()}`);
      this.products = await res.json();

      // Always keep Featured Flagships fresh from the full catalog
      const allRes = await fetch('/api/products');
      const allActive = await allRes.json();
      this.featuredProducts = allActive.filter((p) => p.isFeatured);
      if (this.featuredProducts.length === 0 && allActive.length > 0) {
        this.featuredProducts = allActive.slice(0, 5);
      }

      this.renderHeroProductTabs();
      if (!this.activeHeroProduct || refreshHero) {
        if (this.featuredProducts.length > 0) {
          await this.selectHeroProduct(this.featuredProducts[0]);
        }
      }

      this.renderCatalogGrid();
    } catch (err) {
      console.error('Failed to load products:', err);
    }
  }

  renderHeroProductTabs() {
    const tabsEl = document.getElementById('hero-product-tabs');
    if (!tabsEl) return;

    tabsEl.innerHTML = this.featuredProducts
      .map((prod) => {
        const isActive = this.activeHeroProduct?.id === prod.id;
        return `
          <button
            data-hero-id="${prod.id}"
            class="hero-tab-btn whitespace-nowrap px-3.5 py-1.5 rounded-xl text-xs font-bold border transition flex items-center gap-1.5 ${
              isActive
                ? 'bg-cyan-500/20 border-cyan-400 text-cyan-200 shadow-sm'
                : 'bg-slate-900/80 border-slate-800 text-slate-400 hover:text-white hover:border-slate-600'
            }"
          >
            <span class="text-amber-400">★</span>
            <span>${prod.name}</span>
          </button>
        `;
      })
      .join('');

    tabsEl.querySelectorAll('.hero-tab-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const id = Number(btn.getAttribute('data-hero-id'));
        const prod = this.featuredProducts.find((p) => p.id === id);
        if (prod) this.selectHeroProduct(prod);
      });
    });
  }

  async selectHeroProduct(product) {
    this.activeHeroProduct = product;
    const defaultVariant =
      (product.variants && product.variants[0]) || {
        variantName: 'Obsidian Matte Edition',
        primaryHex: '#18181b',
        secondaryHex: '#334155',
        accentHex: '#38bdf8',
        finishType: 'MATTE',
        priceModifier: 0,
      };
    this.activeHeroVariant = { ...defaultVariant };

    this.renderHeroProductTabs();

    document.getElementById('hero-badge').textContent =
      product.badgeText || 'FLAGSHIP 3D';
    document.getElementById('hero-brand').textContent = product.brand;
    document.getElementById('hero-title').textContent = product.name;
    document.getElementById('hero-tagline').textContent = product.tagline || '';
    document.getElementById('hero-description').textContent =
      product.description || '';
    document.getElementById('hero-rating').textContent = Number(
      product.ratingAverage || 4.9,
    ).toFixed(2);
    document.getElementById('hero-reviews-count').textContent =
      product.reviewCount || 42;

    this.updateHeroPriceDisplay();
    this.renderHeroVariantSwatches();
    this.syncHeroCustomizerInputs();

    const explodeSlider = document.getElementById('hero-explode-slider');
    const explodeLabel = document.getElementById('explode-percent-label');
    if (explodeSlider) explodeSlider.value = '0';
    if (explodeLabel) explodeLabel.textContent = '0%';
    document.getElementById('hero-hotspot-card')?.classList.add('hidden');

    if (this.heroScene) {
      await this.heroScene.loadProduct(product, this.activeHeroVariant);
    }
  }

  updateHeroPriceDisplay() {
    if (!this.activeHeroProduct) return;
    const base = Number(
      this.activeHeroProduct.salePrice || this.activeHeroProduct.basePrice || 0,
    );
    const mod = Number(this.activeHeroVariant?.priceModifier || 0);
    const finalPrice = base + mod;

    document.getElementById('hero-price').textContent =
      `$${finalPrice.toFixed(2)}`;
    const oldPriceEl = document.getElementById('hero-old-price');
    if (this.activeHeroProduct.salePrice) {
      oldPriceEl.textContent = `$${(Number(this.activeHeroProduct.basePrice) + mod).toFixed(2)}`;
      oldPriceEl.classList.remove('hidden');
    } else {
      oldPriceEl.classList.add('hidden');
    }
  }

  renderHeroVariantSwatches() {
    const container = document.getElementById('hero-variant-swatches');
    if (!container || !this.activeHeroProduct) return;

    const variants = this.activeHeroProduct.variants || [];
    container.innerHTML = variants
      .map((v, idx) => {
        const isSelected =
          this.activeHeroVariant?.variantName === v.variantName;
        return `
          <button
            type="button"
            data-variant-idx="${idx}"
            class="hero-swatch-btn flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-semibold transition ${
              isSelected
                ? 'border-cyan-400 bg-cyan-500/15 text-white shadow'
                : 'border-slate-700/80 bg-slate-900/80 text-slate-300 hover:border-slate-500'
            }"
          >
            <span class="w-4 h-4 rounded-full border border-white/30" style="background: linear-gradient(135deg, ${v.primaryHex} 55%, ${v.accentHex} 100%)"></span>
            <span>${v.variantName}</span>
          </button>
        `;
      })
      .join('');

    container.querySelectorAll('.hero-swatch-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const idx = Number(btn.getAttribute('data-variant-idx'));
        const chosen = variants[idx];
        if (!chosen) return;
        this.activeHeroVariant = { ...chosen };
        document.getElementById('hero-selected-variant-name').textContent =
          chosen.variantName;
        this.renderHeroVariantSwatches();
        this.syncHeroCustomizerInputs();
        this.updateHeroPriceDisplay();
        this.heroScene?.applyMaterialCustomization(this.activeHeroVariant);
      });
    });
  }

  syncHeroCustomizerInputs() {
    if (!this.activeHeroVariant) return;
    document.getElementById('hero-selected-variant-name').textContent =
      this.activeHeroVariant.variantName || 'Custom 3D Build';

    const pInput = document.getElementById('hero-primary-color');
    const sInput = document.getElementById('hero-secondary-color');
    const aInput = document.getElementById('hero-accent-color');
    if (pInput && this.activeHeroVariant.primaryHex)
      pInput.value = this.activeHeroVariant.primaryHex;
    if (sInput && this.activeHeroVariant.secondaryHex)
      sInput.value = this.activeHeroVariant.secondaryHex;
    if (aInput && this.activeHeroVariant.accentHex)
      aInput.value = this.activeHeroVariant.accentHex;

    const activeFinish = (
      this.activeHeroVariant.finishType || 'MATTE'
    ).toUpperCase();
    document
      .querySelectorAll('#hero-finish-buttons .finish-btn')
      .forEach((btn) => {
        const f = btn.getAttribute('data-finish');
        if (f === activeFinish) {
          btn.className =
            'finish-btn py-1.5 px-2 rounded-lg text-[11px] font-bold border border-cyan-400 bg-cyan-500/20 text-white transition';
        } else {
          btn.className =
            'finish-btn py-1.5 px-2 rounded-lg text-[11px] font-bold border border-slate-700 bg-slate-900/80 text-slate-300 hover:border-slate-500 transition';
        }
      });
  }

  renderCategoryFilters() {
    const bar = document.getElementById('category-filter-bar');
    if (!bar) return;

    const allCats = [
      { name: 'All Electronics', slug: 'all' },
      ...this.categories,
    ];

    bar.innerHTML = allCats
      .map((cat) => {
        const active = this.selectedCategory === cat.slug;
        return `
          <button
            data-cat-slug="${cat.slug}"
            class="cat-pill-btn px-3.5 py-1.5 rounded-xl text-xs font-bold border transition ${
              active
                ? 'bg-cyan-500 text-slate-950 border-cyan-400'
                : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-600'
            }"
          >
            ${cat.name}
          </button>
        `;
      })
      .join('');

    bar.querySelectorAll('.cat-pill-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        this.selectedCategory = btn.getAttribute('data-cat-slug');
        this.renderCategoryFilters();
        this.loadProducts();
      });
    });
  }

  getArchetypeSvg(modelType) {
    switch (modelType) {
      case 'PROCEDURAL_PHONE':
        return `<svg class="w-14 h-14 text-cyan-400" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><rect x="6" y="2" width="12" height="20" rx="2"/><circle cx="12" cy="18" r="1"/></svg>`;
      case 'PROCEDURAL_WATCH':
        return `<svg class="w-14 h-14 text-amber-400" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><rect x="6" y="6" width="12" height="12" rx="3"/><path d="M9 2h6v4H9zM9 18h6v4H9z"/></svg>`;
      case 'PROCEDURAL_EARBUDS':
        return `<svg class="w-14 h-14 text-purple-400" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path d="M7 9a3 3 0 116 0v7a2 2 0 11-4 0v-4M17 9a3 3 0 10-6 0"/><rect x="3" y="13" width="18" height="8" rx="3"/></svg>`;
      case 'PROCEDURAL_SPEAKER':
        return `<svg class="w-14 h-14 text-emerald-400" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><rect x="5" y="2" width="14" height="20" rx="3"/><circle cx="12" cy="14" r="4"/><circle cx="12" cy="6" r="1.5"/></svg>`;
      default:
        return `<svg class="w-14 h-14 text-cyan-400" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path d="M3 18v-6a9 9 0 0118 0v6"/><path d="M21 19a2 2 0 01-2 2h-1a2 2 0 01-2-2v-3a2 2 0 012-2h3zM3 19a2 2 0 002 2h1a2 2 0 002-2v-3a2 2 0 00-2-2H3z"/></svg>`;
    }
  }

  renderCatalogGrid() {
    const grid = document.getElementById('catalog-products-grid');
    if (!grid) return;

    if (this.products.length === 0) {
      grid.innerHTML = `
        <div class="col-span-full glass-panel rounded-2xl p-10 text-center text-slate-400">
          No 3D electronics matched your filter. Try clearing the search or selecting "All Electronics".
        </div>
      `;
      return;
    }

    grid.innerHTML = this.products
      .map((product) => {
        const price = Number(product.salePrice || product.basePrice || 0);
        const variants = product.variants || [];
        const primaryVar = variants[0] || {
          primaryHex: '#1e293b',
          accentHex: '#38bdf8',
          finishType: 'MATTE',
        };
        const modelType =
          product.config3d?.modelType || 'PROCEDURAL_HEADPHONE';

        return `
          <div class="glass-card rounded-3xl p-5 flex flex-col justify-between">
            <div>
              <div
                class="relative h-44 rounded-2xl stage-grid-bg border border-slate-800/80 flex flex-col items-center justify-center p-4 cursor-pointer group overflow-hidden"
                data-open-studio="${product.id}"
              >
                <div class="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-md bg-cyan-500/15 border border-cyan-400/30 text-[10px] font-bold text-cyan-300">
                  ${product.isFeatured ? '★ ' : ''}${product.badgeText || '360° 3D MODEL'}
                </div>
                <div class="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-md bg-slate-900/90 border border-slate-700 text-[10px] font-semibold text-slate-300">
                  ${modelType === 'GLB_FILE' ? 'CUSTOM .GLB' : '3D STUDIO'}
                </div>

                <div
                  class="w-24 h-24 rounded-full flex items-center justify-center shadow-2xl transition-transform duration-300 group-hover:scale-110"
                  style="background: radial-gradient(circle, ${primaryVar.accentHex}33 0%, ${primaryVar.primaryHex} 75%); border: 2px solid ${primaryVar.accentHex}66"
                >
                  ${this.getArchetypeSvg(modelType)}
                </div>

                <span class="mt-2 text-[11px] font-bold text-cyan-300 opacity-85 group-hover:opacity-100 flex items-center gap-1">
                  <span>Click to Launch 360° 3D Studio</span> →
                </span>
              </div>

              <div class="mt-4">
                <div class="flex items-center justify-between text-[11px] text-slate-400 font-semibold">
                  <span>${product.brand}</span>
                  <span class="text-amber-400">★ ${Number(product.ratingAverage || 4.9).toFixed(1)} (${product.reviewCount || 12})</span>
                </div>
                <h3 class="text-base font-extrabold text-white mt-0.5">${product.name}</h3>
                <p class="text-xs text-slate-400 line-clamp-2 mt-1">${product.tagline || product.description}</p>
              </div>

              <div class="flex items-center gap-1.5 mt-3">
                ${variants
                  .map(
                    (v) => `
                  <span
                    title="${v.variantName} (${v.finishType})"
                    class="w-4 h-4 rounded-full border border-white/30"
                    style="background: linear-gradient(135deg, ${v.primaryHex} 55%, ${v.accentHex} 100%)"
                  ></span>
                `,
                  )
                  .join('')}
                <span class="text-[10px] text-slate-400 ml-1">${variants.length} 3D Finishes</span>
              </div>
            </div>

            <div class="mt-5 pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2">
              <div>
                <span class="text-lg font-extrabold text-white">$${price.toFixed(2)}</span>
                ${
                  product.salePrice
                    ? `<span class="block text-[10px] text-slate-500 line-through">$${Number(product.basePrice).toFixed(2)}</span>`
                    : ''
                }
              </div>
              <div class="flex items-center gap-1.5">
                <button
                  data-hero-load="${product.id}"
                  title="Preview on Hero Stage"
                  class="px-2.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-[11px] font-bold text-cyan-300 transition"
                >
                  3D Stage
                </button>
                <button
                  data-open-studio="${product.id}"
                  class="px-3 py-2 rounded-xl bg-gradient-to-r from-cyan-400 to-indigo-500 hover:from-cyan-300 hover:to-indigo-400 text-slate-950 text-[11px] font-extrabold transition"
                >
                  Customize
                </button>
              </div>
            </div>
          </div>
        `;
      })
      .join('');

    grid.querySelectorAll('[data-open-studio]').forEach((el) => {
      el.addEventListener('click', () => {
        const id = Number(el.getAttribute('data-open-studio'));
        this.openProductStudioModal(id);
      });
    });

    grid.querySelectorAll('[data-hero-load]').forEach((el) => {
      el.addEventListener('click', () => {
        const id = Number(el.getAttribute('data-hero-load'));
        const prod = this.products.find((p) => p.id === id);
        if (prod) {
          this.selectHeroProduct(prod);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      });
    });
  }

  async openProductStudioModal(productId) {
    try {
      const res = await fetch(`/api/products/${productId}`);
      const product = await res.json();
      this.activeStudioProduct = product;
      this.activeStudioVariant = {
        ...((product.variants && product.variants[0]) || {
          variantName: 'Default Edition',
          primaryHex: '#18181b',
          secondaryHex: '#334155',
          accentHex: '#38bdf8',
          finishType: 'MATTE',
          priceModifier: 0,
        }),
      };

      const modal = document.getElementById('studio-modal');
      modal.classList.remove('hidden');

      this.ensureStudio3DStage();
      await this.studioScene.loadProduct(product, this.activeStudioVariant);

      document.getElementById('studio-product-title').textContent =
        `${product.brand} — ${product.name}`;
      document.getElementById('studio-description').textContent =
        product.description;
      document.getElementById('studio-explode-slider').value = '0';

      this.updateStudioModalUI();
    } catch {
      this.showToast('Could not load product studio details', 'error');
    }
  }

  updateStudioModalUI() {
    const product = this.activeStudioProduct;
    if (!product) return;

    const base = Number(product.salePrice || product.basePrice || 0);
    const mod = Number(this.activeStudioVariant?.priceModifier || 0);
    document.getElementById('studio-price').textContent =
      `$${(base + mod).toFixed(2)}`;

    const specsGrid = document.getElementById('studio-specs-grid');
    const specs = product.technicalSpecs || {};
    specsGrid.innerHTML = Object.entries(specs)
      .map(
        ([k, v]) => `
        <div class="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800">
          <div class="text-[10px] uppercase tracking-wider text-slate-400 font-bold">${k}</div>
          <div class="text-xs text-white font-semibold mt-0.5">${v}</div>
        </div>
      `,
      )
      .join('');

    const varList = document.getElementById('studio-variant-list');
    const variants = product.variants || [];
    varList.innerHTML = variants
      .map((v, i) => {
        const active =
          this.activeStudioVariant?.variantName === v.variantName;
        return `
          <button
            type="button"
            data-st-var="${i}"
            class="flex items-center gap-2 p-2 rounded-xl border text-left text-xs font-semibold transition ${
              active
                ? 'border-cyan-400 bg-cyan-500/15 text-white'
                : 'border-slate-800 bg-slate-900 text-slate-300'
            }"
          >
            <span class="w-4 h-4 rounded-full shrink-0" style="background: linear-gradient(135deg, ${v.primaryHex} 50%, ${v.accentHex} 100%)"></span>
            <span class="truncate">${v.variantName}</span>
          </button>
        `;
      })
      .join('');

    varList.querySelectorAll('[data-st-var]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const idx = Number(btn.getAttribute('data-st-var'));
        this.activeStudioVariant = { ...variants[idx] };
        this.studioScene?.applyMaterialCustomization(this.activeStudioVariant);
        this.updateStudioModalUI();
      });
    });

    const revList = document.getElementById('studio-reviews-list');
    const reviews = product.reviews || [];
    revList.innerHTML =
      reviews.length === 0
        ? `<p class="text-xs text-slate-500">No reviews yet. Be the first to review this 3D product!</p>`
        : reviews
            .map(
              (r) => `
          <div class="p-3 rounded-xl bg-slate-900/90 border border-slate-800 space-y-1">
            <div class="flex items-center justify-between text-xs">
              <span class="font-bold text-white">${r.reviewerName}</span>
              <span class="text-amber-400">${'★'.repeat(r.rating)}</span>
            </div>
            <p class="text-xs text-slate-300">${r.comment}</p>
          </div>
        `,
            )
            .join('');
  }

  addToCart(product, variant) {
    if (!product) return;
    const base = Number(product.salePrice || product.basePrice || 0);
    const mod = Number(variant?.priceModifier || 0);
    const unitPrice = Number((base + mod).toFixed(2));

    const existingIdx = this.cart.findIndex(
      (item) =>
        item.productId === product.id &&
        item.variantName === (variant?.variantName || 'Custom 3D') &&
        item.finishType === (variant?.finishType || 'MATTE') &&
        item.primaryHex === (variant?.primaryHex || '#18181b'),
    );

    if (existingIdx > -1) {
      this.cart[existingIdx].quantity += 1;
    } else {
      this.cart.push({
        productId: product.id,
        productName: product.name,
        variantName: variant?.variantName || 'Custom 3D Edition',
        finishType: variant?.finishType || 'MATTE',
        primaryHex: variant?.primaryHex || '#18181b',
        accentHex: variant?.accentHex || '#38bdf8',
        quantity: 1,
        unitPrice,
      });
    }

    this.saveCart();
    this.renderCart();
    this.showToast(
      `Added ${product.name} (${variant?.finishType || 'MATTE'}) to Cart!`,
      'success',
    );
  }

  saveCart() {
    localStorage.setItem('aether_3d_cart', JSON.stringify(this.cart));
  }

  renderCart() {
    const count = this.cart.reduce((sum, i) => sum + i.quantity, 0);
    const subtotal = this.cart.reduce(
      (sum, i) => sum + i.quantity * i.unitPrice,
      0,
    );
    const shipping = subtotal === 0 || subtotal >= 250 ? 0 : 15;
    const tax = subtotal * 0.08;
    const total = subtotal + shipping + tax;

    document.getElementById('cart-count-badge').textContent = String(count);
    document.getElementById('cart-total-badge').textContent =
      `$${subtotal.toFixed(2)}`;

    document.getElementById('cart-subtotal').textContent =
      `$${subtotal.toFixed(2)}`;
    document.getElementById('cart-tax').textContent = `$${tax.toFixed(2)}`;
    document.getElementById('cart-shipping').textContent =
      shipping === 0 ? 'FREE' : `$${shipping.toFixed(2)}`;
    document.getElementById('cart-total').textContent = `$${total.toFixed(2)}`;

    const container = document.getElementById('cart-items-container');
    if (!container) return;

    if (this.cart.length === 0) {
      container.innerHTML = `
        <div class="text-center py-12 text-xs text-slate-400">
          Your 3D cart is empty. Customize a product in 3D and click "Add to Cart"!
        </div>
      `;
      return;
    }

    container.innerHTML = this.cart
      .map(
        (item, idx) => `
        <div class="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-3">
          <div class="flex items-center gap-3">
            <span
              class="w-8 h-8 rounded-xl border border-white/20 shrink-0"
              style="background: linear-gradient(135deg, ${item.primaryHex} 55%, ${item.accentHex} 100%)"
            ></span>
            <div>
              <h4 class="text-xs font-bold text-white">${item.productName}</h4>
              <p class="text-[11px] text-cyan-300">${item.variantName} • ${item.finishType}</p>
              <span class="text-xs font-extrabold text-white">$${(item.unitPrice * item.quantity).toFixed(2)}</span>
            </div>
          </div>
          <div class="flex items-center gap-1.5">
            <button data-cart-dec="${idx}" class="w-6 h-6 rounded bg-slate-800 text-xs font-bold">−</button>
            <span class="text-xs font-bold px-1">${item.quantity}</span>
            <button data-cart-inc="${idx}" class="w-6 h-6 rounded bg-slate-800 text-xs font-bold">+</button>
          </div>
        </div>
      `,
      )
      .join('');

    container.querySelectorAll('[data-cart-dec]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const idx = Number(btn.getAttribute('data-cart-dec'));
        if (this.cart[idx].quantity > 1) {
          this.cart[idx].quantity -= 1;
        } else {
          this.cart.splice(idx, 1);
        }
        this.saveCart();
        this.renderCart();
      });
    });

    container.querySelectorAll('[data-cart-inc]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const idx = Number(btn.getAttribute('data-cart-inc'));
        this.cart[idx].quantity += 1;
        this.saveCart();
        this.renderCart();
      });
    });
  }

  updateAuthUI() {
    const btn = document.getElementById('auth-trigger-btn');
    if (!btn) return;
    if (this.authUser) {
      btn.textContent = `${this.authUser.fullName.split(' ')[0]} (${this.authUser.role})`;
      document.getElementById('chk-name').value = this.authUser.fullName || '';
      document.getElementById('chk-email').value = this.authUser.email || '';
      document.getElementById('chk-phone').value = this.authUser.phone || '';
    } else {
      btn.textContent = 'Sign In';
    }
  }

  // =========================================================================
  // ADMIN COMMAND CENTER & 3D .GLB STUDIO METHODS
  // =========================================================================

  populateAdminCategories() {
    const sel = document.getElementById('adm-prod-category');
    if (sel) {
      sel.innerHTML = this.categories
        .map((c) => `<option value="${c.id}">${c.name}</option>`)
        .join('');
    }
    this.renderAdminCategoriesList();
  }

  switchAdminTab(tabName) {
    document.querySelectorAll('.admin-tab-btn').forEach((btn) => {
      const isMatch = btn.getAttribute('data-admin-tab') === tabName;
      btn.className = isMatch
        ? 'admin-tab-btn px-3.5 py-2 rounded-xl text-xs font-bold bg-amber-500 text-slate-950 transition shadow-md'
        : 'admin-tab-btn px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-900 border border-slate-700 text-slate-200 hover:border-amber-400 transition';
    });

    document.querySelectorAll('.admin-tab-pane').forEach((pane) => {
      pane.classList.add('hidden');
    });
    const targetPane = document.getElementById(`admin-tab-${tabName}`);
    if (targetPane) targetPane.classList.remove('hidden');

    if (tabName === 'product-studio') {
      this.ensureAdminPreview3DStage();
    }
  }

  resetAdminSpecRows(specsObj = {}) {
    const container = document.getElementById('adm-specs-rows');
    if (!container) return;
    container.innerHTML = '';
    const entries = Object.entries(specsObj);
    if (entries.length === 0) {
      this.addAdminSpecRow('Hardware', 'Aerospace Titanium Unibody');
    } else {
      entries.forEach(([k, v]) => this.addAdminSpecRow(k, v));
    }
  }

  addAdminSpecRow(key = '', val = '') {
    const container = document.getElementById('adm-specs-rows');
    if (!container) return;
    const row = document.createElement('div');
    row.className = 'flex items-center gap-2 adm-spec-row';
    row.innerHTML = `
      <input type="text" placeholder="Spec Name (e.g. Battery)" value="${key}" class="adm-spec-key w-1/3 bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-white" />
      <input type="text" placeholder="Value (e.g. 60 Hours ANC)" value="${val}" class="adm-spec-val flex-1 bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-white" />
      <button type="button" class="adm-remove-spec px-2 py-1 rounded bg-rose-500/20 text-rose-300 text-xs font-bold">✕</button>
    `;
    row.querySelector('.adm-remove-spec').addEventListener('click', () => {
      row.remove();
    });
    container.appendChild(row);
  }

  collectAdminSpecs() {
    const specs = {};
    document.querySelectorAll('#adm-specs-rows .adm-spec-row').forEach((row) => {
      const k = row.querySelector('.adm-spec-key')?.value?.trim();
      const v = row.querySelector('.adm-spec-val')?.value?.trim();
      if (k && v) specs[k] = v;
    });
    return specs;
  }

  resetAdminProductForm() {
    document.getElementById('adm-edit-product-id').value = '';
    document.getElementById('adm-form-heading').textContent =
      'Create New 3D Electronics Product';
    document.getElementById('adm-submit-product-btn').textContent =
      '💾 Save New 3D Product to MySQL Database';
    document.getElementById('admin-create-product-form')?.reset();
    document.getElementById('adm-uploaded-glb-url').value = '';
    document.getElementById('adm-glb-status-badge').textContent =
      'Procedural 3D Active';
    document.getElementById('adm-glb-filename-display').textContent =
      'Uploading a .glb file automatically previews it in the 3D viewport on the right!';
    document.getElementById('adm-scale-val').textContent = '1.0';
    this.resetAdminSpecRows({
      Driver: '45mm Custom Beryllium Planar',
      Battery: '60 Hours Adaptive ANC',
      Connectivity: 'Bluetooth 5.4 + USB-C Lossless',
    });
    this.syncAdminLive3DPreview();
  }

  loadProductIntoAdminEditor(product) {
    this.switchAdminTab('product-studio');
    document.getElementById('adm-edit-product-id').value = String(product.id);
    document.getElementById('adm-form-heading').textContent =
      `Editing Product #${product.id}: ${product.name}`;
    document.getElementById('adm-submit-product-btn').textContent =
      `💾 Update "${product.name}" in MySQL`;

    document.getElementById('adm-prod-name').value = product.name || '';
    document.getElementById('adm-prod-brand').value = product.brand || '';
    document.getElementById('adm-prod-sku').value = product.sku || '';
    document.getElementById('adm-prod-category').value = String(
      product.categoryId || this.categories[0]?.id || 1,
    );
    document.getElementById('adm-prod-price').value = Number(
      product.basePrice || 0,
    );
    document.getElementById('adm-prod-sale-price').value = product.salePrice
      ? Number(product.salePrice)
      : '';
    document.getElementById('adm-prod-stock').value = Number(
      product.stockQuantity || 0,
    );
    document.getElementById('adm-prod-badge').value =
      product.badgeText || 'FLAGSHIP 3D';
    document.getElementById('adm-prod-featured').checked = Boolean(
      product.isFeatured,
    );
    document.getElementById('adm-prod-active').checked =
      product.isActive !== false;
    document.getElementById('adm-prod-tagline').value = product.tagline || '';
    document.getElementById('adm-prod-desc').value = product.description || '';

    const c3d = product.config3d || {};
    document.getElementById('adm-model-type').value =
      c3d.modelType || 'PROCEDURAL_HEADPHONE';
    document.getElementById('adm-env-preset').value =
      c3d.defaultEnvPreset || 'studio';
    document.getElementById('adm-uploaded-glb-url').value =
      c3d.glbFileUrl || '';
    document.getElementById('adm-default-scale').value = String(
      c3d.defaultScale || 1.0,
    );
    document.getElementById('adm-scale-val').textContent = String(
      c3d.defaultScale || 1.0,
    );

    if (c3d.glbFileUrl) {
      document.getElementById('adm-glb-status-badge').textContent =
        'Custom .GLB Linked';
      document.getElementById('adm-glb-filename-display').textContent =
        `Active .GLB: ${c3d.glbFileUrl}`;
    } else {
      document.getElementById('adm-glb-status-badge').textContent =
        c3d.modelType || 'Procedural 3D';
    }

    const v0 = (product.variants && product.variants[0]) || {};
    if (v0.finishType)
      document.getElementById('adm-default-finish').value = v0.finishType;
    if (v0.primaryHex)
      document.getElementById('adm-primary-hex').value = v0.primaryHex;
    if (v0.secondaryHex)
      document.getElementById('adm-secondary-hex').value = v0.secondaryHex;
    if (v0.accentHex)
      document.getElementById('adm-accent-hex').value = v0.accentHex;

    this.resetAdminSpecRows(product.technicalSpecs || {});
    this.syncAdminLive3DPreview();
  }

  async openAdminDashboard() {
    document.getElementById('admin-modal').classList.remove('hidden');
    await this.refreshAdminDashboard();
  }

  async refreshAdminDashboard() {
    try {
      const [statsRes, ordersRes, productsRes] = await Promise.all([
        fetch('/api/admin/stats'),
        fetch('/api/admin/orders'),
        fetch('/api/admin/products'),
      ]);
      const stats = await statsRes.json();
      this.adminOrders = await ordersRes.json();
      this.adminProducts = await productsRes.json();

      // 1. Render 6 KPI Cards
      document.getElementById('admin-kpi-grid').innerHTML = `
        <div class="glass-panel rounded-2xl p-4 border border-slate-800">
          <span class="text-[11px] text-slate-400">Revenue (USD)</span>
          <div class="text-xl font-extrabold text-emerald-400 mt-1">$${Number(stats.totalRevenue || 0).toFixed(2)}</div>
        </div>
        <div class="glass-panel rounded-2xl p-4 border border-slate-800">
          <span class="text-[11px] text-slate-400">Total Orders</span>
          <div class="text-xl font-extrabold text-white mt-1">${stats.totalOrders || 0} <span class="text-xs text-amber-400">(${stats.pendingOrdersCount || 0} active)</span></div>
        </div>
        <div class="glass-panel rounded-2xl p-4 border border-slate-800">
          <span class="text-[11px] text-slate-400">3D Products</span>
          <div class="text-xl font-extrabold text-cyan-400 mt-1">${stats.totalProducts || 0}</div>
        </div>
        <div class="glass-panel rounded-2xl p-4 border border-slate-800">
          <span class="text-[11px] text-slate-400">★ Featured Hero</span>
          <div class="text-xl font-extrabold text-amber-400 mt-1">${stats.featuredCount || 0}</div>
        </div>
        <div class="glass-panel rounded-2xl p-4 border border-slate-800">
          <span class="text-[11px] text-slate-400">Custom .GLB Files</span>
          <div class="text-xl font-extrabold text-indigo-400 mt-1">${stats.customGlbCount || 0}</div>
        </div>
        <div class="glass-panel rounded-2xl p-4 border border-slate-800">
          <span class="text-[11px] text-slate-400">Store Users</span>
          <div class="text-xl font-extrabold text-purple-400 mt-1">${stats.totalUsers || 0}</div>
        </div>
      `;

      // 2. Render Low-Stock & Quick Restock
      const lowStockEl = document.getElementById('admin-low-stock-list');
      const lowItems = stats.lowStockProducts || [];
      lowStockEl.innerHTML =
        lowItems.length === 0
          ? `<div class="text-xs text-emerald-400 py-4">✓ All products are well-stocked (>15 units).</div>`
          : lowItems
              .map(
                (item) => `
              <div class="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between gap-2 text-xs">
                <div>
                  <span class="font-bold text-white">${item.name}</span>
                  <span class="text-slate-400 font-mono ml-1.5">(${item.sku})</span>
                  <span class="ml-2 px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 font-bold">${item.stockQuantity} left</span>
                </div>
                <button data-restock-id="${item.id}" data-current-stock="${item.stockQuantity}" class="px-2.5 py-1 rounded-lg bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 font-bold hover:bg-emerald-500/30">
                  +15 Restock
                </button>
              </div>
            `,
              )
              .join('');

      lowStockEl.querySelectorAll('[data-restock-id]').forEach((btn) => {
        btn.addEventListener('click', async () => {
          const id = Number(btn.getAttribute('data-restock-id'));
          const cur = Number(btn.getAttribute('data-current-stock'));
          await fetch(`/api/admin/products/${id}/quick`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ stockQuantity: cur + 15 }),
          });
          this.showToast(`Restocked +15 units for Product #${id}`, 'success');
          await this.refreshAdminDashboard();
          await this.loadProducts();
        });
      });

      // 3. Render Users List
      const usersEl = document.getElementById('admin-users-list');
      usersEl.innerHTML = (stats.users || [])
        .map(
          (u) => `
          <div class="p-2.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between text-xs">
            <div>
              <span class="font-bold text-white">${u.fullName}</span>
              <span class="text-slate-400 ml-2">${u.email}</span>
            </div>
            <span class="px-2 py-0.5 rounded text-[10px] font-bold ${
              u.role === 'ADMIN'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-400/40'
                : 'bg-cyan-500/15 text-cyan-300'
            }">${u.role}</span>
          </div>
        `,
        )
        .join('');

      this.renderAdminCatalogTable();
      this.renderAdminOrdersList();
      this.renderAdminCategoriesList();

      if (
        !this.adminSelectedSubProduct &&
        this.adminProducts.length > 0
      ) {
        this.selectAdminSubProduct(this.adminProducts[0]);
      } else if (this.adminSelectedSubProduct) {
        const updated = this.adminProducts.find(
          (p) => p.id === this.adminSelectedSubProduct.id,
        );
        if (updated) this.selectAdminSubProduct(updated);
      }
    } catch (err) {
      console.error('Admin refresh error:', err);
    }
  }

  renderAdminCatalogTable() {
    const prodsEl = document.getElementById('admin-products-list');
    if (!prodsEl) return;

    const q = this.adminCatalogSearch.trim().toLowerCase();
    const filtered = this.adminProducts.filter(
      (p) =>
        !q ||
        p.name.toLowerCase().includes(q) ||
        p.brand.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q),
    );

    prodsEl.innerHTML = filtered
      .map((p) => {
        const isGlb = p.config3d?.modelType === 'GLB_FILE';
        return `
          <div class="p-3.5 rounded-2xl bg-slate-900 border ${
            this.adminSelectedSubProduct?.id === p.id
              ? 'border-cyan-400'
              : 'border-slate-800'
          } space-y-2.5 text-xs">
            <div class="flex flex-wrap items-center justify-between gap-2">
              <div class="flex items-center gap-2">
                <button
                  data-toggle-featured="${p.id}"
                  title="Toggle Featured on Hero 3D Stage"
                  class="px-2 py-1 rounded-lg border font-bold text-[11px] transition ${
                    p.isFeatured
                      ? 'bg-amber-500/20 border-amber-400 text-amber-300'
                      : 'bg-slate-950 border-slate-700 text-slate-500 hover:text-white'
                  }"
                >
                  ${p.isFeatured ? '★ Featured' : '☆ Standard'}
                </button>
                <div>
                  <span class="font-extrabold text-white text-sm">${p.name}</span>
                  <span class="text-slate-400 ml-1.5 font-mono text-[11px]">(${p.sku})</span>
                </div>
              </div>
              <div class="flex items-center gap-1.5">
                <span class="px-2 py-0.5 rounded font-bold text-[10px] ${
                  isGlb
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/40'
                    : 'bg-cyan-500/15 text-cyan-300'
                }">
                  ${isGlb ? '📦 CUSTOM .GLB' : p.config3d?.modelType || '3D'}
                </span>
                <span class="font-extrabold text-white">$${Number(p.salePrice || p.basePrice).toFixed(2)}</span>
              </div>
            </div>

            <div class="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-800/80">
              <div class="flex items-center gap-2 text-[11px] text-slate-400">
                <span>Stock: <strong class="text-white">${p.stockQuantity}</strong></span>
                <span>•</span>
                <span>Variants: <strong class="text-white">${(p.variants || []).length}</strong></span>
                <span>•</span>
                <span>Hotspots: <strong class="text-white">${(p.hotspots || []).length}</strong></span>
              </div>

              <div class="flex flex-wrap items-center gap-1.5">
                <label class="px-2.5 py-1 rounded-lg bg-indigo-500/20 border border-indigo-400/40 text-indigo-300 font-bold cursor-pointer hover:bg-indigo-500/30">
                  <span>📁 Upload .GLB</span>
                  <input type="file" accept=".glb,.gltf" data-upload-glb="${p.id}" class="hidden" />
                </label>
                <button data-manage-sub="${p.id}" class="px-2.5 py-1 rounded-lg bg-cyan-500/20 border border-cyan-400/40 text-cyan-300 font-bold hover:bg-cyan-500/30">
                  Variants &amp; Pins
                </button>
                <button data-edit-prod="${p.id}" class="px-2.5 py-1 rounded-lg bg-slate-800 border border-slate-700 text-slate-200 font-bold hover:bg-slate-700">
                  Edit
                </button>
                <button data-del-prod="${p.id}" class="px-2 py-1 rounded-lg bg-rose-500/15 border border-rose-500/30 text-rose-300 font-bold hover:bg-rose-500/25">
                  Delete
                </button>
              </div>
            </div>
          </div>
        `;
      })
      .join('');

    // Featured toggle
    prodsEl.querySelectorAll('[data-toggle-featured]').forEach((btn) => {
      btn.addEventListener('click', async () => {
        const id = Number(btn.getAttribute('data-toggle-featured'));
        const prod = this.adminProducts.find((p) => p.id === id);
        if (!prod) return;
        await fetch(`/api/admin/products/${id}/quick`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ isFeatured: !prod.isFeatured }),
        });
        this.showToast(
          `${prod.name} is now ${!prod.isFeatured ? '★ Featured on Hero Stage' : 'Standard'}`,
          'success',
        );
        await this.refreshAdminDashboard();
        await this.loadProducts(true);
      });
    });

    // Quick .GLB upload per product
    prodsEl.querySelectorAll('[data-upload-glb]').forEach((input) => {
      input.addEventListener('change', async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const prodId = Number(input.getAttribute('data-upload-glb'));
        const formData = new FormData();
        formData.append('file', file);
        this.showToast(`Uploading ${file.name} for Product #${prodId}...`);
        const res = await fetch(`/api/admin/products/${prodId}/upload-glb`, {
          method: 'POST',
          body: formData,
        });
        if (res.ok) {
          this.showToast(
            `Attached custom 3D model ${file.name}!`,
            'success',
          );
          await this.loadProducts(true);
          await this.refreshAdminDashboard();
        } else {
          this.showToast('Failed to upload .glb file', 'error');
        }
      });
    });

    // Manage Variants & Hotspots
    prodsEl.querySelectorAll('[data-manage-sub]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const id = Number(btn.getAttribute('data-manage-sub'));
        const prod = this.adminProducts.find((p) => p.id === id);
        if (prod) {
          this.selectAdminSubProduct(prod);
          this.renderAdminCatalogTable();
        }
      });
    });

    // Edit Product in Studio Form
    prodsEl.querySelectorAll('[data-edit-prod]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const id = Number(btn.getAttribute('data-edit-prod'));
        const prod = this.adminProducts.find((p) => p.id === id);
        if (prod) this.loadProductIntoAdminEditor(prod);
      });
    });

    // Delete Product
    prodsEl.querySelectorAll('[data-del-prod]').forEach((btn) => {
      btn.addEventListener('click', async () => {
        const id = Number(btn.getAttribute('data-del-prod'));
        const prod = this.adminProducts.find((p) => p.id === id);
        if (!prod) return;
        const res = await fetch(`/api/admin/products/${id}`, {
          method: 'DELETE',
        });
        if (res.ok) {
          this.showToast(`Deleted "${prod.name}"`, 'info');
          await this.refreshAdminDashboard();
          await this.loadProducts(true);
        }
      });
    });
  }

  selectAdminSubProduct(product) {
    this.adminSelectedSubProduct = product;
    const titleEl = document.getElementById('adm-submanager-title');
    if (titleEl) {
      titleEl.textContent = `Managing: ${product.name} (#${product.id})`;
    }

    // Variants list
    const varEl = document.getElementById('adm-variants-list');
    if (varEl) {
      const variants = product.variants || [];
      varEl.innerHTML = variants
        .map(
          (v) => `
          <div class="p-2 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between text-xs">
            <div class="flex items-center gap-2">
              <span class="w-4 h-4 rounded-full border border-white/30" style="background: linear-gradient(135deg, ${v.primaryHex} 50%, ${v.accentHex} 100%)"></span>
              <span class="font-bold text-white">${v.variantName}</span>
              <span class="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-cyan-300">${v.finishType}</span>
              ${Number(v.priceModifier) > 0 ? `<span class="text-emerald-400">+$${Number(v.priceModifier)}</span>` : ''}
            </div>
            <button data-del-var="${v.id}" class="text-rose-400 hover:text-rose-300 font-bold px-1.5">✕</button>
          </div>
        `,
        )
        .join('');

      varEl.querySelectorAll('[data-del-var]').forEach((btn) => {
        btn.addEventListener('click', async () => {
          const varId = Number(btn.getAttribute('data-del-var'));
          await fetch(`/api/admin/variants/${varId}`, { method: 'DELETE' });
          this.showToast('Removed variant', 'info');
          await this.refreshAdminDashboard();
          await this.loadProducts(true);
        });
      });
    }

    // Hotspots list
    const hsEl = document.getElementById('adm-hotspots-list');
    if (hsEl) {
      const hotspots = product.hotspots || [];
      hsEl.innerHTML =
        hotspots.length === 0
          ? `<div class="text-xs text-slate-500">No 3D hotspots pinned yet.</div>`
          : hotspots
              .map(
                (h) => `
              <div class="p-2 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between text-xs">
                <div>
                  <span class="font-bold text-cyan-300">📍 ${h.title}</span>
                  <span class="text-[10px] text-slate-400 font-mono ml-1">(${h.posX}, ${h.posY}, ${h.posZ})</span>
                </div>
                <button data-del-hs="${h.id}" class="text-rose-400 hover:text-rose-300 font-bold px-1.5">✕</button>
              </div>
            `,
              )
              .join('');

      hsEl.querySelectorAll('[data-del-hs]').forEach((btn) => {
        btn.addEventListener('click', async () => {
          const hsId = Number(btn.getAttribute('data-del-hs'));
          await fetch(`/api/admin/hotspots/${hsId}`, { method: 'DELETE' });
          this.showToast('Removed 3D hotspot pin', 'info');
          await this.refreshAdminDashboard();
          await this.loadProducts(true);
        });
      });
    }
  }

  renderAdminOrdersList() {
    const ordersEl = document.getElementById('admin-orders-list');
    if (!ordersEl) return;

    const filtered = this.adminOrders.filter(
      (o) =>
        this.adminOrderFilter === 'ALL' ||
        o.orderStatus === this.adminOrderFilter,
    );

    ordersEl.innerHTML =
      filtered.length === 0
        ? `<div class="text-xs text-slate-500 py-6 text-center">No orders match this status filter.</div>`
        : filtered
            .map(
              (o) => `
              <div class="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2 text-xs">
                <div class="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <span class="font-mono font-extrabold text-cyan-300 text-sm">${o.orderNumber}</span>
                    <span class="text-white font-bold ml-2">${o.customerName}</span>
                    <span class="text-slate-400 ml-1">(${o.customerEmail} • ${o.customerPhone})</span>
                  </div>
                  <div class="flex items-center gap-2">
                    <span class="text-emerald-400 font-extrabold text-sm">$${Number(o.totalAmount).toFixed(2)} USD</span>
                    <select data-payment-status="${o.id}" class="bg-slate-950 border border-slate-700 rounded-lg px-2 py-1 text-[11px] text-white">
                      ${['PENDING', 'PAID', 'FAILED', 'REFUNDED']
                        .map(
                          (ps) =>
                            `<option value="${ps}" ${o.paymentStatus === ps ? 'selected' : ''}>Pay: ${ps}</option>`,
                        )
                        .join('')}
                    </select>
                    <select data-order-status="${o.id}" class="bg-slate-950 border border-cyan-500/40 rounded-lg px-2.5 py-1 text-[11px] font-bold text-cyan-300">
                      ${[
                        'PENDING',
                        'PROCESSING',
                        'SHIPPED',
                        'DELIVERED',
                        'CANCELLED',
                      ]
                        .map(
                          (st) =>
                            `<option value="${st}" ${o.orderStatus === st ? 'selected' : ''}>${st}</option>`,
                        )
                        .join('')}
                    </select>
                  </div>
                </div>
                <div class="flex flex-wrap gap-2 pt-1 border-t border-slate-800/80">
                  ${(o.items || [])
                    .map(
                      (i) => `
                    <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-[11px]">
                      <span class="w-3 h-3 rounded-full" style="background:${i.primaryHex || '#38bdf8'}"></span>
                      <span>${i.quantity}x ${i.productName} (${i.finishType})</span>
                    </span>
                  `,
                    )
                    .join('')}
                </div>
              </div>
            `,
            )
            .join('');

    ordersEl.querySelectorAll('[data-order-status]').forEach((sel) => {
      sel.addEventListener('change', async () => {
        const orderId = Number(sel.getAttribute('data-order-status'));
        await fetch(`/api/admin/orders/${orderId}/status`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ orderStatus: sel.value }),
        });
        this.showToast(`Updated Order #${orderId} status to ${sel.value}`, 'success');
        await this.refreshAdminDashboard();
      });
    });

    ordersEl.querySelectorAll('[data-payment-status]').forEach((sel) => {
      sel.addEventListener('change', async () => {
        const orderId = Number(sel.getAttribute('data-payment-status'));
        await fetch(`/api/admin/orders/${orderId}/status`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ paymentStatus: sel.value }),
        });
        this.showToast(`Updated Payment #${orderId} to ${sel.value}`, 'success');
        await this.refreshAdminDashboard();
      });
    });
  }

  renderAdminCategoriesList() {
    const el = document.getElementById('adm-categories-list');
    if (!el) return;
    el.innerHTML = this.categories
      .map(
        (c) => `
        <div class="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between text-xs">
          <div>
            <span class="font-bold text-white">${c.name}</span>
            <span class="text-slate-400 font-mono ml-2">/${c.slug}</span>
            <p class="text-[11px] text-slate-400 mt-0.5">${c.description || ''}</p>
          </div>
          <button data-del-cat="${c.id}" class="px-2.5 py-1 rounded-lg bg-rose-500/15 text-rose-300 font-bold hover:bg-rose-500/25">
            Delete
          </button>
        </div>
      `,
      )
      .join('');

    el.querySelectorAll('[data-del-cat]').forEach((btn) => {
      btn.addEventListener('click', async () => {
        const id = Number(btn.getAttribute('data-del-cat'));
        await fetch(`/api/admin/categories/${id}`, { method: 'DELETE' });
        this.showToast('Deleted category', 'info');
        await this.loadCategories();
      });
    });
  }

  bindUIEvents() {
    // Hero Surface Finish Buttons
    document
      .querySelectorAll('#hero-finish-buttons .finish-btn')
      .forEach((btn) => {
        btn.addEventListener('click', () => {
          const finishType = btn.getAttribute('data-finish');
          this.activeHeroVariant = {
            ...this.activeHeroVariant,
            finishType,
          };
          this.syncHeroCustomizerInputs();
          this.heroScene?.applyMaterialCustomization({ finishType });
        });
      });

    // Hero Custom Color Pickers
    const bindColorInput = (id, key) => {
      const el = document.getElementById(id);
      if (!el) return;
      el.addEventListener('input', (e) => {
        const val = e.target.value;
        this.activeHeroVariant = {
          ...this.activeHeroVariant,
          variantName: 'Custom Bespoke 3D',
          [key]: val,
        };
        document.getElementById('hero-selected-variant-name').textContent =
          'Custom Bespoke 3D';
        this.heroScene?.applyMaterialCustomization({ [key]: val });
      });
    };
    bindColorInput('hero-primary-color', 'primaryHex');
    bindColorInput('hero-secondary-color', 'secondaryHex');
    bindColorInput('hero-accent-color', 'accentHex');

    // Hero Studio Environment Lighting Presets
    document.querySelectorAll('.env-preset-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const env = btn.getAttribute('data-env');
        this.heroScene?.setLightingPreset(env);
        document.querySelectorAll('.env-preset-btn').forEach((b) => {
          b.className =
            b === btn
              ? 'env-preset-btn px-2 py-0.5 rounded text-[11px] font-semibold bg-cyan-500/20 text-cyan-300'
              : 'env-preset-btn px-2 py-0.5 rounded text-[11px] font-semibold text-slate-400 hover:text-white';
        });
      });
    });

    // Hero 3D Stage Camera Controls
    document
      .getElementById('stage-zoom-in')
      ?.addEventListener('click', () => this.heroScene?.zoomDelta(-0.45));
    document
      .getElementById('stage-zoom-out')
      ?.addEventListener('click', () => this.heroScene?.zoomDelta(0.45));
    document
      .getElementById('stage-reset-cam')
      ?.addEventListener('click', () => this.heroScene?.resetCamera());
    document
      .getElementById('stage-toggle-rotate')
      ?.addEventListener('click', (e) => {
        if (!this.heroScene) return;
        this.heroScene.controls.autoRotate =
          !this.heroScene.controls.autoRotate;
        e.currentTarget.classList.toggle(
          'bg-cyan-500/20',
          this.heroScene.controls.autoRotate,
        );
      });
    document
      .getElementById('stage-toggle-hotspots')
      ?.addEventListener('click', () => {
        this.heroScene?.toggleHotspots();
      });
    document
      .getElementById('close-hotspot-card')
      ?.addEventListener('click', () => {
        document.getElementById('hero-hotspot-card')?.classList.add('hidden');
      });

    // Hero Exploded View Slider
    document
      .getElementById('hero-explode-slider')
      ?.addEventListener('input', (e) => {
        const val = Number(e.target.value);
        document.getElementById('explode-percent-label').textContent =
          `${val}%`;
        this.heroScene?.setExplodeFactor(val / 100);
      });

    // Hero Add to Cart & Open Studio
    document
      .getElementById('hero-add-to-cart-btn')
      ?.addEventListener('click', () => {
        this.addToCart(this.activeHeroProduct, this.activeHeroVariant);
      });
    document
      .getElementById('hero-open-studio-btn')
      ?.addEventListener('click', () => {
        if (this.activeHeroProduct) {
          this.openProductStudioModal(this.activeHeroProduct.id);
        }
      });
    document
      .getElementById('nav-open-studio-btn')
      ?.addEventListener('click', () => {
        if (this.activeHeroProduct) {
          this.openProductStudioModal(this.activeHeroProduct.id);
        }
      });

    // Studio Modal Controls
    document
      .getElementById('close-studio-modal')
      ?.addEventListener('click', () => {
        document.getElementById('studio-modal').classList.add('hidden');
      });
    document
      .getElementById('studio-explode-slider')
      ?.addEventListener('input', (e) => {
        const val = Number(e.target.value);
        this.studioScene?.setExplodeFactor(val / 100);
      });
    document.querySelectorAll('.studio-finish-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const finishType = btn.getAttribute('data-finish');
        this.activeStudioVariant = {
          ...this.activeStudioVariant,
          finishType,
        };
        this.studioScene?.applyMaterialCustomization({ finishType });
      });
    });
    document
      .getElementById('studio-add-cart-btn')
      ?.addEventListener('click', () => {
        this.addToCart(this.activeStudioProduct, this.activeStudioVariant);
      });

    // Submit Review inside Studio Modal
    document
      .getElementById('studio-review-form')
      ?.addEventListener('submit', async (e) => {
        e.preventDefault();
        if (!this.activeStudioProduct) return;
        const reviewerName = document.getElementById('review-name-input').value;
        const rating = Number(
          document.getElementById('review-rating-input').value,
        );
        const comment = document.getElementById('review-comment-input').value;

        const res = await fetch(
          `/api/products/${this.activeStudioProduct.id}/reviews`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ reviewerName, rating, comment }),
          },
        );
        if (res.ok) {
          this.showToast('Thank you! Your review was published.', 'success');
          document.getElementById('review-comment-input').value = '';
          await this.openProductStudioModal(this.activeStudioProduct.id);
        }
      });

    // Global Search & Catalog Sort
    let searchTimeout;
    document
      .getElementById('global-search-input')
      ?.addEventListener('input', (e) => {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
          this.searchQuery = e.target.value;
          this.loadProducts();
        }, 250);
      });

    document
      .getElementById('catalog-sort-select')
      ?.addEventListener('change', (e) => {
        this.sortBy = e.target.value;
        this.loadProducts();
      });

    // Cart Drawer & Checkout
    document
      .getElementById('cart-trigger-btn')
      ?.addEventListener('click', () => {
        document
          .getElementById('cart-drawer-backdrop')
          .classList.remove('hidden');
      });
    document.getElementById('close-cart-btn')?.addEventListener('click', () => {
      document.getElementById('cart-drawer-backdrop').classList.add('hidden');
    });

    document
      .getElementById('checkout-form')
      ?.addEventListener('submit', async (e) => {
        e.preventDefault();
        if (this.cart.length === 0) {
          this.showToast('Your cart is empty!', 'error');
          return;
        }

        const paymentMethod =
          document.querySelector('input[name="paymentMethod"]:checked')
            ?.value || 'STRIPE_CARD';

        const payload = {
          userId: this.authUser?.id || null,
          customerName: document.getElementById('chk-name').value,
          customerEmail: document.getElementById('chk-email').value,
          customerPhone: document.getElementById('chk-phone').value,
          shippingAddress: {
            street: document.getElementById('chk-address').value,
            city: 'Austin',
            state: 'TX',
            zipCode: '78701',
            country: 'United States',
          },
          paymentMethod,
          items: this.cart,
        };

        const res = await fetch('/api/orders', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        if (res.ok) {
          const order = await res.json();
          this.cart = [];
          this.saveCart();
          this.renderCart();
          document
            .getElementById('cart-drawer-backdrop')
            .classList.add('hidden');
          this.showToast(
            `Order Confirmed! Tracking ID: ${order.orderNumber}`,
            'success',
          );
          document.getElementById('track-order-input').value =
            order.orderNumber;
          document
            .getElementById('track-order-modal')
            .classList.remove('hidden');
          this.lookupOrderTracking(order.orderNumber);
        } else {
          this.showToast('Checkout failed. Please check your inputs.', 'error');
        }
      });

    // Order Tracking Modal
    document
      .getElementById('nav-track-order-btn')
      ?.addEventListener('click', () => {
        document.getElementById('track-order-modal').classList.remove('hidden');
        this.lookupOrderTracking(
          document.getElementById('track-order-input').value,
        );
      });
    document
      .getElementById('close-track-modal')
      ?.addEventListener('click', () => {
        document.getElementById('track-order-modal').classList.add('hidden');
      });
    document
      .getElementById('track-order-submit')
      ?.addEventListener('click', () => {
        this.lookupOrderTracking(
          document.getElementById('track-order-input').value,
        );
      });

    // Auth Modal
    document
      .getElementById('auth-trigger-btn')
      ?.addEventListener('click', () => {
        document.getElementById('auth-modal').classList.remove('hidden');
      });
    document
      .getElementById('close-auth-modal')
      ?.addEventListener('click', () => {
        document.getElementById('auth-modal').classList.add('hidden');
      });
    document
      .getElementById('toggle-auth-mode')
      ?.addEventListener('click', () => {
        this.isRegisterMode = !this.isRegisterMode;
        document.getElementById('auth-fullname').classList.toggle(
          'hidden',
          !this.isRegisterMode,
        );
        document.getElementById('auth-modal-title').textContent = this
          .isRegisterMode
          ? 'Create Aether 3D Account'
          : 'Sign In to Aether 3D';
      });
    document
      .getElementById('auth-form')
      ?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const endpoint = this.isRegisterMode
          ? '/api/auth/register'
          : '/api/auth/login';
        const body = {
          fullName: document.getElementById('auth-fullname').value,
          email: document.getElementById('auth-email').value,
          password: document.getElementById('auth-password').value,
        };
        const res = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });
        if (res.ok) {
          const data = await res.json();
          this.authUser = data.user;
          this.authToken = data.token;
          localStorage.setItem('aether_3d_user', JSON.stringify(data.user));
          localStorage.setItem('aether_3d_token', data.token);
          this.updateAuthUI();
          document.getElementById('auth-modal').classList.add('hidden');
          this.showToast(`Welcome back, ${data.user.fullName}!`, 'success');
        } else {
          this.showToast('Invalid credentials', 'error');
        }
      });

    // =======================================================================
    // ADMIN STUDIO EVENT BINDINGS
    // =======================================================================
    document.getElementById('nav-admin-btn')?.addEventListener('click', () => {
      this.openAdminDashboard();
    });
    document
      .getElementById('close-admin-modal')
      ?.addEventListener('click', () => {
        document.getElementById('admin-modal').classList.add('hidden');
      });

    document.querySelectorAll('.admin-tab-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const tab = btn.getAttribute('data-admin-tab');
        if (tab) this.switchAdminTab(tab);
      });
    });

    document
      .getElementById('adm-add-spec-row')
      ?.addEventListener('click', () => {
        this.addAdminSpecRow('', '');
      });

    document
      .getElementById('adm-reset-form-btn')
      ?.addEventListener('click', () => {
        this.resetAdminProductForm();
      });

    // Live 3D Admin Preview triggers
    [
      'adm-model-type',
      'adm-env-preset',
      'adm-default-finish',
      'adm-primary-hex',
      'adm-secondary-hex',
      'adm-accent-hex',
    ].forEach((id) => {
      document.getElementById(id)?.addEventListener('input', () => {
        this.syncAdminLive3DPreview();
      });
    });

    document
      .getElementById('adm-default-scale')
      ?.addEventListener('input', (e) => {
        document.getElementById('adm-scale-val').textContent = e.target.value;
        this.syncAdminLive3DPreview();
      });

    document
      .getElementById('adm-preview-explode-btn')
      ?.addEventListener('click', () => {
        this.adminPreviewExploded = !this.adminPreviewExploded;
        this.adminPreviewScene?.setExplodeFactor(
          this.adminPreviewExploded ? 0.85 : 0,
        );
      });

    // Standalone .GLB upload in Product Studio Form with Immediate 3D Preview
    document
      .getElementById('adm-glb-file')
      ?.addEventListener('change', async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        document.getElementById('adm-glb-filename-display').textContent =
          `Uploading ${file.name} (${(file.size / 1024 / 1024).toFixed(2)} MB)...`;

        const fd = new FormData();
        fd.append('file', file);
        const upRes = await fetch('/api/admin/upload-glb', {
          method: 'POST',
          body: fd,
        });

        if (upRes.ok) {
          const upData = await upRes.json();
          document.getElementById('adm-uploaded-glb-url').value =
            upData.glbFileUrl;
          document.getElementById('adm-model-type').value = 'GLB_FILE';
          document.getElementById('adm-glb-status-badge').textContent =
            'Custom .GLB Uploaded';
          document.getElementById('adm-glb-filename-display').textContent =
            `✓ Uploaded: ${file.name} (${upData.glbFileUrl})`;
          this.showToast(
            `Uploaded ${file.name}! Rendering in Live 3D Preview...`,
            'success',
          );
          this.syncAdminLive3DPreview();
        } else {
          this.showToast('Failed to upload .glb file', 'error');
        }
      });

    // Create or Update 3D Product Form Submit
    document
      .getElementById('admin-create-product-form')
      ?.addEventListener('submit', async (e) => {
        e.preventDefault();

        const editId = document.getElementById('adm-edit-product-id').value;
        const uploadedGlbUrl =
          document.getElementById('adm-uploaded-glb-url').value || null;
        const selectedModelType =
          document.getElementById('adm-model-type').value;
        const modelType = uploadedGlbUrl ? 'GLB_FILE' : selectedModelType;

        const saleVal = document.getElementById('adm-prod-sale-price').value;

        const payload = {
          name: document.getElementById('adm-prod-name').value,
          brand: document.getElementById('adm-prod-brand').value,
          sku: document.getElementById('adm-prod-sku').value || undefined,
          categoryId: Number(
            document.getElementById('adm-prod-category').value,
          ),
          basePrice: Number(document.getElementById('adm-prod-price').value),
          salePrice: saleVal !== '' ? Number(saleVal) : null,
          stockQuantity: Number(
            document.getElementById('adm-prod-stock').value,
          ),
          badgeText:
            document.getElementById('adm-prod-badge').value || 'FLAGSHIP 3D',
          isFeatured: document.getElementById('adm-prod-featured').checked,
          isActive: document.getElementById('adm-prod-active').checked,
          tagline: document.getElementById('adm-prod-tagline').value,
          description: document.getElementById('adm-prod-desc').value,
          technicalSpecs: this.collectAdminSpecs(),
          finishType: document.getElementById('adm-default-finish').value,
          primaryHex: document.getElementById('adm-primary-hex').value,
          secondaryHex: document.getElementById('adm-secondary-hex').value,
          accentHex: document.getElementById('adm-accent-hex').value,
          config3d: {
            modelType,
            glbFileUrl: uploadedGlbUrl,
            defaultScale: Number(
              document.getElementById('adm-default-scale').value || 1.0,
            ),
            defaultEnvPreset: document.getElementById('adm-env-preset').value,
          },
        };

        const url = editId
          ? `/api/admin/products/${editId}`
          : '/api/admin/products';
        const method = editId ? 'PUT' : 'POST';

        const res = await fetch(url, {
          method,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        if (res.ok) {
          this.showToast(
            editId
              ? 'Updated 3D product in MySQL!'
              : 'Created new 3D product in MySQL!',
            'success',
          );
          this.resetAdminProductForm();
          await this.loadProducts(true);
          await this.refreshAdminDashboard();
          this.switchAdminTab('catalog-manager');
        } else {
          this.showToast('Failed to save product', 'error');
        }
      });

    // Admin Catalog Search
    document
      .getElementById('adm-catalog-search')
      ?.addEventListener('input', (e) => {
        this.adminCatalogSearch = e.target.value;
        this.renderAdminCatalogTable();
      });

    // Add Variant Form
    document
      .getElementById('adm-add-variant-form')
      ?.addEventListener('submit', async (e) => {
        e.preventDefault();
        if (!this.adminSelectedSubProduct) return;
        const body = {
          variantName: document.getElementById('adm-var-name').value,
          finishType: document.getElementById('adm-var-finish').value,
          primaryHex: document.getElementById('adm-var-pri').value,
          secondaryHex: document.getElementById('adm-var-sec').value,
          accentHex: document.getElementById('adm-var-acc').value,
          priceModifier: Number(
            document.getElementById('adm-var-price-mod').value || 0,
          ),
        };
        const res = await fetch(
          `/api/admin/products/${this.adminSelectedSubProduct.id}/variants`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
          },
        );
        if (res.ok) {
          this.showToast('Added new 3D finish variant!', 'success');
          e.target.reset();
          await this.refreshAdminDashboard();
          await this.loadProducts(true);
        }
      });

    // Add Hotspot Form
    document
      .getElementById('adm-add-hotspot-form')
      ?.addEventListener('submit', async (e) => {
        e.preventDefault();
        if (!this.adminSelectedSubProduct) return;
        const body = {
          title: document.getElementById('adm-hs-title').value,
          description: document.getElementById('adm-hs-desc').value,
          posX: Number(document.getElementById('adm-hs-x').value || 0),
          posY: Number(document.getElementById('adm-hs-y').value || 0.35),
          posZ: Number(document.getElementById('adm-hs-z').value || 0.45),
        };
        const res = await fetch(
          `/api/admin/products/${this.adminSelectedSubProduct.id}/hotspots`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
          },
        );
        if (res.ok) {
          this.showToast('Pinned new 3D hotspot!', 'success');
          e.target.reset();
          await this.refreshAdminDashboard();
          await this.loadProducts(true);
        }
      });

    // Admin Orders Status Filter
    document
      .getElementById('adm-order-filter')
      ?.addEventListener('change', (e) => {
        this.adminOrderFilter = e.target.value;
        this.renderAdminOrdersList();
      });

    // Create Category Form
    document
      .getElementById('adm-create-category-form')
      ?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const name = document.getElementById('adm-cat-name').value;
        const description = document.getElementById('adm-cat-desc').value;
        const res = await fetch('/api/admin/categories', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, description }),
        });
        if (res.ok) {
          this.showToast(`Created category "${name}"!`, 'success');
          e.target.reset();
          await this.loadCategories();
          await this.refreshAdminDashboard();
        }
      });
  }

  async lookupOrderTracking(orderNum) {
    const out = document.getElementById('track-order-result');
    if (!orderNum || !out) return;
    out.innerHTML = `<div class="text-slate-400">Searching MySQL for ${orderNum}...</div>`;
    try {
      const res = await fetch(`/api/orders/track/${orderNum.trim()}`);
      if (!res.ok) {
        out.innerHTML = `<div class="text-rose-400">Order "${orderNum}" not found. Try demo ID: ORD-2026-1001</div>`;
        return;
      }
      const order = await res.json();
      out.innerHTML = `
        <div class="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
          <div class="flex items-center justify-between">
            <span class="font-mono font-bold text-cyan-300">${order.orderNumber}</span>
            <span class="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold text-[11px]">${order.orderStatus}</span>
          </div>
          <div class="text-slate-400">Customer: <strong class="text-white">${order.customerName}</strong> • Payment: <strong class="text-white">${order.paymentMethod} (${order.paymentStatus})</strong></div>
          <div class="border-t border-slate-800 pt-2 space-y-1">
            ${(order.items || [])
              .map(
                (i) => `
              <div class="flex justify-between">
                <span>${i.quantity}x ${i.productName} (${i.variantName} / ${i.finishType})</span>
                <span class="font-bold text-white">$${(i.unitPrice * i.quantity).toFixed(2)}</span>
              </div>
            `,
              )
              .join('')}
          </div>
          <div class="border-t border-slate-800 pt-2 flex justify-between text-sm font-extrabold text-white">
            <span>Total Paid (USD)</span>
            <span>$${Number(order.totalAmount).toFixed(2)}</span>
          </div>
        </div>
      `;
    } catch {
      out.innerHTML = `<div class="text-rose-400">Error fetching order tracking details.</div>`;
    }
  }
}

window.addEventListener('DOMContentLoaded', () => {
  window.aetherApp = new Aether3DStoreApp();
});
