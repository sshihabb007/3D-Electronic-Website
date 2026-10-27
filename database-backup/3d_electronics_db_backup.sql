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
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `categories`
--

LOCK TABLES `categories` WRITE;
/*!40000 ALTER TABLE `categories` DISABLE KEYS */;
INSERT INTO `categories` VALUES (1,'Headphones','headphones','headphones','Studio-grade over-ear ANC headphones with spatial audio and custom 3D finishes.',1),(2,'Smartphones','smartphones','smartphone','Flagship 5G smartphones crafted with aerospace titanium and pro camera systems.',2),(3,'Smartwatches','smartwatches','watch','Precision biometric smartwatches with sapphire crystal AMOLED displays.',3),(4,'Wireless Earbuds','earbuds','earbuds','Ultra-low latency true wireless earbuds with adaptive noise cancellation.',4),(5,'Spatial Speakers','speakers','speaker','360-degree omnidirectional acoustic speakers with reactive ambient lighting.',5);
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
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `order_items`
--

LOCK TABLES `order_items` WRITE;
/*!40000 ALTER TABLE `order_items` DISABLE KEYS */;
INSERT INTO `order_items` VALUES (1,1,1,'Aether Pro Max ANC','Titanium Silver Alloy','TITANIUM','#cbd5e1','#6366f1',1,349.00);
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
  PRIMARY KEY (`id`),
  UNIQUE KEY `IDX_59b0c3b34ea0fa5562342f2414` (`orderNumber`),
  KEY `FK_151b79a83ba240b0cb31b2302d1` (`userId`),
  CONSTRAINT `FK_151b79a83ba240b0cb31b2302d1` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE NO ACTION
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `orders`
--

LOCK TABLES `orders` WRITE;
/*!40000 ALTER TABLE `orders` DISABLE KEYS */;
INSERT INTO `orders` VALUES (1,'ORD-2026-1001',2,'Alex Mercer','alex@example.com','+1 (555) 234-5678','{\"street\":\"1200 Tech Plaza Apt 4B\",\"city\":\"Austin\",\"state\":\"TX\",\"zipCode\":\"78701\",\"country\":\"United States\"}',349.00,0.00,27.92,376.92,'STRIPE_CARD','PAID','SHIPPED','2026-10-27 13:06:32.708328');
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
  PRIMARY KEY (`id`),
  UNIQUE KEY `REL_673ef5b015f327293bcfbaddaf` (`productId`),
  CONSTRAINT `FK_673ef5b015f327293bcfbaddaf0` FOREIGN KEY (`productId`) REFERENCES `products` (`id`) ON DELETE CASCADE ON UPDATE NO ACTION
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `product_3d_configs`
--

LOCK TABLES `product_3d_configs` WRITE;
/*!40000 ALTER TABLE `product_3d_configs` DISABLE KEYS */;
INSERT INTO `product_3d_configs` VALUES (1,1,'PROCEDURAL_HEADPHONE',NULL,1,'{\"x\":2.3,\"y\":1.1,\"z\":2.8}','studio',1,1),(2,2,'PROCEDURAL_PHONE',NULL,1.05,'{\"x\":1.9,\"y\":0.8,\"z\":2.6}','studio',1,1),(3,3,'PROCEDURAL_WATCH',NULL,1.1,'{\"x\":2,\"y\":1.2,\"z\":2.4}','studio',1,1),(4,4,'PROCEDURAL_EARBUDS',NULL,1.1,'{\"x\":2.1,\"y\":1.2,\"z\":2.5}','studio',1,1),(5,5,'PROCEDURAL_SPEAKER',NULL,1,'{\"x\":2.2,\"y\":1.3,\"z\":2.6}','neon',1,1),(6,6,'PROCEDURAL_HEADPHONE',NULL,1,'{\"x\":2.3,\"y\":1,\"z\":2.7}','neon',1,1),(7,7,'PROCEDURAL_PHONE',NULL,1,'{\"x\":1.9,\"y\":0.8,\"z\":2.5}','dark',1,1),(8,8,'PROCEDURAL_WATCH',NULL,1.05,'{\"x\":2,\"y\":1.1,\"z\":2.3}','studio',1,1);
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
) ENGINE=InnoDB AUTO_INCREMENT=17 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `product_hotspots`
--

