import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import { createAutoOrbit } from '../three/autoOrbit'
import type { AirflowOptions } from '../three/airflowPaths'

export default function Airflow3D({ options, onError }: { options: AirflowOptions; onError: () => void }) {
  const { t } = useTranslation()
  const host = useRef<HTMLDivElement>(null)
  const state = useRef(options)
  const wakeRef = useRef<() => void>()
  const errorRef = useRef(onError)
  const [ready, setReady] = useState(false)
  state.current = options; errorRef.current = onError
  useEffect(() => {
    const element = host.current
    if (!element) return
    let renderer: THREE.WebGLRenderer
    try { renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'high-performance' }) } catch { errorRef.current(); return }
    renderer.setPixelRatio(Math.min(devicePixelRatio, innerWidth < 700 ? 1.5 : 2))
    renderer.outputColorSpace = THREE.SRGBColorSpace
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.toneMappingExposure = 1.05
    renderer.setClearColor(0, 0)
    renderer.domElement.setAttribute('aria-hidden', 'true')
    element.appendChild(renderer.domElement)
    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(35, 1, .1, 50)
    const controls = new OrbitControls(camera, renderer.domElement)
    controls.target.set(0, 1.08, 0)
    controls.enableDamping = true; controls.dampingFactor = .09
    controls.enablePan = false; controls.enableZoom = false
    controls.minDistance = 4.8; controls.maxDistance = 14
    controls.minPolarAngle = .25; controls.maxPolarAngle = Math.PI * .54
    const wheel = (event: WheelEvent) => { controls.enableZoom = event.ctrlKey || event.metaKey }
    const pointer = (event: PointerEvent) => { if (event.pointerType === 'touch') controls.enableZoom = true }
    renderer.domElement.addEventListener('wheel', wheel, { capture: true, passive: true })
    renderer.domElement.addEventListener('pointerdown', pointer, { capture: true })
    const orbit = createAutoOrbit(controls, { speed: 4, resumeDelay: 3, onRelease: () => wake() })
    scene.add(new THREE.HemisphereLight(0xd8f5ff, 0x142e41, 2))
    const key = new THREE.DirectionalLight(0xffffff, 3.3); key.position.set(1, 6, 5); scene.add(key)
    const rim = new THREE.DirectionalLight(0x55c6ff, 3); rim.position.set(-3, 3, -3); scene.add(rim)
    const solid = new THREE.MeshStandardMaterial({ color: 0x395c70, roughness: .4, metalness: .4 })
    const alloy = new THREE.MeshStandardMaterial({ color: 0xb4d7e6, roughness: .3, metalness: .55 })
    const glass = new THREE.MeshPhysicalMaterial({ color: 0x66a8c5, transparent: true, opacity: .045, roughness: .25, depthWrite: false, side: THREE.DoubleSide })
    const edgeMat = new THREE.LineBasicMaterial({ color: 0x6fadc6, transparent: true, opacity: .28 })
    function box(width: number, height: number, depth: number, x: number, y: number, z: number, material: THREE.Material, edges = false) {
      const geometry = new THREE.BoxGeometry(width, height, depth)
      const mesh = new THREE.Mesh(geometry, material); mesh.position.set(x, y, z); scene.add(mesh)
      if (edges) { const edge = new THREE.LineSegments(new THREE.EdgesGeometry(geometry), edgeMat); edge.position.copy(mesh.position); scene.add(edge) }
      return mesh
    }
    box(4.65, .12, 2.5, 0, -.09, 0, solid, true)
    box(4.65, 2.1, .04, 0, 1.03, -1.23, glass, true)
    box(.04, 2.1, 2.5, -2.31, 1.03, 0, glass, true)
    box(.04, 2.1, 2.5, 2.31, 1.03, 0, glass, true)
    // The front is intentionally open: a section through the sketched circulation loop.
    const floorGrid = new THREE.GridHelper(4.5, 18, 0x326174, 0x244759); floorGrid.scale.z = .52; floorGrid.position.y = -.025; scene.add(floorGrid)
    box(1.9, .12, 1.38, 0, 1.85, 0, alloy)
    // Open dry-ice chamber above the exchanger. No gas flows through its wall.
    box(1.9, .36, .07, 0, 2.08, -.655, alloy)
    box(1.9, .36, .07, 0, 2.08, .655, alloy)
    box(.07, .36, 1.38, -.915, 2.08, 0, alloy)
    box(.07, .36, 1.38, .915, 2.08, 0, alloy)
    const iceMat = new THREE.MeshStandardMaterial({ color: 0xbcecff, roughness: .48, emissive: 0x2c738e, emissiveIntensity: .28 })
    for (let index = 0; index < 8; index++) {
      const ice = box(.34, .2, .36, (index % 4 - 1.5) * .4, 2.01 + (index % 3) * .02, index < 4 ? -.29 : .22, iceMat)
      ice.rotation.y = index * .28
    }
    // Thin fins run across the lateral flow, leaving channels between them.
    box(1.95, .06, 1.45, 0, 1.8, 0, alloy)
    for (let index = 0; index < 15; index++) box(1.9, .26, .035, 0, 1.64, (index - 7) * .095, alloy)
    const fanMaterial = new THREE.MeshStandardMaterial({ color: 0x162d3d, metalness: .25, roughness: .55 })
    const bladeMaterial = new THREE.MeshStandardMaterial({ color: 0x75a2b8, metalness: .45, roughness: .4 })
    const rotors: THREE.Group[] = []
    let singleRotor: THREE.Group | undefined
    const dualFanParts: THREE.Object3D[] = []
    const sideGroups = new Map<number, THREE.Group>()
    for (const side of [-1, 1]) {
      const group = new THREE.Group()
      group.userData.side = side
      sideGroups.set(side, group)
      scene.add(group)
    }
    for (const x of [-.51, .51]) {
      const sideGroup = sideGroups.get(x < 0 ? -1 : 1)!
      // A ring frame is stationary; only its own rotor spins around the intake axis.
      const ring = new THREE.Mesh(new THREE.TorusGeometry(.4, .067, 8, 40), fanMaterial)
      ring.rotation.x = Math.PI / 2; ring.position.set(x, 1.35, 0); sideGroup.add(ring); dualFanParts.push(ring)
      const rotor = new THREE.Group(); rotor.position.set(x, 1.35, 0); sideGroup.add(rotor); dualFanParts.push(rotor); rotors.push(rotor)
      const hub = new THREE.Mesh(new THREE.CylinderGeometry(.105, .105, .12, 20), alloy); rotor.add(hub)
      for (let j = 0; j < 7; j++) {
        const blade = new THREE.Mesh(new THREE.BoxGeometry(.27, .027, .125), bladeMaterial)
        const angle = j * Math.PI * 2 / 7
        blade.position.set(Math.cos(angle) * .23, 0, Math.sin(angle) * .23)
        blade.rotation.set(.12, -angle + .45, .05); rotor.add(blade)
      }
    }
    // Single-fan mode uses the same central intake position as the physical concept.
    // The two complete air loops remain visible; only the fan hardware changes.
    {
      const group = new THREE.Group()
      group.position.set(0, 1.35, 0)
      scene.add(group)
      const ring = new THREE.Mesh(new THREE.TorusGeometry(.4, .067, 8, 40), fanMaterial)
      ring.rotation.x = Math.PI / 2; group.add(ring)
      singleRotor = new THREE.Group(); group.add(singleRotor); rotors.push(singleRotor)
      const hub = new THREE.Mesh(new THREE.CylinderGeometry(.105, .105, .12, 20), alloy); singleRotor.add(hub)
      for (let j = 0; j < 7; j++) {
        const blade = new THREE.Mesh(new THREE.BoxGeometry(.27, .027, .125), bladeMaterial)
        const angle = j * Math.PI * 2 / 7
        blade.position.set(Math.cos(angle) * .23, 0, Math.sin(angle) * .23)
        blade.rotation.set(.12, -angle + .45, .05); singleRotor.add(blade)
      }
      group.userData.singleFan = true
    }
    const cold = new THREE.Color('#64d5ff'), warm = new THREE.Color('#ffaa70')
    const guideMaterials: { material: THREE.MeshBasicMaterial; kind: 'cold' | 'warm'; base: number }[] = []
    const trails: { positions: THREE.Vector3[]; singlePositions: THREE.Vector3[]; colors: THREE.Color[]; offset: number; side: number }[] = []
    const particleCountPerLoop = 22
    // Six section planes add depth; each left/right loop has a continuous supply + return path.
    for (const side of [-1, 1]) for (let lane = 0; lane < 6; lane++) {
      const sideGroup = sideGroups.get(side)!
      const loopGroup = new THREE.Group()
      sideGroup.add(loopGroup)
      const z = (lane - 2.5) * .28
      const vec = (x: number, y: number) => new THREE.Vector3(x * side, y, z)
      const coldCurve = new THREE.CatmullRomCurve3([vec(.33, 1.65), vec(1.12, 1.66), vec(1.91, 1.44), vec(2.02, .8), vec(1.84, .22), vec(.92, .17)], false, 'catmullrom', .35)
      const warmCurve = new THREE.CatmullRomCurve3([vec(.92, .17), vec(.65, .36), vec(.52, .81), vec(.51, 1.3), vec(.33, 1.65)], false, 'catmullrom', .35)
      const singleWarmCurve = new THREE.CatmullRomCurve3([vec(.92, .17), vec(.48, .36), vec(.12, .81), vec(.08, 1.3), vec(.33, 1.65)], false, 'catmullrom', .35)
      for (const [curve, kind] of [[coldCurve, 'cold'], [warmCurve, 'warm']] as const) {
        const material = new THREE.MeshBasicMaterial({ color: kind === 'cold' ? cold : warm, transparent: true, opacity: lane === 2 ? .42 : .13, depthWrite: false })
        const tube = new THREE.Mesh(new THREE.TubeGeometry(curve, 56, .011, 4, false), material); loopGroup.add(tube)
        if (kind === 'warm') {
          tube.userData.dualReturn = true
          const singleTube = new THREE.Mesh(new THREE.TubeGeometry(singleWarmCurve, 56, .011, 4, false), material)
          singleTube.userData.singleReturn = true; loopGroup.add(singleTube)
        }
        guideMaterials.push({ material, kind, base: material.opacity })
        if (lane === 2) for (const progress of (kind === 'cold' ? [.2, .52, .85] : [.3, .68])) {
          const arrowMaterial = new THREE.MeshBasicMaterial({ color: kind === 'cold' ? cold : warm, transparent: true, opacity: .95 })
          const arrow = new THREE.Mesh(new THREE.ConeGeometry(.062, .18, 12), arrowMaterial)
          arrow.position.copy(curve.getPointAt(progress))
          arrow.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), curve.getTangentAt(progress).normalize())
          if (kind === 'warm') {
            arrow.userData.dualReturn = true
            const singleArrow = arrow.clone()
            singleArrow.userData = { singleReturn: true }
            singleArrow.position.copy(singleWarmCurve.getPointAt(progress))
            singleArrow.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), singleWarmCurve.getTangentAt(progress).normalize())
            loopGroup.add(singleArrow)
          }
          loopGroup.add(arrow); guideMaterials.push({ material: arrowMaterial, kind, base: .95 })
        }
      }
      const positions: THREE.Vector3[] = [], singlePositions: THREE.Vector3[] = [], colors: THREE.Color[] = []
      for (let sample = 0; sample < 360; sample++) {
        const p = sample / 360
        const isCold = p < .64
        positions.push(isCold ? coldCurve.getPointAt(p / .64) : warmCurve.getPointAt((p - .64) / .36))
        singlePositions.push(isCold ? coldCurve.getPointAt(p / .64) : singleWarmCurve.getPointAt((p - .64) / .36))
        // Temperature color blends where supply becomes return and at the exchanger.
        const cooling = p > .96 ? (p - .96) / .04 : 0
        const warming = isCold ? THREE.MathUtils.smoothstep(p, .52, .64) : 1
        colors.push(cold.clone().lerp(warm, warming * (1 - cooling)))
      }
      trails.push({ positions, singlePositions, colors, offset: lane * .113 + (side < 0 ? 0 : .045), side })
    }
    const length = trails.length * particleCountPerLoop * 4
    const positions = new Float32Array(length * 3), colors = new Float32Array(length * 3)
    const geometry = new THREE.BufferGeometry()
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3).setUsage(THREE.DynamicDrawUsage))
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3).setUsage(THREE.DynamicDrawUsage))
    const canvas = document.createElement('canvas'); canvas.width = canvas.height = 64
    const ctx = canvas.getContext('2d')!
    const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32)
    gradient.addColorStop(0, 'rgba(255,255,255,1)'); gradient.addColorStop(.22, 'rgba(255,255,255,.9)'); gradient.addColorStop(.5, 'rgba(255,255,255,.2)'); gradient.addColorStop(1, 'rgba(255,255,255,0)')
    ctx.fillStyle = gradient; ctx.fillRect(0, 0, 64, 64)
    const texture = new THREE.CanvasTexture(canvas)
    const material = new THREE.PointsMaterial({ size: .13, map: texture, vertexColors: true, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, opacity: .9 })
    const particles = new THREE.Points(geometry, material); particles.frustumCulled = false; scene.add(particles)
    const smokeCount = 96
    const smokePositions = new Float32Array(smokeCount * 3)
    const smokeSeeds = Array.from({ length: smokeCount }, (_, index) => ({
      x: ((index * 37) % 101) / 100 - .5,
      z: ((index * 61) % 97) / 96 - .5,
      phase: ((index * 17) % 89) / 89,
      size: .65 + ((index * 29) % 100) / 140,
    }))
    const smokeGeometry = new THREE.BufferGeometry()
    smokeGeometry.setAttribute('position', new THREE.BufferAttribute(smokePositions, 3).setUsage(THREE.DynamicDrawUsage))
    const smokeMaterial = new THREE.PointsMaterial({ color: 0xd9f7ff, size: .18, map: texture, transparent: true, opacity: .2, depthWrite: false, blending: THREE.AdditiveBlending })
    const smoke = new THREE.Points(smokeGeometry, smokeMaterial)
    smoke.frustumCulled = false
    scene.add(smoke)
    let phase = .125, elapsed = 0, frame = 0, previous = 0, visible = false, disposed = false, rendering = false
    let dirty = true, settle = 0, lastReset = state.current.reset
    function fit() {
      const { width, height } = element!.getBoundingClientRect()
      if (!width || !height) return
      camera.aspect = width / height; camera.updateProjectionMatrix(); renderer.setSize(width, height, false)
      camera.position.set(4.4, 3.65, 6.7)
      if (camera.aspect < 1.15) camera.position.sub(controls.target).multiplyScalar(1.15 / camera.aspect).add(controls.target)
      orbit.setHome(camera.position, controls.target)
      controls.update(); dirty = true; wake()
    }
    function updateParticles() {
      let index = 0
      const mode = state.current.filter
      for (const trail of trails) for (let dot = 0; dot < particleCountPerLoop; dot++) for (let tail = 0; tail < 4; tail++) {
        const p = (phase + trail.offset + dot / particleCountPerLoop - tail * .004 + 1) % 1
        const sample = Math.floor(p * 360) % 360
        const position = (state.current.fanMode === 'single' ? trail.singlePositions : trail.positions)[sample], color = trail.colors[sample]
        const kind = p < .64 ? 'cold' : 'warm'
        // Single-fan mode keeps the complete duct continuous on both sides.
        const alpha = (mode === 'all' || mode === kind ? 1 : .025) * (1 - tail / 4)
        positions[index] = position.x; colors[index++] = color.r * alpha
        positions[index] = position.y; colors[index++] = color.g * alpha
        positions[index] = position.z; colors[index++] = color.b * alpha
      }
      geometry.attributes.position.needsUpdate = true; geometry.attributes.color.needsUpdate = true
      guideMaterials.forEach(entry => { entry.material.opacity = entry.base * (mode === 'all' || mode === entry.kind ? 1 : .055) })
    }
    function updateSmoke() {
      for (let index = 0; index < smokeCount; index++) {
        const seed = smokeSeeds[index]
        const p = (elapsed * .075 + seed.phase) % 1
        const drift = Math.sin(elapsed * .9 + index * .7) * .12
        smokePositions[index * 3] = seed.x * (.72 - p * .2) + drift
        smokePositions[index * 3 + 1] = 1.93 + p * 1.28 + Math.sin(elapsed * .7 + index) * .025
        smokePositions[index * 3 + 2] = seed.z * (.68 - p * .18) + Math.cos(elapsed * .62 + index * .4) * .07
      }
      smokeGeometry.attributes.position.needsUpdate = true
    }
    function render(time: number) {
      frame = 0
      if (disposed || !visible || document.hidden) return
      rendering = true
      const dt = previous ? Math.min((time - previous) / 1000, .05) : 0; previous = time
      const current = state.current, animated = current.playing && !current.reducedMotion
      if (lastReset !== current.reset) { lastReset = current.reset; controls.target.set(0, 1.08, 0); fit(); orbit.hold() }
      if (animated) { phase = (phase + dt * .12 * current.speed) % 1; elapsed += dt * current.speed; dirty = true }
      sideGroups.forEach(group => group.traverse(part => {
        if (part.userData.singleReturn) part.visible = current.fanMode === 'single'
        if (part.userData.dualReturn) part.visible = current.fanMode === 'dual'
      }))
      dualFanParts.forEach(part => { part.visible = current.fanMode === 'dual' })
      if (singleRotor?.parent) singleRotor.parent.visible = current.fanMode === 'single'
      rotors.forEach(rotor => { rotor.rotation.y = elapsed * 9 })
      updateSmoke()
      const orbiting = orbit.step(dt, true, current.reducedMotion)
      controls.update(dt)
      if (dirty || settle < 3) { updateParticles(); renderer.render(scene, camera); dirty = false }
      settle++; rendering = false
      if (animated || orbiting || settle < 4) frame = requestAnimationFrame(render)
    }
    function wake() { dirty = true; settle = 0; if (!disposed && visible && !document.hidden && !frame && !rendering) { previous = 0; frame = requestAnimationFrame(render) } }
    const changed = () => wake()
    controls.addEventListener('change', changed)
    const resize = new ResizeObserver(fit); resize.observe(element)
    const intersection = new IntersectionObserver(entries => {
      visible = entries[0].isIntersecting
      if (visible) wake(); else { cancelAnimationFrame(frame); frame = 0; previous = 0 }
    }); intersection.observe(element)
    const visibility = () => { if (document.hidden) { cancelAnimationFrame(frame); frame = 0; previous = 0 } else wake() }
    const contextLost = (event: Event) => { event.preventDefault(); errorRef.current() }
    document.addEventListener('visibilitychange', visibility)
    renderer.domElement.addEventListener('webglcontextlost', contextLost)
    wakeRef.current = wake; fit(); setReady(true)
    return () => {
      disposed = true; cancelAnimationFrame(frame); wakeRef.current = undefined
      resize.disconnect(); intersection.disconnect(); orbit.dispose(); controls.dispose()
      document.removeEventListener('visibilitychange', visibility)
      renderer.domElement.removeEventListener('wheel', wheel, true); renderer.domElement.removeEventListener('pointerdown', pointer, true)
      renderer.domElement.removeEventListener('webglcontextlost', contextLost)
      const materials = new Set<THREE.Material>(), geometries = new Set<THREE.BufferGeometry>()
      scene.traverse(object => { if (object instanceof THREE.Mesh || object instanceof THREE.LineSegments || object instanceof THREE.Points) { geometries.add(object.geometry); (Array.isArray(object.material) ? object.material : [object.material]).forEach(m => materials.add(m)) } })
      materials.forEach(m => m.dispose()); geometries.forEach(g => g.dispose()); texture.dispose()
      renderer.dispose(); renderer.forceContextLoss(); renderer.domElement.remove()
    }
  }, [])
  useEffect(() => { wakeRef.current?.() }, [options])
  return <div className={`airflow-3d-host ${ready ? 'ready' : ''}`} ref={host} role="img" aria-label={t('airflow.volumeAlt')} />
}
