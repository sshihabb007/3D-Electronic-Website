import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { ElectronicsBuilder } from './ElectronicsBuilder.js';

/**
 * SceneManager
 * Controls an interactive 3D product stage with:
 * - 360° Smooth Damped OrbitControls & Zoom
 * - Real-time Color & Surface Finish Customizer (Matte, Metallic, Titanium, Glossy, Neon)
 * - Studio Lighting Switcher (Studio Soft, Obsidian Dark, Cyber Neon, Warm Sunset)
 * - Interactive 3D Feature Hotspots with Camera Fly-To
 * - Exploded View / X-Ray Disassembly Slider
 */
export class SceneManager {
  constructor(containerEl, options = {}) {
    this.container = containerEl;
    this.hotspotLayer = options.hotspotLayer || null;
    this.onHotspotSelect = options.onHotspotSelect || null;
    this.builder = new ElectronicsBuilder();

    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(40, 1, 0.1, 100);
    this.camera.position.set(2.2, 1.1, 2.7);

    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.25;
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    this.container.innerHTML = '';
    this.container.appendChild(this.renderer.domElement);

    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.06;
    this.controls.minDistance = 1.35;
    this.controls.maxDistance = 5.5;
    this.controls.autoRotate = options.autoRotate !== false;
    this.controls.autoRotateSpeed = 1.35;
    this.controls.enablePan = false;

    this.currentModelGroup = null;
    this.currentMaterials = null;
    this.currentProduct = null;
    this.currentVariant = null;
    this.hotspotsData = [];
    this.hotspotElements = [];
    this.showHotspots = true;
    this.explodeFactor = 0;
    this.clock = new THREE.Clock();
    this.cameraTween = null;

    this.setupLighting();
    this.setupStageFloor();
    this.handleResize();

    this._resizeObserver = new ResizeObserver(() => this.handleResize());
    this._resizeObserver.observe(this.container);

    this.animate = this.animate.bind(this);
    this.animationFrameId = requestAnimationFrame(this.animate);
  }

  setupLighting() {
    this.ambientLight = new THREE.AmbientLight('#ffffff', 0.85);
    this.scene.add(this.ambientLight);

    this.hemiLight = new THREE.HemisphereLight('#f8fafc', '#0f172a', 1.1);
    this.scene.add(this.hemiLight);

    this.keyLight = new THREE.DirectionalLight('#ffffff', 2.6);
    this.keyLight.position.set(4, 6, 4);
    this.keyLight.castShadow = true;
    this.keyLight.shadow.mapSize.width = 1024;
    this.keyLight.shadow.mapSize.height = 1024;
    this.scene.add(this.keyLight);

    this.fillLight = new THREE.PointLight('#38bdf8', 2.2, 12);
    this.fillLight.position.set(-3.5, 1.5, 2.5);
    this.scene.add(this.fillLight);

    this.rimLight = new THREE.PointLight('#6366f1', 2.4, 12);
    this.rimLight.position.set(2.5, -2.0, -3.5);
    this.scene.add(this.rimLight);
  }

  setupStageFloor() {
    // Subtle holographic studio pedestal ring & shadow receiver
    const floorGroup = new THREE.Group();
    floorGroup.position.set(0, -1.28, 0);

    const shadowGeo = new THREE.CircleGeometry(1.9, 64);
    const shadowMat = new THREE.ShadowMaterial({ opacity: 0.35 });
    const shadowDisc = new THREE.Mesh(shadowGeo, shadowMat);
    shadowDisc.rotation.x = -Math.PI / 2;
    shadowDisc.receiveShadow = true;
    floorGroup.add(shadowDisc);

    const ringGeo = new THREE.RingGeometry(1.18, 1.21, 64);
    this.pedestalRingMat = new THREE.MeshBasicMaterial({
      color: '#38bdf8',
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.35,
    });
    const ringMesh = new THREE.Mesh(ringGeo, this.pedestalRingMat);
    ringMesh.rotation.x = -Math.PI / 2;
    ringMesh.position.y = 0.01;
    floorGroup.add(ringMesh);

    this.scene.add(floorGroup);
  }

  setLightingPreset(preset = 'studio') {
    const p = preset.toLowerCase();
    if (p === 'neon') {
      this.ambientLight.intensity = 0.55;
      this.keyLight.color.set('#e0f2fe');
      this.keyLight.intensity = 2.0;
      this.fillLight.color.set('#00f5d4');
      this.fillLight.intensity = 4.2;
      this.rimLight.color.set('#f43f5e');
      this.rimLight.intensity = 4.5;
    } else if (p === 'dark') {
      this.ambientLight.intensity = 0.35;
      this.keyLight.color.set('#cbd5e1');
      this.keyLight.intensity = 2.2;
      this.fillLight.color.set('#38bdf8');
      this.fillLight.intensity = 1.6;
      this.rimLight.color.set('#94a3b8');
      this.rimLight.intensity = 3.2;
    } else if (p === 'warm') {
      this.ambientLight.intensity = 0.8;
      this.keyLight.color.set('#fef3c7');
      this.keyLight.intensity = 2.8;
      this.fillLight.color.set('#f59e0b');
      this.fillLight.intensity = 3.0;
      this.rimLight.color.set('#ec4899');
      this.rimLight.intensity = 2.4;
    } else {
      // studio default
      this.ambientLight.intensity = 0.9;
      this.keyLight.color.set('#ffffff');
      this.keyLight.intensity = 2.6;
      this.fillLight.color.set('#38bdf8');
      this.fillLight.intensity = 2.2;
      this.rimLight.color.set('#6366f1');
      this.rimLight.intensity = 2.4;
    }
  }

