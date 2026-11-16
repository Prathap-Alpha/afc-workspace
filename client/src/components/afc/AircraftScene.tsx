import { useEffect, useRef, useState } from "react";
import * as THREE from "three";

export type AircraftSceneProps = {
  className?: string;
  mode?: "aircraft" | "asset";
};

type SceneInteraction = {
  dragging: boolean;
  pointerId: number | null;
  lastX: number;
  lastY: number;
  dragYaw: number;
  dragPitch: number;
  hoverX: number;
  hoverY: number;
};

const palette = {
  ivory: 0xe9e0d1,
  pearl: 0xf4eee3,
  silver: 0xb8c1bd,
  silverDark: 0x687875,
  graphite: 0x1b2a2a,
  teal: 0x010c26,
  tealDark: 0x333c4e,
  copper: 0xb87552,
  glass: 0x17233b,
  glassHighlight: 0x91a5c4,
  tyre: 0x101817,
  shadow: 0x010c26,
};

const standard = (color: number, roughness = 0.3, metalness = 0.5) =>
  new THREE.MeshStandardMaterial({ color, roughness, metalness });

function createFuselage(): THREE.BufferGeometry {
  const rings = [
    { x: -3.82, ry: 0.02, rz: 0.02 },
    { x: -3.58, ry: 0.23, rz: 0.2 },
    { x: -2.95, ry: 0.48, rz: 0.42 },
    { x: -1.85, ry: 0.57, rz: 0.48 },
    { x: 0.2, ry: 0.59, rz: 0.5 },
    { x: 1.85, ry: 0.47, rz: 0.4 },
    { x: 2.85, ry: 0.31, rz: 0.28 },
    { x: 3.48, ry: 0.12, rz: 0.12 },
    { x: 3.72, ry: 0.035, rz: 0.035 },
  ];
  const segments = 28;
  const positions: number[] = [];
  const indices: number[] = [];

  rings.forEach((ring) => {
    for (let i = 0; i < segments; i += 1) {
      const angle = (i / segments) * Math.PI * 2;
      positions.push(ring.x, Math.cos(angle) * ring.ry, Math.sin(angle) * ring.rz);
    }
  });

  for (let ring = 0; ring < rings.length - 1; ring += 1) {
    for (let segment = 0; segment < segments; segment += 1) {
      const next = (segment + 1) % segments;
      const a = ring * segments + segment;
      const b = ring * segments + next;
      const c = (ring + 1) * segments + next;
      const d = (ring + 1) * segments + segment;
      indices.push(a, b, d, b, c, d);
    }
  }

  const startCenter = positions.length / 3;
  positions.push(rings[0].x, 0, 0);
  const endCenter = positions.length / 3;
  positions.push(rings[rings.length - 1].x, 0, 0);
  for (let segment = 0; segment < segments; segment += 1) {
    const next = (segment + 1) % segments;
    indices.push(startCenter, next, segment);
    const end = (rings.length - 1) * segments;
    indices.push(endCenter, end + segment, end + next);
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  return geometry;
}

function createExtrudedWing(points: Array<[number, number]>, depth = 0.1): THREE.ExtrudeGeometry {
  const shape = new THREE.Shape();
  points.forEach(([x, y], index) => {
    if (index === 0) shape.moveTo(x, y);
    else shape.lineTo(x, y);
  });
  shape.closePath();
  const geometry = new THREE.ExtrudeGeometry(shape, {
    depth,
    bevelEnabled: true,
    bevelSegments: 2,
    bevelSize: 0.025,
    bevelThickness: 0.025,
    curveSegments: 2,
  });
  geometry.translate(0, 0, -depth / 2);
  geometry.computeVertexNormals();
  return geometry;
}

function addAircraft(scene: THREE.Scene): THREE.Group {
  const group = new THREE.Group();
  group.name = "procedural-aircraft";

  const body = standard(palette.ivory, 0.24, 0.68);
  const pearl = standard(palette.pearl, 0.2, 0.52);
  const silver = standard(palette.silver, 0.22, 0.84);
  const darkSilver = standard(palette.silverDark, 0.28, 0.76);
  const teal = standard(palette.teal, 0.23, 0.65);
  const tealDark = standard(palette.tealDark, 0.25, 0.72);
  const copper = standard(palette.copper, 0.26, 0.68);
  const glass = new THREE.MeshPhysicalMaterial({
    color: palette.glass,
    roughness: 0.08,
    metalness: 0.58,
    clearcoat: 0.9,
    clearcoatRoughness: 0.08,
    transmission: 0.06,
  });
  const intake = standard(palette.graphite, 0.3, 0.55);

  const fuselage = new THREE.Mesh(createFuselage(), body);
  fuselage.castShadow = true;
  fuselage.receiveShadow = true;
  group.add(fuselage);

  const belly = new THREE.Mesh(new THREE.CylinderGeometry(0.43, 0.3, 2.55, 24), silver);
  belly.rotation.z = Math.PI / 2;
  belly.position.set(0.25, 0, -0.22);
  belly.scale.set(1, 0.68, 0.52);
  belly.castShadow = true;
  group.add(belly);

  const wingMaterial = silver;
  const rightWing = new THREE.Mesh(
    createExtrudedWing([
      [-1.05, 0.18],
      [0.48, 2.86],
      [1.37, 2.78],
      [1.62, 0.2],
    ]),
    wingMaterial,
  );
  const leftWing = rightWing.clone();
  leftWing.geometry = createExtrudedWing([
    [-1.05, -0.18],
    [0.48, -2.86],
    [1.37, -2.78],
    [1.62, -0.2],
  ]);
  [rightWing, leftWing].forEach((wing) => {
    wing.castShadow = true;
    wing.receiveShadow = true;
    group.add(wing);
  });

  const wingAccentRight = new THREE.Mesh(
    createExtrudedWing([
      [0.5, 1.15],
      [1.23, 2.72],
      [1.34, 2.7],
      [1.02, 1.13],
    ], 0.035),
    copper,
  );
  const wingAccentLeft = wingAccentRight.clone();
  wingAccentLeft.geometry = createExtrudedWing([
    [0.5, -1.15],
    [1.23, -2.72],
    [1.34, -2.7],
    [1.02, -1.13],
  ], 0.035);
  group.add(wingAccentRight, wingAccentLeft);

  const tailRight = new THREE.Mesh(
    createExtrudedWing([
      [1.84, 0.12],
      [2.67, 1.48],
      [3.13, 1.38],
      [3.05, 0.12],
    ], 0.08),
    pearl,
  );
  const tailLeft = tailRight.clone();
  tailLeft.geometry = createExtrudedWing([
    [1.84, -0.12],
    [2.67, -1.48],
    [3.13, -1.38],
    [3.05, -0.12],
  ], 0.08);
  group.add(tailRight, tailLeft);

  const verticalTailShape = new THREE.Shape();
  verticalTailShape.moveTo(1.92, 0.12);
  verticalTailShape.lineTo(2.72, 0.14);
  verticalTailShape.lineTo(3.02, 1.45);
  verticalTailShape.lineTo(2.48, 1.33);
  verticalTailShape.lineTo(2.04, 0.58);
  verticalTailShape.closePath();
  const verticalTail = new THREE.Mesh(
    new THREE.ExtrudeGeometry(verticalTailShape, {
      depth: 0.11,
      bevelEnabled: true,
      bevelSegments: 2,
      bevelSize: 0.025,
      bevelThickness: 0.018,
    }),
    tealDark,
  );
  verticalTail.rotation.x = Math.PI / 2;
  verticalTail.position.y = 0.055;
  verticalTail.castShadow = true;
  group.add(verticalTail);

  const tailStripe = new THREE.Mesh(new THREE.BoxGeometry(0.72, 0.05, 0.045), copper);
  tailStripe.position.set(2.48, 0, 0.76);
  tailStripe.rotation.y = -0.45;
  group.add(tailStripe);

  const canopy = new THREE.Mesh(new THREE.SphereGeometry(1, 28, 16), glass);
  canopy.position.set(-1.73, 0, 0.43);
  canopy.scale.set(1.13, 0.48, 0.34);
  canopy.castShadow = true;
  group.add(canopy);

  const canopySpine = new THREE.Mesh(new THREE.BoxGeometry(1.25, 0.035, 0.036), copper);
  canopySpine.position.set(-1.73, 0, 0.71);
  canopySpine.rotation.y = 0.03;
  group.add(canopySpine);

  const cockpitBand = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.82, 0.035), teal);
  cockpitBand.position.set(-1.82, 0, 0.67);
  cockpitBand.rotation.y = 0.03;
  group.add(cockpitBand);

  const fuselageSpine = new THREE.Mesh(new THREE.BoxGeometry(2.28, 0.048, 0.042), copper);
  fuselageSpine.position.set(0.34, 0, 0.53);
  group.add(fuselageSpine);

  const windowMaterial = new THREE.MeshPhysicalMaterial({
    color: palette.glassHighlight,
    roughness: 0.12,
    metalness: 0.6,
    clearcoat: 0.8,
    clearcoatRoughness: 0.1,
  });
  [-0.82, -0.38].forEach((x) => {
    const window = new THREE.Mesh(new THREE.SphereGeometry(0.16, 16, 10), windowMaterial);
    window.scale.set(0.38, 0.025, 0.18);
    window.position.set(x, 0.53, 0.22);
    window.rotation.x = -0.22;
    group.add(window);
  });

  const addEngine = (y: number) => {
    const nacelle = new THREE.Mesh(new THREE.CylinderGeometry(0.44, 0.51, 1.75, 32), tealDark);
    nacelle.rotation.z = Math.PI / 2;
    nacelle.position.set(0.33, y, -0.42);
    nacelle.castShadow = true;
    nacelle.receiveShadow = true;
    group.add(nacelle);

    const fairing = new THREE.Mesh(new THREE.SphereGeometry(1, 22, 12), silver);
    fairing.scale.set(0.86, 0.48, 0.48);
    fairing.position.set(-0.46, y, -0.42);
    fairing.castShadow = true;
    group.add(fairing);

    const intakeRing = new THREE.Mesh(new THREE.TorusGeometry(0.43, 0.07, 12, 32), copper);
    intakeRing.rotation.y = Math.PI / 2;
    intakeRing.position.set(-0.9, y, -0.42);
    group.add(intakeRing);

    const intakeDisc = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.35, 0.025, 32), intake);
    intakeDisc.rotation.z = Math.PI / 2;
    intakeDisc.position.set(-0.91, y, -0.42);
    group.add(intakeDisc);

    const exhaustRing = new THREE.Mesh(new THREE.TorusGeometry(0.38, 0.055, 12, 32), silver);
    exhaustRing.rotation.y = Math.PI / 2;
    exhaustRing.position.set(1.22, y, -0.42);
    group.add(exhaustRing);
  };
  addEngine(1.42);
  addEngine(-1.42);

  const wingRoot = new THREE.Mesh(new THREE.BoxGeometry(1.75, 0.12, 0.08), teal);
  wingRoot.position.set(0.06, 0, 0.02);
  group.add(wingRoot);

  group.scale.setScalar(1.02);
  group.rotation.y = 0.05;
  scene.add(group);
  return group;
}

