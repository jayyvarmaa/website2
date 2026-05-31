(function () {
  // Disable completely on mobile to save performance and prevent overlaps
  if (window.innerWidth <= 768) return;

  // 1. Scene, Camera, Renderer Setup
  const canvas = document.getElementById('lanyard-canvas');
  if (!canvas) return;

  const container = canvas.parentElement;
  const renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(container.clientWidth, container.clientHeight);
  renderer.outputEncoding = THREE.sRGBEncoding;

  const camera = new THREE.PerspectiveCamera(20, container.clientWidth / container.clientHeight, 0.1, 1000);
  camera.position.set(0, 0, 20);

  const scene = new THREE.Scene();

  // 2. Lighting & Environment Configuration
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.75); // Lower ambient to let reflections pop
  scene.add(ambientLight);

  const dirLight1 = new THREE.DirectionalLight(0xffffff, 1);
  dirLight1.position.set(0, -1, 5);
  scene.add(dirLight1);


  // Generate a custom cube environment map to act as "Lightformers" for realistic metallic reflections
  function createEnvironmentMap(renderer) {
    const envScene = new THREE.Scene();
    envScene.background = new THREE.Color(0x0a0a0a); // Dark background matches site styling

    const geom = new THREE.PlaneGeometry(100, 2);
    const mat = new THREE.MeshBasicMaterial({ color: 0xffffff, side: THREE.DoubleSide });

    // Panel 1
    const p1 = new THREE.Mesh(geom, mat);
    p1.position.set(0, -1, 5);
    p1.rotation.set(0, 0, Math.PI / 3);
    p1.scale.set(1, 0.1, 1);
    envScene.add(p1);

    // Panel 2
    const p2 = new THREE.Mesh(geom, mat);
    p2.position.set(-1, -1, 1);
    p2.rotation.set(0, 0, Math.PI / 3);
    p2.scale.set(1, 0.1, 1);
    envScene.add(p2);

    // Panel 3
    const p3 = new THREE.Mesh(geom, mat);
    p3.position.set(1, 1, 1);
    p3.rotation.set(0, 0, Math.PI / 3);
    p3.scale.set(1, 0.1, 1);
    envScene.add(p3);

    // Panel 4 (Side key light)
    const geomWide = new THREE.PlaneGeometry(100, 10);
    const p4 = new THREE.Mesh(geomWide, mat);
    p4.position.set(-10, 0, 14);
    p4.rotation.set(0, Math.PI / 2, Math.PI / 3);
    p4.scale.set(1, 1, 1);
    envScene.add(p4);

    const cubeRenderTarget = new THREE.WebGLCubeRenderTarget(256, {
      generateMipmaps: true,
      minFilter: THREE.LinearMipmapLinearFilter
    });
    const cubeCamera = new THREE.CubeCamera(0.1, 100, cubeRenderTarget);
    cubeCamera.update(renderer, envScene);

    return cubeRenderTarget.texture;
  }

  scene.environment = createEnvironmentMap(renderer);

  // 3. Physics Simulation Setup (Verlet Integration)
  const numRopePoints = 4;
  const points = [];
  const constraints = [];

  const startX = window.innerWidth < 768 ? 0 : 3.5;
  const startY = 4.5;

  // Initialize rope nodes (fixed, j1, j2, pA)
  points.push({
    pos: new THREE.Vector3(startX, startY, 0),
    prev: new THREE.Vector3(startX, startY, 0),
    fixed: true,
    mass: 1.0
  });

  points.push({
    pos: new THREE.Vector3(startX + 0.5, startY - 0.5, 0),
    prev: new THREE.Vector3(startX + 0.5, startY - 0.5, 0),
    lerped: new THREE.Vector3(startX + 0.5, startY - 0.5, 0),
    fixed: false,
    mass: 1.0
  });

  points.push({
    pos: new THREE.Vector3(startX + 1.0, startY - 1.0, 0),
    prev: new THREE.Vector3(startX + 1.0, startY - 1.0, 0),
    lerped: new THREE.Vector3(startX + 1.0, startY - 1.0, 0),
    fixed: false,
    mass: 1.0
  });

  // idxA is the attachment point (pA), which is also the 4th rope point
  const idxA = 3;
  const idxB = 4;
  const idxC = 5;

  const posA = new THREE.Vector3(startX + 1.5, startY - 1.5, 0);
  points.push({
    pos: posA,
    prev: posA.clone(),
    fixed: false,
    mass: 2.5
  });

  // Bottom-left and bottom-right card nodes (Symmetric Triangle A-B-C)
  const posB = posA.clone().add(new THREE.Vector3(-0.8, -2.625, 0));
  const posC = posA.clone().add(new THREE.Vector3(0.8, -2.625, 0));

  points.push({ pos: posB, prev: posB.clone(), fixed: false, mass: 2.5 });
  points.push({ pos: posC, prev: posC.clone(), fixed: false, mass: 2.5 });

  // Add rope segment constraints (each length = 1.0)
  const segmentLength = 1.0;
  for (let i = 0; i < numRopePoints - 1; i++) {
    constraints.push({ p1: i, p2: i + 1, length: segmentLength });
  }

  // Add rigid card triangle constraints (A-B-C)
  const lenAB = Math.sqrt(0.8 * 0.8 + 2.625 * 2.625); // ~2.7442
  const lenAC = lenAB;
  const lenBC = 1.6;

  constraints.push({ p1: idxA, p2: idxB, length: lenAB });
  constraints.push({ p1: idxA, p2: idxC, length: lenAC });
  constraints.push({ p1: idxB, p2: idxC, length: lenBC });

  // 4. Ribbon Geometry setup (Lanyard band)
  const ribbonSegments = 32;
  const ribbonGeo = new THREE.BufferGeometry();
  const positionsArray = new Float32Array((ribbonSegments + 1) * 2 * 3);
  const uvsArray = new Float32Array((ribbonSegments + 1) * 2 * 2);
  const indicesArray = [];

  for (let i = 0; i < ribbonSegments; i++) {
    indicesArray.push(i * 2, i * 2 + 1, (i + 1) * 2);
    indicesArray.push(i * 2 + 1, (i + 1) * 2 + 1, (i + 1) * 2);
  }

  ribbonGeo.setAttribute('position', new THREE.BufferAttribute(positionsArray, 3));
  ribbonGeo.setAttribute('uv', new THREE.BufferAttribute(uvsArray, 2));
  ribbonGeo.setIndex(indicesArray);

  // Setup ribbon UVs
  const repeatX = 4; // texture tiling along the ribbon length
  for (let i = 0; i <= ribbonSegments; i++) {
    const t = i / ribbonSegments;
    const u = -t * repeatX;

    // Left edge UV
    uvsArray[i * 4] = u;
    uvsArray[i * 4 + 1] = 0;

    // Right edge UV
    uvsArray[i * 4 + 2] = u;
    uvsArray[i * 4 + 3] = 1;
  }
  ribbonGeo.attributes.uv.needsUpdate = true;

  // Load Lanyard texture
  const textureLoader = new THREE.TextureLoader();
  const lanyardTexture = textureLoader.load('/assets/lanyard/lanyard.png?v=2');
  lanyardTexture.wrapS = THREE.RepeatWrapping;
  lanyardTexture.wrapT = THREE.RepeatWrapping;
  lanyardTexture.encoding = THREE.sRGBEncoding;

  const ribbonMat = new THREE.MeshStandardMaterial({
    map: lanyardTexture,
    side: THREE.DoubleSide,
    transparent: true,
    roughness: 0.7,
    metalness: 0.1,
    alphaTest: 0.1
  });

  const ribbonMesh = new THREE.Mesh(ribbonGeo, ribbonMat);
  scene.add(ribbonMesh);

  // 5. 3D Card Loading & Transformation Group
  const cardGroup = new THREE.Group();
  let cardLoaded = false;

window.lanyardCardLoaded = new Promise(resolve => window.resolveLanyardCard = resolve);

  const gltfLoader = THREE.GLTFLoader ? new THREE.GLTFLoader() : new GLTFLoader();
  gltfLoader.load('/assets/lanyard/card.glb?v=2', (gltf) => {
    if (window.resolveLanyardCard) window.resolveLanyardCard();
    const model = gltf.scene;

    model.traverse((child) => {
      if (child.isMesh) {
        if (child.name === 'card') {
          const mat = child.material;
          mat.roughness = 0.9;
          mat.metalness = 0.8;
          mat.clearcoat = 1.0;
          mat.clearcoatRoughness = 0.15;
          if (mat.map) {
            mat.map.anisotropy = 16;
          }
        } else if (child.name === 'clip' || child.name === 'clamp') {
          const mat = child.material;
          mat.roughness = 0.3;
          mat.metalness = 1.0;
        }
      }
    });

    // Match React Bits scale & position offsets
    model.scale.setScalar(2.25);
    model.position.set(0.225, -2.7, -0.05);

    cardGroup.add(model);
    scene.add(cardGroup);
    cardLoaded = true;
  });

  // 6. Physics Simulation Loop
  const gravity = new THREE.Vector3(0, -40, 0);
  const damping = 0.985;

  function updatePhysics(dt) {
    // 1. Verlet step
    for (let i = 0; i < points.length; i++) {
      const p = points[i];
      if (p.fixed) continue;
      if (dragged && (i === idxA || i === idxB || i === idxC)) continue;

      const temp = p.pos.clone();
      const vel = p.pos.clone().sub(p.prev).multiplyScalar(damping);
      p.pos.add(vel).addScaledVector(gravity, dt * dt);
      p.prev.copy(temp);
    }

    // Stabilizing torque / restoring force pulling the card bottom points back to the plane of A
    if (!dragged) {
      const restoringStrength = 8.0;
      const zDamp = 0.90; // Add extra damping on Z axis to prevent flutter

      // Pull points B and C towards the Z coordinate of A
      const targetZ = points[idxA].pos.z;

      // Node B
      let valB = points[idxB].pos.z;
      valB += (targetZ - valB) * restoringStrength * dt;
      points[idxB].pos.z = points[idxB].prev.z + (valB - points[idxB].prev.z) * zDamp;

      // Node C
      let valC = points[idxC].pos.z;
      valC += (targetZ - valC) * restoringStrength * dt;
      points[idxC].pos.z = points[idxC].prev.z + (valC - points[idxC].prev.z) * zDamp;

      // Extra Z damping on the attachment point to prevent long oscillation
      points[idxA].pos.z = points[idxA].prev.z + (points[idxA].pos.z - points[idxA].prev.z) * 0.95;
    }

    // 2. Solve constraints (15 iterations for stiffness)
    const iterations = 15;
    for (let iter = 0; iter < iterations; iter++) {
      for (let i = 0; i < constraints.length; i++) {
        const c = constraints[i];
        const p1 = points[c.p1];
        const p2 = points[c.p2];

        const delta = p2.pos.clone().sub(p1.pos);
        const len = delta.length();
        if (len === 0) continue;

        const diff = c.length - len;
        const percent = diff / len / 2;
        const offset = delta.multiplyScalar(percent);

        if (!p1.fixed && !(dragged && (c.p1 === idxA || c.p1 === idxB || c.p1 === idxC))) {
          p1.pos.sub(offset);
        }
        if (!p2.fixed && !(dragged && (c.p2 === idxA || c.p2 === idxB || c.p2 === idxC))) {
          p2.pos.add(offset);
        }
      }

      // Keep fixed point at the hook
      points[0].pos.set(startX, startY, 0);
    }
  }

  // 7. Update Mesh Positions & Matrices
  const curvePoints = [
    new THREE.Vector3(),
    new THREE.Vector3(),
    new THREE.Vector3(),
    new THREE.Vector3()
  ];

  const curve = new THREE.CatmullRomCurve3(curvePoints);
  curve.curveType = 'chordal';

  const vX = new THREE.Vector3();
  const vY = new THREE.Vector3();
  const vZ = new THREE.Vector3();
  const rotationMatrix = new THREE.Matrix4();

  function updateRibbon() {
    // Re-populate curve points with current physical (or lerped) positions
    curvePoints[0].copy(points[0].pos);
    curvePoints[1].copy(points[1].lerped);
    curvePoints[2].copy(points[2].lerped);
    curvePoints[3].copy(points[idxA].pos);

    // Force recalculation of cached arc lengths for dynamic deformation
    curve.updateArcLengths();

    // Get smooth interpolated path
    const interpolated = curve.getPoints(ribbonSegments);

    // Compute ribbon strip vertices
    const width = 0.12;
    for (let i = 0; i <= ribbonSegments; i++) {
      const p_i = interpolated[i];

      // Calculate tangent
      const next = interpolated[i + 1] || p_i;
      const prev = interpolated[i - 1] || p_i;
      const tangent = next.clone().sub(prev).normalize();

      // View direction vector (camera to point)
      const toCam = camera.position.clone().sub(p_i).normalize();

      // Sidebar perpendicular vector
      const side = new THREE.Vector3().crossVectors(tangent, toCam).normalize();

      const left = p_i.clone().addScaledVector(side, -width / 2);
      const right = p_i.clone().addScaledVector(side, width / 2);

      positionsArray[i * 6] = left.x;
      positionsArray[i * 6 + 1] = left.y;
      positionsArray[i * 6 + 2] = left.z;

      positionsArray[i * 6 + 3] = right.x;
      positionsArray[i * 6 + 4] = right.y;
      positionsArray[i * 6 + 5] = right.z;
    }

    ribbonGeo.attributes.position.needsUpdate = true;
    ribbonGeo.computeVertexNormals();
  }

  function updateCardTransform() {
    if (!cardLoaded) return;

    const pA = points[idxA].pos;
    const pB = points[idxB].pos;
    const pC = points[idxC].pos;

    // Upwards vertical axis Y: from bottom midpoint to attachment A
    const pMid = new THREE.Vector3().addVectors(pB, pC).multiplyScalar(0.5);
    vY.subVectors(pA, pMid).normalize();

    // Outward Z normal axis: cross of Y and horizontal vector (C - B)
    const vXTemp = new THREE.Vector3().subVectors(pC, pB);
    vZ.crossVectors(vXTemp, vY).normalize();

    // Orthogonal basis X: cross of Y and Z
    vX.crossVectors(vY, vZ).normalize();

    // Orthonormal basis rotation
    rotationMatrix.makeBasis(vX, vY, vZ);

    cardGroup.position.copy(pA);
    cardGroup.quaternion.setFromRotationMatrix(rotationMatrix);
  }

  // 8. Interaction Setup (Pointer Events)
  const raycaster = new THREE.Raycaster();
  const mouse = new THREE.Vector2();
  let dragged = false;

  const dragOffsets = {
    A: new THREE.Vector3(),
    B: new THREE.Vector3(),
    C: new THREE.Vector3()
  };

  const targetA = new THREE.Vector3();
  const planeZ = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);

  function getMousePos(e) {
    const rect = renderer.domElement.getBoundingClientRect();
    mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
  }

  function onPointerDown(e) {
    getMousePos(e);
    raycaster.setFromCamera(mouse, camera);

    if (cardLoaded) {
      const intersects = raycaster.intersectObject(cardGroup, true);
      if (intersects.length > 0) {
        dragged = true;
        canvas.style.pointerEvents = 'auto';
        canvas.style.cursor = 'grabbing';

        const hitPoint = intersects[0].point;

        // Calculate offsets relative to hitpoint
        dragOffsets.A.copy(points[idxA].pos).sub(hitPoint);
        dragOffsets.B.copy(points[idxB].pos).sub(hitPoint);
        dragOffsets.C.copy(points[idxC].pos).sub(hitPoint);

        // Wake up points
        for (let i = 0; i < points.length; i++) {
          points[i].prev.copy(points[i].pos);
        }

        if (e.cancelable) {
          e.preventDefault();
        }
      }
    }
  }

  function onPointerMove(e) {
    getMousePos(e);
    raycaster.setFromCamera(mouse, camera);

    if (dragged) {
      const intersection = new THREE.Vector3();
      raycaster.ray.intersectPlane(planeZ, intersection);

      // Translate symmetric points
      const nextA = intersection.clone().add(dragOffsets.A);
      const diff = nextA.clone().sub(points[idxA].pos);

      points[idxA].pos.copy(nextA);
      points[idxB].pos.add(diff);
      points[idxC].pos.add(diff);

      // Nullify velocities during drag
      points[idxA].prev.copy(points[idxA].pos);
      points[idxB].prev.copy(points[idxB].pos);
      points[idxC].prev.copy(points[idxC].pos);

      // Wake up the rope nodes too
      for (let i = 1; i < idxA; i++) {
        points[i].prev.lerp(points[i].pos, 0.5);
      }

      if (e.cancelable) {
        e.preventDefault();
      }
    } else {
      // Hover hand cursor on card intersection
      if (cardLoaded) {
        const intersects = raycaster.intersectObject(cardGroup, true);
        if (intersects.length > 0) {
          canvas.style.cursor = 'grab';
          canvas.style.pointerEvents = 'auto';
        } else {
          canvas.style.cursor = 'auto';
          canvas.style.pointerEvents = 'none';
        }
      }
    }
  }

  function onPointerUp() {
    if (dragged) {
      dragged = false;
      canvas.style.cursor = 'auto';
      canvas.style.pointerEvents = 'none';
    }
  }

  window.addEventListener('pointerdown', onPointerDown);
  window.addEventListener('pointermove', onPointerMove);
  window.addEventListener('pointerup', onPointerUp);

  window.addEventListener('touchstart', (e) => {
    if (e.touches.length === 1) {
      onPointerDown(e.touches[0]);
    }
  }, { passive: false });

  window.addEventListener('touchmove', (e) => {
    if (dragged && e.touches.length === 1) {
      onPointerMove(e.touches[0]);
    }
  }, { passive: false });

  window.addEventListener('touchend', onPointerUp, { passive: true });

  // 9. Resize Handler
  window.addEventListener('resize', () => {
    const width = container.clientWidth;
    const height = container.clientHeight;
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
  });

  // 10. Frame Loop Setup (120Hz fixed physics step)
  let lastTime = 0;
  let accumulator = 0;
  const fixedTimeStep = 1 / 120;

  function animate(time) {
    requestAnimationFrame(animate);

    if (!lastTime) {
      lastTime = time;
      return;
    }

    const dt = (time - lastTime) / 1000;
    lastTime = time;

    accumulator += dt;
    while (accumulator >= fixedTimeStep) {
      updatePhysics(fixedTimeStep);
      accumulator -= fixedTimeStep;
    }

    // Update lerped positions for j1 and j2 (points 1 and 2) to simulate ribbon drag/elasticity
    const minSpeed = 0;
    const maxSpeed = 50;
    [points[1], points[2]].forEach(p => {
      const dist = p.lerped.distanceTo(p.pos);
      const clampedDistance = Math.max(0.1, Math.min(1.0, dist));
      const lerpRate = Math.min(1.0, dt * (minSpeed + clampedDistance * (maxSpeed - minSpeed)));
      p.lerped.lerp(p.pos, lerpRate);
    });

    updateRibbon();
    updateCardTransform();

    renderer.render(scene, camera);
  }

  requestAnimationFrame(animate);
})();
