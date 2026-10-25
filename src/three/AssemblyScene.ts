import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js'
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js'
import { DecalGeometry } from 'three/addons/geometries/DecalGeometry.js'
import { createAutoOrbit } from './autoOrbit'
import { CARGO_ITEMS, CARGO_LAYOUTS, FLOOR_Y, type CargoId, type CargoRequest } from './cargo'

export type ViewPreset = 'perspective' | 'top' | 'interior' | 'control' | 'cooling' | 'cargo'
export interface SceneOptions {
  opening: number
  rotating: boolean
  reducedMotion: boolean
  preset: ViewPreset
  reset: number
  cargo?: CargoRequest
}
export interface SceneCallbacks {
  ready: () => void
  error: () => void
  progress: (value: number) => void
  interact: () => void
  cargoLoading?: (loading: boolean) => void
}

/** Brand label printed on the front panel: "ChillLink." wordmark + product name. */
async function drawBrandLabel() {
  const canvas = document.createElement('canvas')
  canvas.width = 1024
  canvas.height = 400
  const ctx = canvas.getContext('2d')!
  const family = "'Archivo Variable', -apple-system, 'Helvetica Neue', Arial, sans-serif"
  try { await Promise.all([document.fonts.load(`760 200px 'Archivo Variable'`), document.fonts.load(`560 80px 'Archivo Variable'`)]) } catch { /* fall back to system font */ }
  ctx.textBaseline = 'alphabetic'
  // Wordmark, matching the site logo colours: Chill (abyss) Link (cryo) . (signal)
  ctx.font = `760 210px ${family}`
  const tight = (text: string) => ctx.measureText(text).width * .955
  const parts: [string, string][] = [['Chill', '#0C1E2B'], ['Link', '#1478C8'], ['.', '#E26B32']]
  const total = parts.reduce((sum, [text]) => sum + tight(text), 0)
  let x = (canvas.width - total) / 2
  const baseline = 225
  parts.forEach(([text, colour]) => {
    ctx.fillStyle = colour
    ctx.save(); ctx.translate(x, baseline); ctx.scale(.955, 1); ctx.fillText(text, 0, 0); ctx.restore()
    x += tight(text)
  })
  // Product name
  ctx.font = `560 78px ${family}`
  ctx.fillStyle = '#4A5D69'
  const sub = 'Effi-Chillcrate X1'
  const spacing = 6
  const subWidth = [...sub].reduce((sum, ch) => sum + ctx.measureText(ch).width + spacing, -spacing)
  let sx = (canvas.width - subWidth) / 2
  for (const ch of sub) { ctx.fillText(ch, sx, 340); sx += ctx.measureText(ch).width + spacing }
  return canvas
}