function addTruckWheel(group: THREE.Group, x: number, y: number, wheelMaterial: THREE.Material, hubMaterial: THREE.Material) {
  const wheel = new THREE.Mesh(new THREE.CylinderGeometry(0.51, 0.51, 0.24, 28), wheelMaterial);
  wheel.rotation.x = Math.PI / 2;
  wheel.position.set(x, y, -0.43);
  wheel.castShadow = true;
  group.add(wheel);

  const hub = new THREE.Mesh(new THREE.CylinderGeometry(0.19, 0.19, 0.27, 20), hubMaterial);
  hub.rotation.x = Math.PI / 2;
  hub.position.set(x, y, -0.43);
  group.add(hub);
}

function addTruck(scene: THREE.Scene): THREE.Group {
  const group = new THREE.Group();
  group.name = "procedural-heavy-asset";
  const chassis = standard(palette.graphite, 0.34, 0.72);
  const body = standard(palette.ivory, 0.26, 0.62);
  const silver = standard(palette.silver, 0.22, 0.88);
  const teal = standard(0xf9a521, 0.25, 0.68);
  const copper = standard(palette.copper, 0.27, 0.64);
  const glass = new THREE.MeshPhysicalMaterial({
    color: palette.glass,
    roughness: 0.08,
    metalness: 0.62,
    clearcoat: 0.9,
    clearcoatRoughness: 0.08,
  });
  const tyre = standard(palette.tyre, 0.65, 0.08);

  const undercarriage = new THREE.Mesh(new THREE.BoxGeometry(4.9, 1.35, 0.28), chassis);
  undercarriage.position.set(0.05, 0, 0.02);
  undercarriage.castShadow = true;
  group.add(undercarriage);

  const cargo = new THREE.Mesh(new THREE.BoxGeometry(2.5, 1.55, 1.3), silver);
  cargo.position.set(1.18, 0, 0.78);
  cargo.castShadow = true;
  cargo.receiveShadow = true;
  group.add(cargo);

  const cargoTop = new THREE.Mesh(new THREE.BoxGeometry(2.62, 1.64, 0.12), teal);
  cargoTop.position.set(1.18, 0, 1.48);
  cargoTop.castShadow = true;
  group.add(cargoTop);

  const cab = new THREE.Mesh(new THREE.BoxGeometry(1.48, 1.42, 1.52), body);
  cab.position.set(-1.52, 0, 0.82);
  cab.castShadow = true;
  cab.receiveShadow = true;
  group.add(cab);

  const hood = new THREE.Mesh(new THREE.BoxGeometry(0.72, 1.34, 0.58), pearlMaterial());
  hood.position.set(-2.62, 0, 0.43);
  hood.castShadow = true;
  group.add(hood);

  const windshield = new THREE.Mesh(new THREE.BoxGeometry(0.05, 1.12, 0.58), glass);
  windshield.position.set(-2.275, 0, 1.13);
  windshield.rotation.y = -0.09;
  group.add(windshield);

  [-0.48, 0.48].forEach((y) => {
    const sideWindow = new THREE.Mesh(new THREE.BoxGeometry(0.68, 0.035, 0.52), glass);
    sideWindow.position.set(-1.52, y * 1.01, 1.16);
    group.add(sideWindow);
  });

  const grille = new THREE.Mesh(new THREE.BoxGeometry(0.055, 0.9, 0.34), teal);
  grille.position.set(-2.99, 0, 0.45);
  group.add(grille);
  [-0.3, 0, 0.3].forEach((y) => {
    const bar = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.05, 0.3), copper);
    bar.position.set(-3.03, y, 0.45);
    group.add(bar);
  });

  const sideAccent = new THREE.Mesh(new THREE.BoxGeometry(1.85, 0.04, 0.07), copper);
  sideAccent.position.set(-0.48, 0.73, 0.55);
  group.add(sideAccent);

  const bumper = new THREE.Mesh(new THREE.BoxGeometry(0.2, 1.5, 0.22), silver);
  bumper.position.set(-3.08, 0, 0.1);
  group.add(bumper);

  addTruckWheel(group, -1.95, 0.82, tyre, copper);
  addTruckWheel(group, -1.95, -0.82, tyre, copper);
  addTruckWheel(group, 1.35, 0.82, tyre, copper);
  addTruckWheel(group, 1.35, -0.82, tyre, copper);

  const beacon = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.13, 20), copper);
  beacon.position.set(-1.68, 0, 1.68);
  group.add(beacon);

  group.scale.setScalar(1.08);
  group.rotation.y = 0.03;
  scene.add(group);
  return group;
}

