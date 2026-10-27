# AETHER 3D — Interactive 3D Electronics E-Commerce Platform

An immersive, full-stack **3D Interactive Electronics E-Commerce Website** built with **NestJS**, **MySQL (XAMPP)**, **Tailwind CSS**, **Vanilla JavaScript (ES6+)**, and **Three.js (WebGL 2.0)**.

Shoppers can inspect flagship consumer electronics (**Headphones, Smartphones, Smartwatches, Wireless Earbuds, and 360° Spatial Speakers**) in real-time 360° 3D, customize surface finishes (**Matte, Titanium, Metallic, Cyber Neon, Glossy**), click 3D feature hotspots, slide an **Exploded X-Ray Disassembly View**, and purchase their bespoke 3D configuration in **USD (`$`)**.

---

## ✨ Key Features

### 1. Interactive 3D Storefront & Customizer Studio (`Three.js` + `WebGL`)
- **360° Damped Orbit & Zoom Controls**: Smooth drag-to-rotate, scroll-to-zoom, camera reset, and auto-spin toggle.
- **Real-Time PBR Surface Finish Customizer**: Switch between **Matte**, **Grade-5 Titanium**, **Brushed Metallic**, **Cyber Neon**, and **Glossy Ceramic** shaders with custom Primary, Secondary, and Accent/Neon hex color pickers.
- **Exploded / X-Ray Disassembly Slider (`0%`–`100%`)**: Separate external shells and internal hardware components (45mm beryllium drivers, copper voice coils, vapor chambers, 3nm chipsets, neodymium subwoofers) in real time.
- **Interactive 3D Feature Hotspots**: Clickable 3D callout pins projected onto the mesh that smoothly fly the camera to focus on specific hardware components.
- **Studio Lighting Presets**: Instant switching between **Studio Soft**, **Cyber Neon**, **Dark Obsidian**, and **Warm Gold** lighting rigs.
- **Hybrid 3D Model Engine**:
  - Includes **5 built-in multi-part procedural 3D electronics generators** (`PROCEDURAL_HEADPHONE`, `PROCEDURAL_PHONE`, `PROCEDURAL_WATCH`, `PROCEDURAL_EARBUDS`, `PROCEDURAL_SPEAKER`) ready out of the box.
  - Supports **custom `.glb` / `.gltf` 3D model files** (with Draco compression support via `GLTFLoader` + `DRACOLoader`).

### 2. Full-Featured Admin Command Center & `.GLB` 3D Studio
Click **`⚡ Admin & .GLB Studio`** in the top navigation bar to access the 5-tab Admin Command Center:
1. **`📊 Analytics & Stock`**:
   - Live KPIs: **Total Revenue ($USD)**, **Total Orders**, **Active/Pending Orders**, **Total 3D Products**, **★ Featured Hero Count**, **Custom `.GLB` Models Count**, and **Registered Users**.
   - **Low-Stock Inventory Alert Panel** (`≤ 15` units) with one-click **`+15 Restock`** buttons.
   - **Registered Store Accounts Directory** (Admins & Customers).
2. **`➕ Add / Edit 3D Product & .GLB`**:
   - Create new 3D electronics products or edit existing products.
   - **★ Featured on 3D Hero Stage Toggle**: Promote any product directly to the top interactive 3D Hero Showroom tabs and featured catalog badge.
   - **Drag-and-Drop `.GLB` / `.GLTF` 3D Model Uploader**: Upload custom `.glb`/`.gltf` files (up to `50MB`, stored in `public/uploads/models/`) OR select one of the 5 built-in 3D procedural generators.
   - **Live 3D Admin Preview Viewport**: Test your uploaded `.glb` file or 3D archetype, scale (`0.5x`–`1.8x`), surface finish, colors, lighting preset, and exploded view live inside the Admin panel before saving to MySQL.
   - **Dynamic Technical Specifications Builder**: Add or remove custom hardware specification key-value rows.
