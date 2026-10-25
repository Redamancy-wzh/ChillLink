import * as THREE from 'three'
import type { OrbitControls } from 'three/addons/controls/OrbitControls.js'

/**
 * Showroom-style idle orbit layered on top of OrbitControls.
 *
 * - Slow azimuthal turntable that eases in (never starts or stops abruptly).
 * - Grabbing the model stops it on the spot; the drag then follows the pointer
 *   with frame-rate-independent inertia.
 * - After release + a short idle period it eases back in, continuing in the
 *   direction the user last spun it, and gently levels the camera back to the
 *   preset elevation.
 * - Mouse hover slows it down so the model feels "attentive" before a grab.
 */
export interface AutoOrbitConfig {
  /** Turntable speed in OrbitControls units: one turn takes 60 / speed seconds (4 = 15 s). */
  speed?: number
  /** Seconds of no interaction before the turntable resumes. */
  resumeDelay?: number
  /** Time constant (s) for easing into rotation. */
  easeIn?: number
  /** Inertia per 60 fps frame (OrbitControls dampingFactor at 60 Hz). */
  damping?: number
  /** Speed multiplier while a mouse hovers the canvas. */
  hoverFactor?: number
  /** Called on pointer release so the host can restart its frame loop. */
  onRelease?: () => void
}

export function createAutoOrbit(controls: OrbitControls, config: AutoOrbitConfig = {}) {
  const speed = config.speed ?? 4
  const resumeDelay = config.resumeDelay ?? 2.6
  const easeIn = config.easeIn ?? 1.1
  const damping60 = config.damping ?? .085
  const hoverFactor = config.hoverFactor ?? .35
  const element = controls.domElement as HTMLElement

  let gain = 0           // 0..1 current turntable intensity
  let direction = 1      // +1 / -1, follows the user's last spin
  let dragging = false
  let hovering = false
  let idle = resumeDelay // seconds since the last interaction (start ready to spin)
  let lastTheta = controls.getAzimuthalAngle()
  let spin = 0           // signed azimuth travel during the current drag/inertia
  let homePolar: number | undefined
  const offset = new THREE.Vector3()
  const spherical = new THREE.Spherical()

  const onStart = () => { dragging = true; gain = 0; idle = 0; spin = 0; lastTheta = controls.getAzimuthalAngle() }
  const onEnd = () => { dragging = false; idle = 0; config.onRelease?.() }
  const onEnter = (event: PointerEvent) => { if (event.pointerType === 'mouse') hovering = true }
  const onLeave = () => { hovering = false }
  controls.addEventListener('start', onStart)
  controls.addEventListener('end', onEnd)
  element.addEventListener('pointerenter', onEnter)
  element.addEventListener('pointerleave', onLeave)
  element.style.cursor = 'grab'
  const onDown = () => { element.style.cursor = 'grabbing' }
  const onUp = () => { element.style.cursor = 'grab' }
  element.addEventListener('pointerdown', onDown)
  window.addEventListener('pointerup', onUp)

  return {
    /**
     * Call once per frame *before* controls.update(dt).
     * Returns true while the orbit still needs frames (spinning, easing or waiting to resume).
     */
    step(dt: number, enabled: boolean, reducedMotion: boolean) {
      // Frame-rate independent inertia: same feel at 60, 120 or 144 Hz.
      controls.enableDamping = !reducedMotion
      controls.dampingFactor = 1 - Math.pow(1 - damping60, Math.max(dt, 1 / 240) * 60)

      // Track which way the user spun it (drag + inertia tail).
      const theta = controls.getAzimuthalAngle()
      let delta = theta - lastTheta
      if (delta > Math.PI) delta -= Math.PI * 2
      if (delta < -Math.PI) delta += Math.PI * 2
      lastTheta = theta
      if (idle < resumeDelay) spin += delta
      if (Math.abs(spin) > .06) direction = spin > 0 ? -1 : 1

      if (!dragging) idle += dt
      const allowed = enabled && !reducedMotion && !dragging && idle >= resumeDelay
      const goal = allowed ? (hovering ? hoverFactor : 1) : 0
      // Ease in slowly, ease out quickly (but never snap, except on grab).
      const tau = goal > gain ? easeIn : .28
      gain += (goal - gain) * (1 - Math.exp(-dt / tau))
      if (gain < .0005 && goal === 0) gain = 0

      controls.autoRotate = gain > 0
      controls.autoRotateSpeed = speed * gain * direction

      // While turning on its own, drift the elevation back toward the preset.
      if (gain > 0 && homePolar !== undefined) {
        offset.copy(controls.object.position).sub(controls.target)
        spherical.setFromVector3(offset)
        const diff = homePolar - spherical.phi
        if (Math.abs(diff) > .0005) {
          spherical.phi += diff * (1 - Math.exp(-dt * .6)) * gain
          offset.setFromSpherical(spherical)
          controls.object.position.copy(controls.target).add(offset)
        }
      }
      return enabled && !reducedMotion
    },
    /** Elevation the turntable levels back to (radians from +Y). */
    setHome(position: THREE.Vector3, target: THREE.Vector3) {
      homePolar = spherical.setFromVector3(offset.copy(position).sub(target)).phi
    },
    /** Pause briefly (e.g. after a UI control was used) and then ease back in. */
    hold() { idle = 0 },
    dispose() {
      controls.removeEventListener('start', onStart)
      controls.removeEventListener('end', onEnd)
      element.removeEventListener('pointerenter', onEnter)
      element.removeEventListener('pointerleave', onLeave)
      element.removeEventListener('pointerdown', onDown)
      window.removeEventListener('pointerup', onUp)
    },
  }
}
