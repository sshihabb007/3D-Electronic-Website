# AETHER 3D — Interactive 3D Electronics E-Commerce Platform

An immersive, full-stack **3D Interactive Electronics E-Commerce Website** built with **NestJS**, **MySQL (XAMPP)**, **Tailwind CSS**, **Vanilla JavaScript (ES6+)**, and **Three.js (WebGL 2.0)**.

Shoppers can inspect flagship consumer electronics (**Headphones, Smartphones, Smartwatches, Wireless Earbuds, and 360° Spatial Speakers**) in real-time 360° 3D, customize surface finishes (**Matte, Titanium, Metallic, Cyber Neon, Glossy**), click 3D feature hotspots, slide an **Exploded X-Ray Disassembly View**, and purchase their bespoke 3D configuration in **USD (`$`)**.

---

## 🔐 Login Details & Demo Credentials

### 1. Website User & Admin Login Credentials
Click the **`Sign In`** button in the top-right navigation bar of `http://localhost:3000` to log in with either pre-seeded account:

| Account Role | Email Address | Password | Access & Capabilities |
| :--- | :--- | :--- | :--- |
| **Administrator (`ADMIN`)** | `admin@3dstore.com` | `admin123` | Full access to the **5-Tab Admin Command Center & `.GLB` 3D Studio**, KPI analytics, low-stock restocking, adding/editing 3D products, uploading `.glb`/`.gltf` 3D models, managing variants/hotspots, and updating customer order statuses. |
| **Customer (`CUSTOMER`)** | `alex@example.com` | `customer123` | Pre-filled customer profile & shipping address, 3D product customization, USD checkout (`Stripe/Card` or `Cash on Delivery`), order tracking, and submitting verified buyer reviews. |

> **Tip**: You can also register a brand-new account anytime by clicking **`Sign In`** → **`Need an account? Register here`**, or open the Admin Studio directly via the **`⚡ Admin & .GLB Studio`** button in the top navigation bar.

### 2. Demo Order Tracking ID
Click **`Track Order`** in the top navigation bar and enter:
- **Order Tracking ID**: `ORD-2026-1001`

### 3. Default MySQL Database Credentials (XAMPP)
| Parameter | Default Value |
| :--- | :--- |
| **Host** | `127.0.0.1` (`localhost`) |
| **Port** | `3306` |
| **Database Name** | `3d_electronics_db` |
| **Username** | `root` |
| **Password** | *(empty / blank)* |
| **phpMyAdmin URL** | `http://localhost/phpmyadmin` |

---

## 🛠️ Complete Installation & Setup Guide

Follow these step-by-step instructions to install and run the project on any machine.

### Prerequisites
1. **Node.js** (`v18.x` or newer) & **npm** — [Download Node.js](https://nodejs.org/)
2. **XAMPP** (with **MySQL / MariaDB** on port `3306`) — [Download XAMPP](https://www.apachefriends.org/)
3. **Git** — [Download Git](https://git-scm.com/)

---

### Step 1: Clone the Repository
Place the project inside `d:\xampp\htdocs\3dweb` (or any directory of your choice):
```bash
git clone https://github.com/sshihabb007/3D-Electronic-Website.git 3dweb
cd 3dweb
```

---

### Step 2: Start XAMPP MySQL Server
You can start MySQL using **either** the XAMPP Control Panel **or** PowerShell/Command Prompt:

- **Option A — Using XAMPP Control Panel**:
  1. Open **XAMPP Control Panel**.
  2. Click **Start** next to **MySQL** (and **Apache** if you want to use phpMyAdmin).
  3. Verify MySQL is running on port `3306`.

- **Option B — Using PowerShell / Terminal**:
  ```powershell
  & "d:\xampp\mysql\bin\mysqld.exe" --defaults-file="d:\xampp\mysql\bin\my.ini" --console
  ```

---

### Step 3: Configure Environment Variables (`.env`)
Verify that the `.env` file in the project root matches your MySQL settings:
```env
PORT=3000
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=root
DB_PASS=
DB_NAME=3d_electronics_db
JWT_SECRET=super_secret_3d_electronics_jwt_key_2026
```
*(If your MySQL `root` user has a password or uses a custom port, update `DB_PASS` or `DB_PORT` in `.env` accordingly.)*

---

### Step 4: Database Setup (Automatic OR Manual SQL Import)

You have **two ways** to set up the `3d_electronics_db` MySQL database:

#### Method A: Automatic Setup (Recommended — Zero Manual Steps)
When you start the NestJS server in Step 6, `src/main.ts` and `src/database/seed.service.ts` will **automatically**:
1. Connect to MySQL and run `CREATE DATABASE IF NOT EXISTS 3d_electronics_db`.
2. Create all 9 database tables (`users`, `categories`, `products`, `product_3d_configs`, `product_variants`, `product_hotspots`, `orders`, `order_items`, `reviews`).
3. Seed all 8 flagship 3D products, 5 categories, color/finish variants, 3D hotspots, Admin & Customer accounts, and demo order `ORD-2026-1001`.

#### Method B: Manual SQL Import from Backup (`database-backup/3d_electronics_db_backup.sql`)
If you prefer to import the full SQL dump manually:
- **Via phpMyAdmin**:
  1. Open `http://localhost/phpmyadmin`
  2. Click **Import** → Choose file `database-backup/3d_electronics_db_backup.sql` → Click **Import / Go**.
- **Via Command Line**:
  ```bash
  d:/xampp/mysql/bin/mysql.exe -h 127.0.0.1 -P 3306 -u root < database-backup/3d_electronics_db_backup.sql
  ```

---

### Step 5: Install NPM Dependencies & Build
```bash
# Install all backend & TypeScript packages
npm install

# Compile NestJS TypeScript source into dist/
npm run build
```

---

### Step 6: Run the Application
```bash
# Start in Production mode
npm run start:prod

# OR start in Development Watch mode (auto-reloads on code changes)
npm run start:dev
```

Once started, you will see:
```text
[DatabaseInit] Verified MySQL database '3d_electronics_db' on 127.0.0.1:3306
[Bootstrap] 🚀 3D Interactive Electronics E-Commerce Server running on http://localhost:3000
```

Open **`http://localhost:3000`** in your browser!

---

## ✨ Key Platform Features

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
├── README.md                          # Login credentials, Setup guide & API reference
├── IMPLEMENTATION_PLAN.md             # Architecture & schema specification
├── database-backup/
│   └── 3d_electronics_db_backup.sql   # Full MySQL schema + seeded data dump
├── package.json                       # NestJS, TypeORM & DB backup scripts
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