LOCK TABLES `product_hotspots` WRITE;
/*!40000 ALTER TABLE `product_hotspots` DISABLE KEYS */;
INSERT INTO `product_hotspots` VALUES (1,1,'45mm Beryllium Acoustic Chamber','Ultra-rigid acoustic driver dome eliminates distortion even at 115dB studio reference volume.',0.95,-0.35,0.25,2.1,-0.2,1.5),(2,1,'Zero-Gravity Spring Steel Headband','Breathable micro-mesh suspension canopy distributes weight evenly for all-day comfort.',0,1.25,0,0,2.2,2),(3,1,'Tactile Digital Crown & ANC Toggle','Precision-milled rotary dial for granular volume control and instant transparency mode switching.',-0.95,-0.55,0.35,-2.1,-0.4,1.6),(4,2,'200MP Periscope Camera Array','Laser autofocus, sapphire lens rings, and 10x lossless optical zoom with gimbal OIS.',-0.28,0.72,-0.12,-1.2,1.1,-1.8),(5,2,'3000-Nit LTPO Infinity Display','1Hz–144Hz adaptive refresh rate with ultrasonic under-display fingerprint scanner.',0,0.1,0.12,0,0.2,2.3),(6,2,'Aerospace Titanium Rail & Action Key','Programmable tactile shortcut button for instant camera shutter or AI voice assistant.',0.65,0.3,0,2,0.4,1.2),(7,3,'Sapphire Telemetry Watch Face','Scratch-proof sapphire crystal with real-time compass, heart-rate zone, and elevation rings.',0,0.1,0.32,0,0.3,2.1),(8,3,'Haptic Guarded Digital Crown','Machined titanium ridges allow easy rotation even while wearing diving or winter gloves.',0.72,0.15,0.05,1.9,0.3,1.1),(9,3,'Bio-Optical Ceramic Back Array','8-photodiode array measures SpO2, heart rate variability, and arterial stiffness continuously.',0,-0.05,-0.28,0.3,-0.2,-2.2),(10,4,'Ergonomic Acoustic Stems','Capacitive force sensors let you pinch to switch ANC modes and swipe to adjust volume.',-0.45,0.65,0.15,-1.6,1.2,1.6),(11,4,'MagSafe Telemetry Charging Case','Precision-hinged anodized cradle with built-in UWB Find My speaker and status light bar.',0,-0.35,0.45,0,-0.2,2.1),(12,5,'360° Acoustic Waveguide Grille','Laser-perforated acoustic mesh projects uniform sound dispersion across every corner of your room.',0,0.2,0.75,0,0.4,2.2),(13,5,'Reactive Sub-Bass Levitation Ring','Iso-acoustic dampened base with synchronized LED halo that pulses to low-frequency bass lines.',0,-0.75,0.55,1.2,-0.6,1.9),(14,6,'50mm Graphene Chamber','Pinpoint directional footsteps and cinematic sub-bass with zero harmonic crossover.',0.95,-0.35,0.25,2,-0.2,1.5),(15,7,'1-Inch Cinema Sensor Module','Captures 400% more light in night mode with variable mechanical aperture f/1.4–f/4.0.',-0.28,0.72,-0.12,-1.2,1.1,-1.8),(16,8,'Solar Sapphire Ring','Photovoltaic perimeter ring harvests ambient sunlight to extend battery life by up to 35%.',0,0.1,0.32,0,0.3,2.1);
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
) ENGINE=InnoDB AUTO_INCREMENT=24 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `product_variants`
--

