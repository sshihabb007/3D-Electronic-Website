-- MariaDB dump 10.19  Distrib 10.4.32-MariaDB, for Win64 (AMD64)
--
-- Host: 127.0.0.1    Database: 3d_electronics_db
-- ------------------------------------------------------
-- Server version	10.4.32-MariaDB

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Current Database: `3d_electronics_db`
--

/*!40000 DROP DATABASE IF EXISTS `3d_electronics_db`*/;

CREATE DATABASE /*!32312 IF NOT EXISTS*/ `3d_electronics_db` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci */;

USE `3d_electronics_db`;

--
-- Table structure for table `categories`
--

DROP TABLE IF EXISTS `categories`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `categories` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `slug` varchar(120) NOT NULL,
  `icon` varchar(80) NOT NULL DEFAULT 'cube',
  `description` text DEFAULT NULL,
  `displayOrder` int(11) NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`),
  UNIQUE KEY `IDX_420d9f679d41281f282f5bc7d0` (`slug`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `categories`
--

LOCK TABLES `categories` WRITE;
/*!40000 ALTER TABLE `categories` DISABLE KEYS */;
INSERT INTO `categories` VALUES (1,'Headphones','headphones','headphones','Studio-grade over-ear ANC headphones with spatial audio and custom 3D finishes.',1),(2,'Smartphones','smartphones','smartphone','Flagship 5G smartphones crafted with aerospace titanium and pro camera systems.',2),(3,'Smartwatches','smartwatches','watch','Precision biometric smartwatches with sapphire crystal AMOLED displays.',3),(4,'Wireless Earbuds','earbuds','earbuds','Ultra-low latency true wireless earbuds with adaptive noise cancellation.',4),(5,'Spatial Speakers','speakers','speaker','360-degree omnidirectional acoustic speakers with reactive ambient lighting.',5),(6,'Gaming Laptops','laptops','laptop','Ultra-thin OLED creator workstations and liquid-cooled gaming laptops.',6),(7,'VR & Spatial Headsets','vr-headsets','vr','Dual 4K micro-OLED spatial computers and mixed-reality headsets.',7),(8,'Cameras & Gaming','cameras-gaming','camera','8K full-frame mirrorless cinema cameras and OLED handheld gaming consoles.',8);
/*!40000 ALTER TABLE `categories` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `order_items`
--

DROP TABLE IF EXISTS `order_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `order_items` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `orderId` int(11) NOT NULL,
  `productId` int(11) DEFAULT NULL,
  `productName` varchar(160) NOT NULL,
  `variantName` varchar(100) DEFAULT NULL,
  `finishType` varchar(40) NOT NULL DEFAULT 'MATTE',
  `primaryHex` varchar(20) NOT NULL DEFAULT '#1e293b',
  `accentHex` varchar(20) NOT NULL DEFAULT '#38bdf8',
  `quantity` int(11) NOT NULL DEFAULT 1,
  `unitPrice` decimal(10,2) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `FK_f1d359a55923bb45b057fbdab0d` (`orderId`),
  KEY `FK_cdb99c05982d5191ac8465ac010` (`productId`),
  CONSTRAINT `FK_cdb99c05982d5191ac8465ac010` FOREIGN KEY (`productId`) REFERENCES `products` (`id`) ON DELETE SET NULL ON UPDATE NO ACTION,
  CONSTRAINT `FK_f1d359a55923bb45b057fbdab0d` FOREIGN KEY (`orderId`) REFERENCES `orders` (`id`) ON DELETE CASCADE ON UPDATE NO ACTION
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `order_items`
--