/** Dedicated viewer lifetime; nothing is attached to the global animation loop. */
export function createAssemblyScene(host: HTMLDivElement, options: () => SceneOptions, cb: SceneCallbacks, dark: boolean) {
  const scene = new THREE.Scene()
  const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'high-performance' })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, window.innerWidth < 700 ? 1.5 : 2))
  renderer.outputColorSpace = THREE.SRGBColorSpace
  renderer.toneMapping = THREE.ACESFilmicToneMapping
  renderer.toneMappingExposure = dark ? .94 : .91
  renderer.shadowMap.enabled = true
  renderer.shadowMap.type = THREE.PCFShadowMap
  renderer.setClearColor(0, 0)
  renderer.domElement.setAttribute('aria-hidden', 'true')
  host.appendChild(renderer.domElement)

  const camera = new THREE.PerspectiveCamera(34, 1, .01, 20)
  const target = new THREE.Vector3(0, .1, 0)
  const destination = new THREE.Vector3(.83, .58, 1.02)
  camera.position.copy(destination)
  const controls = new OrbitControls(camera, renderer.domElement)
  controls.target.copy(target)
  controls.enableDamping = true
  controls.dampingFactor = .075
  controls.enablePan = false
  controls.minDistance = .48
  controls.maxDistance = 2.2
  controls.minPolarAngle = .08
  controls.maxPolarAngle = Math.PI / 2 + .08
  controls.zoomSpeed = .65
  // Let ordinary wheel gestures scroll the page; zoom is opt-in and pinch always works.
  controls.enableZoom = false
  const wheel = (event: WheelEvent) => { controls.enableZoom = event.ctrlKey || event.metaKey }
  renderer.domElement.addEventListener('wheel', wheel, { capture: true, passive: true })
  const pointer = (event: PointerEvent) => { if (event.pointerType === 'touch') controls.enableZoom = true }
  renderer.domElement.addEventListener('pointerdown', pointer, { capture: true })
  const orbit = createAutoOrbit(controls, { speed: 4, resumeDelay: 2.6, onRelease: () => { dirty = true; calmFrames = 0; wake() } })

  const pmrem = new THREE.PMREMGenerator(renderer)
  const room = new RoomEnvironment()
  const environment = pmrem.fromScene(room, .04)
  scene.environment = environment.texture
  scene.environmentIntensity = .65
  room.dispose()
  pmrem.dispose()
  scene.add(new THREE.HemisphereLight(0xe9f6ff, 0x8397a1, .8))
  const key = new THREE.DirectionalLight(0xffffff, 2.4)
  key.position.set(1.5, 2.5, 1.7)
  key.castShadow = true
  key.shadow.mapSize.set(1024, 1024)
  key.shadow.camera.left = key.shadow.camera.bottom = -.9
  key.shadow.camera.right = key.shadow.camera.top = .9
  key.shadow.camera.near = .1
  key.shadow.camera.far = 6
  key.shadow.normalBias = .002
  key.shadow.bias = -.0002
  key.shadow.radius = 4
  scene.add(key)
  const rim = new THREE.DirectionalLight(0xb0e5ff, 1.3)
  rim.position.set(-1, 1.3, -.8)
  scene.add(rim)
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(5, 5), new THREE.ShadowMaterial({ opacity: dark ? .22 : .13 }))
  ground.rotation.x = -Math.PI / 2
  ground.position.y = -.181
  ground.receiveShadow = true
  scene.add(ground)

  let model: THREE.Group | undefined
  let lid: THREE.Object3D | undefined
  let latches: THREE.Object3D[] = []
  let fanRotors: THREE.Object3D[] = []
  let fanPivot: THREE.Group | undefined
  let disposed = false
  const decals: THREE.Mesh[] = []
  let decalTexture: THREE.Texture | undefined
  let visible = false
  let frame = 0
  let previousTime = 0
  let opening = options().opening
  let requestedOpening = options().opening
  let preset = options().preset
  let reset = options().reset
  let elapsed = 0
  let transitioning = false
  let dirty = true
  let calmFrames = 0
  let ticking = false
  let lastCargo: CargoRequest | undefined
  const draco = new DRACOLoader().setDecoderPath(`${import.meta.env.BASE_URL}draco/`).setWorkerLimit(2)
  const loader = new GLTFLoader().setDRACOLoader(draco)
  const disposeModel = (root: THREE.Object3D) => {
    const geometries = new Set<THREE.BufferGeometry>()
    const materials = new Set<THREE.Material>()
    root.traverse(object => {
      if (object instanceof THREE.Mesh) {
        geometries.add(object.geometry)
        ;(Array.isArray(object.material) ? object.material : [object.material]).forEach(material => materials.add(material))
      }
    })
    geometries.forEach(geometry => geometry.dispose())
    materials.forEach(material => material.dispose())
  }
  loader.load(`${import.meta.env.BASE_URL}model/cooler_33L_control_box_assembly.glb`, gltf => {
    if (disposed) { disposeModel(gltf.scene); return }
    model = gltf.scene
    model.position.y = -.18
    model.traverse(object => {
      if (object.name.startsWith('CTRL_Lid_Hinge')) lid = object
      if (object.name.startsWith('CTRL_Latch_Lever_')) latches.push(object)
      if (object.name.includes('fan_120mm_') && /Blade|Spindle|Rotor[ _]hub|Hub[ _]face[ _]disc/.test(object.name)) fanRotors.push(object)
      if (object instanceof THREE.Mesh) {
        object.castShadow = true
        object.receiveShadow = true
        const materials = Array.isArray(object.material) ? object.material : [object.material]
        materials.forEach(material => {
          if (!(material instanceof THREE.MeshStandardMaterial)) return
          const name = material.name.toLowerCase()
          material.envMapIntensity = .8
          if (name.includes('retrofit') || name.includes('yellow') || name.includes('amber')) {
            material.color.set('#e6a400')
            material.roughness = .32
            material.metalness = .12
          } else if (name.includes('charcoal') || name.includes('controlboxblack') || name.includes('hardware_shadow') || name.includes('dark lid') || name.includes('dark_lid') || name.includes('unpowered black')) {
            material.color.set('#111820')
            material.roughness = .4
            material.metalness = .22
          } else if (name.includes('stainless') || name.includes('polished') || name.includes('silver') || name.includes('steel')) {
            material.color.set('#aeb8b5')
            material.roughness = .26
            material.metalness = .72
          } else if (name.includes('gasket') || name.includes('grey neck')) {
            material.color.set('#aeb6b0')
            material.roughness = .62
            material.metalness = .02
          } else if (name.includes('white') || name.includes('ivory') || name.includes('liner') || name.includes('shell')) {
            material.color.set('#f1f2ee')
            material.roughness = .7
            material.metalness = .02
          }
          if (name.includes('active window')) {
            material.color.set('#28b9db')
            material.emissive.set('#0b8aa7')
            material.emissiveIntensity = .72
            material.roughness = .24
          } else if (name.includes('oled')) {
            material.color.set('#07141b')
            material.emissive.set('#000000')
            material.emissiveIntensity = 0
            material.roughness = .36
          }
        })
      }
    })
    if (fanRotors.length) {
      fanPivot = new THREE.Group()
      // The GLB fan axis is its local Y axis. Put the pivot at the actual rotor
      // centre and keep it under the lid hinge so opening the lid carries the fan.
      const bounds = new THREE.Box3()
      const hub = fanRotors.find(rotor => /Rotor[ _]hub/.test(rotor.name))
      model.updateMatrixWorld(true)
      if (hub) bounds.setFromObject(hub)
      else fanRotors.forEach(rotor => bounds.expandByObject(rotor))
      const centre = bounds.getCenter(new THREE.Vector3())
      const parent = fanRotors[0].parent || model
      parent.add(fanPivot)
      fanPivot.position.copy(parent.worldToLocal(centre.clone()))
      fanRotors.forEach(rotor => fanPivot!.attach(rotor))
    }
    if (!lid || latches.length !== 2) { disposeModel(model); cb.error(); return }
    scene.add(model)
    model.add(cargoGroup)
    addBrandDecal(model)
    lastCargo = options().cargo
    syncCargo(lastCargo)
    cb.ready()
    dirty = true
    wake()
  }, event => { if (event.total) cb.progress(Math.round(event.loaded / event.total * 100)) }, () => { if (!disposed) cb.error() })

  /** Project the brand label onto the body's front panel so it follows the moulded surface. */
  function addBrandDecal(root: THREE.Group) {
    root.updateMatrixWorld(true)
    const shells: THREE.Mesh[] = []
    root.traverse(object => {
      if (!(object instanceof THREE.Mesh) || object.name.startsWith('SM_cooling') || object.name.startsWith('SM_control')) return
      let parent = object.parent
      // Skip moving parts (lid, latches, handles); the static body itself lives under CTRL_Cooler.
      while (parent && parent !== root) { if (/^CTRL_(Lid|Latch|Side|Top)/.test(parent.name)) return; parent = parent.parent }
      const materials = Array.isArray(object.material) ? object.material : [object.material]
      if (materials.some(material => /shell/i.test(material.name))) shells.push(object)
    })
    if (!shells.length) return
    // Centre of the recessed front panel (model space y ≈ 0.155 m, between the latches and the base ribs).
    const centreY = root.position.y + .155
    const hit = new THREE.Raycaster(new THREE.Vector3(0, centreY, 1), new THREE.Vector3(0, 0, -1)).intersectObjects(shells, false)[0]
    if (!hit) return
    const size = new THREE.Vector3(.2, .078, .024)
    const position = hit.point.clone()
    const orientation = new THREE.Euler(0, 0, 0)
    const material = new THREE.MeshStandardMaterial({
      transparent: true, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -4, polygonOffsetUnits: -4,
      roughness: .55, metalness: 0, envMapIntensity: .6,
    })
    material.visible = false
    shells.forEach(mesh => {
      const geometry = new DecalGeometry(mesh, position, orientation, size)
      if (!geometry.attributes.position || geometry.attributes.position.count === 0) { geometry.dispose(); return }
      const decal = new THREE.Mesh(geometry, material)
      decal.receiveShadow = true
      decal.renderOrder = 2
      decals.push(decal)
      scene.add(decal)
    })
    drawBrandLabel().then(canvas => {
      if (disposed) return
      const texture = new THREE.CanvasTexture(canvas)
      texture.colorSpace = THREE.SRGBColorSpace
      texture.anisotropy = renderer.capabilities.getMaxAnisotropy()
      decalTexture?.dispose()
      decalTexture = texture
      material.map = texture
      material.visible = true
      material.needsUpdate = true
      dirty = true; calmFrames = 0; wake()
    })
  }

  /* ---------- Cold-chain contents ---------- */
  const cargoGroup = new THREE.Group()
  cargoGroup.name = 'CARGO'
  const cargoCache = new Map<string, Promise<THREE.Group>>()
  const cargoRoots: THREE.Group[] = []
  let cargoKey = ''
  let cargoToken = 0
  interface Drop { object: THREE.Object3D; restY: number; delay: number; t: number; hidden: boolean }
  let drops: Drop[] = []
  const loadCargo = (file: string) => {
    let pending = cargoCache.get(file)
    if (!pending) {
      pending = new Promise<THREE.Group>((resolve, reject) => loader.load(`${import.meta.env.BASE_URL}model/contents/${file}`, gltf => {
        gltf.scene.traverse(object => {
          if (!(object instanceof THREE.Mesh)) return
          object.castShadow = true
          object.receiveShadow = true
          ;(Array.isArray(object.material) ? object.material : [object.material]).forEach(material => { if (material instanceof THREE.MeshStandardMaterial) material.envMapIntensity = .9 })
        })
        cargoRoots.push(gltf.scene)
        resolve(gltf.scene)
      }, undefined, reject))
      cargoCache.set(file, pending)
    }
    return pending
  }
  /** Rebuild the load when the category changes; toggle visibility when only the hidden list changes. */
  function syncCargo(request: CargoRequest | undefined) {
    const category = request?.category ?? null
    const hidden = new Set(request?.hidden ?? [])
    const key = category ?? ''
    if (key === cargoKey) {
      drops.forEach(drop => {
        const isHidden = hidden.has(drop.object.userData.cargoId as CargoId)
        if (isHidden !== drop.hidden) { drop.hidden = isHidden; drop.t = 0; drop.delay = 0 }
      })
      dirty = true; calmFrames = 0; wake()
      return
    }
    cargoKey = key
    const token = ++cargoToken
    cargoGroup.clear()
    drops = []
    dirty = true; calmFrames = 0; wake()
    if (!category) { cb.cargoLoading?.(false); return }
    const layout = CARGO_LAYOUTS[category]
    const entries = Object.entries(layout) as [CargoId, NonNullable<(typeof layout)[CargoId]>][]
    cb.cargoLoading?.(true)
    Promise.all(entries.map(([id]) => loadCargo(CARGO_ITEMS[id].file))).then(sources => {
      if (disposed || token !== cargoToken) return
      let order = 0
      entries.forEach(([id, placements], index) => {
        placements.forEach(([x, z, rotationY = 0, lift = 0, rotationX = 0]) => {
          const instance = sources[index].clone()
          instance.userData.cargoId = id
          instance.position.set(x, FLOOR_Y + lift, z)
          instance.rotation.set(rotationX, rotationY, 0)
          const isHidden = hidden.has(id)
          instance.visible = !isHidden
          cargoGroup.add(instance)
          drops.push({ object: instance, restY: FLOOR_Y + lift, delay: isHidden ? 0 : order++ * .045, t: isHidden ? 1 : 0, hidden: isHidden })
        })
      })
      cb.cargoLoading?.(false)
      dirty = true; calmFrames = 0; wake()
    }).catch(() => { if (!disposed && token === cargoToken) cb.cargoLoading?.(false) })
  }
  /** Items drop into the liner with a soft bounce; hidden items lift out and fade away. */
  function stepCargo(dt: number, reduced: boolean) {
    let active = false
    drops.forEach(drop => {
      if (drop.delay > 0) { drop.delay -= dt; active = true; drop.object.visible = false; return }
      if (drop.t >= 1) { drop.object.visible = !drop.hidden; drop.object.position.y = drop.restY; return }
      drop.t = reduced ? 1 : Math.min(drop.t + dt / .55, 1)
      const t = drop.t
      if (drop.hidden) {
        const e = t * t
        drop.object.position.y = drop.restY + e * .22
        drop.object.scale.setScalar(1 - e * .35)
        drop.object.visible = t < 1
      } else {
        // Ease-out-back so items settle onto the floor.
        const c = 1.4, e = 1 + (c + 1) * Math.pow(t - 1, 3) + c * Math.pow(t - 1, 2)
        drop.object.visible = true
        drop.object.scale.setScalar(1)
        drop.object.position.y = drop.restY + (1 - e) * .24
      }
      active = true
    })
    return active
  }

  const chooseView = (view: ViewPreset) => {
    if (view === 'top') {
      destination.set(.04, 1.07, .31)
      target.set(0, .16, 0)
    } else if (view === 'interior') {
      destination.set(.75, .64, 1.1)
      target.set(0, .10, -.015)
    } else if (view === 'control') {
      // Look down at the twin OLED panel on the closed lid (scene ≈ x .115, y .21, z .11).
      destination.set(.3, .6, .5)
      target.set(.1, .19, .1)
    } else if (view === 'cooling') {
      // Cooling is a detail view of the opened lid, with the fan and heat
      // exchanger filling the frame instead of showing the whole enclosure.
      destination.set(.22, .48, .34)
      target.set(0, .22, .02)
    } else if (view === 'cargo') {
      // Look over the front rim into the liner so the whole load is visible.
      destination.set(.36, .72, .74)
      target.set(0, -.07, .01)
    } else {
      const opened = options().opening > .1
      destination.set(opened ? .9 : .71, opened ? .64 : .49, opened ? 1.1 : .88)
      target.set(0, opened ? .10 : .025, 0)
    }
    // Fit narrow stages while keeping the perspective unchanged.
    if (camera.aspect < 1) destination.sub(target).multiplyScalar(1 + (1 - camera.aspect) * .45).add(target)
    orbit.setHome(destination, target)
    transitioning = true
  }
  const onStart = () => { transitioning = false; cb.interact(); dirty = true; wake() }
  const onChange = () => { dirty = true; calmFrames = 0; wake() }
  controls.addEventListener('start', onStart)
  controls.addEventListener('change', onChange)

  function tick(time: number) {
    frame = 0
    if (disposed || !visible || document.hidden) return
    ticking = true
    const dt = Math.min((time - previousTime) / 1000 || .016, .05)
    previousTime = time
    const state = options()
    const fanAnimating = fanRotors.length > 0 && !state.reducedMotion
    if (fanAnimating) { elapsed += dt; dirty = true }
    const smoothing = state.reducedMotion ? 1 : 1 - Math.exp(-7 * dt)
    if (preset !== state.preset || reset !== state.reset || (requestedOpening > .1) !== (state.opening > .1)) {
      preset = state.preset; reset = state.reset; requestedOpening = state.opening; chooseView(preset)
    }
    if (model && state.cargo !== lastCargo) { lastCargo = state.cargo; syncCargo(state.cargo) }
    const cargoMoving = stepCargo(dt, state.reducedMotion)
    if (cargoMoving) dirty = true
    const difference = state.opening - opening
    if (Math.abs(difference) > .0001) { opening += difference * smoothing; dirty = true; orbit.hold() }
    else opening = state.opening
    if (lid) lid.rotation.x = -THREE.MathUtils.degToRad(105) * opening
    latches.forEach(latch => { latch.rotation.x = -THREE.MathUtils.degToRad(52) * Math.min(opening * 6, 1) })
    if (fanPivot) fanPivot.rotation.y = elapsed * 18
    if (transitioning) {
      camera.position.lerp(destination, smoothing)
      controls.target.lerp(target, smoothing)
      if (camera.position.distanceTo(destination) < .0005) transitioning = false
      dirty = true
    }
    const orbiting = orbit.step(dt, state.rotating && !transitioning, state.reducedMotion)
    controls.update(dt)
    if (dirty || controls.autoRotate || transitioning || calmFrames < 3) {
      renderer.render(scene, camera)
      dirty = false
    }
    calmFrames++
    ticking = false
    // Stop scheduling once all movement settles. User input/options wake it again.
    if (fanAnimating || orbiting || transitioning || cargoMoving || Math.abs(difference) > .0001 || calmFrames < 4) frame = requestAnimationFrame(tick)
  }
  function wake() {
    if (!disposed && visible && !document.hidden && !frame && !ticking) { previousTime = performance.now(); frame = requestAnimationFrame(tick) }
  }
  const resize = () => {
    const { width, height } = host.getBoundingClientRect()
    if (!width || !height) return
    camera.aspect = width / height
    camera.updateProjectionMatrix()
    renderer.setSize(width, height, false)
    chooseView(options().preset)
    dirty = true; calmFrames = 0; wake()
  }
  const resizeObserver = new ResizeObserver(resize)
  resizeObserver.observe(host)
  const intersection = new IntersectionObserver(entries => {
    visible = entries[0].isIntersecting
    if (visible) { dirty = true; wake() }
    else { cancelAnimationFrame(frame); frame = 0 }
  }, { rootMargin: '80px' })
  intersection.observe(host)
  const visibility = () => { if (document.hidden) { cancelAnimationFrame(frame); frame = 0 } else wake() }
  document.addEventListener('visibilitychange', visibility)
  const lostContext = (event: Event) => { event.preventDefault(); cb.error() }
  renderer.domElement.addEventListener('webglcontextlost', lostContext)
  resize()
  return {
    update: () => { dirty = true; calmFrames = 0; wake() },
    dispose: () => {
      disposed = true
      cancelAnimationFrame(frame)
      resizeObserver.disconnect(); intersection.disconnect()
      document.removeEventListener('visibilitychange', visibility)
      renderer.domElement.removeEventListener('webglcontextlost', lostContext)
      renderer.domElement.removeEventListener('wheel', wheel, true)
      renderer.domElement.removeEventListener('pointerdown', pointer, true)
      orbit.dispose(); controls.dispose(); draco.dispose()
      if (model) disposeModel(model)
      cargoRoots.forEach(disposeModel)
      decals.forEach(decal => { decal.geometry.dispose(); (decal.material as THREE.Material).dispose() })
      decalTexture?.dispose()
      ground.geometry.dispose(); ground.material.dispose()
      environment.dispose(); renderer.dispose(); renderer.forceContextLoss()
      renderer.domElement.remove()
    },
  }
}