3. **`🎛️ Catalog, Variants & Hotspots`**:
   - Search and filter all products.
   - One-click **`★ Featured` / `☆ Standard`** toggle on any product.
   - One-click **`📁 Upload .GLB`** button on any existing product card to attach or replace its 3D `.glb` model file.
   - **Color & PBR Finish Variants Manager**: Add or delete color/finish variants (`MATTE`, `TITANIUM`, `METALLIC`, `NEON`, `GLOSSY`) with custom hex codes and `+$USD` price modifiers.
   - **3D Feature Hotspots Manager**: Pin new 3D interactive callouts at `(posX, posY, posZ)` or remove existing pins.
4. **`📦 Orders & Fulfillment`**:
   - Filter orders by status (`ALL`, `PENDING`, `PROCESSING`, `SHIPPED`, `DELIVERED`, `CANCELLED`).
   - Update **Order Status** and **Payment Status** (`PENDING`, `PAID`, `FAILED`, `REFUNDED`) in real time.
   - Inspect each order item's exact customized 3D Finish and color swatch.
5. **`🗂️ Categories`**:
   - Create new electronics categories (e.g., *Gaming Laptops*, *VR Headsets*, *Drones*) or delete existing ones.

### 3. USD (`$`) Cart, Checkout & Live Order Tracking
- Slide-over cart preserves the exact 3D finish (`MATTE`, `TITANIUM`, `NEON`, etc.) and color swatches configured by the shopper.
- Supports **Stripe / Credit Card (Simulated)** and **Cash on Delivery (COD)** in **USD (`$`)** with automatic shipping (`FREE` over `$250`) and tax calculation.
- Instant **Order Tracking Modal** lookup by Order Number (e.g., `ORD-2026-1001`).

---

## 🛠️ Tech Stack

| Layer | Technology |
| :--- | :--- |
| **Backend Framework** | NestJS 10 (TypeScript, Modular Architecture) |
| **Database & ORM** | MySQL / MariaDB (`127.0.0.1:3306` via XAMPP) + TypeORM (`mysql2`) |
| **File Upload** | Multer (`@nestjs/platform-express`) for `.glb` / `.gltf` 3D assets |
| **Authentication** | JWT (`@nestjs/jwt`) + `bcryptjs` password hashing |
| **Frontend Styling** | Tailwind CSS + Custom Glassmorphism & WebGL HUD CSS |
| **3D Engine** | Three.js (`v0.162.0`) + `OrbitControls` + `GLTFLoader` + `DRACOLoader` |

---

## 🚀 Quick Start & Installation

### 1. Prerequisites
- **Node.js** (v18+ recommended)
- **XAMPP MySQL** running on `127.0.0.1:3306`

### 2. Environment Variables (`.env`)
The `.env` file in the root directory is pre-configured for default XAMPP MySQL:
```env
PORT=3000
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=root
DB_PASS=
DB_NAME=3d_electronics_db
JWT_SECRET=super_secret_3d_electronics_jwt_key_2026
```

### 3. Install, Build & Run
```bash
# 1. Install dependencies
npm install

# 2. Build the NestJS application
npm run build

# 3. Start the production server (or use npm run start:dev for watch mode)
npm run start:prod
```
> On startup, the server automatically creates the `3d_electronics_db` database if it does not exist, synchronizes all 9 tables, and seeds the initial 8 flagship 3D products, 5 categories, variants, hotspots, users, and demo order.

### 4. Open in Browser
- **Storefront & 3D Studio**: `http://localhost:3000`