LOCK TABLES `order_items` WRITE;
/*!40000 ALTER TABLE `order_items` DISABLE KEYS */;
INSERT INTO `order_items` VALUES (1,1,1,'Aether Pro Max ANC','Titanium Silver Alloy','TITANIUM','#cbd5e1','#6366f1',1,349.00),(2,2,2,'Nova X1 Ultra 5G','Cyber Neon Pulse','NEON','#0f172a','#00f5d4',1,1099.00),(3,2,3,'Chronos Titan S9 Ultra','Obsidian Matte Black','MATTE','#18181b','#38bdf8',1,399.00),(4,3,6,'HyperWave Cyber Pro Headset','Forged Titanium Pro','TITANIUM','#94a3b8','#38bdf8',1,2399.00),(5,4,1,'Aether Pro Max ANC','Signature Matte Stealth','MATTE','#18181b','#38bdf8',2,349.00),(6,5,9,'AetherBook Pro 16 M4 Max','Spatial Glass Edition','GLOSSY','#1e293b','#a855f7',1,1799.00),(7,6,3,'Chronos Titan S9 Ultra','Chrome Mirror Finish','METALLIC','#e2e8f0','#38bdf8',1,399.00);
/*!40000 ALTER TABLE `order_items` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `orders`
--

DROP TABLE IF EXISTS `orders`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `orders` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `orderNumber` varchar(60) NOT NULL,
  `userId` int(11) DEFAULT NULL,
  `customerName` varchar(120) NOT NULL,
  `customerEmail` varchar(150) NOT NULL,
  `customerPhone` varchar(50) NOT NULL,
  `shippingAddress` text NOT NULL,
  `subtotal` decimal(10,2) NOT NULL,
  `shippingCost` decimal(10,2) NOT NULL DEFAULT 0.00,
  `taxAmount` decimal(10,2) NOT NULL DEFAULT 0.00,
  `totalAmount` decimal(10,2) NOT NULL,
  `paymentMethod` varchar(40) NOT NULL DEFAULT 'STRIPE_CARD',
  `paymentStatus` varchar(40) NOT NULL DEFAULT 'PAID',
  `orderStatus` varchar(40) NOT NULL DEFAULT 'PROCESSING',
  `createdAt` datetime(6) NOT NULL DEFAULT current_timestamp(6),
  `fulfillmentMeta` text DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `IDX_59b0c3b34ea0fa5562342f2414` (`orderNumber`),
  KEY `FK_151b79a83ba240b0cb31b2302d1` (`userId`),
  CONSTRAINT `FK_151b79a83ba240b0cb31b2302d1` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE NO ACTION
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `orders`
--

LOCK TABLES `orders` WRITE;
/*!40000 ALTER TABLE `orders` DISABLE KEYS */;
INSERT INTO `orders` VALUES (1,'ORD-2026-1001',2,'Alex Mercer','alex@example.com','+1 (555) 234-5678','{\"street\":\"1200 Tech Plaza Apt 4B\",\"city\":\"Austin\",\"state\":\"TX\",\"zipCode\":\"78701\",\"country\":\"United States\"}',349.00,0.00,27.92,376.92,'STRIPE_CARD','PAID','SHIPPED','2026-10-27 20:24:44.029416',NULL),(2,'ORD-2026-1002',2,'Elena Vance','elena.vance@cybermail.io','+1 (415) 890-4412','{\"street\":\"742 Evergreen Innovation Blvd\",\"city\":\"San Francisco\",\"state\":\"CA\",\"zipCode\":\"94107\",\"country\":\"United States\"}',1498.00,0.00,119.84,1617.84,'STRIPE_CARD','PAID','DELIVERED','2026-10-27 20:49:32.722552',NULL),(3,'ORD-2026-1003',NULL,'Marcus Sterling','m.sterling@quantumlabs.org','+1 (212) 665-9901','{\"street\":\"88 Madison Ave Suite 1900\",\"city\":\"New York\",\"state\":\"NY\",\"zipCode\":\"10016\",\"country\":\"United States\"}',2399.00,0.00,191.92,2590.92,'STRIPE_CARD','PAID','PROCESSING','2026-10-27 20:49:32.736159',NULL),(4,'ORD-2026-1004',NULL,'Sophia Chen','sophia.chen@designstudio.co','+1 (206) 442-1820','{\"street\":\"450 Pine Street Apt 1202\",\"city\":\"Seattle\",\"state\":\"WA\",\"zipCode\":\"98101\",\"country\":\"United States\"}',698.00,15.00,55.84,768.84,'COD','PENDING','PENDING','2026-10-27 20:49:32.744634',NULL),(5,'ORD-2026-1005',NULL,'Liam O’Connor','liam.oconnor@emeraldtech.ie','+1 (312) 778-3092','{\"street\":\"233 S Wacker Dr Floor 42\",\"city\":\"Chicago\",\"state\":\"IL\",\"zipCode\":\"60606\",\"country\":\"United States\"}',1799.00,0.00,143.92,1942.92,'STRIPE_CARD','PAID','PENDING','2026-10-27 20:49:32.750692',NULL),(6,'ORD-2026-1006',NULL,'Devon Brooks','devon.brooks@mail.com','+1 (305) 912-4011','{\"street\":\"101 Ocean Drive\",\"city\":\"Miami\",\"state\":\"FL\",\"zipCode\":\"33139\",\"country\":\"United States\"}',399.00,15.00,31.92,445.92,'STRIPE_CARD','REFUNDED','CANCELLED','2026-10-27 20:49:32.756790',NULL);
/*!40000 ALTER TABLE `orders` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `product_3d_configs`
--

DROP TABLE IF EXISTS `product_3d_configs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `product_3d_configs` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `productId` int(11) NOT NULL,
  `modelType` varchar(50) NOT NULL DEFAULT 'PROCEDURAL_HEADPHONE',
  `glbFileUrl` varchar(255) DEFAULT NULL,
  `defaultScale` float NOT NULL DEFAULT 1,
  `cameraPosition` text DEFAULT NULL,
  `defaultEnvPreset` varchar(40) NOT NULL DEFAULT 'studio',
  `autoRotate` tinyint(4) NOT NULL DEFAULT 1,
  `supportsExplodeView` tinyint(4) NOT NULL DEFAULT 1,
  `pipelineConfig` text DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `REL_673ef5b015f327293bcfbaddaf` (`productId`),
  CONSTRAINT `FK_673ef5b015f327293bcfbaddaf0` FOREIGN KEY (`productId`) REFERENCES `products` (`id`) ON DELETE CASCADE ON UPDATE NO ACTION
) ENGINE=InnoDB AUTO_INCREMENT=21 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `product_3d_configs`
--

LOCK TABLES `product_3d_configs` WRITE;
/*!40000 ALTER TABLE `product_3d_configs` DISABLE KEYS */;
INSERT INTO `product_3d_configs` VALUES (1,1,'PROCEDURAL_HEADPHONE',NULL,1,'{\"x\":2.3,\"y\":1.1,\"z\":2.8}','studio',1,1,NULL),(2,2,'PROCEDURAL_PHONE',NULL,1.05,'{\"x\":1.9,\"y\":0.8,\"z\":2.6}','studio',1,1,NULL),(3,3,'PROCEDURAL_WATCH',NULL,1.1,'{\"x\":2,\"y\":1.2,\"z\":2.4}','studio',1,1,NULL),(4,4,'PROCEDURAL_EARBUDS',NULL,1.1,'{\"x\":2.1,\"y\":1.2,\"z\":2.5}','studio',1,1,NULL),(5,5,'PROCEDURAL_SPEAKER',NULL,1,'{\"x\":2.2,\"y\":1.3,\"z\":2.6}','neon',1,1,NULL),(6,6,'PROCEDURAL_HEADPHONE',NULL,1,'{\"x\":2.3,\"y\":1,\"z\":2.7}','neon',1,1,NULL),(7,7,'PROCEDURAL_PHONE',NULL,1,'{\"x\":1.9,\"y\":0.8,\"z\":2.5}','dark',1,1,NULL),(8,8,'PROCEDURAL_WATCH',NULL,1.05,'{\"x\":2,\"y\":1.1,\"z\":2.3}','studio',1,1,NULL),(9,9,'PROCEDURAL_LAPTOP',NULL,0.95,'{\"x\":2.4,\"y\":1.3,\"z\":2.8}','studio',1,1,NULL),(10,10,'PROCEDURAL_LAPTOP',NULL,0.98,'{\"x\":2.5,\"y\":1.35,\"z\":2.8}','neon',1,1,NULL),(11,11,'PROCEDURAL_VR_HEADSET',NULL,1.05,'{\"x\":2.2,\"y\":1,\"z\":2.6}','studio',1,1,NULL),(12,12,'PROCEDURAL_VR_HEADSET',NULL,1,'{\"x\":2.2,\"y\":1,\"z\":2.5}','neon',1,1,NULL),(13,13,'PROCEDURAL_CAMERA',NULL,1,'{\"x\":2.3,\"y\":1.1,\"z\":2.7}','studio',1,1,NULL),(14,14,'PROCEDURAL_CONSOLE',NULL,1,'{\"x\":2.2,\"y\":1,\"z\":2.6}','neon',1,1,NULL),(15,15,'PROCEDURAL_HEADPHONE',NULL,1,'{\"x\":2.3,\"y\":1.1,\"z\":2.7}','warm',1,1,NULL),(16,16,'PROCEDURAL_PHONE',NULL,1.02,'{\"x\":1.9,\"y\":0.8,\"z\":2.5}','neon',1,1,NULL),(17,17,'PROCEDURAL_PHONE',NULL,1.08,'{\"x\":2,\"y\":0.9,\"z\":2.6}','studio',1,1,NULL),(18,18,'PROCEDURAL_WATCH',NULL,1.12,'{\"x\":2,\"y\":1.2,\"z\":2.4}','dark',1,1,NULL),(19,19,'PROCEDURAL_EARBUDS',NULL,1.1,'{\"x\":2.1,\"y\":1.2,\"z\":2.5}','studio',1,1,NULL),(20,20,'PROCEDURAL_SPEAKER',NULL,1.05,'{\"x\":2.2,\"y\":1.3,\"z\":2.6}','warm',1,1,NULL);
/*!40000 ALTER TABLE `product_3d_configs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `product_hotspots`
--

DROP TABLE IF EXISTS `product_hotspots`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `product_hotspots` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `productId` int(11) NOT NULL,
  `title` varchar(120) NOT NULL,
  `description` text NOT NULL,
  `posX` float NOT NULL DEFAULT 0,
  `posY` float NOT NULL DEFAULT 1,
  `posZ` float NOT NULL DEFAULT 1,
  `camX` float NOT NULL DEFAULT 2,
  `camY` float NOT NULL DEFAULT 1,
  `camZ` float NOT NULL DEFAULT 2,
  PRIMARY KEY (`id`),
  KEY `FK_b1c8137ccaaac7d22b2c8187377` (`productId`),
  CONSTRAINT `FK_b1c8137ccaaac7d22b2c8187377` FOREIGN KEY (`productId`) REFERENCES `products` (`id`) ON DELETE CASCADE ON UPDATE NO ACTION
) ENGINE=InnoDB AUTO_INCREMENT=25 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `product_hotspots`
--

LOCK TABLES `product_hotspots` WRITE;
/*!40000 ALTER TABLE `product_hotspots` DISABLE KEYS */;
INSERT INTO `product_hotspots` VALUES (1,1,'45mm Beryllium Acoustic Chamber','Ultra-rigid acoustic driver dome eliminates distortion even at 115dB studio reference volume.',0.95,-0.35,0.25,2.1,-0.2,1.5),(2,1,'Zero-Gravity Spring Steel Headband','Breathable micro-mesh suspension canopy distributes weight evenly for all-day comfort.',0,1.25,0,0,2.2,2),(3,1,'Tactile Digital Crown & ANC Toggle','Precision-milled rotary dial for granular volume control and instant transparency mode switching.',-0.95,-0.55,0.35,-2.1,-0.4,1.6),(4,2,'200MP Periscope Camera Array','Laser autofocus, sapphire lens rings, and 10x lossless optical zoom with gimbal OIS.',-0.28,0.72,-0.12,-1.2,1.1,-1.8),(5,2,'3000-Nit LTPO Infinity Display','1Hz–144Hz adaptive refresh rate with ultrasonic under-display fingerprint scanner.',0,0.1,0.12,0,0.2,2.3),(6,3,'Sapphire Telemetry Watch Face','Scratch-proof sapphire crystal with real-time compass, heart-rate zone, and elevation rings.',0,0.1,0.32,0,0.3,2.1),(7,3,'Haptic Guarded Digital Crown','Machined titanium ridges allow easy rotation even while wearing diving or winter gloves.',0.72,0.15,0.05,1.9,0.3,1.1),(8,4,'Ergonomic Acoustic Stems','Capacitive force sensors let you pinch to switch ANC modes and swipe to adjust volume.',-0.45,0.65,0.15,-1.6,1.2,1.6),(9,5,'360° Acoustic Waveguide Grille','Laser-perforated acoustic mesh projects uniform sound dispersion across every corner of your room.',0,0.2,0.75,0,0.4,2.2),(10,6,'50mm Graphene Chamber','Pinpoint directional footsteps and cinematic sub-bass with zero harmonic crossover.',0.95,-0.35,0.25,2,-0.2,1.5),(11,7,'1-Inch Cinema Sensor Module','Captures 400% more light in night mode with variable mechanical aperture f/1.4–f/4.0.',-0.28,0.72,-0.12,-1.2,1.1,-1.8),(12,8,'Solar Sapphire Ring','Photovoltaic perimeter ring harvests ambient sunlight to extend battery life by up to 35%.',0,0.1,0.32,0,0.3,2.1),(13,9,'16.2\" Tandem OLED 240Hz Display','Dual-layer OLED panel delivers 100% DCI-P3 color accuracy and sub-0.1ms pixel response.',0,0.45,-0.6,0,0.8,2.2),(14,9,'Haptic Force-Touch Glass Trackpad','Pressure-sensitive multi-touch surface with per-key RGB backlit mechanical switches.',0,-0.5,0.55,1.5,0.8,2.1),(15,10,'Dual Vapor-Chamber Cryo Fans','Ultra-thin 0.05mm exhaust fins dissipate 260W combined CPU+GPU thermal load silently.',0.55,-0.5,-0.15,2.1,0.7,1.8),(16,11,'Laminated Spatial Front Glass Visor','Optically polished curved glass houses 12 passthrough cameras and a depth LiDAR scanner.',0,0.05,0.55,0,0.3,2.3),(17,11,'Digital Immersion Crown','Turn the dial to dial in how immersed you are in a virtual 3D environment vs passthrough reality.',0.52,0.39,0.28,1.8,0.9,1.8),(18,12,'Dual Pancake Optical Stack','Reduces visor profile by 45% while delivering edge-to-edge optical clarity.',0,0,0.2,1.6,0.5,1.9),(19,13,'50mm f/1.2 Sapphire Prime Barrel','Dual XD linear motors provide silent, instantaneous focus breathing compensation.',0.08,-0.05,0.88,1.5,0.3,2.2),(20,13,'9.44M-Dot OLED Electronic Viewfinder','Zero-blackout high-magnification optical viewfinder with anti-reflective fluorine coating.',0,0.62,-0.18,0,1.6,1.9),(21,14,'Hall-Effect RGB Thumbsticks','Zero-stick-drift magnetic sensors surrounded by 16.8M-color Aura Sync LED rings.',-0.96,0.18,0.16,-1.8,0.4,1.8),(22,14,'8-Inch 144Hz HDR OLED Touchscreen','Corning Gorilla Glass Victus DXC coating reduces surface reflections by 75%.',0,0,0.12,0,0.2,2.2),(23,15,'Open-Back Acoustic Grille','Eliminates internal standing waves for a holographic concert-hall soundstage.',0.95,-0.35,0.25,2.1,-0.2,1.5),(24,16,'Glyph Telemetry Interface','Visual countdown timers and notification patterns built right into the rear glass.',0.18,0.65,-0.08,1.4,0.8,-1.9);
/*!40000 ALTER TABLE `product_hotspots` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `product_variants`
--

DROP TABLE IF EXISTS `product_variants`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `product_variants` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `productId` int(11) NOT NULL,
  `variantName` varchar(100) NOT NULL,
  `primaryHex` varchar(20) NOT NULL DEFAULT '#1e293b',
  `secondaryHex` varchar(20) NOT NULL DEFAULT '#334155',
  `accentHex` varchar(20) NOT NULL DEFAULT '#38bdf8',
  `finishType` varchar(30) NOT NULL DEFAULT 'MATTE',
  `metalness` float NOT NULL DEFAULT 0,
  `roughness` float NOT NULL DEFAULT 1,
  `priceModifier` decimal(10,2) NOT NULL DEFAULT 0.00,
  `stockQuantity` int(11) NOT NULL DEFAULT 15,
  PRIMARY KEY (`id`),
  KEY `FK_f515690c571a03400a9876600b5` (`productId`),
  CONSTRAINT `FK_f515690c571a03400a9876600b5` FOREIGN KEY (`productId`) REFERENCES `products` (`id`) ON DELETE CASCADE ON UPDATE NO ACTION
) ENGINE=InnoDB AUTO_INCREMENT=45 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `product_variants`
--

LOCK TABLES `product_variants` WRITE;
/*!40000 ALTER TABLE `product_variants` DISABLE KEYS */;
INSERT INTO `product_variants` VALUES (1,1,'Obsidian Matte Black','#18181b','#27272a','#38bdf8','MATTE',0.2,0.78,0.00,18),(2,1,'Titanium Silver Alloy','#cbd5e1','#475569','#6366f1','TITANIUM',0.88,0.22,20.00,12),(3,1,'Cyber Neon Pulse','#0f172a','#1e1b4b','#00f5d4','NEON',0.55,0.3,30.00,8),(4,1,'Crimson Metallic Edition','#991b1b','#1f2937','#f59e0b','METALLIC',0.92,0.18,25.00,10),(5,2,'Natural Grade-5 Titanium','#94a3b8','#334155','#38bdf8','TITANIUM',0.9,0.24,0.00,15),(6,2,'Stealth Matte Phantom','#0f172a','#1e293b','#a855f7','MATTE',0.18,0.8,0.00,10),(7,2,'Aurora Cyber Matrix','#111827','#064e3b','#10b981','NEON',0.65,0.25,50.00,6),(8,2,'Desert Gold Metallic','#d4af37','#451a03','#fbbf24','METALLIC',0.95,0.15,40.00,8),(9,3,'Titanium Case / International Orange','#94a3b8','#ea580c','#f97316','TITANIUM',0.85,0.25,0.00,20),(10,3,'Carbon Black Matte / Stealth Band','#18181b','#09090b','#22d3ee','MATTE',0.22,0.75,0.00,15),(11,3,'Cyber Pulse Neon / Electric Blue','#1e293b','#1d4ed8','#00f5d4','NEON',0.6,0.3,20.00,10),(12,4,'Graphite Matte Stealth','#1e293b','#0f172a','#38bdf8','MATTE',0.25,0.7,0.00,25),(13,4,'Glacier Metallic Pearl','#f1f5f9','#cbd5e1','#06b6d4','METALLIC',0.8,0.2,0.00,20),(14,4,'Neon Violet Synth','#2e1065','#09090b','#e879f9','NEON',0.6,0.28,15.00,12),(15,5,'Dark Matter Neon Cyan','#111827','#1f2937','#00f5d4','NEON',0.5,0.35,0.00,14),(16,5,'Brushed Bronze Titanium','#78350f','#27272a','#f59e0b','TITANIUM',0.88,0.24,20.00,8),(17,5,'Studio Matte Charcoal','#27272a','#3f3f46','#818cf8','MATTE',0.2,0.78,0.00,10),(18,6,'Cyber Magenta Neon','#09090b','#18181b','#f43f5e','NEON',0.6,0.28,0.00,20),(19,6,'Arctic Matte White','#f8fafc','#cbd5e1','#0ea5e9','MATTE',0.15,0.72,0.00,18),(20,7,'Cobalt Metallic Blue','#1e3a8a','#0f172a','#38bdf8','METALLIC',0.9,0.18,0.00,15),(21,7,'Emerald Titanium','#065f46','#111827','#34d399','TITANIUM',0.85,0.24,20.00,15),(22,8,'Forged Matte Carbon / Volt Lime','#18181b','#3f6212','#a3e635','MATTE',0.2,0.75,0.00,25),(23,8,'Silver Titanium / Sky Cyan','#94a3b8','#0369a1','#38bdf8','TITANIUM',0.85,0.25,15.00,20),(24,9,'Space Black Anodized Matte','#18181b','#27272a','#38bdf8','MATTE',0.3,0.65,0.00,12),(25,9,'Raw Aerospace Titanium','#cbd5e1','#64748b','#6366f1','TITANIUM',0.9,0.2,100.00,10),(26,9,'Cyber Overclock Neon','#09090b','#1e1b4b','#00f5d4','NEON',0.6,0.25,120.00,6),(27,10,'Venom Acid Neon Green','#09090b','#18181b','#22c55e','NEON',0.55,0.3,0.00,8),(28,10,'Mercury Metallic Silver','#e2e8f0','#475569','#38bdf8','METALLIC',0.92,0.16,50.00,6),(29,11,'Silver Titanium & Pearl Knit','#cbd5e1','#475569','#38bdf8','TITANIUM',0.88,0.22,0.00,10),(30,11,'Cyberpunk Obsidian Neon','#0f172a','#1e293b','#00f5d4','NEON',0.62,0.26,50.00,9),(31,12,'Stealth Matte Carbon','#18181b','#27272a','#a855f7','MATTE',0.2,0.76,0.00,20),(32,12,'Frost White & Cyan','#f8fafc','#94a3b8','#06b6d4','GLOSSY',0.3,0.1,0.00,12),(33,13,'Magnesium Matte Black & Cinnabar Ring','#18181b','#27272a','#ef4444','MATTE',0.25,0.72,0.00,7),(34,13,'Vintage Silver Titanium Edition','#cbd5e1','#18181b','#f59e0b','TITANIUM',0.88,0.22,100.00,5),(35,14,'Cyber Black & Cyan Halo','#0f172a','#1e293b','#00f5d4','NEON',0.55,0.28,0.00,16),(36,14,'Glacier Matte White & Purple','#f8fafc','#cbd5e1','#a855f7','MATTE',0.18,0.72,0.00,13),(37,15,'Champagne Gold & Titanium','#334155','#1e293b','#f59e0b','TITANIUM',0.88,0.22,0.00,16),(38,16,'Smoke Dark Glyph Cyan','#18181b','#27272a','#00f5d4','NEON',0.6,0.25,0.00,25),(39,16,'Cryo White Glyph Edition','#f1f5f9','#cbd5e1','#38bdf8','GLOSSY',0.3,0.08,0.00,15),(40,17,'Crafted Titanium Shadow','#334155','#0f172a','#6366f1','TITANIUM',0.88,0.24,0.00,18),(41,18,'DLC Carbon Gray & Amber','#1f2937','#111827','#f59e0b','TITANIUM',0.85,0.26,0.00,24),(42,19,'Moonstone Metallic Blue','#334155','#1e293b','#38bdf8','METALLIC',0.88,0.2,0.00,48),(43,20,'Opera de Paris 22k Gold Leaf','#f8fafc','#cbd5e1','#f59e0b','METALLIC',0.92,0.14,0.00,6),(44,20,'Matte Black Iconic','#18181b','#09090b','#38bdf8','MATTE',0.22,0.78,0.00,5);
/*!40000 ALTER TABLE `product_variants` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `products`
--

DROP TABLE IF EXISTS `products`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `products` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `categoryId` int(11) NOT NULL,
  `name` varchar(160) NOT NULL,
  `slug` varchar(180) NOT NULL,
  `sku` varchar(80) NOT NULL,
  `brand` varchar(100) NOT NULL,
  `tagline` varchar(255) DEFAULT NULL,
  `description` text NOT NULL,
  `basePrice` decimal(10,2) NOT NULL,
  `salePrice` decimal(10,2) DEFAULT NULL,
  `stockQuantity` int(11) NOT NULL DEFAULT 25,
  `isFeatured` tinyint(4) NOT NULL DEFAULT 0,
  `isActive` tinyint(4) NOT NULL DEFAULT 1,
  `technicalSpecs` text DEFAULT NULL,
  `badgeText` varchar(255) DEFAULT NULL,
  `ratingAverage` decimal(3,2) NOT NULL DEFAULT 4.80,
  `reviewCount` int(11) NOT NULL DEFAULT 0,
  `createdAt` datetime(6) NOT NULL DEFAULT current_timestamp(6),
  PRIMARY KEY (`id`),
  UNIQUE KEY `IDX_464f927ae360106b783ed0b410` (`slug`),
  UNIQUE KEY `IDX_c44ac33a05b144dd0d9ddcf932` (`sku`),
  KEY `FK_ff56834e735fa78a15d0cf21926` (`categoryId`),
  CONSTRAINT `FK_ff56834e735fa78a15d0cf21926` FOREIGN KEY (`categoryId`) REFERENCES `categories` (`id`) ON DELETE CASCADE ON UPDATE NO ACTION
) ENGINE=InnoDB AUTO_INCREMENT=21 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `products`
--

LOCK TABLES `products` WRITE;
/*!40000 ALTER TABLE `products` DISABLE KEYS */;
INSERT INTO `products` VALUES (1,1,'Aether Pro Max ANC','aether-pro-max-anc','AETH-HP-001','Aether Audio','45mm Beryllium Planar Drivers with 60-Hour Adaptive ANC','Engineered with CNC-machined aluminum earcups, memory-foam acoustic seals, and dual-chip active noise cancellation. Rotate in 360° and customize the anodized shell, headband arch, and neon acoustic ring in real time.',399.00,349.00,42,1,1,'{\"Driver\":\"45mm Custom Beryllium Planar Magnetic\",\"Noise Cancellation\":\"Hybrid 8-Mic Adaptive ANC (-48dB)\",\"Battery Life\":\"60 Hours (ANC On) / 80 Hours (Standard)\",\"Connectivity\":\"Bluetooth 5.4 Ultra-Lossless + USB-C DAC\",\"Weight\":\"312g Aerospace Alloy Frame\",\"Audio\":\"Dolby Atmos Spatial Audio + Head Tracking\"}','FLAGSHIP 3D',4.95,128,'2026-10-27 20:24:43.643515'),(2,2,'Nova X1 Ultra 5G','nova-x1-ultra-5g','NOVA-PH-002','Nova Mobile','Grade-5 Titanium Unibody • 200MP Periscope Quad Camera','Experience desktop-class raytracing and AI photography in a Grade-5 Titanium enclosure. Features a 6.85\" 3000-nit LTPO OLED borderless display, periscope 10x optical zoom, and customizable matte/titanium back glass.',1099.00,999.00,35,1,1,'{\"Display\":\"6.85\\\" 144Hz LTPO AMOLED (3200 x 1440, 3000 nits)\",\"Processor\":\"3nm Quantum Core X4 Octa-Core + Neural NPU\",\"Camera\":\"200MP Main OIS + 50MP 10x Periscope + 50MP Ultrawide\",\"Battery\":\"5600mAh Silicon-Carbon • 100W HyperCharge\",\"Storage\":\"512GB UFS 4.0 + 16GB LPDDR5X RAM\",\"Protection\":\"IP68 Water Resistant • Ceramic Shield Pro\"}','BEST SELLER',4.92,214,'2026-10-27 20:24:43.675982'),(3,3,'Chronos Titan S9 Ultra','chronos-titan-s9-ultra','CHRO-SW-003','Chronos Wear','Sapphire Dual-Frequency GPS Watch with Bio-Optical Sensor Array','Built for endurance athletes and executives alike. Features a flat sapphire crystal front, precision haptics digital crown, ECG + SpO2 health suite, and interchangeable fluoroelastomer or titanium link bands.',449.00,429.00,50,1,1,'{\"Case\":\"49mm Aerospace Titanium • 100m Dive Rated (EN13319)\",\"Display\":\"Sapphire Always-On Retina OLED (2500 nits)\",\"Sensors\":\"ECG, Blood Oxygen, Skin Temp, Depth Gauge, Altimeter\",\"GPS\":\"Precision Dual-Frequency L1 + L5 Satellite Navigation\",\"Battery\":\"72 Hours Normal Use / 140 Hours Low Power\"}','NEW RELEASE',4.89,94,'2026-10-27 20:24:43.709499'),(4,4,'SonicPods Pro 3 ANC','sonicpods-pro-3-anc','SONI-EB-004','Aether Audio','Dual-Driver Lossless TWS Earbuds with MagSafe Display Case','Pocket-sized audiophile precision. Dual coaxial drivers (11mm woofer + planar tweeter) inside ergonomic acoustic pods, paired with a wireless MagSafe charging case featuring an LED battery telemetry bar.',269.00,249.00,64,1,1,'{\"Drivers\":\"11mm Dynamic Woofer + 6mm Planar Micro-Tweeter\",\"ANC\":\"Real-Time Ear Canal Calibration ANC (-45dB)\",\"Codec\":\"LDAC, aptX Lossless, AAC (24-bit/96kHz)\",\"Battery\":\"9 Hours Buds / 38 Hours with MagSafe Case\"}','AUDIOPHILE PICK',4.87,76,'2026-10-27 20:24:43.731095'),(5,5,'PulseSphere 360 Spatial','pulsesphere-360-spatial','PULS-SP-005','Pulse Acoustics','360° Omnidirectional Acoustic Core with Reactive Halo Lighting','Fill any room with holographic 3D sound. PulseSphere combines a downward-firing 120W neodymium subwoofer with six radial array tweeters and a customizable RGBW acoustic levitation light ring.',329.00,299.00,28,1,1,'{\"Output\":\"180W Peak Class-D Bi-Amplified Architecture\",\"Frequency\":\"28Hz – 40,000Hz Hi-Res Certified\",\"Acoustic\":\"6x Radial Horn Tweeters + 5.25\\\" High-Excursion Woofer\",\"Wireless\":\"Wi-Fi 6E AirPlay 2, Spotify Connect, Bluetooth 5.4\"}','360° AUDIO',4.91,63,'2026-10-27 20:24:43.749585'),(6,1,'HyperWave Cyber Pro Headset','hyperwave-cyber-pro-headset','HYPR-HP-006','HyperWave Gaming','7.1.4 Spatial Gaming & Studio Monitoring Headset','Built for esports pros and 3D audio creators. Features ultra-light carbon-infused earcups, dual wireless 2.4GHz + Bluetooth simultaneous mixing, and customizable neon edge lighting.',229.00,199.00,38,0,1,'{\"Driver\":\"50mm Graphene Diaphragm Drivers\",\"Wireless\":\"10ms 2.4GHz Quantum Dongle + Bluetooth 5.3\",\"Microphone\":\"Detachable Broadcast Cardioid AI Boom Mic\",\"Battery\":\"50 Hours Continuous Play\"}','LOW LATENCY',4.84,52,'2026-10-27 20:24:43.767187'),(7,2,'Vertex Quantum Pro 16','vertex-quantum-pro-16','VERT-PH-007','Vertex Labs','Sapphire Ceramic Chassis • Holographic AI Camera System','A minimalist masterpiece combining a vapor-chamber cooled processor, under-screen front camera for a 100% uninterrupted bezel-free display, and studio-grade 8K ProRes video recording.',899.00,849.00,30,0,1,'{\"Display\":\"6.7\\\" True Full-Screen AMOLED (No Notch/Cutout)\",\"Chipset\":\"Vertex Tensor G9 3nm Processor\",\"Camera\":\"50MP 1-Inch Sensor + 64MP 5x Telephoto\",\"Charging\":\"80W Wired + 50W Magnetic Wireless\"}','AI FLAGSHIP',4.86,47,'2026-10-27 20:24:43.784254'),(8,3,'AeroFit Pulse Carbon GPS','aerofit-pulse-carbon-gps','AERO-SW-008','Chronos Wear','Forged Carbon Fiber Bezel • 21-Day Solar Assisted Battery','Featherweight 38g forged carbon smartwatch engineered for marathoners and triathletes. Includes offline topographic maps, VO2 Max recovery coaching, and customizable anodized accents.',349.00,319.00,45,0,1,'{\"Bezel\":\"Forged Carbon Fiber + DLC Titanium Crown\",\"Battery\":\"21 Days Smartwatch Mode / 60 Hours Dual-Band GPS\",\"Weight\":\"38g Ultra-Light Chassis\",\"Waterproof\":\"10 ATM Swimming & Surfing Ready\"}','21-DAY BATTERY',4.82,39,'2026-10-27 20:24:43.801849'),(9,6,'AetherBook Pro 16 M4 Max','aetherbook-pro-16-m4-max','AETH-LP-009','Aether Computing','16.2\" Tandem OLED 240Hz • 40-Core Raytracing GPU • 128GB Unified','Precision CNC-milled unibody workstation engineered for 3D artists, AI researchers, and pro editors. Rotate in 360° or trigger the Exploded View to inspect the dual copper vapor-chamber cooling fans and motherboard.',2499.00,2299.00,22,1,1,'{\"Display\":\"16.2\\\" 4K Tandem OLED (240Hz, 1600 nits HDR)\",\"Processor\":\"16-Core Quantum M4 Max + 40-Core GPU\",\"Memory\":\"128GB Unified LPDDR5X (800GB/s Bandwidth)\",\"Storage\":\"4TB PCIe Gen5 NVMe SSD\",\"Cooling\":\"Dual Copper Vapor-Chamber Liquid Metal Array\",\"Ports\":\"3x Thunderbolt 5, HDMI 2.1, SD Express, MagCharge\"}','PRO WORKSTATION',4.98,164,'2026-10-27 20:24:43.821657'),(10,6,'RazerBlade Nebula X18 RTX','razerblade-nebula-x18-rtx','RAZR-LP-010','HyperWave Gaming','RTX 5090 24GB Mobile • 18\" Mini-LED 300Hz • Chroma RGB Deck','Desktop replacement gaming titan milled from a single block of T6 aluminum. Equipped with per-key RGB lighting, front neon underglow bar, and full-wattage GPU performance.',2899.00,2699.00,14,0,1,'{\"GPU\":\"NVIDIA GeForce RTX 5090 Laptop GPU (200W TGP)\",\"Display\":\"18\\\" QHD+ 300Hz Mini-LED (2000 Local Dimming Zones)\",\"Keyboard\":\"Optical-Mechanical Per-Key RGB Switches\",\"RAM\":\"64GB DDR5-6400MHz Dual-Channel\"}','RTX 5090 3D',4.94,88,'2026-10-27 20:24:43.846772'),(11,7,'VisionSphere Pro Spatial','visionsphere-pro-spatial','VISN-VR-011','Aether Computing','Dual 8K Micro-OLED • Eye & Hand Tracking • Laminated Spatial Glass','Seamlessly blend digital 3D workspaces with your physical room. Features a curved laminated glass front visor, 12ms photon-to-photon passthrough cameras, and dual pancake optics.',1799.00,1599.00,19,1,1,'{\"Displays\":\"Dual 4K-per-eye Micro-OLED (23 Million Pixels)\",\"Optics\":\"Custom 3-Element Pancake Lenses + Motorized IPD\",\"Tracking\":\"4x High-Speed IR Eye Trackers + 6-DoF Hand LiDAR\",\"Audio\":\"Dual-Driver Raytraced Spatial Audio Pods\",\"Frame\":\"Curved Aerospace Aluminum + 3D Knitted Solo Band\"}','SPATIAL 3D',4.96,112,'2026-10-27 20:24:43.864611'),(12,7,'MetaVerse Quest X3 Carbon','metaverse-quest-x3-carbon','META-VR-012','Vertex Labs','Wireless Standalone Mixed Reality • 120Hz Pancake Optics','Untethered mixed-reality gaming and fitness headset with ultra-slim pancake lenses, full-color passthrough, and Wi-Fi 7 PCVR streaming.',649.00,599.00,32,0,1,'{\"Chipset\":\"Snapdragon XR2 Gen 3 Spatial Platform\",\"RefreshRate\":\"90Hz / 120Hz Wireless PCVR & Standalone\",\"Storage\":\"512GB Internal UFS 4.0\",\"Weight\":\"465g Balanced Ergonomic Strap\"}','MIXED REALITY',4.88,74,'2026-10-27 20:24:43.886729'),(13,8,'Lumix Alpha S1R 8K Cinema','lumix-alpha-s1r-8k-cinema','LUMI-CM-013','Lumix Optics','61MP Full-Frame Exmor Sensor • 8K 60fps RAW • 50mm f/1.2 Master Lens','Professional full-frame mirrorless cinema camera paired with a razor-sharp 50mm f/1.2 prime lens. Features 8-stop in-body image stabilization (IBIS) and dual CFexpress Type-B slots.',3199.00,2949.00,32,1,1,'{\"Sensor\":\"61MP Back-Illuminated Full-Frame CMOS (15+ Stops DR)\",\"Video\":\"8K 60p 12-Bit Internal ProRes RAW + 4K 120p\",\"Stabilization\":\"8.0-Stop 5-Axis In-Body Sensor Shift IBIS\",\"Autofocus\":\"759-Point Real-Time AI Subject Recognition\",\"Viewfinder\":\"9.44M-Dot Quad-XGA OLED EVF (120fps)\"}','8K FULL FRAME',4.97,83,'2026-10-27 20:24:43.906438'),(14,8,'CyberDeck Ally Z1 OLED','cyberdeck-ally-z1-oled','CYBR-CN-014','HyperWave Gaming','8\" 144Hz VRR OLED Handheld • Ryzen Z1 Extreme • Hall-Effect RGB Sticks','Play AAA PC and console titles anywhere. Features drift-free Hall-effect magnetic thumbsticks with customizable RGB halo rings, dual cryo-cooling fans, and an 80Wh marathon battery.',799.00,729.00,29,1,1,'{\"APU\":\"AMD Ryzen Z1 Extreme 8-Core / 16-Thread + RDNA 3.5\",\"Display\":\"8.0\\\" 1920x1200 144Hz OLED with FreeSync Premium VRR\",\"Controls\":\"Hall-Effect Analog Joysticks + Linear Hair-Trigger Bumpers\",\"Storage\":\"1TB PCIe 4.0 NVMe M.2 + UHS-II MicroSD\",\"Battery\":\"80Wh High-Density Cell + 65W USB4 PD\"}','HANDHELD 3D',4.93,141,'2026-10-27 20:24:43.927676'),(15,1,'Senna HD-900 Electrostatic','senna-hd-900-electrostatic','SENN-HP-015','Aether Audio','Open-Back Reference Audiophile Headphones • Gold-Vapor Diaphragm','Hand-assembled reference studio headphones featuring acoustic open-back titanium mesh grilles and ultra-low distortion planar drivers for mastering engineers.',549.00,499.00,16,0,1,'{\"Transducer\":\"Open-Back Planar Electrostatic (5Hz – 52,000Hz)\",\"Impedance\":\"64 Ohms Studio Reference\",\"Cushions\":\"Velour & Perforated Sheepskin Memory Foam\"}','REFERENCE HI-FI',4.94,41,'2026-10-27 20:24:43.949074'),(16,2,'Nothing Phone (3) Glyph Neon','nothing-phone-3-glyph-neon','NOTH-PH-016','Nova Mobile','Transparent Cyber Interface • Programmable LED Glyph Matrix','Semi-transparent industrial aesthetic with interactive rear LED Glyph strips that synchronize with ringtones, timers, ride-share progress, and volume levels.',699.00,649.00,40,0,1,'{\"Interface\":\"24-Zone Addressable Mini-LED Glyph Backplate\",\"Display\":\"6.7\\\" 120Hz Flexible LTPO OLED\",\"Camera\":\"Dual 50MP Sony IMX890 OIS Sensors\"}','GLYPH LED',4.88,91,'2026-10-27 20:24:43.962709'),(17,2,'Galaxy Fold Titanium Z7 5G','galaxy-fold-titanium-z7-5g','GALX-PH-017','Vertex Labs','Zero-Gap Armor FlexHinge • Stylus Ready • Under-Display Camera','Crafted with Armor Titanium rails and ultra-thin foldable glass. Multitask up to 4 desktop-class apps simultaneously with S-Pen precision.',1599.00,1449.00,18,0,1,'{\"Hinge\":\"Dual-Rail Zero-Gap Titanium FlexHinge\",\"Storage\":\"1TB UFS 4.0 + 16GB RAM\",\"Waterproof\":\"IP48 Water & Dust Certified\"}','FOLDABLE 5G',4.91,68,'2026-10-27 20:24:43.979128'),(18,3,'Garmin Fenix 8 Sapphire Solar','garmin-fenix-8-sapphire-solar','GARM-SW-018','Chronos Wear','Built-In LED Flashlight • 30-Day Solar Expedition Watch','Tactical expedition multisport GPS watch featuring a scratch-resistant power sapphire lens, leakproof inductive metal buttons, and global topographical maps.',799.00,749.00,24,0,1,'{\"Lens\":\"Power Sapphire Solar Charging Crystal\",\"Battery\":\"Up to 30 Days with Solar Harvesting\",\"Torch\":\"Integrated Multi-LED Variable Strobe Flashlight\"}','EXPEDITION GPS',4.95,105,'2026-10-27 20:24:43.989447'),(19,4,'Bose QuietPods Ultra II TWS','bose-quietpods-ultra-ii-tws','BOSE-EB-019','Pulse Acoustics','World-Class CustomTune ANC • Immersive Spatial Audio','CustomTune sound calibration analyzes your ear canal shape in 0.5 seconds to personalize active noise cancellation and deep, balanced bass.',299.00,279.00,48,0,1,'{\"Calibration\":\"CustomTune Acoustic Shape Sonar\",\"Stability\":\"3x Interlocking Silicone Stability Bands\",\"Battery\":\"8.5 Hours Single Charge / 32 Hours Total\"}','ULTRA ANC',4.90,82,'2026-10-27 20:24:44.002919'),(20,5,'Devialet Phantom Reactor 900W','devialet-phantom-reactor-900w','DEVI-SP-020','Pulse Acoustics','900W Implosive Sound Center • Dual Push-Push Woofers • 18Hz Infra-Bass','Ultra-dense acoustic sphere delivering 98dB SPL with zero distortion, zero saturation, and zero background noise down to 18Hz sub-bass frequencies you can feel.',1199.00,1099.00,31,0,1,'{\"Power\":\"900 Watts RMS ADH Analog-Digital Hybrid Amplification\",\"Bass\":\"18Hz – 21kHz (-6dB) Hermetic Push-Push Woofers\",\"DAC\":\"Devialet Intelligence Processor 24bits/192kHz\"}','900W HI-END',4.96,59,'2026-10-27 20:24:44.013601');
/*!40000 ALTER TABLE `products` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `reviews`
--

DROP TABLE IF EXISTS `reviews`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `reviews` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `productId` int(11) NOT NULL,
  `userId` int(11) DEFAULT NULL,
  `reviewerName` varchar(120) NOT NULL,
  `rating` int(11) NOT NULL DEFAULT 5,
  `title` varchar(150) DEFAULT NULL,
  `comment` text NOT NULL,
  `isVerifiedPurchase` tinyint(4) NOT NULL DEFAULT 1,
  `createdAt` datetime(6) NOT NULL DEFAULT current_timestamp(6),
  PRIMARY KEY (`id`),
  KEY `FK_a6b3c434392f5d10ec171043666` (`productId`),
  KEY `FK_7ed5659e7139fc8bc039198cc1f` (`userId`),
  CONSTRAINT `FK_7ed5659e7139fc8bc039198cc1f` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE NO ACTION,
  CONSTRAINT `FK_a6b3c434392f5d10ec171043666` FOREIGN KEY (`productId`) REFERENCES `products` (`id`) ON DELETE CASCADE ON UPDATE NO ACTION
) ENGINE=InnoDB AUTO_INCREMENT=21 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `reviews`
--

LOCK TABLES `reviews` WRITE;
/*!40000 ALTER TABLE `reviews` DISABLE KEYS */;
INSERT INTO `reviews` VALUES (1,1,2,'Alex Mercer',5,'The 3D customization matched the exact finish I received!','Being able to rotate the 3D model, test the Titanium vs Matte finish, and inspect the internal components in Exploded View is awesome.',1,'2026-10-27 20:24:43.669175'),(2,2,2,'Alex Mercer',5,'The 3D customization matched the exact finish I received!','Being able to rotate the 3D model, test the Titanium vs Matte finish, and inspect the internal components in Exploded View is awesome.',1,'2026-10-27 20:24:43.702544'),(3,3,2,'Alex Mercer',5,'The 3D customization matched the exact finish I received!','Being able to rotate the 3D model, test the Titanium vs Matte finish, and inspect the internal components in Exploded View is awesome.',1,'2026-10-27 20:24:43.727310'),(4,4,2,'Alex Mercer',5,'The 3D customization matched the exact finish I received!','Being able to rotate the 3D model, test the Titanium vs Matte finish, and inspect the internal components in Exploded View is awesome.',1,'2026-10-27 20:24:43.745175'),(5,5,2,'Alex Mercer',5,'The 3D customization matched the exact finish I received!','Being able to rotate the 3D model, test the Titanium vs Matte finish, and inspect the internal components in Exploded View is awesome.',1,'2026-10-27 20:24:43.763602'),(6,6,2,'Alex Mercer',5,'The 3D customization matched the exact finish I received!','Being able to rotate the 3D model, test the Titanium vs Matte finish, and inspect the internal components in Exploded View is awesome.',1,'2026-10-27 20:24:43.780500'),(7,7,2,'Alex Mercer',5,'The 3D customization matched the exact finish I received!','Being able to rotate the 3D model, test the Titanium vs Matte finish, and inspect the internal components in Exploded View is awesome.',1,'2026-10-27 20:24:43.797902'),(8,8,2,'Alex Mercer',5,'The 3D customization matched the exact finish I received!','Being able to rotate the 3D model, test the Titanium vs Matte finish, and inspect the internal components in Exploded View is awesome.',1,'2026-10-27 20:24:43.817147'),(9,9,2,'Alex Mercer',5,'The 3D customization matched the exact finish I received!','Being able to rotate the 3D model, test the Titanium vs Matte finish, and inspect the internal components in Exploded View is awesome.',1,'2026-10-27 20:24:43.842301'),(10,10,2,'Alex Mercer',5,'The 3D customization matched the exact finish I received!','Being able to rotate the 3D model, test the Titanium vs Matte finish, and inspect the internal components in Exploded View is awesome.',1,'2026-10-27 20:24:43.861203'),(11,11,2,'Alex Mercer',5,'The 3D customization matched the exact finish I received!','Being able to rotate the 3D model, test the Titanium vs Matte finish, and inspect the internal components in Exploded View is awesome.',1,'2026-10-27 20:24:43.882215'),(12,12,2,'Alex Mercer',5,'The 3D customization matched the exact finish I received!','Being able to rotate the 3D model, test the Titanium vs Matte finish, and inspect the internal components in Exploded View is awesome.',1,'2026-10-27 20:24:43.901811'),(13,13,2,'Alex Mercer',5,'The 3D customization matched the exact finish I received!','Being able to rotate the 3D model, test the Titanium vs Matte finish, and inspect the internal components in Exploded View is awesome.',1,'2026-10-27 20:24:43.923262'),(14,14,2,'Alex Mercer',5,'The 3D customization matched the exact finish I received!','Being able to rotate the 3D model, test the Titanium vs Matte finish, and inspect the internal components in Exploded View is awesome.',1,'2026-10-27 20:24:43.945027'),(15,15,2,'Alex Mercer',5,'The 3D customization matched the exact finish I received!','Being able to rotate the 3D model, test the Titanium vs Matte finish, and inspect the internal components in Exploded View is awesome.',1,'2026-10-27 20:24:43.959493'),(16,16,2,'Alex Mercer',5,'The 3D customization matched the exact finish I received!','Being able to rotate the 3D model, test the Titanium vs Matte finish, and inspect the internal components in Exploded View is awesome.',1,'2026-10-27 20:24:43.975562'),(17,17,2,'Alex Mercer',5,'The 3D customization matched the exact finish I received!','Being able to rotate the 3D model, test the Titanium vs Matte finish, and inspect the internal components in Exploded View is awesome.',1,'2026-10-27 20:24:43.985914'),(18,18,2,'Alex Mercer',5,'The 3D customization matched the exact finish I received!','Being able to rotate the 3D model, test the Titanium vs Matte finish, and inspect the internal components in Exploded View is awesome.',1,'2026-10-27 20:24:43.999895'),(19,19,2,'Alex Mercer',5,'The 3D customization matched the exact finish I received!','Being able to rotate the 3D model, test the Titanium vs Matte finish, and inspect the internal components in Exploded View is awesome.',1,'2026-10-27 20:24:44.010572'),(20,20,2,'Alex Mercer',5,'The 3D customization matched the exact finish I received!','Being able to rotate the 3D model, test the Titanium vs Matte finish, and inspect the internal components in Exploded View is awesome.',1,'2026-10-27 20:24:44.023563');
/*!40000 ALTER TABLE `reviews` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `users` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `fullName` varchar(120) NOT NULL,
  `email` varchar(150) NOT NULL,
  `passwordHash` varchar(255) NOT NULL,
  `role` enum('CUSTOMER','ADMIN') NOT NULL DEFAULT 'CUSTOMER',
  `phone` varchar(40) DEFAULT NULL,
  `shippingAddress` text DEFAULT NULL,
  `createdAt` datetime(6) NOT NULL DEFAULT current_timestamp(6),
  PRIMARY KEY (`id`),
  UNIQUE KEY `IDX_97672ac88f789774dd47f7c8be` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'Store Administrator','admin@3dstore.com','$2a$10$9TxgpICWj2A70PZvJmrzMu4E82jU0ZeUdps/NsK778.qT6tia9.8u','ADMIN','+1 (555) 010-9999','{\"street\":\"742 Innovation Way\",\"city\":\"San Francisco\",\"state\":\"CA\",\"zipCode\":\"94107\",\"country\":\"United States\"}','2026-10-27 20:24:43.525505'),(2,'Alex Mercer','alex@example.com','$2a$10$VLv0MZBsyy7W1XM2Y9m3Quvt5ZvTbaXBgiGfZ.140zx/4hLAq8pYe','CUSTOMER','+1 (555) 234-5678','{\"street\":\"1200 Tech Plaza Apt 4B\",\"city\":\"Austin\",\"state\":\"TX\",\"zipCode\":\"78701\",\"country\":\"United States\"}','2026-10-27 20:24:43.596308');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-10-27 22:25:32
