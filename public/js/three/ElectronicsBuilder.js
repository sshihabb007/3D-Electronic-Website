import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';

/**
 * ElectronicsBuilder
 * Generates multi-part interactive 3D electronics models:
 * - Over-Ear ANC Headphones (PROCEDURAL_HEADPHONE)
 * - Flagship 5G Smartphone (PROCEDURAL_PHONE)
 * - Sapphire AMOLED Smartwatch (PROCEDURAL_WATCH)
 * - Wireless ANC Earbuds + Case (PROCEDURAL_EARBUDS)
 * - 360° Spatial Speaker (PROCEDURAL_SPEAKER)
 * - Pro Creator / Gaming Laptop (PROCEDURAL_LAPTOP)
 * - Spatial VR / MR Headset (PROCEDURAL_VR_HEADSET)
 * - 8K Mirrorless Cinema Camera (PROCEDURAL_CAMERA)
 * - Handheld Gaming Console Deck (PROCEDURAL_CONSOLE)
 * - Custom Uploaded .GLB / .GLTF 3D Models (GLB_FILE)
 */
export class ElectronicsBuilder {
  constructor() {
    this.gltfLoader = new GLTFLoader();
    const dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath(
      'https://www.gstatic.com/draco/versioned/decoders/1.5.7/',
    );
    this.gltfLoader.setDRACOLoader(dracoLoader);
  }

