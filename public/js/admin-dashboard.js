import { SceneManager } from './three/SceneManager.js';
import { AdminPanels } from './admin-panels.js';

/**
 * EnterpriseAdminDashboard
 * Full-stack 3D E-Commerce & WebGL Asset Pipeline Command Center
 * Mounts inside #admin-dashboard-root (used by both /admin.html and index.html#admin-modal)
 */
export class EnterpriseAdminDashboard {
  constructor(rootEl, options = {}) {
    this.root = rootEl;
    this.onClose = options.onClose || null;
    this.onCatalogChanged = options.onCatalogChanged || null;

    this.activeSection = 'dashboard';
    this.activeRole = 'SUPER_ADMIN';

    this.stats = {};
    this.products = [];
    this.orders = [];
    this.categories = [];

    // Filters & selections
    this.catalogSearch = '';
    this.catalogCategoryFilter = 'ALL';
    this.catalogStatusFilter = 'ALL';
    this.orderStatusFilter = 'ALL';
    this.orderPaymentFilter = 'ALL';
    this.orderSearch = '';
    this.selectedOrderIds = new Set();

    // 3D Studio state
    this.studioScene = null;
    this.studioProduct = null;
    this.studioActiveVariant = null;
    this.editingVariantId = null;
    this.editingHotspotId = null;

    this.renderShell();
    this.bindShellEvents();
  }

  toast(message, type = 'info') {
    if (window.aetherApp && typeof window.aetherApp.showToast === 'function') {
      window.aetherApp.showToast(message, type);
      return;
    }
    const container =
      document.getElementById('toast-container') || document.body;
    const el = document.createElement('div');
    const colors = {
      success: 'border-emerald-400/60 bg-emerald-950/90 text-emerald-200',
      error: 'border-rose-400/60 bg-rose-950/90 text-rose-200',
      info: 'border-cyan-400/60 bg-slate-900/95 text-cyan-200',
    };
    el.className = `px-4 py-2.5 rounded-xl border text-xs font-bold shadow-2xl backdrop-blur-md transition ${colors[type] || colors.info}`;
    el.textContent = message;
    container.appendChild(el);
    setTimeout(() => el.remove(), 3400);
  }