LOCK TABLES `product_variants` WRITE;
/*!40000 ALTER TABLE `product_variants` DISABLE KEYS */;
INSERT INTO `product_variants` VALUES (1,1,'Obsidian Matte Black','#18181b','#27272a','#38bdf8','MATTE',0.2,0.78,0.00,18),(2,1,'Titanium Silver Alloy','#cbd5e1','#475569','#6366f1','TITANIUM',0.88,0.22,20.00,12),(3,1,'Cyber Neon Pulse','#0f172a','#1e1b4b','#00f5d4','NEON',0.55,0.3,30.00,8),(4,1,'Crimson Metallic Edition','#991b1b','#1f2937','#f59e0b','METALLIC',0.92,0.18,25.00,10),(5,2,'Natural Grade-5 Titanium','#94a3b8','#334155','#38bdf8','TITANIUM',0.9,0.24,0.00,15),(6,2,'Stealth Matte Phantom','#0f172a','#1e293b','#a855f7','MATTE',0.18,0.8,0.00,10),(7,2,'Aurora Cyber Matrix','#111827','#064e3b','#10b981','NEON',0.65,0.25,50.00,6),(8,2,'Desert Gold Metallic','#d4af37','#451a03','#fbbf24','METALLIC',0.95,0.15,40.00,8),(9,3,'Titanium Case / International Orange','#94a3b8','#ea580c','#f97316','TITANIUM',0.85,0.25,0.00,20),(10,3,'Carbon Black Matte / Stealth Band','#18181b','#09090b','#22d3ee','MATTE',0.22,0.75,0.00,15),(11,3,'Cyber Pulse Neon / Electric Blue','#1e293b','#1d4ed8','#00f5d4','NEON',0.6,0.3,20.00,10),(12,4,'Graphite Matte Stealth','#1e293b','#0f172a','#38bdf8','MATTE',0.25,0.7,0.00,25),(13,4,'Glacier Metallic Pearl','#f1f5f9','#cbd5e1','#06b6d4','METALLIC',0.8,0.2,0.00,20),(14,4,'Neon Violet Synth','#2e1065','#09090b','#e879f9','NEON',0.6,0.28,15.00,12),(15,5,'Dark Matter Neon Cyan','#111827','#1f2937','#00f5d4','NEON',0.5,0.35,0.00,14),(16,5,'Brushed Bronze Titanium','#78350f','#27272a','#f59e0b','TITANIUM',0.88,0.24,20.00,8),(17,5,'Studio Matte Charcoal','#27272a','#3f3f46','#818cf8','MATTE',0.2,0.78,0.00,10),(18,6,'Cyber Magenta Neon','#09090b','#18181b','#f43f5e','NEON',0.6,0.28,0.00,20),(19,6,'Arctic Matte White','#f8fafc','#cbd5e1','#0ea5e9','MATTE',0.15,0.72,0.00,18),(20,7,'Cobalt Metallic Blue','#1e3a8a','#0f172a','#38bdf8','METALLIC',0.9,0.18,0.00,15),(21,7,'Emerald Titanium','#065f46','#111827','#34d399','TITANIUM',0.85,0.24,20.00,15),(22,8,'Forged Matte Carbon / Volt Lime','#18181b','#3f6212','#a3e635','MATTE',0.2,0.75,0.00,25),(23,8,'Silver Titanium / Sky Cyan','#94a3b8','#0369a1','#38bdf8','TITANIUM',0.85,0.25,15.00,20);
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
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `products`
--