function pearlMaterial() {
  return standard(palette.pearl, 0.2, 0.58);
}

function disposeScene(scene: THREE.Scene) {
  scene.traverse((object) => {
    const mesh = object as THREE.Mesh;
    if (!mesh.isMesh) return;
    mesh.geometry.dispose();
    const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
    materials.forEach((material) => material.dispose());
  });
}

function FallbackSilhouette({ mode }: { mode: "aircraft" | "asset" }) {
  const plane = mode === "aircraft";
  return (
    <div
      aria-hidden="true"
      style={{
        position: "absolute",
        inset: 0,
        display: "grid",
        placeItems: "center",
        pointerEvents: "none",
      }}
    >
      {plane ? (
        <div style={{ position: "relative", width: "83%", height: "62%", transform: "rotate(-7deg)" }}>
          <span style={{ position: "absolute", left: "5%", top: "40%", width: "87%", height: "22%", borderRadius: "999px 38% 38% 999px", background: "linear-gradient(105deg, #eee5d5, #9aa9a4 72%, #277d79)", boxShadow: "0 10px 18px rgba(10,29,28,.24)" }} />
          <span style={{ position: "absolute", left: "29%", top: "11%", width: "34%", height: "72%", clipPath: "polygon(0 43%, 100% 0, 74% 100%, 38% 58%)", background: "#b87552" }} />
          <span style={{ position: "absolute", left: "31%", top: "20%", width: "25%", height: "21%", clipPath: "polygon(0 100%, 100% 0, 66% 100%)", background: "#173e45" }} />
          <span style={{ position: "absolute", left: "62%", top: "47%", width: "19%", height: "9%", borderRadius: "50%", background: "#173e45" }} />
          <span style={{ position: "absolute", left: "64%", top: "57%", width: "16%", height: "8%", borderRadius: "50%", background: "#173e45" }} />
        </div>
      ) : (
        <div style={{ position: "relative", width: "78%", height: "58%" }}>
          <span style={{ position: "absolute", left: "8%", top: "26%", width: "82%", height: "48%", borderRadius: "12px 18px 8px 8px", background: "linear-gradient(120deg, #eee5d5 0%, #aab4ae 65%, #277d79 66%)", boxShadow: "0 12px 18px rgba(10,29,28,.24)" }} />
          <span style={{ position: "absolute", left: "7%", top: "46%", width: "18%", height: "20%", background: "#b87552" }} />
          <span style={{ position: "absolute", left: "24%", top: "10%", width: "26%", height: "38%", borderRadius: "10px 10px 3px 3px", background: "#173e45" }} />
          <span style={{ position: "absolute", left: "25%", top: "11%", width: "7%", height: "34%", background: "#6eaaa5" }} />
          {["18%", "69%"].map((left) => (
            <span key={left} style={{ position: "absolute", left, bottom: "5%", width: "17%", aspectRatio: "1", borderRadius: "50%", background: "#101817", border: "5px solid #b87552" }} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function AircraftScene({ className, mode = "aircraft" }: AircraftSceneProps) {
  const hostRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [fallback, setFallback] = useState(false);
  const interactionRef = useRef<SceneInteraction>({
    dragging: false,
    pointerId: null,
    lastX: 0,
    lastY: 0,
    dragYaw: 0,
    dragPitch: 0,
    hoverX: 0,
    hoverY: 0,
  });

  useEffect(() => {
    const host = hostRef.current;
    const canvas = canvasRef.current;
    if (!host || !canvas) return;

    let renderer: THREE.WebGLRenderer;
    try {
      const probe = document.createElement("canvas");
      const context = probe.getContext("webgl2") ?? probe.getContext("webgl") ?? probe.getContext("experimental-webgl");
      if (!context) throw new Error("WebGL is unavailable");
      renderer = new THREE.WebGLRenderer({
        canvas,
        alpha: true,
        antialias: true,
        powerPreference: "high-performance",
      });
    } catch {
      setFallback(true);
      return;
    }

    setFallback(false);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.8));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.08;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(28, 1, 0.1, 100);
    const model = mode === "asset" ? addTruck(scene) : addAircraft(scene);

    const hemisphere = new THREE.HemisphereLight(0xfff2df, 0x102c2c, 2.15);
    scene.add(hemisphere);
    const key = new THREE.DirectionalLight(0xffe1c6, 4.4);
    key.position.set(-5, 7, 9);
    key.castShadow = true;
    key.shadow.mapSize.set(1024, 1024);
    key.shadow.camera.near = 1;
    key.shadow.camera.far = 28;
    scene.add(key);
    const rim = new THREE.DirectionalLight(0x70c8c0, 2.5);
    rim.position.set(7, -3, 5);
    scene.add(rim);
    const fill = new THREE.PointLight(0xffb58b, 1.5, 14);
    fill.position.set(-4, 1, 3);
    scene.add(fill);

    const shadow = new THREE.Mesh(
      new THREE.CircleGeometry(mode === "asset" ? 3.5 : 3.75, 64),
      new THREE.MeshBasicMaterial({ color: palette.shadow, transparent: true, opacity: 0.16, depthWrite: false }),
    );
    shadow.rotation.x = -Math.PI / 2;
    shadow.position.y = -1.02;
    shadow.scale.set(1.25, 0.42, 1);
    scene.add(shadow);

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const interaction = interactionRef.current;
    let visible = true;
    let frameId: number | null = null;
    let startedAt = performance.now();

    const resize = () => {
      const { width, height } = host.getBoundingClientRect();
      if (width <= 0 || height <= 0) return;
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.position.set(mode === "asset" ? -8.2 : -8.6, mode === "asset" ? 4.8 : 5.5, mode === "asset" ? 8.6 : 8.4);
      camera.lookAt(0, 0.12, 0.05);
      camera.updateProjectionMatrix();
    };

    const renderFrame = (now: number) => {
      frameId = null;
      if (!visible) return;
      const elapsed = (now - startedAt) / 1000;
      const hoverEase = 0.075;
      const targetYaw = interaction.dragYaw + interaction.hoverX * 0.16;
      const targetPitch = interaction.dragPitch + interaction.hoverY * 0.1;
      model.rotation.y += (elapsed * (reducedMotion ? 0 : 0.035) + targetYaw - model.rotation.y) * 0.075;
      model.rotation.x += (targetPitch - model.rotation.x) * hoverEase;
      const float = reducedMotion ? 0 : Math.sin(elapsed * 0.9) * 0.075;
      model.position.y += (float - model.position.y) * 0.08;
      shadow.scale.y = 0.42 - Math.abs(model.position.y) * 0.16;
      renderer.render(scene, camera);
      frameId = window.requestAnimationFrame(renderFrame);
    };

    const start = () => {
      if (frameId === null && visible) {
        startedAt = performance.now();
        frameId = window.requestAnimationFrame(renderFrame);
      }
    };
    const stop = () => {
      if (frameId !== null) {
        window.cancelAnimationFrame(frameId);
        frameId = null;
      }
    };
    const updateVisibility = () => {
      visible = document.visibilityState !== "hidden";
      if (visible) start();
      else stop();
    };

    const onPointerMove = (event: PointerEvent) => {
      const bounds = host.getBoundingClientRect();
      const nx = ((event.clientX - bounds.left) / bounds.width) * 2 - 1;
      const ny = ((event.clientY - bounds.top) / bounds.height) * 2 - 1;
      interaction.hoverX = THREE.MathUtils.clamp(nx, -1, 1);
      interaction.hoverY = THREE.MathUtils.clamp(ny, -1, 1);
      if (!interaction.dragging) return;
      const dx = event.clientX - interaction.lastX;
      const dy = event.clientY - interaction.lastY;
      interaction.dragYaw += dx * 0.006;
      interaction.dragPitch = THREE.MathUtils.clamp(interaction.dragPitch + dy * 0.004, -0.32, 0.32);
      interaction.lastX = event.clientX;
      interaction.lastY = event.clientY;
    };
    const onPointerDown = (event: PointerEvent) => {
      interaction.dragging = true;
      interaction.pointerId = event.pointerId;
      interaction.lastX = event.clientX;
      interaction.lastY = event.clientY;
      host.setPointerCapture?.(event.pointerId);
    };
    const onPointerUp = (event: PointerEvent) => {
      if (interaction.pointerId !== null && host.hasPointerCapture?.(interaction.pointerId)) host.releasePointerCapture(interaction.pointerId);
      interaction.dragging = false;
      interaction.pointerId = null;
      if (event.type === "pointerleave") {
        interaction.hoverX = 0;
        interaction.hoverY = 0;
      }
    };
    const onPointerLeave = (event: PointerEvent) => onPointerUp(event);

    const resizeObserver = typeof ResizeObserver !== "undefined" ? new ResizeObserver(resize) : null;
    resizeObserver?.observe(host);
    document.addEventListener("visibilitychange", updateVisibility);
    host.addEventListener("pointermove", onPointerMove);
    host.addEventListener("pointerdown", onPointerDown);
    host.addEventListener("pointerup", onPointerUp);
    host.addEventListener("pointercancel", onPointerUp);
    host.addEventListener("pointerleave", onPointerLeave);

    const intersectionObserver = typeof IntersectionObserver !== "undefined" ? new IntersectionObserver((entries) => {
      visible = entries[0]?.isIntersecting ?? true;
      if (visible && document.visibilityState !== "hidden") start();
      else stop();
    }, { threshold: 0.01 }) : null;
    intersectionObserver?.observe(host);

    resize();
    start();

    return () => {
      stop();
      resizeObserver?.disconnect();
      intersectionObserver?.disconnect();
      document.removeEventListener("visibilitychange", updateVisibility);
      host.removeEventListener("pointermove", onPointerMove);
      host.removeEventListener("pointerdown", onPointerDown);
      host.removeEventListener("pointerup", onPointerUp);
      host.removeEventListener("pointercancel", onPointerUp);
      host.removeEventListener("pointerleave", onPointerLeave);
      disposeScene(scene);
      renderer.dispose();
      renderer.forceContextLoss();
    };
  }, [mode]);

  return (
    <div
      ref={hostRef}
      className={className ? `aircraft-scene ${className}` : "aircraft-scene"}
      data-mode={mode}
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        minHeight: 180,
        overflow: "hidden",
        touchAction: "none",
        userSelect: "none",
        WebkitUserSelect: "none",
        cursor: fallback ? "default" : "grab",
      }}
      aria-label={mode === "asset" ? "Interactive 3D heavy asset preview" : "Interactive 3D aircraft preview"}
    >
      <canvas ref={canvasRef} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", display: fallback ? "none" : "block" }} />
      {fallback ? <FallbackSilhouette mode={mode} /> : null}
    </div>
  );
}