  renderShell() {
    if (!this.root) return;
    this.root.innerHTML = `
      <div class="min-h-screen bg-slate-950 text-slate-100 flex flex-col lg:flex-row">
        <!-- LEFT SIDEBAR NAVIGATION (8 SECTIONS) -->
        <aside class="w-full lg:w-64 bg-slate-900/95 border-b lg:border-b-0 lg:border-r border-slate-800 shrink-0 flex flex-col justify-between p-4 space-y-4">
          <div class="space-y-4">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2.5">
                <div class="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 via-cyan-400 to-indigo-600 flex items-center justify-center text-slate-950 font-black text-sm shadow-lg">
                  3D
                </div>
                <div>
                  <div class="text-sm font-extrabold tracking-tight text-white">AETHER ADMIN</div>
                  <div class="text-[10px] font-mono text-amber-300 uppercase">WebGL &amp; ERP Studio v3.0</div>
                </div>
              </div>
            </div>

            <!-- Active Staff Role Switcher (RBAC) -->
            <div class="p-2.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
              <label class="block text-[10px] uppercase tracking-wider text-slate-400 font-bold">Active RBAC Role</label>
              <select id="adm-rbac-role-select" class="w-full bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-xs font-bold text-amber-300">
                <option value="SUPER_ADMIN">👑 Super Admin (Full)</option>
                <option value="3D_ARTIST">🧊 3D Technical Artist</option>
                <option value="WAREHOUSE_OP">📦 Warehouse Operator</option>
                <option value="SUPPORT_AGENT">🎧 Customer Support</option>
              </select>
            </div>

            <!-- 8 Core Navigation Items -->
            <nav class="space-y-1" id="adm-sidebar-nav">
              ${[
                { id: 'dashboard', icon: '📊', label: 'Dashboard', sub: 'KPIs, 3D Sessions & Alerts' },
                { id: 'catalog', icon: '🎛️', label: 'Catalog & Products', sub: 'SKU List, Add/Edit & Badges' },
                { id: 'studio-3d', icon: '🧊', label: '3D Asset Studio', sub: '.GLB Pipeline, PBR & Nodes' },
                { id: 'orders', icon: '📦', label: 'Orders & Fulfillment', sub: '3D Builds, Dispatch & RMAs' },
                { id: 'inventory', icon: '🏭', label: 'Inventory & Matrix', sub: 'Parts Matrix & Surcharges' },
                { id: 'analytics', icon: '📈', label: 'Analytics & Telemetry', sub: 'Funnel, Heatmaps & FPS' },
                { id: 'customers', icon: '👥', label: 'Customers & CRM', sub: 'Profiles, Builds & Tickets' },
                { id: 'settings', icon: '⚙️', label: 'Settings & Audit', sub: 'CDN Purge, RBAC & Logs' },
              ]
                .map(
                  (item) => `
                <button
                  type="button"
                  data-adm-nav="${item.id}"
                  class="adm-nav-item w-full text-left px-3 py-2.5 rounded-xl transition flex items-center gap-3 ${
                    this.activeSection === item.id
                      ? 'bg-gradient-to-r from-amber-500/25 to-cyan-500/15 border border-amber-400/50 text-white'
                      : 'text-slate-300 hover:bg-slate-800/70 border border-transparent'
                  }"
                >
                  <span class="text-base">${item.icon}</span>
                  <div class="leading-tight">
                    <div class="text-xs font-extrabold">${item.label}</div>
                    <div class="text-[10px] text-slate-400">${item.sub}</div>
                  </div>
                </button>
              `,
                )
                .join('')}
            </nav>
          </div>

          <div class="space-y-2 pt-4 border-t border-slate-800 text-xs">
            <a href="/admin.html" target="_blank" class="block w-full text-center py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 font-bold">
              ↗ Open Dedicated /admin.html
            </a>
            <button id="adm-exit-to-store-btn" class="w-full py-2 rounded-xl bg-rose-500/15 border border-rose-500/40 text-rose-300 font-extrabold hover:bg-rose-500/25">
              ← Return to 3D Storefront
            </button>
          </div>
        </aside>

        <!-- MAIN WORKSPACE AREA -->
        <div class="flex-1 flex flex-col min-w-0">
          <!-- Top Status Header -->
          <header class="bg-slate-900/80 border-b border-slate-800 px-6 py-3.5 flex flex-wrap items-center justify-between gap-3">
            <div>
              <div class="flex items-center gap-2">
                <span class="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                <span class="text-[11px] font-mono text-emerald-400">MySQL 3d_electronics_db • WebGL 2.0 Pipeline Online</span>
              </div>
              <h1 id="adm-header-title" class="text-lg font-extrabold text-white">Executive Sales &amp; 3D Telemetry Overview</h1>
            </div>

            <div class="flex flex-wrap items-center gap-2">
              <button id="adm-quick-add-prod-btn" class="px-3.5 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-extrabold text-xs">
                ➕ New 3D Product
              </button>
              <button id="adm-quick-new-order-btn" class="px-3.5 py-1.5 rounded-xl bg-cyan-500/20 border border-cyan-400/50 text-cyan-300 font-bold text-xs hover:bg-cyan-500/30">
                📦 New Bespoke Order
              </button>
              <button id="adm-refresh-all-btn" class="px-3 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-200 font-bold text-xs hover:border-cyan-400">
                🔄 Sync Now
              </button>
            </div>
          </header>

          <!-- Section Panes -->
          <main class="flex-1 p-5 sm:p-6 overflow-y-auto space-y-6">
            <section id="adm-sec-dashboard" class="adm-sec-pane space-y-6"></section>
            <section id="adm-sec-catalog" class="adm-sec-pane hidden space-y-6"></section>
            <section id="adm-sec-studio-3d" class="adm-sec-pane hidden space-y-6"></section>
            <section id="adm-sec-orders" class="adm-sec-pane hidden space-y-6"></section>
            <section id="adm-sec-inventory" class="adm-sec-pane hidden space-y-6"></section>
            <section id="adm-sec-analytics" class="adm-sec-pane hidden space-y-6"></section>
            <section id="adm-sec-customers" class="adm-sec-pane hidden space-y-6"></section>
            <section id="adm-sec-settings" class="adm-sec-pane hidden space-y-6"></section>
          </main>
        </div>
      </div>

      <!-- MODAL: ADD / EDIT 3D PRODUCT -->
      <div id="adm-product-modal" class="hidden fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
        <div class="glass-panel max-w-4xl w-full rounded-3xl p-6 border border-slate-700 space-y-4 my-8 max-h-[92vh] overflow-y-auto">
          <div class="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 id="adm-modal-prod-title" class="text-lg font-extrabold text-white">Add / Edit 3D Product</h3>
            <button id="adm-close-prod-modal" class="text-slate-400 hover:text-white font-bold">✕ Close</button>
          </div>
          <form id="adm-modal-prod-form" class="space-y-4 text-xs">
            <input type="hidden" id="adm-f-id" value="" />
            <div class="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <div class="sm:col-span-2">
                <label class="block text-[11px] font-bold text-slate-300 mb-1">Product Title *</label>
                <input id="adm-f-name" type="text" required placeholder="e.g. Aether Quantum ANC Headphones" class="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white" />
              </div>
              <div>
                <label class="block text-[11px] font-bold text-slate-300 mb-1">Brand *</label>
                <input id="adm-f-brand" type="text" value="Aether 3D" required class="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white" />
              </div>
              <div>
                <label class="block text-[11px] font-bold text-slate-300 mb-1">SKU</label>
                <input id="adm-f-sku" type="text" placeholder="Auto-generated" class="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono" />
              </div>
            </div>

            <div class="grid grid-cols-2 sm:grid-cols-5 gap-3">
              <div>
                <label class="block text-[11px] font-bold text-slate-300 mb-1">Category *</label>
                <select id="adm-f-category" class="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white"></select>
              </div>
              <div>
                <label class="block text-[11px] font-bold text-slate-300 mb-1">Base Price ($USD) *</label>
                <input id="adm-f-price" type="number" step="0.01" required placeholder="349.00" class="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white" />
              </div>
              <div>
                <label class="block text-[11px] font-bold text-slate-300 mb-1">Sale Price ($USD)</label>
                <input id="adm-f-sale" type="number" step="0.01" placeholder="Optional" class="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white" />
              </div>
              <div>
                <label class="block text-[11px] font-bold text-slate-300 mb-1">Stock Units *</label>
                <input id="adm-f-stock" type="number" value="25" required class="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white" />
              </div>
              <div>
                <label class="block text-[11px] font-bold text-slate-300 mb-1">Status Badge Tag</label>
                <input id="adm-f-badge" type="text" value="FLAGSHIP 3D" list="adm-badge-datalist" class="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white" />
                <datalist id="adm-badge-datalist">
                  <option value="FLAGSHIP 3D"></option>
                  <option value="360° AUDIO"></option>
                  <option value="PRO WORKSTATION"></option>
                  <option value="SPATIAL 3D"></option>
                  <option value="8K FULL FRAME"></option>
                  <option value="BEST SELLER"></option>
                  <option value="AUDIOPHILE PICK"></option>
                </datalist>
              </div>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 items-center p-3 rounded-xl bg-slate-900 border border-slate-800">
              <div>
                <label class="block text-[11px] font-bold text-slate-300 mb-1">Feature Card Action Mode</label>
                <select id="adm-f-cardmode" class="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-cyan-300 font-bold">
                  <option value="3D_STAGE">🧊 Launch on 3D Hero Stage</option>
                  <option value="CUSTOMIZER_STUDIO">🎨 Open Customizer Studio</option>
                  <option value="DIRECT_TO_CART">🛒 Direct to Cart</option>
                </select>
              </div>
              <label class="flex items-center gap-2 cursor-pointer pt-3">
                <input id="adm-f-featured" type="checkbox" checked class="w-4 h-4 accent-amber-400" />
                <span class="font-bold text-amber-300">★ Featured on 3D Hero Stage</span>
              </label>
              <label class="flex items-center gap-2 cursor-pointer pt-3">
                <input id="adm-f-active" type="checkbox" checked class="w-4 h-4 accent-emerald-400" />
                <span class="font-bold text-emerald-300">✓ Published in Storefront</span>
              </label>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3.5 rounded-xl bg-slate-900/90 border border-cyan-500/30">
              <div>
                <label class="block text-[11px] font-bold text-cyan-300 mb-1">3D Model Archetype / Pipeline</label>
                <select id="adm-f-modeltype" class="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-semibold">
                  <option value="PROCEDURAL_HEADPHONE">🎧 3D Over-Ear ANC Headphones</option>
                  <option value="PROCEDURAL_PHONE">📱 3D Flagship 5G Smartphone</option>
                  <option value="PROCEDURAL_WATCH">⌚ 3D Sapphire Smartwatch</option>
                  <option value="PROCEDURAL_EARBUDS">🎵 3D Wireless ANC Earbuds</option>
                  <option value="PROCEDURAL_SPEAKER">🔊 3D 360° Spatial Speaker</option>
                  <option value="PROCEDURAL_LAPTOP">💻 3D Pro Creator Laptop</option>
                  <option value="PROCEDURAL_VR_HEADSET">🥽 3D Spatial VR Headset</option>
                  <option value="PROCEDURAL_CAMERA">📷 3D 8K Mirrorless Camera</option>
                  <option value="PROCEDURAL_CONSOLE">🎮 3D Handheld Gaming Console</option>
                  <option value="GLB_FILE">📦 Custom .GLB / .GLTF / .USDZ Asset</option>
                </select>
              </div>
              <div>
                <label class="block text-[11px] font-bold text-cyan-300 mb-1">Studio Environment Map</label>
                <select id="adm-f-env" class="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white">
                  <option value="studio">Studio Soft HDR</option>
                  <option value="neon">Neon Cyber HDR</option>
                  <option value="dark">Dark Minimal</option>
                  <option value="warm">Warm Sunlight</option>
                </select>
              </div>
              <div>
                <label class="block text-[11px] font-bold text-cyan-300 mb-1">Upload .GLB / .GLTF / .USDZ</label>
                <input id="adm-f-glb-url" type="hidden" value="" />
                <input id="adm-f-glb-file" type="file" accept=".glb,.gltf,.usdz" class="w-full text-[11px] text-slate-300" />
              </div>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input id="adm-f-tagline" type="text" required placeholder="Engineering Tagline (e.g. 45mm Beryllium Drivers + Grade-5 Titanium)" class="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white" />
              <input id="adm-f-desc" type="text" required placeholder="Full Product Description..." class="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white" />
            </div>

            <!-- Technical Specs Editor -->
            <div class="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
              <div class="flex items-center justify-between">
                <span class="font-bold text-slate-300">Hardware Technical Specifications (Frequency, Driver, Battery, Weight, Connectivity)</span>
                <button type="button" id="adm-f-add-spec" class="px-2.5 py-1 rounded bg-cyan-500/20 text-cyan-300 font-bold">+ Add Spec Row</button>
              </div>
              <div id="adm-f-specs-list" class="space-y-2 max-h-36 overflow-y-auto"></div>
            </div>

            <div class="flex justify-end gap-2 pt-2">
              <button type="submit" class="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-cyan-400 text-slate-950 font-extrabold text-xs">
                💾 Save 3D Product to MySQL
              </button>
            </div>
          </form>
        </div>
      </div>

      <!-- MODAL: CREATE / EDIT BESPOKE ORDER -->
      <div id="adm-order-modal" class="hidden fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
        <div class="glass-panel max-w-2xl w-full rounded-3xl p-6 border border-slate-700 space-y-4">
          <div class="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 id="adm-ord-modal-title" class="text-lg font-extrabold text-white">Create / Edit Bespoke 3D Order</h3>
            <button id="adm-close-ord-modal" class="text-slate-400 hover:text-white font-bold">✕</button>
          </div>
          <form id="adm-ord-modal-form" class="space-y-3 text-xs">
            <input type="hidden" id="adm-om-id" value="" />
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <input id="adm-om-name" type="text" required placeholder="Customer Full Name *" class="bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white" />
              <input id="adm-om-email" type="email" required placeholder="Customer Email *" class="bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white" />
              <input id="adm-om-phone" type="text" required placeholder="Phone Number *" value="+1 (555) 234-5678" class="bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white" />
            </div>
            <div class="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <input id="adm-om-street" type="text" placeholder="Street Address" value="500 Cyber Plaza" class="sm:col-span-2 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white" />
              <input id="adm-om-city" type="text" placeholder="City" value="Austin" class="bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white" />
              <input id="adm-om-state" type="text" placeholder="State/Zip" value="TX" class="bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white" />
            </div>
            <div class="grid grid-cols-3 gap-3">
              <select id="adm-om-status" class="bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-bold">
                <option value="PENDING">PENDING</option>
                <option value="PROCESSING" selected>PROCESSING (In Assembly)</option>
                <option value="SHIPPED">SHIPPED (Dispatched)</option>
                <option value="DELIVERED">DELIVERED</option>
                <option value="CANCELLED">CANCELLED / RMA</option>
              </select>
              <select id="adm-om-paystatus" class="bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-bold">
                <option value="PAID" selected>PAID</option>
                <option value="PENDING">PENDING</option>
                <option value="REFUNDED">REFUNDED</option>
              </select>
              <select id="adm-om-paymethod" class="bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white">
                <option value="STRIPE_CARD">STRIPE_CARD</option>
                <option value="COD">CASH ON DELIVERY</option>
              </select>
            </div>
            <!-- Bespoke 3D Item Selector -->
            <div id="adm-om-item-box" class="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
              <div class="font-bold text-cyan-300">Bespoke 3D Product Configuration</div>
              <div class="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <select id="adm-om-prod" class="sm:col-span-2 bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white"></select>
                <input id="adm-om-qty" type="number" min="1" value="1" class="bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white" />
              </div>
              <div class="grid grid-cols-3 gap-2">
                <select id="adm-om-finish" class="bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white">
                  <option value="TITANIUM">TITANIUM</option>
                  <option value="MATTE">MATTE</option>
                  <option value="NEON">NEON</option>
                  <option value="METALLIC">METALLIC</option>
                  <option value="GLOSSY">GLOSSY</option>
                </select>
                <label class="flex items-center gap-2 text-slate-400">Primary <input type="color" id="adm-om-pri" value="#cbd5e1" class="w-8 h-6" /></label>
                <label class="flex items-center gap-2 text-slate-400">Trim LED <input type="color" id="adm-om-acc" value="#38bdf8" class="w-8 h-6" /></label>
              </div>
            </div>
            <button type="submit" class="w-full py-2.5 rounded-xl bg-cyan-500 text-slate-950 font-extrabold">
              💾 Save Bespoke 3D Order
            </button>
          </form>
        </div>
      </div>

      <!-- MODAL: PRINTABLE ORDER INVOICE & 2D SNAPSHOT PACKING SLIP -->
      <div id="adm-invoice-modal" class="hidden fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4">
        <div class="glass-panel max-w-2xl w-full rounded-3xl p-6 border border-slate-700 space-y-4 text-xs">
          <div id="adm-invoice-body" class="space-y-4"></div>
          <div class="flex justify-end gap-2 pt-3 border-t border-slate-800">
            <button id="adm-print-invoice-btn" class="px-4 py-2 rounded-xl bg-cyan-500 text-slate-950 font-extrabold">🖨️ Print / Save PDF Invoice</button>
            <button id="adm-close-invoice-btn" class="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-bold">Close</button>
          </div>
        </div>
      </div>
    `;
  }

  bindShellEvents() {
    this.root.querySelectorAll('[data-adm-nav]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const sec = btn.getAttribute('data-adm-nav');
        if (sec) this.switchSection(sec);
      });
    });

    document
      .getElementById('adm-rbac-role-select')
      ?.addEventListener('change', (e) => {
        this.activeRole = e.target.value;
        this.toast(`Switched active RBAC view to ${this.activeRole}`, 'info');
      });

    document
      .getElementById('adm-exit-to-store-btn')
      ?.addEventListener('click', () => {
        if (this.onClose) {
          this.onClose();
        } else {
          window.location.href = '/';
        }
      });

    document
      .getElementById('adm-refresh-all-btn')
      ?.addEventListener('click', async () => {
        await this.refreshAll();
        this.toast('Synced live MySQL & WebGL telemetry data!', 'success');
      });

    document
      .getElementById('adm-quick-add-prod-btn')
      ?.addEventListener('click', () => this.openProductModal(null));

    document
      .getElementById('adm-quick-new-order-btn')
      ?.addEventListener('click', () => this.openOrderModal(null));

    document
      .getElementById('adm-close-prod-modal')
      ?.addEventListener('click', () => {
        document.getElementById('adm-product-modal')?.classList.add('hidden');
      });

    document
      .getElementById('adm-f-add-spec')
      ?.addEventListener('click', () => this.addModalSpecRow('', ''));

    document
      .getElementById('adm-f-glb-file')
      ?.addEventListener('change', async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const fd = new FormData();
        fd.append('file', file);
        this.toast(`Uploading ${file.name} with Draco/KTX2 pipeline...`);
        const res = await fetch('/api/admin/upload-glb', {
          method: 'POST',
          body: fd,
        });
        if (res.ok) {
          const data = await res.json();
          document.getElementById('adm-f-glb-url').value = data.glbFileUrl;
          document.getElementById('adm-f-modeltype').value = 'GLB_FILE';
          this.toast(`Uploaded ${file.name} -> ${data.glbFileUrl}`, 'success');
        }
      });

    document
      .getElementById('adm-modal-prod-form')
      ?.addEventListener('submit', async (e) => {
        e.preventDefault();
        await this.submitProductModalForm();
      });

    document
      .getElementById('adm-close-ord-modal')
      ?.addEventListener('click', () => {
        document.getElementById('adm-order-modal')?.classList.add('hidden');
      });

    document
      .getElementById('adm-ord-modal-form')
      ?.addEventListener('submit', async (e) => {
        e.preventDefault();
        await this.submitOrderModalForm();
      });

    document
      .getElementById('adm-close-invoice-btn')
      ?.addEventListener('click', () => {
        document.getElementById('adm-invoice-modal')?.classList.add('hidden');
      });

    document
      .getElementById('adm-print-invoice-btn')
      ?.addEventListener('click', () => window.print());
  }

  switchSection(sectionId) {
    this.activeSection = sectionId;
    const titles = {
      dashboard: 'Executive Sales, Live 3D Sessions & WebGL Health Overview',
      catalog: '3D Product Catalog, Category Hierarchy, Badges & Showroom CMS',
      'studio-3d':
        '3D Asset Studio — .GLB Pipeline, Mesh Node Hierarchy, PBR Shaders & Hotspots',
      orders:
        'Bespoke 3D Order Management, 6-Stage Fulfillment, RMAs & Invoices',
      inventory:
        'Inventory Levels, Modular 3D Component Parts Matrix & Dynamic Surcharges',
      analytics:
        'Financial Reports, 3D Conversion Funnel, Dwell Heatmaps & WebGL FPS',
      customers:
        'Customer Profiles, Saved 3D Builds / Wishlists, Support & Reviews',
      settings:
        'Payment Gateways, Shipping, CDN Edge Cache Invalidation & Audit Trail',
    };
    const titleEl = document.getElementById('adm-header-title');
    if (titleEl) titleEl.textContent = titles[sectionId] || 'Admin Studio';

    this.root.querySelectorAll('[data-adm-nav]').forEach((btn) => {
      const active = btn.getAttribute('data-adm-nav') === sectionId;
      btn.className = `adm-nav-item w-full text-left px-3 py-2.5 rounded-xl transition flex items-center gap-3 ${
        active
          ? 'bg-gradient-to-r from-amber-500/25 to-cyan-500/15 border border-amber-400/50 text-white'
          : 'text-slate-300 hover:bg-slate-800/70 border border-transparent'
      }`;
    });

    this.root.querySelectorAll('.adm-sec-pane').forEach((pane) => {
      pane.classList.toggle('hidden', pane.id !== `adm-sec-${sectionId}`);
    });

    if (sectionId === 'studio-3d') {
      this.ensure3DStudioInitialized();
    }
  }

  async refreshAll() {
    try {
      const [statsRes, prodsRes, ordersRes, catsRes] = await Promise.all([
        fetch('/api/admin/stats'),
        fetch('/api/admin/products'),
        fetch('/api/admin/orders'),
        fetch('/api/products/categories'),
      ]);
      this.stats = await statsRes.json();
      this.products = await prodsRes.json();
      this.orders = await ordersRes.json();
      this.categories = await catsRes.json();

      if (!this.studioProduct && this.products.length > 0) {
        this.studioProduct = this.products[0];
      } else if (this.studioProduct) {
        this.studioProduct =
          this.products.find((p) => p.id === this.studioProduct.id) ||
          this.products[0];
      }

      this.renderDashboardSection();
      this.renderCatalogSection();
      this.render3DStudioSection();
      AdminPanels.renderOrdersSection(this);
      AdminPanels.renderInventorySection(this);
      AdminPanels.renderAnalyticsSection(this);
      AdminPanels.renderCustomersSection(this);
      AdminPanels.renderSettingsSection(this);

      if (this.onCatalogChanged) {
        this.onCatalogChanged();
      }
    } catch (err) {
      console.error('Admin refreshAll error:', err);
    }
  }

  // =========================================================================
  // 1. DASHBOARD OVERVIEW SECTION
  // =========================================================================
  renderDashboardSection() {
    const el = document.getElementById('adm-sec-dashboard');
    if (!el) return;
    const s = this.stats || {};
    const t3d = s.telemetry3D || {};
    const breakdown = s.orderStatusBreakdown || {};

    el.innerHTML = `
      <!-- 12 Executive KPI Cards -->
      <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
        <div class="glass-panel rounded-2xl p-4 border border-slate-800">
          <span class="text-[10px] uppercase text-slate-400 font-bold">Gross GMV / Net Rev</span>
          <div class="text-xl font-extrabold text-emerald-400 mt-1">$${Number(s.totalRevenue || 0).toFixed(2)}</div>
          <div class="text-[10px] text-slate-400">GMV: $${Number(s.gmv || 0).toFixed(2)}</div>
        </div>
        <div class="glass-panel rounded-2xl p-4 border border-slate-800">
          <span class="text-[10px] uppercase text-slate-400 font-bold">Paid vs Pending</span>
          <div class="text-xl font-extrabold text-cyan-400 mt-1">$${Number(s.paidRevenue || 0).toFixed(2)}</div>
          <div class="text-[10px] text-amber-300">Pending: $${Number(s.pendingRevenue || 0).toFixed(2)}</div>
        </div>
        <div class="glass-panel rounded-2xl p-4 border border-slate-800">
          <span class="text-[10px] uppercase text-slate-400 font-bold">Avg Order Value (AOV)</span>
          <div class="text-xl font-extrabold text-white mt-1">$${Number(s.averageOrderValue || 0).toFixed(2)}</div>
          <div class="text-[10px] text-slate-400">${s.totalOrders || 0} Total Orders</div>
        </div>
        <div class="glass-panel rounded-2xl p-4 border border-slate-800">
          <span class="text-[10px] uppercase text-slate-400 font-bold">3D Catalog &amp; Stock</span>
          <div class="text-xl font-extrabold text-indigo-400 mt-1">${s.totalProducts || 0} SKUs</div>
          <div class="text-[10px] text-slate-400">${s.totalStockUnits || 0} units ($${Number(s.totalInventoryValue || 0).toLocaleString()})</div>
        </div>
        <div class="glass-panel rounded-2xl p-4 border border-slate-800">
          <span class="text-[10px] uppercase text-slate-400 font-bold">Live 3D Sessions</span>
          <div class="text-xl font-extrabold text-amber-400 mt-1">${t3d.active3DSessions || 18} Active</div>
          <div class="text-[10px] text-emerald-400">${t3d.stage3DConversionRate || 6.8}% 3D Conv. Rate</div>
        </div>
        <div class="glass-panel rounded-2xl p-4 border border-slate-800">
          <span class="text-[10px] uppercase text-slate-400 font-bold">WebGL Engine Health</span>
          <div class="text-xl font-extrabold text-purple-400 mt-1">${t3d.avgDesktopFps || 59.4} FPS</div>
          <div class="text-[10px] text-slate-400">&lt;30FPS Warn: ${t3d.lowFpsWarningRatePercent || 1.6}%</div>
        </div>
      </div>

      <!-- Order Pipeline Breakdown + Low Stock Alerts -->
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 text-xs">
        <div class="lg:col-span-6 glass-panel rounded-2xl p-5 border border-slate-800 space-y-3">
          <div class="flex items-center justify-between">
            <h3 class="text-sm font-extrabold uppercase tracking-wider text-cyan-300">📦 Order Fulfillment Pipeline Breakdown</h3>
            <button id="adm-dash-goto-orders" class="text-cyan-400 hover:underline font-bold">Manage All Orders →</button>
          </div>
          <div class="grid grid-cols-2 sm:grid-cols-5 gap-2">
            ${['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED']
              .map((st) => {
                const info = breakdown[st] || { count: 0, revenue: 0 };
                return `
                <div class="p-3 rounded-xl bg-slate-900 border border-slate-800 text-center">
                  <div class="text-[10px] font-bold text-slate-400">${st}</div>
                  <div class="text-lg font-extrabold text-white mt-0.5">${info.count}</div>
                  <div class="text-[10px] text-emerald-400 font-mono">$${Number(info.revenue).toFixed(0)}</div>
                </div>
              `;
              })
              .join('')}
          </div>

          <div class="pt-2 space-y-2">
            <div class="font-bold text-slate-300">Recent Bespoke 3D Orders (Quick Inspect)</div>
            ${(s.recentOrders || [])
              .slice(0, 4)
              .map(
                (o) => `
              <div class="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center justify-between gap-2">
                <div>
                  <span class="font-mono font-bold text-cyan-300">${o.orderNumber}</span>
                  <span class="text-white font-semibold ml-1.5">${o.customerName}</span>
                  <span class="text-slate-400 ml-1">(${o.orderStatus})</span>
                </div>
                <div class="flex items-center gap-2">
                  <span class="font-extrabold text-emerald-400">$${Number(o.totalAmount).toFixed(2)}</span>
                  <button data-dash-inspect-ord="${o.id}" class="px-2 py-1 rounded bg-cyan-500/20 text-cyan-300 font-bold text-[10px]">
                    🧊 Inspect 3D
                  </button>
                </div>
              </div>
            `,
              )
              .join('')}
          </div>
        </div>

        <!-- Low Stock Alerts & Quick Restock -->
        <div class="lg:col-span-6 glass-panel rounded-2xl p-5 border border-slate-800 space-y-3">
          <div class="flex items-center justify-between">
            <h3 class="text-sm font-extrabold uppercase tracking-wider text-amber-300">⚠️ Low-Stock SKU Alerts (${s.lowStockCount || 0})</h3>
            <span class="text-[11px] text-slate-400">Threshold ≤ 15 units</span>
          </div>
          <div class="space-y-2 max-h-72 overflow-y-auto pr-1">
            ${
              (s.lowStockProducts || []).length === 0
                ? `<div class="text-emerald-400 py-6 text-center">✓ All 3D SKUs are well-stocked above threshold.</div>`
                : (s.lowStockProducts || [])
                    .map(
                      (item) => `
                  <div class="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between gap-2">
                    <div>
                      <span class="font-bold text-white">${item.name}</span>
                      <span class="text-slate-400 font-mono ml-1">(${item.sku})</span>
                      <span class="ml-2 px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 font-bold">${item.stockQuantity} left</span>
                    </div>
                    <button data-dash-restock="${item.id}" data-cur="${item.stockQuantity}" class="px-2.5 py-1 rounded-lg bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 font-bold hover:bg-emerald-500/30">
                      +20 Restock
                    </button>
                  </div>
                `,
                    )
                    .join('')
            }
          </div>
        </div>
      </div>
    `;

    document
      .getElementById('adm-dash-goto-orders')
      ?.addEventListener('click', () => this.switchSection('orders'));

    el.querySelectorAll('[data-dash-restock]').forEach((btn) => {
      btn.addEventListener('click', async () => {
        const id = Number(btn.getAttribute('data-dash-restock'));
        const cur = Number(btn.getAttribute('data-cur'));
        await fetch(`/api/admin/products/${id}/quick`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ stockQuantity: cur + 20 }),
        });
        this.toast(`Restocked +20 units for Product #${id}`, 'success');
        await this.refreshAll();
      });
    });

    el.querySelectorAll('[data-dash-inspect-ord]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const id = Number(btn.getAttribute('data-dash-inspect-ord'));
        const ord = this.orders.find((o) => o.id === id);
        const it = ord?.items?.[0];
        if (it) {
          this.loadBespokeBuildInto3DStudio({
            productId: it.productId,
            finishType: it.finishType,
            primaryHex: it.primaryHex,
            accentHex: it.accentHex,
          });
        } else {
          this.switchSection('orders');
        }
      });
    });
  }

  // =========================================================================
  // 2. CATALOG & PRODUCTS SECTION (ADD, EDIT, DELETE, CUSTOMIZE, CATEGORIES)
  // =========================================================================
  renderCatalogSection() {
    const el = document.getElementById('adm-sec-catalog');
    if (!el) return;

    const cardModes = this.stats?.enterpriseState?.productCardModes || {};
    const q = (this.catalogSearch || '').trim().toLowerCase();
    const filtered = (this.products || []).filter((p) => {
      if (
        this.catalogCategoryFilter !== 'ALL' &&
        String(p.categoryId) !== String(this.catalogCategoryFilter)
      ) {
        return false;
      }
      if (this.catalogStatusFilter === 'FEATURED' && !p.isFeatured) return false;
      if (this.catalogStatusFilter === 'LOW_STOCK' && p.stockQuantity > 15)
        return false;
      if (
        this.catalogStatusFilter === 'GLB_ONLY' &&
        p.config3d?.modelType !== 'GLB_FILE'
      )
        return false;
      if (!q) return true;
      return (
        (p.name || '').toLowerCase().includes(q) ||
        (p.sku || '').toLowerCase().includes(q) ||
        (p.brand || '').toLowerCase().includes(q) ||
        (p.badgeText || '').toLowerCase().includes(q)
      );
    });

    el.innerHTML = `
      <div class="space-y-6 text-xs">
        <!-- Filter & Action Bar -->
        <div class="glass-panel rounded-2xl p-5 border border-slate-800 space-y-4">
          <div class="flex flex-wrap items-center justify-between gap-3">
            <div>
              <span class="text-[11px] font-bold uppercase tracking-widest text-amber-400">3D Product &amp; CMS Catalog Manager</span>
              <h3 class="text-lg font-extrabold text-white">All 3D Interactive Products (${filtered.length} of ${this.products.length})</h3>
            </div>
            <button id="adm-cat-add-prod-btn" class="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-400 to-cyan-400 text-slate-950 font-extrabold text-xs shadow-lg">
              ➕ Add New 3D Product
            </button>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <input id="adm-cat-search" type="text" value="${this.catalogSearch}" placeholder="Search by title, SKU, brand, badge..." class="sm:col-span-2 bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-white" />
            <select id="adm-cat-filter-cat" class="bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white">
              <option value="ALL">All Categories (${this.categories.length})</option>
              ${this.categories
                .map(
                  (c) =>
                    `<option value="${c.id}" ${String(this.catalogCategoryFilter) === String(c.id) ? 'selected' : ''}>${c.name}</option>`,
                )
                .join('')}
            </select>
            <select id="adm-cat-filter-status" class="bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white">
              <option value="ALL" ${this.catalogStatusFilter === 'ALL' ? 'selected' : ''}>All Product States</option>
              <option value="FEATURED" ${this.catalogStatusFilter === 'FEATURED' ? 'selected' : ''}>★ Featured Hero Stage</option>
              <option value="LOW_STOCK" ${this.catalogStatusFilter === 'LOW_STOCK' ? 'selected' : ''}>⚠️ Low Stock (≤15)</option>
              <option value="GLB_ONLY" ${this.catalogStatusFilter === 'GLB_ONLY' ? 'selected' : ''}>📦 Custom .GLB Assets</option>
            </select>
          </div>
        </div>

        <!-- Product Cards / Rows with Inline Price, Stock, Badge, Mode & 3D Studio Launch -->
        <div class="space-y-3">
          ${filtered
            .map((p) => {
              const isGlb = p.config3d?.modelType === 'GLB_FILE';
              const mode = cardModes[p.id] || '3D_STAGE';
              return `
              <div class="glass-panel rounded-2xl p-4 border border-slate-800 hover:border-slate-700 transition space-y-3">
                <div class="flex flex-wrap items-center justify-between gap-3">
                  <div class="flex items-center gap-2.5 flex-wrap">
                    <button data-cat-feat="${p.id}" class="px-2.5 py-1 rounded-lg border font-bold text-[11px] ${
                      p.isFeatured
                        ? 'bg-amber-500/20 border-amber-400 text-amber-300'
                        : 'bg-slate-900 border-slate-700 text-slate-400'
                    }">${p.isFeatured ? '★ Hero Stage' : '☆ Standard'}</button>
                    <button data-cat-active="${p.id}" class="px-2 py-1 rounded-lg border font-bold text-[11px] ${
                      p.isActive !== false
                        ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300'
                        : 'bg-rose-500/15 border-rose-500/40 text-rose-300'
                    }">${p.isActive !== false ? '✓ Published' : 'Hidden'}</button>
                    <div>
                      <span class="text-sm font-extrabold text-white">${p.name}</span>
                      <span class="text-slate-400 font-mono ml-1.5">(${p.sku})</span>
                      <span class="ml-2 px-2 py-0.5 rounded bg-slate-900 text-cyan-300 font-bold text-[10px]">${p.category?.name || 'Electronics'}</span>
                    </div>
                  </div>

                  <div class="flex flex-wrap items-center gap-2">
                    <span class="px-2 py-0.5 rounded font-mono text-[10px] font-bold ${
                      isGlb
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/40'
                        : 'bg-indigo-500/15 text-indigo-300'
                    }">${isGlb ? '📦 CUSTOM .GLB' : p.config3d?.modelType || '3D'}</span>
                    <button data-cat-open-3d="${p.id}" class="px-3 py-1.5 rounded-xl bg-cyan-500 text-slate-950 font-extrabold hover:bg-cyan-400">
                      🧊 Customize 3D &amp; Shaders
                    </button>
                    <button data-cat-edit="${p.id}" class="px-3 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-white font-bold hover:border-amber-400">
                      ✏️ Edit
                    </button>
                    <button data-cat-dup="${p.id}" class="px-2.5 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-300 font-bold hover:text-white" title="Duplicate 3D Product">
                      📋 Clone
                    </button>
                    <button data-cat-del="${p.id}" class="px-2.5 py-1.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 font-bold hover:bg-rose-500/25">
                      🗑️ Delete
                    </button>
                  </div>
                </div>

                <!-- Inline Quick Controls: Price, Sale Price, Stock, Badge Tag & Feature Card Action -->
                <div class="grid grid-cols-2 sm:grid-cols-6 gap-2.5 pt-2 border-t border-slate-800/80 items-center">
                  <div>
                    <label class="block text-[10px] text-slate-400">Base Price ($USD)</label>
                    <input type="number" step="0.01" data-qp-price="${p.id}" value="${Number(p.basePrice || 0)}" class="w-full bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-white font-bold" />
                  </div>
                  <div>
                    <label class="block text-[10px] text-slate-400">Sale Price ($USD)</label>
                    <input type="number" step="0.01" data-qp-sale="${p.id}" value="${p.salePrice !== null ? Number(p.salePrice) : ''}" placeholder="None" class="w-full bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-emerald-400 font-bold" />
                  </div>
                  <div>
                    <label class="block text-[10px] text-slate-400">Stock Quantity</label>
                    <input type="number" data-qp-stock="${p.id}" value="${p.stockQuantity}" class="w-full bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-white font-bold" />
                  </div>
                  <div>
                    <label class="block text-[10px] text-slate-400">Catalog Badge Tag</label>
                    <input type="text" data-qp-badge="${p.id}" value="${p.badgeText || 'FLAGSHIP 3D'}" class="w-full bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-amber-300 font-bold" />
                  </div>
                  <div>
                    <label class="block text-[10px] text-slate-400">Card Click Behavior</label>
                    <select data-qp-mode="${p.id}" class="w-full bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-cyan-300">
                      <option value="3D_STAGE" ${mode === '3D_STAGE' ? 'selected' : ''}>3D Hero Stage</option>
                      <option value="CUSTOMIZER_STUDIO" ${mode === 'CUSTOMIZER_STUDIO' ? 'selected' : ''}>Customizer Studio</option>
                      <option value="DIRECT_TO_CART" ${mode === 'DIRECT_TO_CART' ? 'selected' : ''}>Direct to Cart</option>
                    </select>
                  </div>
                  <div class="pt-3.5">
                    <button data-qp-save="${p.id}" class="w-full py-1.5 rounded-lg bg-emerald-500/20 border border-emerald-400/50 text-emerald-300 font-extrabold hover:bg-emerald-500/30">
                      💾 Quick Save Row
                    </button>
                  </div>
                </div>
              </div>
            `;
            })
            .join('')}
        </div>

        <!-- Category Hierarchy Manager -->
        <div class="glass-panel rounded-2xl p-5 border border-slate-800 space-y-4">
          <h3 class="text-base font-extrabold text-white">🗂️ Category Hierarchy Manager</h3>
          <form id="adm-cat-create-form" class="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <input id="adm-new-cat-name" type="text" required placeholder="New Category Name..." class="bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white" />
            <input id="adm-new-cat-desc" type="text" placeholder="Category Description..." class="sm:col-span-2 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white" />
            <button type="submit" class="py-2 rounded-xl bg-amber-400 text-slate-950 font-extrabold">+ Create Category</button>
          </form>
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            ${(this.stats?.categoryBreakdown || [])
              .map(
                (c) => `
              <div class="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                <div>
                  <div class="font-bold text-white">${c.name}</div>
                  <div class="text-[10px] text-slate-400">${c.productCount} SKUs • ${c.totalStock} units • $${Number(c.inventoryValue).toLocaleString()}</div>
                </div>
                <button data-del-category="${c.id}" class="text-rose-400 hover:text-rose-300 font-bold px-2">✕</button>
              </div>
            `,
              )
              .join('')}
          </div>
        </div>
      </div>
    `;

    document
      .getElementById('adm-cat-add-prod-btn')
      ?.addEventListener('click', () => this.openProductModal(null));

    document
      .getElementById('adm-cat-search')
      ?.addEventListener('input', (e) => {
        this.catalogSearch = e.target.value;
        this.renderCatalogSection();
      });

    document
      .getElementById('adm-cat-filter-cat')
      ?.addEventListener('change', (e) => {
        this.catalogCategoryFilter = e.target.value;
        this.renderCatalogSection();
      });

    document
      .getElementById('adm-cat-filter-status')
      ?.addEventListener('change', (e) => {
        this.catalogStatusFilter = e.target.value;
        this.renderCatalogSection();
      });

    el.querySelectorAll('[data-cat-feat]').forEach((btn) => {
      btn.addEventListener('click', async () => {
        const id = Number(btn.getAttribute('data-cat-feat'));
        const p = this.products.find((x) => x.id === id);
        if (!p) return;
        await fetch(`/api/admin/products/${id}/quick`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ isFeatured: !p.isFeatured }),
        });
        this.toast(`Updated Featured status for ${p.name}`, 'success');
        await this.refreshAll();
      });
    });

    el.querySelectorAll('[data-cat-active]').forEach((btn) => {
      btn.addEventListener('click', async () => {
        const id = Number(btn.getAttribute('data-cat-active'));
        const p = this.products.find((x) => x.id === id);
        if (!p) return;
        await fetch(`/api/admin/products/${id}/quick`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ isActive: p.isActive === false }),
        });
        this.toast(`Toggled visibility for ${p.name}`, 'success');
        await this.refreshAll();
      });
    });

    el.querySelectorAll('[data-qp-save]').forEach((btn) => {
      btn.addEventListener('click', async () => {
        const id = Number(btn.getAttribute('data-qp-save'));
        const basePrice = Number(
          el.querySelector(`[data-qp-price="${id}"]`)?.value || 0,
        );
        const saleRaw = el.querySelector(`[data-qp-sale="${id}"]`)?.value;
        const salePrice = saleRaw !== '' ? Number(saleRaw) : null;
        const stockQuantity = Number(
          el.querySelector(`[data-qp-stock="${id}"]`)?.value || 0,
        );
        const badgeText = el.querySelector(`[data-qp-badge="${id}"]`)?.value;
        const cardMode = el.querySelector(`[data-qp-mode="${id}"]`)?.value;

        await Promise.all([
          fetch(`/api/admin/products/${id}/quick`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              basePrice,
              salePrice,
              stockQuantity,
              badgeText,
            }),
          }),
          fetch('/api/admin/system-state', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              productCardModes: { [id]: cardMode },
            }),
          }),
        ]);
        this.toast(`Saved quick edits for Product #${id}!`, 'success');
        await this.refreshAll();
      });
    });

    el.querySelectorAll('[data-cat-open-3d]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const id = Number(btn.getAttribute('data-cat-open-3d'));
        const prod = this.products.find((p) => p.id === id);
        if (prod) {
          this.studioProduct = prod;
          this.switchSection('studio-3d');
          this.render3DStudioSection();
        }
      });
    });

    el.querySelectorAll('[data-cat-edit]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const id = Number(btn.getAttribute('data-cat-edit'));
        const prod = this.products.find((p) => p.id === id);
        if (prod) this.openProductModal(prod);
      });
    });

    el.querySelectorAll('[data-cat-dup]').forEach((btn) => {
      btn.addEventListener('click', async () => {
        const id = Number(btn.getAttribute('data-cat-dup'));
        const res = await fetch(`/api/admin/products/${id}/duplicate`, {
          method: 'POST',
        });
        if (res.ok) {
          this.toast('Cloned 3D product with all shaders & hotspots!', 'success');
          await this.refreshAll();
        }
      });
    });

    el.querySelectorAll('[data-cat-del]').forEach((btn) => {
      btn.addEventListener('click', async () => {
        const id = Number(btn.getAttribute('data-cat-del'));
        const prod = this.products.find((p) => p.id === id);
        if (!prod) return;
        await fetch(`/api/admin/products/${id}`, { method: 'DELETE' });
        this.toast(`Deleted "${prod.name}"`, 'info');
        await this.refreshAll();
      });
    });

    document
      .getElementById('adm-cat-create-form')
      ?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const name = document.getElementById('adm-new-cat-name')?.value;
        const description = document.getElementById('adm-new-cat-desc')?.value;
        await fetch('/api/admin/categories', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, description }),
        });
        this.toast(`Created category "${name}"`, 'success');
        await this.refreshAll();
      });

    el.querySelectorAll('[data-del-category]').forEach((btn) => {
      btn.addEventListener('click', async () => {
        const id = Number(btn.getAttribute('data-del-category'));
        await fetch(`/api/admin/categories/${id}`, { method: 'DELETE' });
        this.toast('Deleted category', 'info');
        await this.refreshAll();
      });
    });
  }

  // =========================================================================
  // 3. 3D ASSET STUDIO (PIPELINE, MESH NODES, PBR SHADERS, EXPLODE & HOTSPOTS)
  // =========================================================================
  render3DStudioSection() {
    const el = document.getElementById('adm-sec-studio-3d');
    if (!el) return;

    const p = this.studioProduct || this.products[0];
    if (!p) return;
    const c3d = p.config3d || {};
    const pc = c3d.pipelineConfig || {};
    const v0 = this.studioActiveVariant || p.variants?.[0] || {};

    el.innerHTML = `
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 text-xs">
        <!-- LEFT 5 COLS: INTERACTIVE 3D WEBGL VIEWPORT + MODEL HEALTH AUDIT + MESH HIERARCHY TREE -->
        <div class="lg:col-span-5 space-y-4">
          <div class="glass-panel rounded-2xl p-4 border border-slate-800 space-y-3">
            <div class="flex flex-wrap items-center justify-between gap-2">
              <select id="adm-studio-prod-select" class="flex-1 bg-slate-900 border border-cyan-500/50 rounded-xl px-3 py-2 text-xs font-extrabold text-white">
                ${this.products
                  .map(
                    (prod) =>
                      `<option value="${prod.id}" ${prod.id === p.id ? 'selected' : ''}>#${prod.id} — ${prod.name} (${prod.config3d?.modelType || '3D'})</option>`,
                  )
                  .join('')}
              </select>
              <button id="adm-studio-snap-btn" class="px-3 py-2 rounded-xl bg-indigo-500/20 border border-indigo-400/50 text-indigo-300 font-bold">
                📸 2D Snapshot
              </button>
            </div>

            <!-- Live 3D WebGL Canvas + Telemetry HUD -->
            <div class="relative w-full h-[360px] rounded-2xl stage-grid-bg border border-slate-800 overflow-hidden">
              <div id="adm-studio-3d-canvas" class="w-full h-full"></div>
              <div id="adm-studio-hotspot-layer" class="absolute inset-0 pointer-events-none"></div>
              <!-- Model Health Audit Overlay -->
              <div id="adm-studio-health-hud" class="absolute top-3 left-3 px-3 py-1.5 rounded-xl bg-slate-950/85 border border-slate-800 text-[10px] font-mono text-slate-300 space-y-0.5 pointer-events-none">
                <div>Polys: <strong id="hud-tris" class="text-cyan-300">--</strong> | Draws: <strong id="hud-draws" class="text-white">--</strong> | VRAM: <strong id="hud-vram" class="text-emerald-400">--</strong></div>
                <div>LOD: <strong id="hud-lod" class="text-amber-300">HIGH (Desktop)</strong> | Status: <strong class="text-emerald-400">OPTIMAL</strong></div>
              </div>
            </div>

            <!-- Exploded View Rigging Slider & Camera Keyframe Controls -->
            <div class="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
              <div class="flex items-center justify-between">
                <span class="font-bold text-cyan-300">💥 Exploded-View Disassembly Rig (<span id="adm-studio-explode-lbl">0%</span>)</span>
                <div class="flex gap-1.5">
                  <button id="adm-studio-save-cam" class="px-2.5 py-1 rounded bg-amber-500/20 text-amber-300 font-bold text-[10px]">📌 Save Camera Keyframe</button>
                  <button id="adm-studio-reset-cam" class="px-2 py-1 rounded bg-slate-800 text-slate-300 font-bold text-[10px]">Reset Cam</button>
                </div>
              </div>
              <input id="adm-studio-explode-range" type="range" min="0" max="100" value="0" class="w-full" />
            </div>
          </div>

          <!-- MESH & NODE HIERARCHY PARSER + MATERIAL SLOT MAPPING + PER-NODE EXPLODE VECTORS -->
          <div class="glass-panel rounded-2xl p-4 border border-slate-800 space-y-3">
            <div class="flex items-center justify-between">
              <div>
                <span class="text-[10px] font-bold uppercase tracking-widest text-cyan-400">Internal Mesh Tree-View Parser</span>
                <h4 class="text-sm font-extrabold text-white">🧩 Mesh Nodes, Material Slot Binding &amp; Explode Vectors</h4>
              </div>
              <span id="adm-mesh-count-badge" class="px-2 py-0.5 rounded bg-slate-900 text-cyan-300 font-mono text-[10px]">0 nodes</span>
            </div>
            <div id="adm-studio-mesh-tree" class="space-y-2 max-h-64 overflow-y-auto pr-1"></div>
          </div>
        </div>

        <!-- RIGHT 7 COLS: 1) MODEL PIPELINE & LODs, 2) PBR SHADERS & VARIANTS, 3) CAMERA/LIGHTING & HOTSPOTS -->
        <div class="lg:col-span-7 space-y-4">
          <!-- 1. Model File Pipeline (.GLB/.GLTF/.USDZ, Draco, KTX2, LODs) -->
          <div class="glass-panel rounded-2xl p-5 border border-slate-800 space-y-3">
            <div class="flex items-center justify-between">
              <div>
                <span class="text-[10px] font-bold uppercase tracking-widest text-amber-400">1. Model File Pipeline &amp; LOD Management</span>
                <h4 class="text-sm font-extrabold text-white">.GLB / .GLTF / .USDZ Upload, Draco Mesh Compression &amp; LOD Targets</h4>
              </div>
              <button id="adm-save-pipeline-btn" class="px-3.5 py-1.5 rounded-xl bg-cyan-500 text-slate-950 font-extrabold text-xs">
                💾 Save 3D Pipeline Config
              </button>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label class="block text-[10px] text-slate-400 mb-1">3D Asset Source / Archetype</label>
                <select id="adm-st-modeltype" class="w-full bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-1.5 text-white font-bold">
                  ${[
                    'PROCEDURAL_HEADPHONE',
                    'PROCEDURAL_PHONE',
                    'PROCEDURAL_WATCH',
                    'PROCEDURAL_EARBUDS',
                    'PROCEDURAL_SPEAKER',
                    'PROCEDURAL_LAPTOP',
                    'PROCEDURAL_VR_HEADSET',
                    'PROCEDURAL_CAMERA',
                    'PROCEDURAL_CONSOLE',
                    'GLB_FILE',
                  ]
                    .map(
                      (m) =>
                        `<option value="${m}" ${c3d.modelType === m ? 'selected' : ''}>${m}</option>`,
                    )
                    .join('')}
                </select>
              </div>
              <div>
                <label class="block text-[10px] text-slate-400 mb-1">Level of Detail (LOD) Target</label>
                <select id="adm-st-lod" class="w-full bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-1.5 text-amber-300 font-bold">
                  <option value="HIGH">HIGH — 100% Polys (Desktop Ultra)</option>
                  <option value="MEDIUM">MEDIUM — 55% Polys (Tablet)</option>
                  <option value="LOW">LOW — 25% Polys (Mobile 60FPS)</option>
                </select>
              </div>
              <div>
                <label class="block text-[10px] text-slate-400 mb-1">Upload .GLB / .GLTF / .USDZ</label>
                <input id="adm-st-upload-glb" type="file" accept=".glb,.gltf,.usdz" class="w-full text-[11px] text-slate-300" />
              </div>
            </div>

            <div class="flex flex-wrap items-center gap-4 pt-1 text-[11px] text-slate-300">
              <label class="flex items-center gap-1.5"><input id="adm-st-draco" type="checkbox" ${pc.dracoCompressed !== false ? 'checked' : ''} class="accent-cyan-400" /> Draco Mesh Compression</label>
              <label class="flex items-center gap-1.5"><input id="adm-st-ktx2" type="checkbox" ${pc.ktx2Transcoded !== false ? 'checked' : ''} class="accent-cyan-400" /> KTX2 Texture Transcoding</label>
              <label class="flex items-center gap-1.5"><input id="adm-st-autorotate" type="checkbox" ${c3d.autoRotate !== false ? 'checked' : ''} class="accent-cyan-400" /> Auto-Rotate Turntable</label>
              <label class="flex items-center gap-1.5"><input id="adm-st-shadows" type="checkbox" ${pc.enableShadows !== false ? 'checked' : ''} class="accent-cyan-400" /> PCF Soft Shadows</label>
            </div>
          </div>

          <!-- 2. Material & Shader Presets (PBR Settings) + Finish Variants Manager -->
          <div class="glass-panel rounded-2xl p-5 border border-slate-800 space-y-3">
            <span class="text-[10px] font-bold uppercase tracking-widest text-cyan-400">2. Live PBR Material &amp; Shader Editor</span>
            <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 items-center">
              <div>
                <label class="block text-[10px] text-slate-400 mb-1">Surface Finish Preset</label>
                <select id="adm-pbr-finish" class="w-full bg-slate-900 border border-slate-700 rounded-lg px-2 py-1.5 text-white font-bold">
                  ${['MATTE', 'TITANIUM', 'METALLIC', 'NEON', 'GLOSSY']
                    .map(
                      (f) =>
                        `<option value="${f}" ${v0.finishType === f ? 'selected' : ''}>${f}</option>`,
                    )
                    .join('')}
                </select>
              </div>
              <div>
                <label class="block text-[10px] text-slate-400 mb-1">Base Color (Primary)</label>
                <input type="color" id="adm-pbr-pri" value="${v0.primaryHex || '#1e293b'}" class="w-full h-8 rounded cursor-pointer bg-transparent" />
              </div>
              <div>
                <label class="block text-[10px] text-slate-400 mb-1">Secondary Chassis</label>
                <input type="color" id="adm-pbr-sec" value="${v0.secondaryHex || '#334155'}" class="w-full h-8 rounded cursor-pointer bg-transparent" />
              </div>
              <div>
                <label class="block text-[10px] text-slate-400 mb-1">Emissive Neon / Trim</label>
                <input type="color" id="adm-pbr-acc" value="${v0.accentHex || '#38bdf8'}" class="w-full h-8 rounded cursor-pointer bg-transparent" />
              </div>
            </div>

            <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
              <div>
                <label class="block text-[10px] text-slate-400">Metallic (<span id="lbl-pbr-met">${v0.metalness ?? 0.4}</span>)</label>
                <input type="range" id="adm-pbr-met" min="0" max="1" step="0.02" value="${v0.metalness ?? 0.4}" class="w-full" />
              </div>
              <div>
                <label class="block text-[10px] text-slate-400">Roughness (<span id="lbl-pbr-rou">${v0.roughness ?? 0.5}</span>)</label>
                <input type="range" id="adm-pbr-rou" min="0" max="1" step="0.02" value="${v0.roughness ?? 0.5}" class="w-full" />
              </div>
              <div>
                <label class="block text-[10px] text-slate-400">Clearcoat (<span id="lbl-pbr-cc">0.35</span>)</label>
                <input type="range" id="adm-pbr-cc" min="0" max="1" step="0.05" value="0.35" class="w-full" />
              </div>
              <div>
                <label class="block text-[10px] text-slate-400">Emissive Glow (<span id="lbl-pbr-em">0.45</span>)</label>
                <input type="range" id="adm-pbr-em" min="0" max="2.5" step="0.05" value="0.45" class="w-full" />
              </div>
            </div>

            <!-- Save as Variant or Update Existing Variants -->
            <div class="pt-2 border-t border-slate-800 space-y-2">
              <div class="flex items-center justify-between">
                <span class="font-bold text-amber-300">Product Colorway &amp; Finish Variants (${(p.variants || []).length})</span>
              </div>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-36 overflow-y-auto">
                ${(p.variants || [])
                  .map(
                    (v) => `
                  <div class="p-2 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between gap-2">
                    <button type="button" data-prev-var="${v.id}" class="flex items-center gap-2 text-left flex-1">
                      <span class="w-4 h-4 rounded-full border border-white/30 shrink-0" style="background: linear-gradient(135deg, ${v.primaryHex} 50%, ${v.accentHex} 100%)"></span>
                      <span class="font-bold text-white truncate">${v.variantName}</span>
                      <span class="text-[10px] text-cyan-300">${v.finishType}</span>
                      ${Number(v.priceModifier) > 0 ? `<span class="text-emerald-400">+$${v.priceModifier}</span>` : ''}
                    </button>
                    <button type="button" data-del-var="${v.id}" class="text-rose-400 hover:text-rose-300 font-bold px-1">✕</button>
                  </div>
                `,
                  )
                  .join('')}
              </div>

              <div class="flex flex-wrap items-center gap-2 pt-1">
                <input id="adm-new-var-name" type="text" placeholder="New Variant Name (e.g. Crimson Titanium)" class="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white" />
                <input id="adm-new-var-surcharge" type="number" value="25" placeholder="+$USD" class="w-20 bg-slate-900 border border-slate-700 rounded-lg px-2 py-1.5 text-white" />
                <button id="adm-add-var-from-pbr" class="px-3.5 py-1.5 rounded-lg bg-amber-400 text-slate-950 font-extrabold">
                  + Save Current Shader as Variant
                </button>
              </div>
            </div>
          </div>

          <!-- 3. Viewport Staging, Lighting Rig & Interactive 3D Hotspots -->
          <div class="glass-panel rounded-2xl p-5 border border-slate-800 space-y-3">
            <span class="text-[10px] font-bold uppercase tracking-widest text-indigo-400">3. Viewport Camera Rig, HDR Lighting &amp; 3D Hotspot Pins</span>
            <div class="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
              <div>
                <label class="block text-[10px] text-slate-400">HDR Preset</label>
                <select id="adm-st-env" class="w-full bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-white">
                  <option value="studio" ${c3d.defaultEnvPreset === 'studio' ? 'selected' : ''}>Studio Soft</option>
                  <option value="neon" ${c3d.defaultEnvPreset === 'neon' ? 'selected' : ''}>Neon Cyber</option>
                  <option value="dark" ${c3d.defaultEnvPreset === 'dark' ? 'selected' : ''}>Dark Minimal</option>
                  <option value="warm" ${c3d.defaultEnvPreset === 'warm' ? 'selected' : ''}>Warm Sunlight</option>
                </select>
              </div>
              <div>
                <label class="block text-[10px] text-slate-400">Scale (<span id="lbl-st-scale">${c3d.defaultScale || 1.0}</span>x)</label>
                <input type="range" id="adm-st-scale" min="0.5" max="1.8" step="0.05" value="${c3d.defaultScale || 1.0}" class="w-full" />
              </div>
              <div>
                <label class="block text-[10px] text-slate-400">Camera FOV (<span id="lbl-st-fov">${pc.fov || 40}</span>°)</label>
                <input type="range" id="adm-st-fov" min="25" max="70" step="1" value="${pc.fov || 40}" class="w-full" />
              </div>
              <div>
                <label class="block text-[10px] text-slate-400">Spin Speed</label>
                <input type="range" id="adm-st-spinspeed" min="0" max="4" step="0.2" value="${pc.autoRotateSpeed ?? 1.35}" class="w-full" />
              </div>
              <div>
                <label class="block text-[10px] text-slate-400">Key Light Int.</label>
                <input type="range" id="adm-st-keylight" min="0.5" max="5" step="0.2" value="${pc.keyLightIntensity ?? 2.6}" class="w-full" />
              </div>
            </div>

            <!-- Interactive 3D Hotspots Manager -->
            <div class="pt-2 border-t border-slate-800 space-y-2">
              <div class="font-bold text-cyan-300">📍 Interactive 3D Feature Hotspots (${(p.hotspots || []).length})</div>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-32 overflow-y-auto">
                ${(p.hotspots || [])
                  .map(
                    (h) => `
                  <div class="p-2 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between gap-2">
                    <button type="button" data-fly-hs="${h.id}" class="text-left flex-1">
                      <span class="font-bold text-cyan-300">📍 ${h.title}</span>
                      <span class="text-[10px] font-mono text-slate-400 ml-1">(${h.posX}, ${h.posY}, ${h.posZ})</span>
                    </button>
                    <button type="button" data-del-hs="${h.id}" class="text-rose-400 hover:text-rose-300 font-bold px-1">✕</button>
                  </div>
                `,
                  )
                  .join('')}
              </div>

              <div class="grid grid-cols-1 sm:grid-cols-6 gap-2 pt-1">
                <input id="adm-hs-new-title" type="text" placeholder="Hotspot Callout Title" class="sm:col-span-2 bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-white" />
                <input id="adm-hs-new-desc" type="text" placeholder="Spec Tooltip Description" class="sm:col-span-2 bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-white" />
                <div class="flex gap-1">
                  <input id="adm-hs-nx" type="number" step="0.05" value="0.0" class="w-1/3 bg-slate-900 border border-slate-700 rounded px-1 py-1 text-white text-center" />
                  <input id="adm-hs-ny" type="number" step="0.05" value="0.3" class="w-1/3 bg-slate-900 border border-slate-700 rounded px-1 py-1 text-white text-center" />
                  <input id="adm-hs-nz" type="number" step="0.05" value="0.45" class="w-1/3 bg-slate-900 border border-slate-700 rounded px-1 py-1 text-white text-center" />
                </div>
                <button id="adm-add-hs-btn" class="py-1 rounded-lg bg-indigo-500/25 border border-indigo-400/50 text-indigo-300 font-extrabold">
                  + Pin Hotspot
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    this.bind3DStudioEvents(p);
    if (this.activeSection === 'studio-3d') {
      this.ensure3DStudioInitialized();
    }
  }

  async ensure3DStudioInitialized() {
    const canvasEl = document.getElementById('adm-studio-3d-canvas');
    const hsLayer = document.getElementById('adm-studio-hotspot-layer');
    if (!canvasEl) return;

    this.studioScene = new SceneManager(canvasEl, {
      hotspotLayer: hsLayer,
      autoRotate: true,
    });

    const prod = this.studioProduct || this.products[0];
    if (prod) {
      await this.studioScene.loadProduct(prod, this.studioActiveVariant);
      this.populateMeshHierarchyTree();
      this.updateModelHealthHud();
    }
  }

  populateMeshHierarchyTree() {
    const treeEl = document.getElementById('adm-studio-mesh-tree');
    const badgeEl = document.getElementById('adm-mesh-count-badge');
    if (!treeEl || !this.studioScene) return;

    const nodes = this.studioScene.getMeshHierarchy();
    if (badgeEl) badgeEl.textContent = `${nodes.length} mesh nodes`;

    treeEl.innerHTML = nodes
      .map(
        (n) => `
        <div class="p-2 rounded-xl bg-slate-900 border border-slate-800 space-y-1.5 text-[11px]">
          <div class="flex items-center justify-between gap-2">
            <label class="flex items-center gap-1.5 font-mono font-bold text-white cursor-pointer">
              <input type="checkbox" data-mesh-vis="${n.index}" ${n.visible ? 'checked' : ''} class="accent-cyan-400" />
              <span>${n.name}</span>
            </label>
            <div class="flex items-center gap-1.5">
              <span class="text-[10px] text-slate-400 font-mono">${n.triangles} tris</span>
              <select data-mesh-slot="${n.index}" class="bg-slate-950 border border-slate-700 rounded px-1.5 py-0.5 text-[10px] font-bold text-cyan-300">
                ${['PRIMARY', 'SECONDARY', 'ACCENT', 'GLASS']
                  .map(
                    (s) =>
                      `<option value="${s}" ${n.slot === s ? 'selected' : ''}>${s}</option>`,
                  )
                  .join('')}
              </select>
            </div>
          </div>
          <div class="flex items-center gap-1.5 text-[10px] text-slate-400 font-mono">
            <span>Explode Vec (X,Y,Z):</span>
            <input type="number" step="0.05" data-mesh-ex="${n.index}" value="${n.explodeVec.x}" class="w-14 bg-slate-950 border border-slate-800 rounded px-1 py-0.5 text-white text-center" />
            <input type="number" step="0.05" data-mesh-ey="${n.index}" value="${n.explodeVec.y}" class="w-14 bg-slate-950 border border-slate-800 rounded px-1 py-0.5 text-white text-center" />
            <input type="number" step="0.05" data-mesh-ez="${n.index}" value="${n.explodeVec.z}" class="w-14 bg-slate-950 border border-slate-800 rounded px-1 py-0.5 text-white text-center" />
          </div>
        </div>
      `,
      )
      .join('');

    treeEl.querySelectorAll('[data-mesh-vis]').forEach((cb) => {
      cb.addEventListener('change', () => {
        const idx = Number(cb.getAttribute('data-mesh-vis'));
        this.studioScene?.updateMeshNode(idx, { visible: cb.checked });
      });
    });

    treeEl.querySelectorAll('[data-mesh-slot]').forEach((sel) => {
      sel.addEventListener('change', () => {
        const idx = Number(sel.getAttribute('data-mesh-slot'));
        this.studioScene?.updateMeshNode(idx, { slot: sel.value });
        this.toast(`Bound Mesh Node #${idx + 1} to ${sel.value} shader slot`, 'info');
      });
    });

    ['ex', 'ey', 'ez'].forEach((axis) => {
      treeEl.querySelectorAll(`[data-mesh-${axis}]`).forEach((inp) => {
        inp.addEventListener('input', () => {
          const idx = Number(inp.getAttribute(`data-mesh-${axis}`));
          const ex = Number(
            treeEl.querySelector(`[data-mesh-ex="${idx}"]`)?.value || 0,
          );
          const ey = Number(
            treeEl.querySelector(`[data-mesh-ey="${idx}"]`)?.value || 0,
          );
          const ez = Number(
            treeEl.querySelector(`[data-mesh-ez="${idx}"]`)?.value || 0,
          );
          this.studioScene?.updateMeshNode(idx, {
            explodeX: ex,
            explodeY: ey,
            explodeZ: ez,
          });
        });
      });
    });
  }

  updateModelHealthHud() {
    if (!this.studioScene) return;
    const h = this.studioScene.getModelHealthStats();
    const trisEl = document.getElementById('hud-tris');
    const drawsEl = document.getElementById('hud-draws');
    const vramEl = document.getElementById('hud-vram');
    if (trisEl) trisEl.textContent = h.triangles.toLocaleString();
    if (drawsEl) drawsEl.textContent = String(h.drawCalls);
    if (vramEl) vramEl.textContent = `${h.estimatedVramMb} MB`;
  }

  bind3DStudioEvents(p) {
    document
      .getElementById('adm-studio-prod-select')
      ?.addEventListener('change', (e) => {
        const id = Number(e.target.value);
        const found = this.products.find((x) => x.id === id);
        if (found) {
          this.studioProduct = found;
          this.studioActiveVariant = found.variants?.[0] || null;
          this.render3DStudioSection();
        }
      });

    document
      .getElementById('adm-studio-explode-range')
      ?.addEventListener('input', (e) => {
        const val = Number(e.target.value);
        const lbl = document.getElementById('adm-studio-explode-lbl');
        if (lbl) lbl.textContent = `${val}%`;
        this.studioScene?.setExplodeFactor(val / 100);
      });

    document
      .getElementById('adm-studio-reset-cam')
      ?.addEventListener('click', () => this.studioScene?.resetCamera());

    document
      .getElementById('adm-studio-save-cam')
      ?.addEventListener('click', async () => {
        if (!this.studioScene || !p) return;
        const pos = this.studioScene.camera.position;
        const cameraPosition = {
          x: Number(pos.x.toFixed(2)),
          y: Number(pos.y.toFixed(2)),
          z: Number(pos.z.toFixed(2)),
        };
        await fetch(`/api/admin/products/${p.id}/config3d`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ cameraPosition }),
        });
        this.toast(
          `Saved default camera keyframe (${cameraPosition.x}, ${cameraPosition.y}, ${cameraPosition.z})!`,
          'success',
        );
      });

    document
      .getElementById('adm-studio-snap-btn')
      ?.addEventListener('click', () => {
        const dataUrl = this.studioScene?.captureSnapshot();
        if (dataUrl) {
          const a = document.createElement('a');
          a.href = dataUrl;
          a.download = `snapshot-${p.slug || '3d-model'}.png`;
          a.click();
          this.toast('Captured & downloaded 2D PNG render snapshot!', 'success');
        }
      });

    // Live PBR controls
    const syncPbr = () => {
      const finishType = document.getElementById('adm-pbr-finish')?.value;
      const primaryHex = document.getElementById('adm-pbr-pri')?.value;
      const secondaryHex = document.getElementById('adm-pbr-sec')?.value;
      const accentHex = document.getElementById('adm-pbr-acc')?.value;
      const metalness = Number(
        document.getElementById('adm-pbr-met')?.value ?? 0.4,
      );
      const roughness = Number(
        document.getElementById('adm-pbr-rou')?.value ?? 0.5,
      );
      const clearcoat = Number(
        document.getElementById('adm-pbr-cc')?.value ?? 0.35,
      );
      const emissiveIntensity = Number(
        document.getElementById('adm-pbr-em')?.value ?? 0.45,
      );

      document.getElementById('lbl-pbr-met').textContent = metalness.toFixed(2);
      document.getElementById('lbl-pbr-rou').textContent = roughness.toFixed(2);
      document.getElementById('lbl-pbr-cc').textContent = clearcoat.toFixed(2);
      document.getElementById('lbl-pbr-em').textContent =
        emissiveIntensity.toFixed(2);

      this.studioScene?.applyMaterialCustomization({
        finishType,
        primaryHex,
        secondaryHex,
        accentHex,
        metalness,
        roughness,
        clearcoat,
        emissiveIntensity,
      });
    };

    [
      'adm-pbr-finish',
      'adm-pbr-pri',
      'adm-pbr-sec',
      'adm-pbr-acc',
      'adm-pbr-met',
      'adm-pbr-rou',
      'adm-pbr-cc',
      'adm-pbr-em',
    ].forEach((id) => {
      document.getElementById(id)?.addEventListener('input', syncPbr);
    });

    // Variant preview & delete
    const el = document.getElementById('adm-sec-studio-3d');
    el?.querySelectorAll('[data-prev-var]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const varId = Number(btn.getAttribute('data-prev-var'));
        const v = (p.variants || []).find((x) => x.id === varId);
        if (v) {
          this.studioActiveVariant = v;
          document.getElementById('adm-pbr-finish').value = v.finishType;
          document.getElementById('adm-pbr-pri').value = v.primaryHex;
          document.getElementById('adm-pbr-sec').value = v.secondaryHex;
          document.getElementById('adm-pbr-acc').value = v.accentHex;
          this.studioScene?.applyMaterialCustomization(v);
        }
      });
    });

    el?.querySelectorAll('[data-del-var]').forEach((btn) => {
      btn.addEventListener('click', async () => {
        const varId = Number(btn.getAttribute('data-del-var'));
        await fetch(`/api/admin/variants/${varId}`, { method: 'DELETE' });
        this.toast('Deleted variant', 'info');
        await this.refreshAll();
      });
    });

    document
      .getElementById('adm-add-var-from-pbr')
      ?.addEventListener('click', async () => {
        const variantName =
          document.getElementById('adm-new-var-name')?.value ||
          'Custom Shader Edition';
        const priceModifier = Number(
          document.getElementById('adm-new-var-surcharge')?.value || 0,
        );
        const body = {
          variantName,
          finishType: document.getElementById('adm-pbr-finish')?.value,
          primaryHex: document.getElementById('adm-pbr-pri')?.value,
          secondaryHex: document.getElementById('adm-pbr-sec')?.value,
          accentHex: document.getElementById('adm-pbr-acc')?.value,
          metalness: Number(document.getElementById('adm-pbr-met')?.value),
          roughness: Number(document.getElementById('adm-pbr-rou')?.value),
          priceModifier,
        };
        await fetch(`/api/admin/products/${p.id}/variants`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });
        this.toast(`Saved "${variantName}" to ${p.name}!`, 'success');
        await this.refreshAll();
      });

    // Viewport, LOD, Scale, FOV & Lighting
    document.getElementById('adm-st-lod')?.addEventListener('change', (e) => {
      const lod = e.target.value;
      const hudLod = document.getElementById('hud-lod');
      if (hudLod) hudLod.textContent = lod;
      const scaleMap = { HIGH: 1.0, MEDIUM: 0.98, LOW: 0.95 };
      this.studioScene?.setScale(scaleMap[lod] || 1.0);
      this.toast(`Switched viewport LOD preview to ${lod}`, 'info');
    });

    document.getElementById('adm-st-env')?.addEventListener('change', (e) => {
      this.studioScene?.setLightingPreset(e.target.value);
    });

    document.getElementById('adm-st-scale')?.addEventListener('input', (e) => {
      document.getElementById('lbl-st-scale').textContent = e.target.value;
      this.studioScene?.setScale(Number(e.target.value));
    });

    document.getElementById('adm-st-fov')?.addEventListener('input', (e) => {
      document.getElementById('lbl-st-fov').textContent = e.target.value;
      this.studioScene?.setCameraRig({ fov: Number(e.target.value) });
    });

    document
      .getElementById('adm-st-spinspeed')
      ?.addEventListener('input', (e) => {
        this.studioScene?.setCameraRig({
          autoRotateSpeed: Number(e.target.value),
        });
      });

    document
      .getElementById('adm-st-keylight')
      ?.addEventListener('input', (e) => {
        this.studioScene?.setLightIntensities({ key: Number(e.target.value) });
      });

    document
      .getElementById('adm-st-autorotate')
      ?.addEventListener('change', (e) => {
        this.studioScene?.setCameraRig({ autoRotate: e.target.checked });
      });

    document
      .getElementById('adm-st-shadows')
      ?.addEventListener('change', (e) => {
        this.studioScene?.setLightIntensities({ shadows: e.target.checked });
      });

    // Upload .GLB directly to current studio product
    document
      .getElementById('adm-st-upload-glb')
      ?.addEventListener('change', async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const fd = new FormData();
        fd.append('file', file);
        this.toast(`Uploading ${file.name} & running Draco/KTX2 pipeline...`);
        const res = await fetch(`/api/admin/products/${p.id}/upload-glb`, {
          method: 'POST',
          body: fd,
        });
        if (res.ok) {
          this.toast(`Bound ${file.name} to ${p.name}!`, 'success');
          await this.refreshAll();
        }
      });

    // Save 3D Pipeline Config button
    document
      .getElementById('adm-save-pipeline-btn')
      ?.addEventListener('click', async () => {
        const payload = {
          modelType: document.getElementById('adm-st-modeltype')?.value,
          defaultEnvPreset: document.getElementById('adm-st-env')?.value,
          defaultScale: Number(
            document.getElementById('adm-st-scale')?.value || 1.0,
          ),
          autoRotate: document.getElementById('adm-st-autorotate')?.checked,
          pipelineConfig: {
            fov: Number(document.getElementById('adm-st-fov')?.value || 40),
            autoRotateSpeed: Number(
              document.getElementById('adm-st-spinspeed')?.value || 1.35,
            ),
            keyLightIntensity: Number(
              document.getElementById('adm-st-keylight')?.value || 2.6,
            ),
            enableShadows: document.getElementById('adm-st-shadows')?.checked,
            dracoCompressed: document.getElementById('adm-st-draco')?.checked,
            ktx2Transcoded: document.getElementById('adm-st-ktx2')?.checked,
          },
        };
        await fetch(`/api/admin/products/${p.id}/config3d`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        this.toast(`Saved 3D Pipeline & Viewport Rig for ${p.name}!`, 'success');
        await this.refreshAll();
      });

    // Hotspots fly-to, delete, add
    el?.querySelectorAll('[data-fly-hs]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const hsId = Number(btn.getAttribute('data-fly-hs'));
        const h = (p.hotspots || []).find((x) => x.id === hsId);
        if (h && this.studioScene) {
          this.studioScene.flyCameraTo(
            { x: h.camX || 1.8, y: h.camY || 1.1, z: h.camZ || 2.1 },
            { x: h.posX * 0.4, y: h.posY * 0.4, z: h.posZ * 0.4 },
          );
        }
      });
    });

    el?.querySelectorAll('[data-del-hs]').forEach((btn) => {
      btn.addEventListener('click', async () => {
        const hsId = Number(btn.getAttribute('data-del-hs'));
        await fetch(`/api/admin/hotspots/${hsId}`, { method: 'DELETE' });
        this.toast('Removed 3D hotspot pin', 'info');
        await this.refreshAll();
      });
    });

    document
      .getElementById('adm-add-hs-btn')
      ?.addEventListener('click', async () => {
        const title =
          document.getElementById('adm-hs-new-title')?.value ||
          '3D Feature Callout';
        const description =
          document.getElementById('adm-hs-new-desc')?.value ||
          'Precision engineered subsystem.';
        const posX = Number(document.getElementById('adm-hs-nx')?.value || 0);
        const posY = Number(document.getElementById('adm-hs-ny')?.value || 0.3);
        const posZ = Number(
          document.getElementById('adm-hs-nz')?.value || 0.45,
        );
        const camPos = this.studioScene?.camera?.position || {
          x: 1.9,
          y: 1.1,
          z: 2.2,
        };
        await fetch(`/api/admin/products/${p.id}/hotspots`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title,
            description,
            posX,
            posY,
            posZ,
            camX: Number(camPos.x.toFixed(2)),
            camY: Number(camPos.y.toFixed(2)),
            camZ: Number(camPos.z.toFixed(2)),
          }),
        });
        this.toast(`Pinned 3D Hotspot "${title}"!`, 'success');
        await this.refreshAll();
      });
  }

  // Helper to load any customer order's bespoke 3D build directly into the 3D Admin Viewer
  loadBespokeBuildInto3DStudio({
    productId,
    finishType,
    primaryHex,
    accentHex,
  }) {
    const prod =
      this.products.find((p) => p.id === Number(productId)) || this.products[0];
    if (!prod) return;
    this.studioProduct = prod;
    this.studioActiveVariant = {
      variantName: 'Customer Bespoke Order Build',
      finishType: finishType || 'TITANIUM',
      primaryHex: primaryHex || '#cbd5e1',
      secondaryHex: '#334155',
      accentHex: accentHex || '#38bdf8',
    };
    this.switchSection('studio-3d');
    this.render3DStudioSection();
    this.toast(
      `Loaded bespoke ${finishType} build for "${prod.name}" in 3D Admin Viewer!`,
      'success',
    );
  }

  // =========================================================================
  // MODALS: ADD/EDIT PRODUCT, CREATE/EDIT ORDER, PRINTABLE INVOICE
  // =========================================================================
  addModalSpecRow(k = '', v = '') {
    const list = document.getElementById('adm-f-specs-list');
    if (!list) return;
    const row = document.createElement('div');
    row.className = 'flex items-center gap-2 adm-modal-spec-row';
    row.innerHTML = `
      <input type="text" placeholder="Spec Key (e.g. Frequency Response)" value="${k}" class="spec-k w-1/3 bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1 text-white" />
      <input type="text" placeholder="Value (e.g. 5Hz – 50,000Hz)" value="${v}" class="spec-v flex-1 bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1 text-white" />
      <button type="button" class="px-2 py-1 rounded bg-rose-500/20 text-rose-300 font-bold">✕</button>
    `;
    row.querySelector('button').addEventListener('click', () => row.remove());
    list.appendChild(row);
  }

  openProductModal(prod = null) {
    const modal = document.getElementById('adm-product-modal');
    if (!modal) return;
    modal.classList.remove('hidden');

    const catSel = document.getElementById('adm-f-category');
    if (catSel) {
      catSel.innerHTML = this.categories
        .map((c) => `<option value="${c.id}">${c.name}</option>`)
        .join('');
    }

    const specsList = document.getElementById('adm-f-specs-list');
    if (specsList) specsList.innerHTML = '';

    if (prod) {
      document.getElementById('adm-modal-prod-title').textContent =
        `Edit 3D Product #${prod.id}: ${prod.name}`;
      document.getElementById('adm-f-id').value = String(prod.id);
      document.getElementById('adm-f-name').value = prod.name || '';
      document.getElementById('adm-f-brand').value = prod.brand || 'Aether 3D';
      document.getElementById('adm-f-sku').value = prod.sku || '';
      document.getElementById('adm-f-category').value = String(prod.categoryId);
      document.getElementById('adm-f-price').value = Number(prod.basePrice || 0);
      document.getElementById('adm-f-sale').value =
        prod.salePrice !== null ? Number(prod.salePrice) : '';
      document.getElementById('adm-f-stock').value = prod.stockQuantity ?? 25;
      document.getElementById('adm-f-badge').value =
        prod.badgeText || 'FLAGSHIP 3D';
      document.getElementById('adm-f-featured').checked = Boolean(
        prod.isFeatured,
      );
      document.getElementById('adm-f-active').checked =
        prod.isActive !== false;
      document.getElementById('adm-f-modeltype').value =
        prod.config3d?.modelType || 'PROCEDURAL_HEADPHONE';
      document.getElementById('adm-f-env').value =
        prod.config3d?.defaultEnvPreset || 'studio';
      document.getElementById('adm-f-glb-url').value =
        prod.config3d?.glbFileUrl || '';
      document.getElementById('adm-f-tagline').value = prod.tagline || '';
      document.getElementById('adm-f-desc').value = prod.description || '';

      const specs = prod.technicalSpecs || {};
      Object.entries(specs).forEach(([k, v]) => this.addModalSpecRow(k, v));
    } else {
      document.getElementById('adm-modal-prod-title').textContent =
        'Create New 3D Electronics Product';
      document.getElementById('adm-modal-prod-form')?.reset();
      document.getElementById('adm-f-id').value = '';
      document.getElementById('adm-f-glb-url').value = '';
      this.addModalSpecRow('Driver / Architecture', '45mm Beryllium Planar');
      this.addModalSpecRow('Battery Life', '60 Hours Adaptive ANC');
      this.addModalSpecRow('Connectivity', 'Bluetooth 5.4 + USB-C Lossless');
      this.addModalSpecRow('Weight', '310g Anodized Titanium');
    }
  }

  async submitProductModalForm() {
    const id = document.getElementById('adm-f-id')?.value;
    const specs = {};
    document
      .querySelectorAll('#adm-f-specs-list .adm-modal-spec-row')
      .forEach((r) => {
        const k = r.querySelector('.spec-k')?.value?.trim();
        const v = r.querySelector('.spec-v')?.value?.trim();
        if (k && v) specs[k] = v;
      });

    const saleVal = document.getElementById('adm-f-sale')?.value;
    const glbUrl = document.getElementById('adm-f-glb-url')?.value || null;
    const payload = {
      name: document.getElementById('adm-f-name')?.value,
      brand: document.getElementById('adm-f-brand')?.value,
      sku: document.getElementById('adm-f-sku')?.value || undefined,
      categoryId: Number(document.getElementById('adm-f-category')?.value),
      basePrice: Number(document.getElementById('adm-f-price')?.value),
      salePrice: saleVal !== '' ? Number(saleVal) : null,
      stockQuantity: Number(document.getElementById('adm-f-stock')?.value),
      badgeText: document.getElementById('adm-f-badge')?.value,
      cardMode: document.getElementById('adm-f-cardmode')?.value,
      isFeatured: document.getElementById('adm-f-featured')?.checked,
      isActive: document.getElementById('adm-f-active')?.checked,
      tagline: document.getElementById('adm-f-tagline')?.value,
      description: document.getElementById('adm-f-desc')?.value,
      technicalSpecs: specs,
      config3d: {
        modelType: glbUrl
          ? 'GLB_FILE'
          : document.getElementById('adm-f-modeltype')?.value,
        glbFileUrl: glbUrl,
        defaultEnvPreset: document.getElementById('adm-f-env')?.value,
      },
    };

    const res = await fetch(
      id ? `/api/admin/products/${id}` : '/api/admin/products',
      {
        method: id ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      },
    );
    if (res.ok) {
      document.getElementById('adm-product-modal')?.classList.add('hidden');
      this.toast(
        id ? 'Updated 3D product in MySQL!' : 'Created new 3D product!',
        'success',
      );
      await this.refreshAll();
    }
  }

  openOrderModal(order = null) {
    const modal = document.getElementById('adm-order-modal');
    if (!modal) return;
    modal.classList.remove('hidden');

    const prodSel = document.getElementById('adm-om-prod');
    if (prodSel) {
      prodSel.innerHTML = this.products
        .map(
          (p) =>
            `<option value="${p.id}">${p.name} ($${Number(p.salePrice || p.basePrice).toFixed(2)})</option>`,
        )
        .join('');
    }

    if (order) {
      document.getElementById('adm-ord-modal-title').textContent =
        `Edit Order ${order.orderNumber}`;
      document.getElementById('adm-om-id').value = String(order.id);
      document.getElementById('adm-om-name').value = order.customerName || '';
      document.getElementById('adm-om-email').value = order.customerEmail || '';
      document.getElementById('adm-om-phone').value = order.customerPhone || '';
      document.getElementById('adm-om-street').value =
        order.shippingAddress?.street || '';
      document.getElementById('adm-om-city').value =
        order.shippingAddress?.city || '';
      document.getElementById('adm-om-state').value =
        order.shippingAddress?.state || '';
      document.getElementById('adm-om-status').value = order.orderStatus;
      document.getElementById('adm-om-paystatus').value = order.paymentStatus;
      document.getElementById('adm-om-paymethod').value = order.paymentMethod;
      document.getElementById('adm-om-item-box')?.classList.add('hidden');
    } else {
      document.getElementById('adm-ord-modal-title').textContent =
        'Create Bespoke 3D Customer Order';
      document.getElementById('adm-ord-modal-form')?.reset();
      document.getElementById('adm-om-id').value = '';
      document.getElementById('adm-om-item-box')?.classList.remove('hidden');
    }
  }

  async submitOrderModalForm() {
    const id = document.getElementById('adm-om-id')?.value;
    const payload = {
      customerName: document.getElementById('adm-om-name')?.value,
      customerEmail: document.getElementById('adm-om-email')?.value,
      customerPhone: document.getElementById('adm-om-phone')?.value,
      shippingAddress: {
        street: document.getElementById('adm-om-street')?.value,
        city: document.getElementById('adm-om-city')?.value,
        state: document.getElementById('adm-om-state')?.value,
        zipCode: '78701',
        country: 'United States',
      },
      orderStatus: document.getElementById('adm-om-status')?.value,
      paymentStatus: document.getElementById('adm-om-paystatus')?.value,
      paymentMethod: document.getElementById('adm-om-paymethod')?.value,
    };

    if (!id) {
      const prodId = Number(document.getElementById('adm-om-prod')?.value);
      const prod = this.products.find((p) => p.id === prodId);
      payload.items = [
        {
          productId: prod?.id,
          productName: prod?.name || 'Bespoke 3D Device',
          unitPrice: Number(prod?.salePrice || prod?.basePrice || 349),
          quantity: Number(document.getElementById('adm-om-qty')?.value || 1),
          finishType: document.getElementById('adm-om-finish')?.value,
          variantName: `Custom ${document.getElementById('adm-om-finish')?.value} Build`,
          primaryHex: document.getElementById('adm-om-pri')?.value,
          accentHex: document.getElementById('adm-om-acc')?.value,
        },
      ];
    }

    const res = await fetch(
      id ? `/api/admin/orders/${id}` : '/api/admin/orders',
      {
        method: id ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      },
    );
    if (res.ok) {
      document.getElementById('adm-order-modal')?.classList.add('hidden');
      this.toast(id ? 'Updated order details!' : 'Created bespoke 3D order!', 'success');
      await this.refreshAll();
    }
  }

  openInvoiceModal(order) {
    const modal = document.getElementById('adm-invoice-modal');
    const body = document.getElementById('adm-invoice-body');
    if (!modal || !body) return;
    modal.classList.remove('hidden');

    const addr = order.shippingAddress || {};
    body.innerHTML = `
      <div class="flex justify-between items-start border-b border-slate-800 pb-4">
        <div>
          <div class="text-base font-black text-cyan-400">AETHER 3D ELECTRONICS — PACKING SLIP &amp; INVOICE</div>
          <div class="text-slate-400 font-mono">Order ID: ${order.orderNumber} • Date: ${new Date(order.createdAt).toLocaleString()}</div>
        </div>
        <div class="text-right">
          <span class="px-2.5 py-1 rounded bg-emerald-500/20 text-emerald-300 font-bold">${order.paymentStatus} (${order.paymentMethod})</span>
        </div>
      </div>
      <div class="grid grid-cols-2 gap-4">
        <div>
          <div class="text-slate-400 uppercase text-[10px] font-bold">Customer &amp; Shipping Destination</div>
          <div class="font-bold text-white mt-0.5">${order.customerName}</div>
          <div class="text-slate-300">${order.customerEmail} • ${order.customerPhone}</div>
          <div class="text-slate-400">${addr.street || ''}, ${addr.city || ''}, ${addr.state || ''} ${addr.zipCode || ''}</div>
        </div>
        <div class="text-right">
          <div class="text-slate-400 uppercase text-[10px] font-bold">Fulfillment &amp; Telemetry</div>
          <div class="font-bold text-cyan-300">${order.fulfillmentMeta?.courier || 'FedEx Priority'}</div>
          <div class="font-mono text-slate-300">Tracking: ${order.fulfillmentMeta?.trackingNumber || 'FX-94820411'}</div>
        </div>
      </div>
      <div class="border-t border-slate-800 pt-3 space-y-2">
        <div class="text-slate-400 uppercase text-[10px] font-bold">Configured 3D Build Items</div>
        ${(order.items || [])
          .map(
            (i) => `
          <div class="p-2.5 rounded-xl bg-slate-900 border border-slate-800 flex justify-between items-center">
            <div class="flex items-center gap-2.5">
              <span class="w-5 h-5 rounded-full border border-white/40" style="background: linear-gradient(135deg, ${i.primaryHex} 50%, ${i.accentHex} 100%)"></span>
              <div>
                <div class="font-bold text-white">${i.quantity}x ${i.productName}</div>
                <div class="text-[10px] text-cyan-300">Finish: ${i.finishType} | Variant: ${i.variantName} | Pri: ${i.primaryHex} | Trim: ${i.accentHex}</div>
              </div>
            </div>
            <div class="font-extrabold text-white">$${(Number(i.unitPrice) * Number(i.quantity)).toFixed(2)}</div>
          </div>
        `,
          )
          .join('')}
      </div>
      <div class="border-t border-slate-800 pt-3 flex justify-between text-sm font-extrabold text-emerald-400">
        <span>Total Order Amount (USD)</span>
        <span>$${Number(order.totalAmount).toFixed(2)} USD</span>
      </div>
    `;
  }
}