LOCK TABLES `products` WRITE;
/*!40000 ALTER TABLE `products` DISABLE KEYS */;
INSERT INTO `products` VALUES (1,1,'Aether Pro Max ANC','aether-pro-max-anc','AETH-HP-001','Aether Audio','45mm Beryllium Planar Drivers with 60-Hour Adaptive ANC','Engineered with CNC-machined aluminum earcups, memory-foam acoustic seals, and dual-chip active noise cancellation. Rotate in 360° and customize the anodized shell, headband arch, and neon acoustic ring in real time.',399.00,349.00,42,1,1,'{\"Driver\":\"45mm Custom Beryllium Planar Magnetic\",\"Noise Cancellation\":\"Hybrid 8-Mic Adaptive ANC (-48dB)\",\"Battery Life\":\"60 Hours (ANC On) / 80 Hours (Standard)\",\"Connectivity\":\"Bluetooth 5.4 Ultra-Lossless + USB-C DAC\",\"Weight\":\"312g Aerospace Alloy Frame\",\"Audio\":\"Dolby Atmos Spatial Audio + Head Tracking\"}','FLAGSHIP 3D',4.95,128,'2026-10-27 13:06:32.543626'),(2,2,'Nova X1 Ultra 5G','nova-x1-ultra-5g','NOVA-PH-002','Nova Mobile','Grade-5 Titanium Unibody • 200MP Periscope Quad Camera','Experience desktop-class raytracing and AI photography in a Grade-5 Titanium enclosure. Features a 6.85\" 3000-nit LTPO OLED borderless display, periscope 10x optical zoom, and customizable matte/titanium back glass.',1099.00,999.00,35,1,1,'{\"Display\":\"6.85\\\" 144Hz LTPO AMOLED (3200 x 1440, 3000 nits)\",\"Processor\":\"3nm Quantum Core X4 Octa-Core + Neural NPU\",\"Camera\":\"200MP Main OIS + 50MP 10x Periscope + 50MP Ultrawide\",\"Battery\":\"5600mAh Silicon-Carbon • 100W HyperCharge\",\"Storage\":\"512GB UFS 4.0 + 16GB LPDDR5X RAM\",\"Protection\":\"IP68 Water Resistant • Ceramic Shield Pro\"}','BEST SELLER',4.92,214,'2026-10-27 13:06:32.579260'),(3,3,'Chronos Titan S9 Ultra','chronos-titan-s9-ultra','CHRO-SW-003','Chronos Wear','Sapphire Dual-Frequency GPS Watch with Bio-Optical Sensor Array','Built for endurance athletes and executives alike. Features a flat sapphire crystal front, precision haptics digital crown, ECG + SpO2 health suite, and interchangeable fluoroelastomer or titanium link bands.',449.00,429.00,50,1,1,'{\"Case\":\"49mm Aerospace Titanium • 100m Dive Rated (EN13319)\",\"Display\":\"Sapphire Always-On Retina OLED (2500 nits)\",\"Sensors\":\"ECG, Blood Oxygen, Skin Temp, Depth Gauge, Altimeter\",\"GPS\":\"Precision Dual-Frequency L1 + L5 Satellite Navigation\",\"Battery\":\"72 Hours Normal Use / 140 Hours Low Power\",\"Strap\":\"Quick-Release Tactical Fluoroelastomer\"}','NEW RELEASE',4.89,94,'2026-10-27 13:06:32.611765'),(4,4,'SonicPods Pro 3 ANC','sonicpods-pro-3-anc','SONI-EB-004','Aether Audio','Dual-Driver Lossless TWS Earbuds with MagSafe Display Case','Pocket-sized audiophile precision. Dual coaxial drivers (11mm woofer + planar tweeter) inside ergonomic acoustic pods, paired with a wireless MagSafe charging case featuring an LED battery telemetry bar.',269.00,249.00,64,1,1,'{\"Drivers\":\"11mm Dynamic Woofer + 6mm Planar Micro-Tweeter\",\"ANC\":\"Real-Time Ear Canal Calibration ANC (-45dB)\",\"Codec\":\"LDAC, aptX Lossless, AAC (24-bit/96kHz)\",\"Battery\":\"9 Hours Buds / 38 Hours with MagSafe Case\",\"Latency\":\"28ms Ultra-Low Gaming Mode\",\"Resistance\":\"IP55 Sweat & Dust Resistant (Buds & Case)\"}','AUDIOPHILE PICK',4.87,76,'2026-10-27 13:06:32.632630'),(5,5,'PulseSphere 360 Spatial','pulsesphere-360-spatial','PULS-SP-005','Pulse Acoustics','360° Omnidirectional Acoustic Core with Reactive Halo Lighting','Fill any room with holographic 3D sound. PulseSphere combines a downward-firing 120W neodymium subwoofer with six radial array tweeters and a customizable RGBW acoustic levitation light ring.',329.00,299.00,28,1,1,'{\"Output\":\"180W Peak Class-D Bi-Amplified Architecture\",\"Frequency\":\"28Hz – 40,000Hz Hi-Res Certified\",\"Acoustic\":\"6x Radial Horn Tweeters + 5.25\\\" High-Excursion Woofer\",\"Wireless\":\"Wi-Fi 6E AirPlay 2, Spotify Connect, Bluetooth 5.4\",\"Lighting\":\"Synchronized 64-LED Ambient Acoustic Halo\",\"Calibration\":\"Automatic Room Sonar EQ Tuning\"}','360° AUDIO',4.91,63,'2026-10-27 13:06:32.649558'),(6,1,'HyperWave Cyber Pro Headset','hyperwave-cyber-pro-headset','HYPR-HP-006','HyperWave Gaming','7.1.4 Spatial Gaming & Studio Monitoring Headset','Built for esports pros and 3D audio creators. Features ultra-light carbon-infused earcups, dual wireless 2.4GHz + Bluetooth simultaneous mixing, and customizable neon edge lighting.',229.00,199.00,38,0,1,'{\"Driver\":\"50mm Graphene Diaphragm Drivers\",\"Wireless\":\"10ms 2.4GHz Quantum Dongle + Bluetooth 5.3\",\"Microphone\":\"Detachable Broadcast Cardioid AI Boom Mic\",\"Battery\":\"50 Hours Continuous Play\",\"Weight\":\"285g Ultra-Light Frame\"}','LOW LATENCY',4.84,52,'2026-10-27 13:06:32.667974'),(7,2,'Vertex Quantum Pro 16','vertex-quantum-pro-16','VERT-PH-007','Vertex Labs','Sapphire Ceramic Chassis • Holographic AI Camera System','A minimalist masterpiece combining a vapor-chamber cooled processor, under-screen front camera for a 100% uninterrupted bezel-free display, and studio-grade 8K ProRes video recording.',899.00,849.00,30,0,1,'{\"Display\":\"6.7\\\" True Full-Screen AMOLED (No Notch/Cutout)\",\"Chipset\":\"Vertex Tensor G9 3nm Processor\",\"Camera\":\"50MP 1-Inch Sensor + 64MP 5x Telephoto\",\"Charging\":\"80W Wired + 50W Magnetic Wireless\",\"Material\":\"Micro-Crystalline Ceramic Back + Titanium Frame\"}','AI FLAGSHIP',4.86,47,'2026-10-27 13:06:32.681984'),(8,3,'AeroFit Pulse Carbon GPS','aerofit-pulse-carbon-gps','AERO-SW-008','Chronos Wear','Forged Carbon Fiber Bezel • 21-Day Solar Assisted Battery','Featherweight 38g forged carbon smartwatch engineered for marathoners and triathletes. Includes offline topographic maps, VO2 Max recovery coaching, and customizable anodized accents.',349.00,319.00,45,0,1,'{\"Bezel\":\"Forged Carbon Fiber + DLC Titanium Crown\",\"Battery\":\"21 Days Smartwatch Mode / 60 Hours Dual-Band GPS\",\"Weight\":\"38g Ultra-Light Chassis\",\"Waterproof\":\"10 ATM Swimming & Surfing Ready\"}','21-DAY BATTERY',4.82,39,'2026-10-27 13:06:32.694322');
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
) ENGINE=InnoDB AUTO_INCREMENT=17 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `reviews`
--

