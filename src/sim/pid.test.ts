import { describe, it, expect } from 'vitest'
import { createPID, resetPID, updatePID } from './pid'

describe('PID', () => {
  it('PWM rises when error is positive (too warm)', () => {
    const pid = createPID()
    const pwm = updatePID(pid, -5, -10, 2)
    expect(pwm).toBeGreaterThan(50)
  })

  it('PWM clamps to 20–100', () => {
    const pid = createPID()
    expect(updatePID(pid, -20, -10, 2)).toBeLessThanOrEqual(100)
    expect(updatePID(pid, 5, -10, 2)).toBeGreaterThanOrEqual(20)
  })

  it('integral limited to ±100', () => {
    const pid = createPID()
    for (let i = 0; i < 100; i++) updatePID(pid, 0, -10, 2)
    expect(Math.abs(pid.integral)).toBeLessThanOrEqual(100)
  })

  it('reset clears integral', () => {
    const pid = createPID()
    updatePID(pid, -5, -10, 2)
    resetPID(pid)
    expect(pid.integral).toBe(0)
    expect(pid.prevError).toBeNull()
  })
})