  async loadProduct(product, variant = null) {
    this.currentProduct = product;
    const activeVariant =
      variant ||
      (product.variants && product.variants[0]) || {
        variantName: 'Default Edition',
        primaryHex: '#18181b',
        secondaryHex: '#334155',
        accentHex: '#38bdf8',
        finishType: 'MATTE',
      };
    this.currentVariant = { ...activeVariant };

    if (this.currentModelGroup) {
      this.scene.remove(this.currentModelGroup);
      this.currentModelGroup = null;
    }

    const config3d = product.config3d || {
      modelType: 'PROCEDURAL_HEADPHONE',
      defaultScale: 1.0,
      defaultEnvPreset: 'studio',
    };

    const { root, materials } = await this.builder.buildProductModel(
      config3d,
      this.currentVariant,
    );

    this.currentModelGroup = root;
    this.currentMaterials = materials;
    this.explodeFactor = 0;
    this.scene.add(root);

    if (this.pedestalRingMat && this.currentVariant.accentHex) {
      this.pedestalRingMat.color.set(this.currentVariant.accentHex);
    }

    this.setLightingPreset(config3d.defaultEnvPreset || 'studio');

    const camPos = config3d.cameraPosition || { x: 2.2, y: 1.1, z: 2.7 };
    this.flyCameraTo(camPos, { x: 0, y: 0, z: 0 });

    this.setupHotspots(product.hotspots || []);
  }

  /**
   * Real-time Color & Surface Finish Customizer
   * Updates primaryHex, secondaryHex, accentHex, and Finish Type (MATTE | METALLIC | TITANIUM | GLOSSY | NEON)
   */
  applyMaterialCustomization(custom = {}) {
    if (!this.currentMaterials) return;

    this.currentVariant = {
      ...this.currentVariant,
      ...custom,
    };

    const finishType = (this.currentVariant.finishType || 'MATTE').toUpperCase();
    let metalness = 0.22;
    let roughness = 0.75;
    let clearcoat = 0.08;
    let emissiveIntensity = 0.25;

    if (finishType === 'MATTE') {
      metalness = 0.18;
      roughness = 0.78;
      clearcoat = 0.05;
      emissiveIntensity = 0.22;
    } else if (finishType === 'METALLIC') {
      metalness = 0.92;
      roughness = 0.16;
      clearcoat = 0.65;
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
      emissiveIntensity = 0.4;
    } else if (finishType === 'NEON') {
      metalness = 0.58;
      roughness = 0.26;
      clearcoat = 0.55;
      emissiveIntensity = 1.45;
    }

    const { primaryMat, secondaryMat, accentMat } = this.currentMaterials;

    if (this.currentVariant.primaryHex) {
      primaryMat.color.set(this.currentVariant.primaryHex);
    }
    primaryMat.metalness = metalness;
    primaryMat.roughness = roughness;
    primaryMat.clearcoat = clearcoat;
    primaryMat.needsUpdate = true;

    if (this.currentVariant.secondaryHex) {
      secondaryMat.color.set(this.currentVariant.secondaryHex);
    }
    secondaryMat.metalness = Math.max(0.1, metalness * 0.65);
    secondaryMat.roughness = Math.min(0.9, roughness + 0.1);
    secondaryMat.needsUpdate = true;

    if (this.currentVariant.accentHex) {
      accentMat.color.set(this.currentVariant.accentHex);
      accentMat.emissive.set(this.currentVariant.accentHex);
      if (this.pedestalRingMat) {
        this.pedestalRingMat.color.set(this.currentVariant.accentHex);
      }
    }
    accentMat.emissiveIntensity = emissiveIntensity;
    accentMat.needsUpdate = true;
  }

  /**
   * Exploded View / X-Ray Disassembly (factor 0.0 to 1.0)
   */
  setExplodeFactor(factor = 0) {
    this.explodeFactor = Math.max(0, Math.min(1, Number(factor)));
    if (!this.currentModelGroup) return;

    this.currentModelGroup.traverse((child) => {
      if (child.userData && child.userData.basePosition && child.userData.explodeVector) {
        child.position
          .copy(child.userData.basePosition)
          .addScaledVector(child.userData.explodeVector, this.explodeFactor);
      }
    });
  }