LOCK TABLES `reviews` WRITE;
/*!40000 ALTER TABLE `reviews` DISABLE KEYS */;
INSERT INTO `reviews` VALUES (1,1,2,'Alex Mercer',5,'The 3D customization matched the exact finish I received!','Being able to rotate the 3D model, test the Titanium vs Matte finish, and inspect the ports before buying is a game changer. Build quality is 10/10.',1,'2026-10-27 13:06:32.574261'),(2,1,NULL,'Elena Vance',5,'Incredible hardware & super fast delivery','Ordered the Cyber Neon edition and it looks even better in person. Battery life and build quality exceed expectations.',1,'2026-10-27 13:06:32.576660'),(3,2,2,'Alex Mercer',5,'The 3D customization matched the exact finish I received!','Being able to rotate the 3D model, test the Titanium vs Matte finish, and inspect the ports before buying is a game changer. Build quality is 10/10.',1,'2026-10-27 13:06:32.605968'),(4,2,NULL,'Elena Vance',5,'Incredible hardware & super fast delivery','Ordered the Cyber Neon edition and it looks even better in person. Battery life and build quality exceed expectations.',1,'2026-10-27 13:06:32.606773'),(5,3,2,'Alex Mercer',5,'The 3D customization matched the exact finish I received!','Being able to rotate the 3D model, test the Titanium vs Matte finish, and inspect the ports before buying is a game changer. Build quality is 10/10.',1,'2026-10-27 13:06:32.629373'),(6,3,NULL,'Elena Vance',5,'Incredible hardware & super fast delivery','Ordered the Cyber Neon edition and it looks even better in person. Battery life and build quality exceed expectations.',1,'2026-10-27 13:06:32.630300'),(7,4,2,'Alex Mercer',5,'The 3D customization matched the exact finish I received!','Being able to rotate the 3D model, test the Titanium vs Matte finish, and inspect the ports before buying is a game changer. Build quality is 10/10.',1,'2026-10-27 13:06:32.647200'),(8,4,NULL,'Elena Vance',5,'Incredible hardware & super fast delivery','Ordered the Cyber Neon edition and it looks even better in person. Battery life and build quality exceed expectations.',1,'2026-10-27 13:06:32.647743'),(9,5,2,'Alex Mercer',5,'The 3D customization matched the exact finish I received!','Being able to rotate the 3D model, test the Titanium vs Matte finish, and inspect the ports before buying is a game changer. Build quality is 10/10.',1,'2026-10-27 13:06:32.665349'),(10,5,NULL,'Elena Vance',5,'Incredible hardware & super fast delivery','Ordered the Cyber Neon edition and it looks even better in person. Battery life and build quality exceed expectations.',1,'2026-10-27 13:06:32.666038'),(11,6,2,'Alex Mercer',5,'The 3D customization matched the exact finish I received!','Being able to rotate the 3D model, test the Titanium vs Matte finish, and inspect the ports before buying is a game changer. Build quality is 10/10.',1,'2026-10-27 13:06:32.679362'),(12,6,NULL,'Elena Vance',5,'Incredible hardware & super fast delivery','Ordered the Cyber Neon edition and it looks even better in person. Battery life and build quality exceed expectations.',1,'2026-10-27 13:06:32.680005'),(13,7,2,'Alex Mercer',5,'The 3D customization matched the exact finish I received!','Being able to rotate the 3D model, test the Titanium vs Matte finish, and inspect the ports before buying is a game changer. Build quality is 10/10.',1,'2026-10-27 13:06:32.691148'),(14,7,NULL,'Elena Vance',5,'Incredible hardware & super fast delivery','Ordered the Cyber Neon edition and it looks even better in person. Battery life and build quality exceed expectations.',1,'2026-10-27 13:06:32.691977'),(15,8,2,'Alex Mercer',5,'The 3D customization matched the exact finish I received!','Being able to rotate the 3D model, test the Titanium vs Matte finish, and inspect the ports before buying is a game changer. Build quality is 10/10.',1,'2026-10-27 13:06:32.704123'),(16,8,NULL,'Elena Vance',5,'Incredible hardware & super fast delivery','Ordered the Cyber Neon edition and it looks even better in person. Battery life and build quality exceed expectations.',1,'2026-10-27 13:06:32.705194');
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
INSERT INTO `users` VALUES (1,'Store Administrator','admin@3dstore.com','$2a$10$AVyMY07tj8bcutN.bmspFuKmLd4oqMvc3BryPyp4lPm0k2eLsbygW','ADMIN','+1 (555) 010-9999','{\"street\":\"742 Innovation Way\",\"city\":\"San Francisco\",\"state\":\"CA\",\"zipCode\":\"94107\",\"country\":\"United States\"}','2026-10-27 13:06:32.514869'),(2,'Alex Mercer','alex@example.com','$2a$10$/3bk/Ec9eol.GdM9WvPvxufM.hf9KAtTxvonXfMeSyDKWOJKbex1e','CUSTOMER','+1 (555) 234-5678','{\"street\":\"1200 Tech Plaza Apt 4B\",\"city\":\"Austin\",\"state\":\"TX\",\"zipCode\":\"78701\",\"country\":\"United States\"}','2026-10-27 13:06:32.522935');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping events for database '3d_electronics_db'
--

--
-- Dumping routines for database '3d_electronics_db'
--
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-10-27 15:03:00