### 5. Full SQL Database Backup & Restore
A complete SQL dump (schema + all seeded 3D products, variants, hotspots, categories, users, and orders) is saved in:
- **SQL Backup File**: [`database-backup/3d_electronics_db_backup.sql`](file:///d:/xampp/htdocs/3dweb/database-backup/3d_electronics_db_backup.sql)

```bash
# Take a fresh SQL backup anytime:
npm run db:backup

# Restore from the SQL backup file via XAMPP MySQL CLI:
d:/xampp/mysql/bin/mysql.exe -h 127.0.0.1 -P 3306 -u root < database-backup/3d_electronics_db_backup.sql
```
*(You can also import `database-backup/3d_electronics_db_backup.sql` directly in XAMPP **phpMyAdmin**).*

---

## 🔐 Default Credentials & Demo Data

| Role / Feature | Credentials / Identifier |
| :--- | :--- |
| **Admin Account** | Email: `admin@3dstore.com` • Password: `admin123` |
| **Customer Account** | Email: `alex@example.com` • Password: `customer123` |
| **Demo Order Tracking ID** | `ORD-2026-1001` |

---

## 📡 REST API Endpoints Reference

### Public Storefront & Auth APIs
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/categories` | List all electronics categories |
| `GET` | `/api/products` | List active 3D products (supports `category`, `search`, `featured`, `sort`) |
| `GET` | `/api/products/:identifier` | Get full 3D product details by ID or slug (`config3d`, `variants`, `hotspots`, `reviews`) |
| `POST` | `/api/products/:id/reviews` | Submit a customer product review |
| `POST` | `/api/orders` | Create a new USD order (`STRIPE_CARD` or `COD`) |
| `GET` | `/api/orders/track/:orderNumber` | Track order status and 3D items by Order ID |
| `POST` | `/api/auth/login` | Authenticate user and receive JWT |
| `POST` | `/api/auth/register` | Register a new customer account |

### Admin Command Center & `.GLB` Studio APIs
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/admin/stats` | Store KPIs, revenue, low-stock alerts, custom `.glb` count, and users list |
| `GET` | `/api/admin/products` | List all products (including unpublished) with full 3D configs |
| `POST` | `/api/admin/products` | Create a new 3D product with 3D config, specs, and default variants |
| `PUT` | `/api/admin/products/:id` | Update full product details, specs, and 3D config |
| `PATCH` | `/api/admin/products/:id/quick` | Quick-toggle `isFeatured`, `isActive`, or restock `stockQuantity` |
| `DELETE` | `/api/admin/products/:id` | Delete a product |
| `POST` | `/api/admin/upload-glb` | Upload a standalone `.glb` / `.gltf` 3D model file (`multipart/form-data`, field: `file`) |
| `POST` | `/api/admin/products/:id/upload-glb` | Upload and attach a `.glb` / `.gltf` 3D file directly to a product |
| `POST` | `/api/admin/products/:id/variants` | Add a new Color & PBR Finish variant to a product |
| `DELETE` | `/api/admin/variants/:variantId` | Delete a product variant |
| `POST` | `/api/admin/products/:id/hotspots` | Pin a new 3D feature hotspot `(posX, posY, posZ)` to a product |
| `DELETE` | `/api/admin/hotspots/:hotspotId` | Delete a 3D hotspot pin |
| `GET` | `/api/admin/orders` | List all customer orders |
| `PUT` | `/api/admin/orders/:id/status` | Update `orderStatus` or `paymentStatus` |
| `POST` | `/api/admin/categories` | Create a new electronics category |
| `DELETE` | `/api/admin/categories/:id` | Delete a category |

---

## 📂 Project Structure

```text
d:\xampp\htdocs\3dweb\
├── README.md                          # Project documentation & Admin guide
├── IMPLEMENTATION_PLAN.md             # Architecture & schema specification
├── package.json                       # NestJS & TypeORM dependencies
├── .env                               # XAMPP MySQL & JWT configuration
├── src/
│   ├── main.ts                        # Auto-DB creation + NestJS bootstrap
│   ├── app.module.ts                  # Root module + TypeORM + ServeStatic
│   ├── database/
│   │   ├── entities/                  # 9 MySQL TypeORM entities
│   │   ├── database.module.ts         # Entity registration
│   │   └── seed.service.ts            # Initial 3D catalog, variants, hotspots & admin seed
│   └── modules/
│       ├── auth/                      # JWT authentication & guards
│       ├── products/                  # Catalog, filtering, search & reviews
│       ├── orders/                    # USD checkout & order tracking
│       └── admin/                     # Admin KPIs, .GLB Multer upload, CRUD
└── public/
    ├── index.html                     # Storefront, 3D Studio & 5-Tab Admin Command Center
    ├── css/custom.css                 # Glassmorphism & 3D stage styling
    ├── js/
    │   ├── app.js                     # Storefront + Admin Studio controller
    │   └── three/
    │       ├── SceneManager.js        # WebGLRenderer, OrbitControls, PBR Customizer, Hotspots
    │       └── ElectronicsBuilder.js  # 5 Procedural 3D generators + GLTF/Draco .GLB loader
    └── uploads/models/                # Uploaded .glb / .gltf 3D model files
```