  setupHotspots(hotspots = []) {
    this.hotspotsData = hotspots;
    this.hotspotElements = [];
    if (!this.hotspotLayer) return;

    this.hotspotLayer.innerHTML = '';
    if (!this.showHotspots) return;

    hotspots.forEach((h, idx) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className =
        'hotspot-pin group absolute -translate-x-1/2 -translate-y-1/2 z-20 flex items-center gap-2 px-2.5 py-1 rounded-full bg-slate-900/90 border border-cyan-400/70 text-xs font-semibold text-white shadow-lg backdrop-blur-md transition-transform hover:scale-110';
      btn.innerHTML = `
        <span class="w-2 h-2 rounded-full bg-cyan-400 animate-ping"></span>
        <span>${idx + 1}. ${h.title}</span>
      `;
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.controls.autoRotate = false;
        this.flyCameraTo(
          { x: h.camX || 1.9, y: h.camY || 1.0, z: h.camZ || 2.1 },
          { x: h.posX * 0.4, y: h.posY * 0.4, z: h.posZ * 0.4 },
        );
        if (this.onHotspotSelect) {
          this.onHotspotSelect(h, idx);
        }
      });
      this.hotspotLayer.appendChild(btn);
      this.hotspotElements.push({ el: btn, data: h });
    });
  }

  toggleHotspots(visible) {
    this.showHotspots =
      visible !== undefined ? Boolean(visible) : !this.showHotspots;
    if (this.hotspotLayer) {
      this.hotspotLayer.style.display = this.showHotspots ? 'block' : 'none';
    }
    return this.showHotspots;
  }

  flyCameraTo(targetCamPos, targetLookAt = { x: 0, y: 0, z: 0 }) {
    this.cameraTween = {
      startPos: this.camera.position.clone(),
      endPos: new THREE.Vector3(targetCamPos.x, targetCamPos.y, targetCamPos.z),
      startTarget: this.controls.target.clone(),
      endTarget: new THREE.Vector3(
        targetLookAt.x,
        targetLookAt.y,
        targetLookAt.z,
      ),
      progress: 0,
    };
  }

  resetCamera() {
    const camPos = this.currentProduct?.config3d?.cameraPosition || {
      x: 2.2,
      y: 1.1,
      z: 2.7,
    };
    this.flyCameraTo(camPos, { x: 0, y: 0, z: 0 });
  }

  zoomDelta(delta = -0.35) {
    const dir = new THREE.Vector3()
      .subVectors(this.camera.position, this.controls.target)
      .normalize();
    const currentDist = this.camera.position.distanceTo(this.controls.target);
    const nextDist = Math.max(
      this.controls.minDistance,
      Math.min(this.controls.maxDistance, currentDist + delta),
    );
    const newPos = this.controls.target
      .clone()
      .addScaledVector(dir, nextDist);
    this.flyCameraTo(newPos, this.controls.target);
  }

  handleResize() {
    if (!this.container) return;
    const width = this.container.clientWidth || 600;
    const height = this.container.clientHeight || 450;
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  }

  updateHotspotPositions() {
    if (!this.hotspotLayer || !this.showHotspots || !this.currentModelGroup)
      return;

    const width = this.container.clientWidth;
    const height = this.container.clientHeight;

    this.hotspotElements.forEach(({ el, data }) => {
      const worldPos = new THREE.Vector3(data.posX, data.posY, data.posZ);
      worldPos.applyMatrix4(this.currentModelGroup.matrixWorld);

      const projected = worldPos.clone().project(this.camera);
      if (projected.z > 1) {
        el.style.opacity = '0';
        el.style.pointerEvents = 'none';
        return;
      }

      const x = (projected.x * 0.5 + 0.5) * width;
      const y = (-(projected.y * 0.5) + 0.5) * height;
      el.style.left = `${x}px`;
      el.style.top = `${y}px`;
      el.style.opacity = '1';
      el.style.pointerEvents = 'auto';
    });
  }

  animate() {
    this.animationFrameId = requestAnimationFrame(this.animate);
    const elapsed = this.clock.getElapsedTime();

    // Subtle floating levitation on the 3D device
    if (this.currentModelGroup) {
      this.currentModelGroup.position.y = Math.sin(elapsed * 1.8) * 0.045;
    }

    // Smooth camera fly-to tween
    if (this.cameraTween) {
      this.cameraTween.progress += 0.07;
      const t = Math.min(1, this.cameraTween.progress);
      const ease = 1 - Math.pow(1 - t, 3);
      this.camera.position.lerpVectors(
        this.cameraTween.startPos,
        this.cameraTween.endPos,
        ease,
      );
      this.controls.target.lerpVectors(
        this.cameraTween.startTarget,
        this.cameraTween.endTarget,
        ease,
      );
      if (t >= 1) {
        this.cameraTween = null;
      }
    }

    this.controls.update();
    this.updateHotspotPositions();
    this.renderer.render(this.scene, this.camera);
  }
}
