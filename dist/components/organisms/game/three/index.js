import { useEmitEvent } from '../../../../chunk-YXZM3WCF.js';
import { __publicField } from '../../../../chunk-PKBMQBKP.js';
import React7, { forwardRef, useRef, useEffect, useImperativeHandle, Component, useMemo, useState, useCallback } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import * as THREE6 from 'three';
import { jsx, Fragment, jsxs } from 'react/jsx-runtime';
import { OrbitControls } from '@react-three/drei';
import { GLTFLoader as GLTFLoader$1 } from 'three/examples/jsm/loaders/GLTFLoader';
import { OrbitControls as OrbitControls$1 } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';

function Scene3D({ background = "#1a1a2e", fog, children }) {
  const { scene } = useThree();
  const initializedRef = useRef(false);
  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;
    if (background.startsWith("#") || background.startsWith("rgb")) {
      scene.background = new THREE6.Color(background);
    } else {
      const loader = new THREE6.TextureLoader();
      loader.load(background, (texture) => {
        scene.background = texture;
      });
    }
    if (fog) {
      scene.fog = new THREE6.Fog(fog.color, fog.near, fog.far);
    }
    return () => {
      scene.background = null;
      scene.fog = null;
    };
  }, [scene, background, fog]);
  return /* @__PURE__ */ jsx(Fragment, { children });
}
var Camera3D = forwardRef(
  ({
    mode = "isometric",
    position = [10, 10, 10],
    target = [0, 0, 0],
    zoom = 1,
    fov = 45,
    enableOrbit = true,
    minDistance = 2,
    maxDistance = 100,
    onChange
  }, ref) => {
    const { camera, set, viewport } = useThree();
    const controlsRef = useRef(null);
    const initialPosition = useRef(new THREE6.Vector3(...position));
    const initialTarget = useRef(new THREE6.Vector3(...target));
    useEffect(() => {
      let newCamera;
      if (mode === "isometric") {
        const aspect = viewport.aspect;
        const size = 10 / zoom;
        newCamera = new THREE6.OrthographicCamera(
          -size * aspect,
          size * aspect,
          size,
          -size,
          0.1,
          1e3
        );
      } else {
        newCamera = new THREE6.PerspectiveCamera(fov, viewport.aspect, 0.1, 1e3);
      }
      newCamera.position.copy(initialPosition.current);
      newCamera.lookAt(initialTarget.current);
      set({ camera: newCamera });
      if (mode === "top-down") {
        newCamera.position.set(0, 20 / zoom, 0);
        newCamera.lookAt(0, 0, 0);
      }
      return () => {
      };
    }, [mode, fov, zoom, viewport.aspect, set]);
    useFrame(() => {
      if (onChange) {
        onChange(camera);
      }
    });
    useImperativeHandle(ref, () => ({
      getCamera: () => camera,
      setPosition: (x, y, z) => {
        camera.position.set(x, y, z);
        if (controlsRef.current) {
          controlsRef.current.update();
        }
      },
      lookAt: (x, y, z) => {
        camera.lookAt(x, y, z);
        if (controlsRef.current) {
          controlsRef.current.target.set(x, y, z);
          controlsRef.current.update();
        }
      },
      reset: () => {
        camera.position.copy(initialPosition.current);
        camera.lookAt(initialTarget.current);
        if (controlsRef.current) {
          controlsRef.current.target.copy(initialTarget.current);
          controlsRef.current.update();
        }
      },
      getViewBounds: () => {
        const min = new THREE6.Vector3(-10, -10, -10);
        const max = new THREE6.Vector3(10, 10, 10);
        return { min, max };
      }
    }));
    const maxPolarAngle = mode === "top-down" ? 0.1 : Math.PI / 2 - 0.1;
    return /* @__PURE__ */ jsx(
      OrbitControls,
      {
        ref: controlsRef,
        camera,
        enabled: enableOrbit,
        target: initialTarget.current,
        minDistance,
        maxDistance,
        maxPolarAngle,
        enableDamping: true,
        dampingFactor: 0.05
      }
    );
  }
);
Camera3D.displayName = "Camera3D";
function Lighting3D({
  ambientIntensity = 0.6,
  ambientColor = "#ffffff",
  directionalIntensity = 0.8,
  directionalColor = "#ffffff",
  directionalPosition = [10, 20, 10],
  shadows = true,
  shadowMapSize = 2048,
  shadowCameraSize = 20,
  showHelpers = false
}) {
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx("ambientLight", { intensity: ambientIntensity, color: ambientColor }),
    /* @__PURE__ */ jsx(
      "directionalLight",
      {
        position: directionalPosition,
        intensity: directionalIntensity,
        color: directionalColor,
        castShadow: shadows,
        "shadow-mapSize": [shadowMapSize, shadowMapSize],
        "shadow-camera-left": -shadowCameraSize,
        "shadow-camera-right": shadowCameraSize,
        "shadow-camera-top": shadowCameraSize,
        "shadow-camera-bottom": -shadowCameraSize,
        "shadow-camera-near": 0.1,
        "shadow-camera-far": 100,
        "shadow-bias": -1e-3
      }
    ),
    /* @__PURE__ */ jsx(
      "hemisphereLight",
      {
        intensity: 0.3,
        color: "#87ceeb",
        groundColor: "#362d1d"
      }
    ),
    showHelpers && /* @__PURE__ */ jsx(Fragment, { children: /* @__PURE__ */ jsx(
      "directionalLightHelper",
      {
        args: [
          new THREE6.DirectionalLight(directionalColor, directionalIntensity),
          5
        ]
      }
    ) })
  ] });
}
function Canvas3DLoadingState({
  progress = 0,
  loaded = 0,
  total = 0,
  message = "Loading 3D Scene...",
  details,
  showSpinner = true,
  className
}) {
  const clampedProgress = Math.max(0, Math.min(100, progress));
  const hasProgress = total > 0;
  return /* @__PURE__ */ jsxs("div", { className: `canvas-3d-loading ${className || ""}`, children: [
    /* @__PURE__ */ jsxs("div", { className: "canvas-3d-loading__content", children: [
      showSpinner && /* @__PURE__ */ jsxs("div", { className: "canvas-3d-loading__spinner", children: [
        /* @__PURE__ */ jsx("div", { className: "spinner__ring" }),
        /* @__PURE__ */ jsx("div", { className: "spinner__ring spinner__ring--secondary" })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "canvas-3d-loading__message", children: message }),
      details && /* @__PURE__ */ jsx("div", { className: "canvas-3d-loading__details", children: details }),
      hasProgress && /* @__PURE__ */ jsxs("div", { className: "canvas-3d-loading__progress", children: [
        /* @__PURE__ */ jsx("div", { className: "progress__bar", children: /* @__PURE__ */ jsx(
          "div",
          {
            className: "progress__fill",
            style: { width: `${clampedProgress}%` }
          }
        ) }),
        /* @__PURE__ */ jsxs("div", { className: "progress__text", children: [
          /* @__PURE__ */ jsxs("span", { className: "progress__percentage", children: [
            clampedProgress,
            "%"
          ] }),
          /* @__PURE__ */ jsxs("span", { className: "progress__count", children: [
            "(",
            loaded,
            "/",
            total,
            ")"
          ] })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "canvas-3d-loading__background", children: /* @__PURE__ */ jsx("div", { className: "bg__grid" }) })
  ] });
}
var Canvas3DErrorBoundary = class extends Component {
  constructor(props) {
    super(props);
    __publicField(this, "handleReset", () => {
      this.setState({
        hasError: false,
        error: null,
        errorInfo: null
      });
      this.props.onReset?.();
    });
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    };
  }
  static getDerivedStateFromError(error) {
    return {
      hasError: true,
      error,
      errorInfo: null
    };
  }
  componentDidCatch(error, errorInfo) {
    this.setState({ errorInfo });
    this.props.onError?.(error, errorInfo);
    console.error("[Canvas3DErrorBoundary] Error caught:", error);
    console.error("[Canvas3DErrorBoundary] Component stack:", errorInfo.componentStack);
  }
  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }
      return /* @__PURE__ */ jsx("div", { className: "canvas-3d-error", children: /* @__PURE__ */ jsxs("div", { className: "canvas-3d-error__content", children: [
        /* @__PURE__ */ jsx("div", { className: "canvas-3d-error__icon", children: "\u26A0\uFE0F" }),
        /* @__PURE__ */ jsx("h2", { className: "canvas-3d-error__title", children: "3D Scene Error" }),
        /* @__PURE__ */ jsx("p", { className: "canvas-3d-error__message", children: "Something went wrong while rendering the 3D scene." }),
        this.state.error && /* @__PURE__ */ jsxs("details", { className: "canvas-3d-error__details", children: [
          /* @__PURE__ */ jsx("summary", { children: "Error Details" }),
          /* @__PURE__ */ jsxs("pre", { className: "error__stack", children: [
            this.state.error.message,
            "\n",
            this.state.error.stack
          ] }),
          this.state.errorInfo && /* @__PURE__ */ jsx("pre", { className: "error__component-stack", children: this.state.errorInfo.componentStack })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "canvas-3d-error__actions", children: [
          /* @__PURE__ */ jsx(
            "button",
            {
              className: "error__button error__button--primary",
              onClick: this.handleReset,
              children: "Try Again"
            }
          ),
          /* @__PURE__ */ jsx(
            "button",
            {
              className: "error__button error__button--secondary",
              onClick: () => window.location.reload(),
              children: "Reload Page"
            }
          )
        ] })
      ] }) });
    }
    return this.props.children;
  }
};
function detectAssetRoot(modelUrl) {
  const idx = modelUrl.indexOf("/3d/");
  if (idx !== -1) {
    return modelUrl.substring(0, idx + 4);
  }
  return modelUrl.substring(0, modelUrl.lastIndexOf("/") + 1);
}
function useGLTFModel(url, resourceBasePath) {
  const [state, setState] = useState({
    model: null,
    isLoading: false,
    error: null
  });
  useEffect(() => {
    if (!url) {
      setState({ model: null, isLoading: false, error: null });
      return;
    }
    console.log("[ModelLoader] Loading:", url);
    setState((prev) => ({ ...prev, isLoading: true, error: null }));
    const assetRoot = resourceBasePath || detectAssetRoot(url);
    const loader = new GLTFLoader$1();
    loader.setResourcePath(assetRoot);
    loader.load(
      url,
      (gltf) => {
        console.log("[ModelLoader] Loaded:", url);
        setState({
          model: gltf.scene,
          isLoading: false,
          error: null
        });
      },
      void 0,
      (err) => {
        const errorMsg = err instanceof Error ? err.message : String(err);
        console.warn("[ModelLoader] Failed:", url, errorMsg);
        setState({
          model: null,
          isLoading: false,
          error: err instanceof Error ? err : new Error(String(err))
        });
      }
    );
  }, [url, resourceBasePath]);
  return state;
}
function ModelLoader({
  url,
  position = [0, 0, 0],
  scale = 1,
  rotation = [0, 0, 0],
  isSelected = false,
  isHovered = false,
  onClick,
  onHover,
  fallbackGeometry = "box",
  castShadow = true,
  receiveShadow = true,
  resourceBasePath
}) {
  const { model: loadedModel, isLoading, error } = useGLTFModel(url, resourceBasePath);
  const model = useMemo(() => {
    if (!loadedModel) return null;
    const cloned = loadedModel.clone();
    cloned.traverse((child) => {
      if (child instanceof THREE6.Mesh) {
        child.castShadow = castShadow;
        child.receiveShadow = receiveShadow;
      }
    });
    return cloned;
  }, [loadedModel, castShadow, receiveShadow]);
  const scaleArray = useMemo(() => {
    if (typeof scale === "number") {
      return [scale, scale, scale];
    }
    return scale;
  }, [scale]);
  const rotationRad = useMemo(() => {
    return [
      rotation[0] * Math.PI / 180,
      rotation[1] * Math.PI / 180,
      rotation[2] * Math.PI / 180
    ];
  }, [rotation]);
  if (isLoading) {
    return /* @__PURE__ */ jsx("group", { position, children: /* @__PURE__ */ jsxs("mesh", { rotation: [Math.PI / 2, 0, 0], children: [
      /* @__PURE__ */ jsx("ringGeometry", { args: [0.3, 0.35, 16] }),
      /* @__PURE__ */ jsx("meshBasicMaterial", { color: "#4a90d9", transparent: true, opacity: 0.8 })
    ] }) });
  }
  if (error || !model) {
    if (fallbackGeometry === "none") {
      return /* @__PURE__ */ jsx("group", { position });
    }
    const fallbackProps = {
      onClick,
      onPointerOver: () => onHover?.(true),
      onPointerOut: () => onHover?.(false)
    };
    return /* @__PURE__ */ jsxs("group", { position, children: [
      (isSelected || isHovered) && /* @__PURE__ */ jsxs("mesh", { position: [0, 0.02, 0], rotation: [-Math.PI / 2, 0, 0], children: [
        /* @__PURE__ */ jsx("ringGeometry", { args: [0.6, 0.7, 32] }),
        /* @__PURE__ */ jsx(
          "meshBasicMaterial",
          {
            color: isSelected ? 16755200 : 16777215,
            transparent: true,
            opacity: 0.5
          }
        )
      ] }),
      fallbackGeometry === "box" && /* @__PURE__ */ jsxs("mesh", { ...fallbackProps, position: [0, 0.5, 0], children: [
        /* @__PURE__ */ jsx("boxGeometry", { args: [0.8, 0.8, 0.8] }),
        /* @__PURE__ */ jsx("meshStandardMaterial", { color: error ? 16729156 : 8947848 })
      ] }),
      fallbackGeometry === "sphere" && /* @__PURE__ */ jsxs("mesh", { ...fallbackProps, position: [0, 0.5, 0], children: [
        /* @__PURE__ */ jsx("sphereGeometry", { args: [0.4, 16, 16] }),
        /* @__PURE__ */ jsx("meshStandardMaterial", { color: error ? 16729156 : 8947848 })
      ] }),
      fallbackGeometry === "cylinder" && /* @__PURE__ */ jsxs("mesh", { ...fallbackProps, position: [0, 0.5, 0], children: [
        /* @__PURE__ */ jsx("cylinderGeometry", { args: [0.3, 0.3, 0.8, 16] }),
        /* @__PURE__ */ jsx("meshStandardMaterial", { color: error ? 16729156 : 8947848 })
      ] })
    ] });
  }
  return /* @__PURE__ */ jsxs(
    "group",
    {
      position,
      rotation: rotationRad,
      onClick,
      onPointerOver: () => onHover?.(true),
      onPointerOut: () => onHover?.(false),
      children: [
        (isSelected || isHovered) && /* @__PURE__ */ jsxs("mesh", { position: [0, 0.02, 0], rotation: [-Math.PI / 2, 0, 0], children: [
          /* @__PURE__ */ jsx("ringGeometry", { args: [0.6, 0.7, 32] }),
          /* @__PURE__ */ jsx(
            "meshBasicMaterial",
            {
              color: isSelected ? 16755200 : 16777215,
              transparent: true,
              opacity: 0.5
            }
          )
        ] }),
        /* @__PURE__ */ jsx("primitive", { object: model, scale: scaleArray })
      ]
    }
  );
}
function PhysicsObject3D({
  entityId,
  modelUrl,
  initialPosition = [0, 0, 0],
  initialVelocity = [0, 0, 0],
  mass = 1,
  gravity = 9.8,
  groundY = 0,
  scale = 1,
  onPhysicsUpdate,
  onGroundHit,
  onCollision
}) {
  const groupRef = useRef(null);
  const physicsStateRef = useRef({
    id: entityId,
    x: initialPosition[0],
    y: initialPosition[1],
    z: initialPosition[2],
    vx: initialVelocity[0],
    vy: initialVelocity[1],
    vz: initialVelocity[2],
    rx: 0,
    ry: 0,
    rz: 0,
    isGrounded: false,
    gravity,
    friction: 0.8,
    mass,
    state: "Active"
  });
  const groundHitRef = useRef(false);
  useEffect(() => {
    if (groupRef.current) {
      groupRef.current.position.set(
        initialPosition[0],
        initialPosition[1],
        initialPosition[2]
      );
    }
  }, []);
  useFrame((state, delta) => {
    const physics = physicsStateRef.current;
    if (physics.state !== "Active") return;
    const dt = Math.min(delta, 0.1);
    if (!physics.isGrounded) {
      physics.vy -= physics.gravity * dt;
    }
    physics.x += physics.vx * dt;
    physics.y += physics.vy * dt;
    physics.z += physics.vz * dt;
    const airResistance = Math.pow(0.99, dt * 60);
    physics.vx *= airResistance;
    physics.vz *= airResistance;
    if (physics.y <= groundY) {
      physics.y = groundY;
      if (!physics.isGrounded) {
        physics.isGrounded = true;
        groundHitRef.current = true;
        physics.vx *= physics.friction;
        physics.vz *= physics.friction;
        onGroundHit?.();
      }
      physics.vy = 0;
    } else {
      physics.isGrounded = false;
    }
    if (groupRef.current) {
      groupRef.current.position.set(physics.x, physics.y, physics.z);
      if (!physics.isGrounded) {
        physics.rx += physics.vz * dt * 0.5;
        physics.rz -= physics.vx * dt * 0.5;
        groupRef.current.rotation.set(physics.rx, physics.ry, physics.rz);
      }
    }
    onPhysicsUpdate?.({ ...physics });
  });
  const scaleArray = typeof scale === "number" ? [scale, scale, scale] : scale;
  return /* @__PURE__ */ jsx("group", { ref: groupRef, scale: scaleArray, children: /* @__PURE__ */ jsx(
    ModelLoader,
    {
      url: modelUrl,
      fallbackGeometry: "box"
    }
  ) });
}
function usePhysics3DController(entityId) {
  const applyForce = (fx, fy, fz) => {
    console.log(`Apply force to ${entityId}:`, { fx, fy, fz });
  };
  const setVelocity = (vx, vy, vz) => {
    console.log(`Set velocity for ${entityId}:`, { vx, vy, vz });
  };
  const setPosition = (x, y, z) => {
    console.log(`Set position for ${entityId}:`, { x, y, z });
  };
  const jump = (force = 10) => {
    applyForce(0, force, 0);
  };
  return {
    applyForce,
    setVelocity,
    setPosition,
    jump
  };
}
function detectAssetRoot2(modelUrl) {
  const idx = modelUrl.indexOf("/3d/");
  if (idx !== -1) {
    return modelUrl.substring(0, idx + 4);
  }
  return modelUrl.substring(0, modelUrl.lastIndexOf("/") + 1);
}
function createGLTFLoaderForUrl(url) {
  const loader = new GLTFLoader();
  loader.setResourcePath(detectAssetRoot2(url));
  return loader;
}
var AssetLoader = class {
  constructor() {
    __publicField(this, "objLoader");
    __publicField(this, "textureLoader");
    __publicField(this, "modelCache");
    __publicField(this, "textureCache");
    __publicField(this, "loadingPromises");
    this.objLoader = new OBJLoader();
    this.textureLoader = new THREE6.TextureLoader();
    this.modelCache = /* @__PURE__ */ new Map();
    this.textureCache = /* @__PURE__ */ new Map();
    this.loadingPromises = /* @__PURE__ */ new Map();
  }
  /**
   * Load a GLB/GLTF model
   * @param url - URL to the .glb or .gltf file
   * @returns Promise with loaded model scene and animations
   */
  async loadModel(url) {
    if (this.modelCache.has(url)) {
      return this.modelCache.get(url);
    }
    if (this.loadingPromises.has(url)) {
      return this.loadingPromises.get(url);
    }
    const loader = createGLTFLoaderForUrl(url);
    const loadPromise = loader.loadAsync(url).then((gltf) => {
      const result = {
        scene: gltf.scene,
        animations: gltf.animations || []
      };
      this.modelCache.set(url, result);
      this.loadingPromises.delete(url);
      return result;
    }).catch((error) => {
      this.loadingPromises.delete(url);
      throw new Error(`Failed to load model ${url}: ${error.message}`);
    });
    this.loadingPromises.set(url, loadPromise);
    return loadPromise;
  }
  /**
   * Load an OBJ model (fallback for non-GLB assets)
   * @param url - URL to the .obj file
   * @returns Promise with loaded object group
   */
  async loadOBJ(url) {
    if (this.modelCache.has(url)) {
      return this.modelCache.get(url).scene;
    }
    if (this.loadingPromises.has(url)) {
      const result = await this.loadingPromises.get(url);
      return result.scene;
    }
    const loadPromise = this.objLoader.loadAsync(url).then((group) => {
      const result = {
        scene: group,
        animations: []
      };
      this.modelCache.set(url, result);
      this.loadingPromises.delete(url);
      return result;
    }).catch((error) => {
      this.loadingPromises.delete(url);
      throw new Error(`Failed to load OBJ ${url}: ${error.message}`);
    });
    this.loadingPromises.set(url, loadPromise);
    return (await loadPromise).scene;
  }
  /**
   * Load a texture
   * @param url - URL to the texture image
   * @returns Promise with loaded texture
   */
  async loadTexture(url) {
    if (this.textureCache.has(url)) {
      return this.textureCache.get(url);
    }
    if (this.loadingPromises.has(`texture:${url}`)) {
      return this.loadingPromises.get(`texture:${url}`);
    }
    const loadPromise = this.textureLoader.loadAsync(url).then((texture) => {
      texture.colorSpace = THREE6.SRGBColorSpace;
      this.textureCache.set(url, texture);
      this.loadingPromises.delete(`texture:${url}`);
      return texture;
    }).catch((error) => {
      this.loadingPromises.delete(`texture:${url}`);
      throw new Error(`Failed to load texture ${url}: ${error.message}`);
    });
    this.loadingPromises.set(`texture:${url}`, loadPromise);
    return loadPromise;
  }
  /**
   * Preload multiple assets
   * @param urls - Array of asset URLs to preload
   * @returns Promise that resolves when all assets are loaded
   */
  async preload(urls) {
    const promises = urls.map((url) => {
      if (url.endsWith(".glb") || url.endsWith(".gltf")) {
        return this.loadModel(url).catch(() => null);
      } else if (url.endsWith(".obj")) {
        return this.loadOBJ(url).catch(() => null);
      } else if (/\.(png|jpg|jpeg|webp)$/i.test(url)) {
        return this.loadTexture(url).catch(() => null);
      }
      return Promise.resolve(null);
    });
    await Promise.all(promises);
  }
  /**
   * Check if a model is cached
   * @param url - Model URL
   */
  hasModel(url) {
    return this.modelCache.has(url);
  }
  /**
   * Check if a texture is cached
   * @param url - Texture URL
   */
  hasTexture(url) {
    return this.textureCache.has(url);
  }
  /**
   * Get cached model (throws if not cached)
   * @param url - Model URL
   */
  getModel(url) {
    const model = this.modelCache.get(url);
    if (!model) {
      throw new Error(`Model ${url} not in cache`);
    }
    return model;
  }
  /**
   * Get cached texture (throws if not cached)
   * @param url - Texture URL
   */
  getTexture(url) {
    const texture = this.textureCache.get(url);
    if (!texture) {
      throw new Error(`Texture ${url} not in cache`);
    }
    return texture;
  }
  /**
   * Clear all caches
   */
  clearCache() {
    this.textureCache.forEach((texture) => {
      texture.dispose();
    });
    this.modelCache.forEach((model) => {
      model.scene.traverse((child) => {
        if (child instanceof THREE6.Mesh) {
          child.geometry.dispose();
          if (Array.isArray(child.material)) {
            child.material.forEach((m) => m.dispose());
          } else {
            child.material.dispose();
          }
        }
      });
    });
    this.modelCache.clear();
    this.textureCache.clear();
    this.loadingPromises.clear();
  }
  /**
   * Get cache statistics
   */
  getStats() {
    return {
      models: this.modelCache.size,
      textures: this.textureCache.size,
      loading: this.loadingPromises.size
    };
  }
};
var assetLoader = new AssetLoader();

// components/organisms/game/three/hooks/useThree.ts
var DEFAULT_OPTIONS = {
  cameraMode: "isometric",
  cameraPosition: [10, 10, 10],
  backgroundColor: "#1a1a2e",
  shadows: true,
  showGrid: true,
  gridSize: 20,
  assetLoader: new AssetLoader()
};
function useThree3(options = {}) {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const rendererRef = useRef(null);
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const controlsRef = useRef(null);
  const gridHelperRef = useRef(null);
  const rafRef = useRef(0);
  const [isReady, setIsReady] = useState(false);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const initialCameraPosition = useMemo(
    () => new THREE6.Vector3(...opts.cameraPosition),
    []
  );
  useEffect(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;
    const { clientWidth, clientHeight } = container;
    const scene = new THREE6.Scene();
    scene.background = new THREE6.Color(opts.backgroundColor);
    sceneRef.current = scene;
    let camera;
    const aspect = clientWidth / clientHeight;
    if (opts.cameraMode === "isometric") {
      const size = 10;
      camera = new THREE6.OrthographicCamera(
        -size * aspect,
        size * aspect,
        size,
        -size,
        0.1,
        1e3
      );
    } else {
      camera = new THREE6.PerspectiveCamera(45, aspect, 0.1, 1e3);
    }
    camera.position.copy(initialCameraPosition);
    cameraRef.current = camera;
    const renderer = new THREE6.WebGLRenderer({
      antialias: true,
      alpha: true,
      canvas: canvasRef.current || void 0
    });
    renderer.setSize(clientWidth, clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = opts.shadows;
    renderer.shadowMap.type = THREE6.PCFSoftShadowMap;
    rendererRef.current = renderer;
    const controls = new OrbitControls$1(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.minDistance = 2;
    controls.maxDistance = 100;
    controls.maxPolarAngle = Math.PI / 2 - 0.1;
    controlsRef.current = controls;
    const ambientLight = new THREE6.AmbientLight(16777215, 0.6);
    scene.add(ambientLight);
    const directionalLight = new THREE6.DirectionalLight(16777215, 0.8);
    directionalLight.position.set(10, 20, 10);
    directionalLight.castShadow = opts.shadows;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    scene.add(directionalLight);
    if (opts.showGrid) {
      const gridHelper = new THREE6.GridHelper(
        opts.gridSize,
        opts.gridSize,
        4473924,
        2236962
      );
      scene.add(gridHelper);
      gridHelperRef.current = gridHelper;
    }
    const animate = () => {
      rafRef.current = requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();
    const handleResize = () => {
      const { clientWidth: width, clientHeight: height } = container;
      setDimensions({ width, height });
      if (camera instanceof THREE6.PerspectiveCamera) {
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
      } else if (camera instanceof THREE6.OrthographicCamera) {
        const aspect2 = width / height;
        const size = 10;
        camera.left = -size * aspect2;
        camera.right = size * aspect2;
        camera.top = size;
        camera.bottom = -size;
        camera.updateProjectionMatrix();
      }
      renderer.setSize(width, height);
    };
    window.addEventListener("resize", handleResize);
    handleResize();
    setIsReady(true);
    return () => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(rafRef.current);
      controls.dispose();
      renderer.dispose();
      scene.clear();
    };
  }, []);
  useEffect(() => {
    if (!cameraRef.current || !containerRef.current) return;
    const container = containerRef.current;
    const { clientWidth, clientHeight } = container;
    const aspect = clientWidth / clientHeight;
    const currentPos = cameraRef.current.position.clone();
    let newCamera;
    if (opts.cameraMode === "isometric") {
      const size = 10;
      newCamera = new THREE6.OrthographicCamera(
        -size * aspect,
        size * aspect,
        size,
        -size,
        0.1,
        1e3
      );
    } else {
      newCamera = new THREE6.PerspectiveCamera(45, aspect, 0.1, 1e3);
    }
    newCamera.position.copy(currentPos);
    cameraRef.current = newCamera;
    if (controlsRef.current) {
      controlsRef.current.object = newCamera;
    }
    if (rendererRef.current) {
      const animate = () => {
        rafRef.current = requestAnimationFrame(animate);
        controlsRef.current?.update();
        rendererRef.current?.render(sceneRef.current, newCamera);
      };
      cancelAnimationFrame(rafRef.current);
      animate();
    }
  }, [opts.cameraMode]);
  const setCameraPosition = useCallback((x, y, z) => {
    if (cameraRef.current) {
      cameraRef.current.position.set(x, y, z);
      controlsRef.current?.update();
    }
  }, []);
  const lookAt = useCallback((x, y, z) => {
    if (cameraRef.current) {
      cameraRef.current.lookAt(x, y, z);
      controlsRef.current?.target.set(x, y, z);
      controlsRef.current?.update();
    }
  }, []);
  const resetCamera = useCallback(() => {
    if (cameraRef.current) {
      cameraRef.current.position.copy(initialCameraPosition);
      cameraRef.current.lookAt(0, 0, 0);
      if (controlsRef.current) {
        controlsRef.current.target.set(0, 0, 0);
        controlsRef.current.update();
      }
    }
  }, [initialCameraPosition]);
  const fitView = useCallback(
    (bounds) => {
      if (!cameraRef.current) return;
      const centerX = (bounds.minX + bounds.maxX) / 2;
      const centerZ = (bounds.minZ + bounds.maxZ) / 2;
      const width = bounds.maxX - bounds.minX;
      const depth = bounds.maxZ - bounds.minZ;
      const maxDim = Math.max(width, depth);
      const distance = maxDim * 1.5;
      const height = distance * 0.8;
      cameraRef.current.position.set(centerX + distance, height, centerZ + distance);
      lookAt(centerX, 0, centerZ);
    },
    [lookAt]
  );
  return {
    canvasRef,
    renderer: rendererRef.current,
    scene: sceneRef.current,
    camera: cameraRef.current,
    controls: controlsRef.current,
    isReady,
    dimensions,
    setCameraPosition,
    lookAt,
    resetCamera,
    fitView
  };
}
function useAssetLoader(options = {}) {
  const { preloadUrls = [], loader: customLoader } = options;
  const loaderRef = useRef(customLoader || new AssetLoader());
  const [state, setState] = useState({
    isLoading: false,
    progress: 0,
    loaded: 0,
    total: 0,
    errors: []
  });
  useEffect(() => {
    if (preloadUrls.length > 0) {
      preload(preloadUrls);
    }
  }, []);
  const updateProgress = useCallback((loaded, total) => {
    setState((prev) => ({
      ...prev,
      loaded,
      total,
      progress: total > 0 ? Math.round(loaded / total * 100) : 0
    }));
  }, []);
  const loadModel = useCallback(
    async (url) => {
      setState((prev) => ({ ...prev, isLoading: true }));
      try {
        const model = await loaderRef.current.loadModel(url);
        setState((prev) => ({
          ...prev,
          isLoading: false,
          loaded: prev.loaded + 1
        }));
        return model;
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : String(error);
        setState((prev) => ({
          ...prev,
          isLoading: false,
          errors: [...prev.errors, errorMsg]
        }));
        throw error;
      }
    },
    []
  );
  const loadOBJ = useCallback(
    async (url) => {
      setState((prev) => ({ ...prev, isLoading: true }));
      try {
        const model = await loaderRef.current.loadOBJ(url);
        setState((prev) => ({
          ...prev,
          isLoading: false,
          loaded: prev.loaded + 1
        }));
        return model;
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : String(error);
        setState((prev) => ({
          ...prev,
          isLoading: false,
          errors: [...prev.errors, errorMsg]
        }));
        throw error;
      }
    },
    []
  );
  const loadTexture = useCallback(
    async (url) => {
      setState((prev) => ({ ...prev, isLoading: true }));
      try {
        const texture = await loaderRef.current.loadTexture(url);
        setState((prev) => ({
          ...prev,
          isLoading: false,
          loaded: prev.loaded + 1
        }));
        return texture;
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : String(error);
        setState((prev) => ({
          ...prev,
          isLoading: false,
          errors: [...prev.errors, errorMsg]
        }));
        throw error;
      }
    },
    []
  );
  const preload = useCallback(
    async (urls) => {
      setState((prev) => ({
        ...prev,
        isLoading: true,
        total: urls.length,
        loaded: 0,
        errors: []
      }));
      let completed = 0;
      const errors = [];
      await Promise.all(
        urls.map(async (url) => {
          try {
            if (url.endsWith(".glb") || url.endsWith(".gltf")) {
              await loaderRef.current.loadModel(url);
            } else if (url.endsWith(".obj")) {
              await loaderRef.current.loadOBJ(url);
            } else if (/\.(png|jpg|jpeg|webp)$/i.test(url)) {
              await loaderRef.current.loadTexture(url);
            }
            completed++;
            updateProgress(completed, urls.length);
          } catch (error) {
            const errorMsg = error instanceof Error ? error.message : String(error);
            errors.push(`${url}: ${errorMsg}`);
            completed++;
            updateProgress(completed, urls.length);
          }
        })
      );
      setState((prev) => ({
        ...prev,
        isLoading: false,
        errors
      }));
    },
    [updateProgress]
  );
  const hasModel = useCallback((url) => {
    return loaderRef.current.hasModel(url);
  }, []);
  const hasTexture = useCallback((url) => {
    return loaderRef.current.hasTexture(url);
  }, []);
  const getModel = useCallback((url) => {
    try {
      return loaderRef.current.getModel(url);
    } catch {
      return void 0;
    }
  }, []);
  const getTexture = useCallback((url) => {
    try {
      return loaderRef.current.getTexture(url);
    } catch {
      return void 0;
    }
  }, []);
  const clearCache = useCallback(() => {
    loaderRef.current.clearCache();
    setState({
      isLoading: false,
      progress: 0,
      loaded: 0,
      total: 0,
      errors: []
    });
  }, []);
  return {
    ...state,
    loadModel,
    loadOBJ,
    loadTexture,
    preload,
    hasModel,
    hasTexture,
    getModel,
    getTexture,
    clearCache
  };
}
function useSceneGraph() {
  const nodesRef = useRef(/* @__PURE__ */ new Map());
  const addNode = useCallback((node) => {
    const existing = nodesRef.current.get(node.id);
    if (existing) {
      existing.mesh.removeFromParent();
    }
    nodesRef.current.set(node.id, node);
  }, []);
  const removeNode = useCallback((id) => {
    const node = nodesRef.current.get(id);
    if (node) {
      node.mesh.removeFromParent();
      nodesRef.current.delete(id);
    }
  }, []);
  const getNode = useCallback((id) => {
    return nodesRef.current.get(id);
  }, []);
  const updateNodePosition = useCallback(
    (id, x, y, z) => {
      const node = nodesRef.current.get(id);
      if (node) {
        node.mesh.position.set(x, y, z);
        node.position = { x, y, z };
      }
    },
    []
  );
  const updateNodeGridPosition = useCallback(
    (id, gridX, gridZ) => {
      const node = nodesRef.current.get(id);
      if (node) {
        node.gridPosition = { x: gridX, z: gridZ };
      }
    },
    []
  );
  const getNodeAtGrid = useCallback(
    (x, z, type) => {
      return Array.from(nodesRef.current.values()).find((node) => {
        const matchesGrid = node.gridPosition.x === x && node.gridPosition.z === z;
        return type ? matchesGrid && node.type === type : matchesGrid;
      });
    },
    []
  );
  const getNodesByType = useCallback((type) => {
    return Array.from(nodesRef.current.values()).filter((node) => node.type === type);
  }, []);
  const getNodesInBounds = useCallback(
    (minX, maxX, minZ, maxZ) => {
      return Array.from(nodesRef.current.values()).filter((node) => {
        const { x, z } = node.gridPosition;
        return x >= minX && x <= maxX && z >= minZ && z <= maxZ;
      });
    },
    []
  );
  const clearNodes = useCallback(() => {
    nodesRef.current.forEach((node) => {
      node.mesh.removeFromParent();
    });
    nodesRef.current.clear();
  }, []);
  const countNodes = useCallback((type) => {
    if (!type) {
      return nodesRef.current.size;
    }
    return Array.from(nodesRef.current.values()).filter((node) => node.type === type).length;
  }, []);
  return {
    nodesRef,
    addNode,
    removeNode,
    getNode,
    updateNodePosition,
    updateNodeGridPosition,
    getNodeAtGrid,
    getNodesByType,
    getNodesInBounds,
    clearNodes,
    countNodes
  };
}
function useRaycaster(options) {
  const { camera, canvas, cellSize = 1, offsetX = 0, offsetZ = 0 } = options;
  const raycaster = useRef(new THREE6.Raycaster());
  const mouse = useRef(new THREE6.Vector2());
  const clientToNDC = useCallback(
    (clientX, clientY) => {
      if (!canvas) {
        return { x: 0, y: 0 };
      }
      const rect = canvas.getBoundingClientRect();
      return {
        x: (clientX - rect.left) / rect.width * 2 - 1,
        y: -((clientY - rect.top) / rect.height) * 2 + 1
      };
    },
    [canvas]
  );
  const isWithinCanvas = useCallback(
    (clientX, clientY) => {
      if (!canvas) return false;
      const rect = canvas.getBoundingClientRect();
      return clientX >= rect.left && clientX <= rect.right && clientY >= rect.top && clientY <= rect.bottom;
    },
    [canvas]
  );
  const getIntersection = useCallback(
    (clientX, clientY, objects) => {
      if (!camera || !canvas) return null;
      const ndc = clientToNDC(clientX, clientY);
      mouse.current.set(ndc.x, ndc.y);
      raycaster.current.setFromCamera(mouse.current, camera);
      const intersects = raycaster.current.intersectObjects(objects, true);
      if (intersects.length > 0) {
        const hit = intersects[0];
        return {
          object: hit.object,
          point: hit.point,
          distance: hit.distance,
          uv: hit.uv,
          face: hit.face,
          faceIndex: hit.faceIndex,
          instanceId: hit.instanceId
        };
      }
      return null;
    },
    [camera, canvas, clientToNDC]
  );
  const getAllIntersections = useCallback(
    (clientX, clientY, objects) => {
      if (!camera || !canvas) return [];
      const ndc = clientToNDC(clientX, clientY);
      mouse.current.set(ndc.x, ndc.y);
      raycaster.current.setFromCamera(mouse.current, camera);
      const intersects = raycaster.current.intersectObjects(objects, true);
      return intersects.map((hit) => ({
        object: hit.object,
        point: hit.point,
        distance: hit.distance,
        uv: hit.uv,
        face: hit.face,
        faceIndex: hit.faceIndex,
        instanceId: hit.instanceId
      }));
    },
    [camera, canvas, clientToNDC]
  );
  const getGridCoordinates = useCallback(
    (clientX, clientY) => {
      if (!camera || !canvas) return null;
      const ndc = clientToNDC(clientX, clientY);
      mouse.current.set(ndc.x, ndc.y);
      raycaster.current.setFromCamera(mouse.current, camera);
      const plane = new THREE6.Plane(new THREE6.Vector3(0, 1, 0), 0);
      const target = new THREE6.Vector3();
      const intersection = raycaster.current.ray.intersectPlane(plane, target);
      if (intersection) {
        const gridX = Math.round((target.x - offsetX) / cellSize);
        const gridZ = Math.round((target.z - offsetZ) / cellSize);
        return { x: gridX, z: gridZ };
      }
      return null;
    },
    [camera, canvas, cellSize, offsetX, offsetZ, clientToNDC]
  );
  const getTileAtPosition = useCallback(
    (clientX, clientY, scene) => {
      if (!camera || !canvas) return null;
      const tileMeshes = [];
      scene.traverse((obj) => {
        if (obj.userData.type === "tile" || obj.userData.isTile) {
          tileMeshes.push(obj);
        }
      });
      const hit = getIntersection(clientX, clientY, tileMeshes);
      if (hit) {
        const gridCoords2 = getGridCoordinates(clientX, clientY);
        if (gridCoords2) {
          return {
            gridX: gridCoords2.x,
            gridZ: gridCoords2.z,
            worldPosition: hit.point,
            objectType: hit.object.userData.type || "tile",
            objectId: hit.object.userData.id || hit.object.userData.tileId
          };
        }
      }
      const gridCoords = getGridCoordinates(clientX, clientY);
      if (gridCoords) {
        return {
          gridX: gridCoords.x,
          gridZ: gridCoords.z,
          worldPosition: new THREE6.Vector3(
            gridCoords.x * cellSize + offsetX,
            0,
            gridCoords.z * cellSize + offsetZ
          )
        };
      }
      return null;
    },
    [camera, canvas, getIntersection, getGridCoordinates, cellSize, offsetX, offsetZ]
  );
  return {
    raycaster,
    mouse,
    getIntersection,
    getAllIntersections,
    getGridCoordinates,
    getTileAtPosition,
    clientToNDC,
    isWithinCanvas
  };
}
function useGameCanvas3DEvents(options) {
  const {
    tileClickEvent,
    unitClickEvent,
    featureClickEvent,
    canvasClickEvent,
    tileHoverEvent,
    tileLeaveEvent,
    unitAnimationEvent,
    cameraChangeEvent,
    onTileClick,
    onUnitClick,
    onFeatureClick,
    onCanvasClick,
    onTileHover,
    onUnitAnimation
  } = options;
  const emit = useEmitEvent();
  const optionsRef = useRef(options);
  optionsRef.current = options;
  const handleTileClick = useCallback(
    (tile, event) => {
      if (tileClickEvent) {
        emit(tileClickEvent, {
          tileId: tile.id,
          x: tile.x,
          z: tile.z ?? tile.y ?? 0,
          type: tile.type,
          terrain: tile.terrain,
          elevation: tile.elevation
        });
      }
      optionsRef.current.onTileClick?.(tile, event);
    },
    [tileClickEvent, emit]
  );
  const handleUnitClick = useCallback(
    (unit, event) => {
      if (unitClickEvent) {
        emit(unitClickEvent, {
          unitId: unit.id,
          x: unit.x,
          z: unit.z ?? unit.y ?? 0,
          unitType: unit.unitType,
          name: unit.name,
          team: unit.team,
          faction: unit.faction,
          health: unit.health,
          maxHealth: unit.maxHealth
        });
      }
      optionsRef.current.onUnitClick?.(unit, event);
    },
    [unitClickEvent, emit]
  );
  const handleFeatureClick = useCallback(
    (feature, event) => {
      if (featureClickEvent) {
        emit(featureClickEvent, {
          featureId: feature.id,
          x: feature.x,
          z: feature.z ?? feature.y ?? 0,
          type: feature.type,
          elevation: feature.elevation
        });
      }
      optionsRef.current.onFeatureClick?.(feature, event);
    },
    [featureClickEvent, emit]
  );
  const handleCanvasClick = useCallback(
    (event) => {
      if (canvasClickEvent) {
        emit(canvasClickEvent, {
          clientX: event.clientX,
          clientY: event.clientY,
          button: event.button
        });
      }
      optionsRef.current.onCanvasClick?.(event);
    },
    [canvasClickEvent, emit]
  );
  const handleTileHover = useCallback(
    (tile, event) => {
      if (tile) {
        if (tileHoverEvent) {
          emit(tileHoverEvent, {
            tileId: tile.id,
            x: tile.x,
            z: tile.z ?? tile.y ?? 0,
            type: tile.type
          });
        }
      } else {
        if (tileLeaveEvent) {
          emit(tileLeaveEvent, {});
        }
      }
      optionsRef.current.onTileHover?.(tile, event);
    },
    [tileHoverEvent, tileLeaveEvent, emit]
  );
  const handleUnitAnimation = useCallback(
    (unitId, state) => {
      if (unitAnimationEvent) {
        emit(unitAnimationEvent, {
          unitId,
          state,
          timestamp: Date.now()
        });
      }
      optionsRef.current.onUnitAnimation?.(unitId, state);
    },
    [unitAnimationEvent, emit]
  );
  const handleCameraChange = useCallback(
    (position) => {
      if (cameraChangeEvent) {
        emit(cameraChangeEvent, {
          position,
          timestamp: Date.now()
        });
      }
    },
    [cameraChangeEvent, emit]
  );
  return {
    handleTileClick,
    handleUnitClick,
    handleFeatureClick,
    handleCanvasClick,
    handleTileHover,
    handleUnitAnimation,
    handleCameraChange
  };
}
var DEFAULT_TERRAIN_COLORS = {
  grass: "#44aa44",
  dirt: "#8b7355",
  sand: "#ddcc88",
  water: "#4488cc",
  rock: "#888888",
  snow: "#eeeeee",
  forest: "#228b22",
  desert: "#d4a574",
  mountain: "#696969",
  swamp: "#556b2f"
};
function TileRenderer({
  tiles,
  cellSize = 1,
  offsetX = 0,
  offsetZ = 0,
  useInstancing = true,
  terrainColors = DEFAULT_TERRAIN_COLORS,
  onTileClick,
  onTileHover,
  selectedTileIds = [],
  validMoves = [],
  attackTargets = []
}) {
  const meshRef = useRef(null);
  const geometry = useMemo(() => {
    return new THREE6.BoxGeometry(cellSize * 0.95, 0.2, cellSize * 0.95);
  }, [cellSize]);
  const material = useMemo(() => {
    return new THREE6.MeshStandardMaterial({
      roughness: 0.8,
      metalness: 0.1
    });
  }, []);
  const { positions, colors, tileMap } = useMemo(() => {
    const pos = [];
    const cols = [];
    const map = /* @__PURE__ */ new Map();
    tiles.forEach((tile) => {
      const x = (tile.x - offsetX) * cellSize;
      const z = ((tile.z ?? tile.y ?? 0) - offsetZ) * cellSize;
      const y = (tile.elevation ?? 0) * 0.1;
      pos.push(new THREE6.Vector3(x, y, z));
      const colorHex = terrainColors[tile.type || ""] || terrainColors[tile.terrain || ""] || "#808080";
      const color = new THREE6.Color(colorHex);
      const isValidMove = validMoves.some(
        (m) => m.x === tile.x && m.z === (tile.z ?? tile.y ?? 0)
      );
      const isAttackTarget = attackTargets.some(
        (m) => m.x === tile.x && m.z === (tile.z ?? tile.y ?? 0)
      );
      const isSelected = tile.id ? selectedTileIds.includes(tile.id) : false;
      if (isSelected) {
        color.addScalar(0.3);
      } else if (isAttackTarget) {
        color.setHex(16729156);
      } else if (isValidMove) {
        color.setHex(4521796);
      }
      cols.push(color);
      map.set(`${tile.x},${tile.z ?? tile.y ?? 0}`, tile);
    });
    return { positions: pos, colors: cols, tileMap: map };
  }, [tiles, cellSize, offsetX, offsetZ, terrainColors, selectedTileIds, validMoves, attackTargets]);
  useEffect(() => {
    if (!meshRef.current || !useInstancing) return;
    const mesh = meshRef.current;
    mesh.count = positions.length;
    const dummy = new THREE6.Object3D();
    positions.forEach((pos, i) => {
      dummy.position.copy(pos);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
      if (mesh.setColorAt) {
        mesh.setColorAt(i, colors[i]);
      }
    });
    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) {
      mesh.instanceColor.needsUpdate = true;
    }
  }, [positions, colors, useInstancing]);
  const handlePointerMove = (e) => {
    if (!onTileHover) return;
    const instanceId = e.instanceId;
    if (instanceId !== void 0) {
      const pos = positions[instanceId];
      if (pos) {
        const gridX = Math.round(pos.x / cellSize + offsetX);
        const gridZ = Math.round(pos.z / cellSize + offsetZ);
        const tile = tileMap.get(`${gridX},${gridZ}`);
        if (tile) {
          onTileHover(tile);
        }
      }
    }
  };
  const handleClick = (e) => {
    if (!onTileClick) return;
    const instanceId = e.instanceId;
    if (instanceId !== void 0) {
      const pos = positions[instanceId];
      if (pos) {
        const gridX = Math.round(pos.x / cellSize + offsetX);
        const gridZ = Math.round(pos.z / cellSize + offsetZ);
        const tile = tileMap.get(`${gridX},${gridZ}`);
        if (tile) {
          onTileClick(tile);
        }
      }
    }
  };
  const renderIndividualTiles = () => {
    return tiles.map((tile) => {
      const x = (tile.x - offsetX) * cellSize;
      const z = ((tile.z ?? tile.y ?? 0) - offsetZ) * cellSize;
      const y = (tile.elevation ?? 0) * 0.1;
      const colorHex = terrainColors[tile.type || ""] || terrainColors[tile.terrain || ""] || "#808080";
      const isSelected = tile.id ? selectedTileIds.includes(tile.id) : false;
      const isValidMove = validMoves.some(
        (m) => m.x === tile.x && m.z === (tile.z ?? tile.y ?? 0)
      );
      const isAttackTarget = attackTargets.some(
        (m) => m.x === tile.x && m.z === (tile.z ?? tile.y ?? 0)
      );
      let emissive = "#000000";
      if (isSelected) emissive = "#444444";
      else if (isAttackTarget) emissive = "#440000";
      else if (isValidMove) emissive = "#004400";
      return /* @__PURE__ */ jsxs(
        "mesh",
        {
          position: [x, y, z],
          userData: { type: "tile", tileId: tile.id, gridX: tile.x, gridZ: tile.z ?? tile.y },
          onClick: () => onTileClick?.(tile),
          onPointerEnter: () => onTileHover?.(tile),
          onPointerLeave: () => onTileHover?.(null),
          children: [
            /* @__PURE__ */ jsx("boxGeometry", { args: [cellSize * 0.95, 0.2, cellSize * 0.95] }),
            /* @__PURE__ */ jsx(
              "meshStandardMaterial",
              {
                color: colorHex,
                emissive,
                roughness: 0.8,
                metalness: 0.1
              }
            )
          ]
        },
        tile.id ?? `tile-${tile.x}-${tile.y}`
      );
    });
  };
  if (useInstancing && tiles.length > 0) {
    return /* @__PURE__ */ jsx(
      "instancedMesh",
      {
        ref: meshRef,
        args: [geometry, material, tiles.length],
        onPointerMove: handlePointerMove,
        onClick: handleClick
      }
    );
  }
  return /* @__PURE__ */ jsx("group", { children: renderIndividualTiles() });
}
function UnitVisual({ unit, position, isSelected, onClick }) {
  const groupRef = useRef(null);
  const [animationState, setAnimationState] = useState("idle");
  const [isHovered, setIsHovered] = useState(false);
  const teamColor = useMemo(() => {
    if (unit.faction === "player" || unit.team === "player") return 4491519;
    if (unit.faction === "enemy" || unit.team === "enemy") return 16729156;
    if (unit.faction === "neutral" || unit.team === "neutral") return 16777028;
    return 8947848;
  }, [unit.faction, unit.team]);
  useFrame((state) => {
    if (groupRef.current && animationState === "idle") {
      const y = position[1] + Math.sin(state.clock.elapsedTime * 2 + position[0]) * 0.05;
      groupRef.current.position.y = y;
    }
  });
  const healthPercent = useMemo(() => {
    if (unit.health === void 0 || unit.maxHealth === void 0) return 1;
    return Math.max(0, Math.min(1, unit.health / unit.maxHealth));
  }, [unit.health, unit.maxHealth]);
  const healthColor = useMemo(() => {
    if (healthPercent > 0.5) return "#44aa44";
    if (healthPercent > 0.25) return "#aaaa44";
    return "#ff4444";
  }, [healthPercent]);
  return /* @__PURE__ */ jsxs(
    "group",
    {
      ref: groupRef,
      position,
      onClick,
      onPointerEnter: () => setIsHovered(true),
      onPointerLeave: () => setIsHovered(false),
      userData: { type: "unit", unitId: unit.id },
      children: [
        isSelected && /* @__PURE__ */ jsxs("mesh", { position: [0, 0.05, 0], rotation: [-Math.PI / 2, 0, 0], children: [
          /* @__PURE__ */ jsx("ringGeometry", { args: [0.4, 0.5, 32] }),
          /* @__PURE__ */ jsx("meshBasicMaterial", { color: "#ffff00", transparent: true, opacity: 0.8 })
        ] }),
        isHovered && !isSelected && /* @__PURE__ */ jsxs("mesh", { position: [0, 0.05, 0], rotation: [-Math.PI / 2, 0, 0], children: [
          /* @__PURE__ */ jsx("ringGeometry", { args: [0.4, 0.5, 32] }),
          /* @__PURE__ */ jsx("meshBasicMaterial", { color: "#ffffff", transparent: true, opacity: 0.5 })
        ] }),
        /* @__PURE__ */ jsxs("mesh", { position: [0, 0.1, 0], children: [
          /* @__PURE__ */ jsx("cylinderGeometry", { args: [0.25, 0.25, 0.1, 8] }),
          /* @__PURE__ */ jsx("meshStandardMaterial", { color: teamColor })
        ] }),
        /* @__PURE__ */ jsxs("mesh", { position: [0, 0.5, 0], children: [
          /* @__PURE__ */ jsx("capsuleGeometry", { args: [0.15, 0.5, 4, 8] }),
          /* @__PURE__ */ jsx("meshStandardMaterial", { color: teamColor })
        ] }),
        /* @__PURE__ */ jsxs("mesh", { position: [0, 0.9, 0], children: [
          /* @__PURE__ */ jsx("sphereGeometry", { args: [0.12, 8, 8] }),
          /* @__PURE__ */ jsx("meshStandardMaterial", { color: teamColor })
        ] }),
        /* @__PURE__ */ jsxs("mesh", { position: [0, 1.3, 0], children: [
          /* @__PURE__ */ jsx("planeGeometry", { args: [0.5, 0.06] }),
          /* @__PURE__ */ jsx("meshBasicMaterial", { color: "#333333" })
        ] }),
        /* @__PURE__ */ jsxs("mesh", { position: [-0.25 + 0.25 * healthPercent, 1.3, 0.01], children: [
          /* @__PURE__ */ jsx("planeGeometry", { args: [0.5 * healthPercent, 0.04] }),
          /* @__PURE__ */ jsx("meshBasicMaterial", { color: healthColor })
        ] }),
        unit.name && /* @__PURE__ */ jsxs("mesh", { position: [0, 1.5, 0], children: [
          /* @__PURE__ */ jsx("planeGeometry", { args: [0.4, 0.1] }),
          /* @__PURE__ */ jsx("meshBasicMaterial", { color: "#000000", transparent: true, opacity: 0.5 })
        ] })
      ]
    }
  );
}
function UnitRenderer({
  units,
  cellSize = 1,
  offsetX = 0,
  offsetZ = 0,
  selectedUnitId,
  onUnitClick,
  onAnimationStateChange,
  animationSpeed = 1
}) {
  const handleUnitClick = React7.useCallback(
    (unit) => {
      onUnitClick?.(unit);
    },
    [onUnitClick]
  );
  return /* @__PURE__ */ jsx("group", { children: units.map((unit) => {
    const unitX = unit.x ?? unit.position?.x ?? 0;
    const unitY = unit.z ?? unit.y ?? unit.position?.y ?? 0;
    const x = (unitX - offsetX) * cellSize;
    const z = (unitY - offsetZ) * cellSize;
    const y = (unit.elevation ?? 0) * 0.1 + 0.5;
    return /* @__PURE__ */ jsx(
      UnitVisual,
      {
        unit,
        position: [x, y, z],
        isSelected: selectedUnitId === unit.id,
        onClick: () => handleUnitClick(unit)
      },
      unit.id
    );
  }) });
}
var DEFAULT_FEATURE_CONFIGS = {
  tree: { color: 2263842, height: 1.5, scale: 1, geometry: "tree" },
  rock: { color: 8421504, height: 0.5, scale: 0.8, geometry: "rock" },
  bush: { color: 3329330, height: 0.4, scale: 0.6, geometry: "bush" },
  house: { color: 9127187, height: 1.2, scale: 1.2, geometry: "house" },
  tower: { color: 6908265, height: 2.5, scale: 1, geometry: "tower" },
  wall: { color: 8421504, height: 1, scale: 1, geometry: "wall" },
  mountain: { color: 5597999, height: 2, scale: 1.5, geometry: "mountain" },
  hill: { color: 7048739, height: 0.8, scale: 1.2, geometry: "hill" },
  water: { color: 4491468, height: 0.1, scale: 1, geometry: "water" },
  chest: { color: 16766720, height: 0.3, scale: 0.4, geometry: "chest" },
  sign: { color: 9127187, height: 0.8, scale: 0.3, geometry: "sign" },
  portal: { color: 10040012, height: 1.5, scale: 1, geometry: "portal" }
};
function TreeFeature({ height, color }) {
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsxs("mesh", { position: [0, height * 0.3, 0], children: [
      /* @__PURE__ */ jsx("cylinderGeometry", { args: [0.08, 0.1, height * 0.6, 6] }),
      /* @__PURE__ */ jsx("meshStandardMaterial", { color: 9127187 })
    ] }),
    /* @__PURE__ */ jsxs("mesh", { position: [0, height * 0.7, 0], children: [
      /* @__PURE__ */ jsx("coneGeometry", { args: [0.4, height * 0.5, 8] }),
      /* @__PURE__ */ jsx("meshStandardMaterial", { color })
    ] }),
    /* @__PURE__ */ jsxs("mesh", { position: [0, height * 0.9, 0], children: [
      /* @__PURE__ */ jsx("coneGeometry", { args: [0.3, height * 0.4, 8] }),
      /* @__PURE__ */ jsx("meshStandardMaterial", { color })
    ] }),
    /* @__PURE__ */ jsxs("mesh", { position: [0, height * 1.05, 0], children: [
      /* @__PURE__ */ jsx("coneGeometry", { args: [0.15, height * 0.25, 8] }),
      /* @__PURE__ */ jsx("meshStandardMaterial", { color })
    ] })
  ] });
}
function RockFeature({ height, color }) {
  return /* @__PURE__ */ jsxs("mesh", { position: [0, height * 0.4, 0], children: [
    /* @__PURE__ */ jsx("dodecahedronGeometry", { args: [height * 0.5, 0] }),
    /* @__PURE__ */ jsx("meshStandardMaterial", { color, roughness: 0.9 })
  ] });
}
function BushFeature({ height, color }) {
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsxs("mesh", { position: [0, height * 0.3, 0], children: [
      /* @__PURE__ */ jsx("sphereGeometry", { args: [height * 0.4, 8, 8] }),
      /* @__PURE__ */ jsx("meshStandardMaterial", { color })
    ] }),
    /* @__PURE__ */ jsxs("mesh", { position: [0.1, height * 0.4, 0.1], children: [
      /* @__PURE__ */ jsx("sphereGeometry", { args: [height * 0.25, 8, 8] }),
      /* @__PURE__ */ jsx("meshStandardMaterial", { color })
    ] })
  ] });
}
function HouseFeature({ height, color }) {
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsxs("mesh", { position: [0, height * 0.4, 0], children: [
      /* @__PURE__ */ jsx("boxGeometry", { args: [0.8, height * 0.8, 0.8] }),
      /* @__PURE__ */ jsx("meshStandardMaterial", { color: 13808780 })
    ] }),
    /* @__PURE__ */ jsxs("mesh", { position: [0, height * 0.9, 0], children: [
      /* @__PURE__ */ jsx("coneGeometry", { args: [0.6, height * 0.4, 4] }),
      /* @__PURE__ */ jsx("meshStandardMaterial", { color })
    ] }),
    /* @__PURE__ */ jsxs("mesh", { position: [0, height * 0.25, 0.41], children: [
      /* @__PURE__ */ jsx("planeGeometry", { args: [0.25, height * 0.5] }),
      /* @__PURE__ */ jsx("meshStandardMaterial", { color: 4863784 })
    ] })
  ] });
}
function TowerFeature({ height, color }) {
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsxs("mesh", { position: [0, height * 0.5, 0], children: [
      /* @__PURE__ */ jsx("cylinderGeometry", { args: [0.3, 0.35, height, 8] }),
      /* @__PURE__ */ jsx("meshStandardMaterial", { color })
    ] }),
    /* @__PURE__ */ jsxs("mesh", { position: [0, height + 0.05, 0], children: [
      /* @__PURE__ */ jsx("cylinderGeometry", { args: [0.35, 0.35, 0.1, 8] }),
      /* @__PURE__ */ jsx("meshStandardMaterial", { color })
    ] })
  ] });
}
function ChestFeature({ height, color }) {
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsxs("mesh", { position: [0, height * 0.5, 0], children: [
      /* @__PURE__ */ jsx("boxGeometry", { args: [0.3, height, 0.2] }),
      /* @__PURE__ */ jsx("meshStandardMaterial", { color, metalness: 0.6, roughness: 0.3 })
    ] }),
    /* @__PURE__ */ jsxs("mesh", { position: [0, height + 0.05, 0], children: [
      /* @__PURE__ */ jsx("cylinderGeometry", { args: [0.15, 0.15, 0.3, 8, 1, false, 0, Math.PI] }),
      /* @__PURE__ */ jsx("meshStandardMaterial", { color, metalness: 0.6, roughness: 0.3 })
    ] })
  ] });
}
function DefaultFeature({ height, color }) {
  return /* @__PURE__ */ jsxs("mesh", { position: [0, height * 0.5, 0], children: [
    /* @__PURE__ */ jsx("boxGeometry", { args: [0.5, height, 0.5] }),
    /* @__PURE__ */ jsx("meshStandardMaterial", { color })
  ] });
}
function FeatureVisual({
  feature,
  position,
  isSelected,
  onClick,
  onHover
}) {
  const config = DEFAULT_FEATURE_CONFIGS[feature.type] || {
    color: 8947848,
    height: 0.5,
    scale: 1,
    geometry: "default"
  };
  const color = feature.color ? parseInt(feature.color.replace("#", ""), 16) : config.color;
  const renderGeometry = () => {
    switch (config.geometry) {
      case "tree":
        return /* @__PURE__ */ jsx(TreeFeature, { height: config.height, color });
      case "rock":
        return /* @__PURE__ */ jsx(RockFeature, { height: config.height, color });
      case "bush":
        return /* @__PURE__ */ jsx(BushFeature, { height: config.height, color });
      case "house":
        return /* @__PURE__ */ jsx(HouseFeature, { height: config.height, color });
      case "tower":
        return /* @__PURE__ */ jsx(TowerFeature, { height: config.height, color });
      case "chest":
        return /* @__PURE__ */ jsx(ChestFeature, { height: config.height, color });
      default:
        return /* @__PURE__ */ jsx(DefaultFeature, { height: config.height, color });
    }
  };
  return /* @__PURE__ */ jsxs(
    "group",
    {
      position,
      scale: config.scale,
      onClick,
      onPointerEnter: () => onHover(true),
      onPointerLeave: () => onHover(false),
      userData: { type: "feature", featureId: feature.id, featureType: feature.type },
      children: [
        isSelected && /* @__PURE__ */ jsxs("mesh", { position: [0, 0.02, 0], rotation: [-Math.PI / 2, 0, 0], children: [
          /* @__PURE__ */ jsx("ringGeometry", { args: [0.4, 0.5, 32] }),
          /* @__PURE__ */ jsx("meshBasicMaterial", { color: "#ffff00", transparent: true, opacity: 0.8 })
        ] }),
        /* @__PURE__ */ jsxs("mesh", { position: [0, 0.01, 0], rotation: [-Math.PI / 2, 0, 0], children: [
          /* @__PURE__ */ jsx("circleGeometry", { args: [0.35, 16] }),
          /* @__PURE__ */ jsx("meshBasicMaterial", { color: "#000000", transparent: true, opacity: 0.2 })
        ] }),
        renderGeometry()
      ]
    }
  );
}
function FeatureRenderer({
  features,
  cellSize = 1,
  offsetX = 0,
  offsetZ = 0,
  onFeatureClick,
  onFeatureHover,
  selectedFeatureIds = [],
  featureColors
}) {
  return /* @__PURE__ */ jsx("group", { children: features.map((feature) => {
    const x = (feature.x - offsetX) * cellSize;
    const z = ((feature.z ?? feature.y ?? 0) - offsetZ) * cellSize;
    const y = (feature.elevation ?? 0) * 0.1;
    const isSelected = feature.id ? selectedFeatureIds.includes(feature.id) : false;
    return /* @__PURE__ */ jsx(
      FeatureVisual,
      {
        feature,
        position: [x, y, z],
        isSelected,
        onClick: () => onFeatureClick?.(feature),
        onHover: (hovered) => onFeatureHover?.(hovered ? feature : null)
      },
      feature.id ?? `feature-${feature.x}-${feature.y}`
    );
  }) });
}
function detectAssetRoot3(modelUrl) {
  const idx = modelUrl.indexOf("/3d/");
  if (idx !== -1) {
    return modelUrl.substring(0, idx + 4);
  }
  return modelUrl.substring(0, modelUrl.lastIndexOf("/") + 1);
}
function useGLTFModel2(url) {
  const [model, setModel] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  useEffect(() => {
    if (!url) {
      setModel(null);
      return;
    }
    setIsLoading(true);
    setError(null);
    const assetRoot = detectAssetRoot3(url);
    const loader = new GLTFLoader$1();
    loader.setResourcePath(assetRoot);
    loader.load(
      url,
      (gltf) => {
        setModel(gltf.scene);
        setIsLoading(false);
      },
      void 0,
      (err) => {
        setError(err instanceof Error ? err : new Error(String(err)));
        setIsLoading(false);
      }
    );
  }, [url]);
  return { model, isLoading, error };
}
function FeatureModel({
  feature,
  position,
  isSelected,
  onClick,
  onHover
}) {
  const groupRef = useRef(null);
  const { model: loadedModel, isLoading } = useGLTFModel2(feature.assetUrl);
  const model = useMemo(() => {
    if (!loadedModel) return null;
    const cloned = loadedModel.clone();
    cloned.scale.setScalar(0.3);
    cloned.traverse((child) => {
      if (child instanceof THREE6.Mesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });
    return cloned;
  }, [loadedModel]);
  useFrame((state) => {
    if (groupRef.current) {
      const featureRotation = feature.rotation;
      const baseRotation = featureRotation !== void 0 ? featureRotation * Math.PI / 180 - Math.PI / 4 : -Math.PI / 4;
      const wobble = isSelected ? Math.sin(state.clock.elapsedTime * 2) * 0.1 : 0;
      groupRef.current.rotation.y = baseRotation + wobble;
    }
  });
  if (isLoading) {
    return /* @__PURE__ */ jsx("group", { position, children: /* @__PURE__ */ jsxs("mesh", { rotation: [Math.PI / 2, 0, 0], children: [
      /* @__PURE__ */ jsx("ringGeometry", { args: [0.3, 0.35, 16] }),
      /* @__PURE__ */ jsx("meshBasicMaterial", { color: "#4a90d9", transparent: true, opacity: 0.8 })
    ] }) });
  }
  if (!model && !feature.assetUrl) {
    return /* @__PURE__ */ jsxs(
      "group",
      {
        position,
        onClick,
        onPointerEnter: () => onHover(true),
        onPointerLeave: () => onHover(false),
        userData: { type: "feature", featureId: feature.id, featureType: feature.type },
        children: [
          isSelected && /* @__PURE__ */ jsxs("mesh", { position: [0, 0.02, 0], rotation: [-Math.PI / 2, 0, 0], children: [
            /* @__PURE__ */ jsx("ringGeometry", { args: [0.4, 0.5, 32] }),
            /* @__PURE__ */ jsx("meshBasicMaterial", { color: "#ffff00", transparent: true, opacity: 0.8 })
          ] }),
          /* @__PURE__ */ jsxs("mesh", { position: [0, 0.5, 0], children: [
            /* @__PURE__ */ jsx("boxGeometry", { args: [0.4, 0.4, 0.4] }),
            /* @__PURE__ */ jsx("meshStandardMaterial", { color: 8947848 })
          ] })
        ]
      }
    );
  }
  return /* @__PURE__ */ jsxs(
    "group",
    {
      ref: groupRef,
      position,
      onClick,
      onPointerEnter: () => onHover(true),
      onPointerLeave: () => onHover(false),
      userData: { type: "feature", featureId: feature.id, featureType: feature.type },
      children: [
        isSelected && /* @__PURE__ */ jsxs("mesh", { position: [0, 0.02, 0], rotation: [-Math.PI / 2, 0, 0], children: [
          /* @__PURE__ */ jsx("ringGeometry", { args: [0.4, 0.5, 32] }),
          /* @__PURE__ */ jsx("meshBasicMaterial", { color: "#ffff00", transparent: true, opacity: 0.8 })
        ] }),
        /* @__PURE__ */ jsxs("mesh", { position: [0, 0.01, 0], rotation: [-Math.PI / 2, 0, 0], children: [
          /* @__PURE__ */ jsx("circleGeometry", { args: [0.35, 16] }),
          /* @__PURE__ */ jsx("meshBasicMaterial", { color: "#000000", transparent: true, opacity: 0.2 })
        ] }),
        model && /* @__PURE__ */ jsx("primitive", { object: model })
      ]
    }
  );
}
function FeatureRenderer3D({
  features,
  cellSize = 1,
  offsetX = 0,
  offsetZ = 0,
  onFeatureClick,
  onFeatureHover,
  selectedFeatureIds = []
}) {
  return /* @__PURE__ */ jsx("group", { children: features.map((feature) => {
    const x = (feature.x - offsetX) * cellSize;
    const z = ((feature.z ?? feature.y ?? 0) - offsetZ) * cellSize;
    const y = (feature.elevation ?? 0) * 0.1;
    const isSelected = feature.id ? selectedFeatureIds.includes(feature.id) : false;
    return /* @__PURE__ */ jsx(
      FeatureModel,
      {
        feature,
        position: [x, y, z],
        isSelected,
        onClick: () => onFeatureClick?.(feature),
        onHover: (hovered) => onFeatureHover?.(hovered ? feature : null)
      },
      feature.id ?? `feature-${feature.x}-${feature.y}`
    );
  }) });
}
function preloadFeatures(urls) {
  urls.forEach((url) => {
    if (url) {
      const loader = new GLTFLoader$1();
      loader.setResourcePath(detectAssetRoot3(url));
      loader.load(url, () => {
        console.log("[FeatureRenderer3D] Preloaded:", url);
      });
    }
  });
}
var DEFAULT_CONFIG = {
  cellSize: 1,
  offsetX: 0,
  offsetZ: 0,
  elevation: 0
};
function gridToWorld(gridX, gridZ, config = DEFAULT_CONFIG) {
  const opts = { ...DEFAULT_CONFIG, ...config };
  return new THREE6.Vector3(
    gridX * opts.cellSize + opts.offsetX,
    opts.elevation,
    gridZ * opts.cellSize + opts.offsetZ
  );
}
function worldToGrid(worldX, worldZ, config = DEFAULT_CONFIG) {
  const opts = { ...DEFAULT_CONFIG, ...config };
  return {
    x: Math.round((worldX - opts.offsetX) / opts.cellSize),
    z: Math.round((worldZ - opts.offsetZ) / opts.cellSize)
  };
}
function raycastToPlane(camera, mouseX, mouseY, planeY = 0) {
  const raycaster = new THREE6.Raycaster();
  const mouse = new THREE6.Vector2(mouseX, mouseY);
  raycaster.setFromCamera(mouse, camera);
  const plane = new THREE6.Plane(new THREE6.Vector3(0, 1, 0), -planeY);
  const target = new THREE6.Vector3();
  const intersection = raycaster.ray.intersectPlane(plane, target);
  return intersection ? target : null;
}
function raycastToObjects(camera, mouseX, mouseY, objects) {
  const raycaster = new THREE6.Raycaster();
  const mouse = new THREE6.Vector2(mouseX, mouseY);
  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObjects(objects, true);
  return intersects.length > 0 ? intersects[0] : null;
}
function gridDistance(a, b) {
  const dx = b.x - a.x;
  const dz = b.z - a.z;
  return Math.sqrt(dx * dx + dz * dz);
}
function gridManhattanDistance(a, b) {
  return Math.abs(b.x - a.x) + Math.abs(b.z - a.z);
}
function getNeighbors(x, z, includeDiagonal = false) {
  const neighbors = [
    { x: x + 1, z },
    { x: x - 1, z },
    { x, z: z + 1 },
    { x, z: z - 1 }
  ];
  if (includeDiagonal) {
    neighbors.push(
      { x: x + 1, z: z + 1 },
      { x: x - 1, z: z - 1 },
      { x: x + 1, z: z - 1 },
      { x: x - 1, z: z + 1 }
    );
  }
  return neighbors;
}
function isInBounds(x, z, bounds) {
  return x >= bounds.minX && x <= bounds.maxX && z >= bounds.minZ && z <= bounds.maxZ;
}
function getCellsInRadius(centerX, centerZ, radius) {
  const cells = [];
  const radiusSquared = radius * radius;
  const minX = Math.floor(centerX - radius);
  const maxX = Math.ceil(centerX + radius);
  const minZ = Math.floor(centerZ - radius);
  const maxZ = Math.ceil(centerZ + radius);
  for (let x = minX; x <= maxX; x++) {
    for (let z = minZ; z <= maxZ; z++) {
      const dx = x - centerX;
      const dz = z - centerZ;
      if (dx * dx + dz * dz <= radiusSquared) {
        cells.push({ x, z });
      }
    }
  }
  return cells;
}
function createGridHighlight(color = 16776960, opacity = 0.3) {
  const geometry = new THREE6.PlaneGeometry(0.95, 0.95);
  const material = new THREE6.MeshBasicMaterial({
    color,
    transparent: true,
    opacity,
    side: THREE6.DoubleSide
  });
  const mesh = new THREE6.Mesh(geometry, material);
  mesh.rotation.x = -Math.PI / 2;
  mesh.position.y = 0.01;
  return mesh;
}
function normalizeMouseCoordinates(clientX, clientY, element) {
  const rect = element.getBoundingClientRect();
  return {
    x: (clientX - rect.left) / rect.width * 2 - 1,
    y: -((clientY - rect.top) / rect.height) * 2 + 1
  };
}
function isInFrustum(position, camera, padding = 0) {
  const frustum = new THREE6.Frustum();
  const projScreenMatrix = new THREE6.Matrix4();
  projScreenMatrix.multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse);
  frustum.setFromProjectionMatrix(projScreenMatrix);
  const sphere = new THREE6.Sphere(position, padding);
  return frustum.intersectsSphere(sphere);
}
function filterByFrustum(positions, camera, padding = 0) {
  const frustum = new THREE6.Frustum();
  const projScreenMatrix = new THREE6.Matrix4();
  projScreenMatrix.multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse);
  frustum.setFromProjectionMatrix(projScreenMatrix);
  return positions.filter((position) => {
    const sphere = new THREE6.Sphere(position, padding);
    return frustum.intersectsSphere(sphere);
  });
}
function getVisibleIndices(positions, camera, padding = 0) {
  const frustum = new THREE6.Frustum();
  const projScreenMatrix = new THREE6.Matrix4();
  const visible = /* @__PURE__ */ new Set();
  projScreenMatrix.multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse);
  frustum.setFromProjectionMatrix(projScreenMatrix);
  positions.forEach((position, index) => {
    const sphere = new THREE6.Sphere(position, padding);
    if (frustum.intersectsSphere(sphere)) {
      visible.add(index);
    }
  });
  return visible;
}
function calculateLODLevel(position, camera, lodLevels) {
  const distance = position.distanceTo(camera.position);
  for (let i = 0; i < lodLevels.length; i++) {
    if (distance < lodLevels[i]) {
      return i;
    }
  }
  return lodLevels.length;
}
function updateInstanceLOD(instancedMesh, positions, camera, lodDistances) {
  const lodIndices = new Uint8Array(positions.length);
  positions.forEach((position, index) => {
    lodIndices[index] = calculateLODLevel(position, camera, lodDistances);
  });
  return lodIndices;
}
function cullInstancedMesh(instancedMesh, positions, visibleIndices) {
  const dummy = new THREE6.Object3D();
  let visibleCount = 0;
  positions.forEach((position, index) => {
    if (visibleIndices.has(index)) {
      dummy.position.copy(position);
      dummy.updateMatrix();
      instancedMesh.setMatrixAt(visibleCount, dummy.matrix);
      visibleCount++;
    }
  });
  instancedMesh.count = visibleCount;
  instancedMesh.instanceMatrix.needsUpdate = true;
  return visibleCount;
}
var SpatialHashGrid = class {
  constructor(cellSize = 10) {
    __publicField(this, "cellSize");
    __publicField(this, "cells");
    __publicField(this, "objectPositions");
    this.cellSize = cellSize;
    this.cells = /* @__PURE__ */ new Map();
    this.objectPositions = /* @__PURE__ */ new Map();
  }
  /**
   * Get cell key for a position
   */
  getCellKey(x, z) {
    const cellX = Math.floor(x / this.cellSize);
    const cellZ = Math.floor(z / this.cellSize);
    return `${cellX},${cellZ}`;
  }
  /**
   * Insert an object into the grid
   */
  insert(id, position) {
    const key = this.getCellKey(position.x, position.z);
    if (!this.cells.has(key)) {
      this.cells.set(key, /* @__PURE__ */ new Set());
    }
    this.cells.get(key).add(id);
    this.objectPositions.set(id, position.clone());
  }
  /**
   * Remove an object from the grid
   */
  remove(id) {
    const position = this.objectPositions.get(id);
    if (position) {
      const key = this.getCellKey(position.x, position.z);
      this.cells.get(key)?.delete(id);
      this.objectPositions.delete(id);
    }
  }
  /**
   * Update an object's position
   */
  update(id, newPosition) {
    this.remove(id);
    this.insert(id, newPosition);
  }
  /**
   * Query objects within a radius of a position
   */
  queryRadius(center, radius) {
    const results = [];
    const radiusSquared = radius * radius;
    const minCellX = Math.floor((center.x - radius) / this.cellSize);
    const maxCellX = Math.floor((center.x + radius) / this.cellSize);
    const minCellZ = Math.floor((center.z - radius) / this.cellSize);
    const maxCellZ = Math.floor((center.z + radius) / this.cellSize);
    for (let x = minCellX; x <= maxCellX; x++) {
      for (let z = minCellZ; z <= maxCellZ; z++) {
        const key = `${x},${z}`;
        const cell = this.cells.get(key);
        if (cell) {
          cell.forEach((id) => {
            const position = this.objectPositions.get(id);
            if (position) {
              const dx = position.x - center.x;
              const dz = position.z - center.z;
              if (dx * dx + dz * dz <= radiusSquared) {
                results.push(id);
              }
            }
          });
        }
      }
    }
    return results;
  }
  /**
   * Query objects within a bounding box
   */
  queryBox(minX, maxX, minZ, maxZ) {
    const results = [];
    const minCellX = Math.floor(minX / this.cellSize);
    const maxCellX = Math.floor(maxX / this.cellSize);
    const minCellZ = Math.floor(minZ / this.cellSize);
    const maxCellZ = Math.floor(maxZ / this.cellSize);
    for (let x = minCellX; x <= maxCellX; x++) {
      for (let z = minCellZ; z <= maxCellZ; z++) {
        const key = `${x},${z}`;
        const cell = this.cells.get(key);
        if (cell) {
          cell.forEach((id) => {
            const position = this.objectPositions.get(id);
            if (position && position.x >= minX && position.x <= maxX && position.z >= minZ && position.z <= maxZ) {
              results.push(id);
            }
          });
        }
      }
    }
    return results;
  }
  /**
   * Clear all objects from the grid
   */
  clear() {
    this.cells.clear();
    this.objectPositions.clear();
  }
  /**
   * Get statistics about the grid
   */
  getStats() {
    return {
      objects: this.objectPositions.size,
      cells: this.cells.size
    };
  }
};

export { AssetLoader, Camera3D, Canvas3DErrorBoundary, Canvas3DLoadingState, FeatureRenderer, FeatureRenderer3D, Lighting3D, ModelLoader, PhysicsObject3D, Scene3D, SpatialHashGrid, TileRenderer, UnitRenderer, assetLoader, calculateLODLevel, createGridHighlight, cullInstancedMesh, filterByFrustum, getCellsInRadius, getNeighbors, getVisibleIndices, gridDistance, gridManhattanDistance, gridToWorld, isInBounds, isInFrustum, normalizeMouseCoordinates, preloadFeatures, raycastToObjects, raycastToPlane, updateInstanceLOD, useAssetLoader, useGameCanvas3DEvents, usePhysics3DController, useRaycaster, useSceneGraph, useThree3 as useThree, worldToGrid };
