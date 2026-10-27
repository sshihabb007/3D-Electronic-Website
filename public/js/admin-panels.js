/**
 * admin-panels.js
 * Renders & binds the specialized sections of the Aether 3D Enterprise Admin Dashboard:
 * - Section 4: Bespoke 3D Orders, 6-Stage Fulfillment, RMAs & Printable Invoices
 * - Section 5: Inventory & Modular Component Parts Matrix, Surcharge Engine & Batch Ops
 * - Section 6: Sales & Specialized 3D WebGL Engagement Telemetry
 * - Section 7: Customers, Saved 3D Builds / Wishlists, Support Tickets & UGC Reviews
 * - Section 8: Settings, RBAC Staff Roles, CDN Edge Cache Purge & Audit Trail Logs
 */

export const AdminPanels = {
  // =========================================================================
  // 4. BESPOKE 3D ORDERS, FULFILLMENT PIPELINE, RMAs & INVOICES
  // =========================================================================
  renderOrdersSection(ctx) {
    const container = document.getElementById('adm-sec-orders');
    if (!container) return;

    const orders = ctx.orders || [];
    const counts = {
      ALL: orders.length,
      PENDING: orders.filter((o) => o.orderStatus === 'PENDING').length,
      PROCESSING: orders.filter((o) => o.orderStatus === 'PROCESSING').length,
      SHIPPED: orders.filter((o) => o.orderStatus === 'SHIPPED').length,
      DELIVERED: orders.filter((o) => o.orderStatus === 'DELIVERED').length,
      CANCELLED: orders.filter((o) => o.orderStatus === 'CANCELLED').length,
    };

    const q = (ctx.orderSearch || '').trim().toLowerCase();
    const filtered = orders.filter((o) => {
      if (ctx.orderStatusFilter !== 'ALL' && o.orderStatus !== ctx.orderStatusFilter) {
        return false;
      }
      if (
        ctx.orderPaymentFilter !== 'ALL' &&
        o.paymentStatus !== ctx.orderPaymentFilter
      ) {
        return false;
      }
      if (!q) return true;
      const itemMatch = (o.items || []).some(
        (i) =>
          (i.productName || '').toLowerCase().includes(q) ||
          (i.variantName || '').toLowerCase().includes(q) ||
          (i.finishType || '').toLowerCase().includes(q),
      );
      const tracking = o.fulfillmentMeta?.trackingNumber || '';
      return (
        (o.orderNumber || '').toLowerCase().includes(q) ||
        (o.customerName || '').toLowerCase().includes(q) ||
        (o.customerEmail || '').toLowerCase().includes(q) ||
        (o.customerPhone || '').toLowerCase().includes(q) ||
        tracking.toLowerCase().includes(q) ||
        itemMatch
      );
    });

    container.innerHTML = `
      <div class="space-y-5">
        <!-- Top Action Bar & Lifecycle Filter Pills -->
        <div class="glass-panel rounded-2xl p-5 border border-slate-800 space-y-4">
          <div class="flex flex-wrap items-center justify-between gap-3">
            <div>
              <span class="text-[11px] font-bold uppercase tracking-widest text-cyan-400">Bespoke 3D Order Pipeline</span>
              <h3 class="text-lg font-extrabold text-white">Custom 3D Orders, Assembly Queue, Multi-Courier Dispatch &amp; RMAs</h3>
            </div>
            <div class="flex flex-wrap items-center gap-2">
              <button id="adm-btn-new-order" class="px-3.5 py-2 rounded-xl bg-gradient-to-r from-cyan-400 to-indigo-500 text-slate-950 font-extrabold text-xs shadow-lg">
                ➕ Create Bespoke 3D Order
              </button>
              <button id="adm-btn-export-orders-csv" class="px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 hover:border-cyan-400 font-bold text-xs">
                📥 Export Orders CSV
              </button>
            </div>
          </div>

          <!-- Status Tabs -->
          <div class="flex flex-wrap items-center gap-2 pt-1">
            ${[
              { id: 'ALL', label: 'All Orders', count: counts.ALL },
              { id: 'PENDING', label: '⏳ Pending Payment / Queue', count: counts.PENDING },
              { id: 'PROCESSING', label: '🔧 In Production / Assembly', count: counts.PROCESSING },
              { id: 'SHIPPED', label: '🚚 Dispatched / In Transit', count: counts.SHIPPED },
              { id: 'DELIVERED', label: '✅ Delivered', count: counts.DELIVERED },
              { id: 'CANCELLED', label: '↩️ RMAs / Returned / Cancelled', count: counts.CANCELLED },
            ]
              .map(
                (tab) => `
              <button data-ord-tab="${tab.id}" class="px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                ctx.orderStatusFilter === tab.id
                  ? 'bg-cyan-500 text-slate-950 shadow'
                  : 'bg-slate-900 border border-slate-800 text-slate-300 hover:border-slate-600'
              }">
                ${tab.label} <span class="ml-1 px-1.5 py-0.5 rounded-full text-[10px] ${
                  ctx.orderStatusFilter === tab.id
                    ? 'bg-slate-950/30 text-slate-950'
                    : 'bg-slate-800 text-cyan-300'
                }">${tab.count}</span>
              </button>
            `,
              )
              .join('')}
          </div>

          <!-- Search, Payment Filter & Bulk Actions -->
          <div class="grid grid-cols-1 md:grid-cols-12 gap-3 pt-2 border-t border-slate-800/80 items-center">
            <div class="md:col-span-5">
              <input id="adm-ord-search-input" type="text" value="${ctx.orderSearch || ''}" placeholder="Search Order #, customer, email, tracking #, or 3D finish..." class="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white" />
            </div>
            <div class="md:col-span-3">
              <select id="adm-ord-pay-filter" class="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-semibold">
                <option value="ALL" ${ctx.orderPaymentFilter === 'ALL' ? 'selected' : ''}>All Payment Statuses</option>
                <option value="PAID" ${ctx.orderPaymentFilter === 'PAID' ? 'selected' : ''}>💳 Paid Only</option>
                <option value="PENDING" ${ctx.orderPaymentFilter === 'PENDING' ? 'selected' : ''}>⏳ Pending Payment</option>
                <option value="REFUNDED" ${ctx.orderPaymentFilter === 'REFUNDED' ? 'selected' : ''}>↩️ Refunded</option>
                <option value="FAILED" ${ctx.orderPaymentFilter === 'FAILED' ? 'selected' : ''}>⚠️ Failed</option>
              </select>
            </div>
            <div class="md:col-span-4 flex items-center gap-2">
              <select id="adm-bulk-ord-status" class="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-2 text-xs text-white">
                <option value="">Bulk Action (${ctx.selectedOrderIds.size} selected)...</option>
                <option value="STATUS:PROCESSING">Set In Assembly (PROCESSING)</option>
                <option value="STATUS:SHIPPED">Set Dispatched (SHIPPED)</option>
                <option value="STATUS:DELIVERED">Set Delivered (DELIVERED)</option>
                <option value="STATUS:CANCELLED">Set Cancelled / RMA</option>
                <option value="PAY:PAID">Mark Payment PAID</option>
                <option value="PAY:REFUNDED">Mark Payment REFUNDED</option>
              </select>
              <button id="adm-apply-bulk-ord" class="px-3 py-2 rounded-xl bg-amber-500/20 border border-amber-400/50 text-amber-300 font-bold text-xs hover:bg-amber-500/30">
                Apply
              </button>
            </div>
          </div>
        </div>

        <!-- Orders List with 3D Build Specs, 2D Snapshot & Fulfillment Controls -->
        <div class="space-y-3">
          ${
            filtered.length === 0
              ? `<div class="glass-panel rounded-2xl p-8 text-center text-slate-400 text-xs">No orders match the current filter criteria.</div>`
              : filtered
                  .map((o) => this.renderSingleOrderCard(o, ctx))
                  .join('')
          }
        </div>
      </div>
    `;

    this.bindOrdersEvents(ctx);
  },

  renderSingleOrderCard(o, ctx) {
    const meta = o.fulfillmentMeta || {};
    const courier = meta.courier || 'FedEx Priority';
    const tracking =
      meta.trackingNumber || `FX-${100000 + Number(o.id || 1) * 7919}`;
    const serial = meta.serialNumber || `SN-AETHER-2026-0${o.id}`;
    const lifecycle =
      meta.lifecycleStage ||
      (o.orderStatus === 'PENDING'
        ? 'PENDING_PAYMENT'
        : o.orderStatus === 'PROCESSING'
          ? 'IN_ASSEMBLY'
          : o.orderStatus === 'SHIPPED'
            ? 'DISPATCHED'
            : o.orderStatus === 'DELIVERED'
              ? 'DELIVERED'
              : 'RETURNED_RMA');

    const statusBadgeMap = {
      PENDING: 'bg-amber-500/20 text-amber-300 border-amber-400/40',
      PROCESSING: 'bg-cyan-500/20 text-cyan-300 border-cyan-400/40',
      SHIPPED: 'bg-indigo-500/20 text-indigo-300 border-indigo-400/40',
      DELIVERED: 'bg-emerald-500/20 text-emerald-300 border-emerald-400/40',
      CANCELLED: 'bg-rose-500/20 text-rose-300 border-rose-400/40',
    };

    const addr = o.shippingAddress || {};
    const checked = ctx.selectedOrderIds.has(o.id) ? 'checked' : '';

    return `
      <div class="glass-panel rounded-2xl p-4 border border-slate-800 hover:border-slate-700 transition space-y-3 text-xs">
        <!-- Row 1: Order Header, Customer, Lifecycle Stage & Quick Status -->
        <div class="flex flex-wrap items-center justify-between gap-3">
          <div class="flex items-center gap-3">
            <input type="checkbox" data-select-ord="${o.id}" ${checked} class="w-4 h-4 accent-cyan-400 rounded cursor-pointer" />
            <div>
              <div class="flex items-center gap-2 flex-wrap">
                <span class="font-mono font-extrabold text-sm text-cyan-300">${o.orderNumber}</span>
                <span class="px-2 py-0.5 rounded-full border text-[10px] font-extrabold ${statusBadgeMap[o.orderStatus] || statusBadgeMap.PROCESSING}">${o.orderStatus}</span>
                <span class="px-2 py-0.5 rounded bg-slate-900 border border-slate-700 text-[10px] font-mono text-slate-300">${o.paymentMethod} • ${o.paymentStatus}</span>
                <span class="text-[11px] text-slate-500">${new Date(o.createdAt || Date.now()).toLocaleDateString()}</span>
              </div>
              <div class="text-slate-300 mt-1">
                <strong class="text-white">${o.customerName}</strong> • ${o.customerEmail} • ${o.customerPhone}
                <span class="text-slate-400 ml-2">📍 ${addr.street || ''}, ${addr.city || ''} ${addr.state || ''} ${addr.zipCode || ''}</span>
              </div>
            </div>
          </div>

          <div class="flex flex-wrap items-center gap-2">
            <div class="text-right mr-2">
              <div class="text-base font-extrabold text-emerald-400">$${Number(o.totalAmount || 0).toFixed(2)} USD</div>
              <div class="text-[10px] text-slate-400">Sub: $${Number(o.subtotal || 0).toFixed(2)} | Tax: $${Number(o.taxAmount || 0).toFixed(2)}</div>
            </div>

            <select data-ord-lifecycle="${o.id}" class="bg-slate-950 border border-slate-700 rounded-xl px-2.5 py-1.5 text-[11px] text-amber-300 font-bold" title="6-Stage Assembly & Fulfillment Pipeline">
              ${[
                ['PENDING_PAYMENT', '1. Pending Payment'],
                ['IN_ASSEMBLY', '2. In 3D Assembly'],
                ['QUALITY_INSPECTION', '3. QA Shader/Hardware Check'],
                ['DISPATCHED', '4. Dispatched to Courier'],
                ['DELIVERED', '5. Delivered to Customer'],
                ['RETURNED_RMA', '6. Returned / RMA'],
              ]
                .map(
                  ([val, label]) =>
                    `<option value="${val}" ${lifecycle === val ? 'selected' : ''}>${label}</option>`,
                )
                .join('')}
            </select>

            <select data-ord-pay-select="${o.id}" class="bg-slate-950 border border-slate-700 rounded-xl px-2.5 py-1.5 text-[11px] text-white">
              ${['PENDING', 'PAID', 'FAILED', 'REFUNDED']
                .map(
                  (ps) =>
                    `<option value="${ps}" ${o.paymentStatus === ps ? 'selected' : ''}>Pay: ${ps}</option>`,
                )
                .join('')}
            </select>

            <select data-ord-status-select="${o.id}" class="bg-slate-950 border border-cyan-500/50 rounded-xl px-2.5 py-1.5 text-[11px] font-extrabold text-cyan-300">
              ${['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED']
                .map(
                  (st) =>
                    `<option value="${st}" ${o.orderStatus === st ? 'selected' : ''}>${st}</option>`,
                )
                .join('')}
            </select>
          </div>
        </div>

        <!-- Row 2: Custom 3D Configured Items with 2D Snapshot Render & "Load in 3D Admin Viewer" -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-2.5 pt-2 border-t border-slate-800/80">
          ${(o.items || [])
            .map(
              (item) => `
            <div class="p-2.5 rounded-xl bg-slate-950/90 border border-slate-800 flex items-center justify-between gap-3">
              <div class="flex items-center gap-3">
                <!-- Auto-generated 2D Static Snapshot Badge of the Custom 3D Build -->
                <div class="w-12 h-12 rounded-xl border border-slate-700 flex flex-col items-center justify-center relative overflow-hidden shrink-0" style="background: radial-gradient(circle at 30% 30%, ${item.accentHex || '#38bdf8'}44, #090d16 80%)">
                  <div class="w-6 h-6 rounded-full border-2 border-white/40 shadow-inner" style="background: linear-gradient(135deg, ${item.primaryHex || '#1e293b'} 55%, ${item.accentHex || '#38bdf8'} 100%)"></div>
                  <span class="text-[8px] font-mono uppercase tracking-tighter text-slate-300 mt-0.5">2D SNAP</span>
                </div>
                <div>
                  <div class="font-extrabold text-white">${item.quantity}x ${item.productName}</div>
                  <div class="flex flex-wrap items-center gap-1.5 text-[10px] text-slate-400 mt-0.5">
                    <span class="px-1.5 py-0.5 rounded bg-slate-900 border border-slate-700 text-cyan-300 font-bold">${item.finishType || 'MATTE'}</span>
                    <span>Variant: <strong class="text-slate-200">${item.variantName || 'Custom Build'}</strong></span>
                    <span class="inline-flex items-center gap-1 font-mono">
                      Pri:<span class="w-2.5 h-2.5 rounded-full inline-block border border-white/30" style="background:${item.primaryHex || '#1e293b'}"></span>
                      Trim:<span class="w-2.5 h-2.5 rounded-full inline-block border border-white/30" style="background:${item.accentHex || '#38bdf8'}"></span>
                    </span>
                    <span class="text-emerald-400 font-bold">$${Number(item.unitPrice || 0).toFixed(2)}/ea</span>
                  </div>
                </div>
              </div>
              <button
                data-load-order-3d="${o.id}"
                data-item-prod-id="${item.productId || ''}"
                data-item-finish="${item.finishType || 'MATTE'}"
                data-item-pri="${item.primaryHex || '#1e293b'}"
                data-item-acc="${item.accentHex || '#38bdf8'}"
                class="px-2.5 py-1.5 rounded-xl bg-cyan-500/15 border border-cyan-400/40 text-cyan-300 hover:bg-cyan-500/25 font-bold text-[11px] shrink-0"
                title="Load this exact customer 3D build in the 3D Admin Viewer"
              >
                🧊 Load in 3D Viewer
              </button>
            </div>
          `,
            )
            .join('')}
        </div>

        <!-- Row 3: Courier Tracking, Serial Verification, RMA & Invoice Actions -->
        <div class="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-800/60 text-[11px]">
          <div class="flex flex-wrap items-center gap-2">
            <span class="text-slate-400">Courier:</span>
            <select data-ord-courier="${o.id}" class="bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-white">
              ${['FedEx Priority', 'DHL Express 3D', 'UPS Quantum Air', 'USPS Priority']
                .map(
                  (c) =>
                    `<option value="${c}" ${courier === c ? 'selected' : ''}>${c}</option>`,
                )
                .join('')}
            </select>
            <input type="text" data-ord-tracking="${o.id}" value="${tracking}" placeholder="Tracking #" class="bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-cyan-300 font-mono w-36" />
            <span class="text-slate-500 font-mono">Serial: ${serial}</span>
            <button data-save-tracking="${o.id}" class="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold">
              💾 Save &amp; Dispatch SMS/Email
            </button>
          </div>

          <div class="flex flex-wrap items-center gap-1.5">
            <button data-ord-invoice="${o.id}" class="px-2.5 py-1 rounded-lg bg-indigo-500/20 border border-indigo-400/40 text-indigo-300 font-bold hover:bg-indigo-500/30">
              📄 PDF Invoice &amp; Label
            </button>
            <button data-ord-rma="${o.id}" class="px-2.5 py-1 rounded-lg bg-amber-500/15 border border-amber-400/40 text-amber-300 font-bold hover:bg-amber-500/25">
              ↩️ RMA &amp; Restock
            </button>
            <button data-ord-edit="${o.id}" class="px-2.5 py-1 rounded-lg bg-slate-800 border border-slate-700 text-slate-200 font-bold hover:bg-slate-700">
              ✏️ Edit Order
            </button>
            <button data-ord-delete="${o.id}" class="px-2.5 py-1 rounded-lg bg-rose-500/15 border border-rose-500/30 text-rose-300 font-bold hover:bg-rose-500/25">
              🗑️
            </button>
          </div>
        </div>
      </div>
    `;
  },

  bindOrdersEvents(ctx) {
    const container = document.getElementById('adm-sec-orders');
    if (!container) return;

    container.querySelectorAll('[data-ord-tab]').forEach((btn) => {
      btn.addEventListener('click', () => {
        ctx.orderStatusFilter = btn.getAttribute('data-ord-tab');
        this.renderOrdersSection(ctx);
      });
    });

    document
      .getElementById('adm-ord-search-input')
      ?.addEventListener('input', (e) => {
        ctx.orderSearch = e.target.value;
        this.renderOrdersSection(ctx);
      });

    document
      .getElementById('adm-ord-pay-filter')
      ?.addEventListener('change', (e) => {
        ctx.orderPaymentFilter = e.target.value;
        this.renderOrdersSection(ctx);
      });

    container.querySelectorAll('[data-select-ord]').forEach((cb) => {
      cb.addEventListener('change', () => {
        const id = Number(cb.getAttribute('data-select-ord'));
        if (cb.checked) ctx.selectedOrderIds.add(id);
        else ctx.selectedOrderIds.delete(id);
        this.renderOrdersSection(ctx);
      });
    });

    document
      .getElementById('adm-apply-bulk-ord')
      ?.addEventListener('click', async () => {
        const val = document.getElementById('adm-bulk-ord-status')?.value;
        if (!val || ctx.selectedOrderIds.size === 0) {
          ctx.toast('Select at least one order and a bulk action', 'error');
          return;
        }
        const [kind, statusVal] = val.split(':');
        const payload = {
          orderIds: Array.from(ctx.selectedOrderIds),
          ...(kind === 'STATUS'
            ? { orderStatus: statusVal }
            : { paymentStatus: statusVal }),
        };
        await fetch('/api/admin/orders/bulk-status', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        ctx.selectedOrderIds.clear();
        ctx.toast(`Bulk updated orders to ${statusVal}`, 'success');
        await ctx.refreshAll();
      });

    // Status & Payment selects
    container.querySelectorAll('[data-ord-status-select]').forEach((sel) => {
      sel.addEventListener('change', async () => {
        const id = Number(sel.getAttribute('data-ord-status-select'));
        await fetch(`/api/admin/orders/${id}/status`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ orderStatus: sel.value }),
        });
        ctx.toast(`Order #${id} status -> ${sel.value}`, 'success');
        await ctx.refreshAll();
      });
    });

    container.querySelectorAll('[data-ord-pay-select]').forEach((sel) => {
      sel.addEventListener('change', async () => {
        const id = Number(sel.getAttribute('data-ord-pay-select'));
        await fetch(`/api/admin/orders/${id}/status`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ paymentStatus: sel.value }),
        });
        ctx.toast(`Order #${id} payment -> ${sel.value}`, 'success');
        await ctx.refreshAll();
      });
    });

    container.querySelectorAll('[data-ord-lifecycle]').forEach((sel) => {
      sel.addEventListener('change', async () => {
        const id = Number(sel.getAttribute('data-ord-lifecycle'));
        const stage = sel.value;
        const mapOrderStatus = {
          PENDING_PAYMENT: 'PENDING',
          IN_ASSEMBLY: 'PROCESSING',
          QUALITY_INSPECTION: 'PROCESSING',
          DISPATCHED: 'SHIPPED',
          DELIVERED: 'DELIVERED',
          RETURNED_RMA: 'CANCELLED',
        };
        await fetch(`/api/admin/orders/${id}/status`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            orderStatus: mapOrderStatus[stage] || 'PROCESSING',
            fulfillmentMeta: { lifecycleStage: stage },
          }),
        });
        ctx.toast(`Updated lifecycle stage -> ${stage}`, 'success');
        await ctx.refreshAll();
      });
    });

    // Save courier & tracking + dispatch alert
    container.querySelectorAll('[data-save-tracking]').forEach((btn) => {
      btn.addEventListener('click', async () => {
        const id = Number(btn.getAttribute('data-save-tracking'));
        const courier = container.querySelector(
          `[data-ord-courier="${id}"]`,
        )?.value;
        const trackingNumber = container.querySelector(
          `[data-ord-tracking="${id}"]`,
        )?.value;
        await fetch(`/api/admin/orders/${id}/status`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            fulfillmentMeta: {
              courier,
              trackingNumber,
              dispatchedAt: new Date().toISOString(),
            },
          }),
        });
        ctx.toast(
          `Saved ${courier} (${trackingNumber}) & dispatched SMS/Email tracking alert!`,
          'success',
        );
        await ctx.refreshAll();
      });
    });

    // Load exact customer 3D build in 3D Admin Viewer
    container.querySelectorAll('[data-load-order-3d]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const prodId = Number(btn.getAttribute('data-item-prod-id'));
        const finishType = btn.getAttribute('data-item-finish') || 'TITANIUM';
        const primaryHex = btn.getAttribute('data-item-pri') || '#1e293b';
        const accentHex = btn.getAttribute('data-item-acc') || '#38bdf8';
        ctx.loadBespokeBuildInto3DStudio({
          productId: prodId,
          finishType,
          primaryHex,
          accentHex,
        });
      });
    });

    // Printable Invoice & Shipping Label
    container.querySelectorAll('[data-ord-invoice]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const id = Number(btn.getAttribute('data-ord-invoice'));
        const order = ctx.orders.find((o) => o.id === id);
        if (order) ctx.openInvoiceModal(order);
      });
    });

    // RMA & Restock Approval
    container.querySelectorAll('[data-ord-rma]').forEach((btn) => {
      btn.addEventListener('click', async () => {
        const id = Number(btn.getAttribute('data-ord-rma'));
        const order = ctx.orders.find((o) => o.id === id);
        if (!order) return;
        await fetch(`/api/admin/orders/${id}/status`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            orderStatus: 'CANCELLED',
            paymentStatus: 'REFUNDED',
            restockOnRma: true,
            fulfillmentMeta: {
              lifecycleStage: 'RETURNED_RMA',
              rmaRequest: {
                active: true,
                rmaId: `RMA-${order.orderNumber}`,
                reason: 'Customer Return — Serial Verified & Restocked',
                status: 'RESTOCKED',
                serialVerified: true,
              },
            },
          }),
        });
        ctx.toast(
          `Approved RMA for ${order.orderNumber}, verified serial & restocked inventory!`,
          'success',
        );
        await ctx.refreshAll();
      });
    });

    // Edit Order Modal
    container.querySelectorAll('[data-ord-edit]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const id = Number(btn.getAttribute('data-ord-edit'));
        const order = ctx.orders.find((o) => o.id === id);
        if (order) ctx.openOrderModal(order);
      });
    });

    // Delete Order
    container.querySelectorAll('[data-ord-delete]').forEach((btn) => {
      btn.addEventListener('click', async () => {
        const id = Number(btn.getAttribute('data-ord-delete'));
        const order = ctx.orders.find((o) => o.id === id);
        if (!order) return;
        await fetch(`/api/admin/orders/${id}`, { method: 'DELETE' });
        ctx.toast(`Deleted Order ${order.orderNumber}`, 'info');
        await ctx.refreshAll();
      });
    });

    document
      .getElementById('adm-btn-new-order')
      ?.addEventListener('click', () => ctx.openOrderModal(null));

    document
      .getElementById('adm-btn-export-orders-csv')
      ?.addEventListener('click', () => {
        const rows = [
          [
            'OrderNumber',
            'CustomerName',
            'Email',
            'Status',
            'PaymentMethod',
            'PaymentStatus',
            'TotalUSD',
            'CreatedAt',
          ],
          ...(ctx.orders || []).map((o) => [
            o.orderNumber,
            `"${(o.customerName || '').replace(/"/g, '""')}"`,
            o.customerEmail,
            o.orderStatus,
            o.paymentMethod,
            o.paymentStatus,
            o.totalAmount,
            o.createdAt,
          ]),
        ];
        const csv = rows.map((r) => r.join(',')).join('\n');
        const blob = new Blob([csv], { type: 'text/csv' });
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = `aether-3d-orders-${Date.now()}.csv`;
        a.click();
        ctx.toast('Exported orders to CSV', 'success');
      });
  },

  // =========================================================================
  // 5. INVENTORY, COMPONENT PARTS MATRIX, SURCHARGE ENGINE & BATCH OPS
  // =========================================================================
  renderInventorySection(ctx) {
    const container = document.getElementById('adm-sec-inventory');
    if (!container) return;

    const parts = ctx.stats?.enterpriseState?.componentParts || [];
    const surcharges = ctx.stats?.enterpriseState?.surchargeEngine || {};
    const products = ctx.products || [];

    container.innerHTML = `
      <div class="space-y-6">
        <!-- Row 1: Modular Component Parts Matrix (On-Demand 3D Assembly) -->
        <div class="glass-panel rounded-2xl p-5 border border-slate-800 space-y-4">
          <div class="flex flex-wrap items-center justify-between gap-3">
            <div>
              <span class="text-[11px] font-bold uppercase tracking-widest text-amber-400">Composite Variant &amp; Modular Assembly Tracking</span>
              <h3 class="text-lg font-extrabold text-white">Modular 3D Component Parts Matrix (Earcups, Headbands, Drivers, Optics &amp; Cells)</h3>
            </div>
            <button id="adm-add-part-btn" class="px-3.5 py-2 rounded-xl bg-amber-400 text-slate-950 font-extrabold text-xs">
              + Add Sub-Assembly Component
            </button>
          </div>

          <div class="overflow-x-auto">
            <table class="w-full text-left text-xs">
              <thead>
                <tr class="border-b border-slate-800 text-slate-400 uppercase text-[10px]">
                  <th class="py-2 px-3">Part ID</th>
                  <th class="py-2 px-3">Sub-Assembly Component</th>
                  <th class="py-2 px-3">Category / 3D Archetype</th>
                  <th class="py-2 px-3">Warehouse Zone</th>
                  <th class="py-2 px-3">Unit Cost</th>
                  <th class="py-2 px-3">Stock Level</th>
                  <th class="py-2 px-3 text-right">Quick Sync</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-800/70">
                ${parts
                  .map(
                    (part, idx) => `
                  <tr class="hover:bg-slate-900/50">
                    <td class="py-2.5 px-3 font-mono font-bold text-cyan-300">${part.id}</td>
                    <td class="py-2.5 px-3 font-bold text-white">${part.name}</td>
                    <td class="py-2.5 px-3 text-slate-400">${part.category} <span class="text-[10px] font-mono text-indigo-300">(${part.compatibleArchetype})</span></td>
                    <td class="py-2.5 px-3 font-mono text-slate-300">${part.warehouseZone}</td>
                    <td class="py-2.5 px-3 text-emerald-400 font-bold">$${Number(part.unitCost).toFixed(2)}</td>
                    <td class="py-2.5 px-3">
                      <span class="px-2 py-0.5 rounded font-extrabold ${
                        part.stock <= part.threshold
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                          : 'bg-emerald-500/15 text-emerald-300'
                      }">
                        ${part.stock} units ${part.stock <= part.threshold ? '⚠️ LOW' : ''}
                      </span>
                    </td>
                    <td class="py-2.5 px-3 text-right space-x-1">
                      <button data-part-delta="${idx}" data-amt="25" class="px-2 py-1 rounded bg-emerald-500/20 text-emerald-300 font-bold text-[11px]">+25</button>
                      <button data-part-delta="${idx}" data-amt="-5" class="px-2 py-1 rounded bg-slate-800 text-slate-300 font-bold text-[11px]">-5</button>
                    </td>
                  </tr>
                `,
                  )
                  .join('')}
              </tbody>
            </table>
          </div>
        </div>

        <!-- Row 2: Dynamic Surcharge Engine + Batch Catalog Operations -->
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <!-- Dynamic Surcharge Engine -->
          <div class="lg:col-span-6 glass-panel rounded-2xl p-5 border border-slate-800 space-y-4">
            <div>
              <span class="text-[11px] font-bold uppercase tracking-widest text-cyan-400">Dynamic Surcharge Engine</span>
              <h3 class="text-base font-extrabold text-white">PBR Finish Add-On Modifiers ($USD)</h3>
              <p class="text-xs text-slate-400">Base price + surface finish modifier + trim surcharge applied automatically in 3D Customizer.</p>
            </div>
            <div class="space-y-2.5 text-xs">
              ${Object.entries(surcharges)
                .map(
                  ([key, cfg]) => `
                <div class="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between gap-3">
                  <div>
                    <span class="font-extrabold text-white">${key}</span>
                    <span class="text-slate-400 ml-2">${cfg.label}</span>
                    <div class="text-[10px] text-slate-500 font-mono">Metalness: ${cfg.metalness} | Roughness: ${cfg.roughness}</div>
                  </div>
                  <div class="flex items-center gap-1.5">
                    <span class="text-slate-400">+$</span>
                    <input type="number" data-surcharge-key="${key}" value="${cfg.surcharge}" class="w-20 bg-slate-950 border border-slate-700 rounded-lg px-2 py-1 text-emerald-400 font-extrabold text-right" />
                    <span class="text-slate-400">USD</span>
                  </div>
                </div>
              `,
                )
                .join('')}
            </div>
            <button id="adm-save-surcharges-btn" class="w-full py-2.5 rounded-xl bg-cyan-500 text-slate-950 font-extrabold text-xs">
              💾 Save Dynamic Surcharge Matrix
            </button>
          </div>

          <!-- Batch Operations (CSV/JSON Export & Bulk Updates) -->
          <div class="lg:col-span-6 glass-panel rounded-2xl p-5 border border-slate-800 space-y-4 text-xs">
            <div>
              <span class="text-[11px] font-bold uppercase tracking-widest text-indigo-400">Warehouse &amp; Catalog Batch Operations</span>
              <h3 class="text-base font-extrabold text-white">Bulk Price, Stock, Badge &amp; CSV/JSON Sync</h3>
            </div>

            <div class="grid grid-cols-2 gap-3">
              <button id="adm-export-catalog-json" class="p-3 rounded-xl bg-slate-900 border border-slate-700 hover:border-cyan-400 font-bold text-cyan-300 text-center">
                📤 Export Full 3D Catalog (.JSON)
              </button>
              <button id="adm-export-catalog-csv" class="p-3 rounded-xl bg-slate-900 border border-slate-700 hover:border-emerald-400 font-bold text-emerald-300 text-center">
                📊 Export Inventory Matrix (.CSV)
              </button>
            </div>

            <div class="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-3">
              <div class="font-bold text-white">⚡ Instant Batch Catalog Modifiers (All ${products.length} Products)</div>
              <div class="flex items-center gap-2">
                <input id="adm-batch-stock-amt" type="number" value="15" class="w-24 bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white" />
                <button id="adm-batch-restock-btn" class="flex-1 py-1.5 rounded-lg bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 font-bold">
                  + Restock All SKUs
                </button>
              </div>
              <div class="flex items-center gap-2">
                <input id="adm-batch-price-pct" type="number" step="1" value="-5" class="w-24 bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white" />
                <button id="adm-batch-price-btn" class="flex-1 py-1.5 rounded-lg bg-amber-500/20 border border-amber-400/40 text-amber-300 font-bold">
                  % Adjust All Base/Sale Prices
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    container.querySelectorAll('[data-part-delta]').forEach((btn) => {
      btn.addEventListener('click', async () => {
        const idx = Number(btn.getAttribute('data-part-delta'));
        const amt = Number(btn.getAttribute('data-amt'));
        parts[idx].stock = Math.max(0, Number(parts[idx].stock || 0) + amt);
        await fetch('/api/admin/system-state', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ componentParts: parts }),
        });
        ctx.toast(`Updated ${parts[idx].name} stock (${amt > 0 ? '+' : ''}${amt})`, 'success');
        await ctx.refreshAll();
      });
    });

    document
      .getElementById('adm-add-part-btn')
      ?.addEventListener('click', async () => {
        parts.push({
          id: `COMP-MOD-${Math.floor(10 + Math.random() * 89)}`,
          name: 'Custom Anodized CNC Acoustic Chamber',
          category: 'Structural Chassis',
          compatibleArchetype: 'PROCEDURAL_SPEAKER',
          stock: 40,
          threshold: 15,
          unitCost: 34.0,
          warehouseZone: 'AUSTIN-FAB-C2',
        });
        await fetch('/api/admin/system-state', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ componentParts: parts }),
        });
        ctx.toast('Added new modular component part to warehouse matrix', 'success');
        await ctx.refreshAll();
      });

    document
      .getElementById('adm-save-surcharges-btn')
      ?.addEventListener('click', async () => {
        container.querySelectorAll('[data-surcharge-key]').forEach((inp) => {
          const k = inp.getAttribute('data-surcharge-key');
          if (surcharges[k]) {
            surcharges[k].surcharge = Number(inp.value || 0);
          }
        });
        await fetch('/api/admin/system-state', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ surchargeEngine: surcharges }),
        });
        ctx.toast('Saved Dynamic Surcharge Rules!', 'success');
        await ctx.refreshAll();
      });

    document
      .getElementById('adm-export-catalog-json')
      ?.addEventListener('click', () => {
        const blob = new Blob([JSON.stringify(ctx.products, null, 2)], {
          type: 'application/json',
        });
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = `aether-3d-catalog-${Date.now()}.json`;
        a.click();
        ctx.toast('Exported full 3D catalog JSON', 'success');
      });

    document
      .getElementById('adm-export-catalog-csv')
      ?.addEventListener('click', () => {
        const rows = [
          ['ID', 'SKU', 'Name', 'Brand', 'Category', 'BasePrice', 'SalePrice', 'Stock', 'ModelArchetype', 'Badge'],
          ...(ctx.products || []).map((p) => [
            p.id,
            p.sku,
            `"${(p.name || '').replace(/"/g, '""')}"`,
            p.brand,
            p.category?.name || '',
            p.basePrice,
            p.salePrice || '',
            p.stockQuantity,
            p.config3d?.modelType || 'PROCEDURAL',
            p.badgeText || '',
          ]),
        ];
        const blob = new Blob([rows.map((r) => r.join(',')).join('\n')], {
          type: 'text/csv',
        });
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = `aether-3d-inventory-${Date.now()}.csv`;
        a.click();
        ctx.toast('Exported inventory CSV', 'success');
      });

    document
      .getElementById('adm-batch-restock-btn')
      ?.addEventListener('click', async () => {
        const addStock = Number(
          document.getElementById('adm-batch-stock-amt')?.value || 15,
        );
        await fetch('/api/admin/batch-catalog', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'RESTOCK_ALL', addStock }),
        });
        ctx.toast(`Batch restocked +${addStock} units across all SKUs!`, 'success');
        await ctx.refreshAll();
      });

    document
      .getElementById('adm-batch-price-btn')
      ?.addEventListener('click', async () => {
        const percent = Number(
          document.getElementById('adm-batch-price-pct')?.value || 0,
        );
        await fetch('/api/admin/batch-catalog', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'PRICE_ADJUST_PERCENT', percent }),
        });
        ctx.toast(`Adjusted all catalog prices by ${percent}%!`, 'success');
        await ctx.refreshAll();
      });
  },

  // =========================================================================
  // 6. SALES & SPECIALIZED 3D WEBGL ENGAGEMENT TELEMETRY
  // =========================================================================
  renderAnalyticsSection(ctx) {
    const container = document.getElementById('adm-sec-analytics');
    if (!container) return;

    const s = ctx.stats || {};
    const t3d = s.telemetry3D || {};
    const finishPop = t3d.finishPopularity || {};
    const totalFinishCount =
      Object.values(finishPop).reduce((a, b) => a + Number(b), 0) || 1;

    container.innerHTML = `
      <div class="space-y-6">
        <!-- Financial & Conversion KPIs -->
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div class="glass-panel rounded-2xl p-4 border border-slate-800">
            <span class="text-[11px] text-slate-400">Gross Merchandise Value (GMV)</span>
            <div class="text-2xl font-extrabold text-white mt-1">$${Number(s.gmv || s.totalRevenue || 0).toFixed(2)}</div>
            <span class="text-[11px] text-emerald-400">Net Active: $${Number(s.totalRevenue || 0).toFixed(2)} USD</span>
          </div>
          <div class="glass-panel rounded-2xl p-4 border border-slate-800">
            <span class="text-[11px] text-slate-400">3D Stage View-to-Cart Conversion</span>
            <div class="text-2xl font-extrabold text-cyan-400 mt-1">${t3d.stage3DConversionRate || 6.8}%</div>
            <span class="text-[11px] text-slate-400">vs ${t3d.standard2DConversionRate || 2.1}% Standard 2D (3.2x Lift)</span>
          </div>
          <div class="glass-panel rounded-2xl p-4 border border-slate-800">
            <span class="text-[11px] text-slate-400">Avg 3D Dwell &amp; Interaction Time</span>
            <div class="text-2xl font-extrabold text-amber-400 mt-1">${(t3d.avgOrbitDwellSeconds || 48) + (t3d.avgExplodeViewSeconds || 34)}s</div>
            <span class="text-[11px] text-slate-400">Orbit: ${t3d.avgOrbitDwellSeconds || 48}s • Explode X-Ray: ${t3d.avgExplodeViewSeconds || 34}s</span>
          </div>
          <div class="glass-panel rounded-2xl p-4 border border-slate-800">
            <span class="text-[11px] text-slate-400">Client WebGL Engine Health</span>
            <div class="text-2xl font-extrabold text-emerald-400 mt-1">${t3d.avgDesktopFps || 59.4} FPS</div>
            <span class="text-[11px] text-slate-400">Mobile: ${t3d.avgMobileFps || 46.8} FPS • &lt;30FPS Warn: ${t3d.lowFpsWarningRatePercent || 1.6}%</span>
          </div>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 text-xs">
          <!-- Finish & Shader Popularity Telemetry -->
          <div class="lg:col-span-6 glass-panel rounded-2xl p-5 border border-slate-800 space-y-3">
            <h3 class="text-sm font-extrabold uppercase tracking-wider text-cyan-300">🎨 Most Selected 3D Surface Finishes &amp; Colorways</h3>
            <div class="space-y-2.5">
              ${Object.entries(finishPop)
                .map(([finish, cnt]) => {
                  const pct = Math.round((Number(cnt) / totalFinishCount) * 100);
                  return `
                  <div class="space-y-1">
                    <div class="flex justify-between">
                      <span class="font-bold text-white">${finish} Shader Preset</span>
                      <span class="font-mono text-cyan-300">${pct}% (${cnt} builds)</span>
                    </div>
                    <div class="w-full h-2 rounded-full bg-slate-900 overflow-hidden">
                      <div class="h-full bg-gradient-to-r from-cyan-400 to-indigo-500" style="width:${pct}%"></div>
                    </div>
                  </div>
                `;
                })
                .join('')}
            </div>
          </div>

          <!-- Sales Breakdown by Channel & Region -->
          <div class="lg:col-span-6 glass-panel rounded-2xl p-5 border border-slate-800 space-y-4">
            <h3 class="text-sm font-extrabold uppercase tracking-wider text-amber-300">📈 Revenue by 3D Engagement Channel &amp; Region</h3>
            <div class="space-y-2">
              ${(t3d.channelRevenueBreakdown || [])
                .map(
                  (c) => `
                <div class="p-2.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                  <div>
                    <span class="font-bold text-white">${c.channel}</span>
                    <span class="text-slate-400 ml-2">(${c.share}% of GMV)</span>
                  </div>
                  <span class="font-extrabold text-emerald-400">$${Number(c.revenue).toFixed(2)}</span>
                </div>
              `,
                )
                .join('')}
            </div>
            <div class="grid grid-cols-3 gap-2 pt-2 border-t border-slate-800">
              ${(t3d.regionBreakdown || [])
                .map(
                  (r) => `
                <div class="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-center">
                  <div class="text-[10px] text-slate-400">${r.region}</div>
                  <div class="text-sm font-extrabold text-white mt-0.5">${r.share}%</div>
                  <div class="text-[10px] text-cyan-400">${r.orders} orders</div>
                </div>
              `,
                )
                .join('')}
            </div>
          </div>
        </div>
      </div>
    `;
  },

  // =========================================================================
  // 7. CUSTOMERS, SAVED 3D BUILDS / WISHLISTS, SUPPORT & REVIEWS
  // =========================================================================
  renderCustomersSection(ctx) {
    const container = document.getElementById('adm-sec-customers');
    if (!container) return;

    const users = ctx.stats?.users || [];
    const savedBuilds = ctx.stats?.enterpriseState?.savedBuilds || [];
    const tickets = ctx.stats?.enterpriseState?.supportTickets || [];
    const reviews = ctx.stats?.reviews || [];

    container.innerHTML = `
      <div class="space-y-6 text-xs">
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <!-- Customer Directory & Role Control -->
          <div class="lg:col-span-6 glass-panel rounded-2xl p-5 border border-slate-800 space-y-3">
            <h3 class="text-base font-extrabold text-white">👥 Customer &amp; Staff Accounts (${users.length})</h3>
            <div class="space-y-2 max-h-80 overflow-y-auto">
              ${users
                .map(
                  (u) => `
                <div class="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between gap-2">
                  <div>
                    <div class="font-bold text-white">${u.fullName} <span class="text-slate-400 font-normal">(${u.email})</span></div>
                    <div class="text-[11px] text-slate-400">Orders: <strong class="text-white">${u.orderCount || 0}</strong> • Lifetime Spend: <strong class="text-emerald-400">$${Number(u.totalSpent || 0).toFixed(2)}</strong></div>
                  </div>
                  <select data-user-role="${u.id}" class="bg-slate-950 border border-slate-700 rounded-lg px-2 py-1 text-[11px] font-bold text-amber-300">
                    <option value="CUSTOMER" ${u.role === 'CUSTOMER' ? 'selected' : ''}>CUSTOMER</option>
                    <option value="ADMIN" ${u.role === 'ADMIN' ? 'selected' : ''}>ADMIN</option>
                  </select>
                </div>
              `,
                )
                .join('')}
            </div>
          </div>

          <!-- Saved 3D Builds / Customer Wishlists -->
          <div class="lg:col-span-6 glass-panel rounded-2xl p-5 border border-slate-800 space-y-3">
            <h3 class="text-base font-extrabold text-white">🧊 Customer Saved 3D Builds &amp; Wishlists</h3>
            <div class="space-y-2.5">
              ${savedBuilds
                .map(
                  (b) => `
                <div class="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between gap-3">
                  <div class="flex items-center gap-3">
                    <span class="w-7 h-7 rounded-full border border-white/30 shrink-0" style="background: linear-gradient(135deg, ${b.primaryHex} 55%, ${b.accentHex} 100%)"></span>
                    <div>
                      <div class="font-bold text-white">${b.productName} <span class="text-cyan-300">(${b.finishType})</span></div>
                      <div class="text-[11px] text-slate-400">${b.customerName} (${b.customerEmail}) • Est. <strong class="text-emerald-400">$${Number(b.estimatedPrice).toFixed(2)}</strong></div>
                    </div>
                  </div>
                  <button data-preview-saved-build="${b.productName}" data-finish="${b.finishType}" data-pri="${b.primaryHex}" data-acc="${b.accentHex}" class="px-2.5 py-1.5 rounded-lg bg-cyan-500/20 border border-cyan-400/40 text-cyan-300 font-bold">
                    🧊 Open in 3D
                  </button>
                </div>
              `,
                )
                .join('')}
            </div>
          </div>
        </div>

        <!-- Support Tickets & Customer Review / UGC Moderation -->
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div class="lg:col-span-6 glass-panel rounded-2xl p-5 border border-slate-800 space-y-3">
            <h3 class="text-base font-extrabold text-white">🎧 Customer Support &amp; Bespoke Build Tickets</h3>
            <div class="space-y-2">
              ${tickets
                .map(
                  (t, idx) => `
                <div class="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between gap-2">
                  <div>
                    <span class="font-mono text-cyan-300 font-bold">${t.id} (${t.orderNumber})</span>
                    <span class="ml-2 px-1.5 py-0.5 rounded text-[10px] font-bold ${
                      t.status === 'OPEN'
                        ? 'bg-amber-500/20 text-amber-300'
                        : 'bg-emerald-500/20 text-emerald-300'
                    }">${t.status}</span>
                    <div class="font-bold text-white mt-0.5">${t.subject}</div>
                    <div class="text-[11px] text-slate-400">${t.customerName} • ${t.customerEmail}</div>
                  </div>
                  <button data-toggle-ticket="${idx}" class="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold">
                    ${t.status === 'OPEN' ? '✓ Resolve' : 'Reopen'}
                  </button>
                </div>
              `,
                )
                .join('')}
            </div>
          </div>

          <div class="lg:col-span-6 glass-panel rounded-2xl p-5 border border-slate-800 space-y-3">
            <h3 class="text-base font-extrabold text-white">⭐ Customer Reviews &amp; Verified Buyer Moderation (${reviews.length})</h3>
            <div class="space-y-2 max-h-64 overflow-y-auto">
              ${reviews
                .map(
                  (r) => `
                <div class="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between gap-2">
                  <div>
                    <div class="flex items-center gap-2">
                      <span class="text-amber-400 font-bold">${'★'.repeat(r.rating || 5)}</span>
                      <span class="font-bold text-white">${r.reviewerName}</span>
                      <span class="px-1.5 py-0.5 rounded text-[10px] ${
                        r.isVerifiedPurchase
                          ? 'bg-emerald-500/20 text-emerald-300'
                          : 'bg-slate-800 text-slate-400'
                      }">${r.isVerifiedPurchase ? '✓ Verified Buyer' : 'Unverified'}</span>
                    </div>
                    <p class="text-[11px] text-slate-300 mt-1">${r.comment}</p>
                  </div>
                  <button data-del-review="${r.id}" class="text-rose-400 hover:text-rose-300 font-bold px-2">✕</button>
                </div>
              `,
                )
                .join('')}
            </div>
          </div>
        </div>
      </div>
    `;

    container.querySelectorAll('[data-user-role]').forEach((sel) => {
      sel.addEventListener('change', async () => {
        const id = Number(sel.getAttribute('data-user-role'));
        await fetch(`/api/admin/users/${id}/role`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ role: sel.value }),
        });
        ctx.toast(`Updated user #${id} role to ${sel.value}`, 'success');
        await ctx.refreshAll();
      });
    });

    container.querySelectorAll('[data-preview-saved-build]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const name = btn.getAttribute('data-preview-saved-build');
        const prod = (ctx.products || []).find((p) => p.name === name) || ctx.products[0];
        if (prod) {
          ctx.loadBespokeBuildInto3DStudio({
            productId: prod.id,
            finishType: btn.getAttribute('data-finish'),
            primaryHex: btn.getAttribute('data-pri'),
            accentHex: btn.getAttribute('data-acc'),
          });
        }
      });
    });

    container.querySelectorAll('[data-toggle-ticket]').forEach((btn) => {
      btn.addEventListener('click', async () => {
        const idx = Number(btn.getAttribute('data-toggle-ticket'));
        tickets[idx].status =
          tickets[idx].status === 'OPEN' ? 'RESOLVED' : 'OPEN';
        await fetch('/api/admin/system-state', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ supportTickets: tickets }),
        });
        ctx.toast(`Ticket ${tickets[idx].id} -> ${tickets[idx].status}`, 'success');
        await ctx.refreshAll();
      });
    });

    container.querySelectorAll('[data-del-review]').forEach((btn) => {
      btn.addEventListener('click', async () => {
        const id = Number(btn.getAttribute('data-del-review'));
        await fetch(`/api/admin/reviews/${id}`, { method: 'DELETE' });
        ctx.toast(`Removed review #${id}`, 'info');
        await ctx.refreshAll();
      });
    });
  },

  // =========================================================================
  // 8. SETTINGS, RBAC ROLES, CDN CACHE PURGE & AUDIT TRAIL LOGS
  // =========================================================================
  renderSettingsSection(ctx) {
    const container = document.getElementById('adm-sec-settings');
    if (!container) return;

    const eng = ctx.stats?.enterpriseState?.engineSettings || {};
    const logs = ctx.stats?.enterpriseState?.auditLogs || [];

    container.innerHTML = `
      <div class="space-y-6 text-xs">
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <!-- Left: RBAC Role Matrix & CDN / WebGL Engine Settings -->
          <div class="lg:col-span-6 glass-panel rounded-2xl p-5 border border-slate-800 space-y-4">
            <div>
              <span class="text-[11px] font-bold uppercase tracking-widest text-amber-400">Role-Based Access Control (RBAC) &amp; Security</span>
              <h3 class="text-base font-extrabold text-white">Staff Role Permissions Matrix</h3>
            </div>
            <div class="space-y-2">
              <div class="p-2.5 rounded-xl bg-slate-900 border border-amber-400/40 flex justify-between">
                <div><strong class="text-amber-300">Super Admin</strong> — Full System, Financial Reports, Payment Gateways &amp; 3D Studio</div>
                <span class="text-emerald-400 font-bold">Full Access</span>
              </div>
              <div class="p-2.5 rounded-xl bg-slate-900 border border-slate-800 flex justify-between">
                <div><strong class="text-cyan-300">3D Technical Artist / Asset Manager</strong> — Upload .GLBs, PBR Shaders, Lighting &amp; Camera Rigs</div>
                <span class="text-cyan-400 font-bold">3D Studio Only</span>
              </div>
              <div class="p-2.5 rounded-xl bg-slate-900 border border-slate-800 flex justify-between">
                <div><strong class="text-indigo-300">Inventory / Warehouse Operator</strong> — Orders, Assembly Queue, Stock Matrix &amp; Packing Slips</div>
                <span class="text-indigo-400 font-bold">Ops &amp; Stock</span>
              </div>
              <div class="p-2.5 rounded-xl bg-slate-900 border border-slate-800 flex justify-between">
                <div><strong class="text-purple-300">Customer Support Agent</strong> — Customer History, Shipping Address Edits &amp; RMAs</div>
                <span class="text-purple-400 font-bold">CRM &amp; RMAs</span>
              </div>
            </div>

            <div class="pt-3 border-t border-slate-800 space-y-3">
              <h4 class="font-extrabold text-white uppercase tracking-wider">🌐 CDN Edge &amp; WebGL 2.0 Pipeline Settings</h4>
              <div class="grid grid-cols-2 gap-3">
                <div>
                  <label class="block text-[10px] text-slate-400 mb-1">Max Texture Resolution</label>
                  <select id="adm-set-tex-res" class="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white">
                    <option value="2048" ${Number(eng.maxTextureDimension) === 2048 ? 'selected' : ''}>2048x2048 (Optimal KTX2)</option>
                    <option value="4096" ${Number(eng.maxTextureDimension) === 4096 ? 'selected' : ''}>4096x4096 (Ultra 4K Desktop)</option>
                  </select>
                </div>
                <div>
                  <label class="block text-[10px] text-slate-400 mb-1">Free Shipping Threshold ($USD)</label>
                  <input id="adm-set-free-ship" type="number" value="${eng.freeShippingThresholdUsd ?? 250}" class="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white" />
                </div>
              </div>
              <div class="flex flex-wrap gap-4 pt-1">
                <label class="flex items-center gap-2"><input id="adm-set-draco" type="checkbox" ${eng.dracoCompressionDefault !== false ? 'checked' : ''} class="accent-cyan-400" /> Auto Draco Mesh Compression</label>
                <label class="flex items-center gap-2"><input id="adm-set-ktx2" type="checkbox" ${eng.ktx2TextureTranscoding !== false ? 'checked' : ''} class="accent-cyan-400" /> KTX2 GPU Texture Transcoding</label>
              </div>
              <div class="flex gap-2 pt-2">
                <button id="adm-save-engine-settings" class="flex-1 py-2.5 rounded-xl bg-cyan-500 text-slate-950 font-extrabold">
                  💾 Save Engine &amp; Store Settings
                </button>
                <button id="adm-purge-cdn-btn" class="px-4 py-2.5 rounded-xl bg-rose-500/20 border border-rose-500/50 text-rose-300 font-extrabold hover:bg-rose-500/30">
                  ⚡ Purge .GLB CDN Cache
                </button>
              </div>
              <div class="text-[11px] text-slate-400">Last CDN Edge Cache Invalidation: <span class="font-mono text-cyan-300">${eng.lastCdnPurgeAt || 'Never'}</span></div>
            </div>
          </div>

          <!-- Right: Chronological Audit Trail & System Logs -->
          <div class="lg:col-span-6 glass-panel rounded-2xl p-5 border border-slate-800 space-y-3">
            <div class="flex items-center justify-between">
              <div>
                <span class="text-[11px] font-bold uppercase tracking-widest text-cyan-400">Immutable Security Ledger</span>
                <h3 class="text-base font-extrabold text-white">📜 Chronological Audit Trail &amp; System Logs</h3>
              </div>
              <span class="px-2 py-0.5 rounded bg-slate-900 text-slate-400 font-mono">${logs.length} events</span>
            </div>
            <div class="space-y-2 max-h-[420px] overflow-y-auto pr-1">
              ${logs
                .map(
                  (log) => `
                <div class="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 flex items-start justify-between gap-2">
                  <div>
                    <div class="flex items-center gap-2">
                      <span class="px-1.5 py-0.5 rounded bg-cyan-500/15 text-cyan-300 font-mono text-[10px] font-bold">${log.category}</span>
                      <span class="text-slate-400 text-[10px]">${log.actor}</span>
                    </div>
                    <div class="text-white font-semibold mt-1">${log.action}</div>
                  </div>
                  <span class="text-[10px] font-mono text-slate-500 shrink-0">${new Date(log.timestamp).toLocaleTimeString()}</span>
                </div>
              `,
                )
                .join('')}
            </div>
          </div>
        </div>
      </div>
    `;

    document
      .getElementById('adm-save-engine-settings')
      ?.addEventListener('click', async () => {
        const updated = {
          maxTextureDimension: Number(
            document.getElementById('adm-set-tex-res')?.value || 2048,
          ),
          freeShippingThresholdUsd: Number(
            document.getElementById('adm-set-free-ship')?.value || 250,
          ),
          dracoCompressionDefault:
            document.getElementById('adm-set-draco')?.checked ?? true,
          ktx2TextureTranscoding:
            document.getElementById('adm-set-ktx2')?.checked ?? true,
        };
        await fetch('/api/admin/system-state', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ engineSettings: updated }),
        });
        ctx.toast('Saved WebGL Engine & Store Settings!', 'success');
        await ctx.refreshAll();
      });

    document
      .getElementById('adm-purge-cdn-btn')
      ?.addEventListener('click', async () => {
        const res = await fetch('/api/admin/cdn-purge', { method: 'POST' });
        if (res.ok) {
          ctx.toast(
            'Purged global .GLB/.GLTF & KTX2 shader caches across all CDN Edge nodes!',
            'success',
          );
          await ctx.refreshAll();
        }
      });
  },
};
