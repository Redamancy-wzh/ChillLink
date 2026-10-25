const BIAS = 50
const KP = 12
const KI = 0.04
const KD = 0.30
const I_LIMIT = 100
const PWM_MIN = 20
const PWM_MAX = 100

export interface PIDState {
  integral: number
  prevError: number | null
}

export function createPID(): PIDState {
  return { integral: 0, prevError: null }
}

export function resetPID(state: PIDState) {
  state.integral = 0
  state.prevError = null
}

export function updatePID(state: PIDState, measured: number, target: number, dt: number): number {
  const error = measured - target
  state.integral += error * dt
  state.integral = Math.max(-I_LIMIT, Math.min(I_LIMIT, state.integral))
  const derivative = state.prevError !== null ? (error - state.prevError) / dt : 0
  state.prevError = error
  let pwm = BIAS + KP * error + KI * state.integral + KD * derivative
  pwm = Math.max(PWM_MIN, Math.min(PWM_MAX, pwm))
  return Math.round(pwm)
}
