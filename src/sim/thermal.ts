const K_LEAK = 0.0105
const K_FAN = 0.015
const T_AMB = 25
const T_COLD = -60

export function thermalStep(T: number, pwm: number, dt: number): number {
  return T + dt * (K_LEAK * (T_AMB - T) - K_FAN * (pwm / 100) * (T - T_COLD))
}