  createMaterialPalette(variant = {}) {
    const primaryHex = variant.primaryHex || '#18181b';
    const secondaryHex = variant.secondaryHex || '#334155';
    const accentHex = variant.accentHex || '#38bdf8';
    const finishType = (variant.finishType || 'MATTE').toUpperCase();

    let metalness =
      variant.metalness !== undefined ? Number(variant.metalness) : 0.25;
    let roughness =
      variant.roughness !== undefined ? Number(variant.roughness) : 0.7;
    let clearcoat = 0.1;
    let emissiveIntensity = 0.25;

    if (finishType === 'MATTE') {
      metalness = 0.18;
      roughness = 0.78;
      clearcoat = 0.05;
      emissiveIntensity = 0.2;
    } else if (finishType === 'METALLIC') {
      metalness = 0.92;
      roughness = 0.16;
      clearcoat = 0.6;
      emissiveIntensity = 0.35;
    } else if (finishType === 'TITANIUM') {
      metalness = 0.86;
      roughness = 0.25;
      clearcoat = 0.35;
      emissiveIntensity = 0.3;
    } else if (finishType === 'GLOSSY') {
      metalness = 0.3;
      roughness = 0.06;
      clearcoat = 1.0;
      emissiveIntensity = 0.35;
    } else if (finishType === 'NEON') {
      metalness = 0.58;
      roughness = 0.26;
      clearcoat = 0.5;
      emissiveIntensity = 1.35;
    }

    const primaryMat = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color(primaryHex),
      metalness,
      roughness,
      clearcoat,
      clearcoatRoughness: 0.15,
    });
    primaryMat.userData = { role: 'primary' };

    const secondaryMat = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color(secondaryHex),
      metalness: Math.max(0.1, metalness * 0.65),
      roughness: Math.min(0.9, roughness + 0.12),
      clearcoat: clearcoat * 0.5,
    });
    secondaryMat.userData = { role: 'secondary' };

    const accentMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(accentHex),
      emissive: new THREE.Color(accentHex),
      emissiveIntensity,
      metalness: 0.5,
      roughness: 0.2,
    });
    accentMat.userData = { role: 'accent' };

    const chromeMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#e2e8f0'),
      metalness: 0.95,
      roughness: 0.12,
    });
    chromeMat.userData = { role: 'chrome' };

    const darkCoreMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#09090b'),
      metalness: 0.4,
      roughness: 0.6,
    });

    const copperMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#d97706'),
      metalness: 0.9,
      roughness: 0.2,
    });

    const glassMat = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color('#020617'),
      metalness: 0.1,
      roughness: 0.05,
      transmission: 0.25,
      transparent: true,
      opacity: 0.94,
      clearcoat: 1.0,
    });

    return {
      primaryMat,
      secondaryMat,
      accentMat,
      chromeMat,
      darkCoreMat,
      copperMat,
      glassMat,
    };
  }

  tagMesh(mesh, role, explodeVec = [0, 0, 0]) {
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    mesh.userData.materialRole = role;
    mesh.userData.basePosition = mesh.position.clone();
    mesh.userData.explodeVector = new THREE.Vector3(
      explodeVec[0],
      explodeVec[1],
      explodeVec[2],
    );
    return mesh;
  }

  async buildProductModel(config3d = {}, variant = {}) {
    const modelType = config3d.modelType || 'PROCEDURAL_HEADPHONE';
    const materials = this.createMaterialPalette(variant);

    if (modelType === 'GLB_FILE' && config3d.glbFileUrl) {
      try {
        const glbGroup = await this.loadExternalGlb(
          config3d.glbFileUrl,
          materials,
        );
        return { root: glbGroup, materials };
      } catch (err) {
        console.warn(
          'Fallback to procedural 3D model due to GLB load error:',
          err,
        );
      }
    }

    let root;
    switch (modelType) {
      case 'PROCEDURAL_PHONE':
        root = this.buildSmartphone(materials, variant);
        break;
      case 'PROCEDURAL_WATCH':
        root = this.buildSmartwatch(materials, variant);
        break;
      case 'PROCEDURAL_EARBUDS':
        root = this.buildEarbuds(materials, variant);
        break;
      case 'PROCEDURAL_SPEAKER':
        root = this.buildSpeaker(materials, variant);
        break;
      case 'PROCEDURAL_LAPTOP':
        root = this.buildLaptop(materials, variant);
        break;
      case 'PROCEDURAL_VR_HEADSET':
        root = this.buildVRHeadset(materials, variant);
        break;
      case 'PROCEDURAL_CAMERA':
        root = this.buildCamera(materials, variant);
        break;
      case 'PROCEDURAL_CONSOLE':
        root = this.buildConsole(materials, variant);
        break;
      case 'PROCEDURAL_HEADPHONE':
      default:
        root = this.buildHeadphones(materials, variant);
        break;
    }

    const scale = Number(config3d.defaultScale || 1.0);
    root.scale.setScalar(scale);
    return { root, materials };
  }

  loadExternalGlb(url, materials) {
    return new Promise((resolve, reject) => {
      this.gltfLoader.load(
        url,
        (gltf) => {
          const model = gltf.scene;
          const box = new THREE.Box3().setFromObject(model);
          const size = box.getSize(new THREE.Vector3());
          const center = box.getCenter(new THREE.Vector3());

          const maxDim = Math.max(size.x, size.y, size.z) || 1;
          const normScale = 2.2 / maxDim;
          model.scale.setScalar(normScale);
          model.position.sub(center.multiplyScalar(normScale));

          let meshIndex = 0;
          model.traverse((child) => {
            if (child.isMesh) {
              child.castShadow = true;
              child.receiveShadow = true;
              child.userData.basePosition = child.position.clone();
              const dir = child.position.clone().normalize();
              if (dir.lengthSq() < 0.01) {
                dir.set(
                  (meshIndex % 2 === 0 ? 1 : -1) * 0.3,
                  0.2,
                  (meshIndex % 3 === 0 ? 1 : -1) * 0.3,
                );
              }
              child.userData.explodeVector = dir.multiplyScalar(0.45);

              if (meshIndex % 5 === 0) {
                child.material = materials.accentMat;
                child.userData.materialRole = 'accent';
              } else if (meshIndex % 2 === 0) {
                child.material = materials.primaryMat;
                child.userData.materialRole = 'primary';
              } else {
                child.material = materials.secondaryMat;
                child.userData.materialRole = 'secondary';
              }
              meshIndex++;
            }
          });

          const wrapper = new THREE.Group();
          wrapper.add(model);
          resolve(wrapper);
        },
        undefined,
        (err) => reject(err),
      );
    });
  }

  /**
   * 1. FLAGSHIP OVER-EAR ANC HEADPHONES
   */
  buildHeadphones(mats) {
    const group = new THREE.Group();

    const archGeo = new THREE.TorusGeometry(0.95, 0.095, 28, 72, Math.PI);
    const arch = new THREE.Mesh(archGeo, mats.primaryMat);
    arch.position.set(0, 0.18, 0);
    arch.scale.set(1, 1.08, 0.62);
    group.add(this.tagMesh(arch, 'primary', [0, 0.45, 0]));

    const padGeo = new THREE.TorusGeometry(0.89, 0.068, 20, 60, Math.PI * 0.82);
    const pad = new THREE.Mesh(padGeo, mats.secondaryMat);
    pad.position.set(0, 0.17, 0);
    pad.rotation.z = Math.PI * 0.09;
    pad.scale.set(1, 1.06, 0.56);
    group.add(this.tagMesh(pad, 'secondary', [0, 0.25, 0]));

    [-1, 1].forEach((side) => {
      const sideX = side * 0.94;
      const tiltAngle = side * -0.14;

      const sliderGeo = new THREE.CylinderGeometry(0.036, 0.036, 0.46, 24);
      const slider = new THREE.Mesh(sliderGeo, mats.chromeMat);
      slider.position.set(side * 0.95, -0.02, 0);
      group.add(this.tagMesh(slider, 'chrome', [side * 0.2, 0.15, 0]));

      const yokeGeo = new THREE.TorusGeometry(0.28, 0.028, 16, 36, Math.PI);
      const yoke = new THREE.Mesh(yokeGeo, mats.chromeMat);
      yoke.position.set(sideX, -0.35, 0);
      yoke.rotation.y = Math.PI / 2;
      yoke.rotation.x = Math.PI;
      group.add(this.tagMesh(yoke, 'chrome', [side * 0.35, 0, 0]));

      const cupGeo = new THREE.CylinderGeometry(0.36, 0.42, 0.24, 48);
      const cup = new THREE.Mesh(cupGeo, mats.primaryMat);
      cup.position.set(side * 0.96, -0.42, 0);
      cup.rotation.z = Math.PI / 2 + tiltAngle;
      cup.scale.set(1.22, 1, 0.95);
      group.add(this.tagMesh(cup, 'primary', [side * 0.65, -0.08, 0]));

      const haloGeo = new THREE.TorusGeometry(0.36, 0.018, 20, 48);
      const halo = new THREE.Mesh(haloGeo, mats.accentMat);
      halo.position.set(side * 1.07, -0.43, 0);
      halo.rotation.y = Math.PI / 2;
      halo.rotation.x = -tiltAngle;
      halo.scale.set(0.95, 1.22, 1);
      group.add(this.tagMesh(halo, 'accent', [side * 0.9, -0.1, 0]));

      const capGeo = new THREE.CylinderGeometry(0.34, 0.34, 0.03, 48);
      const cap = new THREE.Mesh(capGeo, mats.secondaryMat);
      cap.position.set(side * 1.09, -0.43, 0);
      cap.rotation.z = Math.PI / 2 + tiltAngle;
      cap.scale.set(1.2, 1, 0.92);
      group.add(this.tagMesh(cap, 'secondary', [side * 1.08, -0.12, 0]));

      const driverGeo = new THREE.CylinderGeometry(0.26, 0.22, 0.12, 36);
      const driver = new THREE.Mesh(driverGeo, mats.copperMat);
      driver.position.set(side * 0.88, -0.41, 0);
      driver.rotation.z = Math.PI / 2 + tiltAngle;
      group.add(this.tagMesh(driver, 'copper', [side * 0.3, -0.05, 0]));

      const cushionGeo = new THREE.TorusGeometry(0.32, 0.095, 28, 48);
      const cushion = new THREE.Mesh(cushionGeo, mats.secondaryMat);
      cushion.position.set(side * 0.8, -0.4, 0);
      cushion.rotation.y = Math.PI / 2;
      cushion.rotation.x = -tiltAngle;
      cushion.scale.set(0.94, 1.22, 1);
      group.add(this.tagMesh(cushion, 'secondary', [side * -0.15, -0.02, 0]));

      const grilleGeo = new THREE.CylinderGeometry(0.3, 0.3, 0.02, 36);
      const grille = new THREE.Mesh(grilleGeo, mats.darkCoreMat);
      grille.position.set(side * 0.83, -0.4, 0);
      grille.rotation.z = Math.PI / 2 + tiltAngle;
      grille.scale.set(1.2, 1, 0.92);
      group.add(this.tagMesh(grille, 'dark', [side * 0.05, 0, 0]));
    });

    const crownGeo = new THREE.CylinderGeometry(0.055, 0.055, 0.09, 24);
    const crown = new THREE.Mesh(crownGeo, mats.accentMat);
    crown.position.set(-0.98, -0.12, 0.28);
    crown.rotation.x = Math.PI / 4;
    group.add(this.tagMesh(crown, 'accent', [-0.7, 0.2, 0.45]));

    return group;
  }

  /**
   * 2. FLAGSHIP 5G TITANIUM SMARTPHONE
   */
  buildSmartphone(mats, variant = {}) {
    const group = new THREE.Group();

    const bodyGeo = new THREE.BoxGeometry(1.18, 2.38, 0.14);
    const body = new THREE.Mesh(bodyGeo, mats.primaryMat);
    group.add(this.tagMesh(body, 'primary', [0, 0, 0]));

    const railGeo = new THREE.CylinderGeometry(0.072, 0.072, 2.34, 24);
    [-0.58, 0.58].forEach((rx) => {
      const rail = new THREE.Mesh(railGeo, mats.primaryMat);
      rail.position.set(rx, 0, 0);
      group.add(this.tagMesh(rail, 'primary', [rx * 0.4, 0, 0]));
    });

    const backPlateGeo = new THREE.BoxGeometry(1.14, 2.32, 0.025);
    const backPlate = new THREE.Mesh(backPlateGeo, mats.secondaryMat);
    backPlate.position.set(0, 0, -0.072);
    group.add(this.tagMesh(backPlate, 'secondary', [0, 0, -0.55]));

    const batteryGeo = new THREE.BoxGeometry(0.86, 1.45, 0.05);
    const battery = new THREE.Mesh(batteryGeo, mats.copperMat);
    battery.position.set(0, -0.22, -0.02);
    group.add(this.tagMesh(battery, 'copper', [0, -0.15, -0.28]));

    const chipGeo = new THREE.BoxGeometry(0.38, 0.38, 0.04);
    const chip = new THREE.Mesh(chipGeo, mats.accentMat);
    chip.position.set(0.18, 0.65, 0.02);
    group.add(this.tagMesh(chip, 'accent', [0.25, 0.2, 0.25]));

    const screenTex = this.createSmartphoneScreenTexture(
      variant.accentHex || '#38bdf8',
      variant.primaryHex || '#1e293b',
    );
    const screenMat = new THREE.MeshStandardMaterial({
      map: screenTex,
      emissive: new THREE.Color('#ffffff'),
      emissiveMap: screenTex,
      emissiveIntensity: 0.55,
      roughness: 0.08,
      metalness: 0.1,
    });
    const screenGeo = new THREE.PlaneGeometry(1.11, 2.28);
    const screen = new THREE.Mesh(screenGeo, screenMat);
    screen.position.set(0, 0, 0.075);
    group.add(this.tagMesh(screen, 'glass', [0, 0, 0.55]));

    const islandGeo = new THREE.BoxGeometry(0.32, 0.075, 0.01);
    const island = new THREE.Mesh(islandGeo, mats.darkCoreMat);
    island.position.set(0, 1.02, 0.08);
    group.add(this.tagMesh(island, 'dark', [0, 0.1, 0.68]));

    const camIslandGeo = new THREE.BoxGeometry(0.56, 0.64, 0.05);
    const camIsland = new THREE.Mesh(camIslandGeo, mats.primaryMat);
    camIsland.position.set(-0.24, 0.74, -0.1);
    group.add(this.tagMesh(camIsland, 'primary', [-0.2, 0.2, -0.78]));

    const lensPositions = [
      [-0.38, 0.9, -0.13],
      [-0.38, 0.58, -0.13],
      [-0.1, 0.74, -0.13],
    ];
    lensPositions.forEach(([lx, ly, lz], idx) => {
      const ringGeo = new THREE.CylinderGeometry(0.115, 0.12, 0.045, 32);
      const ring = new THREE.Mesh(
        ringGeo,
        idx === 0 ? mats.accentMat : mats.chromeMat,
      );
      ring.position.set(lx, ly, lz);
      ring.rotation.x = Math.PI / 2;
      group.add(
        this.tagMesh(ring, idx === 0 ? 'accent' : 'chrome', [
          -0.3,
          0.25,
          -0.95 - idx * 0.08,
        ]),
      );

      const glassLensGeo = new THREE.CylinderGeometry(0.09, 0.09, 0.05, 24);
      const glassLens = new THREE.Mesh(glassLensGeo, mats.darkCoreMat);
      glassLens.position.set(lx, ly, lz - 0.004);
      glassLens.rotation.x = Math.PI / 2;
      group.add(
        this.tagMesh(glassLens, 'dark', [-0.3, 0.25, -1.0 - idx * 0.08]),
      );
    });

    const btnGeo = new THREE.BoxGeometry(0.03, 0.22, 0.045);
    const actionBtn = new THREE.Mesh(btnGeo, mats.accentMat);
    actionBtn.position.set(0.64, 0.45, 0);
    group.add(this.tagMesh(actionBtn, 'accent', [0.55, 0.1, 0]));

    const volBtn = new THREE.Mesh(
      new THREE.BoxGeometry(0.03, 0.38, 0.045),
      mats.chromeMat,
    );
    volBtn.position.set(-0.64, 0.35, 0);
    group.add(this.tagMesh(volBtn, 'chrome', [-0.55, 0.1, 0]));

    return group;
  }

  /**
   * 3. SAPPHIRE AMOLED SMARTWATCH
   */
  buildSmartwatch(mats, variant = {}) {
    const group = new THREE.Group();

    const caseGeo = new THREE.CylinderGeometry(0.68, 0.64, 0.28, 8);
    const watchCase = new THREE.Mesh(caseGeo, mats.primaryMat);
    watchCase.rotation.x = Math.PI / 2;
    watchCase.rotation.y = Math.PI / 8;
    watchCase.scale.set(1.0, 1.0, 1.15);
    group.add(this.tagMesh(watchCase, 'primary', [0, 0, 0]));

    const bezelGeo = new THREE.TorusGeometry(0.58, 0.055, 24, 48);
    const bezel = new THREE.Mesh(bezelGeo, mats.accentMat);
    bezel.position.set(0, 0, 0.15);
    bezel.scale.set(0.95, 1.08, 1);
    group.add(this.tagMesh(bezel, 'accent', [0, 0, 0.55]));

    const watchTex = this.createWatchFaceTexture(
      variant.accentHex || '#f97316',
    );
    const faceMat = new THREE.MeshStandardMaterial({
      map: watchTex,
      emissive: new THREE.Color('#ffffff'),
      emissiveMap: watchTex,
      emissiveIntensity: 0.7,
      roughness: 0.08,
    });
    const faceGeo = new THREE.CircleGeometry(0.55, 48);
    const face = new THREE.Mesh(faceGeo, faceMat);
    face.position.set(0, 0, 0.16);
    face.scale.set(0.95, 1.08, 1);
    group.add(this.tagMesh(face, 'glass', [0, 0, 0.42]));

    const coreGeo = new THREE.CylinderGeometry(0.42, 0.42, 0.08, 32);
    const core = new THREE.Mesh(coreGeo, mats.copperMat);
    core.rotation.x = Math.PI / 2;
    group.add(this.tagMesh(core, 'copper', [0, 0, 0.22]));

    const sensorGeo = new THREE.CylinderGeometry(0.44, 0.34, 0.08, 32);
    const sensor = new THREE.Mesh(sensorGeo, mats.darkCoreMat);
    sensor.position.set(0, 0, -0.16);
    sensor.rotation.x = Math.PI / 2;
    group.add(this.tagMesh(sensor, 'dark', [0, 0, -0.48]));

    const crownGeo = new THREE.CylinderGeometry(0.11, 0.11, 0.14, 24);
    const crown = new THREE.Mesh(crownGeo, mats.accentMat);
    crown.position.set(0.66, 0.18, 0.02);
    crown.rotation.z = Math.PI / 2;
    group.add(this.tagMesh(crown, 'accent', [0.65, 0.15, 0]));

    [1, -1].forEach((dir) => {
      const strapGroup = new THREE.Group();
      for (let i = 0; i < 5; i++) {
        const segGeo = new THREE.BoxGeometry(0.68 - i * 0.02, 0.16, 0.085);
        const seg = new THREE.Mesh(segGeo, mats.secondaryMat);
        const yOffset = dir * (0.76 + i * 0.17);
        const zCurve = -Math.pow(i * 0.14, 2) * 0.9;
        seg.position.set(0, yOffset, zCurve);
        seg.rotation.x = dir * i * 0.12;
        strapGroup.add(seg);
      }
      strapGroup.userData.materialRole = 'secondary';
      strapGroup.userData.basePosition = strapGroup.position.clone();
      strapGroup.userData.explodeVector = new THREE.Vector3(0, dir * 0.55, 0);
      group.add(strapGroup);
    });

    return group;
  }

  /**
   * 4. TRUE WIRELESS ANC EARBUDS + MAGSAFE CASE
   */
  buildEarbuds(mats) {
    const group = new THREE.Group();

    const caseBaseGeo = new THREE.BoxGeometry(1.42, 0.78, 0.56);
    const caseBase = new THREE.Mesh(caseBaseGeo, mats.primaryMat);
    caseBase.position.set(0, -0.42, 0);
    group.add(this.tagMesh(caseBase, 'primary', [0, -0.35, 0]));

    const ledGeo = new THREE.BoxGeometry(0.42, 0.035, 0.02);
    const ledBar = new THREE.Mesh(ledGeo, mats.accentMat);
    ledBar.position.set(0, -0.38, 0.285);
    group.add(this.tagMesh(ledBar, 'accent', [0, -0.35, 0.45]));

    const lidGeo = new THREE.BoxGeometry(1.42, 0.36, 0.56);
    const lid = new THREE.Mesh(lidGeo, mats.primaryMat);
    lid.position.set(0, 0.18, -0.24);
    lid.rotation.x = -0.58;
    group.add(this.tagMesh(lid, 'primary', [0, 0.55, -0.35]));

    [-1, 1].forEach((side) => {
      const budGroup = new THREE.Group();
      budGroup.position.set(side * 0.38, 0.42, 0.08);
      budGroup.rotation.z = side * -0.18;

      const podGeo = new THREE.SphereGeometry(0.24, 32, 24);
      const pod = new THREE.Mesh(podGeo, mats.secondaryMat);
      pod.scale.set(1.15, 0.92, 0.88);
      budGroup.add(pod);

      const stemGeo = new THREE.CylinderGeometry(0.068, 0.052, 0.56, 24);
      const stem = new THREE.Mesh(stemGeo, mats.primaryMat);
      stem.position.set(side * 0.08, -0.28, 0.02);
      budGroup.add(stem);

      const ringGeo = new THREE.TorusGeometry(0.066, 0.012, 16, 32);
      const ring = new THREE.Mesh(ringGeo, mats.accentMat);
      ring.position.set(side * 0.08, -0.45, 0.02);
      ring.rotation.x = Math.PI / 2;
      budGroup.add(ring);

      const tipGeo = new THREE.CylinderGeometry(0.11, 0.15, 0.14, 24);
      const tip = new THREE.Mesh(tipGeo, mats.accentMat);
      tip.position.set(side * -0.22, 0.04, 0.05);
      tip.rotation.z = side * 1.25;
      budGroup.add(tip);

      budGroup.userData.basePosition = budGroup.position.clone();
      budGroup.userData.explodeVector = new THREE.Vector3(
        side * 0.5,
        0.55,
        0.25,
      );
      group.add(budGroup);
    });

    return group;
  }

  /**
   * 5. 360° OMNIDIRECTIONAL SPATIAL SPEAKER
   */
  buildSpeaker(mats) {
    const group = new THREE.Group();

    const bodyGeo = new THREE.CylinderGeometry(0.68, 0.74, 1.48, 48);
    const body = new THREE.Mesh(bodyGeo, mats.primaryMat);
    group.add(this.tagMesh(body, 'primary', [0, 0, 0]));

    for (let i = -3; i <= 3; i++) {
      const finGeo = new THREE.TorusGeometry(
        0.71 - Math.abs(i) * 0.012,
        0.018,
        16,
        48,
      );
      const fin = new THREE.Mesh(
        finGeo,
        i === 0 ? mats.accentMat : mats.secondaryMat,
      );
      fin.position.set(0, i * 0.16, 0);
      fin.rotation.x = Math.PI / 2;
      group.add(
        this.tagMesh(fin, i === 0 ? 'accent' : 'secondary', [
          0,
          i * 0.12,
          0.35,
        ]),
      );
    }

    const wooferGeo = new THREE.ConeGeometry(0.52, 0.45, 36);
    const woofer = new THREE.Mesh(wooferGeo, mats.copperMat);
    woofer.position.set(0, -0.2, 0);
    group.add(this.tagMesh(woofer, 'copper', [0.75, 0, 0]));

    const topCapGeo = new THREE.CylinderGeometry(0.66, 0.68, 0.06, 48);
    const topCap = new THREE.Mesh(topCapGeo, mats.glassMat);
    topCap.position.set(0, 0.76, 0);
    group.add(this.tagMesh(topCap, 'glass', [0, 0.65, 0]));

    const topHaloGeo = new THREE.TorusGeometry(0.58, 0.02, 20, 48);
    const topHalo = new THREE.Mesh(topHaloGeo, mats.accentMat);
    topHalo.position.set(0, 0.795, 0);
    topHalo.rotation.x = Math.PI / 2;
    group.add(this.tagMesh(topHalo, 'accent', [0, 0.82, 0]));

    const baseHaloGeo = new THREE.TorusGeometry(0.74, 0.032, 20, 48);
    const baseHalo = new THREE.Mesh(baseHaloGeo, mats.accentMat);
    baseHalo.position.set(0, -0.78, 0);
    baseHalo.rotation.x = Math.PI / 2;
    group.add(this.tagMesh(baseHalo, 'accent', [0, -0.5, 0]));

    const plinthGeo = new THREE.CylinderGeometry(0.78, 0.84, 0.12, 48);
    const plinth = new THREE.Mesh(plinthGeo, mats.secondaryMat);
    plinth.position.set(0, -0.86, 0);
    group.add(this.tagMesh(plinth, 'secondary', [0, -0.7, 0]));

    return group;
  }

  /**
   * 6. PRO CREATOR & GAMING LAPTOP (PROCEDURAL_LAPTOP)
   */
  buildLaptop(mats, variant = {}) {
    const group = new THREE.Group();
    group.position.set(0, -0.25, 0);

    // CNC Unibody Base Deck
    const baseGeo = new THREE.BoxGeometry(2.15, 0.09, 1.48);
    const base = new THREE.Mesh(baseGeo, mats.primaryMat);
    base.position.set(0, -0.35, 0.15);
    group.add(this.tagMesh(base, 'primary', [0, -0.35, 0]));

    // Internal Dual Copper Vapor-Chamber Fans + Battery Pack (Revealed in Exploded View)
    const motherboardGeo = new THREE.BoxGeometry(1.75, 0.035, 1.05);
    const motherboard = new THREE.Mesh(motherboardGeo, mats.copperMat);
    motherboard.position.set(0, -0.32, 0.1);
    group.add(this.tagMesh(motherboard, 'copper', [0, 0.15, 0.2]));

    [-0.55, 0.55].forEach((fx) => {
      const fanGeo = new THREE.CylinderGeometry(0.24, 0.24, 0.045, 28);
      const fan = new THREE.Mesh(fanGeo, mats.accentMat);
      fan.position.set(fx, -0.31, -0.18);
      group.add(this.tagMesh(fan, 'accent', [fx * 0.5, 0.35, -0.2]));
    });

    // Recessed Backlit RGB / Tactile Keyboard Well
    const kbWellGeo = new THREE.BoxGeometry(1.88, 0.025, 0.76);
    const kbWell = new THREE.Mesh(kbWellGeo, mats.darkCoreMat);
    kbWell.position.set(0, -0.298, -0.04);
    group.add(this.tagMesh(kbWell, 'dark', [0, 0.45, 0]));

    // Under-key Neon Backlight Glow Strip
    const rgbStripGeo = new THREE.BoxGeometry(1.92, 0.015, 0.03);
    const rgbStrip = new THREE.Mesh(rgbStripGeo, mats.accentMat);
    rgbStrip.position.set(0, -0.34, 0.895);
    group.add(this.tagMesh(rgbStrip, 'accent', [0, -0.2, 0.55]));

    // Force-Touch Glass Trackpad
    const padGeo = new THREE.BoxGeometry(0.68, 0.02, 0.42);
    const trackpad = new THREE.Mesh(padGeo, mats.secondaryMat);
    trackpad.position.set(0, -0.296, 0.58);
    group.add(this.tagMesh(trackpad, 'secondary', [0, 0.25, 0.45]));

    // Hinged 16" OLED Display Assembly
    const lidGroup = new THREE.Group();
    lidGroup.position.set(0, 0.36, -0.68);
    lidGroup.rotation.x = -0.22;

    const lidShellGeo = new THREE.BoxGeometry(2.15, 1.38, 0.055);
    const lidShell = new THREE.Mesh(lidShellGeo, mats.primaryMat);
    lidGroup.add(lidShell);

    const screenTex = this.createLaptopScreenTexture(
      variant.accentHex || '#38bdf8',
      variant.primaryHex || '#1e293b',
    );
    const screenMat = new THREE.MeshStandardMaterial({
      map: screenTex,
      emissive: new THREE.Color('#ffffff'),
      emissiveMap: screenTex,
      emissiveIntensity: 0.65,
      roughness: 0.08,
    });
    const screenGeo = new THREE.PlaneGeometry(2.04, 1.28);
    const screen = new THREE.Mesh(screenGeo, screenMat);
    screen.position.set(0, 0, 0.03);
    lidGroup.add(screen);

    // Glowing Rear Lid Logo Emblem
    const emblemGeo = new THREE.RingGeometry(0.11, 0.16, 6);
    const emblem = new THREE.Mesh(emblemGeo, mats.accentMat);
    emblem.position.set(0, 0.05, -0.032);
    emblem.rotation.y = Math.PI;
    lidGroup.add(emblem);

    lidGroup.userData.basePosition = lidGroup.position.clone();
    lidGroup.userData.explodeVector = new THREE.Vector3(0, 0.55, -0.45);
    group.add(lidGroup);

    return group;
  }

  /**
   * 7. SPATIAL COMPUTING VR / MR HEADSET (PROCEDURAL_VR_HEADSET)
   */
  buildVRHeadset(mats) {
    const group = new THREE.Group();

    // Sculpted Curved Aluminum Chassis Visor Housing
    const visorGeo = new THREE.CylinderGeometry(
      0.88,
      0.88,
      0.72,
      48,
      1,
      false,
      -Math.PI * 0.38,
      Math.PI * 0.76,
    );
    const visor = new THREE.Mesh(visorGeo, mats.primaryMat);
    visor.position.set(0, 0, -0.15);
    visor.scale.set(1.1, 1, 0.68);
    group.add(this.tagMesh(visor, 'primary', [0, 0, 0.45]));

    // Front Laminated Spatial Glass Shield
    const glassVisorGeo = new THREE.CylinderGeometry(
      0.91,
      0.91,
      0.66,
      48,
      1,
      false,
      -Math.PI * 0.36,
      Math.PI * 0.72,
    );
    const glassVisor = new THREE.Mesh(glassVisorGeo, mats.glassMat);
    glassVisor.position.set(0, 0, -0.12);
    glassVisor.scale.set(1.1, 1, 0.68);
    group.add(this.tagMesh(glassVisor, 'glass', [0, 0, 0.85]));

    // Front EyeSight / Passthrough Neon Pulse Light Bar
    const lightBarGeo = new THREE.CylinderGeometry(
      0.92,
      0.92,
      0.06,
      48,
      1,
      false,
      -Math.PI * 0.28,
      Math.PI * 0.56,
    );
    const lightBar = new THREE.Mesh(lightBarGeo, mats.accentMat);
    lightBar.position.set(0, 0.02, -0.11);
    lightBar.scale.set(1.1, 1, 0.68);
    group.add(this.tagMesh(lightBar, 'accent', [0, 0.1, 1.05]));

    // Internal Dual 4K Micro-OLED Pancake Optical Lenses (Revealed in Exploded View)
    [-0.34, 0.34].forEach((lx) => {
      const lensGeo = new THREE.CylinderGeometry(0.24, 0.26, 0.14, 32);
      const lens = new THREE.Mesh(lensGeo, mats.copperMat);
      lens.position.set(lx, 0, 0.18);
      lens.rotation.x = Math.PI / 2;
      group.add(this.tagMesh(lens, 'copper', [lx * 0.5, 0, -0.25]));
    });

    // Breathable Facial Light-Seal Cushion
    const sealGeo = new THREE.TorusGeometry(0.68, 0.11, 24, 48);
    const seal = new THREE.Mesh(sealGeo, mats.secondaryMat);
    seal.position.set(0, 0, 0.12);
    seal.scale.set(1.25, 0.55, 0.85);
    group.add(this.tagMesh(seal, 'secondary', [0, 0, -0.35]));

    // Top Digital Immersion Crown Dial
    const crownGeo = new THREE.CylinderGeometry(0.08, 0.08, 0.07, 24);
    const crown = new THREE.Mesh(crownGeo, mats.accentMat);
    crown.position.set(0.52, 0.39, 0.28);
    group.add(this.tagMesh(crown, 'accent', [0.3, 0.45, 0.2]));

    // Rear 3D-Knitted Headband Strap Arch
    const strapGeo = new THREE.TorusGeometry(0.86, 0.085, 20, 48, Math.PI * 1.1);
    const strap = new THREE.Mesh(strapGeo, mats.secondaryMat);
    strap.position.set(0, 0, -0.05);
    strap.rotation.x = Math.PI / 2;
    strap.rotation.z = -Math.PI * 0.05;
    strap.scale.set(1.08, 1.05, 1.4);
    group.add(this.tagMesh(strap, 'secondary', [0, 0, -0.75]));

    return group;
  }

  /**
   * 8. 8K MIRRORLESS CINEMA CAMERA + PRIME LENS (PROCEDURAL_CAMERA)
   */
  buildCamera(mats) {
    const group = new THREE.Group();

    // Magnesium Alloy Camera Body
    const bodyGeo = new THREE.BoxGeometry(1.62, 1.12, 0.54);
    const body = new THREE.Mesh(bodyGeo, mats.primaryMat);
    body.position.set(0, -0.05, -0.15);
    group.add(this.tagMesh(body, 'primary', [0, 0, -0.35]));

    // Ergonomic Right Hand Grip
    const gripGeo = new THREE.CylinderGeometry(0.24, 0.26, 1.1, 28);
    const grip = new THREE.Mesh(gripGeo, mats.secondaryMat);
    grip.position.set(-0.68, -0.05, 0.02);
    group.add(this.tagMesh(grip, 'secondary', [-0.45, 0, 0]));

    // Top Electronic Viewfinder (EVF) Housing
    const evfGeo = new THREE.BoxGeometry(0.56, 0.28, 0.62);
    const evf = new THREE.Mesh(evfGeo, mats.primaryMat);
    evf.position.set(0, 0.62, -0.18);
    group.add(this.tagMesh(evf, 'primary', [0, 0.45, -0.25]));

    // Top Shutter Button & Anodized Mode Dial
    const dialGeo = new THREE.CylinderGeometry(0.16, 0.16, 0.12, 28);
    const dial = new THREE.Mesh(dialGeo, mats.accentMat);
    dial.position.set(-0.52, 0.56, -0.12);
    group.add(this.tagMesh(dial, 'accent', [-0.3, 0.55, 0]));

    // Internal Full-Frame 61MP CMOS Sensor + IBIS (Revealed in Exploded View)
    const sensorGeo = new THREE.BoxGeometry(0.58, 0.42, 0.06);
    const sensor = new THREE.Mesh(sensorGeo, mats.copperMat);
    sensor.position.set(0.08, -0.05, 0.14);
    group.add(this.tagMesh(sensor, 'copper', [0, 0, 0.15]));

    // Multi-Element Telephoto Prime Lens Barrel
    const mountRingGeo = new THREE.TorusGeometry(0.46, 0.032, 20, 48);
    const mountRing = new THREE.Mesh(mountRingGeo, mats.accentMat);
    mountRing.position.set(0.08, -0.05, 0.15);
    group.add(this.tagMesh(mountRing, 'accent', [0, 0, 0.35]));

    const lensBarrel1Geo = new THREE.CylinderGeometry(0.46, 0.48, 0.52, 48);
    const lensBarrel1 = new THREE.Mesh(lensBarrel1Geo, mats.secondaryMat);
    lensBarrel1.position.set(0.08, -0.05, 0.42);
    lensBarrel1.rotation.x = Math.PI / 2;
    group.add(this.tagMesh(lensBarrel1, 'secondary', [0, 0, 0.65]));

    const lensBarrel2Geo = new THREE.CylinderGeometry(0.5, 0.47, 0.46, 48);
    const lensBarrel2 = new THREE.Mesh(lensBarrel2Geo, mats.primaryMat);
    lensBarrel2.position.set(0.08, -0.05, 0.88);
    lensBarrel2.rotation.x = Math.PI / 2;
    group.add(this.tagMesh(lensBarrel2, 'primary', [0, 0, 1.05]));

    // Front Red/Cyan Cinema Lens Accent Ring + Optical Glass Element
    const frontRingGeo = new THREE.TorusGeometry(0.49, 0.022, 20, 48);
    const frontRing = new THREE.Mesh(frontRingGeo, mats.accentMat);
    frontRing.position.set(0.08, -0.05, 1.11);
    group.add(this.tagMesh(frontRing, 'accent', [0, 0, 1.35]));

    const frontGlassGeo = new THREE.CircleGeometry(0.46, 48);
    const frontGlass = new THREE.Mesh(frontGlassGeo, mats.glassMat);
    frontGlass.position.set(0.08, -0.05, 1.115);
    group.add(this.tagMesh(frontGlass, 'glass', [0, 0, 1.5]));

    return group;
  }

  /**
   * 9. HANDHELD OLED GAMING CONSOLE DECK (PROCEDURAL_CONSOLE)
   */
  buildConsole(mats, variant = {}) {
    const group = new THREE.Group();

    // Central Handheld Chassis Body
    const chassisGeo = new THREE.BoxGeometry(2.38, 1.04, 0.22);
    const chassis = new THREE.Mesh(chassisGeo, mats.primaryMat);
    group.add(this.tagMesh(chassis, 'primary', [0, 0, 0]));

    // Left & Right Ergonomic Sculpted Hand Grips
    [-1, 1].forEach((side) => {
      const gripGeo = new THREE.CylinderGeometry(0.28, 0.22, 1.08, 32);
      const grip = new THREE.Mesh(gripGeo, mats.secondaryMat);
      grip.position.set(side * 1.18, -0.04, -0.04);
      grip.rotation.z = side * 0.12;
      group.add(this.tagMesh(grip, 'secondary', [side * 0.55, -0.1, -0.1]));

      // Hall-Effect Analog Thumbstick + RGB Halo Ring
      const haloGeo = new THREE.TorusGeometry(0.135, 0.018, 16, 32);
      const halo = new THREE.Mesh(haloGeo, mats.accentMat);
      halo.position.set(side * 0.96, side === -1 ? 0.18 : -0.12, 0.12);
      group.add(this.tagMesh(halo, 'accent', [side * 0.35, 0.1, 0.45]));

      const stickGeo = new THREE.CylinderGeometry(0.095, 0.06, 0.12, 24);
      const stick = new THREE.Mesh(stickGeo, mats.darkCoreMat);
      stick.position.set(side * 0.96, side === -1 ? 0.18 : -0.12, 0.16);
      stick.rotation.x = Math.PI / 2;
      group.add(this.tagMesh(stick, 'dark', [side * 0.45, 0.1, 0.65]));

      // Top Shoulder Trigger Bumpers
      const triggerGeo = new THREE.BoxGeometry(0.42, 0.08, 0.18);
      const trigger = new THREE.Mesh(triggerGeo, mats.accentMat);
      trigger.position.set(side * 0.88, 0.54, -0.02);
      group.add(this.tagMesh(trigger, 'accent', [side * 0.3, 0.45, 0]));
    });

    // Internal Custom RDNA APU + Copper Heatpipe (Revealed in Exploded View)
    const apuGeo = new THREE.BoxGeometry(1.35, 0.72, 0.06);
    const apu = new THREE.Mesh(apuGeo, mats.copperMat);
    apu.position.set(0, 0, -0.05);
    group.add(this.tagMesh(apu, 'copper', [0, 0, -0.55]));

    // Center 8-Inch 144Hz OLED Gaming Display
    const screenTex = this.createLaptopScreenTexture(
      variant.accentHex || '#00f5d4',
      variant.primaryHex || '#0f172a',
    );
    const screenMat = new THREE.MeshStandardMaterial({
      map: screenTex,
      emissive: new THREE.Color('#ffffff'),
      emissiveMap: screenTex,
      emissiveIntensity: 0.7,
      roughness: 0.08,
    });
    const screenGeo = new THREE.PlaneGeometry(1.46, 0.88);
    const screen = new THREE.Mesh(screenGeo, screenMat);
    screen.position.set(0, 0, 0.115);
    group.add(this.tagMesh(screen, 'glass', [0, 0, 0.55]));

    return group;
  }

  createLaptopScreenTexture(accentHex = '#38bdf8', primaryHex = '#1e293b') {
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 640;
    const ctx = canvas.getContext('2d');

    const grad = ctx.createLinearGradient(0, 0, 1024, 640);
    grad.addColorStop(0, '#020617');
    grad.addColorStop(0.5, primaryHex);
    grad.addColorStop(1, '#09090b');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 1024, 640);

    const orb = ctx.createRadialGradient(512, 320, 30, 512, 320, 360);
    orb.addColorStop(0, accentHex);
    orb.addColorStop(0.55, 'rgba(99, 102, 241, 0.22)');
    orb.addColorStop(1, 'rgba(2, 6, 23, 0)');
    ctx.fillStyle = orb;
    ctx.beginPath();
    ctx.arc(512, 320, 360, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 58px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('AETHER STUDIO OS • 240Hz OLED', 512, 290);

    ctx.fillStyle = accentHex;
    ctx.font = 'bold 28px Inter, sans-serif';
    ctx.fillText('RAYTRACING CORE ACTIVE • 100% DCI-P3', 512, 345);

    const tex = new THREE.CanvasTexture(canvas);
    tex.needsUpdate = true;
    return tex;
  }

  createSmartphoneScreenTexture(accentHex = '#38bdf8', primaryHex = '#1e293b') {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 1024;
    const ctx = canvas.getContext('2d');

    const grad = ctx.createLinearGradient(0, 0, 512, 1024);
    grad.addColorStop(0, '#020617');
    grad.addColorStop(0.45, primaryHex);
    grad.addColorStop(1, '#09090b');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 512, 1024);

    const radial = ctx.createRadialGradient(256, 460, 20, 256, 460, 240);
    radial.addColorStop(0, accentHex);
    radial.addColorStop(0.6, 'rgba(56, 189, 248, 0.18)');
    radial.addColorStop(1, 'rgba(2, 6, 23, 0)');
    ctx.fillStyle = radial;
    ctx.beginPath();
    ctx.arc(256, 460, 240, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#f8fafc';
    ctx.font = 'bold 96px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('09:41', 256, 230);

    ctx.fillStyle = '#94a3b8';
    ctx.font = '500 22px Inter, sans-serif';
    ctx.fillText('NOVA QUANTUM OS • 144Hz LTPO', 256, 275);

    ctx.strokeStyle = 'rgba(255,255,255,0.16)';
    ctx.lineWidth = 2;
    ctx.strokeRect(48, 760, 195, 110);
    ctx.strokeRect(268, 760, 195, 110);

    ctx.fillStyle = accentHex;
    ctx.font = 'bold 24px Inter, sans-serif';
    ctx.fillText('5G ULTRA', 145, 810);
    ctx.fillText('98% CHARGE', 365, 810);

    const tex = new THREE.CanvasTexture(canvas);
    tex.needsUpdate = true;
    return tex;
  }

  createWatchFaceTexture(accentHex = '#f97316') {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = '#020617';
    ctx.fillRect(0, 0, 512, 512);

    ctx.strokeStyle = 'rgba(148, 163, 184, 0.35)';
    ctx.lineWidth = 3;
    for (let i = 0; i < 36; i++) {
      const angle = (i * Math.PI * 2) / 36;
      ctx.beginPath();
      ctx.moveTo(256 + Math.cos(angle) * 210, 256 + Math.sin(angle) * 210);
      ctx.lineTo(256 + Math.cos(angle) * 232, 256 + Math.sin(angle) * 232);
      ctx.stroke();
    }

    ctx.strokeStyle = accentHex;
    ctx.lineWidth = 14;
    ctx.beginPath();
    ctx.arc(256, 256, 175, -Math.PI / 2, Math.PI * 1.15);
    ctx.stroke();

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 84px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('10:09', 256, 255);

    ctx.fillStyle = accentHex;
    ctx.font = 'bold 26px Inter, sans-serif';
    ctx.fillText('♥ 134 BPM • GPS L5', 256, 315);

    const tex = new THREE.CanvasTexture(canvas);
    tex.needsUpdate = true;
    return tex;
  }
}
